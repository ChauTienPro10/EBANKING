package com.ebanking.chatbotService.service;

import com.ebanking.chatbotService.entity.Account;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * Service để truy vấn thông tin account từ DB_TRANSACTION_SERVICE
 */
@Service
@Slf4j
public class TransactionService {

    private final JdbcTemplate transactionServiceJdbcTemplate;

    public TransactionService(Map<String, JdbcTemplate> externalJdbcTemplates) {
        log.info("Initializing TransactionService with external JdbcTemplates: {}", 
                 externalJdbcTemplates != null ? externalJdbcTemplates.keySet() : "null");
        
        if (externalJdbcTemplates == null) {
            throw new IllegalStateException("externalJdbcTemplates map is null. Check ExternalDbConfig configuration.");
        }
        
        this.transactionServiceJdbcTemplate = externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
        
        if (this.transactionServiceJdbcTemplate == null) {
            throw new IllegalStateException("DB_TRANSACTION_SERVICE JdbcTemplate not found in externalJdbcTemplates. Available keys: " 
                                          + externalJdbcTemplates.keySet());
        }
        
        log.info("TransactionService initialized successfully with DB_TRANSACTION_SERVICE JdbcTemplate");
    }

    /**
     * Lấy tất cả accounts của user theo userId
     */
    public List<Account> getAccountsByUserId(Long userId) {
        try {
            String sql = "SELECT account_id, account_number, account_type, balance, currency, " +
                        "status, opened_date, closed_date, is_primary, user_id, " +
                        "last_transaction_at, created_at, updated_at " +
                        "FROM account " +
                        "WHERE user_id = ? " +
                        "ORDER BY is_primary DESC, created_at ASC";
            
            log.debug("Executing SQL for getAccountsByUserId: {} with userId: {}", sql, userId);
            
            List<Account> accounts = transactionServiceJdbcTemplate.query(sql, new AccountRowMapper(), userId);
            log.debug("Found {} accounts for user {}", accounts.size(), userId);
            
            return accounts;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy accounts của user {}: {}", userId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Lấy primary account của user
     */
    public Account getPrimaryAccountByUserId(Long userId) {
        try {
            String sql = "SELECT account_id, account_number, account_type, balance, currency, " +
                        "status, opened_date, closed_date, is_primary, user_id, " +
                        "last_transaction_at, created_at, updated_at " +
                        "FROM account " +
                        "WHERE user_id = ? AND is_primary = true " +
                        "LIMIT 1";
            
            log.debug("Executing SQL for getPrimaryAccountByUserId: {} with userId: {}", sql, userId);
            
            Account account = transactionServiceJdbcTemplate.queryForObject(sql, new AccountRowMapper(), userId);
            log.debug("Found primary account for user {}: {}", userId, account != null ? account.getAccountNumber() : "null");
            
            return account;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy primary account của user {}: {}", userId, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy account theo account number
     */
    public Account getAccountByAccountNumber(String accountNumber) {
        try {
            String sql = "SELECT account_id, account_number, account_type, balance, currency, " +
                        "status, opened_date, closed_date, is_primary, user_id, " +
                        "last_transaction_at, created_at, updated_at " +
                        "FROM account " +
                        "WHERE account_number = ?";
            
            log.debug("Executing SQL for getAccountByAccountNumber: {} with accountNumber: {}", sql, accountNumber);
            
            Account account = transactionServiceJdbcTemplate.queryForObject(sql, new AccountRowMapper(), accountNumber);
            log.debug("Found account: {}", account != null ? account.getAccountNumber() : "null");
            
            return account;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy account theo số tài khoản {}: {}", accountNumber, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy account theo accountId
     */
    public Account getAccountById(Long accountId) {
        try {
            String sql = "SELECT account_id, account_number, account_type, balance, currency, " +
                        "status, opened_date, closed_date, is_primary, user_id, " +
                        "last_transaction_at, created_at, updated_at " +
                        "FROM account " +
                        "WHERE account_id = ?";
            
            log.debug("Executing SQL for getAccountById: {} with accountId: {}", sql, accountId);
            
            Account account = transactionServiceJdbcTemplate.queryForObject(sql, new AccountRowMapper(), accountId);
            log.debug("Found account: {}", account != null ? account.getAccountNumber() : "null");
            
            return account;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy account theo ID {}: {}", accountId, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy tổng số dư của user (tất cả accounts)
     */
    public BigDecimal getTotalBalanceByUserId(Long userId) {
        try {
            String sql = "SELECT COALESCE(SUM(balance), 0) as total_balance " +
                        "FROM account " +
                        "WHERE user_id = ? AND status = 'ACTIVE'";
            
            log.debug("Executing SQL for getTotalBalanceByUserId: {} with userId: {}", sql, userId);
            
            BigDecimal totalBalance = transactionServiceJdbcTemplate.queryForObject(sql, BigDecimal.class, userId);
            log.debug("Total balance for user {}: {}", userId, totalBalance);
            
            return totalBalance != null ? totalBalance : BigDecimal.ZERO;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy tổng số dư của user {}: {}", userId, e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    /**
     * Kiểm tra account có tồn tại và thuộc về user không
     */
    public boolean isAccountBelongsToUser(String accountNumber, Long userId) {
        try {
            String sql = "SELECT COUNT(*) FROM account WHERE account_number = ? AND user_id = ?";
            
            Integer count = transactionServiceJdbcTemplate.queryForObject(sql, Integer.class, accountNumber, userId);
            boolean belongs = count != null && count > 0;
            
            log.debug("Account {} belongs to user {}: {}", accountNumber, userId, belongs);
            return belongs;
            
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra account {} thuộc user {}: {}", accountNumber, userId, e.getMessage());
            return false;
        }
    }

    /**
     * Lấy thông tin account để hiển thị cho chatbot
     */
    public String getAccountDisplayInfo(Long userId) {
        try {
            List<Account> accounts = getAccountsByUserId(userId);
            
            if (accounts.isEmpty()) {
                return "Không tìm thấy tài khoản nào cho người dùng này.";
            }

            StringBuilder info = new StringBuilder();
            info.append("Thông tin tài khoản:\n");
            
            for (Account account : accounts) {
                info.append("- Số tài khoản: ").append(account.getAccountNumber()).append("\n");
                info.append("  + Loại: ").append(account.getAccountType()).append("\n");
                info.append("  + Số dư: ").append(String.format("%,.0f %s", account.getBalance(), account.getCurrency())).append("\n");
                info.append("  + Trạng thái: ").append(account.getStatus()).append("\n");
                
                if (account.getIsPrimary() != null && account.getIsPrimary()) {
                    info.append("  + Tài khoản chính\n");
                }
                
                if (account.getLastTransactionAt() != null) {
                    info.append("  + Giao dịch cuối: ").append(account.getLastTransactionAt()).append("\n");
                }
                
                info.append("\n");
            }
            
            // Thêm tổng số dư
            BigDecimal totalBalance = getTotalBalanceByUserId(userId);
            info.append("Tổng số dư: ").append(String.format("%,.0f VNĐ", totalBalance)).append("\n");
            
            return info.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin hiển thị account cho user {}: {}", userId, e.getMessage());
            return "Không thể lấy thông tin tài khoản lúc này.";
        }
    }

    /**
     * Lấy thông tin account ngắn gọn cho chatbot
     */
    public String getAccountSummary(Long userId) {
        try {
            List<Account> accounts = getAccountsByUserId(userId);
            
            if (accounts.isEmpty()) {
                return "Không có tài khoản nào.";
            }

            StringBuilder summary = new StringBuilder();
            summary.append("Bạn có ").append(accounts.size()).append(" tài khoản:\n");
            
            for (Account account : accounts) {
                summary.append("- ").append(account.getAccountNumber())
                       .append(" (").append(account.getAccountType()).append("): ")
                       .append(String.format("%,.0f %s", account.getBalance(), account.getCurrency()));
                
                if (account.getIsPrimary() != null && account.getIsPrimary()) {
                    summary.append(" [Chính]");
                }
                
                summary.append("\n");
            }
            
            return summary.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy tóm tắt account cho user {}: {}", userId, e.getMessage());
            return "Không thể lấy thông tin tài khoản.";
        }
    }

    // Row Mapper
    private static class AccountRowMapper implements RowMapper<Account> {
        @Override
        public Account mapRow(ResultSet rs, int rowNum) throws SQLException {
            return Account.builder()
                    .accountId(rs.getLong("account_id"))
                    .accountNumber(rs.getString("account_number"))
                    .accountType(rs.getString("account_type"))
                    .balance(rs.getBigDecimal("balance"))
                    .currency(rs.getString("currency"))
                    .status(rs.getString("status"))
                    .openedDate(rs.getTimestamp("opened_date") != null ? 
                               rs.getTimestamp("opened_date").toLocalDateTime() : null)
                    .closedDate(rs.getTimestamp("closed_date") != null ? 
                               rs.getTimestamp("closed_date").toLocalDateTime() : null)
                    .isPrimary(rs.getBoolean("is_primary"))
                    .userId(rs.getLong("user_id"))
                    .lastTransactionAt(rs.getTimestamp("last_transaction_at") != null ? 
                                      rs.getTimestamp("last_transaction_at").toLocalDateTime() : null)
                    .createdAt(rs.getTimestamp("created_at") != null ? 
                              rs.getTimestamp("created_at").toLocalDateTime() : null)
                    .updatedAt(rs.getTimestamp("updated_at") != null ? 
                              rs.getTimestamp("updated_at").toLocalDateTime() : null)
                    .build();
        }
    }
}
