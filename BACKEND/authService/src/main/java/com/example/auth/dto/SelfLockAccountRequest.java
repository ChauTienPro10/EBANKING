package com.example.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelfLockAccountRequest {
    private String username; // Tên đăng nhập (sẽ được lấy từ token)
    private String reason; // Lý do tự khóa
    private String notes; // Ghi chú thêm (optional)
}
