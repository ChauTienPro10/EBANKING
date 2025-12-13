package com.example.auth.services;

import com.example.auth.repository.LockAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LockAccountService {
    @Autowired
    LockAccountRepository lockAccountRepository;
}
