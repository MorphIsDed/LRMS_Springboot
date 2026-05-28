package com.example.lrms.repository;

import com.example.lrms.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

    long countByStatus(Room.RoomStatus status);
    
    @Query("""
        SELECT r FROM Room r
        WHERE r.roomType = :type
        AND r.maxOccupancy >= :guests
        AND r.status = 'AVAILABLE'
        AND NOT EXISTS (
            SELECT b FROM Booking b
            WHERE b.room = r
            AND b.status IN ('RESERVED', 'CHECKED_IN')
            AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId)
            AND b.checkIn < :checkOut
            AND b.checkOut > :checkIn
        )
    """)
    List<Room> findAvailableRooms(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("type") Room.RoomType type,
            @Param("guests") Short guests,
            @Param("excludeBookingId") Long excludeBookingId);
}
