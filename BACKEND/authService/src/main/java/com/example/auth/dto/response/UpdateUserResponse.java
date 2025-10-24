package com.example.auth.dto.response;

import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserResponse {
    Long id;
    String fullName;
    String birthday;
    String isMale;
    String email;
    String phone;
    String citizenId;
    String address;
}
