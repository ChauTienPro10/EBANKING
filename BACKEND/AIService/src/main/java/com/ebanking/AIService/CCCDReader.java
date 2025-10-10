package com.ebanking.AIService;

import net.sourceforge.tess4j.*;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.regex.*;

public class CCCDReader {

    // <-- SỬA ĐƯỜNG DẪN THEO MÁY BẠN -->
    private static final String OPENCV_DLL = "C:/Users/chaud/OneDrive/Desktop/DATN/opencv/build/java/x64/opencv_java4120.dll";
    private static final String TESSDATA_PATH = "C:/Users/chaud/OneDrive/Desktop/DATN/tessdata/"; // thư mục có eng.traineddata và vie.traineddata

    static {
        // Load OpenCV native library
        System.load(OPENCV_DLL);
        // Set Tesseract data path
        System.setProperty("TESSDATA_PREFIX", TESSDATA_PATH);
    }

    public static void main(String[] args) {
        String imagePath = "C:/Users/chaud/Downloads/cccd1.jpg"; // <-- sửa theo ảnh của bạn
        File tessdir = new File(TESSDATA_PATH);
        if (!new File(imagePath).exists()) {
            System.err.println("Ảnh input không tồn tại: " + imagePath);
            return;
        }
        if (!new File(TESSDATA_PATH + "vie.traineddata").exists() ||
                !new File(TESSDATA_PATH + "eng.traineddata").exists()) {
            System.err.println("Thiếu file traineddata trong " + TESSDATA_PATH + ". Cần vie.traineddata và eng.traineddata");
            return;
        }

        // 1. Read image
        Mat src = Imgcodecs.imread(imagePath);
        if (src.empty()) {
            System.err.println("Không thể load ảnh: " + imagePath);
            return;
        }

        // 2. Preprocess (resize, gray, CLAHE, denoise, threshold, morphology, deskew)
        Mat pre = preprocessForOCR(src);

        // Save preprocessing result to debug
        String prePath = "cccd_preprocessed.png";
        Imgcodecs.imwrite(prePath, pre);
        System.out.println("Ảnh tiền xử lý lưu: " + prePath);

        // 3. Run OCR on whole preprocessed image
        String ocrText = runTesseractOCR(prePath);
        if (ocrText == null) {
            System.err.println("OCR thất bại.");
            return;
        }

        // Save raw OCR to file
        try (FileWriter fw = new FileWriter("ocr_result.txt")) {
            fw.write(ocrText);
            System.out.println("Kết quả OCR lưu vào ocr_result.txt");
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("\n=== OCR RAW TEXT ===\n" + ocrText);

        // 4. Extract fields
        String hoTen = extractName(ocrText);
        String cccd = extractCCCD(ocrText);
        String dob = extractDOB(ocrText);
        String gioiTinh = extractGender(ocrText);
        String diaChi = extractAddress(ocrText);

        System.out.println("\n=== THÔNG TIN TRÍCH XUẤT ===");
        System.out.println("Họ tên: " + hoTen);
        System.out.println("Số CCCD: " + cccd);
        System.out.println("Ngày sinh: " + dob);
        System.out.println("Giới tính: " + gioiTinh);
        System.out.println("Địa chỉ: " + diaChi);
    }

    // -------------------------
    // Preprocessing helper
    // -------------------------
    private static Mat preprocessForOCR(Mat src) {
        Mat img = src.clone();

        // 1. Resize nếu ảnh nhỏ
        int maxDim = Math.max(img.cols(), img.rows());
        if (maxDim < 1200) {
            double scale = 1200.0 / maxDim;
            Imgproc.resize(img, img, new Size(img.cols() * scale, img.rows() * scale), 0, 0, Imgproc.INTER_CUBIC);
        }

        // 2. Chuyển grayscale
        Mat gray = new Mat();
        Imgproc.cvtColor(img, gray, Imgproc.COLOR_BGR2GRAY);

        // 3. CLAHE nhẹ để giữ nét và giảm sáng không đều
        Mat clahe = new Mat();
        Imgproc.createCLAHE(1.0, new Size(8, 8)).apply(gray, clahe);

        // 4. Adaptive Threshold thay vì Otsu để xử lý sáng không đều
        Mat bin = new Mat();
        Imgproc.adaptiveThreshold(
                clahe, bin, 255,
                Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,
                Imgproc.THRESH_BINARY,
                17,  // blockSize
                9    // C (nếu chữ mờ thì giảm xuống 7, nếu chữ quá dày thì tăng lên 11)
        );

        // 5. KHÔNG dùng morphology hay blur nếu ảnh đã rõ

        return bin;
    }





    // Quick deskew using Hough or moments
    private static Mat deskew(Mat bin) {
        Mat edges = new Mat();
        Imgproc.Canny(bin, edges, 50, 200, 3, false);

        Mat lines = new Mat();
        Imgproc.HoughLinesP(edges, lines, 1, Math.PI / 180, 50, bin.cols() / 2.0, 20);

        double angle = 0;
        int count = 0;

        for (int i = 0; i < lines.rows(); i++) {
            double[] l = lines.get(i, 0);
            double dx = l[2] - l[0];
            double dy = l[3] - l[1];

            if (Math.abs(dx) < 1e-3) continue; // bỏ gần như thẳng đứng

            double a = Math.atan2(dy, dx) * 180.0 / Math.PI;

            if (Math.abs(a) < 45 && Math.abs(dx) > 50) { // ưu tiên đường dài và gần ngang
                angle += a;
                count++;
            }
        }

        if (count > 0) {
            angle = angle / count;
            if (Math.abs(angle) > 0.3) {  // tránh xoay nếu gần như thẳng
                Point center = new Point(bin.cols() / 2.0, bin.rows() / 2.0);
                Mat rotMat = Imgproc.getRotationMatrix2D(center, angle, 1.0);
                Mat rotated = new Mat();
                Imgproc.warpAffine(bin, rotated, rotMat, bin.size(), Imgproc.INTER_CUBIC, Core.BORDER_REPLICATE, Scalar.all(255));
                return rotated;
            }
        }

        return bin;
    }

    // -------------------------
    // OCR helper using Tess4J
    // -------------------------
    private static String runTesseractOCR(String imagePath) {
        Tesseract tesseract = new Tesseract();

        // 1. Cấu hình thư mục traineddata
        tesseract.setDatapath(TESSDATA_PATH);

        // 2. Ngôn ngữ: ưu tiên tiếng Việt + tiếng Anh (dấu + để kết hợp)
        tesseract.setLanguage("vie+eng");

        // 3. Chọn LSTM OCR Engine
        tesseract.setOcrEngineMode(1); // OEM_LSTM_ONLY

        // 4. Page segmentation mode:
        // - 6: Assume a single uniform block of text
        // - 3: Fully automatic page segmentation (if ảnh nhiều vùng text)
        tesseract.setPageSegMode(6);

        // 5. Một số biến cấu hình thêm nếu cần
        tesseract.setTessVariable("user_defined_dpi", "300"); // Giả định ảnh có độ phân giải cao
        tesseract.setTessVariable("preserve_interword_spaces", "1"); // Giữ khoảng trắng giữa từ

        try {
            String result = tesseract.doOCR(new File(imagePath));
            return result != null ? result.trim() : "";
        } catch (TesseractException e) {
            e.printStackTrace();
            return null;
        }
    }


    // -------------------------
    // Field extraction helpers (regex + heuristics)
    // -------------------------
    private static String extractCCCD(String text) {
        if (text == null) return "Không tìm thấy";
        String compact = text.replaceAll("[^0-9]", "");
        Matcher m12 = Pattern.compile("\\b(\\d{12})\\b").matcher(text);
        if (m12.find()) return m12.group(1);
        if (compact.length() >= 12) {
            Matcher m = Pattern.compile("(\\d{12})").matcher(compact);
            if (m.find()) return m.group(1);
        }
        Matcher m9 = Pattern.compile("\\b(\\d{9})\\b").matcher(text);
        if (m9.find()) return m9.group(1);
        return "Không tìm thấy";
    }

    private static String extractDOB(String text) {
        if (text == null) return "Không tìm thấy";
        Matcher m = Pattern.compile("(\\d{2}[\\/\\-\\.]\\d{2}[\\/\\-\\.]\\d{4})").matcher(text);
        if (m.find()) return m.group(1);
        m = Pattern.compile("(?i)(Ngay sinh|Ngày sinh|Date of birth)[^0-9\\n\\r]*([0-9]{2}[\\/\\-\\.]?[0-9]{2}[\\/\\-\\.]?[0-9]{4})").matcher(text);
        if (m.find()) return m.group(2);
        return "Không tìm thấy";
    }

    private static String extractName(String text) {
        if (text == null) return "Không tìm thấy";
        Matcher m = Pattern.compile("(?i)(Họ và tên|HỌ TÊN|Họ tên|Full name|Name)[:\\-\\s]*([\\p{L} \\-\\u00C0-\\u017F]+)").matcher(text);
        if (m.find()) {
            String name = m.group(2).trim();
            return name.replaceAll("\\s+", " ");
        }
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            String clean = line.trim();
            if (clean.length() >= 5) {
                int upper = countUppercase(clean);
                if (upper >= Math.min(3, Math.max(3, clean.length()/4))) {
                    return clean.replaceAll("[^\\p{L} \\-]", "").replaceAll("\\s+", " ").trim();
                }
            }
        }
        return "Không tìm thấy";
    }

