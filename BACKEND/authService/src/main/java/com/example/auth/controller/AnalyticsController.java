package com.example.auth.controller;

import com.example.auth.utils.HttpUltils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/authService/analytics")
@Slf4j
public class AnalyticsController {

    @Autowired
    private HttpUltils httpUtils;

    // URL của transactionService - có thể config trong application.properties
    @Value("${service.trans.url:http://3.85.17.154:8003}")
    private String transactionServiceUrl;

    /**
     * Get analytics info for last 30 days
     * POST /analytics/info
     */
    @PostMapping("/info")
    public ResponseEntity<?> getAnalysInfo(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            log.info("Getting analytics info for user: {}", userId);

            String url = transactionServiceUrl + "/analytics/info";
            Object response = httpUtils.post(url, request, Object.class);

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
     * GET /analytics/current-month/{username}
     */
    @GetMapping("/current-month/{username}")
    public ResponseEntity<?> getAnalysCurrentMonth(@PathVariable String username) {
        try {
            log.info("Getting current month analytics for user: {}", username);

            String url = transactionServiceUrl + "/analytics/current-month/" + username;
            Object response = httpUtils.get(url, Object.class);

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
     * GET /analytics/previous-month/{username}
     */
    @GetMapping("/previous-month/{username}")
    public ResponseEntity<?> getAnalysPreviousMonth(@PathVariable String username) {
        try {
            log.info("Getting previous month analytics for user: {}", username);

            String url = transactionServiceUrl + "/analytics/previous-month/" + username;
            Object response = httpUtils.get(url, Object.class);

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
     * GET /analytics/current-week/{username}
     */
    @GetMapping("/current-week/{username}")
    public ResponseEntity<?> getAnalysCurrentWeek(@PathVariable String username) {
        try {
            log.info("Getting current week analytics for user: {}", username);

            String url = transactionServiceUrl + "/analytics/current-week/" + username;
            Object response = httpUtils.get(url, Object.class);

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
     * GET /analytics/previous-week/{username}
     */
    @GetMapping("/previous-week/{username}")
    public ResponseEntity<?> getAnalysPreviousWeek(@PathVariable String username) {
        try {
            log.info("Getting previous week analytics for user: {}", username);

            String url = transactionServiceUrl + "/analytics/previous-week/" + username;
            Object response = httpUtils.get(url, Object.class);

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
     * GET /analytics/custom/{username}
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

            String url = String.format("%s/analytics/custom/%s?fromDate=%d&toDate=%d",
                    transactionServiceUrl, username, fromDate, toDate);
            Object response = httpUtils.get(url, Object.class);

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
