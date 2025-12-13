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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/authService/fcm")
public class FCMController {

    @Value("${fcm.service}")
    String fcmServiceUrl;

    @Autowired
    HttpUltils httpUltils;

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
    public ResponseEntity<List<NotiSystem>> getAllSysNoti(
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "10") int limit
    ) {
        String url = fcmServiceUrl
                + "/notify/getSysNoti?index=" + index
                + "&limit=" + limit;

        List<NotiSystem> notiSystemList =
                httpUltils.get(
                        url,
                        new ParameterizedTypeReference<List<NotiSystem>>() {}
                );

        return ResponseEntity.ok(notiSystemList);
    }

    @GetMapping("/getTransferNoti")
    public ResponseEntity<List<NotiTransaction>> getNotiTransactions(
            @RequestParam(defaultValue = "0") int index,
            @RequestParam(defaultValue = "10") int limit
    ) {
        String url = fcmServiceUrl
                + "/notify/getTransferNoti?index=" + index
                + "&limit=" + limit;

        List<NotiTransaction> notiTransactionList =
                httpUltils.get(
                        url,
                        new ParameterizedTypeReference<List<NotiTransaction>>() {}
                );

        return ResponseEntity.ok(notiTransactionList);
    }

}
