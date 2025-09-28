package com.ebanking.AIService;

import net.sourceforge.tess4j.*;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;

import java.io.File;
import java.util.regex.*;

public class CCCDReader {

    static {
        // Cách dùng System.load với đường dẫn tuyệt đối đến file .dll
        System.load("C:/Users/chaud/OneDrive/Desktop/DATN/opencv/build/java/x64/opencv_java4120.dll");
    }
    public static void main(String[] args) {
        String imagePath = "C:/Users/chaud/Downloads/cccd.png";
        Mat image = Imgcodecs.imread(imagePath);

        // Convert to grayscale
        Mat gray = new Mat();
        Imgproc.cvtColor(image, gray, Imgproc.COLOR_BGR2GRAY);

        // Apply thresholding
        Mat thresh = new Mat();
        Imgproc.adaptiveThreshold(gray, thresh, 255, Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,
                Imgproc.THRESH_BINARY, 11, 2);

        // Save preprocessed image for OCR
        String ocrImagePath = "cccd_ocr.png";
        Imgcodecs.imwrite(ocrImagePath, thresh);

        // Run OCR with Tesseract
        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath("tessdata"); // Thư mục chứa traineddata
        tesseract.setLanguage("vie+eng");  // tiếng Việt + tiếng Anh

        try {
            String result = tesseract.doOCR(new File(ocrImagePath));
            System.out.println("=== OCR RAW TEXT ===");
            System.out.println(result);

            // Parse data
            String hoTen = findHoTen(result);
            String cccd = findCCCD(result);
            String dob = findDOB(result);
            String gioiTinh = findGioiTinh(result);
            String diaChi = findDiaChi(result);

            System.out.println("Họ tên: " + hoTen);
            System.out.println("Số CCCD: " + cccd);
            System.out.println("Ngày sinh: " + dob);
            System.out.println("Giới tính: " + gioiTinh);
            System.out.println("Địa chỉ: " + diaChi);

        } catch (TesseractException e) {
            e.printStackTrace();
        }
    }

    // Regex / Rule-based extraction
    private static String findCCCD(String text) {
        Matcher m = Pattern.compile("\\b\\d{9,12}\\b").matcher(text.replace(" ", ""));
        return m.find() ? m.group(0) : "Không tìm thấy";
    }

    private static String findDOB(String text) {
        Matcher m = Pattern.compile("(\\d{2}[\\/\\-\\.]\\d{2}[\\/\\-\\.]\\d{4})").matcher(text);
        return m.find() ? m.group(1) : "Không tìm thấy";
    }

    private static String findHoTen(String text) {
        Matcher m = Pattern.compile("(?i)(Họ và tên|HỌ TÊN|Ho ten)[:\\-]?\\s*(.+)").matcher(text);
        if (m.find()) {
            return m.group(2).split("\n")[0].trim();
        }
        // fallback: dòng có nhiều chữ in hoa
        for (String line : text.split("\n")) {
            if (line.trim().length() > 5 && countUppercase(line) >= 3)
                return line.trim();
        }
        return "Không tìm thấy";
    }

    private static String findGioiTinh(String text) {
        Matcher m = Pattern.compile("(?i)(Nam|Nữ|nu)").matcher(text);
        return m.find() ? m.group(1) : "Không tìm thấy";
    }

    private static String findDiaChi(String text) {
        Matcher m = Pattern.compile("(?i)(Nơi thường trú|Địa chỉ|Thuong tru|Dia chi)[^:]*[:\\-]?\\s*(.+)")
                .matcher(text);
        if (m.find()) return m.group(2).split("\n")[0].trim();
        return "Không tìm thấy";
    }

    private static int countUppercase(String s) {
        int count = 0;
        for (char c : s.toCharArray()) if (Character.isUpperCase(c)) count++;
        return count;
    }
}
