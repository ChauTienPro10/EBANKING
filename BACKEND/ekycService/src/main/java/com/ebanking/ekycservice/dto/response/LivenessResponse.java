package com.ebanking.ekycservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor @AllArgsConstructor
public class LivenessResponse {
    // Mục đích: Chứa kết quả kiểm tra tính sống động của khuôn mặt trong video.
    private Boolean isLive;
    private Double confidence;
}
