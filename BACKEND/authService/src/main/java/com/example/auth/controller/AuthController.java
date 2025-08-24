package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.dto.request.LoginRequest;
import com.example.auth.dto.request.RegisterRequest;
import com.example.auth.dto.request.UpdateUserRequest;
import com.example.auth.dto.response.LoginResponse;
import com.example.auth.dto.response.RegisterResponse;
import com.example.auth.dto.response.UpdateUserResponse;
import com.example.auth.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(IURL.AUTH_URL)
public class AuthController {

    @Autowired
    AuthService authService;

    @PostMapping(IURL.REGISTER_URL)
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest data) {
        return ResponseEntity.status(HttpStatus.OK).body(authService.register(data.getUsername(), data.getPassword(), data.getCitizenId()));
    }

    @PostMapping(IURL.LOGIN_URL)
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse rs = authService.login(request);
        return ResponseEntity.status(HttpStatus.OK).body(rs);
    }

    @PostMapping(IURL.UPDATE_URL)
    public ResponseEntity<UpdateUserResponse> updateUser(@RequestBody UpdateUserRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }
}
