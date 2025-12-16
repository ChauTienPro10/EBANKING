package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LockAccountRequest {
    private String username; // Tên đăng nhập cần khóa
    private Long userId; // ID của user (optional)
    private Long accountId; // ID của account (optional)
    private String reason; // Lý do khóa
    private String lockedBy; // Người thực hiện khóa (admin username)
    private String notes; // Ghi chú thêm (optional)
}
