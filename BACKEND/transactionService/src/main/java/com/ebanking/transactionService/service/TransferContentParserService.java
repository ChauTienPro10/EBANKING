package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.TransferContentParseResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class TransferContentParserService {

    private static final Pattern PURPOSE_PATTERN = Pattern.compile("^\\[([^\\]]+)\\]\\s*(.*)$");

    public TransferContentParseResult parseTransferContent(String description) {
        if (description == null || description.trim().isEmpty()) {
            return TransferContentParseResult.builder()
                    .purposeCode(null)
                    .content("")
                    .hasPurpose(false)
                    .build();
        }

        Matcher matcher = PURPOSE_PATTERN.matcher(description.trim());
        
        if (matcher.matches()) {
            String purposeCode = matcher.group(1);
            String content = matcher.group(2) != null ? matcher.group(2).trim() : "";
            
            log.debug("Parsed transfer content - Purpose: {}, Content: {}", purposeCode, content);
            
            return TransferContentParseResult.builder()
                    .purposeCode(purposeCode)
                    .content(content)
                    .hasPurpose(true)
                    .build();
        }
        
        return TransferContentParseResult.builder()
                .purposeCode(null)
                .content(description.trim())
                .hasPurpose(false)
                .build();
    }
}