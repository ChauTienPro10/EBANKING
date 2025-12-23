package com.ebanking.chatService.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

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
                accessor.getSessionAttributes().put("userId", userId);
                log.info("WebSocket CONNECT: userId={}", userId);
            } else {
                log.warn("WebSocket CONNECT without X-User-Id header");
            }
        }
        
        return message;
    }
}
