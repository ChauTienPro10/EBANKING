package com.ebanking.adminTool.service;

import com.ebanking.adminTool.dto.NotificationHistoryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationHistoryService {

    private final Map<String, JdbcTemplate> externalJdbcTemplates;

    private JdbcTemplate getFcmServiceJdbcTemplate() {
        return externalJdbcTemplates.get("DB_FCM_SERVICE");
    }

    // RowMapper for System Notifications
    private final RowMapper<NotificationHistoryDto> systemNotificationRowMapper = new RowMapper<NotificationHistoryDto>() {
        @Override
        public NotificationHistoryDto mapRow(ResultSet rs, int rowNum) throws SQLException {
            return NotificationHistoryDto.builder()
                    .id(rs.getLong("id"))
                    .title(rs.getString("title"))
                    .content(rs.getString("content"))
                    .type("SYSTEM")
                    .createdAt(rs.getLong("created_at"))
                    .build();
        }
    };

    // RowMapper for Personal Notifications
    private final RowMapper<NotificationHistoryDto> personalNotificationRowMapper = new RowMapper<NotificationHistoryDto>() {
        @Override
        public NotificationHistoryDto mapRow(ResultSet rs, int rowNum) throws SQLException {
            return NotificationHistoryDto.builder()
                    .id(rs.getLong("id"))
                    .title(rs.getString("title"))
                    .content(rs.getString("content"))
                    .type("PERSONAL")
                    .username(rs.getString("username"))
                    .createdAt(rs.getLong("created_at"))
                    .build();
        }
    };

    // RowMapper for Transaction Notifications
    private final RowMapper<NotificationHistoryDto> transactionNotificationRowMapper = new RowMapper<NotificationHistoryDto>() {
        @Override
        public NotificationHistoryDto mapRow(ResultSet rs, int rowNum) throws SQLException {
            return NotificationHistoryDto.builder()
                    .id(rs.getLong("id"))
                    .title(rs.getString("title"))
                    .content(rs.getString("content"))
                    .type("TRANSACTION")
                    .username(rs.getString("username"))
                    .sender(rs.getString("sender"))
                    .amount(rs.getString("amount"))
                    .status(rs.getString("status"))
                    .noiDungGiaoDich(rs.getString("noi_dung_giao_dich"))
                    .createdAt(rs.getLong("created_at"))
                    .build();
        }
    };

    public List<NotificationHistoryDto> getAllNotificationHistory(int offset, int limit) {
        log.info("Fetching all notification history - offset: {}, limit: {}", offset, limit);
        List<NotificationHistoryDto> allNotifications = new ArrayList<>();

        try {
            // Get System Notifications
            String systemSql = "SELECT id, title, content, created_at FROM noti_system ORDER BY created_at DESC LIMIT ? OFFSET ?";
            List<NotificationHistoryDto> systemNotifications = getFcmServiceJdbcTemplate().query(
                    systemSql, systemNotificationRowMapper, limit, offset);
            allNotifications.addAll(systemNotifications);

            // Get Personal Notifications
            String personalSql = "SELECT id, title, content, username, created_at FROM personal_noti ORDER BY created_at DESC LIMIT ? OFFSET ?";
            List<NotificationHistoryDto> personalNotifications = getFcmServiceJdbcTemplate().query(
                    personalSql, personalNotificationRowMapper, limit, offset);
            allNotifications.addAll(personalNotifications);

            // Get Transaction Notifications
            String transactionSql = "SELECT id, title, content, username, sender, amount, status, noi_dung_giao_dich, created_at FROM notify_transaction ORDER BY created_at DESC LIMIT ? OFFSET ?";
            List<NotificationHistoryDto> transactionNotifications = getFcmServiceJdbcTemplate().query(
                    transactionSql, transactionNotificationRowMapper, limit, offset);
            allNotifications.addAll(transactionNotifications);

            // Sort all notifications by created_at descending
            allNotifications.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));

            // Return only the requested limit
            return allNotifications.stream().limit(limit).toList();

        } catch (Exception e) {
            log.error("Error fetching notification history: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public List<NotificationHistoryDto> getSystemNotificationHistory(int offset, int limit) {
        log.info("Fetching system notification history - offset: {}, limit: {}", offset, limit);
        try {
            String sql = "SELECT id, title, content, created_at FROM noti_system ORDER BY created_at DESC LIMIT ? OFFSET ?";
            return getFcmServiceJdbcTemplate().query(sql, systemNotificationRowMapper, limit, offset);
        } catch (Exception e) {
            log.error("Error fetching system notification history: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public List<NotificationHistoryDto> getPersonalNotificationHistory(int offset, int limit, String username) {
        log.info("Fetching personal notification history - offset: {}, limit: {}, username: {}", offset, limit, username);
        try {
            String sql;
            List<NotificationHistoryDto> result;
            
            if (username != null && !username.trim().isEmpty()) {
                sql = "SELECT id, title, content, username, created_at FROM personal_noti WHERE username = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
                result = getFcmServiceJdbcTemplate().query(sql, personalNotificationRowMapper, username, limit, offset);
            } else {
                sql = "SELECT id, title, content, username, created_at FROM personal_noti ORDER BY created_at DESC LIMIT ? OFFSET ?";
                result = getFcmServiceJdbcTemplate().query(sql, personalNotificationRowMapper, limit, offset);
            }
            
            return result;
        } catch (Exception e) {
            log.error("Error fetching personal notification history: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public List<NotificationHistoryDto> getTransactionNotificationHistory(int offset, int limit, String username) {
        log.info("Fetching transaction notification history - offset: {}, limit: {}, username: {}", offset, limit, username);
        try {
            String sql;
            List<NotificationHistoryDto> result;
            
            if (username != null && !username.trim().isEmpty()) {
                sql = "SELECT id, title, content, username, sender, amount, status, noi_dung_giao_dich, created_at FROM notify_transaction WHERE username = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
                result = getFcmServiceJdbcTemplate().query(sql, transactionNotificationRowMapper, username, limit, offset);
            } else {
                sql = "SELECT id, title, content, username, sender, amount, status, noi_dung_giao_dich, created_at FROM notify_transaction ORDER BY created_at DESC LIMIT ? OFFSET ?";
                result = getFcmServiceJdbcTemplate().query(sql, transactionNotificationRowMapper, limit, offset);
            }
            
            return result;
        } catch (Exception e) {
            log.error("Error fetching transaction notification history: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public List<NotificationHistoryDto> getNotificationHistoryByDateRange(Long fromDate, Long toDate, String type) {
        log.info("Fetching notification history by date range - from: {}, to: {}, type: {}", fromDate, toDate, type);
        List<NotificationHistoryDto> allNotifications = new ArrayList<>();

        try {
            if (type == null || type.equalsIgnoreCase("SYSTEM") || type.equalsIgnoreCase("ALL")) {
                String systemSql = "SELECT id, title, content, created_at FROM noti_system WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC";
                List<NotificationHistoryDto> systemNotifications = getFcmServiceJdbcTemplate().query(
                        systemSql, systemNotificationRowMapper, fromDate, toDate);
                allNotifications.addAll(systemNotifications);
            }

            if (type == null || type.equalsIgnoreCase("PERSONAL") || type.equalsIgnoreCase("ALL")) {
                String personalSql = "SELECT id, title, content, username, created_at FROM personal_noti WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC";
                List<NotificationHistoryDto> personalNotifications = getFcmServiceJdbcTemplate().query(
                        personalSql, personalNotificationRowMapper, fromDate, toDate);
                allNotifications.addAll(personalNotifications);
            }

            if (type == null || type.equalsIgnoreCase("TRANSACTION") || type.equalsIgnoreCase("ALL")) {
                String transactionSql = "SELECT id, title, content, username, sender, amount, status, noi_dung_giao_dich, created_at FROM notify_transaction WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC";
                List<NotificationHistoryDto> transactionNotifications = getFcmServiceJdbcTemplate().query(
                        transactionSql, transactionNotificationRowMapper, fromDate, toDate);
                allNotifications.addAll(transactionNotifications);
            }

            // Sort all notifications by created_at descending
            allNotifications.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));

            return allNotifications;

        } catch (Exception e) {
            log.error("Error fetching notification history by date range: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public long getTotalNotificationCount() {
        try {
            String systemCountSql = "SELECT COUNT(*) FROM noti_system";
            String personalCountSql = "SELECT COUNT(*) FROM personal_noti";
            String transactionCountSql = "SELECT COUNT(*) FROM notify_transaction";

            Long systemCount = getFcmServiceJdbcTemplate().queryForObject(systemCountSql, Long.class);
            Long personalCount = getFcmServiceJdbcTemplate().queryForObject(personalCountSql, Long.class);
            Long transactionCount = getFcmServiceJdbcTemplate().queryForObject(transactionCountSql, Long.class);

            return (systemCount != null ? systemCount : 0) + 
                   (personalCount != null ? personalCount : 0) + 
                   (transactionCount != null ? transactionCount : 0);
        } catch (Exception e) {
            log.error("Error getting total notification count: {}", e.getMessage(), e);
            return 0;
        }
    }

    public List<NotificationHistoryDto> searchNotifications(String title, Long fromDate, Long toDate, String type, String username, int offset, int limit) {
        log.info("Searching notifications - title: {}, fromDate: {}, toDate: {}, type: {}, username: {}, offset: {}, limit: {}", 
                title, fromDate, toDate, type, username, offset, limit);
        
        List<NotificationHistoryDto> allNotifications = new ArrayList<>();

        try {
            // Build dynamic WHERE clause
            StringBuilder whereClause = new StringBuilder(" WHERE 1=1 ");
            List<Object> params = new ArrayList<>();

            // Add title filter if provided
            if (title != null && !title.trim().isEmpty()) {
                whereClause.append(" AND title LIKE ? ");
                params.add("%" + title.trim() + "%");
            }

            // Add date range filter if provided
            if (fromDate != null && toDate != null) {
                whereClause.append(" AND created_at BETWEEN ? AND ? ");
                params.add(fromDate);
                params.add(toDate);
            } else if (fromDate != null) {
                whereClause.append(" AND created_at >= ? ");
                params.add(fromDate);
            } else if (toDate != null) {
                whereClause.append(" AND created_at <= ? ");
                params.add(toDate);
            }

            // Search in System Notifications
            if (type == null || type.equalsIgnoreCase("SYSTEM") || type.equalsIgnoreCase("ALL")) {
                String systemSql = "SELECT id, title, content, created_at FROM noti_system" + whereClause + " ORDER BY created_at DESC";
                List<Object> systemParams = new ArrayList<>(params);
                
                List<NotificationHistoryDto> systemNotifications = getFcmServiceJdbcTemplate().query(
                        systemSql, systemNotificationRowMapper, systemParams.toArray());
                allNotifications.addAll(systemNotifications);
            }

            // Search in Personal Notifications
            if (type == null || type.equalsIgnoreCase("PERSONAL") || type.equalsIgnoreCase("ALL")) {
                StringBuilder personalWhereClause = new StringBuilder(whereClause);
                List<Object> personalParams = new ArrayList<>(params);
                
                // Add username filter for personal notifications
                if (username != null && !username.trim().isEmpty()) {
                    personalWhereClause.append(" AND username = ? ");
                    personalParams.add(username.trim());
                }
                
                String personalSql = "SELECT id, title, content, username, created_at FROM personal_noti" + personalWhereClause + " ORDER BY created_at DESC";
                List<NotificationHistoryDto> personalNotifications = getFcmServiceJdbcTemplate().query(
                        personalSql, personalNotificationRowMapper, personalParams.toArray());
                allNotifications.addAll(personalNotifications);
            }

            // Search in Transaction Notifications
            if (type == null || type.equalsIgnoreCase("TRANSACTION") || type.equalsIgnoreCase("ALL")) {
                StringBuilder transactionWhereClause = new StringBuilder(whereClause);
                List<Object> transactionParams = new ArrayList<>(params);
                
                // Add username filter for transaction notifications
                if (username != null && !username.trim().isEmpty()) {
                    transactionWhereClause.append(" AND username = ? ");
                    transactionParams.add(username.trim());
                }
                
                String transactionSql = "SELECT id, title, content, username, sender, amount, status, noi_dung_giao_dich, created_at FROM notify_transaction" + transactionWhereClause + " ORDER BY created_at DESC";
                List<NotificationHistoryDto> transactionNotifications = getFcmServiceJdbcTemplate().query(
                        transactionSql, transactionNotificationRowMapper, transactionParams.toArray());
                allNotifications.addAll(transactionNotifications);
            }

            // Sort all notifications by created_at descending
            allNotifications.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));

            // Apply pagination
            int startIndex = offset;
            int endIndex = Math.min(startIndex + limit, allNotifications.size());
            
            if (startIndex >= allNotifications.size()) {
                return new ArrayList<>();
            }
            
            return allNotifications.subList(startIndex, endIndex);

        } catch (Exception e) {
            log.error("Error searching notifications: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    public long getSearchNotificationCount(String title, Long fromDate, Long toDate, String type, String username) {
        log.info("Getting search notification count - title: {}, fromDate: {}, toDate: {}, type: {}, username: {}", 
                title, fromDate, toDate, type, username);
        
        long totalCount = 0;

        try {
            // Build dynamic WHERE clause
            StringBuilder whereClause = new StringBuilder(" WHERE 1=1 ");
            List<Object> params = new ArrayList<>();

            // Add title filter if provided
            if (title != null && !title.trim().isEmpty()) {
                whereClause.append(" AND title LIKE ? ");
                params.add("%" + title.trim() + "%");
            }

            // Add date range filter if provided
            if (fromDate != null && toDate != null) {
                whereClause.append(" AND created_at BETWEEN ? AND ? ");
                params.add(fromDate);
                params.add(toDate);
            } else if (fromDate != null) {
                whereClause.append(" AND created_at >= ? ");
                params.add(fromDate);
            } else if (toDate != null) {
                whereClause.append(" AND created_at <= ? ");
                params.add(toDate);
            }

            // Count System Notifications
            if (type == null || type.equalsIgnoreCase("SYSTEM") || type.equalsIgnoreCase("ALL")) {
                String systemCountSql = "SELECT COUNT(*) FROM noti_system" + whereClause;
                Long systemCount = getFcmServiceJdbcTemplate().queryForObject(systemCountSql, Long.class, params.toArray());
                totalCount += (systemCount != null ? systemCount : 0);
            }

            // Count Personal Notifications
            if (type == null || type.equalsIgnoreCase("PERSONAL") || type.equalsIgnoreCase("ALL")) {
                StringBuilder personalWhereClause = new StringBuilder(whereClause);
                List<Object> personalParams = new ArrayList<>(params);
                
                if (username != null && !username.trim().isEmpty()) {
                    personalWhereClause.append(" AND username = ? ");
                    personalParams.add(username.trim());
                }
                
                String personalCountSql = "SELECT COUNT(*) FROM personal_noti" + personalWhereClause;
                Long personalCount = getFcmServiceJdbcTemplate().queryForObject(personalCountSql, Long.class, personalParams.toArray());
                totalCount += (personalCount != null ? personalCount : 0);
            }

            // Count Transaction Notifications
            if (type == null || type.equalsIgnoreCase("TRANSACTION") || type.equalsIgnoreCase("ALL")) {
                StringBuilder transactionWhereClause = new StringBuilder(whereClause);
                List<Object> transactionParams = new ArrayList<>(params);
                
                if (username != null && !username.trim().isEmpty()) {
                    transactionWhereClause.append(" AND username = ? ");
                    transactionParams.add(username.trim());
                }
                
                String transactionCountSql = "SELECT COUNT(*) FROM notify_transaction" + transactionWhereClause;
                Long transactionCount = getFcmServiceJdbcTemplate().queryForObject(transactionCountSql, Long.class, transactionParams.toArray());
                totalCount += (transactionCount != null ? transactionCount : 0);
            }

            return totalCount;

        } catch (Exception e) {
            log.error("Error getting search notification count: {}", e.getMessage(), e);
            return 0;
        }
    }
}