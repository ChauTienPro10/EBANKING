package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.services.AvatarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(IURL.AUTH_URL) // "/authService/auth"
@RequiredArgsConstructor
@Slf4j
public class AvatarController {

    private final AvatarService avatarService;

    /**
     * Upload user avatar
     * Proxy to UserService
     */
    @PostMapping("user/{userId}/avatar")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            @RequestHeader Map<String, String> headers) {
        
        log.info("POST::: user/{}/avatar", userId);
        return avatarService.uploadAvatar(userId, request.get("imageBase64"));
    }

    /**
     * Delete user avatar
     * Proxy to UserService
     */
    @DeleteMapping("user/{userId}/avatar")
    public ResponseEntity<Void> deleteAvatar(
            @PathVariable Long userId,
            @RequestHeader Map<String, String> headers) {
        
        log.info("DELETE::: user/{}/avatar", userId);
        return avatarService.deleteAvatar(userId);
    }

    /**
     * Get user avatar
     * Proxy to UserService
     */
    @GetMapping("user/{userId}/avatar")
    public ResponseEntity<?> getAvatar(@PathVariable Long userId) {
        log.info("GET::: user/{}/avatar", userId);
        return avatarService.getAvatar(userId);
    }
}
