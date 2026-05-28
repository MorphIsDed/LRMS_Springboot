package com.example.lrms.controller;

import com.example.lrms.entity.ApiUsageLog;
import com.example.lrms.repository.ApiUsageLogRepository;
import com.example.lrms.repository.ApiKeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/partner-stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ApiDashboardController {

    private final ApiUsageLogRepository apiUsageLogRepository;
    private final ApiKeyRepository apiKeyRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@RequestParam(defaultValue = "30") Integer days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        
        long totalCalls = apiUsageLogRepository.countByRequestedAtAfter(since);
        long errorCount = apiUsageLogRepository.countByHttpStatusGreaterThanEqualAndRequestedAtAfter(400, since);
        long activePartners = apiKeyRepository.countActivePartners();
        
        double errorRate = totalCalls > 0 ? (double) errorCount * 100.0 / totalCalls : 0.0;
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCalls", totalCalls);
        summary.put("errorCount", errorCount);
        summary.put("errorRate", Math.round(errorRate * 100.0) / 100.0); // round to 2 decimals
        summary.put("activePartners", activePartners);
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/usage-by-partner")
    public ResponseEntity<List<ApiUsageLogRepository.PartnerUsageStats>> getUsageByPartner(@RequestParam(defaultValue = "30") Integer days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return ResponseEntity.ok(apiUsageLogRepository.getUsageByPartner(since));
    }

    @GetMapping("/recent-logs")
    public ResponseEntity<List<ApiUsageLog>> getRecentLogs() {
        return ResponseEntity.ok(apiUsageLogRepository.findTop50ByOrderByRequestedAtDesc());
    }
}
