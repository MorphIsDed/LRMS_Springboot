package com.example.lrms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    
    public static <T> PartnerApiResponse<T> success(T data, String message) {
        return PartnerApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }
    
    public static <T> PartnerApiResponse<T> error(String message) {
        return PartnerApiResponse.<T>builder()
                .success(false)
                .data(null)
                .message(message)
                .build();
    }
}
