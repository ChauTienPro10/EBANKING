package com.ebanking.adminTool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveTokenDTO {
    private String username;
    private String deviceId;
    private String token;
}
