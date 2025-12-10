package com.ebanking.ekycservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class OrcResponse {
    private String sessionId;
    private String idNumber;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private Double confidence;

    // File paths for images
    private String frontImagePath;
    private String backImagePath;
}
