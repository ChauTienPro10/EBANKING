package com.banking.userService.service;

import com.banking.userService.entity.User;
import com.banking.userService.entity.UserInfo;
import com.banking.userService.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Optional;

/**
 * Service to manage user avatar uploads
 * Follows the same file storage pattern as eKYC MediaStorageService
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AvatarService {

    private final IUserRepository userRepository;

    @Value("${app.upload.avatar.base-dir:./uploads/avatars}")
    private String baseUploadDir;

    @Value("${app.upload.avatar.max-size-mb:5}")
    private int maxFileSizeMb;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    /**
     * Save user avatar
     * @param userId User ID
     * @param imageBase64 Base64 encoded image
     * @return Relative path to saved avatar
     */
    @Transactional
    public String saveAvatar(Long userId, String imageBase64) {
        try {
            // Get user
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found: " + userId);
            }

            User user = userOpt.get();
            UserInfo userInfo = user.getUserInfo();
            if (userInfo == null) {
                throw new RuntimeException("UserInfo not found for user: " + userId);
            }

            // Delete old avatar if exists
            if (userInfo.getAvatarPath() != null && !userInfo.getAvatarPath().isEmpty()) {
                deleteAvatarFile(userInfo.getAvatarPath());
            }

            // Clean and decode base64
            String cleanBase64 = cleanBase64String(imageBase64);
            byte[] imageBytes = Base64.getDecoder().decode(cleanBase64);

            // Validate file size
            validateFileSize(imageBytes.length);

            // Generate filename
            String timestamp = LocalDateTime.now().format(FORMATTER);
            String filename = String.format("avatar_%s_%s.jpg", userId, timestamp);

            // Create directory structure: uploads/avatars/{userId}/
            Path dirPath = Paths.get(baseUploadDir, String.valueOf(userId));
            Files.createDirectories(dirPath);

            // Save file
            Path filePath = dirPath.resolve(filename);
            Files.write(filePath, imageBytes, StandardOpenOption.CREATE);

            String relativePath = String.format("avatars/%s/%s", userId, filename);
            log.info("Saved avatar: {} (size: {} bytes)", relativePath, imageBytes.length);

            // Update user info
            userInfo.setAvatarPath(relativePath);
            userRepository.save(user);

            return relativePath;
        } catch (IOException e) {
            log.error("Failed to save avatar for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to save avatar: " + e.getMessage());
        }
    }

    /**
     * Delete user avatar
     * @param userId User ID
     */
    @Transactional
    public void deleteAvatar(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + userId);
        }

        User user = userOpt.get();
        UserInfo userInfo = user.getUserInfo();
        if (userInfo != null && userInfo.getAvatarPath() != null) {
            deleteAvatarFile(userInfo.getAvatarPath());
            userInfo.setAvatarPath(null);
            userRepository.save(user);
            log.info("Deleted avatar for user: {}", userId);
        }
    }

    /**
     * Get avatar file bytes
     * @param userId User ID
     * @return Avatar file bytes
     */
    public byte[] getAvatarBytes(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found: " + userId);
        }

        User user = userOpt.get();
        UserInfo userInfo = user.getUserInfo();
        if (userInfo == null || userInfo.getAvatarPath() == null) {
            throw new RuntimeException("Avatar not found for user: " + userId);
        }

        return loadFile(userInfo.getAvatarPath());
    }

    /**
     * Get avatar path for user
     * @param userId User ID
     * @return Avatar relative path or null
     */
    public String getAvatarPath(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return null;
        }

        User user = userOpt.get();
        UserInfo userInfo = user.getUserInfo();
        return userInfo != null ? userInfo.getAvatarPath() : null;
    }

    /**
     * Load file from filesystem
     */
    private byte[] loadFile(String relativePath) {
        try {
            Path filePath = Paths.get(baseUploadDir).getParent().resolve(relativePath);
            if (!Files.exists(filePath)) {
                log.error("Avatar file not found: {}", relativePath);
                throw new RuntimeException("Avatar file not found: " + relativePath);
            }

            byte[] bytes = Files.readAllBytes(filePath);
            log.debug("Loaded avatar: {} (size: {} bytes)", relativePath, bytes.length);
            return bytes;
        } catch (IOException e) {
            log.error("Failed to load avatar {}: {}", relativePath, e.getMessage(), e);
            throw new RuntimeException("Failed to load avatar: " + e.getMessage());
        }
    }

    /**
     * Delete avatar file from filesystem
     */
    private void deleteAvatarFile(String relativePath) {
        try {
            Path filePath = Paths.get(baseUploadDir).getParent().resolve(relativePath);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Deleted avatar file: {}", relativePath);
            }
        } catch (IOException e) {
            log.warn("Failed to delete avatar file {}: {}", relativePath, e.getMessage());
        }
    }

    /**
     * Clean base64 string (remove data:image/jpeg;base64, prefix)
     */
    private String cleanBase64String(String base64) {
        if (base64 == null || base64.isEmpty()) {
            throw new IllegalArgumentException("Base64 string cannot be null or empty");
        }

        String cleaned = base64;

        // Remove data URI prefix if exists
        if (cleaned.contains("base64,")) {
            cleaned = cleaned.substring(cleaned.indexOf("base64,") + 7);
        }

        // Remove all whitespaces
        cleaned = cleaned.replaceAll("\\s+", "");

        return cleaned;
    }

    /**
     * Validate file size
     */
    private void validateFileSize(int sizeInBytes) {
        int maxSizeBytes = maxFileSizeMb * 1024 * 1024;
        if (sizeInBytes > maxSizeBytes) {
            throw new RuntimeException(String.format(
                    "File size exceeds maximum allowed size of %d MB", maxFileSizeMb));
        }

        if (sizeInBytes == 0) {
            throw new RuntimeException("File is empty");
        }
    }
}
