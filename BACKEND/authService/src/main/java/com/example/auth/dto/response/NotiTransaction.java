package com.example.auth.dto.response;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "noti-transaction", indexes = {
    @Index(name = "idx_user_id", columnList = "userId"),
    @Index(name = "idx_username", columnList = "username"),
    @Index(name = "idx_created_at", columnList = "createdAt")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
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

