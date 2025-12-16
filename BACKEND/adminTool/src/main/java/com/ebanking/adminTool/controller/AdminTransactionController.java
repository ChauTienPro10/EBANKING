package com.ebanking.admintool.controller;

import com.ebanking.admintool.service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Admin Transaction Management Controller
 */
@RestController
@RequestMapping("/admin/transactions")
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
        String adminUsername = authentication.getName();
        log.info("Admin {} fetching transactions with filters", adminUsername);

        // Note: The service layer will handle the conversion of string dates to objects
        var response = adminTransactionService.getTransactionHistory(
                page, size, search, type, status, fromDate, toDate);

        return ResponseEntity.ok(response);
    }

}