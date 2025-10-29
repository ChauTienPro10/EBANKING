package com.ebanking.transactionService.service.grpc;

import com.ebanking.transactionService.service.AccountService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;
import com.ebanking.transactionService.grpc.AccountProto;
import com.ebanking.transactionService.grpc.AccountServiceGrpc;

@GrpcService
@Slf4j
public class AccountGrpcService extends AccountServiceGrpc.AccountServiceImplBase {

    @Autowired
    private AccountService accountService;

    @Override
    public void newAccount(AccountProto.NewAccountRequest rq,
                            StreamObserver<AccountProto.NewAccountResponse> responseObserver) {
        try {
            AccountProto.NewAccountResponse rs = accountService.newAccount(rq);
            responseObserver.onNext(rs);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error(e.getMessage());
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void getAccountInfo(AccountProto.GetAccountInfo rq, StreamObserver<AccountProto.AccountResponse> responseObserver) {
        try {
            AccountProto.AccountResponse rs = accountService.getAccountInfo(rq);
            if (rs == null) {
                log.error("Account đã tồn tại");
                responseObserver.onError(
                        Status.INTERNAL
                                .withDescription("Username đã liên kết tài khoản")
                                .asRuntimeException()
                );
            }
            responseObserver.onNext(rs);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error(e.getMessage());
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void checkAccountExist(AccountProto.CheckAccountExistRequest rq, StreamObserver<AccountProto.CheckAccountExistResponse> responseObserver) {
        try {
            AccountProto.CheckAccountExistResponse rs = accountService.isAccountExist(rq);
            responseObserver.onNext(rs);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error(e.getMessage());
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }
}
