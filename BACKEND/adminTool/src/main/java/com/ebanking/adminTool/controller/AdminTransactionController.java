package com.ebanking.admintool.controller;

import com.ebanking.admintool.dto.request.FlagTransactionRequest;
import com.ebanking.admintool.dto.request.ResolveTransactionRequest;
import com.ebanking.admintool.dto.response.TransactionListResponse;
import com.ebanking.admintool.entity.TransactionFlag;
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
@RequestMapping("/api/admin/transactions")
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
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String sender,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin {} fetching transactions - page: {}, limit: {}",
                    adminUsername, page, limit);

            TransactionListResponse response = adminTransactionService.getTransactionHistory(
                    adminUsername, page, limit, username, sender, fromDate, toDate);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching transaction history", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * List flags of a transaction (newest first)
     * GET /api/admin/transactions/{transactionId}/flags
     */
    @GetMapping("/{transactionId}/flags")
    public ResponseEntity<?> listFlags(
            @PathVariable Long transactionId,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin {} listing flags for transaction {}", adminUsername, transactionId);

            var flags = adminTransactionService.listFlagsByTransaction(adminUsername, transactionId);
            return ResponseEntity.ok(flags);
        } catch (Exception e) {
            log.error("Error listing flags", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Flag a transaction
     * POST /api/admin/transactions/{transactionId}/flags
     */
    @PostMapping("/{transactionId}/flags")
    public ResponseEntity<?> flagTransaction(
            @PathVariable Long transactionId,
            @RequestBody FlagTransactionRequest request,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin {} flagging transaction {} as {}", adminUsername, transactionId, request.getFlagType());

            if (request.getFlagType() == null) {
                return ResponseEntity.badRequest().body("flagType is required");
            }
            if (request.getFlagType() == TransactionFlag.FlagType.APPROVED ||
                    request.getFlagType() == TransactionFlag.FlagType.REJECTED) {
                return ResponseEntity.badRequest().body("flagType cannot be APPROVED/REJECTED when flagging");
            }

            TransactionFlag flag = adminTransactionService.flagTransaction(
                    adminUsername,
                    transactionId,
                    request.getFlagType(),
                    request.getReason());
            return ResponseEntity.ok(flag);
        } catch (Exception e) {
            log.error("Error flagging transaction", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Resolve a flagged transaction
     * POST /api/admin/transactions/flags/{flagId}/resolve
     */
    @PostMapping("/flags/{flagId}/resolve")
    public ResponseEntity<?> resolveTransaction(
            @PathVariable Long flagId,
            @RequestBody ResolveTransactionRequest request,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin {} resolving flag {} -> approved={}", adminUsername, flagId, request.isApproved());

            TransactionFlag resolved = adminTransactionService.resolveTransaction(
                    adminUsername,
                    flagId,
                    request.isApproved(),
                    request.getNotes());
            return ResponseEntity.ok(resolved);
        } catch (Exception e) {
            log.error("Error resolving transaction flag", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
