package com.ebanking.admintool.service;

import com.ebanking.admintool.dto.response.TransactionListResponse;
import com.ebanking.admintool.entity.TransactionFlag;
import com.ebanking.admintool.repository.TransactionFlagRepository;
import com.ebanking.admintool.service.grpc.TransactionGrpcClient;
import com.ebanking.admintool.utils.AuditLogger;
import com.ebanking.transactionService.grpc.TransactionProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin Transaction Management Service
 * Manages transaction operations for admin tool
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AdminTransactionService {

        private final TransactionGrpcClient transactionGrpcClient;
        private final AuditLogger auditLogger;
        private final TransactionFlagRepository transactionFlagRepository;
        private final AdminAuthService adminAuthService;

        /**
         * Get transaction history with filters
         */
        public TransactionListResponse getTransactionHistory(
                        String adminUsername,
                        int page,
                        int limit,
                        String username,
                        String sender,
                        String fromDate,
                        String toDate) {
                try {
                        log.info("Admin {} fetching transaction history - page: {}, limit: {}",
                                        adminUsername, page, limit);

                        TransactionProto.TransactionList transactionList = transactionGrpcClient.getTransactionHistory(
                                        page, limit, username, sender, fromDate, toDate);

                        List<TransactionListResponse.TransactionInfo> transactions = transactionList
                                        .getTransactionsList()
                                        .stream()
                                        .map(this::mapToTransactionInfo)
                                        .collect(Collectors.toList());

                        // Log the action
                        auditLogger.logSuccess(
                                        adminUsername,
                                        "VIEW_TRANSACTIONS",
                                        "TRANSACTION",
                                        null,
                                        String.format("Viewed transactions - page: %d, limit: %d, filters: username=%s, sender=%s, from=%s, to=%s",
                                                        page, limit, username, sender, fromDate, toDate));

                        return TransactionListResponse.builder()
                                        .transactions(transactions)
                                        .totalCount(transactions.size())
                                        .page(page)
                                        .limit(limit)
                                        .build();

                } catch (Exception e) {
                        log.error("Failed to get transaction history", e);
                        auditLogger.logFailure(
                                        adminUsername,
                                        "VIEW_TRANSACTIONS",
                                        "TRANSACTION",
                                        null,
                                        "Failed: " + e.getMessage());
                        throw new RuntimeException("Failed to get transaction history: " + e.getMessage());
                }
        }

        /**
         * Map proto transaction to DTO
         */
        private TransactionListResponse.TransactionInfo mapToTransactionInfo(
                        TransactionProto.TransferResponse proto) {
                return TransactionListResponse.TransactionInfo.builder()
                                .transactionId(proto.getTransactionId())
                                .senderAccountNumber(proto.getSenderAccountNumber())
                                .receiverAccountNumber(proto.getReceiverAccountNumber())
                                .amount(proto.getAmount())
                                .currency(proto.getCurrency())
                                .transactionType(proto.getTransactionType())
                                .description(proto.getDescription())
                                .status(proto.getStatus())
                                .transactionAt(proto.getTransactionAt())
                                .build();
        }

        /**
         * Flag a transaction as suspicious/fraud/review
         */
        public TransactionFlag flagTransaction(
                        String adminUsername,
                        Long transactionId,
                        TransactionFlag.FlagType flagType,
                        String reason) {
                try {
                        log.info("Admin {} flagging transaction {} as {}", adminUsername, transactionId, flagType);

                        if (!adminAuthService.isAdmin(adminUsername)) {
                                throw new RuntimeException("Access denied: not an admin");
                        }
                        if (transactionId == null || transactionId <= 0) {
                                throw new RuntimeException("transactionId is required and must be > 0");
                        }
                        if (flagType == null) {
                                throw new RuntimeException("flagType is required");
                        }
                        if (flagType == TransactionFlag.FlagType.APPROVED
                                        || flagType == TransactionFlag.FlagType.REJECTED) {
                                throw new RuntimeException(
                                                "flagType cannot be APPROVED/REJECTED when flagging. Use resolve instead.");
                        }

                        TransactionFlag flag = TransactionFlag.builder()
                                        .transactionId(transactionId)
                                        .flagType(flagType)
                                        .flagReason(reason)
                                        .flaggedBy(adminUsername)
                                        .flaggedAt(LocalDateTime.now())
                                        .build();

                        TransactionFlag saved = transactionFlagRepository.save(flag);

                        auditLogger.logSuccess(adminUsername, "FLAG_TRANSACTION", "TRANSACTION",
                                        String.valueOf(transactionId),
                                        "Flagged as " + flagType + (reason != null ? (" | reason=" + reason) : ""));

                        return saved;
                } catch (Exception e) {
                        log.error("Failed to flag transaction {}", transactionId, e);
                        auditLogger.logFailure(adminUsername, "FLAG_TRANSACTION", "TRANSACTION",
                                        String.valueOf(transactionId), "Failed: " + e.getMessage());
                        throw e;
                }
        }

        /**
         * Resolve a flagged transaction (approve/reject)
         */
        public TransactionFlag resolveTransaction(
                        String adminUsername,
                        Long flagId,
                        boolean approved,
                        String notes) {
                try {
                        log.info("Admin {} resolving flag {} -> approved={}", adminUsername, flagId, approved);

                        if (!adminAuthService.isAdmin(adminUsername)) {
                                throw new RuntimeException("Access denied: not an admin");
                        }
                        if (flagId == null || flagId <= 0) {
                                throw new RuntimeException("flagId is required and must be > 0");
                        }

                        TransactionFlag flag = transactionFlagRepository.findById(flagId)
                                        .orElseThrow(() -> new RuntimeException("Flag not found: " + flagId));

                        if (flag.getResolvedAt() != null) {
                                throw new RuntimeException("This flag has already been resolved");
                        }

                        flag.setResolvedBy(adminUsername);
                        flag.setResolvedAt(LocalDateTime.now());
                        flag.setResolutionNotes(notes);
                        flag.setFlagType(approved ? TransactionFlag.FlagType.APPROVED
                                        : TransactionFlag.FlagType.REJECTED);

                        TransactionFlag saved = transactionFlagRepository.save(flag);

                        auditLogger.logSuccess(adminUsername, "RESOLVE_TRANSACTION_FLAG", "TRANSACTION",
                                        String.valueOf(flag.getTransactionId()),
                                        (approved ? "APPROVED" : "REJECTED")
                                                        + (notes != null ? (" | notes=" + notes) : ""));

                        return saved;
                } catch (Exception e) {
                        log.error("Failed to resolve flag {}", flagId, e);
                        auditLogger.logFailure(adminUsername, "RESOLVE_TRANSACTION_FLAG", "TRANSACTION",
                                        String.valueOf(flagId), "Failed: " + e.getMessage());
                        throw e;
                }
        }

        /**
         * List flags by transactionId (newest first)
         */
        public List<TransactionFlag> listFlagsByTransaction(String adminUsername, Long transactionId) {
                try {
                        if (!adminAuthService.isAdmin(adminUsername)) {
                                throw new RuntimeException("Access denied: not an admin");
                        }
                        if (transactionId == null || transactionId <= 0) {
                                throw new RuntimeException("transactionId is required and must be > 0");
                        }
                        return transactionFlagRepository.findByTransactionIdOrderByFlaggedAtDesc(transactionId);
                } catch (Exception e) {
                        log.error("Failed to list flags for transaction {}", transactionId, e);
                        throw e;
                }
        }
}
