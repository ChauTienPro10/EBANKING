package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.dto.request.TransferRequest;
import com.example.auth.dto.response.TransferResponse;
import com.example.auth.entity.PublicKey;
import com.example.auth.entity.TransactionPayload;
import com.example.auth.protopkg.TransactionProto;
import com.example.auth.repository.PublicKeyRepository;
import com.example.auth.repository.TransactionPayloadRepository;
import com.example.auth.services.TransactionService;
import com.example.auth.utils.SecurityUtils;
import com.example.auth.utils.SignatureUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.websocket.AuthenticationException;
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

    @Autowired
    PublicKeyRepository publicKeyRepository;

    @PostMapping(IURL.TRANSFER)
    public ResponseEntity<TransferResponse> transfer(@RequestHeader Map<String, String> headers, @RequestBody TransferRequest rq) throws AuthenticationException {
        log.info("POST:::" + IURL.TRANSFER);
        if(!securityUtils.checkUser(headers, rq.getUsername())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (rq.getSignature() == null || rq.getSignature().isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        } else {
            PublicKey pk = publicKeyRepository.findByUsername(rq.getUsername());
            String pl = genPayload(rq.getSenderAccountNumber(), rq.getReceiverAccountNumber(), rq.getAmount().toString());
            if (!SignatureUtils.verifySignature(pl, rq.getSignature(), pk.getPublicKey())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
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

    private String genPayload(String from, String to, String amount) {
        return "FROM=" + from + "|" + "TO=" + to + "|" + "AMOUNT=" + amount;
    }

}
