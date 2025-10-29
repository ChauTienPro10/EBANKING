package com.ebanking.ekycservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor @AllArgsConstructor
public class SessionResponse {
    // Mục đích: Lưu trữ thông tin về phiên eKYC bao gồm ID phiên, trạng thái hiện tại, bước hiện tại và thời gian hết hạn.
    private String sessionId;
    private String status;
    private String currentStep;
    private LocalDateTime expriesAt;
}
