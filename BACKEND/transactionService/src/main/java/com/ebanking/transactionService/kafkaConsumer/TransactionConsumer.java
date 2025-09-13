package com.ebanking.transactionService.kafkaConsumer;

import com.ebanking.transactionService.entity.Transaction;
import com.ebanking.transactionService.enums.KafkaTopic;
import com.ebanking.transactionService.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class TransactionConsumer {
    @Autowired
    TransactionService transactionService;

    @KafkaListener(topics = KafkaTopic.TRANSACTION_TOPIC, groupId = "transaction-group")
    public void listenTransaction(Transaction transaction) {
        System.out.println(transaction.getDescription());
    }
}
