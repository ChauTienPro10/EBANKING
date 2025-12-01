package com.ebanking.firebaseService.service;


import com.ebanking.firebaseService.dto.request.PushNotiRequest;
import com.ebanking.firebaseService.entity.NotiSystem;
import com.ebanking.firebaseService.entity.NotiTransaction;
import com.ebanking.firebaseService.entity.PersionalNoti;
import com.ebanking.firebaseService.repository.FCMTokenRepository;
import com.ebanking.firebaseService.repository.NotiSystemRepository;
import com.ebanking.firebaseService.repository.NotiTransactionRepository;
import com.ebanking.firebaseService.repository.PersionalNotiRepository;
import com.google.firebase.messaging.FirebaseMessagingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

    @Autowired NotiTransactionRepository transactionRepository;

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

    public void pushTransactionNoti(String username, String token, String title, String content, String sender, String amount, String status, String noiDung) {
        try {
            if (username == null) {
                username = fcmTokenRepository.findByToken(token).get().getUsername();
            }
            NotiTransaction notiTransaction = NotiTransaction.builder()
                    .username(username)
                    .title(title)
                    .content(content)
                    .createdAt(System.currentTimeMillis())
                    .sender(sender)
                    .noiDungGiaoDich(noiDung)
                    .status(status)
                    .amount(amount)
                    .build();
            transactionRepository.save(notiTransaction);
            firebaseMessagingService.sendNotification(token, title, content);
        } catch (Exception e) {
            log.error("Push failed: " + e.getMessage() );
        }

    }

    public void pushPersionNoi(String username, String token, String title, String content) {
        try {
            if (username == null) {
                username = fcmTokenRepository.findByToken(token).get().getUsername();
            }
            PersionalNoti persionalNoti = PersionalNoti.builder()
                    .username(username)
                    .title(title)
                    .content(content)
                    .createdAt(System.currentTimeMillis())
                    .build();
            persionalNotiRepository.save(persionalNoti);
            firebaseMessagingService.sendNotification(token, title, content);
        } catch (Exception e) {
            log.error("Push failed: " + e.getMessage() );
        }
    }

    public List<NotiSystem> getSysNotifications(int offset, int limit) {
        Pageable pageable = PageRequest.of(offset / limit, limit);
        return notiSystemRepository.findAll(pageable).getContent();
    }

    public List<NotiTransaction> getNotiTransaction(int offset, int limit) {
        Pageable pageable = PageRequest.of(offset / limit, limit);
        return notiTransactionRepository.findAll(pageable).getContent();
    }

    public List<PersionalNoti> getNotiPerson(int offset, int limit) {
        Pageable pageable = PageRequest.of(offset / limit, limit);
        return persionalNotiRepository.findAll(pageable).getContent();
    }
}

