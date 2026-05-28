package com.example.lrms.service.dashboard;

import com.example.lrms.dto.dashboard.AmountPoint;
import com.example.lrms.dto.dashboard.AiSummaryResponse;
import com.example.lrms.dto.dashboard.CountPoint;
import com.example.lrms.dto.dashboard.OpsSummaryResponse;
import com.example.lrms.dto.dashboard.TopMenuItemResponse;
import com.example.lrms.entity.Booking;
import com.example.lrms.entity.Order;
import com.example.lrms.entity.Room;
import com.example.lrms.repository.BookingRepository;
import com.example.lrms.repository.MenuItemRepository;
import com.example.lrms.repository.OrderRepository;
import com.example.lrms.repository.RoomRepository;
import com.example.lrms.service.llm.LlmClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OpsDashboardService {

    private static final DateTimeFormatter DAY_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final LlmClient llmClient;

    public OpsSummaryResponse getSummary(LocalDate today, int lowStockThreshold) {
        long totalRooms = roomRepository.count();
        long occupiedRooms = roomRepository.countByStatus(Room.RoomStatus.OCCUPIED);

        double occupancyRate = 0.0;
        if (totalRooms > 0) {
            occupancyRate = (double) occupiedRooms * 100.0 / (double) totalRooms;
            occupancyRate = Math.round(occupancyRate * 100.0) / 100.0;
        }

        long activeBookings = bookingRepository.countActiveBookings(List.of(
                Booking.BookingStatus.RESERVED,
                Booking.BookingStatus.CHECKED_IN
        ));
        long checkInsToday = bookingRepository.countByCheckInEqualsAndStatus(today, Booking.BookingStatus.CHECKED_IN);
        long checkOutsToday = bookingRepository.countByCheckOutEqualsAndStatus(today, Booking.BookingStatus.CHECKED_OUT);

        long openOrders = orderRepository.countByStatusIn(List.of(
                Order.OrderStatus.PENDING,
                Order.OrderStatus.PREPARING,
                Order.OrderStatus.READY
        ));

        LocalDateTime startOfDay = today.atStartOfDay();
        BigDecimal revenueToday = orderRepository.sumPaidTotalsSince(startOfDay, Order.OrderStatus.PAID);
        if (revenueToday == null) revenueToday = BigDecimal.ZERO;

        long lowStockItems = menuItemRepository.countByInventoryCountLessThanEqual(lowStockThreshold);

        return new OpsSummaryResponse(
                totalRooms,
                occupiedRooms,
                occupancyRate,
                activeBookings,
                checkInsToday,
                checkOutsToday,
                openOrders,
                revenueToday.setScale(2, RoundingMode.HALF_UP),
                lowStockItems
        );
    }

    public List<CountPoint> getBookingsTrend(int days) {
        LocalDateTime since = LocalDate.now().minusDays(days - 1L).atStartOfDay();
        List<Booking> bookings = bookingRepository.findByCreatedAtAfter(since);

        Map<LocalDate, Long> counts = initDateBuckets(days);
        for (Booking b : bookings) {
            if (b.getCreatedAt() == null) continue;
            LocalDate d = b.getCreatedAt().toLocalDate();
            counts.computeIfPresent(d, (k, v) -> v + 1);
        }

        List<CountPoint> points = new ArrayList<>();
        for (var e : counts.entrySet()) {
            points.add(new CountPoint(e.getKey().format(DAY_FMT), e.getValue()));
        }
        return points;
    }

    public List<AmountPoint> getRevenueTrend(int days) {
        LocalDateTime since = LocalDate.now().minusDays(days - 1L).atStartOfDay();
        List<Order> orders = orderRepository.findByCreatedAtAfterAndStatus(since, Order.OrderStatus.PAID);

        Map<LocalDate, BigDecimal> totals = initDateBucketsAmount(days);
        for (Order o : orders) {
            if (o.getCreatedAt() == null) continue;
            LocalDate d = o.getCreatedAt().toLocalDate();
            BigDecimal v = o.getTotalAmount() == null ? BigDecimal.ZERO : o.getTotalAmount();
            totals.computeIfPresent(d, (k, cur) -> cur.add(v));
        }

        List<AmountPoint> points = new ArrayList<>();
        for (var e : totals.entrySet()) {
            points.add(new AmountPoint(e.getKey().format(DAY_FMT), e.getValue().setScale(2, RoundingMode.HALF_UP)));
        }
        return points;
    }

    public List<TopMenuItemResponse> getTopMenuItems(int days, int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        var rows = orderRepository.findTopItemsSince(since, Order.OrderStatus.CANCELLED, PageRequest.of(0, limit));
        List<TopMenuItemResponse> out = new ArrayList<>();
        for (var r : rows) {
            out.add(new TopMenuItemResponse(
                    r.getName(),
                    r.getQuantity() == null ? 0L : r.getQuantity(),
                    (r.getRevenue() == null ? BigDecimal.ZERO : r.getRevenue()).setScale(2, RoundingMode.HALF_UP)
            ));
        }
        return out;
    }

    public AiSummaryResponse generateAiSummary(int days, int lowStockThreshold) {
        LocalDate today = LocalDate.now();
        OpsSummaryResponse summary = getSummary(today, lowStockThreshold);
        List<CountPoint> bookings = getBookingsTrend(days);
        List<AmountPoint> revenue = getRevenueTrend(days);
        List<TopMenuItemResponse> topItems = getTopMenuItems(Math.min(30, Math.max(7, days)), 5);

        String system = """
                You are an operations analyst for a lodging + restaurant property management system.
                Write concise, actionable insights in Markdown. Avoid mentioning that you are an AI.
                Use the provided metrics only; if data is missing, state the limitation.
                """;

        String user = buildUserPrompt(summary, bookings, revenue, topItems, days, lowStockThreshold);

        var llm = llmClient.generateMarkdown(system, user);
        String markdown = llm.markdown();
        boolean used = llm.usedLlm();
        if (markdown == null || markdown.isBlank()) {
            markdown = buildFallbackSummary(summary, bookings, revenue, topItems, days, lowStockThreshold);
            used = false;
        }

        return new AiSummaryResponse(LocalDateTime.now().toString(), used, markdown);
    }

    private static Map<LocalDate, Long> initDateBuckets(int days) {
        Map<LocalDate, Long> m = new LinkedHashMap<>();
        LocalDate start = LocalDate.now().minusDays(days - 1L);
        for (int i = 0; i < days; i++) {
            m.put(start.plusDays(i), 0L);
        }
        return m;
    }

    private static Map<LocalDate, BigDecimal> initDateBucketsAmount(int days) {
        Map<LocalDate, BigDecimal> m = new LinkedHashMap<>();
        LocalDate start = LocalDate.now().minusDays(days - 1L);
        for (int i = 0; i < days; i++) {
            m.put(start.plusDays(i), BigDecimal.ZERO);
        }
        return m;
    }

    private static String buildUserPrompt(
            OpsSummaryResponse summary,
            List<CountPoint> bookingsTrend,
            List<AmountPoint> revenueTrend,
            List<TopMenuItemResponse> topItems,
            int days,
            int lowStockThreshold
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append("Time window: last ").append(days).append(" days\n\n");
        sb.append("Summary (today):\n");
        sb.append("- totalRooms: ").append(summary.totalRooms()).append('\n');
        sb.append("- occupiedRooms: ").append(summary.occupiedRooms()).append('\n');
        sb.append("- occupancyRate: ").append(summary.occupancyRate()).append("%\n");
        sb.append("- activeBookings: ").append(summary.activeBookings()).append('\n');
        sb.append("- checkInsToday: ").append(summary.checkInsToday()).append('\n');
        sb.append("- checkOutsToday: ").append(summary.checkOutsToday()).append('\n');
        sb.append("- openOrders: ").append(summary.openOrders()).append('\n');
        sb.append("- revenueToday: ").append(summary.revenueToday()).append('\n');
        sb.append("- lowStockItems(<= ").append(lowStockThreshold).append("): ").append(summary.lowStockItems()).append("\n\n");

        sb.append("Bookings trend (date,value):\n");
        for (var p : bookingsTrend) sb.append("- ").append(p.date()).append(", ").append(p.value()).append('\n');
        sb.append("\nRevenue trend (date,value):\n");
        for (var p : revenueTrend) sb.append("- ").append(p.date()).append(", ").append(p.value()).append('\n');

        sb.append("\nTop menu items (name, qty, revenue):\n");
        for (var i : topItems) sb.append("- ").append(i.name()).append(", ").append(i.quantity()).append(", ").append(i.revenue()).append('\n');

        sb.append("\nOutput format:\n");
        sb.append("1. A short headline\n");
        sb.append("2. 3-6 bullet insights (numbers included)\n");
        sb.append("3. 2-4 bullet actions for staff (front desk + restaurant)\n");
        return sb.toString();
    }

    private static String buildFallbackSummary(
            OpsSummaryResponse summary,
            List<CountPoint> bookingsTrend,
            List<AmountPoint> revenueTrend,
            List<TopMenuItemResponse> topItems,
            int days,
            int lowStockThreshold
    ) {
        long bookingsTotal = bookingsTrend.stream().mapToLong(CountPoint::value).sum();
        BigDecimal revenueTotal = revenueTrend.stream()
                .map(AmountPoint::value)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String top = topItems.isEmpty() ? "No menu sales data yet." : ("Top item: " + topItems.getFirst().name());

        return """
                # Operations Snapshot

                - Rooms occupied: %d / %d (%.2f%%)
                - Active bookings: %d
                - Check-ins today: %d, check-outs today: %d
                - Open kitchen queue: %d orders
                - Revenue today (paid orders): %s
                - Low-stock items (<= %d): %d

                ## Trend (last %d days)
                - Total bookings created: %d
                - Total paid revenue: %s
                - %s

                ## Actions
                - Front desk: verify arrivals for today and pre-assign rooms for any late check-ins.
                - Restaurant: prioritize open orders and review low-stock items before peak hours.
                """.formatted(
                summary.occupiedRooms(), summary.totalRooms(), summary.occupancyRate(),
                summary.activeBookings(),
                summary.checkInsToday(), summary.checkOutsToday(),
                summary.openOrders(),
                summary.revenueToday(),
                lowStockThreshold, summary.lowStockItems(),
                days,
                bookingsTotal,
                revenueTotal.setScale(2, RoundingMode.HALF_UP),
                top
        );
    }
}
