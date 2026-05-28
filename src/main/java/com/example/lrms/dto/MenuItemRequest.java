package com.example.lrms.dto;

import com.example.lrms.entity.MenuItem.MenuItemCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MenuItemRequest {
    @NotBlank
    private String name;
    @NotNull
    private MenuItemCategory category;
    @NotNull
    @Min(0)
    private BigDecimal price;
    private String description;
    private Boolean isAvailable = true;
    private Integer inventoryCount = 0;
}
