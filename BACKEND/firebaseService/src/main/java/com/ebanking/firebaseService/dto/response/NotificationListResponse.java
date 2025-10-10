package com.ebanking.firebaseService.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationListResponse {
    private boolean success;
    private String message;
    private List<NotificationDTO> notifications;
    private int totalPages;
    private long totalElements;
    private int currentPage;
    private int pageSize;
    private long unreadCount;
}

