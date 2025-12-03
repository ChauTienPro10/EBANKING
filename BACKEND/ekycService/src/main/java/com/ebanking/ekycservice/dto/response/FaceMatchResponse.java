package com.ebanking.ekycservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaceMatchResponse {
    private Boolean isMatched;
    private Double similarity; // Match FPT.AI API response field name
}
