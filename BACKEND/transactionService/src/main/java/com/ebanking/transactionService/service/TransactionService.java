package com.ebanking.transactionService.service;
import com.ebanking.transactionService.entity.Account;
import com.ebanking.transactionService.entity.Transaction;
import com.ebanking.transactionService.enums.KafkaTopic;
import com.ebanking.transactionService.enums.TransactionStatus;
import com.ebanking.transactionService.enums.TransactionType;
import com.ebanking.transactionService.grpc.TransactionProto;

import com.ebanking.transactionService.mappers.TransactionMapper;
import com.ebanking.transactionService.repository.AccountRepository;
import com.ebanking.transactionService.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.ebanking.transactionService.exception.TransactionException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionService {

    private final KafkaTemplate<String, Transaction> kafkaTemplate;

    @Autowired
    public TransactionService(KafkaTemplate<String, Transaction> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    TransactionMapper transactionMapper;

    @Transactional
    public TransactionProto.TransferResponse transfer(TransactionProto.TransferRequest data) {

        BigDecimal amount = new BigDecimal(data.getAmount());
        Transaction transaction =
        transactionRepository.save(Transaction.builder()
                .senderAccountNumber(data.getSenderAccountNumber())
                .receiverAccountNumber(data.getReceiverAccountNumber())
                .amount(amount)
                .currency(data.getCurrency())
                .transactionType(TransactionType.fromName(data.getTransactionType()).name())
                .status(TransactionStatus.PENDING.name())
                .description(data.getDescription())
                .transactionAt(LocalDateTime.now())
                .username(data.getUsername())
                .build());
        kafkaTemplate.send(KafkaTopic.TRANSACTION.getTopicName(), transaction);
        return transactionMapper.toTransferRequestProto(transaction);
    }

    @Transactional
    public TransactionProto.TransferResponse processTransfer(Transaction transaction) throws TransactionException {
        Account sender = accountRepository.findByAccountNumber(transaction.getSenderAccountNumber());
        Account receiver = accountRepository.findByAccountNumber(transaction.getReceiverAccountNumber());
        if (sender == null || receiver == null) {
            transaction.setStatus(TransactionStatus.FAILED.name());
            throw new TransactionException("Thông tin không hợp lệ");
        }
        BigDecimal amount = new BigDecimal(String.valueOf(transaction.getAmount()));
        if (sender.getBalance().compareTo(amount) < 0) {
            transaction.setStatus(TransactionStatus.FAILED.name());
            throw new TransactionException("Số dư không đủ");
        }
        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        accountRepository.save(sender);
        accountRepository.save(receiver);
        transaction.setStatus(TransactionStatus.SUCCESS.name());
        return transactionMapper.toTransferResponse(transactionRepository.save(transaction));
    }

    public Page<Transaction> getTransactionHistory(String username,
                                                   String sender,
                                                   LocalDateTime fromDate,
                                                   LocalDateTime toDate,
                                                   int page,
                                                   int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionAt").descending());

        return transactionRepository.findByUsernameAndSenderAndDateRange(
                username,
                sender,
                fromDate,
                toDate,
                pageable
        );
    }
}
