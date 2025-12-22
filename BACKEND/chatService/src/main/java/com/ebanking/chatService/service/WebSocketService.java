package com.ebanking.chatService.service;

import com.ebanking.chatService.dto.ChatMessageDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {
    
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Send message to a specific user via WebSocket
     */
    public void sendMessageToUser(String userId, ChatMessageDto message) {
        log.info("Sending message to user: {}", userId);
        try {
            messagingTemplate.convertAndSendToUser(
                userId, 
                "/queue/messages", 
                message
            );
            log.debug("Message sent successfully to user: {}", userId);
        } catch (Exception e) {
            log.error("Error sending message to user: {}", userId, e);
        }
    }
    
    /**
     * Send transaction notification to user
     */
    public void sendTransactionNotification(String userId, ChatMessageDto message) {
        log.info("Sending transaction notification to user: {}", userId);
        try {
            messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                message
            );
            log.debug("Transaction notification sent to user: {}", userId);
        } catch (Exception e) {
            log.error("Error sending transaction notification to user: {}", userId, e);
        }
    }
}
