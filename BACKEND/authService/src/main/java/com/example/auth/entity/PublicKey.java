package com.example.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "public_key")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicKey {
    @Id
    @GeneratedValue
    long id;
    String username;
    long createdAt;
    long updatedAt;
    @Lob
    @Column(name = "public_key", nullable = false, columnDefinition = "LONGTEXT")
    private String publicKey;
}
