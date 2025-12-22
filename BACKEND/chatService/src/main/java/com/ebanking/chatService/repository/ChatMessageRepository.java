package com.ebanking.chatService.repository;

import com.ebanking.chatService.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    /**
     * Find messages in a conversation with pagination, newest first
     */
    Page<ChatMessage> findByConversationIdOrderByCreatedAtDesc(
        Long conversationId, 
        Pageable pageable
    );
    
    /**
     * Count unread messages for a user
     */
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE " +
           "m.receiverId = :userId AND m.isRead = false")
    long countUnreadMessages(@Param("userId") String userId);
    
    /**
     * Mark all messages in a conversation as read for a user
     */
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE " +
           "m.conversationId = :conversationId AND m.receiverId = :userId AND m.isRead = false")
    void markConversationAsRead(@Param("conversationId") Long conversationId, 
                                @Param("userId") String userId);
}
