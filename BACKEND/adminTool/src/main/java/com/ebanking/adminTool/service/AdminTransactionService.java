package com.ebanking.adminTool.service;

import com.ebanking.adminTool.dto.TransactionDto;
import com.ebanking.adminTool.dto.TransactionHistoryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Admin Transaction Management Service
 * Manages transaction operations for admin tool
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AdminTransactionService {

    private final Map<String, JdbcTemplate> externalJdbcTemplates;

    /**
     * Get transaction history with filters and pagination
     */
    public TransactionHistoryResponse getTransactionHistory(
            int page, int size, String search, String type, 
            String status, String fromDate, String toDate) {
        
        try {
            // Get transaction service JDBC template
            JdbcTemplate transactionJdbc = externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
            JdbcTemplate userJdbc = externalJdbcTemplates.get("DB_USER_SERVICE");
            
            if (transactionJdbc == null) {
                log.error("Transaction database connection not found");
                throw new RuntimeException("Transaction database connection not configured");
            }
            
            if (userJdbc == null) {
                log.error("User database connection not found");
                throw new RuntimeException("User database connection not configured");
            }

            // Build dynamic query with cross-database joins
            StringBuilder queryBuilder = new StringBuilder();
            queryBuilder.append("SELECT t.transaction_id, t.username, t.sender_account_number, t.receiver_account_number, ");
            queryBuilder.append("t.amount, t.currency, t.transaction_type, t.status, t.description, t.failure_reason, ");
            queryBuilder.append("t.transaction_at, t.requires_face_auth, t.face_auth_session_id, t.face_auth_verified, t.face_auth_at ");
            queryBuilder.append("FROM transaction t ");
            queryBuilder.append("WHERE 1=1 ");

            List<Object> params = new ArrayList<>();

            // Add filters
            if (search != null && !search.trim().isEmpty()) {
                queryBuilder.append("AND (t.username LIKE ? OR t.sender_account_number LIKE ? OR t.receiver_account_number LIKE ? OR t.description LIKE ?) ");
                String searchPattern = "%" + search.trim() + "%";
                params.add(searchPattern);
                params.add(searchPattern);
                params.add(searchPattern);
                params.add(searchPattern);
            }

            if (type != null && !type.trim().isEmpty()) {
                queryBuilder.append("AND t.transaction_type = ? ");
                params.add(type);
            }

            if (status != null && !status.trim().isEmpty()) {
                queryBuilder.append("AND t.status = ? ");
                params.add(status);
            }

            if (fromDate != null && !fromDate.trim().isEmpty()) {
                queryBuilder.append("AND t.transaction_at >= ? ");
                params.add(fromDate);
            }

            if (toDate != null && !toDate.trim().isEmpty()) {
                queryBuilder.append("AND t.transaction_at <= ? ");
                params.add(toDate);
            }

            // Count total records
            String countQuery = "SELECT COUNT(*) FROM (" + queryBuilder.toString() + ") as count_query";
            long totalElements = transactionJdbc.queryForObject(countQuery, params.toArray(), Long.class);

            // Add pagination
            queryBuilder.append("ORDER BY t.transaction_at DESC ");
            queryBuilder.append("LIMIT ? OFFSET ? ");
            params.add(size);
            params.add(page * size);

            // Execute query to get transactions
            List<TransactionDto> transactions = transactionJdbc.query(
                queryBuilder.toString(), 
                params.toArray(), 
                new TransactionRowMapper()
            );

            // Enrich transactions with full names
            enrichTransactionsWithFullNames(transactions, userJdbc, transactionJdbc);

            // Calculate pagination info
            int totalPages = (int) Math.ceil((double) totalElements / size);
            boolean hasNext = page < totalPages - 1;
            boolean hasPrevious = page > 0;

            return TransactionHistoryResponse.builder()
                    .transactions(transactions)
                    .currentPage(page)
                    .totalPages(totalPages)
                    .totalElements(totalElements)
                    .pageSize(size)
                    .hasNext(hasNext)
                    .hasPrevious(hasPrevious)
                    .build();

        } catch (Exception e) {
            log.error("Error retrieving transaction history", e);
            throw new RuntimeException("Failed to retrieve transaction history: " + e.getMessage());
        }
    }

    /**
     * Enrich transactions with full names by looking up account numbers
     */
    private void enrichTransactionsWithFullNames(List<TransactionDto> transactions, 
                                                JdbcTemplate userJdbc, JdbcTemplate transactionJdbc) {
        for (TransactionDto transaction : transactions) {
            try {
                // Get sender full name
                if (transaction.getSenderAccountNumber() != null) {
                    String senderFullName = getFullNameByAccountNumber(
                            transaction.getSenderAccountNumber(), userJdbc, transactionJdbc);
                    transaction.setSenderFullName(senderFullName);
                }

                // Get receiver full name
                if (transaction.getReceiverAccountNumber() != null) {
                    String receiverFullName = getFullNameByAccountNumber(
                            transaction.getReceiverAccountNumber(), userJdbc, transactionJdbc);
                    transaction.setReceiverFullName(receiverFullName);
                }
            } catch (Exception e) {
                log.warn("Failed to enrich transaction {} with full names: {}", 
                        transaction.getTransactionId(), e.getMessage());
            }
        }
    }

    /**
     * Get full name by account number
     */
    private String getFullNameByAccountNumber(String accountNumber, 
                                            JdbcTemplate userJdbc, JdbcTemplate transactionJdbc) {
        try {
            // First get user_id from account table in transaction service
            String accountQuery = "SELECT user_id FROM account WHERE account_number = ?";
            Long userId = transactionJdbc.queryForObject(accountQuery, Long.class, accountNumber);
            
            if (userId == null) {
                return "Unknown User";
            }

            // Then get full name from user service
            String userQuery = "SELECT ui.full_name FROM user u " +
                             "JOIN user_info ui ON u.info_id = ui.id " +
                             "WHERE u.id = ?";
            String fullName = userJdbc.queryForObject(userQuery, String.class, userId);
            
            return fullName != null ? fullName : "Unknown User";
            
        } catch (Exception e) {
            log.warn("Failed to get full name for account {}: {}", accountNumber, e.getMessage());
            return "Unknown User";
        }
    }

    /**
     * Row mapper for Transaction entity
     */
    private static class TransactionRowMapper implements RowMapper<TransactionDto> {
        @Override
        public TransactionDto mapRow(ResultSet rs, int rowNum) throws SQLException {
            return TransactionDto.builder()
                    .transactionId(rs.getLong("transaction_id"))
                    .username(rs.getString("username"))
                    .senderAccountNumber(rs.getString("sender_account_number"))
                    .receiverAccountNumber(rs.getString("receiver_account_number"))
                    .amount(rs.getBigDecimal("amount"))
                    .currency(rs.getString("currency"))
                    .transactionType(rs.getString("transaction_type"))
                    .status(rs.getString("status"))
                    .description(rs.getString("description"))
                    .failureReason(rs.getString("failure_reason"))
                    .transactionAt(rs.getTimestamp("transaction_at") != null ? 
                            rs.getTimestamp("transaction_at").toLocalDateTime() : null)
                    .requiresFaceAuth(rs.getBoolean("requires_face_auth"))
                    .faceAuthSessionId(rs.getString("face_auth_session_id"))
                    .faceAuthVerified(rs.getBoolean("face_auth_verified"))
                    .faceAuthAt(rs.getTimestamp("face_auth_at") != null ? 
                            rs.getTimestamp("face_auth_at").toLocalDateTime() : null)
                    .build();
        }
    }
}