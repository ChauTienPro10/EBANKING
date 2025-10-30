package com.ebanking.ekycservice.config;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "fpt.ai")
@Data
public class FptAiConfig {
    private String apiKey;
    private String ocrUrl;
    private String livenessUrl;
    private String faceMatchUrl;
}
