package com.ebanking.transactionService.service;

import com.ebanking.transactionService.entity.DataPackage;
import com.ebanking.transactionService.entity.TelecomProvider;
import com.ebanking.transactionService.entity.TopUpDenomination;
import com.ebanking.transactionService.repository.DataPackageRepository;
import com.ebanking.transactionService.repository.TelecomProviderRepository;
import com.ebanking.transactionService.repository.TopUpDenominationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelecomDataInitService implements CommandLineRunner {

    private final TelecomProviderRepository telecomProviderRepository;
    private final TopUpDenominationRepository denominationRepository;
    private final DataPackageRepository dataPackageRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initializeTelecomProviders();
        initializeDataPackages();
    }

    private void initializeTelecomProviders() {
        log.info("Initializing telecom providers and denominations...");

        // Check if data already exists
        if (telecomProviderRepository.count() > 0) {
            log.info("Telecom providers already initialized");
            return;
        }

        // Create Viettel
        TelecomProvider viettel = createProvider(
                "VIETTEL", "Viettel", 
                "https://example.com/logos/viettel.png",
                new BigDecimal("10000"), new BigDecimal("500000"),
                new BigDecimal("0.5"), new BigDecimal("1000")
        );

        // Create Mobifone
        TelecomProvider mobifone = createProvider(
                "MOBIFONE", "Mobifone", 
                "https://example.com/logos/mobifone.png",
                new BigDecimal("10000"), new BigDecimal("500000"),
                new BigDecimal("0.5"), new BigDecimal("1000")
        );

        // Create Vinaphone
        TelecomProvider vinaphone = createProvider(
                "VINAPHONE", "Vinaphone", 
                "https://example.com/logos/vinaphone.png",
                new BigDecimal("10000"), new BigDecimal("500000"),
                new BigDecimal("0.5"), new BigDecimal("1000")
        );

        // Create Vietnamobile
        TelecomProvider vietnamobile = createProvider(
                "VIETNAMOBILE", "Vietnamobile", 
                "https://example.com/logos/vietnamobile.png",
                new BigDecimal("10000"), new BigDecimal("300000"),
                new BigDecimal("0.5"), new BigDecimal("1000")
        );

        // Create denominations for each provider
        createDenominations(viettel.getProviderId());
        createDenominations(mobifone.getProviderId());
        createDenominations(vinaphone.getProviderId());
        createDenominations(vietnamobile.getProviderId());

        log.info("Telecom providers and denominations initialized successfully");
    }

    private void initializeDataPackages() {
        log.info("Initializing data packages...");

        // Check if data packages already exist
        if (dataPackageRepository.count() > 0) {
            log.info("Data packages already initialized");
            return;
        }

        // Get providers
        TelecomProvider viettel = telecomProviderRepository.findByProviderCode("VIETTEL").orElse(null);
        TelecomProvider mobifone = telecomProviderRepository.findByProviderCode("MOBIFONE").orElse(null);
        TelecomProvider vinaphone = telecomProviderRepository.findByProviderCode("VINAPHONE").orElse(null);
        TelecomProvider vietnamobile = telecomProviderRepository.findByProviderCode("VIETNAMOBILE").orElse(null);

        if (viettel != null) {
            createDataPackagesForProvider(viettel.getProviderId(), "VT");
        }
        if (mobifone != null) {
            createDataPackagesForProvider(mobifone.getProviderId(), "MBF");
        }
        if (vinaphone != null) {
            createDataPackagesForProvider(vinaphone.getProviderId(), "VNP");
        }
        if (vietnamobile != null) {
            createDataPackagesForProvider(vietnamobile.getProviderId(), "VNM");
        }

        log.info("Data packages initialized successfully");
    }

    private void createDataPackagesForProvider(Long providerId, String prefix) {
        List<DataPackageData> packages = Arrays.asList(
                new DataPackageData(prefix + "_D1GB_1D", "Gói 4G 1GB/ngày", 1024L, 1, new BigDecimal("15000"), "Gói data 4G 1GB sử dụng trong 1 ngày", 1),
                new DataPackageData(prefix + "_D3GB_3D", "Gói 4G 3GB/3 ngày", 3072L, 3, new BigDecimal("35000"), "Gói data 4G 3GB sử dụng trong 3 ngày", 2),
                new DataPackageData(prefix + "_D6GB_7D", "Gói 4G 6GB/tuần", 6144L, 7, new BigDecimal("60000"), "Gói data 4G 6GB sử dụng trong 7 ngày", 3),
                new DataPackageData(prefix + "_D12GB_30D", "Gói 4G 12GB/tháng", 12288L, 30, new BigDecimal("120000"), "Gói data 4G 12GB sử dụng trong 30 ngày", 4),
                new DataPackageData(prefix + "_D25GB_30D", "Gói 4G 25GB/tháng", 25600L, 30, new BigDecimal("200000"), "Gói data 4G 25GB sử dụng trong 30 ngày", 5)
        );

        for (DataPackageData data : packages) {
            DataPackage dataPackage = DataPackage.builder()
                    .providerId(providerId)
                    .packageCode(data.packageCode)
                    .packageName(data.packageName)
                    .dataAmount(data.dataAmount)
                    .validityDays(data.validityDays)
                    .price(data.price)
                    .description(data.description)
                    .isActive(true)
                    .sortOrder(data.sortOrder)
                    .build();

            dataPackageRepository.save(dataPackage);
        }
    }

    private TelecomProvider createProvider(String code, String name, String logoUrl,
                                         BigDecimal minAmount, BigDecimal maxAmount,
                                         BigDecimal feePercentage, BigDecimal fixedFee) {
        TelecomProvider provider = TelecomProvider.builder()
                .providerCode(code)
                .providerName(name)
                .logoUrl(logoUrl)
                .isActive(true)
                .apiEndpoint("https://api." + code.toLowerCase() + ".com/topup")
                .apiKey("API_KEY_" + code)
                .minAmount(minAmount)
                .maxAmount(maxAmount)
                .feePercentage(feePercentage)
                .fixedFee(fixedFee)
                .build();

        return telecomProviderRepository.save(provider);
    }

    private void createDenominations(Long providerId) {
        List<DenominationData> denominations = Arrays.asList(
                new DenominationData(new BigDecimal("10000"), "10,000 VND", 1),
                new DenominationData(new BigDecimal("20000"), "20,000 VND", 2),
                new DenominationData(new BigDecimal("30000"), "30,000 VND", 3),
                new DenominationData(new BigDecimal("50000"), "50,000 VND", 4),
                new DenominationData(new BigDecimal("100000"), "100,000 VND", 5),
                new DenominationData(new BigDecimal("200000"), "200,000 VND", 6),
                new DenominationData(new BigDecimal("300000"), "300,000 VND", 7),
                new DenominationData(new BigDecimal("500000"), "500,000 VND", 8)
        );

        for (DenominationData data : denominations) {
            TopUpDenomination denomination = TopUpDenomination.builder()
                    .providerId(providerId)
                    .amount(data.amount)
                    .displayName(data.displayName)
                    .isActive(true)
                    .sortOrder(data.sortOrder)
                    .build();

            denominationRepository.save(denomination);
        }
    }

    private static class DenominationData {
        final BigDecimal amount;
        final String displayName;
        final Integer sortOrder;

        DenominationData(BigDecimal amount, String displayName, Integer sortOrder) {
            this.amount = amount;
            this.displayName = displayName;
            this.sortOrder = sortOrder;
        }
    }

    private static class DataPackageData {
        final String packageCode;
        final String packageName;
        final Long dataAmount;
        final Integer validityDays;
        final BigDecimal price;
        final String description;
        final Integer sortOrder;

        DataPackageData(String packageCode, String packageName, Long dataAmount, Integer validityDays, 
                       BigDecimal price, String description, Integer sortOrder) {
            this.packageCode = packageCode;
            this.packageName = packageName;
            this.dataAmount = dataAmount;
            this.validityDays = validityDays;
            this.price = price;
            this.description = description;
            this.sortOrder = sortOrder;
        }
    }
}