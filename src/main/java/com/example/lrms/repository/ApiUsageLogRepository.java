package com.example.lrms.repository;

import com.example.lrms.entity.ApiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ApiUsageLogRepository extends JpaRepository<ApiUsageLog, Long> {

    long countByRequestedAtAfter(LocalDateTime since);

    long countByHttpStatusGreaterThanEqualAndRequestedAtAfter(int httpStatus, LocalDateTime since);
    


    @Query("SELECT a.partnerName as partnerName, COUNT(l) as requestCount, " +
           "SUM(CASE WHEN l.httpStatus >= 400 THEN 1 ELSE 0 END) as errorCount " +
           "FROM ApiUsageLog l JOIN l.apiKey a " +
           "WHERE l.requestedAt > :since " +
           "GROUP BY a.partnerName")
    List<PartnerUsageStats> getUsageByPartner(@Param("since") LocalDateTime since);

    List<ApiUsageLog> findTop50ByOrderByRequestedAtDesc();

    interface PartnerUsageStats {
        String getPartnerName();
        long getRequestCount();
        long getErrorCount();
    }
}
