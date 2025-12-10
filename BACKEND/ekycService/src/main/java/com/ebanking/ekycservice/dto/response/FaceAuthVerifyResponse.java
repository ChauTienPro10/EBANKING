package com.ebanking.ekycservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor @AllArgsConstructor
public class FaceAuthVerifyResponse {
    private Boolean verified;
    private String sessionId;
    private Double confidence;
    private String message;
}
