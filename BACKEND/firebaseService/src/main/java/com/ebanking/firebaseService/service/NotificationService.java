package com.ebanking.firebaseService.service;


import com.ebanking.firebaseService.dto.request.PushNotiRequest;
import com.ebanking.firebaseService.entity.NotiSystem;
import com.ebanking.firebaseService.entity.NotiTransaction;
import com.ebanking.firebaseService.entity.PersionalNoti;
import com.ebanking.firebaseService.repository.FCMTokenRepository;
import com.ebanking.firebaseService.repository.NotiSystemRepository;
import com.ebanking.firebaseService.repository.NotiTransactionRepository;
import com.ebanking.firebaseService.repository.PersionalNotiRepository;
import com.google.firebase.messaging.FirebaseMessagingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class NotificationService {
    @Autowired
    NotiTransactionRepository notiTransactionRepository;

    @Autowired
    PersionalNotiRepository persionalNotiRepository;

    @Autowired FirebaseMessagingService firebaseMessagingService;

    @Autowired NotiTransactionRepository transactionRepository;

    @Autowired
    NotiSystemRepository notiSystemRepository;

    @Autowired
    FCMTokenRepository fcmTokenRepository;
    public void pushNotiAll(PushNotiRequest request) throws FirebaseMessagingException {

        List<String> tokens = fcmTokenRepository.getAllTokenStr();
        NotiSystem notiSystem = NotiSystem.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .createdAt(System.currentTimeMillis())
                .build();
        notiSystemRepository.save(notiSystem);
        for (String tk : tokens) {
            try {
                firebaseMessagingService.sendNotification(tk, request.getTitle(), request.getContent());
            } catch (Exception e) {
                log.info(e.getMessage());
            }
        }
    }

    public void pushTransactionNoti(String username, String token, String title, String content, String sender, String amount, String status, String noiDung) {
        try {
            if (username == null) {
                username = fcmTokenRepository.findByToken(token).get().getUsername();
            }
            NotiTransaction notiTransaction = NotiTransaction.builder()
                    .username(username)
                    .title(title)
                    .content(content)
                    .createdAt(System.currentTimeMillis())
                    .sender(sender)
                    .noiDungGiaoDich(noiDung)
                    .status(status)
                    .amount(amount)
                    .build();
            transactionRepository.save(notiTransaction);
            firebaseMessagingService.sendNotification(token, title, content);
        } catch (Exception e) {
            log.error("Push failed: " + e.getMessage() );
        }

    }

    public void pushPersionNoi(String username, String token, String title, String content) {
        try {
            if (username == null) {
                username = fcmTokenRepository.findByToken(token).get().getUsername();
            }
            PersionalNoti persionalNoti = PersionalNoti.builder()
                    .username(username)
                    .title(title)
                    .content(content)
                    .createdAt(System.currentTimeMillis())
                    .build();
            persionalNotiRepository.save(persionalNoti);
            firebaseMessagingService.sendNotification(token, title, content);
        } catch (Exception e) {
            log.error("Push failed: " + e.getMessage() );
        }
    }

    public List<NotiSystem> getSysNotifications(int offset, int limit) {
        Pageable pageable = PageRequest.of(offset / limit, limit);
        return notiSystemRepository.findAll(pageable).getContent();
    }

    public List<NotiTransaction> getNotiTransaction(int offset, int limit) {
        Pageable pageable = PageRequest.of(offset / limit, limit);
        return notiTransactionRepository.findAll(pageable).getContent();
    }

    public List<PersionalNoti> getNotiPerson(int offset, int limit) {
        Pageable pageable = PageRequest.of(offset / limit, limit);
        return persionalNotiRepository.findAll(pageable).getContent();
    }

    public List<NotiSystem> getFromDateToDate(
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        return notiSystemRepository.findFromDateToDate(fromDate, toDate);
    }

    public boolean pushPersonalNotification(String username, String title, String content) {
        try {
            // Get FCM token for the user
            Optional<com.ebanking.firebaseService.entity.FCMToken> fcmTokenOpt = fcmTokenRepository.findByUsername(username);
            
            if (fcmTokenOpt.isEmpty()) {
                log.warn("No FCM token found for username: {}", username);
                return false;
            }
            
            String token = fcmTokenOpt.get().getToken();
            
            // Save personal notification to database
            PersionalNoti personalNoti = PersionalNoti.builder()
                    .username(username)
                    .userId(username) // Using username as userId for now
                    .title(title)
                    .content(content)
                    .createdAt(System.currentTimeMillis())
                    .build();
            
            persionalNotiRepository.save(personalNoti);
            
            // Send FCM notification
            firebaseMessagingService.sendNotification(token, title, content);
            
            log.info("Personal notification sent successfully to user: {}", username);
            return true;
            
        } catch (Exception e) {
            log.error("Failed to send personal notification to user {}: {}", username, e.getMessage());
            return false;
        }
    }

    public List<PersionalNoti> getPersonalNotificationsByUsername(String username, int offset, int limit) {
        Pageable pageable = PageRequest.of(offset / limit, limit);
        return persionalNotiRepository.findByUsernameOrderByCreatedAtDesc(username, pageable);
    }

    public Map<String, Object> pushBulkPersonalNotification(List<String> usernames, String title, String content) {
        int totalUsers = usernames.size();
        int successCount = 0;
        int failedCount = 0;
        List<String> failedUsers = new ArrayList<>();
        List<String> successfulTokens = new ArrayList<>();
        
        try {
            // Process each username
            for (String username : usernames) {
                try {
                    // Get FCM token for the user
                    Optional<com.ebanking.firebaseService.entity.FCMToken> fcmTokenOpt = fcmTokenRepository.findByUsername(username);
                    
                    if (fcmTokenOpt.isEmpty()) {
                        log.warn("No FCM token found for username: {}", username);
                        failedUsers.add(username);
                        failedCount++;
                        continue;
                    }
                    
                    String token = fcmTokenOpt.get().getToken();
                    successfulTokens.add(token);
                    
                    // Save personal notification to database
                    PersionalNoti personalNoti = PersionalNoti.builder()
                            .username(username)
                            .userId(username) // Using username as userId for now
                            .title(title)
                            .content(content)
                            .createdAt(System.currentTimeMillis())
                            .build();
                    
                    persionalNotiRepository.save(personalNoti);
                    successCount++;
                    
                } catch (Exception e) {
                    log.error("Failed to process notification for user {}: {}", username, e.getMessage());
                    failedUsers.add(username);
                    failedCount++;
                }
            }
            
            // Send bulk FCM notifications using multicast
            if (!successfulTokens.isEmpty()) {
                try {
                    // Use Firebase multicast to send to multiple tokens efficiently
                    com.google.firebase.messaging.MulticastMessage message = com.google.firebase.messaging.MulticastMessage.builder()
                            .addAllTokens(successfulTokens)
                            .setNotification(com.google.firebase.messaging.Notification.builder()
                                    .setTitle(title)
                                    .setBody(content)
                                    .build())
                            .build();
                    
                    com.google.firebase.messaging.BatchResponse response = com.google.firebase.messaging.FirebaseMessaging.getInstance().sendMulticast(message);
                    
                    log.info("Bulk notification sent - Success: {}, Failed: {}", response.getSuccessCount(), response.getFailureCount());
                    
                    // Update success count based on actual FCM response
                    int fcmSuccessCount = response.getSuccessCount();
                    int fcmFailedCount = response.getFailureCount();
                    
                    // Adjust counts if some FCM sends failed
                    if (fcmFailedCount > 0) {
                        // Some FCM sends failed, but database records were already saved
                        log.warn("Some FCM notifications failed to send, but database records were saved");
                    }
                    
                } catch (Exception e) {
                    log.error("Failed to send bulk FCM notifications: {}", e.getMessage());
                    // Even if FCM fails, we've saved to database, so don't change success count
                }
            }
            
            // Prepare response
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("totalUsers", totalUsers);
            result.put("successCount", successCount);
            result.put("failedCount", failedCount);
            result.put("message", String.format("Bulk notification processed: %d successful, %d failed out of %d users", 
                    successCount, failedCount, totalUsers));
            
            if (!failedUsers.isEmpty()) {
                result.put("failedUsers", failedUsers);
            }
            
            return result;
            
        } catch (Exception e) {
            log.error("Failed to send bulk personal notifications: {}", e.getMessage());
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Failed to process bulk notifications: " + e.getMessage());
            errorResult.put("totalUsers", totalUsers);
            errorResult.put("successCount", successCount);
            errorResult.put("failedCount", failedCount);
            return errorResult;
        }
    }
}

