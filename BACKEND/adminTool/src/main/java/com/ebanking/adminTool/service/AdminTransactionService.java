package com.ebanking.adminTool.service;

import com.banking.userService.grpc.UserProto;
import com.ebanking.adminTool.dto.TransactionDto;
import com.ebanking.adminTool.dto.TransactionHistoryResponse;
import com.ebanking.adminTool.service.grpc.TransactionGrpcClient;
import com.ebanking.adminTool.service.grpc.UserGrpcClient;
import com.ebanking.adminTool.utils.AuditAction;
import com.ebanking.adminTool.utils.AuditLogger;
import com.ebanking.transactionService.grpc.TransactionProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminTransactionService {

    private final TransactionGrpcClient transactionGrpcClient;
    private final UserGrpcClient userGrpcClient;
    private final AuditLogger auditLogger;

    public TransactionHistoryResponse getTransactionHistory(
            int page, int size, String search, String type,
            String status, String fromDate, String toDate) {

        try {
            TransactionProto.TransactionList rs = transactionGrpcClient.getTransactionHistory(
                    page, size, search, type, status, fromDate, toDate);

            List<TransactionDto> transactions = rs.getTransactionsList().stream()
                    .map(this::mapToDto)
                    .map(this::enrichNames)
                    .filter(tx -> type == null || type.isBlank() || type.equalsIgnoreCase(tx.getTransactionType()))
                    .filter(tx -> status == null || status.isBlank() || status.equalsIgnoreCase(tx.getStatus()))
                    .collect(Collectors.toList());

            long totalElements = ((long) page * size) + transactions.size();
            int totalPages = transactions.size() < size ? page + 1 : page + 2;

            TransactionHistoryResponse response = TransactionHistoryResponse.builder()
                    .transactions(transactions)
                    .currentPage(page)
                    .totalPages(totalPages)
                    .totalElements(totalElements)
                    .pageSize(size)
                    .hasNext(transactions.size() == size)
                    .hasPrevious(page > 0)
                    .build();

            auditLogger.logSuccess(
                    "ADMIN_CONSOLE",
                    AuditAction.VIEW_TRANSACTIONS,
                    "TRANSACTION",
                    null,
                    "page=" + page + ", size=" + size + ", search=" + search + ", type=" + type + ", status=" + status,
                    null);

            return response;

        } catch (Exception e) {
            log.error("Error retrieving transaction history via gRPC", e);
            auditLogger.logFailure(
                    "ADMIN_CONSOLE",
                    AuditAction.VIEW_TRANSACTIONS,
                    "TRANSACTION",
                    null,
                    "Failed to load transactions: " + e.getMessage(),
                    null);
            throw new RuntimeException("Failed to retrieve transaction history: " + e.getMessage(), e);
        }
    }

    private TransactionDto mapToDto(TransactionProto.TransferResponse t) {
        return TransactionDto.builder()
                .transactionId(t.getTransactionId())
                .username(t.getSenderAccountNumber())
                .senderAccountNumber(t.getSenderAccountNumber())
                .receiverAccountNumber(t.getReceiverAccountNumber())
                .amount(toBigDecimal(t.getAmount()))
                .currency(t.getCurrency())
                .transactionType(t.getTransactionType())
                .status(t.getStatus())
                .description(t.getDescription())
                .transactionAt(parseDateTime(t.getTransactionAt()))
                .requiresFaceAuth(false)
                .faceAuthVerified(false)
                .build();
    }

    private TransactionDto enrichNames(TransactionDto dto) {
        try {
            if (dto.getSenderAccountNumber() != null) {
                dto.setSenderFullName(fetchFullName(dto.getSenderAccountNumber()));
            }
            if (dto.getReceiverAccountNumber() != null) {
                dto.setReceiverFullName(fetchFullName(dto.getReceiverAccountNumber()));
            }
        } catch (Exception e) {
            log.warn("Failed to enrich names for tx {}: {}", dto.getTransactionId(), e.getMessage());
        }
        return dto;
    }

    private String fetchFullName(String accountNumber) {
        var check = transactionGrpcClient.checkAccountExist(accountNumber);
        if (check == null || !check.getExist() || check.getUserId() <= 0) {
            return "Unknown User";
        }

        UserProto.UserResponse user = userGrpcClient.getUserById(check.getUserId());
        if (user != null && user.hasUser()) {
            String fullName = user.getUser().getFullName();
            return !fullName.isBlank() ? fullName : "Unknown User";
        }
        return "Unknown User";
    }

    private BigDecimal toBigDecimal(String amount) {
        try {
            return amount == null || amount.isBlank() ? null : new BigDecimal(amount);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}