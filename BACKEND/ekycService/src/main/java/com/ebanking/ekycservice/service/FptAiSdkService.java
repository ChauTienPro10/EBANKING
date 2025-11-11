package com.ebanking.ekycservice.service;

import com.ebanking.ekycservice.config.FptAiConfig;
import com.ebanking.ekycservice.constant.EkycStatus;
import com.ebanking.ekycservice.constant.EkycStep;
import com.ebanking.ekycservice.dto.request.FptAiWebhookRequest;
import com.ebanking.ekycservice.dto.response.FptAiSdkConfigResponse;
import com.ebanking.ekycservice.entity.BiometricData;
import com.ebanking.ekycservice.entity.DocumentInfo;
import com.ebanking.ekycservice.entity.EkycSession;
import com.ebanking.ekycservice.exception.EkycException;
import com.ebanking.ekycservice.repository.BiometricDataRepository;
import com.ebanking.ekycservice.repository.DocumentInfoRepository;
import com.ebanking.ekycservice.repository.EkycSessionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service xử lý tích hợp FPT AI eKYC Web SDK
 * Tham khảo: https://docs-vision.fpt.ai/ekyc/
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FptAiSdkService {

    private final EkycSessionRepository sessionRepository;
    private final DocumentInfoRepository documentInfoRepository;
    private final BiometricDataRepository biometricDataRepository;
    private final FptAiConfig fptAiConfig;
    private final MediaStorageService mediaStorageService;

    @Value("${app.base-url:http://localhost:8081}")
    private String baseUrl;

    /**
     * Khởi tạo config cho FPT AI SDK
     */
    @Transactional
    public FptAiSdkConfigResponse initializeSdkConfig(String sessionId, String language) {
        log.info("Initializing SDK config for session: {}", sessionId);

        // Validate session
        EkycSession session = validateSession(sessionId);

        // Generate session token cho security
        String sessionToken = UUID.randomUUID().toString();
        session.setSessionToken(sessionToken);
        sessionRepository.save(session);

        // Tạo callback URL
        String callbackUrl = baseUrl + "/api/ekyc/sdk/webhook";

        // Build config response
        return FptAiSdkConfigResponse.builder()
                .sessionId(sessionId)
                .apiKey(fptAiConfig.getApiKey())
                .baseUrl("https://api.fpt.ai")
                .callbackUrl(callbackUrl)
                .sessionToken(sessionToken)
                .steps(FptAiSdkConfigResponse.SdkStepsConfig.builder()
                        .ocrEnabled(true)
                        .livenessEnabled(true)
                        .faceMatchEnabled(true)
                        .build())
                .build();
    }

    /**
     * Validate session token
     */
    public void validateSessionToken(String sessionId, String sessionToken) {
        EkycSession session = validateSession(sessionId);

        if (session.getSessionToken() == null || !session.getSessionToken().equals(sessionToken)) {
            throw new EkycException("Invalid session token");
        }
    }

    /**
     * Xử lý webhook từ FPT AI SDK
     */
    @Transactional
    public void handleWebhook(FptAiWebhookRequest request) {
        log.info("Processing webhook: sessionId={}, type={}, status={}",
                request.getSessionId(), request.getType(), request.getStatus());

        // Validate session
        EkycSession session = validateSession(request.getSessionId());

        // Kiểm tra status
        if (!"SUCCESS".equalsIgnoreCase(request.getStatus())) {
            log.error("Webhook failed: sessionId={}, error={}", request.getSessionId(), request.getErrorMessage());
            session.setStatus(EkycStatus.FAILED);
            sessionRepository.save(session);
            throw new EkycException("FPT AI SDK returned error: " + request.getErrorMessage());
        }

        // Xử lý dựa trên type
        switch (request.getType().toUpperCase()) {
            case "OCR":
                handleOcrWebhook(session, request.getData());
                break;
            case "LIVENESS":
                handleLivenessWebhook(session, request.getData());
                break;
            case "FACE_MATCH":
                handleFaceMatchWebhook(session, request.getData());
                break;
            default:
                log.warn("Unknown webhook type: {}", request.getType());
        }
    }

    /**
     * Xử lý kết quả OCR từ webhook
     */
    @SuppressWarnings("unchecked")
    private void handleOcrWebhook(EkycSession session, Map<String, Object> data) {
        log.info("Processing OCR webhook for session: {}", session.getId());

        try {
            // Parse dữ liệu từ FPT AI
            // Cấu trúc data có thể là: { "front": {...}, "back": {...} }
            Map<String, Object> frontData = (Map<String, Object>) data.get("front");
            Map<String, Object> backData = (Map<String, Object>) data.get("back");

            if (frontData == null) {
                throw new EkycException("Front image data is missing");
            }

            // Extract thông tin từ front
            String idNumber = getStringValue(frontData, "id");
            String fullName = getStringValue(frontData, "name");
            String dobStr = getStringValue(frontData, "dob");
            String gender = getStringValue(frontData, "sex");
            String address = getStringValue(frontData, "address");
            String doeStr = getStringValue(frontData, "doe");

            // Extract từ back nếu có
            String issueDateStr = backData != null ? getStringValue(backData, "issue_date") : "";

            // Parse dates
            LocalDate dateOfBirth = parseDate(dobStr);
            LocalDate issueDate = parseDate(issueDateStr);
            LocalDate expiryDate = parseDate(doeStr);

            // Lấy ảnh base64 từ data (nếu FPT AI trả về)
            String frontImageBase64 = getStringValue(data, "front_image");
            String backImageBase64 = getStringValue(data, "back_image");
            String portraitImageBase64 = getStringValue(data, "portrait_image");

            // Lưu ảnh vào file system
            String sessionIdStr = session.getId().toString();
            String frontImagePath = frontImageBase64 != null ?
                    mediaStorageService.saveImage(frontImageBase64, sessionIdStr, "front") : null;
            String backImagePath = backImageBase64 != null ?
                    mediaStorageService.saveImage(backImageBase64, sessionIdStr, "back") : null;
            String portraitImagePath = portraitImageBase64 != null ?
                    mediaStorageService.saveImage(portraitImageBase64, sessionIdStr, "portrait") : null;

            // Lưu vào database
            DocumentInfo documentInfo = DocumentInfo.builder()
                    .session(session)
                    .idNumber(idNumber)
                    .fullName(fullName)
                    .dateOfBirth(dateOfBirth)
                    .gender(gender)
                    .address(address)
                    .issueDate(issueDate)
                    .expiryDate(expiryDate)
                    .frontImagePath(frontImagePath)
                    .backImagePath(backImagePath)
                    .portraitImagePath(portraitImagePath)
                    .build();

            documentInfoRepository.save(documentInfo);

            // Update session
            session.setStatus(EkycStatus.OCR_COMPLETED);
            session.setCurrentStep(EkycStep.VERIFICATION);
            sessionRepository.save(session);

            log.info("OCR webhook processed successfully for session: {}", session.getId());

        } catch (Exception e) {
            log.error("Failed to process OCR webhook: {}", e.getMessage(), e);
            throw new EkycException("Failed to process OCR data: " + e.getMessage());
        }
    }

    /**
     * Xử lý kết quả Liveness từ webhook
     */
    @SuppressWarnings("unchecked")
    private void handleLivenessWebhook(EkycSession session, Map<String, Object> data) {
        log.info("Processing Liveness webhook for session: {}", session.getId());

        try {
            // Parse dữ liệu từ FPT AI
            Boolean isLive = (Boolean) data.get("is_live");
            Double confidence = parseDoubleValue(data.get("confidence"));
            String faceImageBase64 = getStringValue(data, "face_image");

            if (isLive == null) {
                throw new EkycException("Liveness result is missing");
            }

            // Lưu ảnh khuôn mặt từ video
            String sessionIdStr = session.getId().toString();
            String faceImagePath = faceImageBase64 != null ?
                    mediaStorageService.saveImage(faceImageBase64, sessionIdStr, "face") : null;

            // Lưu video nếu có
            String videoBase64 = getStringValue(data, "video");
            String videoPath = videoBase64 != null ?
                    mediaStorageService.saveVideo(videoBase64, sessionIdStr) : null;

            // Lưu vào database
            BiometricData biometricData = BiometricData.builder()
                    .session(session)
                    .isLive(isLive)
                    .livenessConfidence(confidence)
                    .videoPath(videoPath)
                    .faceImagePath(faceImagePath)
                    .build();

            biometricDataRepository.save(biometricData);

            // Update session
            session.setStatus(EkycStatus.LIVENESS_COMPLETED);
            session.setCurrentStep(EkycStep.FACE_MATCH);
            sessionRepository.save(session);

            log.info("Liveness webhook processed successfully for session: {}", session.getId());

        } catch (Exception e) {
            log.error("Failed to process Liveness webhook: {}", e.getMessage(), e);
            throw new EkycException("Failed to process Liveness data: " + e.getMessage());
        }
    }

    /**
     * Xử lý kết quả Face Match từ webhook
     */
    private void handleFaceMatchWebhook(EkycSession session, Map<String, Object> data) {
        log.info("Processing Face Match webhook for session: {}", session.getId());

        try {
            // Parse dữ liệu từ FPT AI
            Boolean isMatch = (Boolean) data.get("is_match");
            Double similarity = parseDoubleValue(data.get("similarity"));

            if (isMatch == null) {
                throw new EkycException("Face match result is missing");
            }

            // Update BiometricData
            BiometricData biometricData = biometricDataRepository.findBySessionId(session.getId())
                    .orElseThrow(() -> new EkycException("Biometric data not found"));

            biometricData.setFaceMatch(isMatch);
            biometricData.setFaceMatchScore(similarity);
            biometricDataRepository.save(biometricData);

            // Update session - hoàn thành
            session.setStatus(EkycStatus.COMPLETED);
            session.setCurrentStep(EkycStep.COMPLETED);
            sessionRepository.save(session);

            log.info("Face Match webhook processed successfully for session: {}", session.getId());

        } catch (Exception e) {
            log.error("Failed to process Face Match webhook: {}", e.getMessage(), e);
            throw new EkycException("Failed to process Face Match data: " + e.getMessage());
        }
    }

    /**
     * Lấy trạng thái SDK flow
     */
    public String getSdkStatus(String sessionId) {
        // Không check expired vì chỉ là query status
        EkycSession session = sessionRepository.findById(UUID.fromString(sessionId))
                .orElseThrow(() -> new EkycException("Session not found"));

        return session.getStatus().toString();
    }

    // Helper methods
    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private Double parseDoubleValue(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            log.warn("Failed to parse double value: {}", value);
            return null;
        }
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }

        // Thử nhiều format
        List<DateTimeFormatter> formatters = List.of(
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("ddMMyyyy")
        );

        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (DateTimeParseException e) {
                // Continue to next format
            }
        }

        log.warn("Failed to parse date: {}", dateStr);
        return null;
    }

    /**
     * Validate session và kiểm tra hết hạn
     */
    private EkycSession validateSession(String sessionId) {
        EkycSession session = sessionRepository.findById(UUID.fromString(sessionId))
                .orElseThrow(() -> new EkycException("Session not found"));

        if (session.getExpiredAt() != null && session.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new EkycException("Session expired");
        }

        return session;
    }
}

