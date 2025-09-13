package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.dto.request.NewAccountRequest;
import com.example.auth.dto.response.NewAccountResponse;
import com.example.auth.services.AccountTransactionService;
import com.example.auth.services.AuthenticationService;
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(IURL.ACCOUNT_TRANS)
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
}
