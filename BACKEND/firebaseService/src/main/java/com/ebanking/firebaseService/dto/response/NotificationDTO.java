package com.ebanking.firebaseService.dto.response;

import com.ebanking.firebaseService.entity.Notification;
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

    // chuyển entity to DTO
    public static NotificationDTO fromEntity(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .username(notification.getUsername())
                .title(notification.getTitle())
                .body(notification.getBody())
                .type(notification.getType())
                .data(notification.getData())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .transactionId(notification.getTransactionId())
                .amount(notification.getAmount())
                .transactionStatus(notification.getTransactionStatus())
                .build();
    }
}

