package com.example.lrms.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PartnerBookingRequest {
    @NotNull
    private Integer roomId;
    
    @NotNull
    @FutureOrPresent
    private LocalDate checkIn;
    
    @NotNull
    @Future
    private LocalDate checkOut;
    
    @NotBlank
    private String guestName;
    
    @NotBlank
    private String guestEmail;
}