    private static String extractGender(String text) {
        if (text == null) return "Không tìm thấy";
        Matcher m = Pattern.compile("(?i)\\b(Nam|Nữ|Nu|Male|Female)\\b").matcher(text);
        if (m.find()) {
            String g = m.group(1);
            if (g.equalsIgnoreCase("Nu")) return "Nữ";
            return g;
        }
        return "Không tìm thấy";
    }

    private static String extractAddress(String text) {
        if (text == null) return "Không tìm thấy";
        Matcher m = Pattern.compile("(?i)(Nơi thường trú|Nơi thường trú:|Địa chỉ|Address|Place of residence)[^\\n\\r]*[:\\-]?\\s*(.+)").matcher(text);
        if (m.find()) {
            String a = m.group(2);
            if (a.contains("\n")) a = a.split("\\n")[0];
            a = a.trim();
            if (a.length() > 0) return a.replaceAll("\\s+", " ");
        }
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            if (line.toLowerCase().contains("thành phố") || line.toLowerCase().contains("tp") ||
                    line.toLowerCase().contains("phường") || line.toLowerCase().contains("quận") ||
                    line.toLowerCase().contains("tỉnh")) {
                return line.trim().replaceAll("[^\\p{L}0-9,\\s\\-]", "").replaceAll("\\s+", " ");
            }
        }
        return "Không tìm thấy";
    }

    private static int countUppercase(String s) {
        int c = 0;
        for (char ch : s.toCharArray()) if (Character.isUpperCase(ch)) c++;
        return c;
    }
}
