package com.example.auth.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveTockenDTO {
    private Long userId;
    private String username;
    private String deviceId;
    private String token;
}
