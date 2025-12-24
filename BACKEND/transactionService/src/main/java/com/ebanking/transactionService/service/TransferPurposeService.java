package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.TransferPurposeDto;
import com.ebanking.transactionService.entity.TransferPurpose;
import com.ebanking.transactionService.repository.TransferPurposeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransferPurposeService {

    private final TransferPurposeRepository transferPurposeRepository;

    public List<TransferPurposeDto> getAllActivePurposes() {
        try {
            List<TransferPurpose> purposes = transferPurposeRepository.findAllActiveOrderByName();
            return purposes.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching transfer purposes", e);
            throw new RuntimeException("Unable to fetch transfer purposes");
        }
    }

    public boolean isValidPurposeCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            return false;
        }
        Optional<TransferPurpose> purpose = transferPurposeRepository.findByCodeAndIsActive(code, true);
        return purpose.isPresent();
    }

    private TransferPurposeDto convertToDto(TransferPurpose purpose) {
        return TransferPurposeDto.builder()
                .id(purpose.getId())
                .name(purpose.getName())
                .code(purpose.getCode())
                .icon(purpose.getIcon())
                .build();
    }
}