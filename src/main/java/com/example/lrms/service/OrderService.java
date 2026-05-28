package com.example.lrms.service;

import com.example.lrms.entity.Booking;
import com.example.lrms.entity.Order;
import com.example.lrms.entity.User;
import com.example.lrms.dto.OrderRequest;
import com.example.lrms.repository.BookingRepository;
import com.example.lrms.repository.OrderRepository;
import com.example.lrms.repository.MenuItemRepository;
import com.example.lrms.exception.ResourceNotFoundException;
import com.example.lrms.exception.InvalidOperationException;
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

    public List<Order> getAllOrders(Order.OrderStatus status) {
        if (status == null) {
            return orderRepository.findAll();
        }
        return orderRepository.findByStatus(status);
    }

    public List<Order> getPendingOrders() {
        return orderRepository.findByStatus(Order.OrderStatus.PENDING);
    }

    @Transactional
    public Order createOrder(OrderRequest request, User waiter) {
        if (request.getPaymentMode() == Order.PaymentMode.ROOM_TAB && request.getBookingId() == null) {
            throw new InvalidOperationException("Booking ID is required for Room Tab payment mode");
        }

        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            if (booking.getStatus() != Booking.BookingStatus.CHECKED_IN) {
                throw new InvalidOperationException("Booking must be checked-in for room tab");
            }
        }

        Order order = Order.builder()
                .booking(booking)
                .waiter(waiter)
                .tableNumber(request.getTableNumber())
                .paymentMode(request.getPaymentMode())
                .status(Order.OrderStatus.PENDING)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        List<com.example.lrms.entity.OrderItem> orderItems = new java.util.ArrayList<>();

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            com.example.lrms.entity.MenuItem menuItem = menuItemRepository.findById(itemReq.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Menu Item not found with ID: " + itemReq.getItemId()));

            if (!menuItem.getIsAvailable()) {
                throw new InvalidOperationException("Menu Item is not available: " + menuItem.getName());
            }

            if (menuItem.getInventoryCount() < itemReq.getQuantity()) {
                throw new InvalidOperationException("Insufficient stock for item: " + menuItem.getName());
            }

            // Deduct stock
            menuItem.setInventoryCount(menuItem.getInventoryCount() - itemReq.getQuantity());
            menuItemRepository.save(menuItem);

            BigDecimal lineTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            com.example.lrms.entity.OrderItem orderItem = com.example.lrms.entity.OrderItem.builder()
                    .order(order)
                    .item(menuItem)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(menuItem.getPrice())
                    .lineTotal(lineTotal)
                    .build();

            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setSubtotal(subtotal);
        // Simple 5% tax
        order.setTaxAmount(subtotal.multiply(BigDecimal.valueOf(0.05)));
        order.setTotalAmount(subtotal.add(order.getTaxAmount()));

        return orderRepository.save(order);
    }

    @Transactional
    public Order payOrderDirect(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getStatus() != Order.OrderStatus.SERVED) {
            throw new InvalidOperationException("Order must be in SERVED status to make direct payment");
        }
        order.setStatus(Order.OrderStatus.PAID);
        order.setPaymentMode(Order.PaymentMode.DIRECT);
        return orderRepository.save(order);
    }

    @Transactional
    public Order postToRoom(Long orderId, Long bookingId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (booking.getStatus() != Booking.BookingStatus.CHECKED_IN) {
            throw new InvalidOperationException("Booking must be checked-in for room tab");
        }
        if (order.getStatus() != Order.OrderStatus.SERVED) {
            throw new InvalidOperationException("Order must be in SERVED status to post to room tab");
        }
        
        order.setBooking(booking);
        order.setPaymentMode(Order.PaymentMode.ROOM_TAB);
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(Long id, Order.OrderStatus targetStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        Order.OrderStatus currentStatus = order.getStatus();

        if (currentStatus == targetStatus) {
            return order;
        }

        if (currentStatus == Order.OrderStatus.PAID) {
            throw new InvalidOperationException("Cannot change status of a PAID order");
        }
        
        if (currentStatus == Order.OrderStatus.CANCELLED) {
            throw new InvalidOperationException("Cannot change status of a CANCELLED order");
        }

        if (targetStatus == Order.OrderStatus.CANCELLED) {
            // Restore inventory
            for (com.example.lrms.entity.OrderItem item : order.getItems()) {
                com.example.lrms.entity.MenuItem menuItem = item.getItem();
                menuItem.setInventoryCount(menuItem.getInventoryCount() + item.getQuantity());
                menuItemRepository.save(menuItem);
            }
            order.setStatus(Order.OrderStatus.CANCELLED);
            return orderRepository.save(order);
        }

        // Validate allowed forward transitions
        boolean validTransition = false;
        if (currentStatus == Order.OrderStatus.PENDING && targetStatus == Order.OrderStatus.PREPARING) {
            validTransition = true;
        } else if (currentStatus == Order.OrderStatus.PREPARING && targetStatus == Order.OrderStatus.READY) {
            validTransition = true;
        } else if (currentStatus == Order.OrderStatus.READY && targetStatus == Order.OrderStatus.SERVED) {
            validTransition = true;
        } else if (currentStatus == Order.OrderStatus.SERVED && targetStatus == Order.OrderStatus.PAID) {
            validTransition = true;
        }

        if (!validTransition) {
            throw new InvalidOperationException("Invalid order status transition from " + currentStatus + " to " + targetStatus);
        }

        order.setStatus(targetStatus);
        return orderRepository.save(order);
    }
}
