package com.ebanking.emailService.dto;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpRegister {
    private String username;
    private String pass;
    private String citizenId;
    private String typeVerify;
    private int otpValue;
}
