package com.example.lrms.dto;

import com.example.lrms.entity.Order.PaymentMode;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    private Long bookingId;
    private String tableNumber;
    @NotNull
    private PaymentMode paymentMode;
    @NotEmpty
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        @NotNull
        private Integer itemId;
        @NotNull
        private Short quantity;
    }
}
