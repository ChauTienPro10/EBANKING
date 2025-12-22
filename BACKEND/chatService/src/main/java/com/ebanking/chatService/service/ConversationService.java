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
     */
    @Transactional
    public Conversation getOrCreateConversation(String user1Id, String user2Id) {
        log.info("Getting or creating conversation between {} and {}", user1Id, user2Id);
        
        return conversationRepository.findByUsers(user1Id, user2Id)
            .orElseGet(() -> {
                log.info("Creating new conversation between {} and {}", user1Id, user2Id);
                Conversation conversation = Conversation.builder()
                    .user1Id(user1Id)
                    .user2Id(user2Id)
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
