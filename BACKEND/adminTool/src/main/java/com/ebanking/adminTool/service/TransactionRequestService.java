package com.ebanking.adminTool.service;

import com.ebanking.adminTool.dto.TransactionRequestDto;
import com.ebanking.adminTool.dto.TransactionRequestFilterDto;
import com.ebanking.adminTool.dto.PagedResponseDto;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionRequestService {

    private final Map<String, JdbcTemplate> externalJdbcTemplates;

    public PagedResponseDto<TransactionRequestDto> getTransactionRequestsWithFilter(TransactionRequestFilterDto filter) {
        try {
            JdbcTemplate jdbcTemplate = externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
            if (jdbcTemplate == null) {
                log.error("Transaction service database connection not found");
                throw new RuntimeException("Transaction service database connection not available");
            }

            // Build dynamic query
            StringBuilder queryBuilder = new StringBuilder();
            StringBuilder countQueryBuilder = new StringBuilder();
            List<Object> params = new ArrayList<>();
            
            String baseQuery = buildBaseQuery(filter, params);
            queryBuilder.append(baseQuery);
            countQueryBuilder.append("SELECT COUNT(*) FROM transaction_request");
            
            // Add WHERE conditions
            String whereClause = buildWhereClause(filter, params);
            if (!whereClause.isEmpty()) {
                queryBuilder.append(" WHERE ").append(whereClause);
                countQueryBuilder.append(" WHERE ").append(whereClause);
            }
            
            // Add ORDER BY
            queryBuilder.append(" ORDER BY ").append(filter.getSortBy()).append(" ").append(filter.getSortDirection());
            
            // Add LIMIT and OFFSET for pagination
            int offset = filter.getPage() * filter.getSize();
            queryBuilder.append(" LIMIT ? OFFSET ?");
            params.add(filter.getSize());
            params.add(offset);
            
            log.info("Executing query: {}", queryBuilder.toString());
            log.info("With parameters: {}", params);
            
            // Get total count
            List<Object> countParams = new ArrayList<>(params);
            countParams.remove(countParams.size() - 1); // Remove OFFSET
            countParams.remove(countParams.size() - 1); // Remove LIMIT
            
            Long totalCount = jdbcTemplate.queryForObject(countQueryBuilder.toString(), Long.class, countParams.toArray());
            totalCount = totalCount != null ? totalCount : 0L;
            
            // Get data
            List<TransactionRequestDto> data = jdbcTemplate.query(queryBuilder.toString(), new TransactionRequestRowMapper(), params.toArray());
            
            log.info("Found {} transaction requests out of {} total", data.size(), totalCount);
            
            return PagedResponseDto.of(data, totalCount, filter.getPage(), filter.getSize());
            
        } catch (Exception e) {
            log.error("Error fetching transaction requests with filter: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch transaction requests", e);
        }
    }
    
    private String buildBaseQuery(TransactionRequestFilterDto filter, List<Object> params) {
        return """
            SELECT request_id, request_number, user_id, savings_account_id, 
                   request_type, amount, currency, status, description, 
                   rejection_reason, requested_at, processed_at, processed_by,
                   created_at, updated_at
            FROM transaction_request
            """;
    }
    
    private String buildWhereClause(TransactionRequestFilterDto filter, List<Object> params) {
        List<String> conditions = new ArrayList<>();
        
        // Date range filter (using requested_at instead of created_at for business logic)
        if (filter.getFromDate() != null) {
            conditions.add("DATE(requested_at) >= ?");
            params.add(filter.getFromDate());
        }
        
        if (filter.getToDate() != null) {
            conditions.add("DATE(requested_at) <= ?");
            params.add(filter.getToDate());
        }
        
        // Status filter
        if (filter.getStatus() != null && !filter.getStatus().trim().isEmpty()) {
            conditions.add("status = ?");
            params.add(filter.getStatus().trim());
        }
        
        // Request number filter (partial match)
        if (filter.getRequestNumber() != null && !filter.getRequestNumber().trim().isEmpty()) {
            conditions.add("request_number LIKE ?");
            params.add("%" + filter.getRequestNumber().trim() + "%");
        }
        
        // Amount range filters
        if (filter.getMinAmount() != null) {
            conditions.add("amount >= ?");
            params.add(filter.getMinAmount());
        }
        
        if (filter.getMaxAmount() != null) {
            conditions.add("amount <= ?");
            params.add(filter.getMaxAmount());
        }
        
        // Request type filter
        if (filter.getRequestType() != null && !filter.getRequestType().trim().isEmpty()) {
            conditions.add("request_type = ?");
            params.add(filter.getRequestType().trim());
        }
        
        // User ID filter
        if (filter.getUserId() != null) {
            conditions.add("user_id = ?");
            params.add(filter.getUserId());
        }
        
        // Savings account ID filter
        if (filter.getSavingsAccountId() != null) {
            conditions.add("savings_account_id = ?");
            params.add(filter.getSavingsAccountId());
        }
        
        // Processed by filter
        if (filter.getProcessedBy() != null && !filter.getProcessedBy().trim().isEmpty()) {
            conditions.add("processed_by LIKE ?");
            params.add("%" + filter.getProcessedBy().trim() + "%");
        }
        
        return String.join(" AND ", conditions);
    }

    // Legacy method for backward compatibility
    public List<TransactionRequestDto> getTransactionRequests(int size) {
        TransactionRequestFilterDto filter = new TransactionRequestFilterDto();
        filter.setSize(size);
        filter.setPage(0);
        
        PagedResponseDto<TransactionRequestDto> result = getTransactionRequestsWithFilter(filter);
        return result.getData();
    }

    public long getTotalTransactionRequests() {
        try {
            JdbcTemplate jdbcTemplate = externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
            if (jdbcTemplate == null) {
                log.error("Transaction service database connection not found");
                throw new RuntimeException("Transaction service database connection not available");
            }

            Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM transaction_request", Long.class);
            return count != null ? count : 0L;
            
        } catch (Exception e) {
            log.error("Error counting transaction requests: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to count transaction requests", e);
        }
    }
    
    public TransactionRequestDto getTransactionRequestById(Long requestId) {
        try {
            JdbcTemplate jdbcTemplate = externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
            if (jdbcTemplate == null) {
                log.error("Transaction service database connection not found");
                throw new RuntimeException("Transaction service database connection not available");
            }

            String query = """
                SELECT request_id, request_number, user_id, savings_account_id, 
                       request_type, amount, currency, status, description, 
                       rejection_reason, requested_at, processed_at, processed_by,
                       created_at, updated_at
                FROM transaction_request 
                WHERE request_id = ?
                """;
            
            List<TransactionRequestDto> results = jdbcTemplate.query(query, new TransactionRequestRowMapper(), requestId);
            return results.isEmpty() ? null : results.get(0);
            
        } catch (Exception e) {
            log.error("Error fetching transaction request by id {}: {}", requestId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch transaction request", e);
        }
    }
    
    public Map<String, Long> getCountsByStatus() {
        try {
            JdbcTemplate jdbcTemplate = externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
            if (jdbcTemplate == null) {
                log.error("Transaction service database connection not found");
                throw new RuntimeException("Transaction service database connection not available");
            }

            String query = "SELECT status, COUNT(*) as count FROM transaction_request GROUP BY status";
            
            Map<String, Long> statusCounts = new HashMap<>();
            jdbcTemplate.query(query, rs -> {
                statusCounts.put(rs.getString("status"), rs.getLong("count"));
            });
            
            return statusCounts;
            
        } catch (Exception e) {
            log.error("Error fetching counts by status: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch status counts", e);
        }
    }
    
    public Map<String, Long> getCountsByRequestType() {
        try {
            JdbcTemplate jdbcTemplate = externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
            if (jdbcTemplate == null) {
                log.error("Transaction service database connection not found");
                throw new RuntimeException("Transaction service database connection not available");
            }

            String query = "SELECT request_type, COUNT(*) as count FROM transaction_request GROUP BY request_type";
            
            Map<String, Long> typeCounts = new HashMap<>();
            jdbcTemplate.query(query, rs -> {
                typeCounts.put(rs.getString("request_type"), rs.getLong("count"));
            });
            
            return typeCounts;
            
        } catch (Exception e) {
            log.error("Error fetching counts by request type: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch request type counts", e);
        }
    }
    
    public TransactionRequestDto approveRequest(Long requestId, String adminUsername) {
        try {
            JdbcTemplate jdbcTemplate = externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
            if (jdbcTemplate == null) {
                log.error("Transaction service database connection not found");
                throw new RuntimeException("Transaction service database connection not available");
            }

            // First get the full request details
            String getRequestQuery = """
                SELECT request_id, request_number, user_id, savings_account_id, 
                       request_type, amount, currency, status, description
                FROM transaction_request 
                WHERE request_id = ?
                """;
            
            List<Map<String, Object>> requests = jdbcTemplate.queryForList(getRequestQuery, requestId);
            
            if (requests.isEmpty()) {
                throw new RuntimeException("Transaction request not found with ID: " + requestId);
            }
            
            Map<String, Object> request = requests.get(0);
            String currentStatus = (String) request.get("status");
            String requestType = (String) request.get("request_type");
            BigDecimal amount = (BigDecimal) request.get("amount");
            Long savingsAccountId = (Long) request.get("savings_account_id");
            
            if (!"PENDING".equals(currentStatus)) {
                throw new RuntimeException("Transaction request is not in PENDING status. Current status: " + currentStatus);
            }

            // Start transaction to ensure data consistency
            try {
                // Update savings account balance based on request type
                if ("CASH_DEPOSIT".equals(requestType)) {
                    // Add money to savings account
                    String updateBalanceQuery = """
                        UPDATE savings_account 
                        SET balance = balance + ?, 
                            updated_at = CURRENT_TIMESTAMP
                        WHERE savings_account_id = ?
                        """;
                    
                    int balanceUpdated = jdbcTemplate.update(updateBalanceQuery, amount, savingsAccountId);
                    if (balanceUpdated == 0) {
                        throw new RuntimeException("Failed to update savings account balance for deposit");
                    }
                    
                    log.info("Successfully deposited {} to savings account {}", amount, savingsAccountId);
                    
                } else if ("CASH_WITHDRAWAL".equals(requestType)) {
                    // Check current balance first
                    String checkBalanceQuery = "SELECT balance FROM savings_account WHERE savings_account_id = ?";
                    List<BigDecimal> balances = jdbcTemplate.queryForList(checkBalanceQuery, BigDecimal.class, savingsAccountId);
                    
                    if (balances.isEmpty()) {
                        throw new RuntimeException("Savings account not found with ID: " + savingsAccountId);
                    }
                    
                    BigDecimal currentBalance = balances.get(0);
                    if (currentBalance.compareTo(amount) < 0) {
                        throw new RuntimeException("Insufficient balance. Current balance: " + currentBalance + ", Requested amount: " + amount);
                    }
                    
                    // Subtract money from savings account
                    String updateBalanceQuery = """
                        UPDATE savings_account 
                        SET balance = balance - ?, 
                            updated_at = CURRENT_TIMESTAMP
                        WHERE savings_account_id = ? AND balance >= ?
                        """;
                    
                    int balanceUpdated = jdbcTemplate.update(updateBalanceQuery, amount, savingsAccountId, amount);
                    if (balanceUpdated == 0) {
                        throw new RuntimeException("Failed to update savings account balance for withdrawal - insufficient funds");
                    }
                    
                    log.info("Successfully withdrew {} from savings account {}", amount, savingsAccountId);
                    
                } else {
                    throw new RuntimeException("Unknown request type: " + requestType);
                }

                // Update the request to APPROVED status
                String updateRequestQuery = """
                    UPDATE transaction_request 
                    SET status = 'APPROVED', 
                        processed_at = CURRENT_TIMESTAMP, 
                        processed_by = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE request_id = ?
                    """;
                
                int updatedRows = jdbcTemplate.update(updateRequestQuery, adminUsername, requestId);
                
                if (updatedRows == 0) {
                    throw new RuntimeException("Failed to update transaction request status");
                }
                
                log.info("Successfully approved transaction request: {} by admin: {} with balance update", 
                        requestId, adminUsername);
                
                // Return the updated request
                return getTransactionRequestById(requestId);
                
            } catch (Exception e) {
                log.error("Error during transaction processing: {}", e.getMessage(), e);
                throw new RuntimeException("Transaction failed: " + e.getMessage(), e);
            }
            
        } catch (Exception e) {
            log.error("Error approving transaction request {}: {}", requestId, e.getMessage(), e);
            throw new RuntimeException("Failed to approve transaction request: " + e.getMessage(), e);
        }
    }
    
    public TransactionRequestDto rejectRequest(Long requestId, String adminUsername, String rejectionReason) {
        try {
            JdbcTemplate jdbcTemplate = externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
            if (jdbcTemplate == null) {
                log.error("Transaction service database connection not found");
                throw new RuntimeException("Transaction service database connection not available");
            }

            // First check if request exists and is in PENDING status
            String checkQuery = "SELECT status FROM transaction_request WHERE request_id = ?";
            List<String> statuses = jdbcTemplate.queryForList(checkQuery, String.class, requestId);
            
            if (statuses.isEmpty()) {
                throw new RuntimeException("Transaction request not found with ID: " + requestId);
            }
            
            String currentStatus = statuses.get(0);
            if (!"PENDING".equals(currentStatus)) {
                throw new RuntimeException("Transaction request is not in PENDING status. Current status: " + currentStatus);
            }

            // Update the request to REJECTED status
            String updateQuery = """
                UPDATE transaction_request 
                SET status = 'REJECTED', 
                    rejection_reason = ?,
                    processed_at = CURRENT_TIMESTAMP, 
                    processed_by = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE request_id = ?
                """;
            
            int updatedRows = jdbcTemplate.update(updateQuery, rejectionReason, adminUsername, requestId);
            
            if (updatedRows == 0) {
                throw new RuntimeException("Failed to update transaction request");
            }
            
            log.info("Successfully rejected transaction request: {} by admin: {} with reason: {}", 
                    requestId, adminUsername, rejectionReason);
            
            // Return the updated request
            return getTransactionRequestById(requestId);
            
        } catch (Exception e) {
            log.error("Error rejecting transaction request {}: {}", requestId, e.getMessage(), e);
            throw new RuntimeException("Failed to reject transaction request: " + e.getMessage(), e);
        }
    }
    
    public BigDecimal getSavingsAccountBalance(Long savingsAccountId) {
        try {
            JdbcTemplate jdbcTemplate = externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
            if (jdbcTemplate == null) {
                log.error("Transaction service database connection not found");
                throw new RuntimeException("Transaction service database connection not available");
            }

            String query = "SELECT balance FROM savings_account WHERE savings_account_id = ?";
            List<BigDecimal> balances = jdbcTemplate.queryForList(query, BigDecimal.class, savingsAccountId);
            
            if (balances.isEmpty()) {
                throw new RuntimeException("Savings account not found with ID: " + savingsAccountId);
            }
            
            return balances.get(0);
            
        } catch (Exception e) {
            log.error("Error fetching savings account balance for ID {}: {}", savingsAccountId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch savings account balance", e);
        }
    }

    private static class TransactionRequestRowMapper implements RowMapper<TransactionRequestDto> {
        @Override
        public TransactionRequestDto mapRow(ResultSet rs, int rowNum) throws SQLException {
            TransactionRequestDto dto = new TransactionRequestDto();
            
            dto.setRequestId(rs.getLong("request_id"));
            dto.setRequestNumber(rs.getString("request_number"));
            dto.setUserId(rs.getLong("user_id"));
            dto.setSavingsAccountId(rs.getLong("savings_account_id"));
            dto.setRequestType(rs.getString("request_type"));
            
            BigDecimal amount = rs.getBigDecimal("amount");
            dto.setAmount(amount);
            
            dto.setCurrency(rs.getString("currency"));
            dto.setStatus(rs.getString("status"));
            dto.setDescription(rs.getString("description"));
            dto.setRejectionReason(rs.getString("rejection_reason"));
            dto.setProcessedBy(rs.getString("processed_by"));
            
            // Handle timestamp conversion
            if (rs.getTimestamp("requested_at") != null) {
                dto.setRequestedAt(rs.getTimestamp("requested_at").toLocalDateTime());
            }
            if (rs.getTimestamp("processed_at") != null) {
                dto.setProcessedAt(rs.getTimestamp("processed_at").toLocalDateTime());
            }
            if (rs.getTimestamp("created_at") != null) {
                dto.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            }
            if (rs.getTimestamp("updated_at") != null) {
                dto.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
            }
            
            return dto;
        }
    }
}