package com.ebanking.firebaseService.service;


import com.ebanking.firebaseService.dto.request.PushNotiRequest;
import com.ebanking.firebaseService.entity.NotiSystem;
import com.ebanking.firebaseService.entity.PersionalNoti;
import com.ebanking.firebaseService.repository.FCMTokenRepository;
import com.ebanking.firebaseService.repository.NotiSystemRepository;
import com.ebanking.firebaseService.repository.NotiTransactionRepository;
import com.ebanking.firebaseService.repository.PersionalNotiRepository;
import com.google.firebase.messaging.FirebaseMessagingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class NotificationService {
    @Autowired
    NotiTransactionRepository notiTransactionRepository;

    @Autowired
    PersionalNotiRepository persionalNotiRepository;

    @Autowired FirebaseMessagingService firebaseMessagingService;

    @Autowired
    NotiSystemRepository notiSystemRepository;

    @Autowired
    FCMTokenRepository fcmTokenRepository;
    public void pushNotiAll(PushNotiRequest request) throws FirebaseMessagingException {

        List<String> tokens = fcmTokenRepository.getAllTokenStr();
        NotiSystem notiSystem = NotiSystem.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .createdAt(System.currentTimeMillis())
                .build();
        notiSystemRepository.save(notiSystem);
        for (String tk : tokens) {
            try {
                firebaseMessagingService.sendNotification(tk, request.getTitle(), request.getContent());
            } catch (Exception e) {
                log.info(e.getMessage());
            }
        }
    }
}

