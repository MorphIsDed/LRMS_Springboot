package com.example.lrms.service;

import com.example.lrms.entity.MenuItem;
import com.example.lrms.dto.MenuItemRequest;
import com.example.lrms.repository.MenuItemRepository;
import com.example.lrms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    public List<MenuItem> getAllMenuItems(Boolean available, MenuItem.MenuItemCategory category) {
        if (available != null && category != null) {
            return menuItemRepository.findByIsAvailableAndCategory(available, category);
        } else if (available != null) {
            return menuItemRepository.findByIsAvailable(available);
        } else if (category != null) {
            return menuItemRepository.findByCategory(category);
        }
        return menuItemRepository.findAll();
    }

    public MenuItem getMenuItemById(Integer id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu Item not found with ID: " + id));
    }

    public MenuItem createMenuItem(MenuItemRequest request) {
        MenuItem menuItem = MenuItem.builder()
                .name(request.getName())
                .category(request.getCategory())
                .price(request.getPrice())
                .description(request.getDescription())
                .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                .inventoryCount(request.getInventoryCount() != null ? request.getInventoryCount() : 0)
                .build();
        return menuItemRepository.save(menuItem);
    }

    public MenuItem updateMenuItem(Integer id, MenuItemRequest request) {
        MenuItem menuItem = getMenuItemById(id);
        menuItem.setName(request.getName());
        menuItem.setCategory(request.getCategory());
        menuItem.setPrice(request.getPrice());
        menuItem.setDescription(request.getDescription());
        if (request.getIsAvailable() != null) {
            menuItem.setIsAvailable(request.getIsAvailable());
        }
        if (request.getInventoryCount() != null) {
            menuItem.setInventoryCount(request.getInventoryCount());
        }
        return menuItemRepository.save(menuItem);
    }

    public void deleteMenuItem(Integer id) {
        if (!menuItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Menu Item not found with ID: " + id);
        }
        menuItemRepository.deleteById(id);
    }
}
