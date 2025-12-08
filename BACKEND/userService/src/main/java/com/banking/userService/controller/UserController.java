package com.banking.userService.controller;

import com.banking.userService.dto.request.AvatarUploadRequest;
import com.banking.userService.dto.response.InternalUserResponse;
import com.banking.userService.dto.response.UserResponse;
import com.banking.userService.dto.response.UserInfoResponse;
import com.banking.userService.entity.User;
import com.banking.userService.entity.UserInfo;
import com.banking.userService.mapper.UserMapper;
import com.banking.userService.repository.IUserInfoRepository;
import com.banking.userService.repository.IUserRepository;
import com.banking.userService.service.AvatarService;
import com.banking.userService.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @Autowired
    AvatarService avatarService;

    @Value("${server.port:8001}")
    private String serverPort;

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

        // Build avatar URL if avatar exists
        String avatarUrl = null;
        if (userInfo != null && userInfo.getAvatarPath() != null) {
            avatarUrl = String.format("http://localhost:%s/user/%d/avatar", serverPort, userId);
        }

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
                // Avatar
                .avatarUrl(avatarUrl)
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Upload user avatar
     */
    @PostMapping("/{userId}/avatar")
    public ResponseEntity<String> uploadAvatar(
            @PathVariable Long userId,
            @RequestBody AvatarUploadRequest request) {
        try {
            String relativePath = avatarService.saveAvatar(userId, request.getImageBase64());
            String avatarUrl = String.format("http://localhost:%s/user/%d/avatar", serverPort, userId);
            return ResponseEntity.ok(avatarUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload avatar: " + e.getMessage());
        }
    }

    /**
     * Delete user avatar
     */
    @DeleteMapping("/{userId}/avatar")
    public ResponseEntity<Void> deleteAvatar(@PathVariable Long userId) {
        try {
            avatarService.deleteAvatar(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get user avatar image
     */
    @GetMapping("/{userId}/avatar")
    public ResponseEntity<Resource> getAvatar(@PathVariable Long userId) {
        try {
            byte[] avatarBytes = avatarService.getAvatarBytes(userId);
            ByteArrayResource resource = new ByteArrayResource(avatarBytes);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"avatar.jpg\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

}
