package com.banking.userService.controller;

import com.banking.userService.dto.response.InternalUserResponse;
import com.banking.userService.dto.response.UserResponse;
import com.banking.userService.dto.response.UserInfoResponse;
import com.banking.userService.entity.User;
import com.banking.userService.entity.UserInfo;
import com.banking.userService.mapper.UserMapper;
import com.banking.userService.repository.IUserInfoRepository;
import com.banking.userService.repository.IUserRepository;
import com.banking.userService.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    IUserRepository userRepository;

    @Autowired
    UserMapper userMapper;

    @Autowired
    IUserInfoRepository userInfoRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<InternalUserResponse> getUserInfo(@PathVariable String userId) {
        Optional<User> us = userRepository.findById(Long.valueOf(userId));
        if (us.isEmpty()) {
            return null;
        }

        InternalUserResponse userResponse = InternalUserResponse
                .builder().username(us.get().getUsername())
                .fulName(us.get().getUserInfo().getFullName())
                .userId(us.get().getId())
                .build();
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Get full user info including eKYC data
     * Used by mobile app to display profile with eKYC status
     */
    @GetMapping("/{userId}/info")
    public ResponseEntity<UserInfoResponse> getUserInfoFull(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        UserInfo userInfo = user.getUserInfo();

        UserInfoResponse response = UserInfoResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(userInfo != null ? userInfo.getFullName() : null)
                .citizenId(userInfo != null ? userInfo.getCitizenId() : null)
                .birthday(userInfo != null ? userInfo.getBirthday() : null)
                .email(userInfo != null ? userInfo.getEmail() : null)
                .phone(userInfo != null ? userInfo.getPhone() : null)
                .isMale(userInfo != null ? userInfo.getIsMale() : null)
                .address(userInfo != null ? userInfo.getAddress() : null)
                .createAt(userInfo != null ? userInfo.getCreateAt() : null)
                .updatedAt(userInfo != null ? userInfo.getUpdatedAt() : null)
                // eKYC fields
                .ekycSessionId(userInfo != null ? userInfo.getEkycSessionId() : null)
                .ekycStatus(userInfo != null ? userInfo.getEkycStatus() : null)
                .ekycVerifiedAt(userInfo != null ? userInfo.getEkycVerifiedAt() : null)
                .build();

        return ResponseEntity.ok(response);
    }

}