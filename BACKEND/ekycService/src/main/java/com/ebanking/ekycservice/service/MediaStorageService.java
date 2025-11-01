package com.ebanking.ekycservice.service;

import com.ebanking.ekycservice.exception.EkycException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;

/**
 * Service để quản lý lưu trữ file media (images, videos)
 * Thay vì lưu base64 vào DB, lưu file vào filesystem và lưu path vào DB
 */
@Service
@Slf4j
public class MediaStorageService {

    @Value("${app.upload.base-dir:./uploads}")
    private String baseUploadDir;

    @Value("${app.upload.max-file-size-mb:10}")
    private int maxFileSizeMb;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    /**
     * Lưu video liveness
     * @param videoBase64 Video dạng base64
     * @param sessionId Session ID để tổ chức thư mục
     * @return Đường dẫn tương đối của file
     */
    public String saveVideo(String videoBase64, String sessionId) {
        try {
            // Clean base64 string
            String cleanBase64 = cleanBase64String(videoBase64);
            byte[] videoBytes = Base64.getDecoder().decode(cleanBase64);

            // Validate file size
            validateFileSize(videoBytes.length);

            // Generate filename
            String timestamp = LocalDateTime.now().format(FORMATTER);
            String filename = String.format("liveness_%s_%s.mp4", sessionId, timestamp);

            // Create directory structure: uploads/videos/{sessionId}/
            Path dirPath = Paths.get(baseUploadDir, "videos", sessionId);
            Files.createDirectories(dirPath);

            // Save file
            Path filePath = dirPath.resolve(filename);
            Files.write(filePath, videoBytes, StandardOpenOption.CREATE);

            String relativePath = String.format("videos/%s/%s", sessionId, filename);
            log.info("Saved video: {} (size: {} bytes)", relativePath, videoBytes.length);

            return relativePath;
        } catch (IOException e) {
            log.error("Failed to save video for session {}: {}", sessionId, e.getMessage(), e);
            throw new EkycException("Failed to save video file: " + e.getMessage());
        }
    }

    /**
     * Lưu ảnh (OCR front/back, portrait)
     * @param imageBase64 Image dạng base64
     * @param sessionId Session ID
     * @param imageType Loại ảnh: "front", "back", "portrait"
     * @return Đường dẫn tương đối của file
     */
    public String saveImage(String imageBase64, String sessionId, String imageType) {
        try {
            // Clean base64 string
            String cleanBase64 = cleanBase64String(imageBase64);
            byte[] imageBytes = Base64.getDecoder().decode(cleanBase64);

            // Validate file size
            validateFileSize(imageBytes.length);

            // Generate filename
            String timestamp = LocalDateTime.now().format(FORMATTER);
            String filename = String.format("%s_%s_%s.jpg", imageType, sessionId, timestamp);

            // Create directory structure: uploads/images/{sessionId}/
            Path dirPath = Paths.get(baseUploadDir, "images", sessionId);
            Files.createDirectories(dirPath);

            // Save file
            Path filePath = dirPath.resolve(filename);
            Files.write(filePath, imageBytes, StandardOpenOption.CREATE);

            String relativePath = String.format("images/%s/%s", sessionId, filename);
            log.info("Saved image: {} (size: {} bytes)", relativePath, imageBytes.length);

            return relativePath;
        } catch (IOException e) {
            log.error("Failed to save image for session {}: {}", sessionId, e.getMessage(), e);
            throw new EkycException("Failed to save image file: " + e.getMessage());
        }
    }

    /**
     * Đọc file và trả về bytes (dùng khi cần gửi lại cho API hoặc client)
     * @param relativePath Đường dẫn tương đối
     * @return File bytes
     */
    public byte[] loadFile(String relativePath) {
        try {
            Path filePath = Paths.get(baseUploadDir, relativePath);
            if (!Files.exists(filePath)) {
                log.error("File not found: {}", relativePath);
                throw new EkycException("File not found: " + relativePath);
            }

            byte[] bytes = Files.readAllBytes(filePath);
            log.debug("Loaded file: {} (size: {} bytes)", relativePath, bytes.length);
            return bytes;
        } catch (IOException e) {
            log.error("Failed to load file {}: {}", relativePath, e.getMessage(), e);
            throw new EkycException("Failed to load file: " + e.getMessage());
        }
    }

    /**
     * Đọc file và convert sang base64 (dùng khi cần gửi cho FPT AI)
     * @param relativePath Đường dẫn tương đối
     * @return Base64 string
     */
    public String loadFileAsBase64(String relativePath) {
        byte[] bytes = loadFile(relativePath);
        return Base64.getEncoder().encodeToString(bytes);
    }

    /**
     * Xóa file (dùng khi session expire hoặc user xóa)
     * @param relativePath Đường dẫn tương đối
     */
    public void deleteFile(String relativePath) {
        try {
            Path filePath = Paths.get(baseUploadDir, relativePath);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Deleted file: {}", relativePath);
            }
        } catch (IOException e) {
            log.warn("Failed to delete file {}: {}", relativePath, e.getMessage());
        }
    }

    /**
     * Xóa toàn bộ folder của session (cleanup)
     * @param sessionId Session ID
     */
    public void deleteSessionFiles(String sessionId) {
        try {
            // Delete images folder
            Path imagesPath = Paths.get(baseUploadDir, "images", sessionId);
            if (Files.exists(imagesPath)) {
                Files.walk(imagesPath)
                        .sorted((a, b) -> b.compareTo(a)) // Delete files before directories
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (IOException e) {
                                log.warn("Failed to delete: {}", path);
                            }
                        });
            }

            // Delete videos folder
            Path videosPath = Paths.get(baseUploadDir, "videos", sessionId);
            if (Files.exists(videosPath)) {
                Files.walk(videosPath)
                        .sorted((a, b) -> b.compareTo(a))
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                            } catch (IOException e) {
                                log.warn("Failed to delete: {}", path);
                            }
                        });
            }

            log.info("Deleted all files for session: {}", sessionId);
        } catch (IOException e) {
            log.error("Failed to delete session files for {}: {}", sessionId, e.getMessage());
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
            throw new EkycException(String.format(
                    "File size exceeds maximum allowed size of %d MB", maxFileSizeMb));
        }

        if (sizeInBytes == 0) {
            throw new EkycException("File is empty");
        }
    }

    /**
     * Get absolute path from relative path
     */
    public Path getAbsolutePath(String relativePath) {
        return Paths.get(baseUploadDir, relativePath);
    }
}

