package com.ebanking.adminTool.service;

import com.ebanking.adminTool.dto.AccountDto;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountManagementService {

    private final Map<String, JdbcTemplate> externalJdbcTemplates;

    private JdbcTemplate getTransactionServiceJdbcTemplate() {
        return externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
    }

    private JdbcTemplate getUserServiceJdbcTemplate() {
        return externalJdbcTemplates.get("DB_USER_SERVICE");
    }

    private JdbcTemplate getAuthServiceJdbcTemplate() {
        return externalJdbcTemplates.get("DB_AUTH");
    }

    private final RowMapper<AccountDto> accountWithoutUserRowMapper = new RowMapper<AccountDto>() {
        @Override
        public AccountDto mapRow(ResultSet rs, int rowNum) throws SQLException {
            return AccountDto.builder()
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
    };

    public List<AccountDto> getAllAccounts() {
        log.info("Fetching all accounts from transaction service with user names and lock status");
        
        // First get all accounts
        String accountSql = "SELECT * FROM account ORDER BY created_at DESC";
        List<AccountDto> accounts = getTransactionServiceJdbcTemplate().query(accountSql, accountWithoutUserRowMapper);
        
        // Then enrich with user full names and lock status
        enrichAccountsWithUserNamesAndLockStatus(accounts);
        
        return accounts;
    }

    public Optional<AccountDto> getAccountById(Long accountId) {
        log.info("Fetching account by ID: {}", accountId);
        String sql = "SELECT * FROM account WHERE account_id = ?";
        List<AccountDto> accounts = getTransactionServiceJdbcTemplate().query(sql, accountWithoutUserRowMapper, accountId);
        
        if (accounts.isEmpty()) {
            return Optional.empty();
        }
        
        AccountDto account = accounts.get(0);
        enrichAccountWithUserNameAndLockStatus(account);
        return Optional.of(account);
    }

    public Optional<AccountDto> getAccountByNumber(String accountNumber) {
        log.info("Fetching account by number: {}", accountNumber);
        String sql = "SELECT * FROM account WHERE account_number = ?";
        List<AccountDto> accounts = getTransactionServiceJdbcTemplate().query(sql, accountWithoutUserRowMapper, accountNumber);
        
        if (accounts.isEmpty()) {
            return Optional.empty();
        }
        
        AccountDto account = accounts.get(0);
        enrichAccountWithUserNameAndLockStatus(account);
        return Optional.of(account);
    }

    public List<AccountDto> getAccountsByUserId(Long userId) {
        log.info("Fetching accounts for user ID: {}", userId);
        String sql = "SELECT * FROM account WHERE user_id = ? ORDER BY is_primary DESC, created_at DESC";
        List<AccountDto> accounts = getTransactionServiceJdbcTemplate().query(sql, accountWithoutUserRowMapper, userId);
        
        enrichAccountsWithUserNamesAndLockStatus(accounts);
        return accounts;
    }

    public List<AccountDto> getAccountsByStatus(String status) {
        log.info("Fetching accounts by status: {}", status);
        String sql = "SELECT * FROM account WHERE status = ? ORDER BY created_at DESC";
        List<AccountDto> accounts = getTransactionServiceJdbcTemplate().query(sql, accountWithoutUserRowMapper, status);
        
        enrichAccountsWithUserNamesAndLockStatus(accounts);
        return accounts;
    }

    private void enrichAccountsWithUserNamesAndLockStatus(List<AccountDto> accounts) {
        for (AccountDto account : accounts) {
            enrichAccountWithUserNameAndLockStatus(account);
        }
    }

    private void enrichAccountWithUserNameAndLockStatus(AccountDto account) {
        enrichAccountWithUserName(account);
        enrichAccountWithLockStatus(account);
    }

    private void enrichAccountWithUserName(AccountDto account) {
        try {
            String userSql = "SELECT full_name FROM user_info WHERE user_id = ?";
            List<String> fullNames = getUserServiceJdbcTemplate().query(userSql, 
                (rs, rowNum) -> rs.getString("full_name"), account.getUserId());
            
            if (!fullNames.isEmpty()) {
                account.setUserFullName(fullNames.get(0));
            } else {
                account.setUserFullName("Unknown User");
            }
        } catch (Exception e) {
            log.warn("Failed to fetch user name for user ID: {}, error: {}", account.getUserId(), e.getMessage());
            account.setUserFullName("Unknown User");
        }
    }

    private void enrichAccountWithLockStatus(AccountDto account) {
        try {
            String lockSql = """
                SELECT lock_type, reason, locked_at, locked_by, unlocked_at, unlocked_by, is_active, notes
                FROM lock_account 
                WHERE account_id = ? AND is_active = 1
                ORDER BY locked_at DESC 
                LIMIT 1
                """;
            
            RowMapper<Map<String, Object>> lockRowMapper = (rs, rowNum) -> {
                Map<String, Object> lockData = new HashMap<>();
                lockData.put("lock_type", rs.getString("lock_type"));
                lockData.put("reason", rs.getString("reason"));
                lockData.put("locked_at", rs.getTimestamp("locked_at"));
                lockData.put("locked_by", rs.getString("locked_by"));
                lockData.put("unlocked_at", rs.getTimestamp("unlocked_at"));
                lockData.put("unlocked_by", rs.getString("unlocked_by"));
                lockData.put("is_active", rs.getBoolean("is_active"));
                lockData.put("notes", rs.getString("notes"));
                return lockData;
            };
            
            List<Map<String, Object>> lockInfo = getAuthServiceJdbcTemplate().query(lockSql, lockRowMapper, account.getAccountId());
            
            if (!lockInfo.isEmpty()) {
                Map<String, Object> lock = lockInfo.get(0);
                account.setIsLocked(true);
                account.setLockType((String) lock.get("lock_type"));
                account.setLockReason((String) lock.get("reason"));
                
                java.sql.Timestamp lockedAtTimestamp = (java.sql.Timestamp) lock.get("locked_at");
                account.setLockedAt(lockedAtTimestamp != null ? lockedAtTimestamp.toLocalDateTime() : null);
                
                account.setLockedBy((String) lock.get("locked_by"));
                
                java.sql.Timestamp unlockedAtTimestamp = (java.sql.Timestamp) lock.get("unlocked_at");
                account.setUnlockedAt(unlockedAtTimestamp != null ? unlockedAtTimestamp.toLocalDateTime() : null);
                
                account.setUnlockedBy((String) lock.get("unlocked_by"));
                account.setLockNotes((String) lock.get("notes"));
                
                // Override account status to LOCKED if account is locked
                account.setStatus("LOCKED");
            } else {
                account.setIsLocked(false);
                account.setLockType(null);
                account.setLockReason(null);
                account.setLockedAt(null);
                account.setLockedBy(null);
                account.setUnlockedAt(null);
                account.setUnlockedBy(null);
                account.setLockNotes(null);
                // Keep original status if not locked
            }
        } catch (Exception e) {
            log.warn("Failed to fetch lock status for account ID: {}, error: {}", account.getAccountId(), e.getMessage());
            account.setIsLocked(false);
        }
    }

    public boolean updateAccountStatus(Long accountId, String status) {
        log.info("Updating account status - ID: {}, Status: {}", accountId, status);
        String sql = "UPDATE account SET status = ?, updated_at = ? WHERE account_id = ?";
        int rowsAffected = getTransactionServiceJdbcTemplate().update(sql, status, LocalDateTime.now(), accountId);
        return rowsAffected > 0;
    }

    public boolean updateAccountBalance(Long accountId, BigDecimal balance) {
        log.info("Updating account balance - ID: {}, Balance: {}", accountId, balance);
        String sql = "UPDATE account SET balance = ?, updated_at = ? WHERE account_id = ?";
        int rowsAffected = getTransactionServiceJdbcTemplate().update(sql, balance, LocalDateTime.now(), accountId);
        return rowsAffected > 0;
    }

    public boolean closeAccount(Long accountId) {
        log.info("Closing account - ID: {}", accountId);
        String sql = "UPDATE account SET status = 'CLOSED', closed_date = ?, updated_at = ? WHERE account_id = ?";
        LocalDateTime now = LocalDateTime.now();
        int rowsAffected = getTransactionServiceJdbcTemplate().update(sql, now, now, accountId);
        return rowsAffected > 0;
    }

    public long getTotalAccountsCount() {
        log.info("Getting total accounts count");
        String sql = "SELECT COUNT(*) FROM account";
        return getTransactionServiceJdbcTemplate().queryForObject(sql, Long.class);
    }

    public long getActiveAccountsCount() {
        log.info("Getting active accounts count");
        String sql = "SELECT COUNT(*) FROM account WHERE status = 'ACTIVE'";
        return getTransactionServiceJdbcTemplate().queryForObject(sql, Long.class);
    }

    public BigDecimal getTotalBalance() {
        log.info("Getting total balance across all accounts");
        String sql = "SELECT COALESCE(SUM(balance), 0) FROM account WHERE status = 'ACTIVE'";
        return getTransactionServiceJdbcTemplate().queryForObject(sql, BigDecimal.class);
    }

    public long getLockedAccountsCount() {
        log.info("Getting locked accounts count");
        try {
            String sql = "SELECT COUNT(DISTINCT account_id) FROM lock_account WHERE is_active = 1";
            return getAuthServiceJdbcTemplate().queryForObject(sql, Long.class);
        } catch (Exception e) {
            log.warn("Failed to get locked accounts count: {}", e.getMessage());
            return 0;
        }
    }

    public boolean lockAccount(Long accountId, String reason, String lockedBy, String notes) {
        log.info("Locking account - ID: {}, Reason: {}, LockedBy: {}", accountId, reason, lockedBy);
        try {
            // First check if account exists
            Optional<AccountDto> account = getAccountById(accountId);
            if (account.isEmpty()) {
                log.warn("Account not found for locking: {}", accountId);
                return false;
            }

            // Check if account is already locked
            String checkSql = "SELECT COUNT(*) FROM lock_account WHERE account_id = ? AND is_active = 1";
            Integer lockCount = getAuthServiceJdbcTemplate().queryForObject(checkSql, Integer.class, accountId);
            
            if (lockCount != null && lockCount > 0) {
                log.warn("Account {} is already locked", accountId);
                return false;
            }

            // Insert lock record
            String insertSql = """
                INSERT INTO lock_account (account_id, reason, lock_type, locked_at, locked_by, is_active, notes, username)
                VALUES (?, ?, 'ADMIN_LOCK', ?, ?, 1, ?, '')
                """;
            
            int rowsAffected = getAuthServiceJdbcTemplate().update(insertSql, 
                accountId, reason, LocalDateTime.now(), lockedBy, notes);
            
            // If lock successful, update account status to LOCKED
            if (rowsAffected > 0) {
                String updateStatusSql = "UPDATE account SET status = 'LOCKED', updated_at = ? WHERE account_id = ?";
                getTransactionServiceJdbcTemplate().update(updateStatusSql, LocalDateTime.now(), accountId);
            }
            
            return rowsAffected > 0;
        } catch (Exception e) {
            log.error("Failed to lock account {}: {}", accountId, e.getMessage());
            return false;
        }
    }

    public boolean unlockAccount(Long accountId, String unlockedBy) {
        log.info("Unlocking account - ID: {}, UnlockedBy: {}", accountId, unlockedBy);
        try {
            // Update the active lock record
            String updateSql = """
                UPDATE lock_account 
                SET is_active = 0, unlocked_at = ?, unlocked_by = ?
                WHERE account_id = ? AND is_active = 1
                """;
            
            int rowsAffected = getAuthServiceJdbcTemplate().update(updateSql, 
                LocalDateTime.now(), unlockedBy, accountId);
            
            // If unlock successful, restore account status to ACTIVE (or original status)
            if (rowsAffected > 0) {
                String restoreStatusSql = "UPDATE account SET status = 'ACTIVE', updated_at = ? WHERE account_id = ?";
                getTransactionServiceJdbcTemplate().update(restoreStatusSql, LocalDateTime.now(), accountId);
            }
            
            return rowsAffected > 0;
        } catch (Exception e) {
            log.error("Failed to unlock account {}: {}", accountId, e.getMessage());
            return false;
        }
    }

    public boolean isAccountLocked(Long accountId) {
        try {
            String sql = "SELECT COUNT(*) FROM lock_account WHERE account_id = ? AND is_active = 1";
            Integer count = getAuthServiceJdbcTemplate().queryForObject(sql, Integer.class, accountId);
            return count != null && count > 0;
        } catch (Exception e) {
            log.warn("Failed to check lock status for account {}: {}", accountId, e.getMessage());
            return false;
        }
    }

    public List<AccountDto> searchAccountsByUserName(String userName) {
        log.info("Searching accounts by user name: {}", userName);
        try {
            // Search by full_name, email, phone, and citizenId
            String userSql = """
                SELECT DISTINCT user_id FROM user_info 
                WHERE full_name LIKE ? 
                   OR email LIKE ? 
                   OR phone LIKE ? 
                   OR citizen_id LIKE ?
                """;
            
            String searchPattern = "%" + userName + "%";
            List<Long> userIds = getUserServiceJdbcTemplate().query(userSql, 
                (rs, rowNum) -> rs.getLong("user_id"), 
                searchPattern, searchPattern, searchPattern, searchPattern);
            
            if (userIds.isEmpty()) {
                return List.of();
            }
            
            // Then get accounts for those users
            String placeholders = String.join(",", userIds.stream().map(id -> "?").toArray(String[]::new));
            String accountSql = "SELECT * FROM account WHERE user_id IN (" + placeholders + ") ORDER BY created_at DESC";
            
            List<AccountDto> accounts = getTransactionServiceJdbcTemplate().query(accountSql, 
                accountWithoutUserRowMapper, userIds.toArray());
            
            enrichAccountsWithUserNamesAndLockStatus(accounts);
            return accounts;
        } catch (Exception e) {
            log.warn("Failed to search accounts by user name: {}, error: {}", userName, e.getMessage());
            return List.of();
        }
    }

    public List<AccountDto> searchAccountsByAccountNumber(String accountNumber) {
        log.info("Searching accounts by account number: {}", accountNumber);
        try {
            String sql = "SELECT * FROM account WHERE account_number LIKE ? ORDER BY created_at DESC";
            List<AccountDto> accounts = getTransactionServiceJdbcTemplate().query(sql, 
                accountWithoutUserRowMapper, "%" + accountNumber + "%");
            
            enrichAccountsWithUserNamesAndLockStatus(accounts);
            return accounts;
        } catch (Exception e) {
            log.warn("Failed to search accounts by account number: {}, error: {}", accountNumber, e.getMessage());
            return List.of();
        }
    }

    public List<AccountDto> searchAccounts(String keyword) {
        log.info("Comprehensive search for accounts with keyword: {}", keyword);
        try {
            List<AccountDto> allResults = new ArrayList<>();
            
            // Search by account number
            String accountSql = "SELECT * FROM account WHERE account_number LIKE ? ORDER BY created_at DESC";
            List<AccountDto> accountResults = getTransactionServiceJdbcTemplate().query(accountSql, 
                accountWithoutUserRowMapper, "%" + keyword + "%");
            allResults.addAll(accountResults);
            
            // Search by user information (name, email, phone, citizenId)
            String userSql = """
                SELECT DISTINCT user_id FROM user_info 
                WHERE full_name LIKE ? 
                   OR email LIKE ? 
                   OR phone LIKE ? 
                   OR citizen_id LIKE ?
                """;
            
            String searchPattern = "%" + keyword + "%";
            List<Long> userIds = getUserServiceJdbcTemplate().query(userSql, 
                (rs, rowNum) -> rs.getLong("user_id"), 
                searchPattern, searchPattern, searchPattern, searchPattern);
            
            if (!userIds.isEmpty()) {
                String placeholders = String.join(",", userIds.stream().map(id -> "?").toArray(String[]::new));
                String userAccountSql = "SELECT * FROM account WHERE user_id IN (" + placeholders + ") ORDER BY created_at DESC";
                
                List<AccountDto> userAccountResults = getTransactionServiceJdbcTemplate().query(userAccountSql, 
                    accountWithoutUserRowMapper, userIds.toArray());
                
                // Add only unique accounts (avoid duplicates)
                for (AccountDto account : userAccountResults) {
                    if (allResults.stream().noneMatch(a -> a.getAccountId().equals(account.getAccountId()))) {
                        allResults.add(account);
                    }
                }
            }
            
            // Enrich all results with user names and lock status
            enrichAccountsWithUserNamesAndLockStatus(allResults);
            
            // Sort by created date descending
            allResults.sort((a, b) -> {
                if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
                if (a.getCreatedAt() == null) return 1;
                if (b.getCreatedAt() == null) return -1;
                return b.getCreatedAt().compareTo(a.getCreatedAt());
            });
            
            return allResults;
        } catch (Exception e) {
            log.warn("Failed to search accounts with keyword: {}, error: {}", keyword, e.getMessage());
            return List.of();
        }
    }
}