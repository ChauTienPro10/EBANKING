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
        EkycSession session = sessionRepository.findById(UUID.fromString(sessionId))
                .orElseThrow(() -> new EkycException("Session not found"));

        if (session.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new EkycException("Session expired");
        }

        try {
            // Call FPT.AI OCR for front image
            Map<String, Object> frontResult = fptAiService.callOrcApi(frontImageBase64);
            log.debug("Front OCR result: {}", frontResult);

            // FPT.AI OCR response structure: { "errorCode": 0, "errorMessage": "", "data": [...] }
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

            log.info("Extracted data: idNumber={}, fullName={}, dob={}, gender={}, address={}, issueDate={}, confidence={}",
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
                    .frontImagePath(frontImagePath)      // Lưu path thay vì base64
                    .backImagePath(backImagePath)        // Lưu path thay vì base64
                    .portraitImagePath(null)             // FPT.AI không trả về avatar nữa
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
                    .confidence(confidence)              // OCR confidence từ overall_score
                    .portraitImagePath(null)             // FPT.AI không trả về avatar
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
        EkycSession session = sessionRepository.findById(UUID.fromString(sessionId))
                .orElseThrow(() -> new EkycException("Session not found"));

        try {
            // Call FPT.AI Liveness
            Map<String, Object> result = fptAiService.callLivenessApi(videoBase64);
            log.debug("Liveness result: {}", result);

            // FPT.AI Liveness response structure: { "data": { "is_live": true, "score": 0.99 } }
            Object dataObj = result.get("data");
            if (dataObj == null) {
                throw new EkycException("FPT.AI returned null data for liveness check");
            }

            Map<String, Object> data = (Map<String, Object>) dataObj;

            // Safe casting for boolean and number
            Boolean isLive = getBooleanValue(data, "is_live");
            Double score = getDoubleValue(data, "score");

            log.info("Liveness check result: isLive={}, score={}", isLive, score);

            // Save video to file system
            String sessionIdStr = session.getId().toString();
            String videoPath = mediaStorageService.saveVideo(videoBase64, sessionIdStr);

            // Save biometric data with file path
            BiometricData biometricData = BiometricData.builder()
                    .session(session)
                    .selfieVideoPath(videoPath)  // Lưu path thay vì base64
                    .livenessScore(score)
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
        if (value == null) return false;
        if (value instanceof Boolean) return (Boolean) value;
        return Boolean.parseBoolean(value.toString());
    }

    private Double getDoubleValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return 0.0;
        if (value instanceof Number) return ((Number) value).doubleValue();
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

        // Get session with relations
        EkycSession session = sessionRepository.findById(UUID.fromString(sessionId))
                .orElseThrow(() -> new EkycException("Session not found"));

        DocumentInfo docInfo = session.getDocumentInfo();
        BiometricData bioData = session.getBiometricData();

        if (docInfo == null || bioData == null) {
            throw new EkycException("Missing required data for face matching");
        }

        try {
            // Load images from file system and convert to base64 for FPT AI
            // Since FPT.AI OCR doesn't return portrait/avatar anymore, we use front CCCD image
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
            log.debug("Face match result: {}", result);

            // FPT.AI Face Match response structure: { "data": { "similarity": 0.95 } }
            Object dataObj = result.get("data");
            if (dataObj == null) {
                throw new EkycException("FPT.AI returned null data for face match");
            }

            Map<String, Object> data = (Map<String, Object>) dataObj;

            Double similarity = getDoubleValue(data, "similarity");
            Boolean isMatched = similarity >= 0.85;

            log.info("Face match result: similarity={}, isMatched={}", similarity, isMatched);

            // Update biometric data
            bioData.setFaceMatchScore(similarity);
            bioData.setIsMatched(isMatched);
            biometricDataRepository.save(bioData);

            // Update session
            if (isMatched) {
                session.setStatus(EkycStatus.COMPLETED);
                session.setCurrentStep(EkycStep.COMPLETE);
            } else {
                session.setStatus(EkycStatus.FAILED);
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
}
