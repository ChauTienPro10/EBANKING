package com.banking.userService.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    // Basic info
    private Long id;
    private String username;
    private String fullName;
    private String citizenId;
    private Long birthday;
    private String email;
    private String phone;
    private Boolean isMale;
    private String address;
    private Long createAt;
    private Long updatedAt;

    // eKYC Integration
    private UUID ekycSessionId;
    private String ekycStatus;
    private LocalDateTime ekycVerifiedAt;

    // Avatar
    private String avatarUrl;
}
