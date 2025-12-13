package com.example.auth.controller;

import com.example.auth.dto.SaveTockenDTO;
import com.example.auth.dto.response.NotiSystem;
import com.example.auth.dto.response.NotiTransaction;
import com.example.auth.utils.HttpUltils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.example.auth.dto.response.NotifyResponse;
import com.example.auth.repository.NotifyStatusRepository;
import com.example.auth.services.AuthService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/authService/fcm")
public class FCMController {

        @Value("${fcm.service}")
        String fcmServiceUrl;

        @Autowired
        HttpUltils httpUltils;

        @Autowired
        AuthService authService;

        @Autowired
        NotifyStatusRepository notifyStatusRepository;

        @PostMapping("/save-token")
        public ResponseEntity<?> saveToken(@RequestBody SaveTockenDTO data) {
                String URL = fcmServiceUrl + "notify/save-token";
                try {
                        boolean result = httpUltils.post(URL, data, Boolean.class);
                        return ResponseEntity.ok(result);
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Failed to save token: " + e.getMessage());
                }
        }

        @PostMapping("/updateFcmToken")
        public ResponseEntity<?> updateToken(@RequestBody SaveTockenDTO data) {
                try {
                        String URL = fcmServiceUrl + "notify/updateFcmToken";
                        boolean result = httpUltils.post(URL, data, Boolean.class);
                        return ResponseEntity.ok(result);
                } catch (Exception e) {
                        log.error(e.getMessage());
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Failed to save token: " + e.getMessage());
                }
        }

        @GetMapping("/getSysNoti")
        public ResponseEntity<List<NotifyResponse<NotiSystem>>> getAllSysNoti(
                        @RequestParam(defaultValue = "0") int index,
                        @RequestParam(defaultValue = "10") int limit) {
                log.info("GET SYS NOTIFY"); 
                String url = fcmServiceUrl
                                + "/notify/getSysNoti?index=" + index
                                + "&limit=" + limit;

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication.getName();
                long userId = authService.getUserIdByUsername(username);

                List<NotiSystem> notiSystemList = httpUltils.get(
                                url,
                                new ParameterizedTypeReference<List<NotiSystem>>() {
                                });
                List<NotifyResponse<NotiSystem>> responseList = new ArrayList<>();
                for (NotiSystem notiSystem : notiSystemList) {
                        NotifyResponse<NotiSystem> notifyResponse = new NotifyResponse<>();
                        notifyResponse.setData(notiSystem);
                        notifyResponse.setSeen(
                                        notifyStatusRepository.existsByUserIdAndNotifyId(userId, notiSystem.getId()));
                        responseList.add(notifyResponse);
                }

                return ResponseEntity.ok(responseList);
        }

        @GetMapping("/getTransferNoti")
        public ResponseEntity<List<NotifyResponse<NotiTransaction>>> getNotiTransactions(
                        @RequestParam(defaultValue = "0") int index,
                        @RequestParam(defaultValue = "10") int limit) {
                log.info("GET TRANSFER NOTIFY");
                String url = fcmServiceUrl
                                + "/notify/getTransferNoti?index=" + index
                                + "&limit=" + limit;

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication.getName();
                long userId = authService.getUserIdByUsername(username);

                List<NotiTransaction> notiTransactionList = httpUltils.get(
                                url,
                                new ParameterizedTypeReference<List<NotiTransaction>>() {
                                });
                List<NotifyResponse<NotiTransaction>> responseList = new ArrayList<>();
                for (NotiTransaction notiTransaction : notiTransactionList) {
                        NotifyResponse<NotiTransaction> notifyResponse = new NotifyResponse<>();
                        notifyResponse.setData(notiTransaction);
                        notifyResponse.setSeen(notifyStatusRepository.existsByUserIdAndNotifyId(userId,
                                        notiTransaction.getId()));
                        responseList.add(notifyResponse);
                }

                return ResponseEntity.ok(responseList);
        }

        @GetMapping("/seenNoti")
        public void seenNotify(@RequestParam long notiId,
                        @RequestParam long userId) {
                com.example.auth.entity.NotifyStatus notifyStatus = notifyStatusRepository
                                .findByUserIdAndNotifyId(userId, notiId);
                if (notifyStatus == null) {
                        notifyStatus = new com.example.auth.entity.NotifyStatus();
                        notifyStatus.setUserId(userId);
                        notifyStatus.setNotifyId(notiId);
                }
                notifyStatus.setSeen(true);
                notifyStatus.setSeenAt(System.currentTimeMillis());
                notifyStatusRepository.save(notifyStatus);
        }

}
