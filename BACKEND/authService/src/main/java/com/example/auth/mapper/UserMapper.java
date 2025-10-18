package com.example.auth.mapper;

import com.example.auth.dto.request.ChangePasswordRequest;
import com.example.auth.dto.response.ChangePasswordResponse;
import com.example.auth.dto.response.LoginResponse;
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
}
