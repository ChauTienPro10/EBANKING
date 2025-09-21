package com.ebanking.AIService.config;

import jakarta.annotation.PostConstruct;
import org.opencv.core.Core;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenCVConfig {

    @PostConstruct
    public void loadNativeLibrary() {
        System.load("C:/Users/chaud/OneDrive/Desktop/DATN/opencv/build/java/x64/opencv_java4120.dll");
        System.out.println("OpenCV loaded. Version: " + Core.VERSION);
    }
}
