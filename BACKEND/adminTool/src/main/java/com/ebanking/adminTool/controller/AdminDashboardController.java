package com.ebanking.admintool.controller;

import com.ebanking.admintool.dto.response.DashboardStatsResponse;
import com.ebanking.admintool.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Admin Dashboard Controller
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
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin {} fetching dashboard stats", adminUsername);
            
            DashboardStatsResponse response = adminDashboardService.getDashboardStats(adminUsername);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching dashboard stats", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}

