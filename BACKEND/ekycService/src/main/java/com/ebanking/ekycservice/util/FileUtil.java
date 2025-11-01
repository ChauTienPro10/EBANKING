package com.ebanking.ekycservice.util;

import com.ebanking.ekycservice.exception.EkycException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@Slf4j
public class FileUtil {

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

    /**
     * Convert MultipartFile to Base64 string
     * @param file The file to convert
     * @return Base64 encoded string
     */
    public static String convertToBase64(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new EkycException("File is empty or null");
        }

        try {
            byte[] fileBytes = file.getBytes();
            return Base64.getEncoder().encodeToString(fileBytes);
        } catch (IOException e) {
            log.error("Error converting file to base64: {}", e.getMessage());
            throw new EkycException("Failed to convert file to base64: " + e.getMessage());
        }
    }

    /**
     * Validate image file
     * @param file The image file to validate
     */
    public static void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new EkycException("Image file is required");
        }

        // Check file size
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new EkycException("Image file size exceeds maximum allowed size (10MB)");
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new EkycException("Invalid file type. Only image files are allowed");
        }

        // Check specific image formats
        if (!contentType.equals("image/jpeg") &&
            !contentType.equals("image/jpg") &&
            !contentType.equals("image/png")) {
            throw new EkycException("Invalid image format. Only JPEG, JPG, and PNG are supported");
        }

        log.info("Image file validated: name={}, size={}, type={}",
                file.getOriginalFilename(), file.getSize(), contentType);
    }

    /**
     * Validate video file
     * @param file The video file to validate
     */
    public static void validateVideoFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new EkycException("Video file is required");
        }

        // Check file size
        if (file.getSize() > MAX_VIDEO_SIZE) {
            throw new EkycException("Video file size exceeds maximum allowed size (50MB)");
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new EkycException("Invalid file type. Only video files are allowed");
        }

        // Check specific video formats
        if (!contentType.equals("video/mp4") &&
            !contentType.equals("video/mpeg") &&
            !contentType.equals("video/webm")) {
            throw new EkycException("Invalid video format. Only MP4, MPEG, and WEBM are supported");
        }

        log.info("Video file validated: name={}, size={}, type={}",
                file.getOriginalFilename(), file.getSize(), contentType);
    }
}

