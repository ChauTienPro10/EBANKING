package com.ebanking.firebaseService.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionNotificationRequest {
    private Long userId;
    private String username;
    private String transactionId;
    private String amount;
    private String status; // PENDING, SUCCESS, FAILED
    private String reason; // ly do that bai (neu co)
}
