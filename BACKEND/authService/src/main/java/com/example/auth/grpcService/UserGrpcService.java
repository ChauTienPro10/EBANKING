package com.example.auth.grpcService;

import com.example.auth.protopkg.UserRequest;
import com.example.auth.protopkg.UserResponse;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import com.example.auth.protopkg.UserServiceGrpc;

@GrpcService
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {

    public void getUser(UserRequest request, StreamObserver<UserResponse> responseObserver) {
        UserResponse response = UserResponse.newBuilder()
                .setId(request.getId())
                .setName("Nguyen Van A")
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
