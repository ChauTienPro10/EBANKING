package com.example.auth.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class UpdateUserRequest {
    String fullName;
    String email;
    String phone;
    String address;
    String birthday;
    Boolean isMale;
}
