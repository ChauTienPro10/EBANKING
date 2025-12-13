package com.example.auth.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "NOTIFY_STATUS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotifyStatus {
    @Id
    @GeneratedValue
    long id;
    Long userId;
    Long notifyId;
    boolean seen;
    long seenAt;
}
