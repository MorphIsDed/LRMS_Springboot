package com.example.lrms.repository;

import com.example.lrms.entity.Booking;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
        SELECT b FROM Booking b
        WHERE lower(b.guest.username) LIKE lower(concat('%', :query, '%'))
        OR lower(b.room.roomNumber) LIKE lower(concat('%', :query, '%'))
    """)
    Page<Booking> searchBookings(@Param("query") String query, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.id = :id")
    Optional<Booking> findByIdForUpdate(@Param("id") Long id);

    @Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.status IN :statuses
    """)
    long countActiveBookings(@Param("statuses") List<Booking.BookingStatus> statuses);

    long countByCheckInEqualsAndStatus(LocalDate checkIn, Booking.BookingStatus status);

    long countByCheckOutEqualsAndStatus(LocalDate checkOut, Booking.BookingStatus status);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.createdAt >= :since
        ORDER BY b.createdAt ASC
    """)
    List<Booking> findByCreatedAtAfter(@Param("since") LocalDateTime since);

    List<Booking> findByGuestId(Long guestId);

    boolean existsByRoomIdAndStatusIn(Integer roomId, List<Booking.BookingStatus> statuses);
}
