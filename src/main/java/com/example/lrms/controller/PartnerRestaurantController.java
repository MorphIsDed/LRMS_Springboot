package com.example.lrms.controller;

import com.example.lrms.dto.PartnerOrderRequest;
import com.example.lrms.dto.PartnerApiResponse;
import com.example.lrms.dto.OrderRequest;
import com.example.lrms.entity.ApiKey;
import com.example.lrms.entity.MenuItem;
import com.example.lrms.entity.Order;
import com.example.lrms.service.MenuItemService;
import com.example.lrms.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
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
            @Valid @RequestBody PartnerOrderRequest request,
            Authentication authentication) {
        
        ApiKey apiKey = (ApiKey) authentication.getPrincipal();
        
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.setTableNumber(request.getTableNumber() != null ? request.getTableNumber() : "DELIVERY");
        orderRequest.setPaymentMode(Order.PaymentMode.DIRECT);
        
        List<OrderRequest.OrderItemRequest> items = request.getItems().stream().map(itemReq -> {
            OrderRequest.OrderItemRequest reqItem = new OrderRequest.OrderItemRequest();
            reqItem.setItemId(itemReq.getItemId());
            reqItem.setQuantity(itemReq.getQuantity());
            return reqItem;
        }).collect(Collectors.toList());
        
        orderRequest.setItems(items);
        
        Order savedOrder = orderService.createOrder(orderRequest, apiKey.getSystemUser());
        return ResponseEntity.ok(PartnerApiResponse.success(savedOrder, "Order placed successfully"));
    }

    @PatchMapping("/orders/{id}")
    public ResponseEntity<PartnerApiResponse<Order>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status) {
        
        Order updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(PartnerApiResponse.success(updatedOrder, "Order status updated successfully"));
    }

    @PatchMapping("/orders/{id}/cancel")
    public ResponseEntity<PartnerApiResponse<Order>> cancelOrder(@PathVariable Long id) {
        Order cancelledOrder = orderService.updateOrderStatus(id, Order.OrderStatus.CANCELLED);
        return ResponseEntity.ok(PartnerApiResponse.success(cancelledOrder, "Order cancelled successfully"));
    }
}
