package com.ebanking.transactionService.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @Column(nullable = false)
    String username;

    @Column(nullable = false)
    private String senderAccountNumber;

    @Column(nullable = false)
    private String receiverAccountNumber;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false)
    private String transactionType;

    @Column(nullable = false)
    private String status;

    private String description;

    @Column(name = "purpose_code", length = 20)
    private String purposeCode;

    private String failureReason;

    private LocalDateTime transactionAt;

    // Face authentication fields
    @Column(name = "requires_face_auth")
    private Boolean requiresFaceAuth = false;

    @Column(name = "face_auth_session_id", length = 36)
    private  String faceAuthSessionId;

    @Column(name = "face_auth_verified")
    private Boolean faceAuthVerified = false;

    @Column(name = "face_auth_at")
    private LocalDateTime faceAuthAt;

}
