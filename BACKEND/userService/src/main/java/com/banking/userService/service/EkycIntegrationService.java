package com.banking.userService.service;

import com.banking.userService.dto.request.EkycVerificationRequest;
import com.banking.userService.dto.response.EkycStatusResponse;
import com.banking.userService.entity.UserInfo;
import com.banking.userService.repository.IUserInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EkycIntegrationService {

    private final IUserInfoRepository userInfoRepository;

    /**
     * Mark user as eKYC verified AND update profile with OCR data
     * Called by EkycService after successful face match
     */
    @Transactional
    public void markUserAsVerified(Long userId, EkycVerificationRequest request) {
        UserInfo userInfo = userInfoRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Update profile with OCR data from CCCD
        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            userInfo.setFullName(request.getFullName());
        }

        if (request.getIdNumber() != null && !request.getIdNumber().isEmpty()) {
            userInfo.setCitizenId(request.getIdNumber());
        }

        if (request.getDateOfBirth() != null) {
            long timestamp = request.getDateOfBirth().atStartOfDay()
                    .atZone(java.time.ZoneId.of("Asia/Ho_Chi_Minh"))
                    .toInstant()
                    .toEpochMilli();
            userInfo.setBirthday(timestamp);
        }

        if (request.getGender() != null && !request.getGender().isEmpty()) {
            boolean isMale = "Nam".equalsIgnoreCase(request.getGender()) ||
                    "Male".equalsIgnoreCase(request.getGender());
            userInfo.setIsMale(isMale);
        }

        if (request.getAddress() != null && !request.getAddress().isEmpty()) {
            userInfo.setAddress(request.getAddress());
        }

        // Update eKYC status with Unix timestamp (milliseconds)
        userInfo.setEkycSessionId(request.getSessionId());
        userInfo.setEkycStatus("VERIFIED");
        userInfo.setEkycVerifiedAt(System.currentTimeMillis()); // ✅ Unix timestamp - no timezone issues!
        userInfo.setUpdatedAt(System.currentTimeMillis());

        userInfoRepository.save(userInfo);

        log.info("eKYC verified and profile updated: userId={}, sessionId={}", userId, request.getSessionId());
    }

    /**
     * Get eKYC status for user
     */
    public EkycStatusResponse getEkycStatus(Long userId) {
        UserInfo userInfo = userInfoRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        return EkycStatusResponse.builder()
                .status(userInfo.getEkycStatus() != null ? userInfo.getEkycStatus() : "NOT_VERIFIED")
                .sessionId(userInfo.getEkycSessionId())
                .verifiedAt(userInfo.getEkycVerifiedAt())
                .canRetry("VERIFIED".equals(userInfo.getEkycStatus()) ? false : true)
                .build();
    }

    /**
     * Check if user can retry eKYC (without deleting data)
     * Only validates that eKYC is expired or not verified
     * Data will be replaced when new eKYC is completed
     */
    @Transactional
    public void resetEkycStatus(Long userId) {
        UserInfo userInfo = userInfoRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Only allow reset if current status is not VERIFIED or is expired
        if ("VERIFIED".equals(userInfo.getEkycStatus())) {
            // Demo
            // Production: Change to 365 * 24 * 60 * 60 * 1000 for 1 year
            long fiveMinutesAgo = System.currentTimeMillis() - (24 * 60 * 60 * 1000L);
            if (userInfo.getEkycVerifiedAt() != null &&
                    userInfo.getEkycVerifiedAt() > fiveMinutesAgo) {
                throw new RuntimeException("Cannot retry eKYC - already verified");
            }
        }

        // ✅ CRITICAL FIX: Do NOT delete data here!
        // Old data will be preserved until new eKYC is completed
        // This prevents data loss if user exits eKYC flow mid-way
        
        // The data will be replaced in verifyEkyc() when new verification completes
        log.info("eKYC retry permission granted for user: {} (old data preserved)", userId);
    }
}
