package com.ebanking.ekycservice.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "biometric_data")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class BiometricData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "session_id")
    @JsonBackReference
    private EkycSession session;

    // Lưu đường dẫn file thay vì base64 (tối ưu database)
    // VD: videos/sessionId/liveness_sessionId_20241030_143022.mp4
    private String selfieVideoPath;

    private Double livenessScore;
    private Double faceMatchScore;
    private Boolean isLive;
    private Boolean isMatched;
}


