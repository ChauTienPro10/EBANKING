package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.DataPackageDto;
import com.ebanking.transactionService.entity.DataPackage;
import com.ebanking.transactionService.repository.DataPackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DataPackageService {

    private final DataPackageRepository dataPackageRepository;

    public List<DataPackageDto> getAllActivePackages() {
        log.info("Getting all active data packages");
        List<DataPackage> packages = dataPackageRepository.findByIsActiveTrueOrderBySortOrderAscPriceAsc();
        return packages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<DataPackageDto> getPackagesByProvider(Long providerId) {
        log.info("Getting data packages for provider: {}", providerId);
        List<DataPackage> packages = dataPackageRepository.findByProviderIdAndIsActiveTrue(providerId);
        return packages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<DataPackageDto> getPackagesByProviderCode(String providerCode) {
        log.info("Getting data packages for provider code: {}", providerCode);
        List<DataPackage> packages = dataPackageRepository.findByProviderCodeAndIsActiveTrue(providerCode);
        return packages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<DataPackageDto> getPackageById(Long packageId) {
        log.info("Getting data package by ID: {}", packageId);
        return dataPackageRepository.findById(packageId)
                .filter(pkg -> pkg.getIsActive())
                .map(this::convertToDto);
    }

    public Optional<DataPackageDto> getPackageByCode(String packageCode) {
        log.info("Getting data package by code: {}", packageCode);
        return dataPackageRepository.findByPackageCodeAndIsActiveTrue(packageCode)
                .map(this::convertToDto);
    }

    public List<DataPackageDto> getPackagesByPriceRange(Long providerId, BigDecimal minPrice, BigDecimal maxPrice) {
        log.info("Getting data packages for provider {} with price range: {} - {}", providerId, minPrice, maxPrice);
        List<DataPackage> packages = dataPackageRepository.findByProviderIdAndPriceRange(providerId, minPrice, maxPrice);
        return packages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private DataPackageDto convertToDto(DataPackage dataPackage) {
        return DataPackageDto.builder()
                .packageId(dataPackage.getPackageId())
                .providerId(dataPackage.getProviderId())
                .providerCode(dataPackage.getProvider() != null ? dataPackage.getProvider().getProviderCode() : null)
                .providerName(dataPackage.getProvider() != null ? dataPackage.getProvider().getProviderName() : null)
                .packageCode(dataPackage.getPackageCode())
                .packageName(dataPackage.getPackageName())
                .dataAmount(dataPackage.getDataAmount())
                .formattedDataAmount(dataPackage.getFormattedDataAmount())
                .validityDays(dataPackage.getValidityDays())
                .price(dataPackage.getPrice())
                .description(dataPackage.getDescription())
                .isActive(dataPackage.getIsActive())
                .sortOrder(dataPackage.getSortOrder())
                .build();
    }
}