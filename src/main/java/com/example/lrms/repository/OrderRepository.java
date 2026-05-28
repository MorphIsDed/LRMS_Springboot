package com.example.lrms.repository;

import com.example.lrms.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findByBookingId(Long bookingId);

    long countByStatusIn(List<Order.OrderStatus> statuses);

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o
        WHERE o.status = :status AND o.createdAt >= :since
    """)
    BigDecimal sumPaidTotalsSince(@Param("since") LocalDateTime since, @Param("status") Order.OrderStatus status);

    @Query("""
        SELECT o FROM Order o
        WHERE o.createdAt >= :since
        ORDER BY o.createdAt ASC
    """)
    List<Order> findByCreatedAtAfter(@Param("since") LocalDateTime since);

    @Query("""
        SELECT o FROM Order o
        WHERE o.createdAt >= :since AND o.status = :status
        ORDER BY o.createdAt ASC
    """)
    List<Order> findByCreatedAtAfterAndStatus(@Param("since") LocalDateTime since, @Param("status") Order.OrderStatus status);

    @Query("""
        SELECT oi.item.name as name,
               SUM(oi.quantity) as quantity,
               COALESCE(SUM(oi.lineTotal), 0) as revenue
        FROM OrderItem oi
        JOIN oi.order o
        WHERE o.createdAt >= :since
          AND o.status <> :excludeStatus
        GROUP BY oi.item.name
        ORDER BY SUM(oi.quantity) DESC
    """)
    List<TopMenuItemRow> findTopItemsSince(@Param("since") LocalDateTime since, @Param("excludeStatus") Order.OrderStatus excludeStatus, Pageable pageable);

    interface TopMenuItemRow {
        String getName();
        Long getQuantity();
        BigDecimal getRevenue();
    }
}
