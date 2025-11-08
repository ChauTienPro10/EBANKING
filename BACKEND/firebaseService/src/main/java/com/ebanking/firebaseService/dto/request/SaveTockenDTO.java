package com.ebanking.firebaseService.dto.request;

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
