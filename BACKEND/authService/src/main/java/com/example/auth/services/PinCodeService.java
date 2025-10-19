package com.example.auth.services;

import com.example.auth.dto.request.DelPinCodeReq;
import com.example.auth.dto.request.NewPinCodeReq;
import com.example.auth.dto.response.NewPinCodeRes;
import com.example.auth.entity.PinCode;
import com.example.auth.repository.IPinCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.auth.dto.response.DelPinCodeRes;

@Service
public class PinCodeService {

    @Autowired
    IPinCodeRepository pinCodeRepository;

    @Autowired AuthService authService;

    @Autowired
    PasswordEncoder passwordEncoder;

    public NewPinCodeRes newPin(NewPinCodeReq r) {
        if (r.getPinCode() == null ||
        r.getPinCode().isEmpty() ||
        !isNumeric(r.getPinCode()) ||
        r.getPinCode().length() != 6) {
            return NewPinCodeRes.builder()
                    .status(false)
                    .error("pin_invalid")
                    .build();
        }
        long userId = authService.getUserIdByUsername(r.getUsername());
        if (userId == 0) {
            return NewPinCodeRes.builder()
                    .status(false)
                    .error("user_not_found")
                    .build();
        }
        if (userId == -1) {
            return NewPinCodeRes.builder()
                    .status(false)
                    .error("get_username_error")
                    .build();
        }
        if (pinCodeRepository.findByUserId(userId) != null) {
            return NewPinCodeRes.builder()
                    .status(false)
                    .error("pin_is_existed")
                    .build();
        }
        String encodePin = passwordEncoder.encode(r.getPinCode());
        PinCode pinCode = PinCode.builder()
                .pinCode(encodePin)
                .userId(userId)
                .CreatedAt(System.currentTimeMillis())
                .build();
        pinCodeRepository.save(pinCode);
        return NewPinCodeRes.builder()
                .status(true)
                .error("")
                .build();
    }

    public DelPinCodeRes delPin(DelPinCodeReq r) {
        if(r.getUsername().isEmpty() || r.getPinCode().isEmpty()) {
            return DelPinCodeRes.builder()
                    .status(false)
                    .error("invalid_info")
                    .build();
        }
        long userId = authService.getUserIdByUsername(r.getUsername());
        PinCode pinCode = pinCodeRepository.findByUserId(userId);
        if (pinCode == null) {
            return DelPinCodeRes.builder()
                    .status(false)
                    .error("pin_code_not_found")
                    .build();
        }
        if (!passwordEncoder.matches(r.getPinCode(), pinCode.getPinCode())) {
            return DelPinCodeRes.builder()
                    .status(false)
                    .error("pin_not_true")
                    .build();
        }
        pinCodeRepository.delete(pinCode);
            return DelPinCodeRes.builder()
                .status(true)
                .error("")
                .build();
    }

    public boolean isNumeric(String str) {
        return str != null && str.matches("\\d+");
    }
}
