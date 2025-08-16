package com.example.auth.services;

import com.example.auth.consts.grpcPath;
import com.example.auth.dto.response.RegisterResponse;
import com.example.auth.protopkg.UserProto;
import com.example.auth.protopkg.UserServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
public class AuthService {
    private final UserServiceGrpc.UserServiceBlockingStub userStub;

    public AuthService() {
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(grpcPath.USER_SERVICE, grpcPath.USER_SERVICE_PORT)
                .usePlaintext()
                .build();

        this.userStub = UserServiceGrpc.newBlockingStub(channel);
    }

    public RegisterResponse register(String username, String password, String citizenId) {
        UserProto.NewUserRequest request = UserProto.NewUserRequest.newBuilder()
                .setUsername(username)
                .setPassword(password)
                .setCitizenId(citizenId)
                .build();

        UserProto.NewUserResponse rs = userStub.newUser(request);

        UserProto.User userProto = rs.getUser();

        RegisterResponse response = new RegisterResponse();
        response.setId(userProto.getId());
        response.setUsername(userProto.getUsername());
        response.setRoles(new HashSet<>(userProto.getRolesList()));
        response.setCitizenId(userProto.getCitizenId());
        response.setCreateAt(userProto.getCreateAt());
        return response;
    }
}
