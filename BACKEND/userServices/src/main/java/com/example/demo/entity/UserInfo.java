package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "USER_INFO")
public class UserInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    private String email;

    private String phone;

    private String citizenId;

    private String permanentResident;

    private String birthday;

    private String placeOfIssuer;

    private String dateOfIssuer;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    @Column(nullable = false, updatable = false)
    private Timestamp createAt;

    @PrePersist
    protected void onCreate() {
        this.createAt = new Timestamp(System.currentTimeMillis());
    }
}
