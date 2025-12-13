package com.example.auth.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "INVALID_TOKEN")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvalidToken {
    @Id
    @GeneratedValue
    long id;
    String token;
}
