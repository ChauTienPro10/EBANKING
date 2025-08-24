package com.example.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
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
