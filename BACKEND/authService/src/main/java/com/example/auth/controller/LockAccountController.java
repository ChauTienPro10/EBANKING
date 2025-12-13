package com.example.auth.controller;

import com.example.auth.services.LockAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/lock-account")
public class LockAccountController {

    @Autowired
    LockAccountService lockAccountService;
}
