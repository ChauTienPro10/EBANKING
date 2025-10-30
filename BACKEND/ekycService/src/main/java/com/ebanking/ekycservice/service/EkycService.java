package com.ebanking.ekycservice.service;

import com.ebanking.ekycservice.constant.EkycStatus;
import com.ebanking.ekycservice.constant.EkycStep;
import com.ebanking.ekycservice.dto.request.LivenessRequest;
import com.ebanking.ekycservice.dto.request.OrcRequest;
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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

    @Transactional
    @SuppressWarnings("unchecked")
    public OrcResponse processOcr(OrcRequest request) {
        log.info("Processing OCR for session: {}", request.getSessionId());

        // Validate session
        EkycSession session = sessionRepository.findById(UUID.fromString(request.getSessionId()))
                .orElseThrow(() -> new EkycException("Session not found"));

        if (session.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new EkycException("Session expired");
        }

        try {
            // Call FPT.AI OCR for front image
            Map<String, Object> frontResult = fptAiService.callOrcApi(request.getFrontImageBase64());
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
            Map<String, Object> backResult = fptAiService.callOrcApi(request.getBackImageBase64());
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
            String portraitImage = getStringValue(frontData, "avatar");

            // Extract data from BACK (chip_back has issue_date, features, mrz)
            String issueDateStr = backData != null ? getStringValue(backData, "issue_date") : "";

            log.info("Extracted data: idNumber={}, fullName={}, dob={}, gender={}, address={}, issueDate={}",
                    idNumber, fullName, dobStr, gender, address, issueDateStr);

            // Parse dates
            LocalDate dateOfBirth = parseDateOfBirth(dobStr);
            LocalDate issueDate = parseDateOfBirth(issueDateStr);
            LocalDate expiryDate = parseDateOfBirth(doeStr);

            // Save document info
            DocumentInfo documentInfo = DocumentInfo.builder()
                    .session(session)
                    .idNumber(idNumber)
                    .fullName(fullName)
                    .dateOfBirth(dateOfBirth)
                    .gender(gender)
                    .address(address)
                    .issueDate(issueDate)
                    .expiryDate(expiryDate)
                    .frontImageUrl(request.getFrontImageBase64()) // Storing base64 directly (simplified)
                    .backImageUrl(request.getBackImageBase64())
                    .portraitImageUrl(portraitImage)
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
                    .portraitImageUrl(portraitImage)
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

    @Transactional
    @SuppressWarnings("unchecked")
    public LivenessResponse processLiveness(LivenessRequest request) {
        log.info("Processing liveness for session: {}", request.getSessionId());

        // Validate session
        EkycSession session = sessionRepository.findById(UUID.fromString(request.getSessionId()))
                .orElseThrow(() -> new EkycException("Session not found"));

        try {
            // Call FPT.AI Liveness
            Map<String, Object> result = fptAiService.callLivenessApi(request.getVideoBase64());
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

            // Save biometric data
            BiometricData biometricData = BiometricData.builder()
                    .session(session)
                    .selfieVideoUrl(request.getVideoBase64()) // Storing base64 directly
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
            // Extract frame from video (simplified - using video base64 directly)
            String portraitImage = docInfo.getPortraitImageUrl();
            String selfieImage = bioData.getSelfieVideoUrl(); // In production, extract frame from video

            // Call FPT.AI Face Match
            Map<String, Object> result = fptAiService.callFaceMatchApi(portraitImage, selfieImage);
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
