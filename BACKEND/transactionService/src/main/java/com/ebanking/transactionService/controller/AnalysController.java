package com.ebanking.transactionService.controller;

import com.ebanking.transactionService.dto.GetAnalysInfoRequest;
import com.ebanking.transactionService.dto.GetAnalysInfoResponse;
import com.ebanking.transactionService.service.AnalysService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@Slf4j
public class AnalysController {

    @Autowired
    private AnalysService analysService;

    /**
     * Get analytics info for last 30 days
     * POST /api/analytics/info
     */
    @PostMapping("/info")
    public ResponseEntity<?> getAnalysInfo(@RequestBody GetAnalysInfoRequest request) {
        try {
            log.info("Getting analytics info for user: {}", request.getUserId());
            GetAnalysInfoResponse response = analysService.getInfoAnalys(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting analytics info: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get analytics info for current month
     * GET /api/analytics/current-month/{username}
     */
    @GetMapping("/current-month/{username}")
    public ResponseEntity<?> getAnalysCurrentMonth(@PathVariable String username) {
        try {
            log.info("Getting current month analytics for user: {}", username);
            GetAnalysInfoResponse response = analysService.getInfoAnalysCurrentMonth(username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting current month analytics: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get analytics info for previous month
     * GET /api/analytics/previous-month/{username}
     */
    @GetMapping("/previous-month/{username}")
    public ResponseEntity<?> getAnalysPreviousMonth(@PathVariable String username) {
        try {
            log.info("Getting previous month analytics for user: {}", username);
            GetAnalysInfoResponse response = analysService.getInfoAnalysPreviousMonth(username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting previous month analytics: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get analytics info for current week
     * GET /api/analytics/current-week/{username}
     */
    @GetMapping("/current-week/{username}")
    public ResponseEntity<?> getAnalysCurrentWeek(@PathVariable String username) {
        try {
            log.info("Getting current week analytics for user: {}", username);
            GetAnalysInfoResponse response = analysService.getInfoAnalysCurrentWeek(username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting current week analytics: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get analytics info for previous week
     * GET /api/analytics/previous-week/{username}
     */
    @GetMapping("/previous-week/{username}")
    public ResponseEntity<?> getAnalysPreviousWeek(@PathVariable String username) {
        try {
            log.info("Getting previous week analytics for user: {}", username);
            GetAnalysInfoResponse response = analysService.getInfoAnalysPreviousWeek(username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting previous week analytics: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get analytics info for custom time period
     * GET /api/analytics/custom/{username}
     * Query params: fromDate, toDate (Unix timestamp in seconds)
     */
    @GetMapping("/custom/{username}")
    public ResponseEntity<?> getAnalysCustomPeriod(
            @PathVariable String username,
            @RequestParam long fromDate,
            @RequestParam long toDate) {
        try {
            log.info("Getting custom period analytics for user: {} from {} to {}", username, fromDate, toDate);

            // Validate dates
            if (fromDate >= toDate) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid date range");
                error.put("message", "fromDate must be less than toDate");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            GetAnalysInfoResponse response = analysService.getInfoAnalysCustomPeriod(username, fromDate, toDate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting custom period analytics: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
