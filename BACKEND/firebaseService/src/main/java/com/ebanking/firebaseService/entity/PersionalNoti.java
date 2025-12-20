package com.ebanking.firebaseService.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "personal_noti")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PersionalNoti {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    String userId;
    String username;
    String content;
    String title;
    Long createdAt;
}
