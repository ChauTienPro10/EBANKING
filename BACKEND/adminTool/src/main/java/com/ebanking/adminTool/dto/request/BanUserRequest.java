package com.ebanking.admintool.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for banning user account
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BanUserRequest {

    /**
     * User ID to ban
     */
    private Long userId;

    /**
     * Reason for banning
     */
    private String reason;
}

