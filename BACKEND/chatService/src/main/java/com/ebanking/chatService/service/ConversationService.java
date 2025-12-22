package com.ebanking.chatService.service;

import com.ebanking.chatService.dto.ConversationDto;
import com.ebanking.chatService.entity.Conversation;
import com.ebanking.chatService.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {
    
    private final ConversationRepository conversationRepository;
    
    /**
     * Get or create conversation between two users
     * Ensures user1_id < user2_id to match database constraint
     */
    @Transactional
    public Conversation getOrCreateConversation(String user1Id, String user2Id) {
        log.info("Getting or creating conversation between {} and {}", user1Id, user2Id);
        
        // Sort user IDs to ensure user1 < user2 (matches database CHECK constraint)
        String smaller = user1Id.compareTo(user2Id) < 0 ? user1Id : user2Id;
        String larger = user1Id.compareTo(user2Id) < 0 ? user2Id : user1Id;
        
        return conversationRepository.findByUsers(smaller, larger)
            .orElseGet(() -> {
                log.info("Creating new conversation between {} and {}", smaller, larger);
                Conversation conversation = Conversation.builder()
                    .user1Id(smaller)
                    .user2Id(larger)
                    .build();
                return conversationRepository.save(conversation);
            });
    }
    
    /**
     * Get all conversations for a user
     */
    public List<ConversationDto> getUserConversations(String userId) {
        log.info("Getting conversations for user: {}", userId);
        
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        
        return conversations.stream()
            .map(conv -> ConversationDto.builder()
                .id(conv.getId())
                .otherUserId(conv.getOtherUserId(userId))
                .otherUserName(conv.getOtherUserId(userId)) // TODO: Fetch from User Service
                .lastMessage("") // TODO: Fetch last message
                .lastMessageTime(conv.getLastMessageTime())
                .unreadCount(0) // TODO: Calculate unread count
                .build())
            .collect(Collectors.toList());
    }
}
