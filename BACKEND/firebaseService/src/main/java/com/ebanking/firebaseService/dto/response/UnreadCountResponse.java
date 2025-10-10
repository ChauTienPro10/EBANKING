    package com.ebanking.firebaseService.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UnreadCountResponse {
    private boolean success;
    private long unreadCount;
}

