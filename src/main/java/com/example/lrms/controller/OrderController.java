package com.example.lrms.controller;

import com.example.lrms.entity.Order;
import com.example.lrms.entity.User;
import com.example.lrms.dto.OrderRequest;
import com.example.lrms.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAITER', 'CHEF')")
    public ResponseEntity<List<Order>> getOrders(@RequestParam(required = false) Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.getAllOrders(status));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('WAITER', 'GUEST')")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderRequest orderRequest, @AuthenticationPrincipal User waiter) {
        return ResponseEntity.status(201).body(orderService.createOrder(orderRequest, waiter));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('WAITER')")
    public ResponseEntity<Order> payOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.payOrderDirect(id));
    }

    @PostMapping("/{id}/post-to-room")
    @PreAuthorize("hasRole('WAITER')")
    public ResponseEntity<Order> postToRoom(@PathVariable Long id, @RequestParam Long bookingId) {
        return ResponseEntity.ok(orderService.postToRoom(id, bookingId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('WAITER', 'CHEF')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
