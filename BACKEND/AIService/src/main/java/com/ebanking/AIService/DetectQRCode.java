package com.ebanking.AIService;

import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.objdetect.QRCodeDetector;

public class DetectQRCode {

    // Thay đường dẫn này thành đường dẫn DLL OpenCV trên máy bạn
    private static final String OPENCV_DLL_PATH = "C:/Users/chaud/OneDrive/Desktop/DATN/opencv/build/java/x64/opencv_java4120.dll";

    static {
        System.load(OPENCV_DLL_PATH);
    }

    public static void main(String[] args) {
        String imagePath = "C:/Users/chaud/Downloads/cccd.png";  // Thay bằng đường dẫn ảnh của bạn
        String outputAnnotated = "cccd_qr_annotated.png";        // Ảnh có khung QR code
        String outputCropped = "cccd_qr_cropped.png";            // Ảnh vùng QR code cắt riêng

        Mat image = Imgcodecs.imread(imagePath);
        System.out.println("Ảnh kích thước: " + image.cols() + "x" + image.rows());
        if (image.empty()) {
            System.out.println("Không thể đọc ảnh: " + imagePath);
            return;
        }


        Mat gray = new Mat();
        Imgproc.cvtColor(image, gray, Imgproc.COLOR_BGR2GRAY);
        Imgproc.equalizeHist(gray, gray);
        String qrContent = extractQRCode(gray, outputAnnotated, outputCropped);

        if (qrContent.isEmpty()) {
            System.out.println("Không phát hiện mã QR trong ảnh.");
        } else {
            System.out.println("✅ Nội dung QR code: " + qrContent);
            System.out.println("Ảnh đã lưu: " + outputAnnotated + " và " + outputCropped);
        }
    }

    public static String extractQRCode(Mat src, String outputAnnotated, String outputCropped) {
        QRCodeDetector detector = new QRCodeDetector();
        Mat points = new Mat();
        String decodedText = detector.detectAndDecode(src, points);

        if (decodedText == null || decodedText.isEmpty()) {
            return "";
        }

        if (!points.empty() && points.cols() == 4) {
            Point[] qrCorners = new Point[4];
            for (int i = 0; i < 4; i++) {
                double[] coord = points.get(0, i);
                qrCorners[i] = new Point(coord[0], coord[1]);
            }

            // Vẽ khung bao quanh QR code
            for (int i = 0; i < 4; i++) {
                Imgproc.line(src, qrCorners[i], qrCorners[(i + 1) % 4], new Scalar(0, 255, 0), 3);
            }

            if (outputAnnotated != null && !outputAnnotated.isEmpty()) {
                Imgcodecs.imwrite(outputAnnotated, src);
            }

            // Cắt vùng QR code ra riêng
            Rect rect = Imgproc.boundingRect(new MatOfPoint(qrCorners));
            Mat qrRegion = new Mat(src, rect);

            if (outputCropped != null && !outputCropped.isEmpty()) {
                Imgcodecs.imwrite(outputCropped, qrRegion);
            }
        }

        return decodedText;
    }
}
