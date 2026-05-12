package com.example.lrms.controller;

import com.example.lrms.entity.Order;
import com.example.lrms.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
        if (status == Order.OrderStatus.PENDING) {
            return ResponseEntity.ok(orderService.getPendingOrders());
        }
        // Add more filtering logic if needed
        return ResponseEntity.badRequest().build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('WAITER', 'GUEST')")
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.ok(orderService.createOrder(order));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('WAITER')")
    public ResponseEntity<Order> payOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.payOrderDirect(id));
    }

    @PostMapping("/{id}/post-to-room")
    @PreAuthorize("hasRole('WAITER')")
    public ResponseEntity<Order> postToRoom(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        return ResponseEntity.ok(orderService.postToRoom(id, payload.get("bookingId")));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('WAITER', 'CHEF')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, Order.OrderStatus> payload) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, payload.get("status")));
    }
}
