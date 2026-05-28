package com.example.lrms.controller;

import com.example.lrms.dto.dashboard.AmountPoint;
import com.example.lrms.dto.dashboard.AiSummaryResponse;
import com.example.lrms.dto.dashboard.CountPoint;
import com.example.lrms.dto.dashboard.OpsSummaryResponse;
import com.example.lrms.dto.dashboard.TopMenuItemResponse;
import com.example.lrms.service.dashboard.OpsDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/ops-dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class OpsDashboardController {

    private final OpsDashboardService opsDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<OpsSummaryResponse> getSummary(
            @RequestParam(defaultValue = "5") Integer lowStockThreshold
    ) {
        return ResponseEntity.ok(opsDashboardService.getSummary(LocalDate.now(), lowStockThreshold));
    }

    @GetMapping("/bookings-trend")
    public ResponseEntity<List<CountPoint>> getBookingsTrend(
            @RequestParam(defaultValue = "14") Integer days
    ) {
        return ResponseEntity.ok(opsDashboardService.getBookingsTrend(days));
    }

    @GetMapping("/revenue-trend")
    public ResponseEntity<List<AmountPoint>> getRevenueTrend(
            @RequestParam(defaultValue = "14") Integer days
    ) {
        return ResponseEntity.ok(opsDashboardService.getRevenueTrend(days));
    }

    @GetMapping("/top-menu-items")
    public ResponseEntity<List<TopMenuItemResponse>> getTopMenuItems(
            @RequestParam(defaultValue = "30") Integer days,
            @RequestParam(defaultValue = "5") Integer limit
    ) {
        return ResponseEntity.ok(opsDashboardService.getTopMenuItems(days, limit));
    }

    @GetMapping("/ai-summary")
    public ResponseEntity<AiSummaryResponse> getAiSummary(
            @RequestParam(defaultValue = "14") Integer days,
            @RequestParam(defaultValue = "5") Integer lowStockThreshold
    ) {
        return ResponseEntity.ok(opsDashboardService.generateAiSummary(days, lowStockThreshold));
    }
}

