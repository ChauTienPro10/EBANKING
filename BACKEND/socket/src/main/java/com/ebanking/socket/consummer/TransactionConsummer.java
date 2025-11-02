package com.ebanking.socket.consummer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class TransactionConsummer {

    @Autowired
    SimpMessagingTemplate simpMessagingTemplate;

    @KafkaListener(
            topics = "notify_transaction_socket",
            groupId = "socket-group"
    )
    @Retryable(
            maxAttempts = 3,
            backoff = @Backoff(delay = 2000, multiplier = 2)
    )
    public void handleTransactionEvent(String data) throws JsonProcessingException {
        log.info(data);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(data);
        String username = node.get("username").asText();
        simpMessagingTemplate.convertAndSend("/topic/trans-subscribe/" + username, data);
    }
}
