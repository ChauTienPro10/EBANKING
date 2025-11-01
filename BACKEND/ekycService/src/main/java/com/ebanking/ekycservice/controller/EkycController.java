package com.ebanking.ekycservice.controller;

import com.ebanking.ekycservice.dto.response.*;
import com.ebanking.ekycservice.service.EkycService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ekyc")
@RequiredArgsConstructor
@Slf4j
public class EkycController {

    private final EkycService ekycService;

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(
            @RequestParam(defaultValue = "1") Long userId) {

        log.info("Creating session for user: {}", userId);
        SessionResponse session = ekycService.createSession(userId);
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSession(
            @PathVariable String sessionId) {

        log.info("Getting session: {}", sessionId);
        SessionResponse session = ekycService.getSession(sessionId);
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    @PostMapping(value = "/ocr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<OrcResponse>> processOcr(
            @RequestParam("sessionId") String sessionId,
            @RequestParam("frontImage") MultipartFile frontImage,
            @RequestParam("backImage") MultipartFile backImage) {

        log.info("Processing OCR for session: {} with image files", sessionId);
        OrcResponse result = ekycService.processOcr(sessionId, frontImage, backImage);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping(value = "/liveness", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LivenessResponse>> checkLiveness(
            @RequestParam("sessionId") String sessionId,
            @RequestParam("video") MultipartFile video) {

        log.info("Checking liveness for session: {} with video file", sessionId);
        LivenessResponse result = ekycService.processLiveness(sessionId, video);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/face-match")
    public ResponseEntity<ApiResponse<FaceMatchResponse>> matchFaces(
            @RequestParam String sessionId) {

        log.info("Matching faces for session: {}", sessionId);
        FaceMatchResponse result = ekycService.processFaceMatch(sessionId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
