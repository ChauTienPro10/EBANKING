package com.ebanking.chatService.repository;

import com.ebanking.chatService.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    /**
     * Find conversation between two users (order doesn't matter)
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.user1Id = :user1 AND c.user2Id = :user2) OR " +
           "(c.user1Id = :user2 AND c.user2Id = :user1)")
    Optional<Conversation> findByUsers(@Param("user1") String user1, 
                                       @Param("user2") String user2);
    
    /**
     * Find all conversations for a user, ordered by last message time
     * Use createdAt as fallback when lastMessageTime is null
     */
    @Query("SELECT c FROM Conversation c WHERE " +
           "c.user1Id = :userId OR c.user2Id = :userId " +
           "ORDER BY COALESCE(c.lastMessageTime, c.createdAt) DESC")
    List<Conversation> findByUserId(@Param("userId") String userId);
}
