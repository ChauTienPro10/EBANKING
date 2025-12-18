package com.ebanking.adminTool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for HTTP client (RestTemplate)
 * Used for inter-service communication
 */
@Configuration
public class RestTemplateConfig {

    /**
     * Create RestTemplate bean with custom timeout settings
     * 
     * @return configured RestTemplate instance
     */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();

        // Set connection timeout (5 seconds)
        factory.setConnectTimeout(5000);

        // Set read timeout (10 seconds)
        factory.setReadTimeout(10000);

        return new RestTemplate(factory);
    }
}
