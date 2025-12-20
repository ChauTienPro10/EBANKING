package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.dto.TransactionHistoryResponse;
import com.ebanking.adminTool.service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Admin Transaction Management Controller
 */
@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@Slf4j
public class AdminTransactionController {

    private final AdminTransactionService adminTransactionService;

    /**
     * Get transaction history with filters
     * GET /api/admin/transactions
     */
    @GetMapping
    public ResponseEntity<?> getTransactionHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            Authentication authentication) {

        try {
            log.info("Admin {} requesting transaction history - page: {}, size: {}, search: {}, type: {}, status: {}, fromDate: {}, toDate: {}", 
                    authentication.getName(), page, size, search, type, status, fromDate, toDate);

            // Validate pagination parameters
            if (page < 0) {
                return ResponseEntity.badRequest().body("Page number cannot be negative");
            }
            if (size <= 0 || size > 100) {
                return ResponseEntity.badRequest().body("Page size must be between 1 and 100");
            }

            TransactionHistoryResponse response = adminTransactionService.getTransactionHistory(
                    page, size, search, type, status, fromDate, toDate);

            log.info("Successfully retrieved {} transactions for admin {}", 
                    response.getTransactions().size(), authentication.getName());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error retrieving transaction history for admin {}: {}", 
                    authentication.getName(), e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body("Failed to retrieve transaction history: " + e.getMessage());
        }
    }

}