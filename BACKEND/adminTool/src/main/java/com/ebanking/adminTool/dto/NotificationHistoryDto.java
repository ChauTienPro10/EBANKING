package com.ebanking.adminTool.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationHistoryDto {
    private Long id;
    private String title;
    private String content;
    private String type; // SYSTEM, PERSONAL, TRANSACTION
    private Long createdAt;
    private String username; // For personal notifications
    private String sender; // For transaction notifications
    private String amount; // For transaction notifications
    private String status; // For transaction notifications
    private String noiDungGiaoDich; // For transaction notifications
}