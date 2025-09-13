package com.ebanking.transactionService.service.grpc;

import com.ebanking.transactionService.service.AccountService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;
import com.ebanking.transactionService.grpc.AccountProto;
import com.ebanking.transactionService.grpc.AccountServiceGrpc;

@GrpcService
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
            responseObserver.onError(
                    Status.UNAUTHENTICATED
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }
}
