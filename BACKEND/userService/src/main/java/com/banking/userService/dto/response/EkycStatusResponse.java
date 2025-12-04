package com.banking.userService.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EkycStatusResponse {
    private String status; // NOT_VERIFIED, VERIFIED, EXPIRED, REJECTED
    private UUID sessionId;
    private LocalDateTime verifiedAt;
    private Boolean canRetry; // true if user can do eKYC again
}
