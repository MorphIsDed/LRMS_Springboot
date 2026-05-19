package com.example.lrms.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PartnerOrderRequest {
    
    private String tableNumber; // Optional for partners like Zomato (delivery)
    
    @NotEmpty
    private List<PartnerOrderItemRequest> items;

    @Data
    public static class PartnerOrderItemRequest {
        @NotNull
        private Integer itemId;
        @NotNull
        private Short quantity;
    }
}
