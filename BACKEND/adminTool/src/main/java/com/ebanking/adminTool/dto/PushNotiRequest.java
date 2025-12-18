package com.ebanking.adminTool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PushNotiRequest {
    private String title;
    private String body;
    private String username; // For personal notification
}
