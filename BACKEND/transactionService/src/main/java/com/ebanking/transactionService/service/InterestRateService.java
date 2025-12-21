package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.InterestRateDto;
import com.ebanking.transactionService.entity.InterestRate;
import com.ebanking.transactionService.repository.InterestRateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterestRateService {

    private final InterestRateRepository interestRateRepository;

    public List<InterestRateDto> getActiveInterestRates() {
        List<InterestRate> rates = interestRateRepository.findActiveRates();
        return rates.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<InterestRateDto> getAllInterestRates() {
        List<InterestRate> rates = interestRateRepository.findAll();
        return rates.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<InterestRateDto> getInterestRateById(Long id) {
        return interestRateRepository.findById(id)
                .map(this::convertToDto);
    }

    public Optional<InterestRateDto> findApplicableRate(Integer termMonths, BigDecimal amount) {
        return interestRateRepository.findApplicableRate(termMonths, amount)
                .map(this::convertToDto);
    }

    public List<InterestRateDto> getInterestRatesByTerm(Integer termMonths) {
        List<InterestRate> rates = interestRateRepository.findByTermMonthsAndStatus(termMonths, "ACTIVE");
        return rates.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private InterestRateDto convertToDto(InterestRate rate) {
        return InterestRateDto.builder()
                .interestRateId(rate.getInterestRateId())
                .termMonths(rate.getTermMonths())
                .minAmount(rate.getMinAmount())
                .maxAmount(rate.getMaxAmount())
                .annualRate(rate.getAnnualRate())
                .status(rate.getStatus())
                .effectiveFrom(rate.getEffectiveFrom())
                .effectiveTo(rate.getEffectiveTo())
                .build();
    }
}