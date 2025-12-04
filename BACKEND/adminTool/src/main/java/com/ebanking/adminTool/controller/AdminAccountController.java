package com.ebanking.admintool.controller;

import com.ebanking.admintool.dto.request.FreezeAccountRequest;
import com.ebanking.admintool.dto.request.LockAccountRequest;
import com.ebanking.admintool.dto.request.UpdateAccountLimitRequest;
import com.ebanking.admintool.entity.AccountStatus;
import com.ebanking.admintool.service.AdminAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Admin Account Management Controller
 */
@RestController
@RequestMapping("/api/admin/accounts")
@RequiredArgsConstructor
@Slf4j
public class AdminAccountController {

    private final AdminAccountService adminAccountService;

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private ResponseEntity<?> validateIdOrNumber(Long accountId, String accountNumber) {
        if (accountId == null && isBlank(accountNumber)) {
            return ResponseEntity.badRequest().body("accountId or accountNumber is required");
        }
        return null;
    }

    /**
     * Lock account temporarily
     * POST /api/admin/accounts/lock
     */
    @PostMapping("/lock")
    public ResponseEntity<?> lockAccount(
            @RequestBody LockAccountRequest request,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            var bad = validateIdOrNumber(request.getAccountId(), request.getAccountNumber());
            if (bad != null)
                return bad;
            log.info("Admin {} locking account id={}, number={}", adminUsername, request.getAccountId(),
                    request.getAccountNumber());

            AccountStatus result = adminAccountService.lockAccount(
                    adminUsername,
                    request.getAccountId(),
                    request.getAccountNumber(),
                    request.getReason(),
                    request.getExpiresAt());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error locking account", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Unlock account
     * POST /api/admin/accounts/unlock?accountId=123
     */
    @PostMapping("/unlock")
    public ResponseEntity<?> unlockAccount(
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) String accountNumber,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            var bad = validateIdOrNumber(accountId, accountNumber);
            if (bad != null)
                return bad;
            log.info("Admin {} unlocking account id={}, number={}", adminUsername, accountId, accountNumber);

            AccountStatus result = adminAccountService.unlockAccount(adminUsername, accountId, accountNumber);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error unlocking account", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Update transaction limits
     * POST /api/admin/accounts/limits
     */
    @PostMapping("/limits")
    public ResponseEntity<?> updateLimits(
            @RequestBody UpdateAccountLimitRequest request,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            var bad = validateIdOrNumber(request.getAccountId(), request.getAccountNumber());
            if (bad != null)
                return bad;
            log.info("Admin {} updating limits for account id={}, number={}", adminUsername, request.getAccountId(),
                    request.getAccountNumber());

            AccountStatus result = adminAccountService.updateTransactionLimit(
                    adminUsername,
                    request.getAccountId(),
                    request.getAccountNumber(),
                    request.getDailyLimit(),
                    request.getPerTransactionLimit());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error updating account limits", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Freeze account (block all transactions)
     * POST /api/admin/accounts/freeze
     */
    @PostMapping("/freeze")
    public ResponseEntity<?> freezeAccount(
            @RequestBody FreezeAccountRequest request,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            var bad = validateIdOrNumber(request.getAccountId(), request.getAccountNumber());
            if (bad != null)
                return bad;
            log.info("Admin {} freezing account id={}, number={}", adminUsername, request.getAccountId(),
                    request.getAccountNumber());

            AccountStatus result = adminAccountService.freezeAccount(
                    adminUsername,
                    request.getAccountId(),
                    request.getAccountNumber(),
                    request.getReason());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error freezing account", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
