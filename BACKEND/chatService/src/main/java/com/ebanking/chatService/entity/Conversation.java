package com.ebanking.chatService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_conversations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user1_id", nullable = false)
    private String user1Id;
    
    @Column(name = "user2_id", nullable = false)
    private String user2Id;
    
    @Column(name = "last_message_id")
    private Long lastMessageId;
    
    @Column(name = "last_message_time")
    private LocalDateTime lastMessageTime;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * Check if user is part of this conversation
     */
    public boolean hasUser(String userId) {
        return user1Id.equals(userId) || user2Id.equals(userId);
    }
    
    /**
     * Get the other user in conversation
     */
    public String getOtherUserId(String userId) {
        return user1Id.equals(userId) ? user2Id : user1Id;
    }
}
