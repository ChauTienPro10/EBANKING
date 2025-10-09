package com.ebanking.firebaseService.kafkaConsumer;

import com.ebanking.firebaseService.dto.TransactionEvent;
import com.ebanking.firebaseService.service.FCMService;
import com.ebanking.firebaseService.service.UserLookupService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class TransactionNotificationConsumer {

    @Autowired
    private FCMService fcmService;

    @Autowired
    private UserLookupService userLookupService;

    @KafkaListener(topics = "transaction", groupId = "firebase-group")
    public void handleTransactionEvent(TransactionEvent transactionEvent) {
        log.info("Received transaction event: {}", transactionEvent);
        
        try {
            // gởi noti cho người gửi (username)
            if (transactionEvent.getUsername() != null) {
                sendNotificationToUser(transactionEvent, transactionEvent.getUsername(), "sender");
            }
            
            // gởi noti cho người nhận nếu có
            if (transactionEvent.getReceiverAccountNumber() != null && 
                !transactionEvent.getReceiverAccountNumber().equals(transactionEvent.getSenderAccountNumber())) {
                
                String receiverUsername = userLookupService.getUsernameByAccountNumber(transactionEvent.getReceiverAccountNumber());
                if (receiverUsername != null) {
                    sendNotificationToUser(transactionEvent, receiverUsername, "receiver");
                } else {
                    log.warn("Could not find username for receiver account: {}", transactionEvent.getReceiverAccountNumber());
                }
            }
            
        } catch (Exception e) {
            log.error("Error processing transaction event: {}", e.getMessage(), e);
        }
    }

    private void sendNotificationToUser(TransactionEvent transactionEvent, String username, String userRole) {
        String amount = transactionEvent.getAmount().toString();
        String transactionId = transactionEvent.getTransactionId().toString();
        
        try {
            switch (transactionEvent.getStatus().toUpperCase()) {
                case "PENDING":
                    fcmService.sendTransactionPendingNotificationByUsername(username, transactionId, amount);
                    log.info("Sent pending notification to user {} (role: {})", username, userRole);
                    break;
                    
                case "SUCCESS":
                    fcmService.sendTransactionSuccessNotificationByUsername(username, transactionId, amount);
                    log.info("Sent success notification to user {} (role: {})", username, userRole);
                    break;
                    
                case "FAILED":
                    String reason = transactionEvent.getFailureReason() != null ? 
                            transactionEvent.getFailureReason() : "Không xác định";
                    fcmService.sendTransactionFailedNotificationByUsername(username, transactionId, amount, reason);
                    log.info("Sent failed notification to user {} (role: {})", username, userRole);
                    break;
                    
                default:
                    log.warn("Unknown transaction status: {}", transactionEvent.getStatus());
            }
        } catch (Exception e) {
            log.error("Error sending notification to user {} (role: {}): {}", username, userRole, e.getMessage());
        }
    }
}
