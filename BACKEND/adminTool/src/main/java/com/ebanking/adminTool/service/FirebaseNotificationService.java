package com.ebanking.adminTool.service;

import com.ebanking.adminTool.dto.NotiSystemDTO;
import com.ebanking.adminTool.dto.NotiTransactionDTO;
import com.ebanking.adminTool.dto.PushNotiRequest;
import com.ebanking.adminTool.dto.SaveTokenDTO;
import com.ebanking.adminTool.utils.HttpUltils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@Service
public class FirebaseNotificationService {

    @Autowired
    private HttpUltils httpUltils;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${firebase.service.url}")
    private String firebaseServiceUrl;

    /**
     * Save FCM token for a user
     * POST /notify/save-token
     */
    public boolean saveToken(SaveTokenDTO saveTokenDTO) {
        try {
            String url = firebaseServiceUrl + "/save-token";
            Boolean result = httpUltils.post(url, saveTokenDTO, Boolean.class);
            log.info("Save token for user: {} - Result: {}", saveTokenDTO.getUsername(), result);
            return result != null && result;
        } catch (Exception e) {
            log.error("Error saving token: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Update FCM token
     * POST /notify/updateFcmToken
     */
    public boolean updateFcmToken(SaveTokenDTO saveTokenDTO) {
        try {
            String url = firebaseServiceUrl + "/updateFcmToken";
            Boolean result = httpUltils.post(url, saveTokenDTO, Boolean.class);
            log.info("Update FCM token for user: {} - Result: {}", saveTokenDTO.getUsername(), result);
            return result != null && result;
        } catch (Exception e) {
            log.error("Error updating FCM token: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Push notification to all users
     * POST /notify/push-all
     */
    public void pushNotificationToAll(PushNotiRequest request) {
        try {
            String url = firebaseServiceUrl + "/notify/push-all";
            httpUltils.post(url, request, Void.class);
            log.info("Push notification to all users - Title: {}", request.getTitle());
        } catch (Exception e) {
            log.error("Error pushing notification to all: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to push notification to all users", e);
        }
    }

    /**
     * Push notification to specific user
     * POST /notify/push-noti-persional
     */
    public void pushNotificationToUser(PushNotiRequest request) {
        try {
            String url = firebaseServiceUrl + "/notify/push-noti-persional";
            httpUltils.post(url, request, Void.class);
            log.info("Push notification to user: {} - Title: {}", request.getUsername(), request.getTitle());
        } catch (Exception e) {
            log.error("Error pushing notification to user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to push notification to user", e);
        }
    }

    /**
     * Get system notifications with pagination
     * GET /notify/getSysNoti?index={index}&limit={limit}
     */
    public List<NotiSystemDTO> getSystemNotifications(int index, int limit) {
        try {
            String url = String.format("%s/getSysNoti?index=%d&limit=%d",
                    firebaseServiceUrl, index, limit);

            ResponseEntity<List<NotiSystemDTO>> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<NotiSystemDTO>>() {
                    });

            log.info("Get system notifications - Index: {}, Limit: {}, Count: {}",
                    index, limit, response.getBody() != null ? response.getBody().size() : 0);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error getting system notifications: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get system notifications", e);
        }
    }

    /**
     * Get transaction notifications with pagination
     * GET /notify/getTransferNoti?index={index}&limit={limit}
     */
    public List<NotiTransactionDTO> getTransactionNotifications(int index, int limit) {
        try {
            String url = String.format("%s/getTransferNoti?index=%d&limit=%d",
                    firebaseServiceUrl, index, limit);

            ResponseEntity<List<NotiTransactionDTO>> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<NotiTransactionDTO>>() {
                    });

            log.info("Get transaction notifications - Index: {}, Limit: {}, Count: {}",
                    index, limit, response.getBody() != null ? response.getBody().size() : 0);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error getting transaction notifications: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get transaction notifications", e);
        }
    }

    /**
     * Send simple notification (for testing)
     * POST /notify/push-noti?token={token}&title={title}&body={body}
     */
    public void sendSimpleNotification(String token, String title, String body) {
        try {
            String url = String.format("%s/push-noti?token=%s&title=%s&body=%s",
                    firebaseServiceUrl, token, title, body);
            httpUltils.post(url, null, Void.class);
            log.info("Send simple notification - Title: {}", title);
        } catch (Exception e) {
            log.error("Error sending simple notification: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send simple notification", e);
        }
    }

    /**
     * Push notification with content (for testing)
     * POST /notify/push-notiify
     */
    public boolean pushNotifyTest(String content) {
        try {
            String url = firebaseServiceUrl + "/push-notiify";
            Boolean result = httpUltils.post(url, content, Boolean.class);
            log.info("Push test notification - Content: {}, Result: {}", content, result);
            return result != null && result;
        } catch (Exception e) {
            log.error("Error pushing test notification: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Push bulk notification to multiple users
     * POST /notify/push-noti-bulk
     */
    public java.util.Map<String, Object> pushBulkNotificationToUsers(com.ebanking.adminTool.dto.BulkPushNotiRequest request) {
        try {
            String url = firebaseServiceUrl + "/notify/push-noti-bulk";
            
            // Create request body matching firebaseService DTO structure
            java.util.Map<String, Object> requestBody = new java.util.HashMap<>();
            requestBody.put("usernames", request.getUsernames());
            requestBody.put("title", request.getTitle());
            requestBody.put("content", request.getContent());
            
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> result = httpUltils.post(url, requestBody, java.util.Map.class);
            
            log.info("Push bulk notification - Title: {}, Users count: {}, Result: {}", 
                    request.getTitle(), request.getUsernames().size(), result);
            return result;
        } catch (Exception e) {
            log.error("Error pushing bulk notification: {}", e.getMessage(), e);
            // Return error response
            java.util.Map<String, Object> errorResult = new java.util.HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Failed to send bulk notification: " + e.getMessage());
            return errorResult;
        }
    }
}
