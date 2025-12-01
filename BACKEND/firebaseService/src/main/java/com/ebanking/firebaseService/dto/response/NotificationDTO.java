package com.ebanking.firebaseService.dto.response;

import com.ebanking.firebaseService.entity.NotiTransaction;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String username;

    private String title;
    private String body;
    private String type;
    private String data;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String transactionId;
    private String amount;
    private String transactionStatus;

}

