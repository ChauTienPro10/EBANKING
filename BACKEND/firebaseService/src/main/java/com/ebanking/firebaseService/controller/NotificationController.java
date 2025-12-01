package com.ebanking.firebaseService.controller;

import com.ebanking.firebaseService.dto.request.PushNotiRequest;
import com.ebanking.firebaseService.dto.request.SaveTockenDTO;
import com.ebanking.firebaseService.entity.NotiSystem;
import com.ebanking.firebaseService.entity.NotiTransaction;
import com.ebanking.firebaseService.service.FCMService;
import com.ebanking.firebaseService.service.FirebaseMessagingService;
import com.ebanking.firebaseService.service.NotificationService;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/notify")
public class NotificationController {

    @Autowired
    FCMService fcmService;

    @Autowired
    FirebaseMessagingService firebaseMessagingService;

    @Autowired
    NotificationService notificationService;

    @PostMapping("/push-noti")
    public void sendNotification(String token, String title, String body) throws FirebaseMessagingException {
        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        Message message = Message.builder()
                .setToken(token)
                .setNotification(notification)
                .build();

        String response = FirebaseMessaging.getInstance().send(message);
        System.out.println("Successfully sent message: " + response);
    }

    @PostMapping("/save-token")
    public boolean saveToken(@RequestBody SaveTockenDTO reqDto) {
        try {
          fcmService.saveFCMTokenWithUsername(reqDto.getUsername(), reqDto.getDeviceId(), reqDto.getToken());
          return true;
        } catch (Exception e) {
            log.error(e.getMessage());
            return false;
        }
    }

    @PostMapping("/updateFcmToken")
    public boolean updateToken(@RequestBody SaveTockenDTO req) {

        try {
            fcmService.updateFcmToken(req);
            return true;
        } catch (Exception e) {
            log.error(e.getMessage());
            return false;
        }
    }

    @PostMapping("/push-notiify")
    public boolean pushNotify(@RequestBody String content) {

        try {
            firebaseMessagingService.sendNotification("f0-a3GLiSL2UIrFood0bYr:APA91bEpqQoAh1tXhWMeLFqeUKpR1xVHdAEigt4wRhho8r0v9rCYJOTFUEMzmzOSFlKTHMQZw3lLoPOO38O9mWrs79nUfYkdCY_6TJsuEhkj016BxulYaGk",
                    "Test", content);
            return true;
        } catch (Exception e) {
            log.error(e.getMessage());
            return false;
        }
    }

    @PostMapping("/push-all")
    public void pushNotiAll(@RequestBody PushNotiRequest request) throws FirebaseMessagingException {
        notificationService.pushNotiAll(request);
    }

    @PostMapping("/push-noti-persional")
    public void sendNotiPersional(@RequestBody PushNotiRequest request) {
        return;
    }

    @GetMapping("/getSysNoti")
    public ResponseEntity<List<NotiSystem>> getAllSysNoti(
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<NotiSystem> notiSystemList = notificationService.getSysNotifications(index, limit);
        return ResponseEntity.ok(notiSystemList);
    }

    @GetMapping("/getTransferNoti")
    public ResponseEntity<List<NotiTransaction>> getNotiTransactions(@RequestParam(defaultValue = "0") int index,
                                                                     @RequestParam(defaultValue = "10") int limit)
    {
        List<NotiTransaction> notiTransactionList = notificationService.getNotiTransaction(index, limit);
        return ResponseEntity.ok(notiTransactionList);
    }
}