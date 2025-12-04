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
     * Mark user as eKYC verified
     * Called by EkycService after successful face match
     */
    @Transactional
    public void markUserAsVerified(Long userId, EkycVerificationRequest request) {
        UserInfo userInfo = userInfoRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Update eKYC fields
        userInfo.setEkycSessionId(request.getSessionId());
        userInfo.setEkycStatus("VERIFIED");
        userInfo.setEkycVerifiedAt(LocalDateTime.now());

        userInfoRepository.save(userInfo);

        log.info("UserInfo updated with eKYC verification: userId={}, sessionId={}",
                userId, request.getSessionId());
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
