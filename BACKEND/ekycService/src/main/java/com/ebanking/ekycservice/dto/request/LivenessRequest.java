package com.ebanking.ekycservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor @AllArgsConstructor
public class LivenessRequest {
    private String sessionId;
    private String videoBase64;
}
