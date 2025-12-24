package com.ebanking.chatbotService.service;

import com.ebanking.chatbotService.entity.Role;
import com.ebanking.chatbotService.entity.User;
import com.ebanking.chatbotService.entity.UserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service để truy vấn thông tin user từ DB_USER_SERVICE
 */
@Service
@Slf4j
public class UserService {

    private final JdbcTemplate userServiceJdbcTemplate;


    public UserService(Map<String, JdbcTemplate> externalJdbcTemplates) {
        log.info("Initializing UserService with external JdbcTemplates: {}", 
                 externalJdbcTemplates != null ? externalJdbcTemplates.keySet() : "null");
        
        if (externalJdbcTemplates == null) {
            throw new IllegalStateException("externalJdbcTemplates map is null. Check ExternalDbConfig configuration.");
        }
        
        this.userServiceJdbcTemplate = externalJdbcTemplates.get("DB_USER_SERVICE");
        
        if (this.userServiceJdbcTemplate == null) {
            throw new IllegalStateException("DB_USER_SERVICE JdbcTemplate not found in externalJdbcTemplates. Available keys: " 
                                          + externalJdbcTemplates.keySet());
        }
        
        log.info("UserService initialized successfully with DB_USER_SERVICE JdbcTemplate");
    }

    /**
     * Lấy userId từ username
     */
    public Long getUserIdByUsername(String username) {
        try {
            String sql = "SELECT id FROM user WHERE username = ?";
            
            return userServiceJdbcTemplate.queryForObject(sql, Long.class, username);
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy userId từ username {}: {}", username, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy thông tin user cơ bản từ username
     */
    public User getUserByUsername(String username) {
        try {
            String sql = "SELECT u.id, u.username, u.password, u.create_at, u.updated_at " +
                        "FROM user u " +
                        "WHERE u.username = ?";
            
            User user = userServiceJdbcTemplate.queryForObject(sql, new UserRowMapper(), username);
            
            if (user != null) {
                // Lấy roles của user (có thể fail nếu bảng không tồn tại)
                user.setRoles(getUserRoles(user.getId()));
                // Lấy user info
                user.setUserInfo(getUserInfo(user.getId()));
            }
            
            return user;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin user từ username {}: {}", username, e.getMessage());
            return null;
        }
    }

    /**
     * get thong tin user Id
     */
    public Long getUserId(String username) {
        User user = getFullUserInfoByUsername(username);
        return user != null ? user.getId() : null;
    }

    /**
     * Lấy full thông tin user bao gồm UserInfo từ username
     */
    public User getFullUserInfoByUsername(String username) {
        try {
            String sql = "SELECT " +
                        "u.id, u.username, u.password, u.create_at, u.updated_at, " +
                        "ui.id as info_id, ui.full_name, ui.citizen_id, ui.birthday, " +
                        "ui.email, ui.phone, ui.is_male, ui.address, " +
                        "ui.create_at as info_create_at, ui.updated_at as info_updated_at, " +
                        "ui.ekyc_session_id, ui.ekyc_status, ui.ekyc_verified_at, " +
                        "ui.avatar_path, ui.face_auth_enabled, ui.daily_transaction_limit " +
                        "FROM user u " +
                        "LEFT JOIN user_info ui ON u.id = ui.user_id " +
                        "WHERE u.username = ?";
            
            User user = userServiceJdbcTemplate.queryForObject(sql, new FullUserRowMapper(), username);
            
//            if (user != null) {
//                // Lấy roles của user
//                user.setRoles(getUserRoles(user.getId()));
//            }
            
            return user;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy full thông tin user từ username {}: {}", username, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy UserInfo từ userId
     */
    public UserInfo getUserInfo(Long userId) {
        try {
            String sql = "SELECT ui.id, ui.full_name, ui.citizen_id, ui.birthday, " +
                        "ui.email, ui.phone, ui.is_male, ui.address, " +
                        "ui.create_at, ui.updated_at, ui.user_id, " +
                        "ui.ekyc_session_id, ui.ekyc_status, ui.ekyc_verified_at, " +
                        "ui.avatar_path, ui.face_auth_enabled, ui.daily_transaction_limit " +
                        "FROM user_info ui " +
                        "WHERE ui.user_id = ?";
            
            return userServiceJdbcTemplate.queryForObject(sql, new UserInfoRowMapper(), userId);
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy UserInfo từ userId {}: {}", userId, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy roles của user
     */
    private Set<Role> getUserRoles(Long userId) {
        try {
            String sql = "SELECT r.id, r.name, r.description " +
                        "FROM role r " +
                        "INNER JOIN user_roles ur ON r.id = ur.role_id " +
                        "WHERE ur.user_id = ?";
            
            log.debug("Executing SQL for getUserRoles: {} with userId: {}", sql, userId);
            
            List<Role> roles = userServiceJdbcTemplate.query(sql, new RoleRowMapper(), userId);
            log.debug("Found {} roles for user {}", roles.size(), userId);
            
            return new HashSet<>(roles);
            
        } catch (org.springframework.dao.DataAccessException e) {
            // Có thể bảng không tồn tại hoặc tên bảng khác
            log.warn("Không thể lấy roles cho user {}: {}. Có thể bảng 'role' hoặc 'user_roles' không tồn tại.", 
                     userId, e.getMessage());
            
            // Thử với tên bảng 'roles' (số nhiều)
            try {
                String altSql = "SELECT r.id, r.name, r.description " +
                               "FROM roles r " +
                               "INNER JOIN user_roles ur ON r.id = ur.role_id " +
                               "WHERE ur.user_id = ?";
                
                log.debug("Trying alternative SQL with 'roles' table: {}", altSql);
                List<Role> roles = userServiceJdbcTemplate.query(altSql, new RoleRowMapper(), userId);
                log.debug("Found {} roles for user {} using 'roles' table", roles.size(), userId);
                return new HashSet<>(roles);
                
            } catch (Exception altEx) {
                log.warn("Alternative query also failed: {}. Returning empty roles.", altEx.getMessage());
                return new HashSet<>();
            }
            
        } catch (Exception e) {
            log.error("Lỗi không xác định khi lấy roles của user {}: {}", userId, e.getMessage());
            log.debug("Full exception: ", e);
            return new HashSet<>();
        }
    }

    /**
     * Kiểm tra user có tồn tại không
     */
    public boolean isUserExists(String username) {
        try {
            String sql = "SELECT COUNT(*) FROM user WHERE username = ?";
            Integer count = userServiceJdbcTemplate.queryForObject(sql, Integer.class, username);
            return count != null && count > 0;
            
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra user tồn tại {}: {}", username, e.getMessage());
            return false;
        }
    }

    /**
     * Lấy thông tin user để hiển thị cho chatbot (không bao gồm password)
     */
    public String getUserDisplayInfo(String username) {
        try {
            User user = getFullUserInfoByUsername(username);
            
            if (user == null) {
                return "Không tìm thấy thông tin người dùng: " + username;
            }

            StringBuilder info = new StringBuilder();
            info.append("Thông tin tài khoản:\n");
            info.append("- Tên đăng nhập: ").append(user.getUsername()).append("\n");
            
            if (user.getUserInfo() != null) {
                UserInfo userInfo = user.getUserInfo();
                info.append("- Họ tên: ").append(userInfo.getFullName() != null ? userInfo.getFullName() : "Chưa cập nhật").append("\n");
                info.append("- Email: ").append(userInfo.getEmail() != null ? userInfo.getEmail() : "Chưa cập nhật").append("\n");
                info.append("- Số điện thoại: ").append(userInfo.getPhone() != null ? userInfo.getPhone() : "Chưa cập nhật").append("\n");
                info.append("- Trạng thái eKYC: ").append(userInfo.getEkycStatus() != null ? userInfo.getEkycStatus() : "NOT_VERIFIED").append("\n");
                
                if (userInfo.getDailyTransactionLimit() != null) {
                    info.append("- Hạn mức giao dịch hàng ngày: ").append(String.format("%,.0f VNĐ", userInfo.getDailyTransactionLimit())).append("\n");
                }
            }
            
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                info.append("- Vai trò: ");
                user.getRoles().forEach(role -> info.append(role.getName()).append(" "));
                info.append("\n");
            }
            
            return info.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin hiển thị user {}: {}", username, e.getMessage());
            return "Không thể lấy thông tin người dùng lúc này.";
        }
    }
    
    /**
     * Lấy số dư tài khoản thanh toán
     * Note: Phương thức này trả về thông báo vì cần truy vấn từ DB_TRANSACTION_SERVICE
     * Trong thực tế, cần inject thêm JdbcTemplate cho DB_TRANSACTION_SERVICE
     */
    public String getBalanceAccountPay(String username) {
        try {
            Long userId = getUserId(username);
            if (userId == null) {
                return "Không tìm thấy thông tin người dùng.";
            }
            
            // Trả về thông báo hướng dẫn
            // Trong thực tế, cần query từ payment_account table trong DB_TRANSACTION_SERVICE
            return "💳 Để xem số dư tài khoản thanh toán, vui lòng truy cập ứng dụng di động hoặc liên hệ hotline 1900-xxxx.\n\n" +
                   "📱 Hoặc bạn có thể hỏi tôi về:\n" +
                   "- Lãi suất tiết kiệm\n" +
                   "- Tài khoản tiết kiệm của bạn\n" +
                   "- Tính toán lãi suất dự kiến";
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy số dư tài khoản thanh toán cho user {}: {}", username, e.getMessage());
            return "Không thể lấy thông tin số dư lúc này.";
        }
    }

    // Row Mappers
    private static class UserRowMapper implements RowMapper<User> {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            User user = new User();
            user.setId(rs.getLong("id"));
            user.setUsername(rs.getString("username"));
            user.setPassword(rs.getString("password"));
            user.setCreateAt(rs.getLong("create_at"));
            user.setUpdatedAt(rs.getLong("updated_at"));
            return user;
        }
    }

    private static class FullUserRowMapper implements RowMapper<User> {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            User user = new User();
            user.setId(rs.getLong("id"));
            user.setUsername(rs.getString("username"));
            user.setPassword(rs.getString("password"));
            user.setCreateAt(rs.getLong("create_at"));
            user.setUpdatedAt(rs.getLong("updated_at"));

            // Map UserInfo nếu có
            Long infoId = rs.getLong("info_id");
            if (!rs.wasNull()) {
                UserInfo userInfo = new UserInfo();
                userInfo.setId(infoId);
                userInfo.setFullName(rs.getString("full_name"));
                userInfo.setCitizenId(rs.getString("citizen_id"));
                userInfo.setBirthday(rs.getLong("birthday"));
                userInfo.setEmail(rs.getString("email"));
                userInfo.setPhone(rs.getString("phone"));
                userInfo.setIsMale(rs.getBoolean("is_male"));
                userInfo.setAddress(rs.getString("address"));
                userInfo.setCreateAt(rs.getLong("info_create_at"));
                userInfo.setUpdatedAt(rs.getLong("info_updated_at"));
                
                // Handle UUID - Skip if binary format
                try {
                    String ekycSessionIdStr = rs.getString("ekyc_session_id");
                    if (ekycSessionIdStr != null && !ekycSessionIdStr.isEmpty()) {
                        userInfo.setEkycSessionId(UUID.fromString(ekycSessionIdStr));
                    }
                } catch (Exception e) {
                    // UUID is in binary format, skip it for chatbot purposes
                    log.debug("Skipping binary UUID for user info: {}", e.getMessage());
                }
                
                userInfo.setEkycStatus(rs.getString("ekyc_status"));
                
                // Handle LocalDateTime - ekyc_verified_at might be LONG or TIMESTAMP
                try {
                    java.sql.Timestamp ekycVerifiedAt = rs.getTimestamp("ekyc_verified_at");
                    if (ekycVerifiedAt != null) {
                        userInfo.setEkycVerifiedAt(ekycVerifiedAt.toLocalDateTime());
                    }
                } catch (Exception e) {
                    // If it's stored as LONG, skip it for chatbot purposes
                    log.debug("Skipping ekyc_verified_at conversion: {}", e.getMessage());
                }
                
                userInfo.setAvatarPath(rs.getString("avatar_path"));
                userInfo.setFaceAuthEnabled(rs.getBoolean("face_auth_enabled"));
                
                BigDecimal dailyLimit = rs.getBigDecimal("daily_transaction_limit");
                userInfo.setDailyTransactionLimit(dailyLimit);
                
                // Set reference back to user
                userInfo.setUser(user);
                
                user.setUserInfo(userInfo);
            }

            return user;
        }
    }

    private static class UserInfoRowMapper implements RowMapper<UserInfo> {
        @Override
        public UserInfo mapRow(ResultSet rs, int rowNum) throws SQLException {
            UserInfo userInfo = new UserInfo();
            userInfo.setId(rs.getLong("id"));
            userInfo.setFullName(rs.getString("full_name"));
            userInfo.setCitizenId(rs.getString("citizen_id"));
            userInfo.setBirthday(rs.getLong("birthday"));
            userInfo.setEmail(rs.getString("email"));
            userInfo.setPhone(rs.getString("phone"));
            userInfo.setIsMale(rs.getBoolean("is_male"));
            userInfo.setAddress(rs.getString("address"));
            userInfo.setCreateAt(rs.getLong("create_at"));
            userInfo.setUpdatedAt(rs.getLong("updated_at"));
            
            // Handle UUID - Skip if binary format
            try {
                String ekycSessionIdStr = rs.getString("ekyc_session_id");
                if (ekycSessionIdStr != null && !ekycSessionIdStr.isEmpty()) {
                    userInfo.setEkycSessionId(UUID.fromString(ekycSessionIdStr));
                }
            } catch (Exception e) {
                // UUID is in binary format, skip it for chatbot purposes
                log.debug("Skipping binary UUID for user info: {}", e.getMessage());
            }
            
            userInfo.setEkycStatus(rs.getString("ekyc_status"));
            
            // Handle LocalDateTime - ekyc_verified_at might be LONG or TIMESTAMP
            try {
                java.sql.Timestamp ekycVerifiedAt = rs.getTimestamp("ekyc_verified_at");
                if (ekycVerifiedAt != null) {
                    userInfo.setEkycVerifiedAt(ekycVerifiedAt.toLocalDateTime());
                }
            } catch (Exception e) {
                // If it's stored as LONG, skip it for chatbot purposes
                log.debug("Skipping ekyc_verified_at conversion: {}", e.getMessage());
            }
            
            userInfo.setAvatarPath(rs.getString("avatar_path"));
            userInfo.setFaceAuthEnabled(rs.getBoolean("face_auth_enabled"));
            
            BigDecimal dailyLimit = rs.getBigDecimal("daily_transaction_limit");
            userInfo.setDailyTransactionLimit(dailyLimit);
            
            return userInfo;
        }
    }

    private static class RoleRowMapper implements RowMapper<Role> {
        @Override
        public Role mapRow(ResultSet rs, int rowNum) throws SQLException {
            Role role = new Role();
            role.setId(rs.getLong("id"));
            role.setName(rs.getString("name"));
            role.setDescription(rs.getString("description"));
            return role;
        }
    }
}