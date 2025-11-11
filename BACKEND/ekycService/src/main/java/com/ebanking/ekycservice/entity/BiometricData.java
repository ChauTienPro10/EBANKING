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
    private String videoPath;

    // Ảnh khuôn mặt được trích xuất từ video liveness
    private String faceImagePath;

    // Liveness check results
    private Boolean isLive;
    private Double livenessConfidence;  // Độ tin cậy liveness (0.0 - 1.0)

    // Face matching results
    private Boolean faceMatch;  // Kết quả so khớp khuôn mặt (true/false)
    private Double faceMatchScore;  // Điểm tương đồng (0.0 - 1.0)
}


