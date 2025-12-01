package com.ebanking.ekycservice.service;

import com.ebanking.ekycservice.constant.EkycStatus;
import com.ebanking.ekycservice.constant.EkycStep;
import com.ebanking.ekycservice.dto.response.FaceMatchResponse;
import com.ebanking.ekycservice.dto.response.LivenessResponse;
import com.ebanking.ekycservice.dto.response.OrcResponse;
import com.ebanking.ekycservice.dto.response.SessionResponse;
import com.ebanking.ekycservice.entity.BiometricData;
import com.ebanking.ekycservice.entity.DocumentInfo;
import com.ebanking.ekycservice.entity.EkycSession;
import com.ebanking.ekycservice.exception.EkycException;
import com.ebanking.ekycservice.repository.BiometricDataRepository;
import com.ebanking.ekycservice.repository.DocumentInfoRepository;
import com.ebanking.ekycservice.repository.EkycSessionRepository;
import com.ebanking.ekycservice.util.FileUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EkycService {

    private final EkycSessionRepository sessionRepository;
    private final DocumentInfoRepository documentInfoRepository;
    private final BiometricDataRepository biometricDataRepository;
    private final FptAiService fptAiService;
    private final MediaStorageService mediaStorageService;

    // ⚠️ DEMO MODE - Set false to use real FPT AI APIs
    private static final boolean DEMO_MODE = false;

    @Transactional
    public SessionResponse createSession(Long userId) {
        log.info("Creating session for user: {}", userId);

        EkycSession session = EkycSession.builder()
                .userId(userId)
                .status(EkycStatus.INITIATED)
                .currentStep(EkycStep.OCR)
                .expiredAt(LocalDateTime.now().plusMinutes(10))
                .build();

        session = sessionRepository.save(session);

        return SessionResponse.builder()
                .sessionId(session.getId().toString())
                .status(session.getStatus())
                .currentStep(session.getCurrentStep())
                .expiresAt(session.getExpiredAt())
                .build();
    }

    public SessionResponse getSession(String sessionId) {
        log.info("Getting session: {}", sessionId);

        EkycSession session = sessionRepository.findById(UUID.fromString(sessionId))
                .orElseThrow(() -> new EkycException("Session not found"));

        return SessionResponse.builder()
                .sessionId(session.getId().toString())
                .status(session.getStatus())
                .currentStep(session.getCurrentStep())
                .expiresAt(session.getExpiredAt())
                .build();
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public OrcResponse processOcr(String sessionId, MultipartFile frontImage, MultipartFile backImage) {
        log.info("Processing OCR for session: {}", sessionId);

        // Validate image files
        FileUtil.validateImageFile(frontImage);
        FileUtil.validateImageFile(backImage);

        // Convert images to base64
        String frontImageBase64 = FileUtil.convertToBase64(frontImage);
        String backImageBase64 = FileUtil.convertToBase64(backImage);

        // Validate session
        EkycSession session = validateSession(sessionId);

        try {
            // ⚠️ DEMO MODE: Skip FPT API and return mock data
            if (DEMO_MODE) {
                log.warn("🎭 DEMO MODE: Bypassing FPT OCR API - returning mock data");
                return createMockOCRResponse(session, frontImageBase64, backImageBase64);
            }

            // Call FPT.AI OCR for front image
            Map<String, Object> frontResult = fptAiService.callOrcApi(frontImageBase64);
            log.debug("Front OCR result: {}", frontResult);

            // FPT.AI OCR response structure: { "errorCode": 0, "errorMessage": "", "data":
            // [...] }
            Object dataObj = frontResult.get("data");
            if (dataObj == null) {
                throw new EkycException("FPT.AI returned null data for front image");
            }

            // Data is an array, get the first element
            java.util.List<Map<String, Object>> frontDataList = (java.util.List<Map<String, Object>>) dataObj;
            if (frontDataList.isEmpty()) {
                throw new EkycException("FPT.AI returned empty data for front image");
            }
            Map<String, Object> frontData = frontDataList.get(0);

            // Call FPT.AI OCR for back image
            Map<String, Object> backResult = fptAiService.callOrcApi(backImageBase64);
            log.debug("Back OCR result: {}", backResult);

            Object backDataObj = backResult.get("data");
            Map<String, Object> backData = null;
            if (backDataObj != null) {
                java.util.List<Map<String, Object>> backDataList = (java.util.List<Map<String, Object>>) backDataObj;
                if (!backDataList.isEmpty()) {
                    backData = backDataList.get(0);
                }
            }

            // Extract data from FRONT (chip_front contains all main info)
            String idNumber = getStringValue(frontData, "id");
            String fullName = getStringValue(frontData, "name");
            String dobStr = getStringValue(frontData, "dob");
            String gender = getStringValue(frontData, "sex");
            String address = getStringValue(frontData, "address");
            String doeStr = getStringValue(frontData, "doe");

            // Get confidence score from front data
            String overallScoreStr = getStringValue(frontData, "overall_score");
            Double confidence = parseDoubleValue(overallScoreStr);

            // Extract data from BACK (chip_back has issue_date, features, mrz)
            String issueDateStr = backData != null ? getStringValue(backData, "issue_date") : "";

            log.info(
                    "Extracted data: idNumber={}, fullName={}, dob={}, gender={}, address={}, issueDate={}, confidence={}",
                    idNumber, fullName, dobStr, gender, address, issueDateStr, confidence);

            // Parse dates
            LocalDate dateOfBirth = parseDateOfBirth(dobStr);
            LocalDate issueDate = parseDateOfBirth(issueDateStr);
            LocalDate expiryDate = parseDateOfBirth(doeStr);

            // Save images to file system
            String sessionIdStr = session.getId().toString();
            String frontImagePath = mediaStorageService.saveImage(frontImageBase64, sessionIdStr, "front");
            String backImagePath = mediaStorageService.saveImage(backImageBase64, sessionIdStr, "back");

            // Note: FPT.AI OCR API does not return portrait/avatar image anymore
            // Portrait image will be null for OCR response
            // Face matching will use the front CCCD image or extract from liveness video

            // Save document info with file paths
            DocumentInfo documentInfo = DocumentInfo.builder()
                    .session(session)
                    .idNumber(idNumber)
                    .fullName(fullName)
                    .dateOfBirth(dateOfBirth)
                    .gender(gender)
                    .address(address)
                    .issueDate(issueDate)
                    .expiryDate(expiryDate)
                    .frontImagePath(frontImagePath) // Lưu path thay vì base64
                    .backImagePath(backImagePath) // Lưu path thay vì base64
                    .portraitImagePath(null) // FPT.AI không trả về avatar nữa
                    .build();

            documentInfoRepository.save(documentInfo);

            // Update session
            session.setStatus(EkycStatus.OCR_COMPLETED);
            session.setCurrentStep(EkycStep.VERIFICATION);
            sessionRepository.save(session);

            return OrcResponse.builder()
                    .sessionId(session.getId().toString())
                    .idNumber(idNumber)
                    .fullName(fullName)
                    .dateOfBirth(dateOfBirth)
                    .gender(gender)
                    .address(address)
                    .issueDate(issueDate)
                    .expiryDate(expiryDate)
                    .confidence(confidence) // OCR confidence từ overall_score
                    .portraitImagePath(null) // FPT.AI không trả về avatar
                    .frontImagePath(frontImagePath)
                    .backImagePath(backImagePath)
                    .build();
        } catch (EkycException e) {
            throw e;
        } catch (Exception e) {
            log.error("OCR processing failed: {}", e.getMessage(), e);
            throw new EkycException("OCR processing failed: " + e.getMessage());
        }
    }

    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : "";
    }

    private Double parseDoubleValue(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            log.warn("Failed to parse double value: {}", value);
            return null;
        }
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public LivenessResponse processLiveness(String sessionId, MultipartFile video) {
        log.info("Processing liveness for session: {}", sessionId);

        // Validate video file
        FileUtil.validateVideoFile(video);

        // Convert video to base64
        String videoBase64 = FileUtil.convertToBase64(video);

        // Validate session
        EkycSession session = validateSession(sessionId);

        try {
            // ⚠️ DEMO MODE: Skip FPT API and return mock data
            if (DEMO_MODE) {
                log.warn("🎭 DEMO MODE: Bypassing FPT Liveness API - returning mock data");
                return createMockLivenessResponse(session, videoBase64);
            }

            // Call FPT.AI Liveness
            Map<String, Object> result = fptAiService.callLivenessApi(videoBase64);
            log.debug("Liveness result: {}", result);

            // FPT.AI Liveness response: { "liveness": { "is_live": "True", "spoof_prob":
            // "0.01" } }
            Object livenessObj = result.get("liveness");
            if (livenessObj == null) {
                throw new EkycException("FPT.AI returned null liveness data");
            }

            Map<String, Object> liveness = (Map<String, Object>) livenessObj;

            // Get FPT response code to check for spoof detection
            String livenessCode = liveness.get("code") != null ? liveness.get("code").toString() : "200";
            String livenessMessage = liveness.get("message") != null ? liveness.get("message").toString() : "";

            // Parse is_live (can be "True"/"False" string or boolean)
            Object isLiveObj = liveness.get("is_live");
            Boolean isLive = false;
            if (isLiveObj != null && !isLiveObj.equals("N/A")) {
                if (isLiveObj instanceof Boolean) {
                    isLive = (Boolean) isLiveObj;
                } else {
                    isLive = "True".equalsIgnoreCase(isLiveObj.toString());
                }
            }

            // Parse spoof_prob as confidence (1 - spoof_prob)
            Object spoofProbObj = liveness.get("spoof_prob");
            Double score = 0.0;
            if (spoofProbObj != null && !spoofProbObj.equals("N/A")) {
                try {
                    double spoofProb = Double.parseDouble(spoofProbObj.toString());
                    score = 1.0 - spoofProb; // Convert to confidence score
                } catch (NumberFormatException e) {
                    log.warn("Failed to parse spoof_prob: {}", spoofProbObj);
                }
            }

            // ⚠️ PRODUCTION-READY: Log detailed liveness result for monitoring
            log.info("📊 Liveness API Response: code={}, message={}", livenessCode, livenessMessage);
            log.info("✅ Liveness check result: isLive={}, confidence={}", isLive, score);

            // Validate liveness result - Accept only if FPT confirms real face
            if ("301".equals(livenessCode)) {
                // Face is spoof - reject with clear message
                throw new EkycException("Phát hiện khuôn mặt giả mạo. Vui lòng sử dụng khuôn mặt thật và thử lại.");
            }

            if ("406".equals(livenessCode) || "406".equals(livenessMessage)) {
                // Face quality not good enough
                throw new EkycException(
                        "Chất lượng khuôn mặt không đủ tốt. Vui lòng di chuyển đến nơi có ánh sáng tốt hơn và thử lại.");
            }

            if (!isLive) {
                // General liveness check failed
                throw new EkycException("Xác thực khuôn mặt thất bại. Vui lòng đảm bảo đủ ánh sáng và thử lại.");
            }

            // Save video to file system
            String sessionIdStr = session.getId().toString();
            String videoPath = mediaStorageService.saveVideo(videoBase64, sessionIdStr);

            // Save biometric data with file path
            BiometricData biometricData = BiometricData.builder()
                    .session(session)
                    .videoPath(videoPath)
                    .livenessConfidence(score)
                    .isLive(isLive)
                    .build();

            biometricDataRepository.save(biometricData);

            // Update session
            session.setStatus(EkycStatus.LIVENESS_COMPLETED);
            session.setCurrentStep(EkycStep.FACE_MATCH);
            sessionRepository.save(session);

            return LivenessResponse.builder()
                    .isLive(isLive)
                    .confidence(score)
                    .build();
        } catch (EkycException e) {
            throw e;
        } catch (Exception e) {
            log.error("Liveness processing failed: {}", e.getMessage(), e);
            throw new EkycException("Liveness processing failed: " + e.getMessage());
        }
    }

    private Boolean getBooleanValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null)
            return false;
        if (value instanceof Boolean)
            return (Boolean) value;
        return Boolean.parseBoolean(value.toString());
    }

    private Double getDoubleValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null)
            return 0.0;
        if (value instanceof Number)
            return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            log.warn("Failed to parse double value for key {}: {}", key, value);
            return 0.0;
        }
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public FaceMatchResponse processFaceMatch(String sessionId) {
        log.info("Processing face match for session: {}", sessionId);

        // Validate and get session with relations
        EkycSession session = validateSession(sessionId);

        // DEMO MODE: Skip real FPT API call
        if (DEMO_MODE) {
            log.warn("🎭 DEMO MODE: Bypassing FPT Face Match API");
            return createMockFaceMatchResponse(session);
        }

        DocumentInfo docInfo = session.getDocumentInfo();
        BiometricData bioData = session.getBiometricData();

        if (docInfo == null || bioData == null) {
            throw new EkycException("Missing required data for face matching");
        }

        try {
            // Load images from file system and convert to base64 for FPT AI
            // Since FPT.AI OCR doesn't return portrait/avatar anymore, we use front CCCD
            // image
            // The front CCCD image contains the person's face photo
            String idCardImageBase64 = mediaStorageService.loadFileAsBase64(docInfo.getFrontImagePath());

            // TODO: Extract a clear face frame from liveness video for better accuracy
            // For now, using front CCCD image as both ID card photo and selfie
            // In production, you should extract the best frame from liveness video
            String selfieImageBase64 = idCardImageBase64; // Temporary: use same image

            log.warn("Face match using front CCCD image for both ID card and selfie. " +
                    "Consider extracting frame from liveness video for better accuracy.");

            // Call FPT.AI Face Match
            Map<String, Object> result = fptAiService.callFaceMatchApi(idCardImageBase64, selfieImageBase64);
            log.info("Face match result: {}", result);

            // Parse response - FPT Face Match returns: {"code": "200", "data": {"match":
            // true/false, "similarity": 0.95}}
            Object dataObj = result.get("data");

            if (dataObj == null) {
                throw new EkycException("FPT.AI returned null data for face match");
            }

            if (!(dataObj instanceof Map)) {
                throw new EkycException(
                        "Invalid face match response format. Expected Map but got: " + dataObj.getClass());
            }

            Map<String, Object> data = (Map<String, Object>) dataObj;

            // Get similarity from response
            Double similarity = getDoubleValue(data, "similarity");
            Boolean isMatched = similarity >= 0.85;
            log.info("Face match result: similarity={}, isMatched={}", similarity, isMatched);

            // Update biometric data
            bioData.setFaceMatch(isMatched);
            bioData.setFaceMatchScore(similarity);
            biometricDataRepository.save(bioData);

            // Update session
            if (isMatched) {
                session.setStatus(EkycStatus.COMPLETED);
                // Keep currentStep at FACE_MATCH - DB constraint doesn't allow COMPLETED
            } else {
                session.setStatus(EkycStatus.FAILED);
                session.setCurrentStep(EkycStep.FACE_MATCH);
            }
            sessionRepository.save(session);

            return FaceMatchResponse.builder()
                    .isMatched(isMatched)
                    .confidence(similarity)
                    .build();
        } catch (EkycException e) {
            throw e;
        } catch (Exception e) {
            log.error("Face match processing failed: {}", e.getMessage(), e);
            throw new EkycException("Face match processing failed: " + e.getMessage());
        }
    }

    private LocalDate parseDateOfBirth(String dobStr) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            return LocalDate.parse(dobStr, formatter);
        } catch (Exception e) {
            log.warn("Failed to parse date: {}", dobStr);
            return null;
        }
    }

    /**
     * Validate session và kiểm tra hết hạn
     */
    private EkycSession validateSession(String sessionId) {
        EkycSession session = sessionRepository.findById(UUID.fromString(sessionId))
                .orElseThrow(() -> new EkycException("Session not found"));

        if (session.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new EkycException("Session expired");
        }

        return session;
    }

    // ========== DEMO MODE MOCK METHODS ==========

    private OrcResponse createMockOCRResponse(EkycSession session, String frontImageBase64, String backImageBase64) {
        // Save mock images
        String sessionIdStr = session.getId().toString();
        String frontPath = mediaStorageService.saveImage(frontImageBase64, sessionIdStr, "front");
        String backPath = mediaStorageService.saveImage(backImageBase64, sessionIdStr, "back");

        // Create mock document info (without confidence field)
        DocumentInfo documentInfo = DocumentInfo.builder()
                .session(session)
                .idNumber("001234567890")
                .fullName("NGUYỄN VĂN A")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender("Nam")
                .address("123 Đường ABC, Quận 1, TP.HCM")
                .issueDate(LocalDate.of(2020, 1, 1))
                .expiryDate(LocalDate.of(2030, 1, 1))
                .frontImagePath(frontPath)
                .backImagePath(backPath)
                .build();

        documentInfoRepository.save(documentInfo);
        session.setStatus(EkycStatus.OCR_COMPLETED);
        session.setCurrentStep(EkycStep.VERIFICATION);
        sessionRepository.save(session);

        return OrcResponse.builder()
                .idNumber("001234567890")
                .fullName("NGUYỄN VĂN A")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender("Nam")
                .address("123 Đường ABC, Quận 1, TP.HCM")
                .issueDate(LocalDate.of(2020, 1, 1))
                .expiryDate(LocalDate.of(2030, 1, 1))
                .confidence(0.95)
                .build();
    }

    private LivenessResponse createMockLivenessResponse(EkycSession session, String videoBase64) {
        // Save mock video
        String sessionIdStr = session.getId().toString();
        String videoPath = mediaStorageService.saveVideo(videoBase64, sessionIdStr);

        // Create mock biometric data
        BiometricData biometricData = BiometricData.builder()
                .session(session)
                .videoPath(videoPath)
                .livenessConfidence(0.92)
                .isLive(true)
                .build();

        biometricDataRepository.save(biometricData);
        session.setStatus(EkycStatus.LIVENESS_COMPLETED);
        session.setCurrentStep(EkycStep.FACE_MATCH);
        sessionRepository.save(session);

        return LivenessResponse.builder()
                .isLive(true)
                .confidence(0.92)
                .build();
    }

    private FaceMatchResponse createMockFaceMatchResponse(EkycSession session) {
        // Mock face match with high similarity
        Double mockSimilarity = 0.92;
        Boolean isMatched = true;

        BiometricData bioData = session.getBiometricData();
        if (bioData != null) {
            bioData.setFaceMatch(isMatched);
            bioData.setFaceMatchScore(mockSimilarity);
            biometricDataRepository.save(bioData);
        }

        // Update session to completed (keep currentStep at FACE_MATCH to avoid DB
        // constraint)
        session.setStatus(EkycStatus.COMPLETED);
        // Don't set currentStep to COMPLETED - DB constraint doesn't allow it
        sessionRepository.save(session);

        return FaceMatchResponse.builder()
                .isMatched(isMatched)
                .confidence(mockSimilarity)
                .build();
    }
}
