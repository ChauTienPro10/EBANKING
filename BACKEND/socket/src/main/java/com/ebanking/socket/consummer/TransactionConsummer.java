package com.ebanking.socket.consummer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class TransactionConsummer {

    @KafkaListener(
            topics = "notify_transaction_socket",
            groupId = "socket-group"
    )
    @Retryable(
            maxAttempts = 3,
            backoff = @Backoff(delay = 2000, multiplier = 2)
    )
    public void handleTransactionEvent(String data) {
        log.info(data);
    }
}
