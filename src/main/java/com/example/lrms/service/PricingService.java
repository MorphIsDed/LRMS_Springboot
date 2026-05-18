package com.example.lrms.service;

import com.example.lrms.entity.Room;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;

@Service
public class PricingService {

    public BigDecimal calculateRate(Room room, LocalDate checkIn, LocalDate checkOut) {
        BigDecimal totalCharge = BigDecimal.ZERO;
        LocalDate currentDate = checkIn;

        while (currentDate.isBefore(checkOut)) {
            BigDecimal dailyRate = room.getBaseRate();
            
            // Apply 20% surge pricing for Friday and Saturday
            DayOfWeek day = currentDate.getDayOfWeek();
            if (day == DayOfWeek.FRIDAY || day == DayOfWeek.SATURDAY) {
                dailyRate = dailyRate.multiply(BigDecimal.valueOf(1.20));
            }
            
            totalCharge = totalCharge.add(dailyRate);
            currentDate = currentDate.plusDays(1);
        }

        return totalCharge;
    }
}
