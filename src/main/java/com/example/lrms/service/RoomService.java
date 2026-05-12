package com.example.lrms.service;

import com.example.lrms.entity.Room;
import com.example.lrms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(Integer id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public Room createRoom(Room room) {
        return roomRepository.save(room);
    }

    public Room updateRoom(Integer id, Room roomDetails) {
        Room room = getRoomById(id);
        room.setRoomNumber(roomDetails.getRoomNumber());
        room.setRoomType(roomDetails.getRoomType());
        room.setFloor(roomDetails.getFloor());
        room.setBaseRate(roomDetails.getBaseRate());
        room.setStatus(roomDetails.getStatus());
        room.setMaxOccupancy(roomDetails.getMaxOccupancy());
        return roomRepository.save(room);
    }

    public void deleteRoom(Integer id) {
        roomRepository.deleteById(id);
    }

    public List<Room> getAvailableRooms(LocalDate checkIn, LocalDate checkOut, Room.RoomType type, Short guests) {
        return roomRepository.findAvailableRooms(checkIn, checkOut, type, guests);
    }

    public Map<String, Long> getRoomsSummary() {
        return roomRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        room -> room.getStatus().name(),
                        Collectors.counting()
                ));
    }
}
