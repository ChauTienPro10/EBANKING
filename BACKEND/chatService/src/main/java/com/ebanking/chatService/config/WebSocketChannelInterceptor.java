package com.ebanking.chatService.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
@Slf4j
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Extract userId from CONNECT headers
            String userId = accessor.getFirstNativeHeader("X-User-Id");
            
            if (userId != null) {
                // Store userId in session attributes
                accessor.getSessionAttributes().put("userId", userId);
                
                // CRITICAL: Set user Principal for Spring WebSocket routing
                // Without this, convertAndSendToUser() cannot route messages to specific users
                accessor.setUser(new Principal() {
                    @Override
                    public String getName() {
                        return userId;
                    }
                });
                
                log.info("WebSocket CONNECT: userId={}, Principal set", userId);
            } else {
                log.warn("WebSocket CONNECT without X-User-Id header");
            }
        }
        
        return message;
    }
}
