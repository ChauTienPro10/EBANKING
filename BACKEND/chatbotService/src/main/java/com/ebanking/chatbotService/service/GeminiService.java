package com.ebanking.chatbotService.service;

import com.google.genai.Client;
import com.google.genai.errors.ClientException;
import com.google.genai.types.GenerateContentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value; // Cần thiết để đọc giá trị từ file properties

import java.math.BigDecimal;
import java.util.Objects;

@Slf4j
@Service
public class GeminiService {

    @Autowired UserService userService;
    @Autowired SavingAccountService savingAccountService;

    private final Client client; // Khai báo Client là final
    private final String model = "gemini-2.5-flash"; // Đặt tên model cố định

    // Sửa Constructor: Inject API Key và Khởi tạo Client
    public GeminiService(@Value("${gemini.api.key}") String apiKey) {
        // Kiểm tra Key để tránh lỗi nếu cấu hình sai
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalArgumentException("GEMINI API Key is missing or null. Please check application.properties.");
        }

        // Khởi tạo Client bằng builder (cách chính thức của thư viện)
        // SDK hiện tại cần API Key để khởi tạo.
        this.client = Client.builder().apiKey(apiKey).build();
    }

    public String generate(String prompt, String username) {

        String systemInstruction = """
            Bạn là chatbot ngân hàng.
            
            QUY TẮC BẮT BUỘC:
            1. Chỉ trả lời các câu hỏi liên quan đến tài chính – ngân hàng.
            2. Nếu câu hỏi có thể xử lý bằng hàm hệ thống:
               - CHỈ TRẢ VỀ TÊN HÀM VÀ THAM SỐ
               - KHÔNG giải thích
               - KHÔNG thêm văn bản thừa
            3. Nếu không có hàm nào phù hợp:
               - Trả lời trực tiếp cho người dùng, ngắn gọn, lịch sự.
            
            ĐỊNH DẠNG TRẢ VỀ KHI GỌI HÀM:
            - TênHàm tham_số_1 tham_số_2 ...
            - Các tham số PHẢI:
              - Được trích xuất trực tiếp từ câu hỏi người dùng
              - Có thể convert sang kiểu số (Integer, BigDecimal)
              - KHÔNG dùng ký tự đặc biệt, KHÔNG dùng chữ thay cho số
            
            DANH SÁCH HÀM HỆ THỐNG:
            - getUserId
              → Khi người dùng hỏi userId, mã khách hàng
            
            - getUserInfo
              → Khi người dùng muốn xem toàn bộ thông tin cá nhân
            
            - getBalanceAccountPay
              → Khi người dùng hỏi số dư tài khoản thanh toán
            
            - getActiveInterestRatesAsString
              → Khi người dùng hỏi:
                "lãi suất tiết kiệm",
                "các gói tiết kiệm",
                "hạn mức tiết kiệm"
            
            - calculateAndDisplayExpectedInterest
              → Khi người dùng hỏi:
                "Tính lãi suất",
                "Lãi suất theo số tiền và loại kỳ hạn"
              → amount: Số tiền (Bigdecimal)
              → termMonths: kỳ hạn (Integer)
            
            - getApplicableInterestRateAsString [termMonths] [amount]
              → Khi người dùng cung cấp:
                + kỳ hạn (tháng)
                + số tiền gửi
              → termMonths: số tháng (Integer)
              → amount: số tiền (BigDecimal, KHÔNG dấu phẩy, KHÔNG chữ)
            
            - getTotalInterestEarnedAsString
              → Khi người dùng hỏi:
                "tổng lãi đã nhận",
                "lãi đã kiếm được",
                "tổng lãi từ tiết kiệm"
            
            - getCurrentMonthInterestRatesAsString
              → Khi người dùng hỏi:
                "lãi suất tháng này",
                "lãi suất hiện tại",
                "lãi suất mới nhất"
            
            - getUserSavingsAndInterestSummary
              → Khi người dùng hỏi:
                "tóm tắt tiết kiệm",
                "thông tin tiết kiệm của tôi",
                "tài khoản tiết kiệm"
            
            VÍ DỤ:
            - "Gửi 100 triệu kỳ hạn 6 tháng lãi bao nhiêu"
              → getApplicableInterestRateAsString 6 100000000
            
            - "Lãi suất tiết kiệm hiện nay"
              → getActiveInterestRatesAsString
              
            - "Tổng lãi tôi đã nhận được"
              → getTotalInterestEarnedAsString
              
            - "Lãi suất tháng này như thế nào"
              → getCurrentMonthInterestRatesAsString
              
            - "Tài khoản tiết kiệm của tôi"
              → getUserSavingsAndInterestSummary
            """;

        try {
            GenerateContentResponse response = client.models.generateContent(
                    model,
                    systemInstruction + "\nCâu hỏi: " + prompt,
                    null
            );

            String aiResult = Objects.requireNonNull(response.text()).trim();

            return executeFunction(aiResult, username);

        } catch (ClientException ex) {
            if (ex.code() == 429) {
                return "Hệ thống đang bận, vui lòng thử lại sau ít phút.";
            }
            throw ex;
        }
    }

    public String executeFunction(String text, String username) {
//        String answer;
        Long userId = userService.getUserId(username);
        if (text.contains("getApplicableInterestRateAsString")) {
            String[] parts = text.trim().split("\\s+");
            String function = parts[0];

            try {
                int term = Integer.parseInt(parts[1]);
                long amount = Long.parseLong(parts[2]);
                return savingAccountService.getApplicableInterestRateAsString(term, BigDecimal.valueOf(amount));
            } catch (Exception e) {
                return savingAccountService.getActiveInterestRatesAsString();
            }


        }
        if (text.contains("calculateAndDisplayExpectedInterest")) {
            String[] parts = text.trim().split("\\s+");
            String function = parts[0];

            try {
                int term = Integer.parseInt(parts[1]);
                long amount = Long.parseLong(parts[2]);
                return savingAccountService.calculateAndDisplayExpectedInterest(BigDecimal.valueOf(amount), term );
            } catch (Exception e) {
                log.info(e.getMessage());
                return "Không thể tính lãi suất";
            }
        }
        else {
            switch (text) {
                case "getUserId": // tra loi cau hoi id
                    return  "ID của bạn là: " + userService.getUserId(username);
                case "getActiveInterestRatesAsString":
                    return savingAccountService.getActiveInterestRatesAsString();
                case "getTotalInterestEarnedAsString":
                    return savingAccountService.getTotalInterestEarnedAsString(userId);
                case "getCurrentMonthInterestRatesAsString":
                    return savingAccountService.getCurrentMonthInterestRatesAsString();
                case "getUserSavingsAndInterestSummary":
                    return savingAccountService.getUserSavingsAndInterestSummary(userId);
                default:
                    return text;
            }
        }


//        String promt =
//                """
//                Đây là phản hổi từ phía hệ thống của tôi bao gồm
//                1- Phần câu hỏi của khách hàng: [%s]
//                2- Phần trả lời từ hệ thống của tôi: [%s]
//                => Hãy dựa vào 2 thông tin trên đê tạo 1 câu trả lời phù hợp cho người dùng theo các tiêu chí dưới đây
//                - Bạn là một chatbot trả lời ngắn gọn và xúc tích.
//                - Chỉ trả lời các câu hỏi về lĩnh vực tài chính – ngân hàng.
//                - Các câu hỏi ngoài luồng thì từ chối lịch sự.
//                - Nếu hệ thống của tôi không có câu trả lời bạn hãy làm thay nó.
//                """.formatted(originText, answer);
//
//        System.out.printf(promt);
//        int maxRetry = 3;
//        int delay = 500;
//        for (int i = 0; i < maxRetry; i++) {
//            try {
//                GenerateContentResponse response = client.models.generateContent(
//                        model,
//                        promt,
//                        null
//                );
//
//                return Objects.requireNonNull(response.text()).trim();
//
//            } catch (Exception ex) {
//                if (ex.getMessage() != null && ex.getMessage().contains("503")) {
//                    // Google Gemini overloaded — retry
//                    try {
//                        Thread.sleep(delay);
//                    } catch (InterruptedException e) {
//                        Thread.currentThread().interrupt();
//                    }
//                    delay *= 2; // exponential backoff
//                    continue;
//                }
//                throw ex; // lỗi khác -> quăng ra
//            }
//        }
//
//        return "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.";
//
    }

}