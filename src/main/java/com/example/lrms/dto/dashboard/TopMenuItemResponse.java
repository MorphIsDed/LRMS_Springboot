package com.example.lrms.dto.dashboard;

import java.math.BigDecimal;

public record TopMenuItemResponse(
        String name,
        long quantity,
        BigDecimal revenue
) {
}

