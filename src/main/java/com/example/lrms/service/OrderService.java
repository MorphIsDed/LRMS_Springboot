package com.example.lrms.service;

import com.example.lrms.entity.Booking;
import com.example.lrms.entity.Order;
import com.example.lrms.repository.BookingRepository;
import com.example.lrms.repository.OrderRepository;
import com.example.lrms.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;
    private final MenuItemRepository menuItemRepository;

    public List<Order> getPendingOrders() {
        return orderRepository.findByStatus(Order.OrderStatus.PENDING);
    }

    @Transactional
    public Order createOrder(Order order) {
        order.setStatus(Order.OrderStatus.PENDING);
        
        BigDecimal subtotal = order.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        order.setSubtotal(subtotal);
        // Simple 5% tax for example
        order.setTaxAmount(subtotal.multiply(BigDecimal.valueOf(0.05)));
        order.setTotalAmount(order.getSubtotal().add(order.getTaxAmount()));

        order.getItems().forEach(item -> {
            item.setOrder(order);
            item.setLineTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));

            // Deduct stock
            com.example.lrms.entity.MenuItem menuItem = menuItemRepository.findById(item.getItem().getId())
                    .orElseThrow(() -> new RuntimeException("Menu Item not found"));

            if (menuItem.getInventoryCount() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for item: " + menuItem.getName());
            }
            menuItem.setInventoryCount(menuItem.getInventoryCount() - item.getQuantity());
            menuItemRepository.save(menuItem);
        });
        
        return orderRepository.save(order);
    }

    @Transactional
    public Order payOrderDirect(Long id) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setStatus(Order.OrderStatus.PAID);
        order.setPaymentMode(Order.PaymentMode.DIRECT);
        return orderRepository.save(order);
    }

    @Transactional
    public Order postToRoom(Long orderId, Long bookingId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        Booking booking = bookingRepository.findByIdForUpdate(bookingId).orElseThrow();
        if (booking.getStatus() != Booking.BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Booking must be checked-in for room tab");
        }
        
        order.setBooking(booking);
        order.setPaymentMode(Order.PaymentMode.ROOM_TAB);
        order.setStatus(Order.OrderStatus.PAID); // Or keep it served until checkout
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
