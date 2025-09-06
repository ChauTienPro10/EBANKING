package com.example.auth.services;

import com.example.auth.consts.grpcPath;
import com.example.auth.dto.request.LoginRequest;
import com.example.auth.dto.response.CreateUserOtpResponse;
import com.example.auth.dto.response.LoginResponse;
import com.example.auth.dto.response.RegisterResponse;
import com.example.auth.mapper.UserMapper;
import com.example.auth.protopkg.UserProto;
import com.example.auth.protopkg.UserServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
public class AuthService {
    private final UserServiceGrpc.UserServiceBlockingStub userStub;

    @Autowired
    private UserMapper userMapper;

    public AuthService() {
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(grpcPath.USER_SERVICE, grpcPath.USER_SERVICE_PORT)
                .usePlaintext()
                .build();

        this.userStub = UserServiceGrpc.newBlockingStub(channel);
    }

    public CreateUserOtpResponse register(String username, String password, String citizenId, String typeVerify) {
        UserProto.NewUserRequest request = UserProto.NewUserRequest.newBuilder()
                .setUsername(username)
                .setPassword(password)
                .setCitizenId(citizenId)
                .setTypeVerify(typeVerify)
                .build();

        UserProto.NewUserGenOtpResponse rs = userStub.newUserGenOtp(request);
        return CreateUserOtpResponse.builder()
                .success(rs.getSuccess())
                .message(rs.getMessage())
                .build();
    }

    public RegisterResponse verifyOtpRegister(String username, String optValue) {
        UserProto.verifyOtpRegisterRequest request = UserProto.verifyOtpRegisterRequest.newBuilder()
                .setUsername(username)
                .setOtpValue(optValue)
                .build();
        UserProto.NewUserResponse newUserResponse = userStub.verifyOtpRegister(request);
        return RegisterResponse.builder()
                .id(newUserResponse.getUser().getId())
                .citizenId(newUserResponse.getUser().getCitizenId())
                .username(newUserResponse.getUser().getUsername())
                .createAt(newUserResponse.getUser().getCreateAt())
                .roles(new HashSet<>(newUserResponse.getUser().getRolesList()))
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        UserProto.LoginRequest loginRequest = UserProto.LoginRequest.newBuilder()
                .setUsername(request.getUsername())
                .setPassword(request.getPassword())
                .build();
        UserProto.LoginResponse loginResponse = userStub.login(loginRequest);
        return userMapper.fromProto(loginResponse);
    }

    public Boolean checkUserExist(String username) {
        UserProto.CheckUserExistRequest request = UserProto.CheckUserExistRequest.newBuilder()
                .setUsername(username)
                .build();
        UserProto.CheckUserExistResponse  rs = userStub.checkUserExist(request);
        return rs.getIsExist();
    }
}
