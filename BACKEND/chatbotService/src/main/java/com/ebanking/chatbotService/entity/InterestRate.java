package com.ebanking.chatbotService.entity;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterestRate {
    
    private Long interestRateId;
    private Integer termMonths; // Kỳ hạn (tháng)
    private BigDecimal minAmount; // Số tiền tối thiểu
    private BigDecimal maxAmount; // Số tiền tối đa (null = không giới hạn)
    private BigDecimal annualRate; // Lãi suất năm (ví dụ: 0.0650 = 6.5%)
    private String status; // ACTIVE, INACTIVE
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}