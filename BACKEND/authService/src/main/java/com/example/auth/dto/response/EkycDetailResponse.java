package com.example.auth.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EkycDetailResponse {
    // Session info
    private String sessionId;
    private String status;
    private LocalDateTime verifiedAt;

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
    private String portraitImageUrl;

    // Verification scores
    private Double ocrConfidence;
    private Double livenessConfidence;
    private Double faceMatchScore;
    private Boolean isLive;
    private Boolean faceMatched;
}
