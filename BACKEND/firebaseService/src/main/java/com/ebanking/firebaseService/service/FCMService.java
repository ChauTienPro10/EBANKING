package com.ebanking.firebaseService.service;

import com.ebanking.firebaseService.entity.FCMToken;
import com.ebanking.firebaseService.repository.FCMTokenRepository;
import com.google.firebase.messaging.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class FCMService {

    @Autowired
    private FCMTokenRepository fcmTokenRepository;
    //gởi noti toàn bộ token
    public String sendNotificationToDevice(String token, String title, String body) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be null or empty");
        }
        if (body == null || body.trim().isEmpty()) {
            throw new IllegalArgumentException("Body cannot be null or empty");
        }
        
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent message: {}", response);
            return response;
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send message to token {}: {}", token, e.getMessage());
            throw new RuntimeException("Failed to send notification", e);
        }
    }
//gởi noti toàn bộ token
    public BatchResponse sendNotificationToMultipleDevices(List<String> tokens, String title, String body) {
        if (tokens == null || tokens.isEmpty()) {
            throw new IllegalArgumentException("Tokens list cannot be null or empty");
        }
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be null or empty");
        }
        if (body == null || body.trim().isEmpty()) {
            throw new IllegalArgumentException("Body cannot be null or empty");
        }
        
        try {
            MulticastMessage message = MulticastMessage.builder()
                    .addAllTokens(tokens)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            BatchResponse response = FirebaseMessaging.getInstance().sendMulticast(message);
            log.info("Successfully sent {} messages", response.getSuccessCount());
            return response;
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send multicast message: {}", e.getMessage());
            throw new RuntimeException("Failed to send notifications", e);
        }
    }

    //gởi data message 
    public String sendDataMessage(String token, Map<String, String> data) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("Data cannot be null or empty");
        }
        
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .putAllData(data)
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent data message: {}", response);
            return response;
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send data message to token {}: {}", token, e.getMessage());
            throw new RuntimeException("Failed to send data message", e);
        }
    }

    //gởi noti cho transaction pending
    public String sendTransactionPendingNotification(Long userId, String transactionId, String amount) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        if (transactionId == null || transactionId.trim().isEmpty()) {
            throw new IllegalArgumentException("TransactionId cannot be null or empty");
        }
        if (amount == null || amount.trim().isEmpty()) {
            throw new IllegalArgumentException("Amount cannot be null or empty");
        }
        
        FCMToken fcmToken = getFCMTokenByUserId(userId);
        if (fcmToken == null) {
            log.warn("No FCM token found for user: {}", userId);
            return null;
        }

        String title = "Giao dịch đang chờ xử lý";
        String body = String.format("Giao dịch %s với số tiền %s VND đang được xử lý. Vui lòng chờ thông báo tiếp theo.", 
                transactionId, amount);

        return sendNotificationToDevice(fcmToken.getToken(), title, body);
    }

    //gởi noti cho transaction pending bằng username
    public String sendTransactionPendingNotificationByUsername(String username, String transactionId, String amount) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }
        if (transactionId == null || transactionId.trim().isEmpty()) {
            throw new IllegalArgumentException("TransactionId cannot be null or empty");
        }
        if (amount == null || amount.trim().isEmpty()) {
            throw new IllegalArgumentException("Amount cannot be null or empty");
        }
        
        FCMToken fcmToken = getFCMTokenByUsername(username);
        if (fcmToken == null) {
            log.warn("No FCM token found for username: {}", username);
            return null;
        }

        String title = "Giao dịch đang chờ xử lý";
        String body = String.format("Giao dịch %s với số tiền %s VND đang được xử lý. Vui lòng chờ thông báo tiếp theo.", 
                transactionId, amount);

        return sendNotificationToDevice(fcmToken.getToken(), title, body);
    }

    //gởi noti cho transaction success
    public String sendTransactionSuccessNotification(Long userId, String transactionId, String amount) {
        FCMToken fcmToken = getFCMTokenByUserId(userId);
        if (fcmToken == null) {
            log.warn("No FCM token found for user: {}", userId);
            return null;
        }

        String title = "Giao dịch thành công";
        String body = String.format("Giao dịch %s với số tiền %s VND đã được xử lý thành công.", 
                transactionId, amount);

        return sendNotificationToDevice(fcmToken.getToken(), title, body);
    }

    //gởi noti cho transaction success bằng username
    public String sendTransactionSuccessNotificationByUsername(String username, String transactionId, String amount) {
        FCMToken fcmToken = getFCMTokenByUsername(username);
        if (fcmToken == null) {
            log.warn("No FCM token found for username: {}", username);
            return null;
        }

        String title = "Giao dịch thành công";
        String body = String.format("Giao dịch %s với số tiền %s VND đã được xử lý thành công.", 
                transactionId, amount);

        return sendNotificationToDevice(fcmToken.getToken(), title, body);
    }

    //gởi noti cho transaction failed
    public String sendTransactionFailedNotification(Long userId, String transactionId, String amount, String reason) {
        FCMToken fcmToken = getFCMTokenByUserId(userId);
        if (fcmToken == null) {
            log.warn("No FCM token found for user: {}", userId);
            return null;
        }

        String title = "Giao dịch thất bại";
        String body = String.format("Giao dịch %s với số tiền %s VND đã thất bại. Lý do: %s", 
                transactionId, amount, reason);

        return sendNotificationToDevice(fcmToken.getToken(), title, body);
    }

    //gởi noti cho transaction failed bằng username
    public String sendTransactionFailedNotificationByUsername(String username, String transactionId, String amount, String reason) {
        FCMToken fcmToken = getFCMTokenByUsername(username);
        if (fcmToken == null) {
            log.warn("No FCM token found for username: {}", username);
            return null;
        }

        String title = "Giao dịch thất bại";
        String body = String.format("Giao dịch %s với số tiền %s VND đã thất bại. Lý do: %s", 
                transactionId, amount, reason);

        return sendNotificationToDevice(fcmToken.getToken(), title, body);
    }

    //lưu token
    public FCMToken saveFCMToken(Long userId, String deviceId, String token) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        if (deviceId == null || deviceId.trim().isEmpty()) {
            throw new IllegalArgumentException("DeviceId cannot be null or empty");
        }
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
       
        Optional<FCMToken> existingToken = fcmTokenRepository.findByToken(token);
        
        if (existingToken.isPresent()) {
            // cap nhat thong tin user va device cho token hien tai
            FCMToken fcmToken = existingToken.get();
            fcmToken.setUserId(userId);
            fcmToken.setDeviceId(deviceId);
            fcmToken.setUpdatedAt(LocalDateTime.now());
            return fcmTokenRepository.save(fcmToken);
        } else {
            // tao token moi
            FCMToken fcmToken = FCMToken.builder()
                    .userId(userId)
                    .deviceId(deviceId)
                    .token(token)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return fcmTokenRepository.save(fcmToken);
        }
    }

    //lưu token với username
    public FCMToken saveFCMTokenWithUsername(String username, String deviceId, String token) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }
        if (deviceId == null || deviceId.trim().isEmpty()) {
            throw new IllegalArgumentException("DeviceId cannot be null or empty");
        }
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
       
        Optional<FCMToken> existingToken = fcmTokenRepository.findByToken(token);
        
        if (existingToken.isPresent()) {
            // cap nhat thong tin user va device cho token hien tai
            FCMToken fcmToken = existingToken.get();
            fcmToken.setUsername(username);
            fcmToken.setDeviceId(deviceId);
            fcmToken.setUpdatedAt(LocalDateTime.now());
            return fcmTokenRepository.save(fcmToken);
        } else {
            // tao token moi
            FCMToken fcmToken = FCMToken.builder()
                    .username(username)
                    .deviceId(deviceId)
                    .token(token)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return fcmTokenRepository.save(fcmToken);
        }
    }

    //lay token theo userId
    private FCMToken getFCMTokenByUserId(Long userId) {
        return fcmTokenRepository.findByUserId(userId).orElse(null);
    }

    //lay token theo username
    private FCMToken getFCMTokenByUsername(String username) {
        return fcmTokenRepository.findByUsername(username).orElse(null);
    }
   //xoa token
    @Transactional
    public void deleteFCMToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        
        fcmTokenRepository.deleteByToken(token);
        log.info("Deleted FCM token: {}", token);
    }
}
