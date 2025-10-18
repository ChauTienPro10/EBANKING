package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.dto.request.TransferRequest;
import com.example.auth.dto.response.TransferResponse;
import com.example.auth.protopkg.TransactionProto;
import com.example.auth.services.TransactionService;
import com.example.auth.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping(IURL.TRANSACTION)
public class TransactionController {
    @Autowired
    TransactionService transactionService;
    @Autowired
    private SecurityUtils securityUtils;

    @PostMapping(IURL.TRANSFER)
    public ResponseEntity<TransferResponse> transfer(@RequestHeader Map<String, String> headers, @RequestBody TransferRequest rq) {
        log.info("POST:::" + IURL.TRANSFER);
        if(!securityUtils.checkUser(headers, rq.getUsername())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(transactionService.transfer(rq));
    }

    @GetMapping(IURL.TRANS_HISTOTY)
    public ResponseEntity<List<TransferResponse>> getHisTransaction(
            @RequestParam("username") String username,
            @RequestParam(value = "sender") String sender,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            @RequestParam(value = "fromDate", defaultValue = "") String fromDate,
            @RequestParam(value = "toDate", defaultValue = "") String toDate) {

        log.info("GET:::" + IURL.TRANS_HISTOTY);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate today = LocalDate.now();
        if (fromDate == null || fromDate.isEmpty()) {
            fromDate = today.minusDays(10).format(formatter);
        }

        if (toDate.isEmpty()) {
            toDate = today.format(formatter);
        }
        TransactionProto.TransHistoryRequest request = TransactionProto.TransHistoryRequest.newBuilder()
                .setUsername(username)
                .setSender(sender)
                .setPage(page)
                .setLimit(limit)
                .setFromDate(fromDate)
                .setToDate(toDate)
                .build();

        return ResponseEntity.status(HttpStatus.OK).body(transactionService.getHisTrans(request));
    }

}
