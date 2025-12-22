package com.ebanking.ekycservice.service;

import com.ebanking.ekycservice.client.UserServiceClient;
import com.ebanking.ekycservice.constant.EkycStatus;
import com.ebanking.ekycservice.constant.EkycStep;
import com.ebanking.ekycservice.dto.response.*;
import com.ebanking.ekycservice.entity.BiometricData;
import com.ebanking.ekycservice.entity.DocumentInfo;
import com.ebanking.ekycservice.entity.EkycSession;
import com.ebanking.ekycservice.entity.FaceAuthVerification;
import com.ebanking.ekycservice.exception.EkycException;
import com.ebanking.ekycservice.repository.BiometricDataRepository;
import com.ebanking.ekycservice.repository.DocumentInfoRepository;
import com.ebanking.ekycservice.repository.EkycSessionRepository;
import com.ebanking.ekycservice.repository.FaceAuthVerificationRepository;
import com.ebanking.ekycservice.util.FileUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class EkycService {

    private final EkycSessionRepository sessionRepository;
    private final DocumentInfoRepository documentInfoRepository;
    private final BiometricDataRepository biometricDataRepository;
    private final FaceAuthVerificationRepository faceAuthVerificationRepository;
    private final FptAiService fptAiService;
    private final MediaStorageService mediaStorageService;
    private final VideoFrameExtractorHumble videoFrameExtractor;
    private final UserServiceClient userServiceClient;
    private final RedisTemplate<String, String> redisTemplateForString;

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
                    .confidence(confidence) 
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

            log.info("Liveness: isLive={}, confidence={}", isLive, score);

            // Validate liveness result
            if ("301".equals(livenessCode)) {
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

            // Extract face image from liveness video and save
            String faceImagePath = null;
            try {
                // Convert relative path to absolute path for video extraction
                String absoluteVideoPath = "uploads/" + videoPath;
                log.info("::: Extracting face frame from liveness video: {}", absoluteVideoPath);
                
                String faceImageBase64 = videoFrameExtractor.extractFrameAsBase64(absoluteVideoPath);
                faceImagePath = mediaStorageService.saveImage(faceImageBase64, sessionIdStr, "face");
                
                log.info("::: Face image extracted and saved: {}", faceImagePath);
            } catch (Exception e) {
                log.error("⚠️ Failed to extract face image from video: {}", e.getMessage());
                // Don't fail the entire liveness process - face match can still extract on-demand
                // This is Phase 1 safety: extraction failure doesn't break existing flow
                log.warn("Continuing without pre-extracted face image. Face match will extract on-demand.");
            }

            // Save biometric data with file path
            BiometricData biometricData = BiometricData.builder()
                    .session(session)
                    .videoPath(videoPath)
                    .faceImagePath(faceImagePath)
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

        DocumentInfo docInfo = session.getDocumentInfo();
        BiometricData bioData = session.getBiometricData();

        if (docInfo == null || bioData == null) {
            throw new EkycException("Missing required data for face matching");
        }

        try {
            // Load ID card image from front CCCD
            String idCardImageBase64 = mediaStorageService.loadFileAsBase64(docInfo.getFrontImagePath());

            // Use pre-extracted face image (with fallback)
            String selfieImageBase64;
            String faceImagePath = bioData.getFaceImagePath();
            
            if (faceImagePath != null && !faceImagePath.isEmpty()) {
                // Use pre-extracted face image (fast path)
                log.info("⚡ Loading pre-extracted face image: {}", faceImagePath);
                try {
                    selfieImageBase64 = mediaStorageService.loadFileAsBase64(faceImagePath);
                    log.info("✅ Using pre-extracted face image for face match");
                } catch (Exception e) {
                    // Fallback: extract from video if pre-extracted image is missing/corrupted
                    log.warn("⚠️ Failed to load pre-extracted face image: {}", e.getMessage());
                    log.info("🔄 Falling back to on-demand extraction from video");
                    selfieImageBase64 = extractFaceFromVideo(bioData.getVideoPath());
                }
            } else {
                // Fallback: extract from video for old sessions (backward compatibility)
                log.info("🔄 No pre-extracted face image found. Extracting from video (old session)");
                selfieImageBase64 = extractFaceFromVideo(bioData.getVideoPath());
            }

            log.info("Face match: comparing ID card face with selfie");

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
            log.info("Face match: similarity={}, matched={}", similarity, isMatched);

            // Update biometric data
            bioData.setFaceMatch(isMatched);
            bioData.setFaceMatchScore(similarity);
            biometricDataRepository.save(bioData);

            // Validate citizenId before completing eKYC
            if (isMatched) {
                String citizenId = docInfo.getIdNumber();
                Long userId = session.getUserId();
                
                log.info("Validating citizenId before completing eKYC: citizenId={}, userId={}", citizenId, userId);
                
                // Check if citizenId belongs to another user
                boolean isDuplicate = userServiceClient.checkCitizenIdDuplicate(citizenId, userId);
                
                if (isDuplicate) {
                    log.error("CitizenId {} already belongs to another user. Rejecting eKYC for user {}", citizenId, userId);
                    
                    // Mark as failed due to duplicate citizenId
                    session.setStatus(EkycStatus.FAILED);
                    session.setCurrentStep(EkycStep.FACE_MATCH);
                    sessionRepository.save(session);
                    
                    // Throw exception with user-friendly message
                    throw new EkycException("Số căn cước công dân này đã được sử dụng bởi tài khoản khác. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.");
                }
                
                log.info("CitizenId validation passed. Proceeding with eKYC completion.");
            }

            // Update session
            if (isMatched) {
                session.setStatus(EkycStatus.COMPLETED);
            } else {
                session.setStatus(EkycStatus.FAILED);
                session.setCurrentStep(EkycStep.FACE_MATCH);
            }
            sessionRepository.save(session);

            // Notify UserService if successful
            if (isMatched) {
                try {
                    userServiceClient.notifyEkycVerified(
                            session.getUserId(),
                            session.getId(),
                            session.getDocumentInfo());
                } catch (Exception e) {
                    log.error("Failed to notify UserService: {}", e.getMessage());
                }
            }

            return FaceMatchResponse.builder()
                    .isMatched(isMatched)
                    .similarity(similarity) // Use similarity to match FPT.AI API
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
     * Helper method to extract face from liveness video
     * Used as fallback when pre-extracted face image is not available
     */
    private String extractFaceFromVideo(String videoPath) {
        if (videoPath == null || videoPath.isEmpty()) {
            throw new EkycException("Liveness video not found for face matching");
        }

        // Convert relative path to absolute path
        String absoluteVideoPath = "uploads/" + videoPath;
        
        log.info("📹 Extracting face frame from video: {}", absoluteVideoPath);
        String faceImageBase64 = videoFrameExtractor.extractFrameAsBase64(absoluteVideoPath);
        log.info("✅ Face extracted from video");
        
        return faceImageBase64;
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

    /**
     * Get full eKYC session details
     * Used by mobile app and UserService to display eKYC information
     */
    public EkycDetailResponse getSessionDetails(String sessionId) {
        EkycSession session = sessionRepository.findById(UUID.fromString(sessionId))
                .orElseThrow(() -> new EkycException("Session not found"));

        DocumentInfo doc = session.getDocumentInfo();
        BiometricData bio = session.getBiometricData();

        if (doc == null) {
            throw new EkycException("Document info not found for session");
        }

        // Load images as base64 strings instead of URLs
        // This avoids API Gateway routing issues and simplifies frontend
        String frontImageBase64 = null;
        String backImageBase64 = null;

        try {
            if (doc.getFrontImagePath() != null) {
                frontImageBase64 = "data:image/jpeg;base64," + mediaStorageService.loadFileAsBase64(doc.getFrontImagePath());
            }
            if (doc.getBackImagePath() != null) {
                backImageBase64 = "data:image/jpeg;base64," + mediaStorageService.loadFileAsBase64(doc.getBackImagePath());
            }
        } catch (Exception e) {
            log.error("Failed to load images for session {}: {}", sessionId, e.getMessage());
            // Continue without images rather than failing completely
        }

        return EkycDetailResponse.builder()
                .sessionId(session.getId().toString())
                .status(session.getStatus().toString())
                .verifiedAt(session.getUpdatedAt() != null ? 
                    java.sql.Timestamp.valueOf(session.getUpdatedAt()).getTime() : null)
                // OCR data
                .idNumber(doc.getIdNumber())
                .fullName(doc.getFullName())
                .dateOfBirth(doc.getDateOfBirth())
                .gender(doc.getGender())
                .address(doc.getAddress())
                .issueDate(doc.getIssueDate())
                .expiryDate(doc.getExpiryDate())
                // Images as base64 (data URIs)
                .frontImageUrl(frontImageBase64)
                .backImageUrl(backImageBase64)
                // Scores
                .ocrConfidence(null) // Can add if needed
                .livenessConfidence(bio != null ? bio.getLivenessConfidence() : null)
                .faceMatchScore(bio != null ? bio.getFaceMatchScore() : null)
                .isLive(bio != null ? bio.getIsLive() : null)
                .faceMatched(bio != null ? bio.getFaceMatch() : null)
                .build();
    }

    /**
     * Verify face authentication for transaction
     * Reuses liveness video from completed eKYC session for matching
     *
     * @param userId User ID who completed eKYC
     * @param video New liveness video for verification
     * @return FaceAuthVerifyResponse with verification result
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public FaceAuthVerifyResponse verifyTransactionFaceAuth(Long userId, String sessionId, MultipartFile video) {
        log.info("Verifying transaction face auth for user: {}, sessionId: {}", userId, sessionId);

        // Find user's completed eKYC session
        EkycSession ekycSession = sessionRepository.findByUserIdAndStatus(
                userId, EkycStatus.COMPLETED
        ).orElseThrow(() -> new EkycException("User has not completed eKYC"));

        BiometricData ekycBio = ekycSession.getBiometricData();
        if (ekycBio == null || ekycBio.getFaceImagePath() == null) {
            throw new EkycException("No face data found from eKYC");
        }

        // Validate and convert video
        FileUtil.validateVideoFile(video);
        String videoBase64 = FileUtil.convertToBase64(video);

        try {
            // Liveness check
            Map<String, Object> livenessResult = fptAiService.callLivenessApi(videoBase64);
            log.info("Liveness result: {}", livenessResult);

            // FPT.AI returns: {"liveness": {"is_live": "true", "spoof_prob": "0.3593", ...}}
            Map<String, Object> livenessData = (Map<String, Object>) livenessResult.get("liveness");
            if (livenessData == null) {
                throw new EkycException("Invalid liveness response");
            }

            // Parse is_live (can be "true"/"false" string or boolean)
            Object isLiveObj = livenessData.get("is_live");
            Boolean isLive = false;
            if (isLiveObj != null && !isLiveObj.equals("N/A")) {
                if (isLiveObj instanceof Boolean) {
                    isLive = (Boolean) isLiveObj;
                } else {
                    isLive = "true".equalsIgnoreCase(isLiveObj.toString());
                }
            }

            // Parse spoof_prob as confidence (1 - spoof_prob)
            Object spoofProbObj = livenessData.get("spoof_prob");
            Double score = 0.0;
            if (spoofProbObj != null && !spoofProbObj.equals("N/A")) {
                try {
                    double spoofProb = Double.parseDouble(spoofProbObj.toString());
                    score = 1.0 - spoofProb; // Convert to confidence score
                } catch (NumberFormatException e) {
                    log.warn("Failed to parse spoof_prob: {}", spoofProbObj);
                }
            }

            log.info("Liveness check: isLive={}, confidence={}", isLive, score);

            if (!isLive || score < 0.60) {
                return FaceAuthVerifyResponse.builder()
                        .verified(false)
                        .message("Liveness check failed")
                        .build();
            }

            // Save video and extract face
            String videoPath = mediaStorageService.saveVideo(videoBase64, sessionId);
            String absoluteVideoPath = "uploads/" + videoPath;
            String newFaceBase64 = videoFrameExtractor.extractFrameAsBase64(absoluteVideoPath);

            // Load eKYC face image
            String ekycFaceBase64 = mediaStorageService.loadFileAsBase64(ekycBio.getFaceImagePath());

            // Face matching
            Map<String, Object> matchResult = fptAiService.callFaceMatchApi(
                    ekycFaceBase64, newFaceBase64
            );
            log.info("Face match result: {}", matchResult);

            Map<String, Object> matchData = (Map<String, Object>) matchResult.get("data");
            if (matchData == null) {
                throw new EkycException("Invalid face match response");
            }

            Double similarity = getDoubleValue(matchData, "similarity");
            Boolean isMatched = similarity >= 0.80;

            // Save face auth verification record (separate from eKYC biometric_data)
            FaceAuthVerification verification = FaceAuthVerification.builder()
                    .sessionId(sessionId)
                    .userId(userId)
                    .videoPath(videoPath)
                    .faceImagePath(null) // Can save extracted face if needed
                    .isLive(isLive)
                    .livenessConfidence(score)
                    .faceMatch(isMatched)
                    .faceMatchScore(similarity)
                    .verified(isMatched)
                    .build();
            faceAuthVerificationRepository.save(verification);

            log.info("Face auth verification completed: matched={}, similarity={}", isMatched, similarity);

            // Save session to Redis if verified (5 minutes TTL, one-time use)
            if (isMatched) {
                String redisKey = "face_auth_session:" + sessionId;
                redisTemplateForString.opsForValue().set(
                        redisKey,
                        "verified",
                        5,
                        TimeUnit.MINUTES
                );
                log.info("Face auth session saved to Redis: {} (expires in 5 minutes)", sessionId);
            }
            return FaceAuthVerifyResponse.builder()
                    .verified(isMatched)
                    .sessionId(sessionId)
                    .confidence(similarity)
                    .message(isMatched ? "Verification successful" : "Face does not match")
                    .build();

        } catch (EkycException e) {
            throw e;
        } catch (Exception e) {
            log.error("Face auth verification failed: {}", e.getMessage(), e);
            throw new EkycException("Face auth verification failed: " + e.getMessage());
        }
    }

    /**
     * Link transaction ID to face auth verification record
     * Called by transactionService after successful transfer
     */
    @Transactional
    public void linkTransactionToFaceAuth(String sessionId, Long transactionId) {
        log.info("Linking transaction {} to face auth session {}", transactionId, sessionId);
        
        FaceAuthVerification verification = faceAuthVerificationRepository
                .findBySessionId(sessionId)
                .orElseThrow(() -> new EkycException("Face auth verification not found for session: " + sessionId));
        
        verification.setTransactionId(transactionId);
        faceAuthVerificationRepository.save(verification);
        
        log.info("Successfully linked transaction {} to face auth session {}", transactionId, sessionId);
    }
}
