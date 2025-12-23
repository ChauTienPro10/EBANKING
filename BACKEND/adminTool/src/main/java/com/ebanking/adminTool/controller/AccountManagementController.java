package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.dto.AccountDto;
import com.ebanking.adminTool.service.AccountManagementService;
import com.ebanking.adminTool.utils.AuditAction;
import com.ebanking.adminTool.utils.AuditLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@Slf4j
public class AccountManagementController {

    private final AccountManagementService accountManagementService;
    private final AuditLogger auditLogger;

    @GetMapping
    public ResponseEntity<List<AccountDto>> getAllAccounts() {
        log.info("GET /accounts - Fetching all accounts");
        List<AccountDto> accounts = accountManagementService.getAllAccounts();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<AccountDto> getAccountById(@PathVariable Long accountId) {
        log.info("GET /accounts/{} - Fetching account by ID", accountId);
        Optional<AccountDto> account = accountManagementService.getAccountById(accountId);
        return account.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<AccountDto> getAccountByNumber(@PathVariable String accountNumber) {
        log.info("GET /accounts/number/{} - Fetching account by number", accountNumber);
        Optional<AccountDto> account = accountManagementService.getAccountByNumber(accountNumber);
        return account.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AccountDto>> getAccountsByUserId(@PathVariable Long userId) {
        log.info("GET /accounts/user/{} - Fetching accounts for user", userId);
        List<AccountDto> accounts = accountManagementService.getAccountsByUserId(userId);
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AccountDto>> getAccountsByStatus(@PathVariable String status) {
        log.info("GET /accounts/status/{} - Fetching accounts by status", status);
        List<AccountDto> accounts = accountManagementService.getAccountsByStatus(status);
        return ResponseEntity.ok(accounts);
    }

    @PutMapping("/{accountId}/status")
    public ResponseEntity<Map<String, Object>> updateAccountStatus(
            @PathVariable Long accountId,
            @RequestBody Map<String, String> request) {
        log.info("PUT /accounts/{}/status - Updating account status", accountId);
        
        String status = request.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Status is required"));
        }

        boolean updated = accountManagementService.updateAccountStatus(accountId, status);
        Map<String, Object> response = new HashMap<>();
        response.put("success", updated);
        response.put("message", updated ? "Account status updated successfully" : "Account not found");
        
        return updated ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{accountId}/balance")
    public ResponseEntity<Map<String, Object>> updateAccountBalance(
            @PathVariable Long accountId,
            @RequestBody Map<String, BigDecimal> request) {
        log.info("PUT /accounts/{}/balance - Updating account balance", accountId);
        
        BigDecimal balance = request.get("balance");
        if (balance == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Balance is required"));
        }

        boolean updated = accountManagementService.updateAccountBalance(accountId, balance);
        Map<String, Object> response = new HashMap<>();
        response.put("success", updated);
        response.put("message", updated ? "Account balance updated successfully" : "Account not found");
        
        return updated ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{accountId}/close")
    public ResponseEntity<Map<String, Object>> closeAccount(@PathVariable Long accountId) {
        log.info("PUT /accounts/{}/close - Closing account", accountId);
        
        boolean closed = accountManagementService.closeAccount(accountId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", closed);
        response.put("message", closed ? "Account closed successfully" : "Account not found");
        
        return closed ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getAccountStatistics() {
        log.info("GET /accounts/statistics - Fetching account statistics");
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalAccounts", accountManagementService.getTotalAccountsCount());
        statistics.put("activeAccounts", accountManagementService.getActiveAccountsCount());
        statistics.put("lockedAccounts", accountManagementService.getLockedAccountsCount());
        statistics.put("totalBalance", accountManagementService.getTotalBalance());
        
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/search")
    public ResponseEntity<List<AccountDto>> searchAccounts(
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String accountNumber,
            @RequestParam(required = false) String keyword) {
        log.info("GET /accounts/search - Searching accounts with userName: {}, accountNumber: {}, keyword: {}", 
                userName, accountNumber, keyword);
        
        // If keyword is provided, use comprehensive search
        if (keyword != null && !keyword.trim().isEmpty()) {
            List<AccountDto> accounts = accountManagementService.searchAccounts(keyword.trim());
            return ResponseEntity.ok(accounts);
        }
        
        // Otherwise, use specific searches
        List<AccountDto> accounts = new ArrayList<>();
        
        if (userName != null && !userName.trim().isEmpty()) {
            accounts.addAll(accountManagementService.searchAccountsByUserName(userName.trim()));
        }
        
        if (accountNumber != null && !accountNumber.trim().isEmpty()) {
            List<AccountDto> accountsByNumber = accountManagementService.searchAccountsByAccountNumber(accountNumber.trim());
            // Avoid duplicates if searching by both criteria
            for (AccountDto account : accountsByNumber) {
                if (accounts.stream().noneMatch(a -> a.getAccountId().equals(account.getAccountId()))) {
                    accounts.add(account);
                }
            }
        }
        
        if ((userName == null || userName.trim().isEmpty()) && 
            (accountNumber == null || accountNumber.trim().isEmpty())) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(accounts);
    }

    @PostMapping("/{accountId}/lock")
    public ResponseEntity<Map<String, Object>> lockAccount(
            @PathVariable Long accountId,
            @RequestBody Map<String, String> request) {
        log.info("POST /accounts/{}/lock - Locking account", accountId);
        
        String reason = request.get("reason");
        String lockedBy = request.get("lockedBy");
        String notes = request.get("notes");
        
        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Reason is required"));
        }
        
        if (lockedBy == null || lockedBy.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "LockedBy is required"));
        }

        // Check if account is already locked
        if (accountManagementService.isAccountLocked(accountId)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Account is already locked"));
        }

        boolean locked = accountManagementService.lockAccount(accountId, reason, lockedBy, notes);
        Map<String, Object> response = new HashMap<>();
        response.put("success", locked);
        response.put("message", locked ? "Account locked successfully" : "Failed to lock account");

        String targetId = String.valueOf(accountId);
        String details = "reason=" + reason + (notes != null ? ", notes=" + notes : "");
        if (locked) {
            auditLogger.logSuccess(
                    lockedBy,
                    AuditAction.LOCK_ACCOUNT,
                    "ACCOUNT",
                    targetId,
                    details,
                    null);
        } else {
            auditLogger.logFailure(
                    lockedBy,
                    AuditAction.LOCK_ACCOUNT,
                    "ACCOUNT",
                    targetId,
                    "Failed to lock account. " + details,
                    null);
        }
        
        return locked ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/{accountId}/unlock")
    public ResponseEntity<Map<String, Object>> unlockAccount(
            @PathVariable Long accountId,
            @RequestBody Map<String, String> request) {
        log.info("POST /accounts/{}/unlock - Unlocking account", accountId);
        
        String unlockedBy = request.get("unlockedBy");
        
        if (unlockedBy == null || unlockedBy.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "UnlockedBy is required"));
        }

        // Check if account is actually locked
        if (!accountManagementService.isAccountLocked(accountId)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Account is not locked"));
        }

        boolean unlocked = accountManagementService.unlockAccount(accountId, unlockedBy);
        Map<String, Object> response = new HashMap<>();
        response.put("success", unlocked);
        response.put("message", unlocked ? "Account unlocked successfully" : "Failed to unlock account");

        String targetId = String.valueOf(accountId);
        if (unlocked) {
            auditLogger.logSuccess(
                    unlockedBy,
                    AuditAction.UNLOCK_ACCOUNT,
                    "ACCOUNT",
                    targetId,
                    "Account unlocked",
                    null);
        } else {
            auditLogger.logFailure(
                    unlockedBy,
                    AuditAction.UNLOCK_ACCOUNT,
                    "ACCOUNT",
                    targetId,
                    "Failed to unlock account",
                    null);
        }
        
        return unlocked ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/{accountId}/lock-status")
    public ResponseEntity<Map<String, Object>> getAccountLockStatus(@PathVariable Long accountId) {
        log.info("GET /accounts/{}/lock-status - Checking account lock status", accountId);
        
        boolean isLocked = accountManagementService.isAccountLocked(accountId);
        Map<String, Object> response = new HashMap<>();
        response.put("accountId", accountId);
        response.put("isLocked", isLocked);
        
        return ResponseEntity.ok(response);
    }
}
