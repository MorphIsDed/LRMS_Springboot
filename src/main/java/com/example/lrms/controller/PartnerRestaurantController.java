package com.example.lrms.controller;

import com.example.lrms.dto.PartnerOrderRequest;
import com.example.lrms.dto.PartnerApiResponse;
import com.example.lrms.entity.ApiKey;
import com.example.lrms.entity.MenuItem;
import com.example.lrms.entity.Order;
import com.example.lrms.entity.OrderItem;
import com.example.lrms.service.MenuItemService;
import com.example.lrms.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/partners/restaurant")
@RequiredArgsConstructor
public class PartnerRestaurantController {

    private final MenuItemService menuItemService;
    private final OrderService orderService;

    @GetMapping("/menu")
    public ResponseEntity<PartnerApiResponse<List<MenuItem>>> getMenu(
            @RequestParam(required = false) MenuItem.MenuItemCategory category) {
        
        List<MenuItem> items = menuItemService.getAllMenuItems(true, category);
        return ResponseEntity.ok(PartnerApiResponse.success(items, "Menu items fetched successfully"));
    }

    @PostMapping("/orders")
    public ResponseEntity<PartnerApiResponse<Order>> createOrder(
            @RequestBody PartnerOrderRequest request,
            Authentication authentication) {
        
        ApiKey apiKey = (ApiKey) authentication.getPrincipal();
        
        Order order = Order.builder()
                .waiter(apiKey.getSystemUser()) // System user acts as the placing waiter/agent
                .tableNumber(request.getTableNumber() != null ? request.getTableNumber() : "DELIVERY")
                .paymentMode(Order.PaymentMode.DIRECT)
                .items(new ArrayList<>())
                .build();
        
        for (PartnerOrderRequest.PartnerOrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemService.getMenuItemById(itemReq.getItemId());
            
            OrderItem orderItem = OrderItem.builder()
                    .item(menuItem)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(menuItem.getPrice())
                    .build();
            
            order.addItem(orderItem);
        }
        
        Order savedOrder = orderService.createOrder(order);
        return ResponseEntity.ok(PartnerApiResponse.success(savedOrder, "Order placed successfully"));
    }

    @PatchMapping("/orders/{id}")
    public ResponseEntity<PartnerApiResponse<Order>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Order.OrderStatus> payload) {
        
        Order.OrderStatus status = payload.get("status");
        Order updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(PartnerApiResponse.success(updatedOrder, "Order status updated successfully"));
    }

    @PatchMapping("/orders/{id}/cancel")
    public ResponseEntity<PartnerApiResponse<Order>> cancelOrder(@PathVariable Long id) {
        Order cancelledOrder = orderService.updateOrderStatus(id, Order.OrderStatus.CANCELLED);
        return ResponseEntity.ok(PartnerApiResponse.success(cancelledOrder, "Order cancelled successfully"));
    }
}
