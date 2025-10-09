package com.ebanking.firebaseService.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UserLookupService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Lấy userId theo username từ database
     * @param username
     * @return userId hoặc null nếu không tìm thấy
     */
    public Long getUserIdByUsername(String username) {
        try {
            String sql = "SELECT id FROM user WHERE username = ?";
            Long userId = jdbcTemplate.queryForObject(sql, Long.class, username);
            log.info("Found userId {} for username {}", userId, username);
            return userId;
        } catch (Exception e) {
            log.error("Error looking up user ID for username {}: {}", username, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy username theo account number
     * Flow: account_number → user_id → username
     * @param accountNumber
     * @return username hoặc null nếu không tìm thấy
     */
    public String getUsernameByAccountNumber(String accountNumber) {
        try {
            // Bước 1: Tìm user_id từ account_number trong bảng account
            String sqlAccount = "SELECT user_id FROM account WHERE account_number = ?";
            Long userId = jdbcTemplate.queryForObject(sqlAccount, Long.class, accountNumber);
            
            if (userId == null) {
                log.warn("No user found for account number: {}", accountNumber);
                return null;
            }
            
            // Bước 2: Tìm username từ user_id trong bảng user
            String sqlUser = "SELECT username FROM user WHERE id = ?";
            String username = jdbcTemplate.queryForObject(sqlUser, String.class, userId);
            
            log.info("Found username {} for account number {}", username, accountNumber);
            return username;
            
        } catch (Exception e) {
            log.error("Error looking up username for account {}: {}", accountNumber, e.getMessage());
            return null;
        }
    }
}
