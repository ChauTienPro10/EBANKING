package com.example.auth.dto.response;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "noti_system")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotiSystem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    String content;
    String title;
    Long createdAt;
}
