package com.ebanking.admintool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Admin Login Response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginResponse {
    private Long id;
    private String username;
    private String fullName;
    private List<String> roles;
    private String jwt;
    private String message;
}

