package com.example.lrms.service;

import com.example.lrms.entity.Booking;
import com.example.lrms.entity.Invoice;
import com.example.lrms.entity.Room;
import com.example.lrms.entity.User;
import com.example.lrms.dto.BookingRequest;
import com.example.lrms.repository.BookingRepository;
import com.example.lrms.repository.InvoiceRepository;
import com.example.lrms.repository.RoomRepository;
import com.example.lrms.repository.UserRepository;
import com.example.lrms.exception.ResourceNotFoundException;
import com.example.lrms.exception.InvalidOperationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final InvoiceRepository invoiceRepository;
    private final PricingService pricingService;
    private final UserRepository userRepository;

    public Page<Booking> searchBookings(String query, Pageable pageable) {
        return bookingRepository.searchBookings(query, pageable);
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    public java.util.List<Booking> getBookingsByGuestId(Long guestId) {
        return bookingRepository.findByGuestId(guestId);
    }

    @Transactional
    public Booking createBooking(BookingRequest request) {
        User guest = userRepository.findById(request.getGuestId())
                .orElseThrow(() -> new ResourceNotFoundException("Guest user not found"));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        // Validate room availability
        var availableRooms = roomRepository.findAvailableRooms(
                request.getCheckIn(),
                request.getCheckOut(),
                room.getRoomType(),
                room.getMaxOccupancy(),
                null
        );

        if (availableRooms.stream().noneMatch(r -> r.getId().equals(room.getId()))) {
            throw new InvalidOperationException("Room not available for selected dates");
        }

        Booking booking = Booking.builder()
                .guest(guest)
                .room(room)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .status(Booking.BookingStatus.RESERVED)
                .build();
        
        // Use dynamic pricing
        booking.setTotalRoomCharges(pricingService.calculateRate(room, booking.getCheckIn(), booking.getCheckOut()));
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking checkIn(Long id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != Booking.BookingStatus.RESERVED) {
            throw new InvalidOperationException("Booking must be reserved to check-in");
        }
        booking.setStatus(Booking.BookingStatus.CHECKED_IN);
        
        Room room = booking.getRoom();
        room.setStatus(Room.RoomStatus.OCCUPIED);
        roomRepository.save(room);
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking checkOut(Long id) {
        Booking booking = bookingRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (booking.getStatus() != Booking.BookingStatus.CHECKED_IN) {
            throw new InvalidOperationException("Booking must be checked-in to checkout");
        }
        booking.setStatus(Booking.BookingStatus.CHECKED_OUT);
        
        Room room = booking.getRoom();
        room.setStatus(Room.RoomStatus.AVAILABLE);
        roomRepository.save(room);

        // Generate Consolidated Invoice
        BigDecimal totalDue = booking.getTotalRoomCharges();
        
        Invoice invoice = Invoice.builder()
                .booking(booking)
                .invoiceType(Invoice.InvoiceType.ROOM_FOLIO)
                .amountDue(totalDue)
                .amountPaid(BigDecimal.ZERO)
                .build();
        invoiceRepository.save(invoice);

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateBookingDates(Long id, LocalDate checkIn, LocalDate checkOut) {
        Booking booking = bookingRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
                
        if (booking.getStatus() != Booking.BookingStatus.RESERVED) {
            throw new InvalidOperationException("Only reserved bookings can be updated");
        }

        // Re-validate availability (excluding current booking)
        var availableRooms = roomRepository.findAvailableRooms(
                checkIn,
                checkOut,
                booking.getRoom().getRoomType(),
                booking.getRoom().getMaxOccupancy(),
                booking.getId()
        );

        if (availableRooms.stream().noneMatch(r -> r.getId().equals(booking.getRoom().getId()))) {
            throw new InvalidOperationException("Room not available for new dates");
        }

        booking.setCheckIn(checkIn);
        booking.setCheckOut(checkOut);
        
        // Recalculate price
        booking.setTotalRoomCharges(pricingService.calculateRate(booking.getRoom(), checkIn, checkOut));
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking cancelBooking(Long id) {
        Booking booking = bookingRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
                
        if (booking.getStatus() == Booking.BookingStatus.CHECKED_IN || 
            booking.getStatus() == Booking.BookingStatus.CHECKED_OUT) {
            throw new InvalidOperationException("Cannot cancel booking in current state");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        
        // Set room back to available if it was marked as something else
        Room room = booking.getRoom();
        if (room.getStatus() == Room.RoomStatus.OCCUPIED) {
            room.setStatus(Room.RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }
        
        return bookingRepository.save(booking);
    }
}
