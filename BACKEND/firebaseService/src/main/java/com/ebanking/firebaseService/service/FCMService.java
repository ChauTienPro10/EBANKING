package com.ebanking.firebaseService.service;

import com.ebanking.firebaseService.repository.FCMTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FCMService {

    @Autowired
    private FCMTokenRepository fcmTokenRepository;
}
