package com.ebanking.firebaseService.service;

import com.ebanking.firebaseService.dto.response.NotificationDTO;
import com.ebanking.firebaseService.entity.Notification;
import com.ebanking.firebaseService.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public Notification saveNotification(Notification notification) {
        log.info("Saving notification: {}", notification.getTitle());
        return notificationRepository.save(notification);
    }
    @Transactional
    public Notification createNotification(Long userId, String username, String title, String body, 
                                          String type, String data, String transactionId, 
                                          String amount, String transactionStatus) {
        Notification notification = Notification.builder()
                .userId(userId)
                .username(username)
                .title(title)
                .body(body)
                .type(type)
                .data(data)
                .transactionId(transactionId)
                .amount(amount)
                .transactionStatus(transactionStatus)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        return notificationRepository.save(notification);
    }

    public Page<NotificationDTO> getNotificationsByUserId(Long userId, int page, int size) {
        log.info("Getting notifications for userId: {}, page: {}, size: {}", userId, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        
        return notificationPage.map(NotificationDTO::fromEntity);
    }

    public Page<NotificationDTO> getNotificationsByUsername(String username, int page, int size) {
        log.info("Getting notifications for username: {}, page: {}, size: {}", username, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository.findByUsernameOrderByCreatedAtDesc(username, pageable);
        
        return notificationPage.map(NotificationDTO::fromEntity);
    }

    public List<NotificationDTO> getUnreadNotificationsByUserId(Long userId) {
        log.info("Getting unread notifications for userId: {}", userId);
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        
        return notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotificationsByUsername(String username) {
        log.info("Getting unread notifications for username: {}", username);
        List<Notification> notifications = notificationRepository.findByUsernameAndIsReadFalseOrderByCreatedAtDesc(username);
        
        return notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public long countUnreadByUserId(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public long countUnreadByUsername(String username) {
        return notificationRepository.countByUsernameAndIsReadFalse(username);
    }


    @Transactional
    public boolean markAsRead(Long notificationId, Long userId) {
        log.info("Marking notification {} as read for userId: {}", notificationId, userId);
        
        // kiểm tra ownership
        if (userId != null && notificationRepository.findByIdAndUserId(notificationId, userId).isEmpty()) {
            log.warn("Notification {} not found or doesn't belong to userId: {}", notificationId, userId);
            return false;
        }
        
        int updated = notificationRepository.markAsRead(notificationId);
        return updated > 0;
    }


    @Transactional
    public boolean markAsReadByUsername(Long notificationId, String username) {
        log.info("Marking notification {} as read for username: {}", notificationId, username);
        
        // kiểm tra ownership
        if (username != null && notificationRepository.findByIdAndUsername(notificationId, username).isEmpty()) {
            log.warn("Notification {} not found or doesn't belong to username: {}", notificationId, username);
            return false;
        }
        
        int updated = notificationRepository.markAsRead(notificationId);
        return updated > 0;
    }


    @Transactional
    public int markAllAsReadByUserId(Long userId) {
        log.info("Marking all notifications as read for userId: {}", userId);
        return notificationRepository.markAllAsReadByUserId(userId);
    }


    @Transactional
    public int markAllAsReadByUsername(String username) {
        log.info("Marking all notifications as read for username: {}", username);
        return notificationRepository.markAllAsReadByUsername(username);
    }


    @Transactional
    public boolean deleteNotification(Long notificationId, Long userId) {
        log.info("Deleting notification {} for userId: {}", notificationId, userId);
        int deleted = notificationRepository.deleteByIdAndUserId(notificationId, userId);
        return deleted > 0;
    }

    @Transactional
    public boolean deleteNotificationByUsername(Long notificationId, String username) {
        log.info("Deleting notification {} for username: {}", notificationId, username);
        int deleted = notificationRepository.deleteByIdAndUsername(notificationId, username);
        return deleted > 0;
    }


    @Transactional
    public int clearAllReadByUserId(Long userId) {
        log.info("Clearing all read notifications for userId: {}", userId);
        return notificationRepository.deleteAllReadByUserId(userId);
    }


    @Transactional
    public int clearAllReadByUsername(String username) {
        log.info("Clearing all read notifications for username: {}", username);
        return notificationRepository.deleteAllReadByUsername(username);
    }

    /**
     * Get notification by id
     */
    public NotificationDTO getNotificationById(Long notificationId, Long userId) {
        log.info("Getting notification {} for userId: {}", notificationId, userId);
        return notificationRepository.findByIdAndUserId(notificationId, userId)
                .map(NotificationDTO::fromEntity)
                .orElse(null);
    }


    public NotificationDTO getNotificationByIdAndUsername(Long notificationId, String username) {
        log.info("Getting notification {} for username: {}", notificationId, username);
        return notificationRepository.findByIdAndUsername(notificationId, username)
                .map(NotificationDTO::fromEntity)
                .orElse(null);
    }
}

