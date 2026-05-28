package com.example.lrms.controller;

import com.example.lrms.entity.Booking;
import com.example.lrms.dto.BookingRequest;
import com.example.lrms.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Page<Booking>> getBookings(
            @RequestParam(required = false, defaultValue = "") String q,
            Pageable pageable) {
        return ResponseEntity.ok(bookingService.searchBookings(q, pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<java.util.List<Booking>> getMyBookings(org.springframework.security.core.Authentication authentication) {
        com.example.lrms.entity.User user = (com.example.lrms.entity.User) authentication.getPrincipal();
        return ResponseEntity.ok(bookingService.getBookingsByGuestId(user.getId()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'GUEST')")
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        return ResponseEntity.status(201).body(bookingService.createBooking(bookingRequest));
    }

    @PatchMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Booking> checkIn(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkIn(id));
    }

    @PatchMapping("/{id}/checkout")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Booking> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkOut(id));
    }
}
