package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.dto.request.TransferRequest;
import com.example.auth.dto.response.TransferResponse;
import com.example.auth.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(IURL.TRANSACTION)
public class TransactionController {
    @Autowired
    TransactionService transactionService;

    @PostMapping(IURL.TRANSFER)
    public ResponseEntity<TransferResponse> transfer(@RequestBody TransferRequest rq) {
        return ResponseEntity.status(HttpStatus.OK).body(transactionService.transfer(rq));
    }
}
