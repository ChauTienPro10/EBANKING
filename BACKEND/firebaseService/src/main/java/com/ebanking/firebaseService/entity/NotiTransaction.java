package com.ebanking.firebaseService.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "NOTIFY_TRANSACTION")
public class NotiTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    String userId;
    String username;
    String content;
    String title;
    String sender;
    String amount;
    String noiDungGiaoDich;
    String status;
    Long createdAt;
}

