package com.ebanking.chatbotService.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service quản lý lịch sử hội thoại của chatbot
 * Lưu trữ conversation history trong memory để chatbot có thể nhớ context
 */
@Service
@Slf4j
public class ConversationHistoryService {
    
    // Lưu trữ conversation history cho mỗi user
    // Key: username, Value: List of messages
    private final Map<String, List<ConversationMessage>> conversationHistory = new ConcurrentHashMap<>();
    
    // Giới hạn số lượng message lưu trữ cho mỗi user (để tránh memory overflow)
    private static final int MAX_HISTORY_SIZE = 10; // Lưu 10 cặp hội thoại gần nhất
    
    // Timeout để xóa conversation cũ (30 phút không hoạt động)
    private static final long CONVERSATION_TIMEOUT_MINUTES = 30;
    
    /**
     * Thêm message của user vào lịch sử
     */
    public void addUserMessage(String username, String message) {
        List<ConversationMessage> history = conversationHistory.computeIfAbsent(
            username, 
            k -> new ArrayList<>()
        );
        
        history.add(new ConversationMessage("user", message, LocalDateTime.now()));
        
        // Giới hạn kích thước history
        trimHistory(username);
        
        log.debug("Added user message for {}: {}", username, message);
    }
    
    /**
     * Thêm response của bot vào lịch sử
     */
    public void addBotMessage(String username, String message) {
        List<ConversationMessage> history = conversationHistory.computeIfAbsent(
            username, 
            k -> new ArrayList<>()
        );
        
        history.add(new ConversationMessage("assistant", message, LocalDateTime.now()));
        
        // Giới hạn kích thước history
        trimHistory(username);
        
        log.debug("Added bot message for {}", username);
    }
    
    /**
     * Lấy lịch sử hội thoại của user
     */
    public List<ConversationMessage> getHistory(String username) {
        List<ConversationMessage> history = conversationHistory.get(username);
        
        if (history == null) {
            return new ArrayList<>();
        }
        
        // Xóa conversation cũ nếu timeout
        cleanupOldConversations(username, history);
        
        return new ArrayList<>(history);
    }
    
    /**
     * Lấy lịch sử dưới dạng text để gửi cho AI
     */
    public String getHistoryAsText(String username) {
        List<ConversationMessage> history = getHistory(username);
        
        if (history.isEmpty()) {
            return "";
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append("\n\nLỊCH SỬ HỘI THOẠI GẦN ĐÂY:\n");
        
        for (ConversationMessage msg : history) {
            if ("user".equals(msg.getRole())) {
                sb.append("Người dùng: ").append(msg.getContent()).append("\n");
            } else {
                sb.append("Trợ lý: ").append(msg.getContent()).append("\n");
            }
        }
        
        sb.append("\n");
        
        return sb.toString();
    }
    
    /**
     * Xóa lịch sử hội thoại của user
     */
    public void clearHistory(String username) {
        conversationHistory.remove(username);
        log.info("Cleared conversation history for user: {}", username);
    }
    
    /**
     * Giới hạn số lượng message trong history
     */
    private void trimHistory(String username) {
        List<ConversationMessage> history = conversationHistory.get(username);
        
        if (history != null && history.size() > MAX_HISTORY_SIZE * 2) {
            // Giữ lại MAX_HISTORY_SIZE cặp hội thoại gần nhất
            int removeCount = history.size() - (MAX_HISTORY_SIZE * 2);
            history.subList(0, removeCount).clear();
            
            log.debug("Trimmed history for user {}, removed {} old messages", username, removeCount);
        }
    }
    
    /**
     * Xóa conversation cũ nếu quá timeout
     */
    private void cleanupOldConversations(String username, List<ConversationMessage> history) {
        if (history.isEmpty()) {
            return;
        }
        
        ConversationMessage lastMessage = history.get(history.size() - 1);
        LocalDateTime lastTime = lastMessage.getTimestamp();
        
        if (lastTime.plusMinutes(CONVERSATION_TIMEOUT_MINUTES).isBefore(LocalDateTime.now())) {
            conversationHistory.remove(username);
            log.info("Cleared expired conversation for user: {}", username);
        }
    }
    
    /**
     * Class đại diện cho một message trong conversation
     */
    public static class ConversationMessage {
        private final String role; // "user" hoặc "assistant"
        private final String content;
        private final LocalDateTime timestamp;
        
        public ConversationMessage(String role, String content, LocalDateTime timestamp) {
            this.role = role;
            this.content = content;
            this.timestamp = timestamp;
        }
        
        public String getRole() {
            return role;
        }
        
        public String getContent() {
            return content;
        }
        
        public LocalDateTime getTimestamp() {
            return timestamp;
        }
    }
}
