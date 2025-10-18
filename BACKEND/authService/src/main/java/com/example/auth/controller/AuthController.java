package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.dto.request.*;
import com.example.auth.dto.response.*;
import com.example.auth.services.AuthService;
import com.example.auth.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(IURL.AUTH_URL)
@Slf4j
public class AuthController {

    @Autowired
    AuthService authService;

    @Autowired
    private SecurityUtils securityUtils;

    @PostMapping(IURL.REGISTER_URL)
    public ResponseEntity<CreateUserOtpResponse> register(@RequestBody RegisterRequest data) {
        log.info("POST:::" + IURL.REGISTER_URL);
        return ResponseEntity.status(HttpStatus.OK).body(authService.register(data.getUsername(), data.getPassword(), data.getCitizenId(), data.getTypeVerify()));
    }

    @PostMapping(IURL.REGISTER_VERIFY_OTP_URL)
    public ResponseEntity<RegisterResponse> registerVerifyOtp(@RequestBody RegisterVerifyOtpRequest r) {
        log.info("POST:::" + IURL.REGISTER_VERIFY_OTP_URL);
        RegisterResponse rs = authService.verifyOtpRegister(r.getUsername(), r.getOtpValue());
        return ResponseEntity.status(HttpStatus.OK).body(rs);
    }

    @PostMapping(IURL.LOGIN_URL)
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        log.info("POST:::" + IURL.LOGIN_URL);
        LoginResponse rs = authService.login(request);
        return ResponseEntity.status(HttpStatus.OK).body(rs);
    }

    @PostMapping(IURL.UPDATE_URL)
    public ResponseEntity<UpdateUserResponse> updateUser(@RequestHeader Map<String, String> headers, @RequestBody UpdateUserRequest request) {
        log.info("POST:::" + IURL.UPDATE_URL);
        if (!securityUtils.checkUser(headers, request.getUsername())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @PostMapping(IURL.CHANGE_PASSWORD_URL)
    public ResponseEntity<ChangePasswordResponse> changePassword (@RequestHeader Map<String, String> headers, @RequestBody ChangePasswordRequest request) {
        log.info("POST:::" + IURL.CHANGE_PASSWORD_URL);
        if (!securityUtils.checkUser(headers, request.getUsername())) {
            log.info("user_not_valid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(authService.changePassword(request));
    }

    @PostMapping(IURL.FORGOT_PASSWORD_REQUEST_OTP)
    public ResponseEntity<ForgotPasswordResponseOTP> forgotPasswordSendOtp(@RequestBody ForgotPasswordRequestOTP rq) {
        log.info("POST:::" + IURL.FORGOT_PASSWORD_REQUEST_OTP);
        return ResponseEntity.status(HttpStatus.OK).body(authService.forgotPasswordRequestOtp(rq));
    }

    @PostMapping(IURL.FORGOT_PASSWORD_VERIFY_OTP)
    public ResponseEntity<ForgotPasswordVerifyOtpRes> forgotPasswordVerifyOtp(@RequestBody ForgotPasswordVerifyOtpReq rq) {
        log.info("POST:::" + IURL.FORGOT_PASSWORD_VERIFY_OTP);
        return ResponseEntity.status(HttpStatus.OK).body(authService.forgotPasswordVerifyOtp(rq));
    }
}
