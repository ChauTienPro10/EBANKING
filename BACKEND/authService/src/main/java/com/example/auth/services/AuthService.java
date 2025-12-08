package com.example.auth.services;

import com.example.auth.consts.grpcPath;
import com.example.auth.dto.request.*;
import com.example.auth.dto.response.*;
import com.example.auth.mapper.UserMapper;
import com.example.auth.protopkg.UserProto;
import com.example.auth.protopkg.UserServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@Slf4j
public class AuthService {
    private final UserServiceGrpc.UserServiceBlockingStub userStub;

    private final UserMapper userMapper;

    @Autowired
    public AuthService(grpcPath grpcPath, UserMapper userMapper) {
        this.userMapper = userMapper;

        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(grpcPath.getUserServiceHost(), grpcPath.getUserServicePort())
                .usePlaintext()
                .build();

        this.userStub = UserServiceGrpc.newBlockingStub(channel);
        log.info("HOST USERSERVICE::: {}:{}", grpcPath.getUserServiceHost(), grpcPath.getUserServicePort());

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

    public UserProto.UserResponse getUserById(Long id) {
        UserProto.GetUserRequestById rq = UserProto.GetUserRequestById.newBuilder()
                .setUserId(id)
                .build();
        return userStub.getUserById(rq);
    }

    public UpdateUserResponse getUserInfo(Long userId) {
        UserProto.UserResponse rs = getUserById(userId);
        return userMapper.protoToUpdateUserResponse(rs);
    }

    public ChangePasswordResponse changePassword(ChangePasswordRequest request) {
        UserProto.ChangePasswordRequest rq = userMapper.toChangePasswordRequestProto(request);
        return userMapper.toChangePasswordResponseDTO(userStub.changePassword(rq));
    }

    public ForgotPasswordResponseOTP forgotPasswordRequestOtp(ForgotPasswordRequestOTP requestOTP) {
        UserProto.ForgotPasswordOTPRequest rq = userMapper.toProto(requestOTP);
        return userMapper.toDto(userStub.forgotPasswordRequestOtp(rq));
    }

    public ForgotPasswordVerifyOtpRes forgotPasswordVerifyOtp(ForgotPasswordVerifyOtpReq r) {
        UserProto.VerifyOtpForgotPasswordRequest rq = userMapper.toProto(r);
        return userMapper.toDto(userStub.verifyOTPForgotPassword(rq));
    }

    public long getUserIdByUsername(String username) {
        UserProto.GetUserIdByUsernameRequest request = UserProto.GetUserIdByUsernameRequest.newBuilder()
                .setUsername(username)
                .build();
        UserProto.GetUserIdByUsernameResponse rs = userStub.getUserIdByUsername(request);
        return (long) rs.getUserId();
    }

    public boolean verifyPassword(String username, String password) {
        UserProto.VerifyPasswordRequest request = UserProto.VerifyPasswordRequest.newBuilder()
                .setUsername(username)
                .setPassword(password)
                .build();
        UserProto.VerifyPasswordResponse rs = userStub.verifyPassword(request);
        return rs.getStatus();
    }

    public UpdateUserResponse updateUserInfo(UpdateUserRequest request) {
        if(!verifyPassword(request.getUsername(), request.getPassword())) {
            return null;
        }
        UserProto.User rq = userMapper.fromUpdateUserRequest(request);
        UserProto.User rs = userStub.updateUserInfo(rq);
        return userMapper.fromProtoToUpdateUserResponse(rs);
    }

    /**
     * Proxy avatar upload to UserService via HTTP
     */
    public org.springframework.http.ResponseEntity<?> uploadAvatar(Long userId, String imageBase64) {
        try {
            String url = "http://localhost:8001/user/" + userId + "/avatar";
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            java.util.Map<String, String> requestBody = new java.util.HashMap<>();
            requestBody.put("imageBase64", imageBase64);
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            
            org.springframework.http.HttpEntity<java.util.Map<String, String>> entity = 
                new org.springframework.http.HttpEntity<>(requestBody, headers);
            
            return restTemplate.postForEntity(url, entity, String.class);
        } catch (Exception e) {
            log.error("Failed to upload avatar: {}", e.getMessage());
            return org.springframework.http.ResponseEntity.badRequest().body("Failed to upload avatar");
        }
    }

    /**
     * Proxy avatar delete to UserService via HTTP
     */
    public org.springframework.http.ResponseEntity<Void> deleteAvatar(Long userId) {
        try {
            String url = "http://localhost:8001/user/" + userId + "/avatar";
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            restTemplate.delete(url);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to delete avatar: {}", e.getMessage());
            return org.springframework.http.ResponseEntity.notFound().build();
        }
    }

    /**
     * Proxy avatar get to UserService via HTTP
     */
    public org.springframework.http.ResponseEntity<?> getAvatar(Long userId) {
        try {
            String url = "http://localhost:8001/user/" + userId + "/avatar";
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            byte[] imageBytes = restTemplate.getForObject(url, byte[].class);
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.IMAGE_JPEG);
            
            return org.springframework.http.ResponseEntity.ok()
                .headers(headers)
                .body(imageBytes);
        } catch (Exception e) {
            log.error("Failed to get avatar: {}", e.getMessage());
            return org.springframework.http.ResponseEntity.notFound().build();
        }
    }
}
