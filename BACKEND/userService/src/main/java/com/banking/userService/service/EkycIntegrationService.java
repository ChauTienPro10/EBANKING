package com.banking.userService.service;

import com.banking.userService.dto.request.EkycVerificationRequest;
import com.banking.userService.dto.response.EkycStatusResponse;
import com.banking.userService.entity.UserInfo;
import com.banking.userService.repository.IUserInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

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

        // Update eKYC status
        userInfo.setEkycSessionId(request.getSessionId());
        userInfo.setEkycStatus("VERIFIED");
        userInfo.setEkycVerifiedAt(LocalDateTime.now());
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
     * Reset eKYC status to allow user to retry
     */
    @Transactional
    public void resetEkycStatus(Long userId) {
        UserInfo userInfo = userInfoRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Only allow reset if current status is not VERIFIED or is expired
        if ("VERIFIED".equals(userInfo.getEkycStatus())) {
            // Optional: Check if verification is older than 1 year (expired)
            LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
            if (userInfo.getEkycVerifiedAt() != null &&
                    userInfo.getEkycVerifiedAt().isAfter(oneYearAgo)) {
                throw new RuntimeException("Cannot retry eKYC - already verified");
            }
        }

        userInfo.setEkycStatus("NOT_VERIFIED");
        userInfo.setEkycSessionId(null);
        userInfo.setEkycVerifiedAt(null);

        userInfoRepository.save(userInfo);

        log.info("eKYC status reset for user: {}", userId);
    }
}
