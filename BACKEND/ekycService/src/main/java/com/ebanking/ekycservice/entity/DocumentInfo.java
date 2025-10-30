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

    @Column(columnDefinition = "TEXT")
    private String frontImageUrl;

    @Column(columnDefinition = "TEXT")
    private String backImageUrl;

    @Column(columnDefinition = "TEXT")
    private String portraitImageUrl;
}

