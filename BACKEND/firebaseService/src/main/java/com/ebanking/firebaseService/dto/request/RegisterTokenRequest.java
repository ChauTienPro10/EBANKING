package com.ebanking.firebaseService.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterTokenRequest {
    private Long userId;
    private String username;
    private String deviceId;
    private String token;
}
