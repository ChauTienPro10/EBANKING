package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.services.AccountTransactionService;
import com.example.auth.services.AuthenticationService;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(IURL.HOST_PREFIX + "/trans/transaction-limits")
@Slf4j
public class TransactionLimitController {
    
    @Autowired
    AccountTransactionService accountTransactionService;

    @Autowired
    AuthenticationService authenticationService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserLimits(@RequestHeader("Authorization") String authHeader,
                                           @PathVariable("userId") Long userId) {
        log.info("GET:::/trans/transaction-limits/{}", userId);
        return ResponseEntity.status(HttpStatus.OK).body(accountTransactionService.getUserLimits(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUserLimits(@RequestHeader("Authorization") String authHeader,
                                              @PathVariable("userId") Long userId,
                                              @RequestBody Object request) throws AuthenticationException {
        log.info("PUT:::/trans/transaction-limits/{}", userId);
        
        String jwt = authHeader.replace("Bearer ", "").trim();
        if(!authenticationService.checkValidUser(jwt, userId)) {
            throw new AuthenticationException("Bạn không có quyền thao tác");
        }
        
        return ResponseEntity.status(HttpStatus.OK).body(accountTransactionService.updateUserLimits(userId, request));
    }
}
