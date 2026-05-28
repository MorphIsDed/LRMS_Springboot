package com.example.lrms.service;

import com.example.lrms.entity.Booking;
import com.example.lrms.entity.Room;
import com.example.lrms.dto.RoomRequest;
import com.example.lrms.repository.RoomRepository;
import com.example.lrms.repository.BookingRepository;
import com.example.lrms.exception.ResourceNotFoundException;
import com.example.lrms.exception.InvalidOperationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Integer id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
    }

    public Room createRoom(RoomRequest request) {
        Room room = Room.builder()
                .roomNumber(request.getRoomNumber())
                .roomType(request.getRoomType())
                .floor(request.getFloor())
                .baseRate(request.getBaseRate())
                .status(request.getStatus() != null ? request.getStatus() : Room.RoomStatus.AVAILABLE)
                .maxOccupancy(request.getMaxOccupancy())
                .build();
        return roomRepository.save(room);
    }

    public Room updateRoom(Integer id, RoomRequest request) {
        Room room = getRoomById(id);
        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setFloor(request.getFloor());
        room.setBaseRate(request.getBaseRate());
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }
        room.setMaxOccupancy(request.getMaxOccupancy());
        return roomRepository.save(room);
    }

    public void deleteRoom(Integer id) {
        if (!roomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Room not found with ID: " + id);
        }
        boolean hasActiveBookings = bookingRepository.existsByRoomIdAndStatusIn(
                id,
                List.of(Booking.BookingStatus.RESERVED, Booking.BookingStatus.CHECKED_IN)
        );
        if (hasActiveBookings) {
            throw new InvalidOperationException("Cannot delete room with active or reserved bookings");
        }
        roomRepository.deleteById(id);
    }

    public List<Room> getAvailableRooms(LocalDate checkIn, LocalDate checkOut, Room.RoomType type, Short guests) {
        return roomRepository.findAvailableRooms(checkIn, checkOut, type, guests, null);
    }

    public Map<String, Long> getRoomsSummary() {
        return Map.of(
                Room.RoomStatus.AVAILABLE.name(), roomRepository.countByStatus(Room.RoomStatus.AVAILABLE),
                Room.RoomStatus.OCCUPIED.name(), roomRepository.countByStatus(Room.RoomStatus.OCCUPIED),
                Room.RoomStatus.MAINTENANCE.name(), roomRepository.countByStatus(Room.RoomStatus.MAINTENANCE)
        );
    }
}
