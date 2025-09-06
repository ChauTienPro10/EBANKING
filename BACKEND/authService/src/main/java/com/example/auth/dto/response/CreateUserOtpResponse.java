package com.example.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CreateUserOtpResponse {
    Boolean success;
    String message;
}
