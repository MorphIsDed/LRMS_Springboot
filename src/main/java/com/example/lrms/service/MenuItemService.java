package com.example.lrms.service;

import com.example.lrms.entity.MenuItem;
import com.example.lrms.repository.MenuItemRepository;
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
        }
        return menuItemRepository.findAll();
    }

    public MenuItem getMenuItemById(Integer id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu Item not found"));
    }

    public MenuItem createMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    public MenuItem updateMenuItem(Integer id, MenuItem menuItemDetails) {
        MenuItem menuItem = getMenuItemById(id);
        menuItem.setName(menuItemDetails.getName());
        menuItem.setCategory(menuItemDetails.getCategory());
        menuItem.setPrice(menuItemDetails.getPrice());
        menuItem.setDescription(menuItemDetails.getDescription());
        menuItem.setIsAvailable(menuItemDetails.getIsAvailable());
        return menuItemRepository.save(menuItem);
    }

    public void deleteMenuItem(Integer id) {
        menuItemRepository.deleteById(id);
    }
}
