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
@Table(name = "DB_PIN_CODE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PinCode {
    @Id
    @GeneratedValue
    long id;
    long userId;
    String pinCode;
    long CreatedAt;
    long updatedAt;
}
