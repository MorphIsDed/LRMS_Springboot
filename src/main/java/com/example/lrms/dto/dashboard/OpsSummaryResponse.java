package com.example.lrms.dto.dashboard;

import java.math.BigDecimal;

public record OpsSummaryResponse(
        long totalRooms,
        long occupiedRooms,
        double occupancyRate,
        long activeBookings,
        long checkInsToday,
        long checkOutsToday,
        long openOrders,
        BigDecimal revenueToday,
        long lowStockItems
) {
}

