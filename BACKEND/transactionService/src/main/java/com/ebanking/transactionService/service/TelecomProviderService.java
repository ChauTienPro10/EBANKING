package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.TelecomProviderDto;
import com.ebanking.transactionService.dto.TopUpDenominationDto;
import com.ebanking.transactionService.entity.TelecomProvider;
import com.ebanking.transactionService.entity.TopUpDenomination;
import com.ebanking.transactionService.repository.TelecomProviderRepository;
import com.ebanking.transactionService.repository.TopUpDenominationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelecomProviderService {

    private final TelecomProviderRepository telecomProviderRepository;
    private final TopUpDenominationRepository denominationRepository;

    /**
     * Get all active telecom providers
     */
    public List<TelecomProviderDto> getActiveProviders() {
        List<TelecomProvider> providers = telecomProviderRepository.findByIsActiveTrueOrderByProviderName();
        return providers.stream()
                .map(provider -> {
                    TelecomProviderDto dto = TelecomProviderDto.fromEntity(provider);
                    // Load denominations
                    List<TopUpDenomination> denominations = denominationRepository
                            .findByProviderIdAndIsActiveTrueOrderBySortOrderAscAmountAsc(provider.getProviderId());
                    dto.setDenominations(denominations.stream()
                            .map(TopUpDenominationDto::fromEntity)
                            .collect(Collectors.toList()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get provider by code
     */
    public Optional<TelecomProviderDto> getProviderByCode(String providerCode) {
        return telecomProviderRepository.findByProviderCode(providerCode)
                .map(provider -> {
                    TelecomProviderDto dto = TelecomProviderDto.fromEntity(provider);
                    // Load denominations
                    List<TopUpDenomination> denominations = denominationRepository
                            .findByProviderIdAndIsActiveTrueOrderBySortOrderAscAmountAsc(provider.getProviderId());
                    dto.setDenominations(denominations.stream()
                            .map(TopUpDenominationDto::fromEntity)
                            .collect(Collectors.toList()));
                    return dto;
                });
    }

    /**
     * Get denominations by provider ID
     */
    public List<TopUpDenominationDto> getDenominationsByProvider(Long providerId) {
        List<TopUpDenomination> denominations = denominationRepository
                .findByProviderIdAndIsActiveTrueOrderBySortOrderAscAmountAsc(providerId);
        return denominations.stream()
                .map(TopUpDenominationDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all active denominations
     */
    public List<TopUpDenominationDto> getAllActiveDenominations() {
        List<TopUpDenomination> denominations = denominationRepository
                .findByIsActiveTrueOrderByProviderIdAscSortOrderAscAmountAsc();
        return denominations.stream()
                .map(TopUpDenominationDto::fromEntity)
                .collect(Collectors.toList());
    }
}