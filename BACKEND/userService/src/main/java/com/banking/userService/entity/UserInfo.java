package com.banking.userService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_info")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserInfo {

    @Id
    @GeneratedValue
    private Long id;

    private String fullName;

    @Column(nullable = false, unique = true)
    private String citizenId;

    private Long birthday;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phone;

    private Boolean isMale;

    private String address;

    private Long createAt;

    private Long updatedAt;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    /**
     * Reference to eKYC session in EkycService
     * This creates loose coupling between services
     */
    @Column(name = "ekyc_session_id")
    private UUID ekycSessionId;

    /**
     * eKYC verification status
     * Values: NOT_VERIFIED, VERIFIED, EXPIRED, REJECTED
     */
    @Column(name = "ekyc_status")
    private String ekycStatus; // Default: "NOT_VERIFIED"

    /**
     * Timestamp when eKYC was verified
     */
    @Column(name = "ekyc_verified_at")
    private LocalDateTime ekycVerifiedAt;

    /**
     * Avatar image path
     * Stores relative path to avatar file (e.g., "avatars/123/avatar_123_20241208.jpg")
     */
    @Column(name = "avatar_path")
    private String avatarPath;

    @Column(name = "face_auth_enabled")
    private Boolean faceAuthEnabled = false;

    @Column(name = "daily_transaction_limit", precision = 19, scale = 2)
    private BigDecimal dailyTransactionLimit = new BigDecimal("50000000.00");


}
