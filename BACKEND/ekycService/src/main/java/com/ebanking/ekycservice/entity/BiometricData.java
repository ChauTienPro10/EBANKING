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

    @Column(columnDefinition = "TEXT")
    private String selfieVideoUrl;

    private Double livenessScore;
    private Double faceMatchScore;
    private Boolean isLive;
    private Boolean isMatched;
}


