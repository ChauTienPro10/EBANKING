package com.ebanking.chatbotService.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserInfo {
    private Long id;
    private String fullName;
    private String citizenId;
    private Long birthday;
    private String email;
    private String phone;
    private Boolean isMale;
    private String address;
    private Long createAt;
    private Long updatedAt;
    private User user;
    private UUID ekycSessionId;
    private String ekycStatus;
    private LocalDateTime ekycVerifiedAt;
    private String avatarPath;
    private Boolean faceAuthEnabled;
    private BigDecimal dailyTransactionLimit;
}