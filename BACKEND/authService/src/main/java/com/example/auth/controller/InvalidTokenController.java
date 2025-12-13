package com.example.auth.controller;

import com.example.auth.services.InvalidTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/invalid-token")
public class InvalidTokenController {

    @Autowired
    InvalidTokenService invalidTokenService;
}
