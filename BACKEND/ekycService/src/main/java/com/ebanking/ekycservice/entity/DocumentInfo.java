package com.ebanking.ekycservice.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "document_info")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DocumentInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "session_id")
    @JsonBackReference // đầu "con" -> không in lại session
    private EkycSession session;

    private String idNumber;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private LocalDate issueDate;
    private LocalDate expiryDate;

    // Lưu đường dẫn file thay vì base64 (tối ưu database)
    // VD: images/sessionId/front_sessionId_20241030_143022.jpg
    private String frontImagePath;
    private String backImagePath;
}

