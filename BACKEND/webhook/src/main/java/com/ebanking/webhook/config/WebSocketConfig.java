package com.ebanking.webhook.config;

import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // endpoint WebSocket
                .setAllowedOrigins("*") // cho phép mọi domain (có thể chỉnh cụ thể)
                .withSockJS(); // fallback khi không hỗ trợ WS
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Client subscribe /topic/** để nhận tin
        registry.enableSimpleBroker("/topic", "/queue");

        // Client gửi message tới /app/**
        registry.setApplicationDestinationPrefixes("/app");
    }
}
