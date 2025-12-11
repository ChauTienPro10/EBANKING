package com.ebanking.ekycservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "face_auth_verification")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class FaceAuthVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Session ID from check-face-auth
    @Column(name = "session_id", nullable = false, unique = true)
    private String sessionId;

    // User who performed verification
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Video file path
    @Column(name = "video_path")
    private String videoPath;

    // Face image extracted from video
    @Column(name = "face_image_path")
    private String faceImagePath;

    // Liveness check results
    @Column(name = "is_live")
    private Boolean isLive;

    @Column(name = "liveness_confidence")
    private Double livenessConfidence;

    // Face matching results
    @Column(name = "face_match")
    private Boolean faceMatch;

    @Column(name = "face_match_score")
    private Double faceMatchScore;

    // Verification status
    @Column(name = "verified", nullable = false)
    private Boolean verified;

    // Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    // Transaction reference (if used)
    @Column(name = "transaction_id")
    private Long transactionId;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (verified != null && verified) {
            verifiedAt = LocalDateTime.now();
        }
    }
}
