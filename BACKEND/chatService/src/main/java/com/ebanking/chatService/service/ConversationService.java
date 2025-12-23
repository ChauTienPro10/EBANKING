package com.ebanking.chatService.service;

import com.ebanking.chatService.dto.ConversationDto;
import com.ebanking.chatService.entity.ChatMessage;
import com.ebanking.chatService.entity.Conversation;
import com.ebanking.chatService.repository.ChatMessageRepository;
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
    private final ChatMessageRepository chatMessageRepository;
    private final com.ebanking.chatService.client.TransactionServiceClient transactionServiceClient;
    private final com.ebanking.chatService.client.UserGrpcClient userGrpcClient;

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
                .map(conv -> {
                    // Fetch latest message for THIS USER (not from lastMessageId)
                    // This ensures each user sees their own transaction message
                    String lastMessage = "";
                    String lastMessageSenderId = null;

                    ChatMessage latestMsg = chatMessageRepository.findLatestMessageForUser(
                            conv.getId(),
                            userId);

                    if (latestMsg != null) {
                        lastMessage = latestMsg.getContent();
                        lastMessageSenderId = latestMsg.getSenderId();
                    }

                    // Calculate unread count for this conversation
                    long unreadCount = chatMessageRepository.countUnreadMessagesByConversation(
                            conv.getId(),
                            userId);

                    // Fetch username: accountNumber → userId → username
                    String otherAccountNumber = conv.getOtherUserId(userId);
                    String otherUserName = otherAccountNumber; // Fallback to account number

                    try {
                        Long otherUserId = transactionServiceClient.getUserIdByAccountNumber(otherAccountNumber);
                        if (otherUserId != null) {
                            String fullName = userGrpcClient.getFullNameById(otherUserId);
                            if (fullName != null && !fullName.isEmpty()) {
                                otherUserName = fullName;
                                log.debug("Resolved full name for userId {}: {}", otherUserId, fullName);
                            } else {
                                log.debug("Full name not found for userId: {}, using account number", otherUserId);
                            }
                        } else {
                            log.debug("UserId not found for account: {}", otherAccountNumber);
                        }
                    } catch (Exception e) {
                        log.warn("Failed to fetch full name for account {} (userId lookup failed): {}",
                                otherAccountNumber, e.getMessage());
                    }

                    return ConversationDto.builder()
                            .id(conv.getId())
                            .otherUserId(otherAccountNumber)
                            .otherUserName(otherUserName)
                            .lastMessage(lastMessage)
                            .lastMessageSenderId(lastMessageSenderId)
                            .lastMessageTime(conv.getLastMessageTime())
                            .unreadCount((int) unreadCount)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
