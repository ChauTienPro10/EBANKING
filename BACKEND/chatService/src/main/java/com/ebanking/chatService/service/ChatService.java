package com.ebanking.chatService.service;

import com.ebanking.chatService.dto.ChatMessageDto;
import com.ebanking.chatService.dto.SendMessageRequest;
import com.ebanking.chatService.entity.ChatMessage;
import com.ebanking.chatService.entity.Conversation;
import com.ebanking.chatService.enums.MessageType;
import com.ebanking.chatService.repository.ChatMessageRepository;
import com.ebanking.chatService.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    
    private final ChatMessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationService conversationService;
    private final WebSocketService webSocketService;
    
    /**
     * Send a text message
     */
    @Transactional
    public ChatMessageDto sendMessage(SendMessageRequest request, String senderId) {
        log.info("Sending message from {} to {}", senderId, request.getReceiverId());
        
        // Get or create conversation
        Conversation conversation = conversationService.getOrCreateConversation(
            senderId, 
            request.getReceiverId()
        );
        
        // Create message
        ChatMessage message = ChatMessage.builder()
            .conversationId(conversation.getId())
            .senderId(senderId)
            .receiverId(request.getReceiverId())
            .messageType(MessageType.TEXT)
            .content(request.getContent())
            .isRead(false)
            .build();
        
        message = messageRepository.save(message);
        log.info("Message saved with ID: {}", message.getId());
        
        // Update conversation
        conversation.setLastMessageId(message.getId());
        conversation.setLastMessageTime(message.getCreatedAt());
        conversationRepository.save(conversation);
        
        // Send via WebSocket to BOTH sender and receiver
        ChatMessageDto dto = toDto(message);
        
        // Send to receiver
        webSocketService.sendMessageToUser(request.getReceiverId(), dto);
        log.info("Message sent to receiver: {}", request.getReceiverId());
        
        // Send to sender (so they see their own message in real-time)
        webSocketService.sendMessageToUser(senderId, dto);
        log.info("Message sent to sender: {}", senderId);
        
        return dto;
    }
    
    /**
     * Get messages in a conversation with pagination
     * Only returns messages that the user is involved in (as sender or receiver)
     */
    public Page<ChatMessageDto> getMessages(Long conversationId, String userId, int page, int size) {
        log.info("Getting messages for conversation: {}, userId: {}, page: {}, size: {}", 
                conversationId, userId, page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByConversationIdAndUserIdOrderByCreatedAtDesc(
                conversationId, userId, pageable)
            .map(this::toDto);
    }
    
    /**
     * Mark messages as read
     */
    @Transactional
    public void markAsRead(Long conversationId, String userId) {
        log.info("Marking messages as read for conversation: {}, user: {}", conversationId, userId);
        messageRepository.markConversationAsRead(conversationId, userId);
    }
    
    /**
     * Get unread message count for a user
     */
    public long getUnreadCount(String userId) {
        log.info("Getting unread count for user: {}", userId);
        return messageRepository.countUnreadMessages(userId);
    }
    
    /**
     * Convert entity to DTO
     */
    private ChatMessageDto toDto(ChatMessage message) {
        return ChatMessageDto.builder()
            .id(message.getId())
            .conversationId(message.getConversationId())
            .senderId(message.getSenderId())
            .receiverId(message.getReceiverId())
            .messageType(message.getMessageType())
            .content(message.getContent())
            .transactionId(message.getTransactionId())
            .metadata(message.getMetadata())
            .isRead(message.getIsRead())
            .createdAt(message.getCreatedAt())
            .build();
    }
}
