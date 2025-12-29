package com.example.auth.consts;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class grpcPath {
    // String USER_SERVICE = "3.85.17.154";
    // Integer USER_SERVICE_PORT = 9001;
    //
    // String TRANSACTION_SERVICE = "3.85.17.154";
    // Integer TRANSACTION_SERVICE_PORT =

    @Value("${USER_SERVICE:3.85.17.154}")
    private String userServiceHost;

    @Value("${USER_SERVICE_PORT:9001}")
    private int userServicePort;

    @Value("${TRANSACTION_SERVICE:3.85.17.154}")
    private String transactionServiceHost;

    @Value("${TRANSACTION_SERVICE_PORT:9003}")
    private int transactionServicePort;

    public String getUserServiceHost() {
        return userServiceHost;
    }

    public int getUserServicePort() {
        return userServicePort;
    }

    public String getTransactionServiceHost() {
        return transactionServiceHost;
    }

    public int getTransactionServicePort() {
        return transactionServicePort;
    }
}
