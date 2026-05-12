package com.example.lrms.repository;

import com.example.lrms.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Integer> {
    List<MenuItem> findByIsAvailableAndCategory(Boolean isAvailable, MenuItem.MenuItemCategory category);
    List<MenuItem> findByIsAvailable(Boolean isAvailable);
}
