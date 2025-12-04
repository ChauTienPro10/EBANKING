package com.ebanking.admintool.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;

/**
 * gRPC Service Endpoints Configuration
 */
@Configuration
@Getter
public class GrpcConfig {

    @Value("${grpc.user.service.host}")
    private String userServiceHost;

    @Value("${grpc.user.service.port}")
    private int userServicePort;

    @Value("${grpc.transaction.service.host}")
    private String transactionServiceHost;

    @Value("${grpc.transaction.service.port}")
    private int transactionServicePort;
}

