package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.dto.request.RegisterRequest;
import com.example.auth.dto.response.RegisterResponse;
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
}
