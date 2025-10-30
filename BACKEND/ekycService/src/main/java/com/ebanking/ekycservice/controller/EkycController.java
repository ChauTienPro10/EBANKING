package com.ebanking.ekycservice.controller;

import com.ebanking.ekycservice.dto.request.LivenessRequest;
import com.ebanking.ekycservice.dto.request.OrcRequest;
import com.ebanking.ekycservice.dto.response.*;
import com.ebanking.ekycservice.service.EkycService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/ocr")
    public ResponseEntity<ApiResponse<OrcResponse>> processOcr(
            @RequestBody OrcRequest request) {

        log.info("Processing OCR for session: {}", request.getSessionId());
        OrcResponse result = ekycService.processOcr(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/liveness")
    public ResponseEntity<ApiResponse<LivenessResponse>> checkLiveness(
            @RequestBody LivenessRequest request) {

        log.info("Checking liveness for session: {}", request.getSessionId());
        LivenessResponse result = ekycService.processLiveness(request);
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
