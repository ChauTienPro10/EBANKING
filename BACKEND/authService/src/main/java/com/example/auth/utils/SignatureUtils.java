package com.example.auth.utils;
import com.example.auth.dto.request.TransferRequest;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.*;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class SignatureUtils {

    /**
     * Xác thực chữ ký RSA SHA256
     * @param payload Chuỗi payload đã canonical
     * @param base64Signature Chữ ký Base64 do client gửi
     * @param base64PublicKey Public key Base64 của client
     * @return true nếu chữ ký hợp lệ
     */
    public static boolean verifySignature(String payload, String base64Signature, String base64PublicKey) {
        try {
            // 1️⃣ Decode public key
            byte[] keyBytes = Base64.getDecoder().decode(base64PublicKey);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            PublicKey publicKey = kf.generatePublic(spec);

            // 2️⃣ Tạo đối tượng Signature
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(publicKey);
            signature.update(payload.getBytes());

            // 3️⃣ Decode chữ ký từ Base64
            byte[] signatureBytes = Base64.getDecoder().decode(base64Signature);

            // 4️⃣ Verify
            return signature.verify(signatureBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    public static String genPayloadTransactionString(
            TransferRequest request
    ) {
        return "FROM=" + request.getSenderAccountNumber() + "|"
                + "TO=" + request.getReceiverAccountNumber() + "|"
                + "AMOUNT=" + normalizeAmount(BigDecimal.valueOf(request.getAmount())) + "|"
                + "CCY=VND";
    }

    public static String normalizeAmount(BigDecimal amount) {
        return amount.setScale(0, RoundingMode.UNNECESSARY).toPlainString();
    }

    public static String normalizeDesc(String desc) {
        return desc == null
                ? ""
                : desc.trim()
                .replaceAll("\\s+", " ")
                .toUpperCase();
    }
}