package com.ebanking.firebaseService.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @PostConstruct
    public void initialize() {
        try {
            Resource resource = new ClassPathResource("ebanking-2ac29-firebase-adminsdk-fbsvc-87efa45dc0.json");

            if (!resource.exists()) {
                log.warn("Firebase credentials file not found in classpath, skipping Firebase initialization. " +
                        "Notifications will be disabled but the service will still start.");
                return;
            }

            try (InputStream serviceAccount = resource.getInputStream()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                    log.info("Firebase has been initialized successfully");
                } else {
                    log.info("Firebase already initialized, skipping re-initialization");
                }
            }
        } catch (Exception e) {
            log.error("Failed to initialize Firebase. Notifications may not work, but the service will continue to run.", e);
        }
    }
}
