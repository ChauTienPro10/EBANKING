package com.ebanking.firebaseService.controller;

import com.ebanking.firebaseService.dto.request.RegisterTokenRequest;
import com.ebanking.firebaseService.dto.request.SendNotificationRequest;
import com.ebanking.firebaseService.dto.request.TransactionNotificationRequest;
import com.ebanking.firebaseService.dto.response.NotificationResponse;
import com.ebanking.firebaseService.service.FCMService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@Slf4j
public class NotificationController {

    @Autowired
    private FCMService fcmService;

    //dang ky token
    @PostMapping("/register-token")
    public ResponseEntity<NotificationResponse> registerToken(@RequestBody RegisterTokenRequest request) {
        try {
            if (request.getUsername() != null && !request.getUsername().isEmpty()) {
                // dang ky token với username
                fcmService.saveFCMTokenWithUsername(request.getUsername(), request.getDeviceId(), request.getToken());
            } else if (request.getUserId() != null) {
                // dang ky token với userId
                fcmService.saveFCMToken(request.getUserId(), request.getDeviceId(), request.getToken());
            } else {
                throw new IllegalArgumentException("Either username or userId must be provided");
            }
            
            NotificationResponse response = NotificationResponse.builder()
                    .success(true)
                    .message("Token registered successfully")
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error registering token: {}", e.getMessage());
            NotificationResponse response = NotificationResponse.builder()
                    .success(false)
                    .message("Failed to register token")
                    .error(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //gởi noti
    @PostMapping("/send")
    public ResponseEntity<NotificationResponse> sendNotification(@RequestBody SendNotificationRequest request) {
        try {
            String messageId;
            if (request.getData() != null && !request.getData().isEmpty()) {
                messageId = fcmService.sendDataMessage(request.getToken(), request.getData());
            } else {
                messageId = fcmService.sendNotificationToDevice(request.getToken(), request.getTitle(), request.getBody());
            }
            
            NotificationResponse response = NotificationResponse.builder()
                    .success(true)
                    .message("Notification sent successfully")
                    .messageId(messageId)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error sending notification: {}", e.getMessage());
            NotificationResponse response = NotificationResponse.builder()
                    .success(false)
                    .message("Failed to send notification")
                    .error(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

   //gởi noti cho transaction
    @PostMapping("/transaction")
    public ResponseEntity<NotificationResponse> sendTransactionNotification(@RequestBody TransactionNotificationRequest request) {
        try {
            String messageId = null;
            
            // Kiểm tra xem có userId hay username
            if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
                // Sử dụng username
                switch (request.getStatus().toUpperCase()) {
                    case "PENDING":
                        messageId = fcmService.sendTransactionPendingNotificationByUsername(
                                request.getUsername(), 
                                request.getTransactionId(), 
                                request.getAmount()
                        );
                        break;
                    case "SUCCESS":
                        messageId = fcmService.sendTransactionSuccessNotificationByUsername(
                                request.getUsername(), 
                                request.getTransactionId(), 
                                request.getAmount()
                        );
                        break;
                    case "FAILED":
                        messageId = fcmService.sendTransactionFailedNotificationByUsername(
                                request.getUsername(), 
                                request.getTransactionId(), 
                                request.getAmount(),
                                request.getReason() != null ? request.getReason() : "Không xác định"
                        );
                        break;
                    default:
                        throw new IllegalArgumentException("Invalid transaction status: " + request.getStatus());
                }
            } else if (request.getUserId() != null) {
                // Sử dụng userId
                switch (request.getStatus().toUpperCase()) {
                    case "PENDING":
                        messageId = fcmService.sendTransactionPendingNotification(
                                request.getUserId(), 
                                request.getTransactionId(), 
                                request.getAmount()
                        );
                        break;
                    case "SUCCESS":
                        messageId = fcmService.sendTransactionSuccessNotification(
                                request.getUserId(), 
                                request.getTransactionId(), 
                                request.getAmount()
                        );
                        break;
                    case "FAILED":
                        messageId = fcmService.sendTransactionFailedNotification(
                                request.getUserId(), 
                                request.getTransactionId(), 
                                request.getAmount(),
                                request.getReason() != null ? request.getReason() : "Không xác định"
                        );
                        break;
                    default:
                        throw new IllegalArgumentException("Invalid transaction status: " + request.getStatus());
                }
            } else {
                throw new IllegalArgumentException("Either username or userId must be provided");
            }
            
            if (messageId == null) {
                NotificationResponse response = NotificationResponse.builder()
                        .success(false)
                        .message("No FCM token found for user")
                        .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            NotificationResponse response = NotificationResponse.builder()
                    .success(true)
                    .message("Transaction notification sent successfully")
                    .messageId(messageId)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error sending transaction notification: {}", e.getMessage());
            NotificationResponse response = NotificationResponse.builder()
                    .success(false)
                    .message("Failed to send transaction notification")
                    .error(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    //xoa token
    @DeleteMapping("/token/{token}")
    public ResponseEntity<NotificationResponse> deleteToken(@PathVariable String token) {
        try {
            fcmService.deleteFCMToken(token);
            
            NotificationResponse response = NotificationResponse.builder()
                    .success(true)
                    .message("Token deleted successfully")
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting token: {}", e.getMessage());
            NotificationResponse response = NotificationResponse.builder()
                    .success(false)
                    .message("Failed to delete token")
                    .error(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
