package com.ebanking.ekycservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.awt.image.RescaleOp;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;

/**
 * Service để enhance quality của ảnh trước khi gửi lên FPT AI
 * Giúp tăng tỷ lệ Face Match success khi ảnh từ WebView bị quality thấp
 */
@Service
@Slf4j
public class ImageEnhancementService {

    /**
     * Enhance image quality với các techniques:
     * 1. Sharpening (làm nét ảnh)
     * 2. Brightness/Contrast adjustment
     * 3. Noise reduction
     *
     * @param imageBase64 Image dạng base64
     * @return Enhanced image dạng base64
     */
    public String enhanceImageQuality(String imageBase64) {
        try {
            log.info("🎨 Starting image enhancement...");

            // Decode base64 to bytes
            String cleanBase64 = cleanBase64String(imageBase64);
            byte[] imageBytes = Base64.getDecoder().decode(cleanBase64);

            // Enhance
            byte[] enhancedBytes = enhanceImageBytes(imageBytes);

            // Encode back to base64
            String enhancedBase64 = Base64.getEncoder().encodeToString(enhancedBytes);

            log.info("✅ Image enhancement completed. Size: {} → {} bytes",
                    imageBytes.length, enhancedBytes.length);

            return enhancedBase64;

        } catch (Exception e) {
            log.error("❌ Image enhancement failed: {}", e.getMessage(), e);
            // Fallback: return original image if enhancement fails
            return imageBase64;
        }
    }

    /**
     * Enhance image bytes
     */
    private byte[] enhanceImageBytes(byte[] imageBytes) throws Exception {
        // 1. Read image
        BufferedImage original = ImageIO.read(new ByteArrayInputStream(imageBytes));

        if (original == null) {
            throw new IllegalArgumentException("Cannot read image");
        }

        log.debug("Original image: {}x{}", original.getWidth(), original.getHeight());

        // 2. Convert to RGB if necessary
        BufferedImage rgbImage = convertToRGB(original);

        // 3. Apply sharpening filter
        BufferedImage sharpened = applySharpen(rgbImage);

        // 4. Adjust brightness and contrast
        BufferedImage enhanced = adjustBrightnessContrast(sharpened, 1.15f, 10);

        // 5. Convert back to bytes with high quality
        return imageToBytes(enhanced, 0.95f);
    }

    /**
     * Convert image to RGB format
     */
    private BufferedImage convertToRGB(BufferedImage original) {
        if (original.getType() == BufferedImage.TYPE_INT_RGB) {
            return original;
        }

        BufferedImage rgbImage = new BufferedImage(
                original.getWidth(),
                original.getHeight(),
                BufferedImage.TYPE_INT_RGB);

        Graphics2D g = rgbImage.createGraphics();
        g.drawImage(original, 0, 0, null);
        g.dispose();

        return rgbImage;
    }

    /**
     * Apply sharpening filter using convolution
     */
    private BufferedImage applySharpen(BufferedImage image) {
        // Sharpen kernel
        float[] sharpenKernel = {
                -0.5f, -0.5f, -0.5f,
                -0.5f, 5.0f, -0.5f,
                -0.5f, -0.5f, -0.5f
        };

        Kernel kernel = new Kernel(3, 3, sharpenKernel);
        ConvolveOp convolve = new ConvolveOp(
                kernel,
                ConvolveOp.EDGE_NO_OP,
                null);

        BufferedImage sharpened = new BufferedImage(
                image.getWidth(),
                image.getHeight(),
                BufferedImage.TYPE_INT_RGB);

        convolve.filter(image, sharpened);

        log.debug("✅ Sharpening applied");
        return sharpened;
    }

    /**
     * Adjust brightness and contrast
     *
     * @param image  Input image
     * @param scale  Contrast scale (1.0 = no change, >1.0 = increase contrast)
     * @param offset Brightness offset (-255 to +255)
     */
    private BufferedImage adjustBrightnessContrast(BufferedImage image, float scale, float offset) {
        RescaleOp rescale = new RescaleOp(scale, offset, null);

        BufferedImage adjusted = new BufferedImage(
                image.getWidth(),
                image.getHeight(),
                BufferedImage.TYPE_INT_RGB);

        rescale.filter(image, adjusted);

        log.debug("✅ Brightness/Contrast adjusted: scale={}, offset={}", scale, offset);
        return adjusted;
    }

    /**
     * Convert BufferedImage to byte array with specified quality
     */
    private byte[] imageToBytes(BufferedImage image, float quality) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpg").next();
        ImageWriteParam param = writer.getDefaultWriteParam();

        // Set compression quality
        if (param.canWriteCompressed()) {
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(quality);
        }

        writer.setOutput(ImageIO.createImageOutputStream(baos));
        writer.write(null, new IIOImage(image, null, null), param);
        writer.dispose();

        log.debug("✅ Image encoded with quality: {}", quality);
        return baos.toByteArray();
    }

    /**
     * Clean base64 string
     */
    private String cleanBase64String(String base64) {
        if (base64 == null || base64.isEmpty()) {
            throw new IllegalArgumentException("Base64 string cannot be null or empty");
        }

        String cleaned = base64;
        if (cleaned.contains("base64,")) {
            cleaned = cleaned.substring(cleaned.indexOf("base64,") + 7);
        }

        return cleaned.replaceAll("\\s+", "").trim();
    }

    /**
     * Enhance image với auto-detection
     * Tự động detect nếu ảnh quá tối/sáng và adjust accordingly
     */
    public String enhanceImageAuto(String imageBase64) {
        try {
            String cleanBase64 = cleanBase64String(imageBase64);
            byte[] imageBytes = Base64.getDecoder().decode(cleanBase64);
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));

            if (image == null) {
                return imageBase64;
            }

            // Detect brightness
            float avgBrightness = calculateAverageBrightness(image);
            log.debug("Average brightness: {}", avgBrightness);

            // Auto-adjust based on brightness
            float scale = 1.0f;
            float offset = 0.0f;

            if (avgBrightness < 80) {
                // Too dark
                scale = 1.2f;
                offset = 20.0f;
                log.info("Image too dark, applying brightness boost");
            } else if (avgBrightness > 180) {
                // Too bright
                scale = 0.9f;
                offset = -10.0f;
                log.info("Image too bright, applying brightness reduction");
            } else {
                // Normal - just sharpen
                scale = 1.1f;
                offset = 5.0f;
            }

            // Apply enhancement
            BufferedImage rgbImage = convertToRGB(image);
            BufferedImage sharpened = applySharpen(rgbImage);
            BufferedImage enhanced = adjustBrightnessContrast(sharpened, scale, offset);

            byte[] enhancedBytes = imageToBytes(enhanced, 0.95f);
            return Base64.getEncoder().encodeToString(enhancedBytes);

        } catch (Exception e) {
            log.error("Auto enhancement failed: {}", e.getMessage());
            return imageBase64;
        }
    }

    /**
     * Calculate average brightness of image
     */
    private float calculateAverageBrightness(BufferedImage image) {
        long sum = 0;
        int count = 0;

        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                int rgb = image.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;

                // Calculate brightness (luminance)
                float brightness = (0.299f * r + 0.587f * g + 0.114f * b);
                sum += brightness;
                count++;
            }
        }

        return (float) sum / count;
    }
}
