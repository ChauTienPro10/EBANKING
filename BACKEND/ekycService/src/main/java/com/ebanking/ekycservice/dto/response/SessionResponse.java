package com.ebanking.ekycservice.dto.response;

import com.ebanking.ekycservice.constant.EkycStatus;
import com.ebanking.ekycservice.constant.EkycStep;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private String sessionId;
    private EkycStatus status;
    private EkycStep currentStep;
    private LocalDateTime expiresAt;
}

