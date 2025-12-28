package com.example.auth.dto.response;

import lombok.Builder;
import lombok.Data;

import java.security.PrivateKey;
import java.util.Set;

@Data
@Builder
public class LoginResponse {
    private Long id;
    private String username;
    private String fullName;
    private String address;
    private String citizenId;
    private String birthday;
    private String createAt;
    private boolean isMale;
    private Set<String> roles;
    private String jwt;
    String privateKey;
}
