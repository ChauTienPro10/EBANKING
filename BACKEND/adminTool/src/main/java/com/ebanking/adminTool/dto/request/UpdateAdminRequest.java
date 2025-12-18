package com.ebanking.adminTool.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateAdminRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    @Pattern(regexp = "ROLE_ADMIN|ROLE_USER", message = "role must be ROLE_ADMIN or ROLE_USER")
    private String role;

    @NotNull
    private Boolean active;
}
