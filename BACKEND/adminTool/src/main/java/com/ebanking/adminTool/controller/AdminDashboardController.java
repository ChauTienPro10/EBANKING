package com.ebanking.admintool.controller;

import com.ebanking.admintool.dto.response.DashboardStatsResponse;
import com.ebanking.admintool.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin Dashboard Controller
 * Provides dashboard statistics and overview
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    /**
     * Get dashboard statistics
     * GET /api/admin/dashboard/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(Authentication authentication) {
        String adminUsername = authentication.getName();
        log.info("Admin {} requesting dashboard statistics", adminUsername);

        DashboardStatsResponse stats = adminDashboardService.getDashboardStats(adminUsername);
        return ResponseEntity.ok(stats);
    }
}
