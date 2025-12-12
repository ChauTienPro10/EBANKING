package com.ebanking.transactionService.controller;

import com.ebanking.transactionService.dto.TransactionLimitRequest;
import com.ebanking.transactionService.dto.TransactionLimitResponse;
import com.ebanking.transactionService.service.TransactionLimitService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/transaction-limits")
@Slf4j
public class TransactionLimitController {

    @Autowired
    private TransactionLimitService limitService;

    /**
     * Get user's current transaction limits
     * GET /api/transaction-limits/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserLimits(@PathVariable Long userId) {
        try {
            log.info("Getting limits for user: {}", userId);
            TransactionLimitResponse limits = limitService.getUserLimits(userId);
            return ResponseEntity.ok(limits);
        } catch (Exception e) {
            log.error("Error getting limits for user {}: {}", userId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Update user's transaction limits
     * PUT /api/transaction-limits/{userId}
     */
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUserLimits(
            @PathVariable Long userId,
            @RequestBody TransactionLimitRequest request) {
        try {
            log.info("Updating limits for user {}: daily={}, single={}", 
                    userId, request.getDailyLimit(), request.getSingleTransactionLimit());
            
            request.setUserId(userId);
            TransactionLimitResponse limits = limitService.updateUserLimits(request);
            
            return ResponseEntity.ok(limits);
        } catch (Exception e) {
            log.error("Error updating limits for user {}: {}", userId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
