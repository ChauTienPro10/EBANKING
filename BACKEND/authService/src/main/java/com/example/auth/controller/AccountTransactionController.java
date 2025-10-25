package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.dto.request.CheckAccountNumberRequest;
import com.example.auth.dto.request.NewAccountRequest;
import com.example.auth.dto.response.AccountResponse;
import com.example.auth.dto.response.CheckAccountNumberResponse;
import com.example.auth.dto.response.NewAccountResponse;
import com.example.auth.services.AccountTransactionService;
import com.example.auth.services.AuthenticationService;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(IURL.ACCOUNT_TRANS)
@Slf4j
public class AccountTransactionController {
    @Autowired
    AccountTransactionService accountTransactionService;

    @Autowired
    AuthenticationService authenticationService;

    @PostMapping(IURL.OPEN_ACC_TRANS)
    public ResponseEntity<NewAccountResponse> openAccount(@RequestHeader("Authorization") String authHeader,
                                                          @RequestBody NewAccountRequest r)
            throws AuthenticationException {

        String jwt = authHeader.replace("Bearer ", "").trim();
        if(!authenticationService.checkValidUser(jwt, r.getUserId())) {
            throw new AuthenticationException("Bạn không có quyền thao tác");
        }
        return ResponseEntity.status(HttpStatus.OK).body(accountTransactionService.newAccount(r));
    }

    @GetMapping("/info/{userId}")
    public ResponseEntity<AccountResponse> getAccountInfo(@RequestHeader("Authorization") String authHeader,
                                                          @PathVariable("userId") Long userId) {
        log.info("GET:::/info/" + userId);
        return ResponseEntity.status(HttpStatus.OK).body(accountTransactionService.getAccountInfo(userId));
    }

    @PostMapping("/checkAccountNumber")
    public ResponseEntity<CheckAccountNumberResponse> checkAccountNumber(@RequestBody CheckAccountNumberRequest r) {
        log.info("GET:::/checkAccountNumber/" + r.getAccountNumber());
        return ResponseEntity.status(HttpStatus.OK).body(accountTransactionService.checkAccountExist(r));
    }
}
