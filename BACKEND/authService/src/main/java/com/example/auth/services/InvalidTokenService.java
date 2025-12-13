package com.example.auth.services;

import com.example.auth.repository.InvalidTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InvalidTokenService {
    @Autowired
    InvalidTokenRepository invalidTokenRepository;
}
