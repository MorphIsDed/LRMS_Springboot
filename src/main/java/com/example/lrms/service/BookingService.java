package com.example.lrms.service;

import com.example.lrms.entity.Booking;
import com.example.lrms.entity.Invoice;
import com.example.lrms.entity.Room;
import com.example.lrms.repository.BookingRepository;
import com.example.lrms.repository.InvoiceRepository;
import com.example.lrms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final InvoiceRepository invoiceRepository;

    public Page<Booking> searchBookings(String query, Pageable pageable) {
        return bookingRepository.searchBookings(query, pageable);
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        // Validate room availability
        var availableRooms = roomRepository.findAvailableRooms(
                booking.getCheckIn(),
                booking.getCheckOut(),
                booking.getRoom().getRoomType(),
                booking.getRoom().getMaxOccupancy()
        );

        if (availableRooms.stream().noneMatch(r -> r.getId().equals(booking.getRoom().getId()))) {
            throw new RuntimeException("Room not available for selected dates");
        }

        booking.setStatus(Booking.BookingStatus.RESERVED);
        
        long days = ChronoUnit.DAYS.between(booking.getCheckIn(), booking.getCheckOut());
        Room room = roomRepository.findById(booking.getRoom().getId()).orElseThrow();
        booking.setTotalRoomCharges(room.getBaseRate().multiply(BigDecimal.valueOf(days)));
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking checkIn(Long id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != Booking.BookingStatus.RESERVED) {
            throw new RuntimeException("Booking must be reserved to check-in");
        }
        booking.setStatus(Booking.BookingStatus.CHECKED_IN);
        
        Room room = booking.getRoom();
        room.setStatus(Room.RoomStatus.OCCUPIED);
        roomRepository.save(room);
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking checkOut(Long id) {
        Booking booking = bookingRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getStatus() != Booking.BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Booking must be checked-in to checkout");
        }
        booking.setStatus(Booking.BookingStatus.CHECKED_OUT);
        
        Room room = booking.getRoom();
        room.setStatus(Room.RoomStatus.AVAILABLE);
        roomRepository.save(room);

        // Generate Consolidated Invoice
        BigDecimal totalDue = booking.getTotalRoomCharges();
        // Here we would also add up the room tabs from orders
        // For simplicity, we just create the room folio invoice
        
        Invoice invoice = Invoice.builder()
                .booking(booking)
                .invoiceType(Invoice.InvoiceType.ROOM_FOLIO)
                .amountDue(totalDue)
                .amountPaid(BigDecimal.ZERO)
                .build();
        invoiceRepository.save(invoice);

        return bookingRepository.save(booking);
    }
}
