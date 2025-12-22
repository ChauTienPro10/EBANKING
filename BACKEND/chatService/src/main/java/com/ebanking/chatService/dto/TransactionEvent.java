package com.ebanking.chatService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEvent {
    private Long id;
    private String transactionNumber;
    private String type;
    private String senderId;
    private String senderName;
    private String senderAccountNumber;
    private String receiverId;
    private String receiverName;
    private String receiverAccountNumber;
    private Long amount;
    private Long senderNewBalance;
    private Long receiverNewBalance;
    private String message;
    private String status;
    private String timestamp;
}
