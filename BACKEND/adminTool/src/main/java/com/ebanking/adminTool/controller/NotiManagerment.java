package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.dto.NotiSystemDTO;
import com.ebanking.adminTool.dto.NotiTransactionDTO;
import com.ebanking.adminTool.dto.PushNotiRequest;
import com.ebanking.adminTool.dto.SaveTokenDTO;
import com.ebanking.adminTool.service.FirebaseNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Map<String, Object>> pushNotificationToAll(@RequestBody PushNotiRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            firebaseNotificationService.pushNotificationToAll(request);
            response.put("success", true);
            response.put("message", "Notification sent to all users successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in pushNotificationToAll endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * push cho 1 người dùng cụ thể
     * Push notification to specific user
     * POST /notification/push-to-user
     */
    @PostMapping("/push-to-user")
    public ResponseEntity<Map<String, Object>> pushNotificationToUser(@RequestBody PushNotiRequest request) {
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
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in pushNotificationToUser endpoint: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
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
}
