package com.ebanking.firebaseService.kafkaConsumer;

import com.ebanking.firebaseService.dto.Account;
import com.ebanking.firebaseService.dto.Transaction;
import com.ebanking.firebaseService.dto.TransactionEvent;
import com.ebanking.firebaseService.dto.response.InternalUserResponse;
import com.ebanking.firebaseService.entity.FCMToken;
import com.ebanking.firebaseService.repository.FCMTokenRepository;
import com.ebanking.firebaseService.service.FCMService;
import com.ebanking.firebaseService.service.NotificationService;
import com.ebanking.firebaseService.service.UserLookupService;
import com.ebanking.firebaseService.utils.HttpUltils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@Slf4j
public class TransactionNotificationConsumer {

    @Autowired
    private FCMService fcmService;
    @Value("${service.transaction.host}")
    String transUrl;


    @Value("${service.user.host}")
    String userServiceHost;

    @Autowired
    HttpUltils httpUltils;

    @Autowired
    private FCMTokenRepository fcmTokenRepository;

    @Autowired
    NotificationService notificationService;

    @Autowired
    private UserLookupService userLookupService;

   //kafka listener with retry mechanism for transaction events
    @KafkaListener(
        topics = "transaction-notify",
        groupId = "firebase-group"
    )
    @Retryable(
        maxAttempts = 3,
        backoff = @Backoff(delay = 2000, multiplier = 2)
    )
    public void handleTransactionEvent(Transaction transaction) {
        System.out.printf(transaction.getReceiverAccountNumber());
        String url = "http://" + transUrl + "/api/accounts/" + transaction.getReceiverAccountNumber();
        Account account = httpUltils.get(url, Account.class);
        url = "http://" + userServiceHost + "/user/" + account.getUserId();
        InternalUserResponse userResponse = httpUltils.getWithHeaders(url, InternalUserResponse.class, new HttpHeaders()).getBody();
        Optional<FCMToken> token = fcmTokenRepository.findByUsername(userResponse.getUsername());
        if (token.isPresent()){
            String tokenStr = token.get().getToken();
            String title = "Thông báo nhận tiền";
            String content = "[N01] bạn vừa nhận được " + transaction.getAmount() + "VND từ tài khoản " + transaction.getSenderAccountNumber();
            try {
                notificationService.pushTransactionNoti(userResponse.getUsername(),
                        tokenStr,
                        title,
                        content,
                        transaction.getSenderAccountNumber(),
                        String.valueOf(transaction.getAmount()),
                        transaction.getStatus(),
                        transaction.getDescription()
                );
            } catch (Exception e) {
                log.error("push trans failed: " + e.getMessage());
            }
        }

    }

    private void sendNotificationToUser(TransactionEvent transactionEvent, String username, String userRole) {
        String amount = transactionEvent.getAmount().toString();
        String transactionId = transactionEvent.getTransactionId().toString();
        

    }
}
