package com.banking.userService.service.grpcService;


import com.banking.userService.dto.response.UserResponse;
import com.banking.userService.entity.Role;
import com.banking.userService.grpc.UserProto;
import com.banking.userService.grpc.UserServiceGrpc;
import com.banking.userService.service.UserService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@GrpcService
public class UserGrpcService extends UserServiceGrpc.UserServiceImplBase {

    @Autowired
    private UserService userService;

    @PostConstruct
    public void init() {
        System.out.println("gRPC service initialized");
    }

    @Override
    public void newUserGenOtp(UserProto.NewUserRequest request, StreamObserver<UserProto.NewUserGenOtpResponse> responseObserver) {
        try {
            Boolean otpRes = userService.genOTP(request.getUsername(), request.getPassword(), request.getCitizenId(), request.getTypeVerify());
            UserProto.NewUserGenOtpResponse res;
            if (otpRes) {
                res = UserProto.NewUserGenOtpResponse.newBuilder()
                        .setSuccess(true)
                        .setMessage("OTP has been send to " + request.getUsername())
                        .build();
            } else {
                res = UserProto.NewUserGenOtpResponse.newBuilder()
                        .setSuccess(false)
                        .setMessage("Can not generate OTP")
                        .build();
            }
            responseObserver.onNext(res);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error(e.getMessage());
            responseObserver.onError(
                    Status.UNAUTHENTICATED
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void verifyOtpRegister(UserProto.verifyOtpRegisterRequest request, StreamObserver<UserProto.NewUserResponse> responseObserver) {
        try {
            UserResponse newUser = userService.registerVerifyOtp(request.getUsername(), request.getOtpValue());
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
        } catch (Exception e) {
            log.error(e.getMessage());
            responseObserver.onError(
                    Status.UNAUTHENTICATED
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void login (UserProto.LoginRequest rq, StreamObserver<UserProto.LoginResponse> responseObserver) {
        try {
            UserProto.LoginResponse loginResponse = userService.login(rq);
            responseObserver.onNext(loginResponse);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error(e.getMessage());
            responseObserver.onError(
                    Status.UNAUTHENTICATED
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }

    }
    @Override
    public void checkUserExist(UserProto.CheckUserExistRequest request, StreamObserver<UserProto.CheckUserExistResponse> responseObserver) {
        UserProto.CheckUserExistResponse rs= userService.checkUserExist(request);
        responseObserver.onNext(rs);
        responseObserver.onCompleted();
    }

    public void getUserById(UserProto.GetUserRequestById rq, StreamObserver<UserProto.UserResponse> responseObserver) {
        try {
            UserProto.UserResponse rs = userService.getUserById(rq.getUserId());
            responseObserver.onNext(rs);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error(e.getMessage());
            responseObserver.onError(
                    Status.UNAUTHENTICATED
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void changePassword(UserProto.ChangePasswordRequest rq, StreamObserver<UserProto.ChangePasswordResponse> responseObserver) {
        try {
            UserProto.ChangePasswordResponse rs = userService.changePassword(rq);
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
    public void forgotPasswordRequestOtp(UserProto.ForgotPasswordOTPRequest rq,StreamObserver<UserProto.ForgotPasswordOTPResponse> responseObserver) {
        try {
            UserProto.ForgotPasswordOTPResponse rs = userService.forgotPasswordOtpRequest(rq);
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
    public void verifyOTPForgotPassword(UserProto.VerifyOtpForgotPasswordRequest rq, StreamObserver<UserProto.VerifyOtpForgotPasswordResponse> responseStreamObserver) {
        try {
            UserProto.VerifyOtpForgotPasswordResponse rs = userService.verifyOtpForgotPassword(rq);
            responseStreamObserver.onNext(rs);
            responseStreamObserver.onCompleted();
        } catch (Exception e) {
            log.error(e.getMessage());
            responseStreamObserver.onError(
                    Status.INTERNAL
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void getUserIdByUsername(UserProto.GetUserIdByUsernameRequest rq, StreamObserver<UserProto.GetUserIdByUsernameResponse> responseStreamObserver) {
        try {
            UserProto.GetUserIdByUsernameResponse rs = userService.getUserIdByUsername(rq);
            responseStreamObserver.onNext(rs);
            responseStreamObserver.onCompleted();
        } catch (Exception e) {
            log.error(e.getMessage());
            responseStreamObserver.onError(
                    Status.INTERNAL
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void updateUserInfo(UserProto.User request, StreamObserver<UserProto.User> responseObserver) {
        try {
            UserProto.User rs = userService.updateUserInfo(request);
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
    public void verifyPassword(UserProto.VerifyPasswordRequest request, StreamObserver<UserProto.VerifyPasswordResponse> responseObserver) {
        try {
            UserProto.VerifyPasswordResponse rs = userService.verifyPassword(request);
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
