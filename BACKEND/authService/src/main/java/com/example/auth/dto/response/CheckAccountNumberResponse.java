package com.example.auth.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckAccountNumberResponse {
    Boolean isExist;
    String fullName;
}
