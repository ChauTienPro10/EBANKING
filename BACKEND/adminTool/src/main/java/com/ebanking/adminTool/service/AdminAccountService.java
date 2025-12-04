package com.ebanking.admintool.service;

import com.ebanking.admintool.entity.AccountStatus;
import com.ebanking.admintool.repository.AccountStatusRepository;
import com.ebanking.admintool.service.grpc.TransactionGrpcClient;
import com.ebanking.admintool.utils.AuditLogger;
import com.ebanking.transactionService.grpc.AccountProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Admin Account Management Service
 * - Lock/Unlock Account
 * - Freeze Account
 * - Update Transaction Limits
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AdminAccountService {

        private final AccountStatusRepository accountStatusRepository;
        private final AuditLogger auditLogger;
        private final AdminAuthService adminAuthService;
        private final TransactionGrpcClient transactionGrpcClient;

        private AccountStatus createFromGrpcByAccountNumber(String accountNumber) {
                // Dựa vào accountNumber, gọi checkAccountExist -> userId, rồi
                // getAccountInfo(userId) để lấy accountId
                AccountProto.CheckAccountExistResponse exist = transactionGrpcClient.checkAccountExist(accountNumber);
                if (exist == null || !exist.getExist()) {
                        throw new RuntimeException(
                                        "Account does not exist in transaction service for number: " + accountNumber);
                }
                AccountProto.AccountResponse acc = transactionGrpcClient.getAccountInfo((long) exist.getUserId());
                if (acc == null) {
                        throw new RuntimeException("Cannot fetch account info from transaction service for number: "
                                        + accountNumber);
                }
                AccountStatus def = AccountStatus.builder()
                                .accountId(acc.getAccountId())
                                .accountNumber(acc.getAccountNumber())
                                .userId((long) exist.getUserId())
                                .status(AccountStatus.Status.ACTIVE)
                                .build();
                return accountStatusRepository.save(def);
        }

        private AccountStatus resolveOrCreateStatus(Long accountId, String accountNumberIfKnown) {
                // 1) Nếu có accountId -> findByAccountId
                if (accountId != null) {
                        return accountStatusRepository.findByAccountId(accountId)
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Account status not found for accountId: " + accountId +
                                                                        ". Provide accountNumber to auto-create from transaction service."));
                }
                // 2) Nếu không có accountId nhưng có accountNumber -> findByAccountNumber hoặc
                // tạo từ gRPC
                if (accountNumberIfKnown != null && !accountNumberIfKnown.isBlank()) {
                        return accountStatusRepository.findByAccountNumber(accountNumberIfKnown)
                                        .orElseGet(() -> createFromGrpcByAccountNumber(accountNumberIfKnown));
                }
                throw new RuntimeException("Insufficient info: provide either accountId or accountNumber");
        }

        /**
         * Lock account temporarily
         */
        public AccountStatus lockAccount(
                        String adminUsername,
                        Long accountId,
                        String accountNumber,
                        String reason,
                        LocalDateTime expiresAt) {
                try {
                        log.info("Admin {} locking account ID: {} until: {}", adminUsername, accountId, expiresAt);

                        if (!adminAuthService.isAdmin(adminUsername)) {
                                throw new RuntimeException("Access denied: not an admin");
                        }

                        AccountStatus status = resolveOrCreateStatus(accountId, accountNumber);

                        if (status.getStatus() == AccountStatus.Status.CLOSED) {
                                throw new RuntimeException("Account is CLOSED and cannot be locked");
                        }

                        status.setStatus(AccountStatus.Status.LOCKED);
                        status.setStatusReason(reason);
                        status.setLockedBy(adminUsername);
                        status.setLockedAt(LocalDateTime.now());
                        status.setLockExpiresAt(expiresAt);

                        AccountStatus saved = accountStatusRepository.save(status);

                        auditLogger.logSuccess(
                                        adminUsername,
                                        "LOCK_ACCOUNT",
                                        "ACCOUNT",
                                        String.valueOf(accountId),
                                        "Locked accountId=" + accountId + " reason=" + reason + " expiresAt="
                                                        + expiresAt);

                        return saved;
                } catch (Exception e) {
                        log.error("Failed to lock account {}", accountId, e);
                        auditLogger.logFailure(
                                        adminUsername,
                                        "LOCK_ACCOUNT",
                                        "ACCOUNT",
                                        String.valueOf(accountId),
                                        "Failed: " + e.getMessage());
                        throw e;
                }
        }

        /**
         * Unlock account (only from LOCKED state)
         */
        public AccountStatus unlockAccount(
                        String adminUsername,
                        Long accountId,
                        String accountNumber) {
                try {
                        log.info("Admin {} unlocking account ID: {}", adminUsername, accountId);

                        if (!adminAuthService.isAdmin(adminUsername)) {
                                throw new RuntimeException("Access denied: not an admin");
                        }

                        AccountStatus status = resolveOrCreateStatus(accountId, accountNumber);

                        if (status.getStatus() != AccountStatus.Status.LOCKED) {
                                throw new RuntimeException(
                                                "Account is not LOCKED. Current status: " + status.getStatus());
                        }

                        status.setStatus(AccountStatus.Status.ACTIVE);
                        status.setStatusReason(null);
                        status.setLockedBy(null);
                        status.setLockedAt(null);
                        status.setLockExpiresAt(null);

                        AccountStatus saved = accountStatusRepository.save(status);

                        auditLogger.logSuccess(
                                        adminUsername,
                                        "UNLOCK_ACCOUNT",
                                        "ACCOUNT",
                                        String.valueOf(accountId),
                                        "Unlocked accountId=" + accountId);

                        return saved;
                } catch (Exception e) {
                        log.error("Failed to unlock account {}", accountId, e);
                        auditLogger.logFailure(
                                        adminUsername,
                                        "UNLOCK_ACCOUNT",
                                        "ACCOUNT",
                                        String.valueOf(accountId),
                                        "Failed: " + e.getMessage());
                        throw e;
                }
        }

        /**
         * Update transaction limits (daily and per-transaction)
         */
        public AccountStatus updateTransactionLimit(
                        String adminUsername,
                        Long accountId,
                        String accountNumber,
                        BigDecimal dailyLimit,
                        BigDecimal perTransactionLimit) {
                try {
                        log.info("Admin {} updating limits for account ID: {} | daily={} | perTxn={}",
                                        adminUsername, accountId, dailyLimit, perTransactionLimit);

                        if (!adminAuthService.isAdmin(adminUsername)) {
                                throw new RuntimeException("Access denied: not an admin");
                        }

                        if (dailyLimit != null && dailyLimit.signum() < 0) {
                                throw new RuntimeException("dailyLimit must be >= 0");
                        }
                        if (perTransactionLimit != null && perTransactionLimit.signum() < 0) {
                                throw new RuntimeException("perTransactionLimit must be >= 0");
                        }

                        AccountStatus status = resolveOrCreateStatus(accountId, accountNumber);

                        status.setTransactionLimitDaily(dailyLimit);
                        status.setTransactionLimitPerTransaction(perTransactionLimit);

                        AccountStatus saved = accountStatusRepository.save(status);

                        auditLogger.logSuccess(
                                        adminUsername,
                                        "UPDATE_ACCOUNT_LIMIT",
                                        "ACCOUNT",
                                        String.valueOf(accountId),
                                        "Updated limits daily=" + dailyLimit + ", perTxn=" + perTransactionLimit);

                        return saved;
                } catch (Exception e) {
                        log.error("Failed to update limits for account {}", accountId, e);
                        auditLogger.logFailure(
                                        adminUsername,
                                        "UPDATE_ACCOUNT_LIMIT",
                                        "ACCOUNT",
                                        String.valueOf(accountId),
                                        "Failed: " + e.getMessage());
                        throw e;
                }
        }

        /**
         * Freeze account (block all transactions)
         */
        public AccountStatus freezeAccount(
                        String adminUsername,
                        Long accountId,
                        String accountNumber,
                        String reason) {
                try {
                        log.info("Admin {} freezing account ID: {}", adminUsername, accountId);

                        if (!adminAuthService.isAdmin(adminUsername)) {
                                throw new RuntimeException("Access denied: not an admin");
                        }

                        AccountStatus status = resolveOrCreateStatus(accountId, accountNumber);

                        if (status.getStatus() == AccountStatus.Status.CLOSED) {
                                throw new RuntimeException("Account is CLOSED and cannot be frozen");
                        }

                        status.setStatus(AccountStatus.Status.FROZEN);
                        status.setStatusReason(reason);
                        status.setLockedBy(adminUsername);
                        status.setLockedAt(LocalDateTime.now());
                        status.setLockExpiresAt(null); // frozen has no expiry by default

                        AccountStatus saved = accountStatusRepository.save(status);

                        auditLogger.logSuccess(
                                        adminUsername,
                                        "FREEZE_ACCOUNT",
                                        "ACCOUNT",
                                        String.valueOf(accountId),
                                        "Frozen accountId=" + accountId + " reason=" + reason);

                        return saved;
                } catch (Exception e) {
                        log.error("Failed to freeze account {}", accountId, e);
                        auditLogger.logFailure(
                                        adminUsername,
                                        "FREEZE_ACCOUNT",
                                        "ACCOUNT",
                                        String.valueOf(accountId),
                                        "Failed: " + e.getMessage());
                        throw e;
                }
        }
}
