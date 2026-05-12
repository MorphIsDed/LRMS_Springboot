package com.example.lrms.dto;

import com.example.lrms.entity.Order.PaymentMode;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PayOrderRequest {
    @NotNull
    private PaymentMode mode;
}
