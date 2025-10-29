package com.ebanking.ekycservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor @AllArgsConstructor
public class OrcRequest {
    private String sessionId;
    private String frontImageBase64;
    private String backImageBase64;
}
