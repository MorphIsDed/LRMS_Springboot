package com.example.lrms.controller;

import com.example.lrms.dto.PartnerBookingRequest;
import com.example.lrms.dto.PartnerApiResponse;
import com.example.lrms.dto.BookingRequest;
import com.example.lrms.entity.ApiKey;
import com.example.lrms.entity.Booking;
import com.example.lrms.entity.Room;
import com.example.lrms.service.BookingService;
import com.example.lrms.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/partners/lodging")
@RequiredArgsConstructor
public class PartnerLodgingController {

    private final RoomService roomService;
    private final BookingService bookingService;

    @GetMapping("/rooms")
    public ResponseEntity<PartnerApiResponse<List<Room>>> getRooms(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) Room.RoomType type,
            @RequestParam(required = false) Short guests) {
        
        List<Room> rooms;
        if (checkIn != null && checkOut != null && type != null && guests != null) {
            rooms = roomService.getAvailableRooms(checkIn, checkOut, type, guests);
        } else {
            rooms = roomService.getAllRooms();
        }
        return ResponseEntity.ok(PartnerApiResponse.success(rooms, "Rooms fetched successfully"));
    }

    @PostMapping("/bookings")
    public ResponseEntity<PartnerApiResponse<Booking>> createBooking(
            @Valid @RequestBody PartnerBookingRequest request,
            Authentication authentication) {
        
        ApiKey apiKey = (ApiKey) authentication.getPrincipal();
        
        BookingRequest bookingRequest = new BookingRequest();
        bookingRequest.setGuestId(apiKey.getSystemUser().getId());
        bookingRequest.setRoomId(request.getRoomId());
        bookingRequest.setCheckIn(request.getCheckIn());
        bookingRequest.setCheckOut(request.getCheckOut());
        
        Booking savedBooking = bookingService.createBooking(bookingRequest);
        return ResponseEntity.ok(PartnerApiResponse.success(savedBooking, "Booking created successfully"));
    }

    @PatchMapping("/bookings/{id}")
    public ResponseEntity<PartnerApiResponse<Booking>> updateBooking(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        
        Booking updatedBooking = bookingService.updateBookingDates(id, checkIn, checkOut);
        return ResponseEntity.ok(PartnerApiResponse.success(updatedBooking, "Booking dates updated successfully"));
    }

    @PatchMapping("/bookings/{id}/cancel")
    public ResponseEntity<PartnerApiResponse<Booking>> cancelBooking(@PathVariable Long id) {
        Booking cancelledBooking = bookingService.cancelBooking(id);
        return ResponseEntity.ok(PartnerApiResponse.success(cancelledBooking, "Booking cancelled successfully"));
    }
}
