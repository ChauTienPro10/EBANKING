package com.ebanking.adminTool.dto.response;

import com.ebanking.adminTool.entity.Admin;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminDto {
    private Long id;
    private String username;
    private String fullName;
    private String role;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminDto fromEntity(Admin a) {
        return AdminDto.builder()
                .id(a.getId())
                .username(a.getUsername())
                .fullName(a.getFullName())
                .role(a.getRole())
                .active(a.isActive())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}

