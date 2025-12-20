package com.ebanking.firebaseService.controller;

import com.ebanking.firebaseService.dto.request.BulkPushNotiRequest;
import com.ebanking.firebaseService.dto.request.PushNotiRequest;
import com.ebanking.firebaseService.dto.request.SaveTockenDTO;
import com.ebanking.firebaseService.entity.NotiSystem;
import com.ebanking.firebaseService.entity.NotiTransaction;
import com.ebanking.firebaseService.entity.PersionalNoti;
import com.ebanking.firebaseService.service.FCMService;
import com.ebanking.firebaseService.service.FirebaseMessagingService;
import com.ebanking.firebaseService.service.NotificationService;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
        log.info("Push noti system");
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
    public ResponseEntity<Map<String, Object>> sendNotiPersional(@RequestBody PushNotiRequest request) {
        try {
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Username is required"));
            }
            
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Title is required"));
            }
            
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Content is required"));
            }

            boolean success = notificationService.pushPersonalNotification(
                request.getUsername(), 
                request.getTitle(), 
                request.getContent()
            );
            
            if (success) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Personal notification sent successfully"));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Failed to send notification. User may not have FCM token."));
            }
        } catch (Exception e) {
            log.error("Error sending personal notification: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/push-noti-bulk")
    public ResponseEntity<Map<String, Object>> sendBulkNotification(@RequestBody BulkPushNotiRequest request) {
        try {
            if (request.getUsernames() == null || request.getUsernames().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Usernames list is required"));
            }
            
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Title is required"));
            }
            
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Content is required"));
            }

            Map<String, Object> result = notificationService.pushBulkPersonalNotification(
                request.getUsernames(), 
                request.getTitle(), 
                request.getContent()
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error sending bulk notification: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Internal server error: " + e.getMessage()));
        }
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


    // GET FROM DATE → TO DATE
    @GetMapping("/filter")
    public List<NotiSystem> getFromDateToDate(
            @RequestParam("fromDate")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime fromDate,

            @RequestParam("toDate")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime toDate
    ) {
        return notificationService.getFromDateToDate(fromDate, toDate);
    }

    @GetMapping("/getPersonalNoti")
    public ResponseEntity<List<PersionalNoti>> getPersonalNotifications(
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String username
    ) {
        List<PersionalNoti> personalNotifications;
        
        if (username != null && !username.trim().isEmpty()) {
            personalNotifications = notificationService.getPersonalNotificationsByUsername(username, index, limit);
        } else {
            personalNotifications = notificationService.getNotiPerson(index, limit);
        }
        
        return ResponseEntity.ok(personalNotifications);
    }


}