package com.ebanking.emailService.kafkaConsumer;

import com.ebanking.emailService.dto.Transaction;
import com.ebanking.emailService.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class TransactionConsumer {
    @Autowired
    private EmailService emailService;

    @KafkaListener(topics = "transfer-send-email", groupId = "email-group")
    public void listenTranserSendEmail(Transaction transaction) {
        Map<String, String> placeholders = new HashMap<>();
        placeholders.put("userName", transaction.getUsername());
        placeholders.put("account_sender", transaction.getSenderAccountNumber());
        placeholders.put("account_recever", transaction.getReceiverAccountNumber());
        placeholders.put("amount", String.valueOf(transaction.getAmount()));
        placeholders.put("transactionAt", String.valueOf(transaction.getTransactionAt()));
        placeholders.put("transaction_note", transaction.getDescription());
        emailService.sendSimpleEmail("chauduongphattien2201@gmail.com", "transfer_send_email", placeholders);
    }
}
