package com.banking.userService.service.grpcService;


import com.banking.userService.dto.response.UserResponse;
import com.banking.userService.entity.Role;
import com.banking.userService.grpc.UserProto;
import com.banking.userService.grpc.UserServiceGrpc;
import com.banking.userService.service.UserService;
import io.grpc.stub.StreamObserver;
import jakarta.annotation.PostConstruct;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Set;
import java.util.stream.Collectors;

@GrpcService
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {

    @Autowired
    private UserService userService;

    @PostConstruct
    public void init() {
        System.out.println("✅ gRPC service initialized");
    }

    @Override
    public void newUser(UserProto.NewUserRequest request, StreamObserver<UserProto.NewUserResponse> responseObserver) {
        UserResponse newUser = userService.createUser(request.getUsername(), request.getPassword(), request.getCitizenId(), request.getTypeVerify());

        Set<String> roleNames = newUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        UserProto.User userProto = UserProto.User.newBuilder()
                .setId(newUser.getId())
                .setCitizenId(newUser.getCitizenId())
                .addAllRoles(roleNames)
                .setCreateAt(newUser.getCreateAt().toString())
                .setUsername(newUser.getUsername())
                .build();

        var response = UserProto.NewUserResponse.newBuilder()
                .setUser(userProto)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void login (UserProto.LoginRequest rq, StreamObserver<UserProto.LoginResponse> responseObserver) {
        UserProto.LoginResponse loginResponse = userService.login(rq);
        responseObserver.onNext(loginResponse);
        responseObserver.onCompleted();
    }
}
