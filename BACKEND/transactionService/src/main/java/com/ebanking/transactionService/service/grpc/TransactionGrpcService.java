package com.ebanking.transactionService.service.grpc;

import com.ebanking.transactionService.grpc.TransactionProto;
import com.ebanking.transactionService.grpc.TransactionServiceGrpc;
import com.ebanking.transactionService.service.TransactionService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

@GrpcService
public class TransactionGrpcService extends TransactionServiceGrpc.TransactionServiceImplBase {

    @Autowired
    TransactionService transactionService;

    @Override
    public void transfer(TransactionProto.TransferRequest request, StreamObserver<TransactionProto.TransferResponse> responseObserver) {
        try {
            responseObserver.onNext(transactionService.transfer(request));
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }
}
