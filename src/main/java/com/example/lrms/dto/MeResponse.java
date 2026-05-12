package com.example.lrms.dto;

public record MeResponse(
        Long userId,
        String username,
        String email,
        String role
) {
}

