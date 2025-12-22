package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.dto.NotiSystemDTO;
import com.ebanking.adminTool.dto.NotiTransactionDTO;
import com.ebanking.adminTool.dto.NotificationHistoryDto;
import com.ebanking.adminTool.dto.PushNotiRequest;
import com.ebanking.adminTool.dto.SaveTokenDTO;
import com.ebanking.adminTool.service.FirebaseNotificationService;
import com.ebanking.adminTool.service.NotificationHistoryService;
import com.ebanking.adminTool.utils.AuditAction;
import com.ebanking.adminTool.utils.AuditLogger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/notification")
public class NotiManagerment {

    @Autowired
    private FirebaseNotificationService firebaseNotificationService;

    @Autowired
    private NotificationHistoryService notificationHistoryService;

    @Autowired
    private AuditLogger auditLogger;

    /**
     * cai này không cần quan tâm, gen trong app người dùng
     * Save FCM token for a user
     * POST /notification/save-token
     */
    @PostMapping("/save-token")
    public ResponseEntity<Map<String, Object>> saveToken(@RequestBody SaveTokenDTO saveTokenDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean result = firebaseNotificationService.saveToken(saveTokenDTO);
            response.put("success", result);
            response.put("message", result ? "Token saved successfully" : "Failed to save token");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in saveToken endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Cái này cũng không cần quan tâm
     * Update FCM token
     * POST /notification/update-token
     */
    @PostMapping("/update-token")
    public ResponseEntity<Map<String, Object>> updateToken(@RequestBody SaveTokenDTO saveTokenDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean result = firebaseNotificationService.updateFcmToken(saveTokenDTO);
            response.put("success", result);
            response.put("message", result ? "Token updated successfully" : "Failed to update token");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in updateToken endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Push cho tất cả người dùng
     * Push notification to all users
     * POST /notification/push-all
     */
    @PostMapping("/push-all")
    public ResponseEntity<Map<String, Object>> pushNotificationToAll(
            @RequestBody PushNotiRequest request,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            firebaseNotificationService.pushNotificationToAll(request);
            response.put("success", true);
            response.put("message", "Notification sent to all users successfully");

            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logSuccess(
                    admin,
                    AuditAction.PUSH_NOTIFICATION,
                    "NOTIFICATION",
                    null,
                    "PUSH_ALL title=" + request.getTitle(),
                    null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in pushNotificationToAll endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());

            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logFailure(
                    admin,
                    AuditAction.PUSH_NOTIFICATION,
                    "NOTIFICATION",
                    null,
                    "PUSH_ALL failed: " + e.getMessage(),
                    null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * push cho 1 người dùng cụ thể
     * Push notification to specific user
     * POST /notification/push-to-user
     */
    @PostMapping("/push-to-user")
    public ResponseEntity<Map<String, Object>> pushNotificationToUser(
            @RequestBody PushNotiRequest request,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (request.getUsername() == null || request.getUsername().isEmpty()) {
                response.put("success", false);
                response.put("message", "Username is required");
                return ResponseEntity.badRequest().body(response);
            }

            firebaseNotificationService.pushNotificationToUser(request);
            response.put("success", true);
            response.put("message", "Notification sent to user successfully");

            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logSuccess(
                    admin,
                    AuditAction.PUSH_NOTIFICATION,
                    "NOTIFICATION",
                    request.getUsername(),
                    "PUSH_USER title=" + request.getTitle(),
                    null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in pushNotificationToUser endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());

            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logFailure(
                    admin,
                    AuditAction.PUSH_NOTIFICATION,
                    "NOTIFICATION",
                    request.getUsername(),
                    "PUSH_USER failed: " + e.getMessage(),
                    null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Push notification to multiple users
     * POST /notification/push-to-users
     */
    @PostMapping("/push-to-users")
    public ResponseEntity<Map<String, Object>> pushNotificationToUsers(
            @RequestBody com.ebanking.adminTool.dto.BulkPushNotiRequest request,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (request.getUsernames() == null || request.getUsernames().isEmpty()) {
                response.put("success", false);
                response.put("message", "Usernames list is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Title is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Content is required");
                return ResponseEntity.badRequest().body(response);
            }

            Map<String, Object> result = firebaseNotificationService.pushBulkNotificationToUsers(request);

            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            boolean success = Boolean.TRUE.equals(result.get("success"));
            if (success) {
                auditLogger.logSuccess(
                        admin,
                        AuditAction.PUSH_NOTIFICATION_BULK,
                        "NOTIFICATION",
                        null,
                        "PUSH_BULK title=" + request.getTitle() + ", users=" + request.getUsernames().size(),
                        null);
            } else {
                auditLogger.logFailure(
                        admin,
                        AuditAction.PUSH_NOTIFICATION_BULK,
                        "NOTIFICATION",
                        null,
                        "PUSH_BULK failed: " + result.get("message"),
                        null);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error in pushNotificationToUsers endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());

            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logFailure(
                    admin,
                    AuditAction.PUSH_NOTIFICATION_BULK,
                    "NOTIFICATION",
                    null,
                    "PUSH_BULK failed: " + e.getMessage(),
                    null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * push thông báo hệ thống
     * Get system notifications with pagination
     * GET /notification/system?index={index}&limit={limit}
     */
    @GetMapping("/system")
    public ResponseEntity<Map<String, Object>> getSystemNotifications(
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NotiSystemDTO> notifications = firebaseNotificationService.getSystemNotifications(index, limit);
            response.put("success", true);
            response.put("data", notifications);
            response.put("index", index);
            response.put("limit", limit);
            response.put("count", notifications != null ? notifications.size() : 0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in getSystemNotifications endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Cái này không cần quan tâm
     * Get transaction notifications with pagination
     * GET /notification/transaction?index={index}&limit={limit}
     */
    @GetMapping("/transaction")
    public ResponseEntity<Map<String, Object>> getTransactionNotifications(
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NotiTransactionDTO> notifications = firebaseNotificationService.getTransactionNotifications(index,
                    limit);
            response.put("success", true);
            response.put("data", notifications);
            response.put("index", index);
            response.put("limit", limit);
            response.put("count", notifications != null ? notifications.size() : 0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in getTransactionNotifications endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Này để test thôi
     * Send simple notification (for testing)
     * POST /notification/send-simple
     */
    @PostMapping("/send-simple")
    public ResponseEntity<Map<String, Object>> sendSimpleNotification(
            @RequestParam String token,
            @RequestParam String title,
            @RequestParam String body) {
        Map<String, Object> response = new HashMap<>();
        try {
            firebaseNotificationService.sendSimpleNotification(token, title, body);
            response.put("success", true);
            response.put("message", "Simple notification sent successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in sendSimpleNotification endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Này cũng để test
     * Push test notification
     * POST /notification/test
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> pushTestNotification(@RequestBody String content) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean result = firebaseNotificationService.pushNotifyTest(content);
            response.put("success", result);
            response.put("message",
                    result ? "Test notification sent successfully" : "Failed to send test notification");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in pushTestNotification endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get all notification history with pagination
     * GET /notification/history?index={index}&limit={limit}
     */
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getAllNotificationHistory(
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NotificationHistoryDto> notifications = notificationHistoryService.getAllNotificationHistory(index * limit, limit);
            long totalCount = notificationHistoryService.getTotalNotificationCount();
            
            response.put("success", true);
            response.put("data", notifications);
            response.put("index", index);
            response.put("limit", limit);
            response.put("count", notifications.size());
            response.put("totalCount", totalCount);
            response.put("totalPages", (totalCount + limit - 1) / limit);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in getAllNotificationHistory endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get system notification history with pagination
     * GET /notification/history/system?index={index}&limit={limit}
     */
    @GetMapping("/history/system")
    public ResponseEntity<Map<String, Object>> getSystemNotificationHistory(
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NotificationHistoryDto> notifications = notificationHistoryService.getSystemNotificationHistory(index * limit, limit);
            
            response.put("success", true);
            response.put("data", notifications);
            response.put("index", index);
            response.put("limit", limit);
            response.put("count", notifications.size());
            response.put("type", "SYSTEM");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in getSystemNotificationHistory endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get personal notification history with pagination and optional username filter
     * GET /notification/history/personal?index={index}&limit={limit}&username={username}
     */
    @GetMapping("/history/personal")
    public ResponseEntity<Map<String, Object>> getPersonalNotificationHistory(
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String username) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NotificationHistoryDto> notifications = notificationHistoryService.getPersonalNotificationHistory(index * limit, limit, username);
            
            response.put("success", true);
            response.put("data", notifications);
            response.put("index", index);
            response.put("limit", limit);
            response.put("count", notifications.size());
            response.put("type", "PERSONAL");
            if (username != null) {
                response.put("username", username);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in getPersonalNotificationHistory endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get transaction notification history with pagination and optional username filter
     * GET /notification/history/transaction?index={index}&limit={limit}&username={username}
     */
    @GetMapping("/history/transaction")
    public ResponseEntity<Map<String, Object>> getTransactionNotificationHistory(
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String username) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NotificationHistoryDto> notifications = notificationHistoryService.getTransactionNotificationHistory(index * limit, limit, username);
            
            response.put("success", true);
            response.put("data", notifications);
            response.put("index", index);
            response.put("limit", limit);
            response.put("count", notifications.size());
            response.put("type", "TRANSACTION");
            if (username != null) {
                response.put("username", username);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in getTransactionNotificationHistory endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get notification history by date range and type
     * GET /notification/history/filter?fromDate={fromDate}&toDate={toDate}&type={type}
     */
    @GetMapping("/history/filter")
    public ResponseEntity<Map<String, Object>> getNotificationHistoryByDateRange(
            @RequestParam Long fromDate,
            @RequestParam Long toDate,
            @RequestParam(required = false, defaultValue = "ALL") String type) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NotificationHistoryDto> notifications = notificationHistoryService.getNotificationHistoryByDateRange(fromDate, toDate, type);
            
            response.put("success", true);
            response.put("data", notifications);
            response.put("count", notifications.size());
            response.put("fromDate", fromDate);
            response.put("toDate", toDate);
            response.put("type", type);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in getNotificationHistoryByDateRange endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Search notifications with advanced filters
     * GET /notification/search?title={title}&fromDate={fromDate}&toDate={toDate}&type={type}&username={username}&index={index}&limit={limit}
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchNotifications(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long fromDate,
            @RequestParam(required = false) Long toDate,
            @RequestParam(required = false, defaultValue = "ALL") String type,
            @RequestParam(required = false) String username,
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Validate that at least one search criteria is provided
            if ((title == null || title.trim().isEmpty()) && 
                fromDate == null && toDate == null && 
                (username == null || username.trim().isEmpty()) &&
                (type == null || type.equalsIgnoreCase("ALL"))) {
                response.put("success", false);
                response.put("message", "At least one search criteria must be provided (title, date range, username, or specific type)");
                return ResponseEntity.badRequest().body(response);
            }

            List<NotificationHistoryDto> notifications = notificationHistoryService.searchNotifications(
                title, fromDate, toDate, type, username, index * limit, limit);
            
            long totalCount = notificationHistoryService.getSearchNotificationCount(
                title, fromDate, toDate, type, username);
            
            response.put("success", true);
            response.put("data", notifications);
            response.put("index", index);
            response.put("limit", limit);
            response.put("count", notifications.size());
            response.put("totalCount", totalCount);
            response.put("totalPages", (totalCount + limit - 1) / limit);
            
            // Add search criteria to response for reference
            Map<String, Object> searchCriteria = new HashMap<>();
            if (title != null && !title.trim().isEmpty()) {
                searchCriteria.put("title", title);
            }
            if (fromDate != null) {
                searchCriteria.put("fromDate", fromDate);
            }
            if (toDate != null) {
                searchCriteria.put("toDate", toDate);
            }
            if (type != null && !type.equalsIgnoreCase("ALL")) {
                searchCriteria.put("type", type);
            }
            if (username != null && !username.trim().isEmpty()) {
                searchCriteria.put("username", username);
            }
            response.put("searchCriteria", searchCriteria);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in searchNotifications endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
