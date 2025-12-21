package com.banking.userService.dto.response;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EkycStatusResponse {
    private String status; // NOT_VERIFIED, VERIFIED, EXPIRED, REJECTED
    private UUID sessionId;
    private Long verifiedAt; // Unix timestamp in milliseconds
    private Boolean canRetry; // true if user can do eKYC again
}
