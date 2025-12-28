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
@Table(name = "transaction_payload")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionPayload {
    @Id
    @GeneratedValue
    Long id;
    String username;
    String payload;
    long createAt;
    long updatedAt;
}
