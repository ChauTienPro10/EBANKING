package com.ebanking.ekycservice.controller;

import com.ebanking.ekycservice.service.MediaStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller để serve các file media (images, videos)
 * Client có thể request file bằng relative path
 */
@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Slf4j
public class MediaController {

    private final MediaStorageService mediaStorageService;

    /**
     * Get image file
     * Example: GET /api/v1/media/images/session123/front_session123_20241030_143022.jpg
     */
    @GetMapping("/images/**")
    public ResponseEntity<Resource> getImage(@RequestParam String path) {
        try {
            log.info("Fetching image: {}", path);

            byte[] fileBytes = mediaStorageService.loadFile(path);
            ByteArrayResource resource = new ByteArrayResource(fileBytes);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"image.jpg\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("Failed to fetch image: {}", path, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get video file
     * Example: GET /api/v1/media/videos/session123/liveness_session123_20241030_143022.mp4
     */
    @GetMapping("/videos/**")
    public ResponseEntity<Resource> getVideo(@RequestParam String path) {
        try {
            log.info("Fetching video: {}", path);

            byte[] fileBytes = mediaStorageService.loadFile(path);
            ByteArrayResource resource = new ByteArrayResource(fileBytes);

            return ResponseEntity.ok()
                    .contentType(MediaType.valueOf("video/mp4"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"video.mp4\"")
                    .body(resource);
        } catch (Exception e) {
            log.error("Failed to fetch video: {}", path, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get file as base64 (for debugging or admin panel)
     * Example: GET /api/v1/media/base64?path=images/session123/front.jpg
     */
    @GetMapping("/base64")
    public ResponseEntity<String> getFileAsBase64(@RequestParam String path) {
        try {
            log.info("Fetching file as base64: {}", path);
            String base64 = mediaStorageService.loadFileAsBase64(path);
            return ResponseEntity.ok(base64);
        } catch (Exception e) {
            log.error("Failed to fetch file as base64: {}", path, e);
            return ResponseEntity.notFound().build();
        }
    }
}

