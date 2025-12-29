package com.ebanking.firebaseService.service;

import com.ebanking.firebaseService.client.AccountLookupClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

//service cho user lookup
@Service
@Slf4j
public class UserLookupService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private AccountLookupClient accountLookupClient;

    @Value("${user.service.host:3.85.17.154}")
    private String userServiceHost;

    @Value("${user.service.rest.port:8001}")
    private int userServicePort;

    private final RestTemplate restTemplate;

    public UserLookupService() {
        this.restTemplate = new RestTemplate();
    }

    @Cacheable(value = "userIdCache", key = "#username", unless = "#result.isEmpty()")
    public Optional<Long> getUserIdByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            log.warn("Username is null or empty");
            return Optional.empty();
        }

        try {
            String sql = "SELECT id FROM user WHERE username = ?";
            Long userId = jdbcTemplate.queryForObject(sql, Long.class, username);
            log.debug("Found userId {} for username {} via database", userId, username);
            return Optional.ofNullable(userId);
        } catch (EmptyResultDataAccessException e) {
            log.debug("User {} not found in database, trying UserService API", username);
        } catch (Exception e) {
            log.warn("Database error for username {}, trying UserService API: {}", username, e.getMessage());
        }

        try {
            String url = String.format("http://%s:%d/api/users/username/%s/id",
                    userServiceHost, userServicePort, username);

            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> response = restTemplate.getForObject(url, java.util.Map.class);

            if (response != null && response.containsKey("userId")) {
                Long userId = ((Number) response.get("userId")).longValue();
                log.info("Found userId {} for username {} via UserService API", userId, username);
                return Optional.of(userId);
            }
        } catch (Exception e) {
            log.error("UserService API error for username {}: {}", username, e.getMessage());
        }

        log.warn("No userId found for username: {}", username);
        return Optional.empty();
    }

    @Cacheable(value = "usernameCache", key = "#accountNumber", unless = "#result.isEmpty()")
    public Optional<String> getUsernameByAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.trim().isEmpty()) {
            log.warn("Account number is null or empty");
            return Optional.empty();
        }

        try {
            String sql = "SELECT u.username FROM account a " +
                    "JOIN user u ON a.user_id = u.id " +
                    "WHERE a.account_number = ?";

            String username = jdbcTemplate.queryForObject(sql, String.class, accountNumber);
            log.info("Found username {} for account {} via database JOIN", username, accountNumber);
            return Optional.ofNullable(username);

        } catch (EmptyResultDataAccessException e) {
            log.debug("Account {} not found in database, trying service APIs", accountNumber);
        } catch (Exception e) {
            log.warn("Database error for account {}, trying service APIs: {}", accountNumber, e.getMessage());
        }

        Optional<Long> userIdOpt = accountLookupClient.getUserIdByAccountNumber(accountNumber);

        if (userIdOpt.isPresent()) {
            Long userId = userIdOpt.get();

            try {
                String url = String.format("http://%s:%d/api/users/%d/username",
                        userServiceHost, userServicePort, userId);

                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> response = restTemplate.getForObject(url, java.util.Map.class);

                if (response != null && response.containsKey("username")) {
                    String username = (String) response.get("username");
                    log.info("Found username {} for account {} via service APIs", username, accountNumber);
                    return Optional.of(username);
                }
            } catch (Exception e) {
                log.error("UserService API error for userId {}: {}", userId, e.getMessage());
            }
        }

        log.warn("No username found for account number: {}", accountNumber);
        return Optional.empty();
    }

    @Cacheable(value = "userAccountCache", key = "#accountNumber", unless = "#result.isEmpty()")
    public Optional<UserAccountInfo> getUserInfoByAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.trim().isEmpty()) {
            return Optional.empty();
        }

        try {
            String sql = "SELECT u.id as user_id, u.username, ui.full_name, ui.email, ui.phone " +
                    "FROM account a " +
                    "JOIN user u ON a.user_id = u.id " +
                    "LEFT JOIN user_info ui ON u.info_id = ui.id " +
                    "WHERE a.account_number = ?";

            UserAccountInfo info = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> UserAccountInfo.builder()
                    .userId(rs.getLong("user_id"))
                    .username(rs.getString("username"))
                    .fullName(rs.getString("full_name"))
                    .email(rs.getString("email"))
                    .phone(rs.getString("phone"))
                    .accountNumber(accountNumber)
                    .build());

            log.info("Found user info for account {}: {}", accountNumber, info.getUsername());
            return Optional.ofNullable(info);
        } catch (EmptyResultDataAccessException e) {
            log.warn("No user info found for account: {}", accountNumber);
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error looking up user info for account {}: {}", accountNumber, e.getMessage(), e);
            return Optional.empty();
        }
    }

    @lombok.Data
    @lombok.Builder
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class UserAccountInfo {
        private Long userId;
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private String accountNumber;
    }
}
