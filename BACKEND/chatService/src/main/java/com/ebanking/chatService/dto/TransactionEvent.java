package com.ebanking.chatService.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TransactionEvent {
    
    @JsonProperty(value = "id", access = JsonProperty.Access.WRITE_ONLY)
    private Long id;
    
    @JsonProperty("transactionId")
    private void setTransactionId(Long transactionId) {
        this.id = transactionId;
    }
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
