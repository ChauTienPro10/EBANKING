package com.ebanking.chatService.controller;

import com.ebanking.chatService.dto.ChatMessageDto;
import com.ebanking.chatService.dto.ConversationDto;
import com.ebanking.chatService.dto.SendMessageRequest;
import com.ebanking.chatService.service.ChatService;
import com.ebanking.chatService.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    
    private final ChatService chatService;
    private final ConversationService conversationService;
    
    /**
     * Get all conversations for a user
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> getConversations(
            @RequestHeader("X-User-Id") String userId) {
        log.info("GET /api/chat/conversations - userId: {}", userId);
        return ResponseEntity.ok(conversationService.getUserConversations(userId));
    }
    
    /**
     * Get messages in a conversation
     */
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Page<ChatMessageDto>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("X-User-Id") String userId) {
        log.info("GET /api/chat/conversations/{}/messages - userId: {}, page: {}, size: {}", 
                conversationId, userId, page, size);
        return ResponseEntity.ok(chatService.getMessages(conversationId, userId, page, size));
    }
    
    /**
     * Send a message
     */
    @PostMapping("/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            @RequestHeader("X-User-Id") String userId) {
        log.info("POST /api/chat/messages - from: {}, to: {}", userId, request.getReceiverId());
        return ResponseEntity.ok(chatService.sendMessage(request, userId));
    }
    
    /**
     * Mark conversation as read
     */
    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long conversationId,
            @RequestHeader("X-User-Id") String userId) {
        log.info("PUT /api/chat/conversations/{}/read - userId: {}", conversationId, userId);
        chatService.markAsRead(conversationId, userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get unread message count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @RequestHeader("X-User-Id") String userId) {
        log.info("GET /api/chat/unread-count - userId: {}", userId);
        return ResponseEntity.ok(chatService.getUnreadCount(userId));
    }
}
