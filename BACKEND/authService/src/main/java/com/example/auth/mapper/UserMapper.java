package com.example.auth.mapper;

import com.example.auth.dto.request.ChangePasswordRequest;
import com.example.auth.dto.request.ForgotPasswordRequestOTP;
import com.example.auth.dto.request.ForgotPasswordVerifyOtpReq;
import com.example.auth.dto.request.UpdateUserRequest;
import com.example.auth.dto.response.*;
import com.example.auth.protopkg.UserProto;
import org.springframework.stereotype.Component;

import java.util.HashSet;

@Component
public class UserMapper {
    public LoginResponse fromProto(UserProto.LoginResponse loginResponse) {
        return LoginResponse.builder()
                .jwt(loginResponse.getJwt())
                .id(loginResponse.getUser().getId())
                .address(loginResponse.getUser().getAddress())
                .citizenId(loginResponse.getUser().getCitizenId())
                .birthday(loginResponse.getUser().getBirthday())
                .username(loginResponse.getUser().getUsername())
                .createAt(loginResponse.getUser().getCreateAt())
                .isMale(loginResponse.getUser().getIsMale())
                .fullName(loginResponse.getUser().getFullName())
                .roles(new HashSet<>(loginResponse.getUser().getRolesList()))
                .build();
    }

    public UserProto.ChangePasswordRequest toChangePasswordRequestProto(ChangePasswordRequest request) {
        return UserProto.ChangePasswordRequest.newBuilder()
                .setUsername(request.getUsername())
                .setOldPass(request.getOldPassword())
                .setPassword(request.getPassword())
                .build();
    }

    public ChangePasswordResponse toChangePasswordResponseDTO(UserProto.ChangePasswordResponse rs) {
        ChangePasswordResponse dto = new ChangePasswordResponse();
        dto.setStatus(rs.getStatus());
        dto.setDescription(rs.getDescription());
        return dto;
    }

    public UserProto.ForgotPasswordOTPRequest toProto(ForgotPasswordRequestOTP rq) {
        if (rq == null) {
            return null;
        }

        return UserProto.ForgotPasswordOTPRequest.newBuilder()
                .setUsername(rq.getUsername() != null ? rq.getUsername() : "")
                .setTypeVerify(rq.getTypeVerify() != null ? rq.getTypeVerify() : "")
                .build();
    }

    public ForgotPasswordResponseOTP toDto(UserProto.ForgotPasswordOTPResponse response) {
        if (response == null) {
            return null;
        }

        ForgotPasswordResponseOTP dto = new ForgotPasswordResponseOTP();
        dto.setStatus(response.getStatus());
        return dto;
    }

    public UserProto.VerifyOtpForgotPasswordRequest toProto(ForgotPasswordVerifyOtpReq r) {
        if (r == null) {
            return null;
        }

        return UserProto.VerifyOtpForgotPasswordRequest.newBuilder()
                .setOtp(r.getOtp() != null ? r.getOtp() : "")
                .setUsername(r.getUsername() != null ? r.getUsername() : "")
                .setPassword(r.getPassword() != null ? r.getPassword() : "")
                .build();
    }


    public ForgotPasswordVerifyOtpRes toDto(UserProto.VerifyOtpForgotPasswordResponse response) {
        if (response == null) {
            return null;
        }
        ForgotPasswordVerifyOtpRes dto = new ForgotPasswordVerifyOtpRes();
        dto.setStatus(response.getStatus());
        dto.setError(response.getError());
        return dto;
    }

    public UpdateUserResponse protoToUpdateUserResponse(UserProto.UserResponse userResponse) {
        if (userResponse == null || !userResponse.hasUser()) {
            return null;
        }

        UserProto.User user = userResponse.getUser();

        UpdateUserResponse response = new UpdateUserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setBirthday(user.getBirthday());
        response.setIsMale(String.valueOf(user.getIsMale()));
        response.setCitizenId(user.getCitizenId());
        response.setAddress(user.getAddress());

        // email and phone are not present in the proto, set as null or default
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());

        return response;
    }

    public UserProto.User fromUpdateUserRequest(UpdateUserRequest request) {
        if (request == null) {
            return null;
        }

        UserProto.User.Builder builder = UserProto.User.newBuilder();

        if (request.getFullName() != null) {
            builder.setFullName(request.getFullName());
        }
        if (request.getUsername() != null) {
            builder.setUsername(request.getUsername());
        }
        if (request.getAddress() != null) {
            builder.setAddress(request.getAddress());
        }
        if (request.getBirthday() != null) {
            builder.setBirthday(request.getBirthday()); // giả sử gửi dưới dạng String, ví dụ "2000-05-20"
        }
        if (request.getEmail() != null) {
            builder.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            builder.setPhone(request.getPhone());
        }
        if (request.getIsMale() != null) {
            builder.setIsMale(request.getIsMale());
        }
        return builder.build();
    }

    public UpdateUserResponse fromProtoToUpdateUserResponse(UserProto.User user) {
        if (user == null) {
            return null;
        }

        UpdateUserResponse response = new UpdateUserResponse();

        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setBirthday(user.getBirthday());
        response.setIsMale(user.getIsMale() ? "Male" : "Female");
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setCitizenId(user.getCitizenId());
        response.setAddress(user.getAddress());

        return response;
    }



}
