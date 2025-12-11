package com.example.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaceAuthCheckResponse {
    private Boolean required;
    private String reason; // "HIGH_AMOUNT", "DAILY_LIMIT", etc.
    private String message;
    private String sessionId; // Generate new session ID if required is true
}
