package com.ebanking.ekycservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FptAiWebhookRequest {

    private String sessionId;
    private String transactionId;
    private String status;
    private String type;
    private Map<String, Object> data;
    private String errorMessage;
    private String errorCode;
    private Long timestamp;
}

