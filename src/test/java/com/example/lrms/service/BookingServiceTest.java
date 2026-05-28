package com.example.lrms.service;

import com.example.lrms.dto.BookingRequest;
import com.example.lrms.entity.Booking;
import com.example.lrms.entity.Invoice;
import com.example.lrms.entity.Room;
import com.example.lrms.entity.User;
import com.example.lrms.repository.BookingRepository;
import com.example.lrms.repository.InvoiceRepository;
import com.example.lrms.repository.RoomRepository;
import com.example.lrms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private PricingService pricingService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createBooking_ShouldCreateBooking_WhenRoomIsAvailable() {
        Room room = new Room();
        room.setId(1);
        room.setRoomType(Room.RoomType.SINGLE);
        room.setMaxOccupancy((short) 1);
        room.setBaseRate(BigDecimal.valueOf(100));

        User guest = new User();
        guest.setId(1L);

        BookingRequest request = new BookingRequest();
        request.setRoomId(1);
        request.setGuestId(1L);
        request.setCheckIn(LocalDate.now());
        request.setCheckOut(LocalDate.now().plusDays(2));

        when(userRepository.findById(1L)).thenReturn(Optional.of(guest));
        when(roomRepository.findById(1)).thenReturn(Optional.of(room));
        when(roomRepository.findAvailableRooms(any(), any(), any(), any(), any())).thenReturn(List.of(room));
        when(pricingService.calculateRate(any(), any(), any())).thenReturn(BigDecimal.valueOf(200));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.createBooking(request);

        assertNotNull(result);
        assertEquals(Booking.BookingStatus.RESERVED, result.getStatus());
        assertEquals(BigDecimal.valueOf(200), result.getTotalRoomCharges());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void checkIn_ShouldUpdateStatusToCheckedIn() {
        Room room = new Room();
        room.setId(1);
        room.setStatus(Room.RoomStatus.AVAILABLE);

        Booking booking = new Booking();
        booking.setId(1L);
        booking.setStatus(Booking.BookingStatus.RESERVED);
        booking.setRoom(room);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.checkIn(1L);

        assertEquals(Booking.BookingStatus.CHECKED_IN, result.getStatus());
        assertEquals(Room.RoomStatus.OCCUPIED, room.getStatus());
    }

    @Test
    void checkOut_ShouldUpdateStatusAndGenerateInvoice() {
        Room room = new Room();
        room.setId(1);
        room.setStatus(Room.RoomStatus.OCCUPIED);

        Booking booking = new Booking();
        booking.setId(1L);
        booking.setStatus(Booking.BookingStatus.CHECKED_IN);
        booking.setRoom(room);
        booking.setTotalRoomCharges(BigDecimal.valueOf(300));

        when(bookingRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(booking));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.checkOut(1L);

        assertEquals(Booking.BookingStatus.CHECKED_OUT, result.getStatus());
        assertEquals(Room.RoomStatus.AVAILABLE, room.getStatus());
        verify(invoiceRepository, times(1)).save(any(Invoice.class));
    }
}
