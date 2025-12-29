package com.ebanking.socket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Cho phép tất cả endpoint
                .allowedOrigins("http://3.85.17.154:3000", "http://10.0.2.2:8006", "http://10.20.2.91:8006") // Cho phép
                                                                                                             // mọi
                                                                                                             // domain
                                                                                                             // (hoặc
                                                                                                             // chỉ định
                                                                                                             // cụ thể
                                                                                                             // như
                                                                                                             // "http://3.85.17.154:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
