package com.ebanking.chatService.kafka;

import com.ebanking.chatService.dto.ChatMessageDto;
import com.ebanking.chatService.dto.TransactionEvent;
import com.ebanking.chatService.entity.ChatMessage;
import com.ebanking.chatService.entity.Conversation;
import com.ebanking.chatService.enums.MessageType;
import com.ebanking.chatService.repository.ChatMessageRepository;
import com.ebanking.chatService.repository.ConversationRepository;
import com.ebanking.chatService.service.ConversationService;
import com.ebanking.chatService.service.WebSocketService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionConsumer {
    
    private final ChatMessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationService conversationService;
    private final WebSocketService webSocketService;
    private final ObjectMapper objectMapper;
    
    @KafkaListener(topics = "transaction-notify", groupId = "chat-service-group")
    public void consumeTransactionNotification(String message) {
        log.info("📨 Received transaction notification from Kafka");
        
        try {
            // Parse transaction event
            TransactionEvent transaction = objectMapper.readValue(message, TransactionEvent.class);
            log.debug("Transaction details: {}", transaction);
            
            // Only process successful transactions
            if (!"SUCCESS".equalsIgnoreCase(transaction.getStatus())) {
                log.info("Skipping non-successful transaction: {}", transaction.getStatus());
                return;
            }
            
            // Create transaction notification messages for both sender and receiver
            createTransactionMessages(transaction);
            
        } catch (JsonProcessingException e) {
            log.error("❌ Error parsing transaction notification", e);
        } catch (Exception e) {
            log.error("❌ Error processing transaction notification", e);
        }
    }
    
    private void createTransactionMessages(TransactionEvent transaction) {
        log.info("Creating transaction messages for transaction: {}", transaction.getTransactionNumber());
        
        // Get or create conversation between sender and receiver
        Conversation conversation = conversationService.getOrCreateConversation(
            transaction.getSenderId(),
            transaction.getReceiverId()
        );
        
        // Create message for RECEIVER (you received money)
        createReceiverMessage(conversation, transaction);
        
        // Create message for SENDER (you sent money)
        createSenderMessage(conversation, transaction);
    }
    
    private void createReceiverMessage(Conversation conversation, TransactionEvent transaction) {
        try {
            // Format message content (Momo-style)
            String content = String.format(
                "💰 Bạn nhận được %,dđ\nTừ %s\nSố dư: %,dđ",
                transaction.getAmount(),
                transaction.getSenderName(),
                transaction.getReceiverNewBalance()
            );
            
            // Create metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("type", "RECEIVE");
            metadata.put("transactionId", transaction.getId());
            metadata.put("transactionNumber", transaction.getTransactionNumber());
            metadata.put("amount", transaction.getAmount());
            metadata.put("senderName", transaction.getSenderName());
            metadata.put("senderAccountNumber", transaction.getSenderAccountNumber());
            metadata.put("receiverName", transaction.getReceiverName());
            metadata.put("newBalance", transaction.getReceiverNewBalance());
            metadata.put("message", transaction.getMessage());
            metadata.put("timestamp", transaction.getTimestamp());
            
            // Create chat message
            ChatMessage chatMessage = ChatMessage.builder()
                .conversationId(conversation.getId())
                .senderId("SYSTEM")
                .receiverId(transaction.getReceiverId())
                .messageType(MessageType.TRANSACTION_NOTIFICATION)
                .content(content)
                .transactionId(transaction.getId())
                .metadata(objectMapper.writeValueAsString(metadata))
                .isRead(false)
                .build();
            
            chatMessage = messageRepository.save(chatMessage);
            log.info("✅ Created receiver message with ID: {}", chatMessage.getId());
            
            // Update conversation
            conversation.setLastMessageId(chatMessage.getId());
            conversation.setLastMessageTime(chatMessage.getCreatedAt());
            conversationRepository.save(conversation);
            
            // Send via WebSocket
            ChatMessageDto dto = toDto(chatMessage);
            webSocketService.sendMessageToUser(transaction.getReceiverId(), dto);
            
        } catch (Exception e) {
            log.error("Error creating receiver message", e);
        }
    }
    
    private void createSenderMessage(Conversation conversation, TransactionEvent transaction) {
        try {
            // Format message content (Momo-style)
            String content = String.format(
                "💸 Bạn đã chuyển %,dđ\nĐến %s\nSố dư: %,dđ",
                transaction.getAmount(),
                transaction.getReceiverName(),
                transaction.getSenderNewBalance()
            );
            
            // Create metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("type", "SEND");
            metadata.put("transactionId", transaction.getId());
            metadata.put("transactionNumber", transaction.getTransactionNumber());
            metadata.put("amount", transaction.getAmount());
            metadata.put("senderName", transaction.getSenderName());
            metadata.put("receiverName", transaction.getReceiverName());
            metadata.put("receiverAccountNumber", transaction.getReceiverAccountNumber());
            metadata.put("newBalance", transaction.getSenderNewBalance());
            metadata.put("message", transaction.getMessage());
            metadata.put("timestamp", transaction.getTimestamp());
            
            // Create chat message
            ChatMessage chatMessage = ChatMessage.builder()
                .conversationId(conversation.getId())
                .senderId("SYSTEM")
                .receiverId(transaction.getSenderId())
                .messageType(MessageType.TRANSACTION_NOTIFICATION)
                .content(content)
                .transactionId(transaction.getId())
                .metadata(objectMapper.writeValueAsString(metadata))
                .isRead(false)
                .build();
            
            chatMessage = messageRepository.save(chatMessage);
            log.info("✅ Created sender message with ID: {}", chatMessage.getId());
            
            // Send via WebSocket
            ChatMessageDto dto = toDto(chatMessage);
            webSocketService.sendMessageToUser(transaction.getSenderId(), dto);
            
        } catch (Exception e) {
            log.error("Error creating sender message", e);
        }
    }
    
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
