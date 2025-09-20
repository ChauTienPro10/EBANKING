package com.banking.userService.dto;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpRegister implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    private String username;
    private String pass;
    private String citizenId;
    private String typeVerify;
    private int otpValue;
}