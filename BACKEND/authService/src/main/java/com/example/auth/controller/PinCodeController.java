package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.dto.request.DelPinCodeReq;
import com.example.auth.dto.request.NewPinCodeReq;
import com.example.auth.dto.response.DelPinCodeRes;
import com.example.auth.dto.response.NewPinCodeRes;
import com.example.auth.services.PinCodeService;
import com.example.auth.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping(IURL.PIN_CODE_URL)
public class PinCodeController {
    @Autowired
    PinCodeService pinCodeService;

    @Autowired
    SecurityUtils securityUtils;

    @PostMapping(IURL.NEW_PIN)
    public ResponseEntity<NewPinCodeRes> newPin(@RequestHeader Map<String, String> headers, @RequestBody NewPinCodeReq request) {
        log.info("POST NEW PIN CODE:::" + IURL.NEW_PIN);
        if (!securityUtils.checkUser(headers, request.getUsername())) {
            log.info("user_not_valid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(pinCodeService.newPin(request));
    }

    @PostMapping(IURL.DELETE_PIN)
    public ResponseEntity<DelPinCodeRes> deletePin(@RequestHeader Map<String, String> headers, @RequestBody DelPinCodeReq r) {
        log.info("POST NEW PIN CODE:::" + IURL.DELETE_PIN);
        if (!securityUtils.checkUser(headers, r.getUsername())) {
            log.info("user_not_valid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(pinCodeService.delPin(r));
    }
}
