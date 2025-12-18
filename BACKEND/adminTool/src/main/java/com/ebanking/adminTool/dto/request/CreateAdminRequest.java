package com.ebanking.adminTool.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Create Admin Request
 * FIXED: Enhanced validation with size constraints and strong password
 * requirements
 */
@Data
public class CreateAdminRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=]).*$", message = "Password must contain at least one uppercase letter, one digit, and one special character (@#$%^&+=)")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s._-]+$", message = "Full name contains invalid characters")
    private String fullName;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "ROLE_(ADMIN|STAFF)", message = "Role must be one of: ROLE_ADMIN, ROLE_STAFF")
    private String role;
}
