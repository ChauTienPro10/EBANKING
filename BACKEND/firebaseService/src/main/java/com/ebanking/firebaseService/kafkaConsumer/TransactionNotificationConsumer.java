package com.ebanking.firebaseService.kafkaConsumer;

import com.ebanking.firebaseService.dto.TransactionEvent;
import com.ebanking.firebaseService.service.FCMService;
import com.ebanking.firebaseService.service.UserLookupService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class TransactionNotificationConsumer {

    @Autowired
    private FCMService fcmService;

    @Autowired
    private UserLookupService userLookupService;

   //kafka listener with retry mechanism for transaction events
    @KafkaListener(
        topics = "transaction", 
        groupId = "firebase-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    @Retryable(
        maxAttempts = 3,
        backoff = @Backoff(delay = 2000, multiplier = 2)
    )
    public void handleTransactionEvent(TransactionEvent transactionEvent, Acknowledgment acknowledgment) {
        log.info("Received transaction event: {} for transaction ID: {}", 
            transactionEvent.getStatus(), transactionEvent.getTransactionId());
        
        try {
            // gửi notification cho người gửi
            if (transactionEvent.getUsername() != null && !transactionEvent.getUsername().trim().isEmpty()) {
                sendNotificationToUser(transactionEvent, transactionEvent.getUsername(), "sender");
            } else {
                log.warn("Transaction event missing sender username: {}", transactionEvent.getTransactionId());
            }
            
            // gửi notification cho người nhận (nếu không phải chuyển cho chính mình)
            if (transactionEvent.getReceiverAccountNumber() != null && 
                !transactionEvent.getReceiverAccountNumber().equals(transactionEvent.getSenderAccountNumber())) {
                
                userLookupService.getUsernameByAccountNumber(transactionEvent.getReceiverAccountNumber())
                    .ifPresentOrElse(
                        receiverUsername -> {
                            sendNotificationToUser(transactionEvent, receiverUsername, "receiver");
                            log.info("Sent notification to receiver: {}", receiverUsername);
                        },
                        () -> log.warn("Could not find username for receiver account: {}", 
                            transactionEvent.getReceiverAccountNumber())
                    );
            }
            
            // acknowledge message sau khi xử lý thành công
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
            }
            
        } catch (Exception e) {
            log.error("Error processing transaction event {}: {}", 
                transactionEvent.getTransactionId(), e.getMessage(), e);
                // Không acknowledge để Kafka retry
                throw new RuntimeException("Failed to process transaction notification", e);
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
