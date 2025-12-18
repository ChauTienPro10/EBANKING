package com.ebanking.adminTool.service;

import com.ebanking.adminTool.dto.response.TransactionListResponse.TransactionInfo;
import com.ebanking.adminTool.service.grpc.TransactionGrpcClient;
import com.ebanking.transactionService.grpc.TransactionProto;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.Objects;
import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Admin Transaction Management Service
 * Manages transaction operations for admin tool
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AdminTransactionService {

        private final TransactionGrpcClient transactionGrpcClient;

        /**
         * Get transaction history with filters
         * FIXED: Proper pagination with limited memory usage
         */
        public Page<TransactionInfo> getTransactionHistory(
                        int page, int size, String search, String type, String status, String fromDate, String toDate) {

                log.info("Fetching transaction history - page: {}, size: {}, search: '{}', type: '{}', status: '{}'",
                                page, size, search, type, status);

                final String typeCanonical = canonicalType(type);
                final String statusCanonical = canonicalStatus(status);

                // FIXED: Use proper pagination instead of loading all data
                List<TransactionInfo> transactions = new java.util.ArrayList<>();
                long totalElements = 0;

                try {
                        // Fetch only the needed page from gRPC service
                        com.ebanking.transactionService.grpc.TransactionProto.TransactionList transactionList = transactionGrpcClient
                                        .getTransactionHistory(
                                                        page, size, search, null, null, fromDate, toDate);

                        transactions = transactionList.getTransactionsList().stream()
                                        .map(this::mapToTransactionInfo)
                                        .filter(t -> typeCanonical == null
                                                        || Objects.equals(canonicalType(t.getTransactionType()),
                                                                        typeCanonical))
                                        .filter(t -> statusCanonical == null
                                                        || Objects.equals(canonicalStatus(t.getStatus()),
                                                                        statusCanonical))
                                        .collect(Collectors.toList());

                        // Note: gRPC does not return total count; best-effort calculation for
                        // pagination UI
                        totalElements = (long) (page * size) + transactions.size();

                        log.debug("Fetched {} transactions for page {}", transactions.size(), page);

                } catch (Exception e) {
                        log.error("Error fetching transaction history from gRPC service", e);
                        throw new RuntimeException("Failed to fetch transaction history: " + e.getMessage());
                }

                PageRequest pageable = PageRequest.of(page, size);
                return new PageImpl<>(transactions, pageable, totalElements);
        }

        /**
         * Map proto transaction to DTO
         */
        private TransactionInfo mapToTransactionInfo(TransactionProto.TransferResponse proto) {
                return TransactionInfo.builder()
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

        // Canonicalization helpers to align FE values with gRPC values
        private String canonicalType(String input) {
                if (input == null || input.isBlank())
                        return null;
                String s = input.trim().toUpperCase();
                switch (s) {
                        case "TRANS":
                        case "TRANSFER":
                                return "TRANSFER";
                        case "DEPOSIT":
                        case "TOPUP":
                                return "TOPUP";
                        case "WITHDRAWAL":
                        case "WITHDRAW":
                                return "WITHDRAW";
                        case "LOAN_PAYMENT":
                        case "BILLPAYMENT":
                        case "BILL_PAYMENT":
                                return "BILL_PAYMENT";
                        default:
                                return s;
                }
        }

        private String canonicalStatus(String input) {
                if (input == null || input.isBlank())
                        return null;
                String s = input.trim().toUpperCase();
                switch (s) {
                        case "SUCCESS":
                        case "SUCCEEDED":
                        case "COMPLETED":
                                return "SUCCESS";
                        case "PENDING":
                                return "PENDING";
                        case "FAILED":
                        case "FAILURE":
                                return "FAILED";
                        case "SUSPICIOUS":
                        case "REVIEW":
                        case "FRAUD":
                                return "SUSPICIOUS";
                        default:
                                return s;
                }
        }

}