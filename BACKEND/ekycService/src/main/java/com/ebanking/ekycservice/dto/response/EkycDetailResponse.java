package com.ebanking.ekycservice.dto.response;

import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EkycDetailResponse {
    // Session info
    private String sessionId;
    private String status;
    private Long verifiedAt; // Unix timestamp in milliseconds

    // OCR data
    private String idNumber;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private LocalDate issueDate;
    private LocalDate expiryDate;

    // Image URLs (require authentication to access)
    private String frontImageUrl;
    private String backImageUrl;

    // Verification scores
    private Double ocrConfidence;
    private Double livenessConfidence;
    private Double faceMatchScore;
    private Boolean isLive;
    private Boolean faceMatched;
}
