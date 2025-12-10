package com.ebanking.ekycservice.entity;


import com.ebanking.ekycservice.constant.EkycStatus;
import com.ebanking.ekycservice.constant.EkycStep;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ekyc_sessions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class EkycSession extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Long userId;

    @Enumerated(EnumType.STRING)
    private EkycStatus status;

    @Enumerated(EnumType.STRING)
    private EkycStep currentStep;

    private LocalDateTime expiredAt;

    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL)
    @JsonManagedReference // đầu "cha"
    private DocumentInfo documentInfo;

    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL)
    @JsonManagedReference
    private BiometricData biometricData;

//    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
//    @JsonManagedReference
//    private List<EkycLog> logs;
}

