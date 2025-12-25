package com.ebanking.chatService.controller;

import com.ebanking.chatService.dto.SendMessageRequest;
import com.ebanking.chatService.dto.TypingIndicatorRequest;
import com.ebanking.chatService.dto.TypingIndicatorDto;
import com.ebanking.chatService.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {
    
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Handle incoming chat messages via WebSocket
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request,
                           SimpMessageHeaderAccessor headerAccessor) {
        String senderId = (String) headerAccessor.getSessionAttributes().get("userId");
        log.info("WebSocket message from {} to {}", senderId, request.getReceiverId());
        
        if (senderId != null) {
            chatService.sendMessage(request, senderId);
        } else {
            log.warn("Message received without userId in session");
        }
    }
    
    /**
     * Handle typing indicators via WebSocket
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingIndicatorRequest request,
                            SimpMessageHeaderAccessor headerAccessor) {
        String senderId = (String) headerAccessor.getSessionAttributes().get("userId");
        log.info("Typing indicator from {} to {}: {}", senderId, request.getReceiverId(), request.isTyping());
        
        if (senderId != null) {
            // Broadcast typing status to receiver
            TypingIndicatorDto dto = TypingIndicatorDto.builder()
                .senderId(senderId)
                .isTyping(request.isTyping())
                .build();
                
            messagingTemplate.convertAndSendToUser(
                request.getReceiverId(),
                "/queue/typing",
                dto
            );
            
            log.debug("Typing indicator sent to user: {}", request.getReceiverId());
        } else {
            log.warn("Typing indicator received without userId in session");
        }
    }
}
