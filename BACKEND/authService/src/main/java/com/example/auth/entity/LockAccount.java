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
@Table(name = "LOCK_ACCOUNT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LockAccount {
    @Id
    @GeneratedValue
    long id;
    Long userId;
    Long accountId;
    Long lockedAt;
}
