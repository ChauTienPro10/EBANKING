package com.ebanking.firebaseService.controller;

import com.ebanking.firebaseService.dto.response.NotificationDTO;
import com.ebanking.firebaseService.dto.response.NotificationListResponse;
import com.ebanking.firebaseService.dto.response.NotificationResponse;
import com.ebanking.firebaseService.dto.response.UnreadCountResponse;
import com.ebanking.firebaseService.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Slf4j
public class NotificationHistoryController {

    @Autowired
    private NotificationService notificationService;


    @GetMapping("/user/{userId}")
    public ResponseEntity<NotificationListResponse> getNotificationsByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Page<NotificationDTO> notificationPage = notificationService.getNotificationsByUserId(userId, page, size);
            long unreadCount = notificationService.countUnreadByUserId(userId);
            
            NotificationListResponse response = NotificationListResponse.builder()
                    .success(true)
                    .message("Notifications retrieved successfully")
                    .notifications(notificationPage.getContent())
                    .totalPages(notificationPage.getTotalPages())
                    .totalElements(notificationPage.getTotalElements())
                    .currentPage(notificationPage.getNumber())
                    .pageSize(notificationPage.getSize())
                    .unreadCount(unreadCount)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting notifications for userId {}: {}", userId, e.getMessage());
            NotificationListResponse response = NotificationListResponse.builder()
                    .success(false)
                    .message("Failed to retrieve notifications: " + e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<NotificationListResponse> getNotificationsByUsername(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Page<NotificationDTO> notificationPage = notificationService.getNotificationsByUsername(username, page, size);
            long unreadCount = notificationService.countUnreadByUsername(username);
            
            NotificationListResponse response = NotificationListResponse.builder()
                    .success(true)
                    .message("Notifications retrieved successfully")
                    .notifications(notificationPage.getContent())
                    .totalPages(notificationPage.getTotalPages())
                    .totalElements(notificationPage.getTotalElements())
                    .currentPage(notificationPage.getNumber())
                    .pageSize(notificationPage.getSize())
                    .unreadCount(unreadCount)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting notifications for username {}: {}", username, e.getMessage());
            NotificationListResponse response = NotificationListResponse.builder()
                    .success(false)
                    .message("Failed to retrieve notifications: " + e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCountByUserId(@PathVariable Long userId) {
        try {
            long unreadCount = notificationService.countUnreadByUserId(userId);
            
            UnreadCountResponse response = UnreadCountResponse.builder()
                    .success(true)
                    .unreadCount(unreadCount)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting unread count for userId {}: {}", userId, e.getMessage());
            UnreadCountResponse response = UnreadCountResponse.builder()
                    .success(false)
                    .unreadCount(0)
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/username/{username}/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCountByUsername(@PathVariable String username) {
        try {
            long unreadCount = notificationService.countUnreadByUsername(username);
            
            UnreadCountResponse response = UnreadCountResponse.builder()
                    .success(true)
                    .unreadCount(unreadCount)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting unread count for username {}: {}", username, e.getMessage());
            UnreadCountResponse response = UnreadCountResponse.builder()
                    .success(false)
                    .unreadCount(0)
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String username) {
        
        try {
            boolean updated;
            
            if (userId != null) {
                updated = notificationService.markAsRead(notificationId, userId);
            } else if (username != null) {
                updated = notificationService.markAsReadByUsername(notificationId, username);
            } else {
                NotificationResponse response = NotificationResponse.builder()
                        .success(false)
                        .message("Either userId or username must be provided")
                        .build();
                return ResponseEntity.badRequest().body(response);
            }
            
            if (updated) {
                NotificationResponse response = NotificationResponse.builder()
                        .success(true)
                        .message("Notification marked as read")
                        .build();
                return ResponseEntity.ok(response);
            } else {
                NotificationResponse response = NotificationResponse.builder()
                        .success(false)
                        .message("Notification not found or unauthorized")
                        .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            log.error("Error marking notification {} as read: {}", notificationId, e.getMessage());
            NotificationResponse response = NotificationResponse.builder()
                    .success(false)
                    .message("Failed to mark notification as read")
                    .error(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<NotificationResponse> markAllAsReadByUserId(@PathVariable Long userId) {
        try {
            int updated = notificationService.markAllAsReadByUserId(userId);
            
            NotificationResponse response = NotificationResponse.builder()
                    .success(true)
                    .message(String.format("Marked %d notifications as read", updated))
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error marking all notifications as read for userId {}: {}", userId, e.getMessage());
            NotificationResponse response = NotificationResponse.builder()
                    .success(false)
                    .message("Failed to mark all notifications as read")
                    .error(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/username/{username}/read-all")
    public ResponseEntity<NotificationResponse> markAllAsReadByUsername(@PathVariable String username) {
        try {
            int updated = notificationService.markAllAsReadByUsername(username);
            
            NotificationResponse response = NotificationResponse.builder()
                    .success(true)
                    .message(String.format("Marked %d notifications as read", updated))
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error marking all notifications as read for username {}: {}", username, e.getMessage());
            NotificationResponse response = NotificationResponse.builder()
                    .success(false)
                    .message("Failed to mark all notifications as read")
                    .error(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @DeleteMapping("/{notificationId}")
    public ResponseEntity<NotificationResponse> deleteNotification(
            @PathVariable Long notificationId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String username) {
        
        try {
            boolean deleted;
            
            if (userId != null) {
                deleted = notificationService.deleteNotification(notificationId, userId);
            } else if (username != null) {
                deleted = notificationService.deleteNotificationByUsername(notificationId, username);
            } else {
                NotificationResponse response = NotificationResponse.builder()
                        .success(false)
                        .message("Either userId or username must be provided")
                        .build();
                return ResponseEntity.badRequest().body(response);
            }
            
            if (deleted) {
                NotificationResponse response = NotificationResponse.builder()
                        .success(true)
                        .message("Notification deleted successfully")
                        .build();
                return ResponseEntity.ok(response);
            } else {
                NotificationResponse response = NotificationResponse.builder()
                        .success(false)
                        .message("Notification not found or unauthorized")
                        .build();
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            log.error("Error deleting notification {}: {}", notificationId, e.getMessage());
            NotificationResponse response = NotificationResponse.builder()
                    .success(false)
                    .message("Failed to delete notification")
                    .error(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/user/{userId}/clear-read")
    public ResponseEntity<NotificationResponse> clearAllReadByUserId(@PathVariable Long userId) {
        try {
            int deleted = notificationService.clearAllReadByUserId(userId);
            
            NotificationResponse response = NotificationResponse.builder()
                    .success(true)
                    .message(String.format("Cleared %d read notifications", deleted))
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error clearing read notifications for userId {}: {}", userId, e.getMessage());
            NotificationResponse response = NotificationResponse.builder()
                    .success(false)
                    .message("Failed to clear read notifications")
                    .error(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @DeleteMapping("/username/{username}/clear-read")
    public ResponseEntity<NotificationResponse> clearAllReadByUsername(@PathVariable String username) {
        try {
            int deleted = notificationService.clearAllReadByUsername(username);
            
            NotificationResponse response = NotificationResponse.builder()
                    .success(true)
                    .message(String.format("Cleared %d read notifications", deleted))
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error clearing read notifications for username {}: {}", username, e.getMessage());
            NotificationResponse response = NotificationResponse.builder()
                    .success(false)
                    .message("Failed to clear read notifications")
                    .error(e.getMessage())
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

