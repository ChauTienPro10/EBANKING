package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnlockAccountRequest {
    private String username; // Tên đăng nhập cần mở khóa
    private String unlockedBy; // Người thực hiện mở khóa (admin username)
    private String notes; // Ghi chú thêm (optional)
}
