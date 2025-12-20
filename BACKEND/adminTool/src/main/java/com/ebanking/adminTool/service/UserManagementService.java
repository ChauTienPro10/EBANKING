package com.ebanking.adminTool.service;

import com.ebanking.adminTool.dto.UserInfoDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserManagementService {

    private final Map<String, JdbcTemplate> externalJdbcTemplates;

    @Autowired
    public UserManagementService(Map<String, JdbcTemplate> externalJdbcTemplates) {
        this.externalJdbcTemplates = externalJdbcTemplates;
    }

    public List<UserInfoDto> getAllUsers() {
        JdbcTemplate userServiceJdbc = externalJdbcTemplates.get("DB_USER_SERVICE");
        
        if (userServiceJdbc == null) {
            throw new RuntimeException("DB_USER_SERVICE connection not found");
        }

        String sql = """
            SELECT 
                ui.id,
                ui.full_name,
                ui.citizen_id,
                ui.birthday,
                ui.email,
                ui.phone,
                ui.is_male,
                ui.address,
                ui.create_at,
                ui.updated_at,
                ui.ekyc_session_id,
                ui.ekyc_status,
                ui.ekyc_verified_at,
                ui.avatar_path,
                ui.face_auth_enabled,
                ui.daily_transaction_limit,
                u.id as user_id,
                u.username
            FROM user_info ui
            LEFT JOIN user u ON ui.user_id = u.id
            ORDER BY ui.create_at DESC
            """;

        return userServiceJdbc.query(sql, new UserInfoRowMapper());
    }

    public UserInfoDto getUserById(Long id) {
        JdbcTemplate userServiceJdbc = externalJdbcTemplates.get("DB_USER_SERVICE");
        
        if (userServiceJdbc == null) {
            throw new RuntimeException("DB_USER_SERVICE connection not found");
        }

        String sql = """
            SELECT 
                ui.id,
                ui.full_name,
                ui.citizen_id,
                ui.birthday,
                ui.email,
                ui.phone,
                ui.is_male,
                ui.address,
                ui.create_at,
                ui.updated_at,
                ui.ekyc_session_id,
                ui.ekyc_status,
                ui.ekyc_verified_at,
                ui.avatar_path,
                ui.face_auth_enabled,
                ui.daily_transaction_limit,
                u.id as user_id,
                u.username
            FROM user_info ui
            LEFT JOIN user u ON ui.user_id = u.id
            WHERE ui.id = ?
            """;

        List<UserInfoDto> users = userServiceJdbc.query(sql, new UserInfoRowMapper(), id);
        return users.isEmpty() ? null : users.get(0);
    }

    public List<UserInfoDto> searchUsersByName(String name) {
        JdbcTemplate userServiceJdbc = externalJdbcTemplates.get("DB_USER_SERVICE");
        
        if (userServiceJdbc == null) {
            throw new RuntimeException("DB_USER_SERVICE connection not found");
        }

        String sql = """
            SELECT 
                ui.id,
                ui.full_name,
                ui.citizen_id,
                ui.birthday,
                ui.email,
                ui.phone,
                ui.is_male,
                ui.address,
                ui.create_at,
                ui.updated_at,
                ui.ekyc_session_id,
                ui.ekyc_status,
                ui.ekyc_verified_at,
                ui.avatar_path,
                ui.face_auth_enabled,
                ui.daily_transaction_limit,
                u.id as user_id,
                u.username
            FROM user_info ui
            LEFT JOIN user u ON ui.user_id = u.id
            WHERE ui.full_name LIKE ? OR u.username LIKE ?
            ORDER BY ui.create_at DESC
            """;

        String searchPattern = "%" + name + "%";
        return userServiceJdbc.query(sql, new UserInfoRowMapper(), searchPattern, searchPattern);
    }

    public List<UserInfoDto> getUsersPaginated(int page, int size) {
        JdbcTemplate userServiceJdbc = externalJdbcTemplates.get("DB_USER_SERVICE");
        
        if (userServiceJdbc == null) {
            throw new RuntimeException("DB_USER_SERVICE connection not found");
        }

        int offset = page * size;
        
        String sql = """
            SELECT 
                ui.id,
                ui.full_name,
                ui.citizen_id,
                ui.birthday,
                ui.email,
                ui.phone,
                ui.is_male,
                ui.address,
                ui.create_at,
                ui.updated_at,
                ui.ekyc_session_id,
                ui.ekyc_status,
                ui.ekyc_verified_at,
                ui.avatar_path,
                ui.face_auth_enabled,
                ui.daily_transaction_limit,
                u.id as user_id,
                u.username
            FROM user_info ui
            LEFT JOIN user u ON ui.user_id = u.id
            ORDER BY ui.create_at DESC
            LIMIT ? OFFSET ?
            """;

        return userServiceJdbc.query(sql, new UserInfoRowMapper(), size, offset);
    }

    public long getTotalUserCount() {
        JdbcTemplate userServiceJdbc = externalJdbcTemplates.get("DB_USER_SERVICE");
        
        if (userServiceJdbc == null) {
            throw new RuntimeException("DB_USER_SERVICE connection not found");
        }

        String sql = "SELECT COUNT(*) FROM user_info";
        return userServiceJdbc.queryForObject(sql, Long.class);
    }

    private static class UserInfoRowMapper implements RowMapper<UserInfoDto> {
        @Override
        public UserInfoDto mapRow(ResultSet rs, int rowNum) throws SQLException {
            UserInfoDto dto = new UserInfoDto();
            dto.setId(rs.getLong("id"));
            dto.setFullName(rs.getString("full_name"));
            dto.setCitizenId(rs.getString("citizen_id"));
            dto.setBirthday(rs.getLong("birthday"));
            dto.setEmail(rs.getString("email"));
            dto.setPhone(rs.getString("phone"));
            dto.setIsMale(rs.getBoolean("is_male"));
            dto.setAddress(rs.getString("address"));
            dto.setCreateAt(rs.getLong("create_at"));
            dto.setUpdatedAt(rs.getLong("updated_at"));
            
            // Handle UUID
            String ekycSessionIdStr = rs.getString("ekyc_session_id");
            if (ekycSessionIdStr != null) {
                dto.setEkycSessionId(UUID.fromString(ekycSessionIdStr));
            }
            
            dto.setEkycStatus(rs.getString("ekyc_status"));
            
            // Handle LocalDateTime
            Timestamp ekycVerifiedAtTs = rs.getTimestamp("ekyc_verified_at");
            if (ekycVerifiedAtTs != null) {
                dto.setEkycVerifiedAt(ekycVerifiedAtTs.toLocalDateTime());
            }
            
            dto.setAvatarPath(rs.getString("avatar_path"));
            dto.setFaceAuthEnabled(rs.getBoolean("face_auth_enabled"));
            
            // Handle BigDecimal
            BigDecimal dailyLimit = rs.getBigDecimal("daily_transaction_limit");
            dto.setDailyTransactionLimit(dailyLimit);
            
            // User information
            dto.setUserId(rs.getLong("user_id"));
            dto.setUsername(rs.getString("username"));
            
            return dto;
        }
    }
}