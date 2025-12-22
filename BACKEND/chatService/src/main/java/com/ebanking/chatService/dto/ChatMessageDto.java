package com.ebanking.chatService.dto;

import com.ebanking.chatService.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long id;
    private Long conversationId;
    private String senderId;
    private String receiverId;
    private MessageType messageType;
    private String content;
    private Long transactionId;
    private String metadata;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
