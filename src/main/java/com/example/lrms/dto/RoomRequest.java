package com.example.lrms.dto;

import com.example.lrms.entity.Room.RoomType;
import com.example.lrms.entity.Room.RoomStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RoomRequest {
    @NotBlank
    private String roomNumber;
    @NotNull
    private RoomType roomType;
    @NotNull
    private Short floor;
    @NotNull
    @Min(0)
    private BigDecimal baseRate;
    @NotNull
    @Min(1)
    private Short maxOccupancy;
    private RoomStatus status = RoomStatus.AVAILABLE;
}
