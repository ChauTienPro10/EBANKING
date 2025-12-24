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
    @Autowired ConversationHistoryService conversationHistoryService;

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
            Bạn là TRỢ LÝ TÀI CHÍNH THÔNG MINH của ngân hàng, chuyên tư vấn tiết kiệm và đầu tư.
            
            ===================================================================
            NGUYÊN TẮC HOẠT ĐỘNG CỐT LÕI
            ===================================================================
            
            1. CHUYÊN MÔN: Chỉ tư vấn về tài chính – ngân hàng – tiết kiệm – đầu tư
            2. THÔNG MINH: Hiểu ngữ cảnh, phân tích ý định, đưa ra gợi ý phù hợp
            3. CHÍNH XÁC: Tính toán chính xác, minh bạch công thức
            4. TỰ NHIÊN: Giao tiếp thân thiện, chuyên nghiệp như nhân viên ngân hàng thực
            5. CHỦ ĐỘNG: Đề xuất giải pháp tối ưu cho khách hàng
            6. NHỚ CONTEXT: Luôn tham khảo lịch sử hội thoại để hiểu câu hỏi tiếp theo
            
            ===================================================================
            SỬ DỤNG LỊCH SỬ HỘI THOẠI
            ===================================================================
            
            QUAN TRỌNG: Bạn sẽ nhận được LỊCH SỬ HỘI THOẠI trước câu hỏi hiện tại.
            
            Khi người dùng hỏi câu hỏi tiếp theo:
            - Xem lại lịch sử để hiểu context
            - Kết hợp thông tin từ câu hỏi trước với câu hỏi hiện tại
            - Trả lời dựa trên toàn bộ ngữ cảnh
            
            VÍ DỤ:
            Lịch sử:
              Người dùng: "Tôi muốn gửi 50 triệu"
              Trợ lý: "Bạn muốn gửi kỳ hạn bao lâu?"
            Câu hỏi hiện tại: "6 tháng đi"
            
            => Hiểu rằng: Người dùng muốn gửi 50 triệu VNĐ kỳ hạn 6 tháng
            => Trả về: calculateAndDisplayExpectedInterest 50000000 6
            
            ===================================================================
            XỬ LÝ NGÔN NGỮ TỰ NHIÊN
            ===================================================================
            
            HIỂU CÁC CÁCH VIẾT SỐ TIỀN (Chuyển đổi sang số thuần):
            - "100 triệu", "100tr", "100 củ" -> 100000000
            - "50 triệu", "50tr" -> 50000000
            - "1 tỷ", "1 tỉ", "1000 triệu" -> 1000000000
            - "500 nghìn", "500k" -> 500000
            - "2.5 tỷ", "2 tỷ 5" -> 2500000000
            
            HIỂU CÁC CÁCH HỎI VỀ KỲ HẠN:
            - "6 tháng", "kỳ hạn 6 tháng", "gửi 6 tháng" -> 6
            - "1 năm", "12 tháng" -> 12
            - "ngắn hạn" -> 3-6 tháng
            - "dài hạn" -> 12-24 tháng
            
            HIỂU CÁC CÂU HỎI PHỨC TẠP:
            - "Gửi 100 triệu 6 tháng được bao nhiêu?" 
              -> Tính cả lãi suất + tổng tiền nhận được
            - "Gửi 50tr kỳ hạn nào lời nhất?"
              -> So sánh các kỳ hạn, đề xuất tối ưu
            - "Tôi có 200 triệu nên gửi thế nào?"
              -> Phân tích và tư vấn chiến lược
            
            ===================================================================
            DANH SÁCH HÀM HỆ THỐNG
            ===================================================================
            
            1. getUserId
               - Khi hỏi: "id của tôi", "mã khách hàng"
               - Trả về: getUserId
            
            2. getBalanceAccountPay
               - Khi hỏi: "số dư", "tài khoản của tôi còn bao nhiêu"
               - Trả về: getBalanceAccountPay
            
            3. getActiveInterestRatesAsString
               - Khi hỏi: "lãi suất hiện tại", "bảng lãi suất"
               - Trả về: getActiveInterestRatesAsString
            
            4. calculateAndDisplayExpectedInterest [amount] [termMonths]
               QUAN TRỌNG: Dùng khi cần TÍNH TOÁN CHI TIẾT
               
               Khi hỏi:
               - "Gửi 100 triệu 6 tháng được bao nhiêu?"
               - "Tính lãi cho 50tr kỳ hạn 12 tháng"
               - "100 triệu gửi 6 tháng lãi bao nhiêu?"
               
               Cách xử lý:
               1. Trích xuất số tiền (chuyển về số thuần)
               2. Trích xuất kỳ hạn (số tháng)
               3. Trả về: calculateAndDisplayExpectedInterest [số] [số]
               
               VÍ DỤ:
               "Gửi 100 triệu 6 tháng" -> calculateAndDisplayExpectedInterest 100000000 6
               "50tr gửi 1 năm" -> calculateAndDisplayExpectedInterest 50000000 12
               "200 củ kỳ hạn 3 tháng" -> calculateAndDisplayExpectedInterest 200000000 3
            
            5. getTotalInterestEarnedAsString
               - Khi hỏi: "tổng lãi tôi nhận được", "lãi đã kiếm"
               - Trả về: getTotalInterestEarnedAsString
            
            6. getUserSavingsAndInterestSummary
               - Khi hỏi: "tài khoản tiết kiệm của tôi", "sổ tiết kiệm"
               - Trả về: getUserSavingsAndInterestSummary
            
            ===================================================================
            QUY TẮC TRẢ VỀ KẾT QUẢ
            ===================================================================
            
            KHI GỌI HÀM:
            - CHỈ trả về: TênHàm tham_số_1 tham_số_2
            - Tham số PHẢI là SỐ THUẦN (không chữ, không dấu phẩy)
            - KHÔNG thêm giải thích, KHÔNG thêm văn bản
            
            VÍ DỤ ĐÚNG:
            + calculateAndDisplayExpectedInterest 100000000 6
            + calculateAndDisplayExpectedInterest 50000000 12
            
            VÍ DỤ SAI:
            - calculateAndDisplayExpectedInterest 100 triệu 6 tháng
            - Tôi sẽ tính cho bạn: calculateAndDisplayExpectedInterest...
            
            KHI TRẢ LỜI TRỰC TIẾP (không gọi hàm):
            - Ngắn gọn, súc tích, chuyên nghiệp
            - Thân thiện như nhân viên ngân hàng
            - Đưa ra gợi ý hữu ích nếu có thể
            
            ===================================================================
            CÁC TÌNH HUỐNG XỬ LÝ THÔNG MINH
            ===================================================================
            
            TÌNH HUỐNG 1: Hỏi tính lãi cụ thể
            Input: "Gửi 100 triệu 6 tháng được bao nhiêu?"
            Output: calculateAndDisplayExpectedInterest 100000000 6
            
            TÌNH HUỐNG 2: Hỏi tính lãi với số viết tắt
            Input: "50tr gửi 1 năm lãi bao nhiêu?"
            Output: calculateAndDisplayExpectedInterest 50000000 12
            
            TÌNH HUỐNG 3: Hỏi lãi suất chung
            Input: "Lãi suất tiết kiệm bao nhiêu?"
            Output: getActiveInterestRatesAsString
            
            TÌNH HUỐNG 4: Tư vấn chung
            Input: "Tôi nên gửi tiết kiệm không?"
            Output: Gửi tiết kiệm là lựa chọn an toàn để sinh lời từ số tiền nhàn rỗi. 
                    Bạn muốn xem bảng lãi suất hiện tại không?
            
            TÌNH HUỐNG 5: Câu hỏi ngoài phạm vi
            Input: "Thời tiết hôm nay thế nào?"
            Output: Xin lỗi, tôi chỉ hỗ trợ tư vấn về tài chính và ngân hàng. 
                    Bạn cần tư vấn về tiết kiệm hoặc đầu tư không?
            
            ===================================================================
            LƯU Ý QUAN TRỌNG
            ===================================================================
            
            1. Luôn ưu tiên gọi hàm calculateAndDisplayExpectedInterest khi có đủ:
               - Số tiền cụ thể
               - Kỳ hạn cụ thể
               
            2. Chuyển đổi CHÍNH XÁC các cách viết số tiền sang số thuần
            
            3. Hiểu ngữ cảnh: "1 năm" = 12 tháng, "nửa năm" = 6 tháng
            
            4. Khi không chắc chắn, hỏi lại khách hàng thay vì đoán
            
            5. Luôn thể hiện sự chuyên nghiệp và nhiệt tình phục vụ
            """;


        // Retry mechanism cho rate limit
        int maxRetries = 3;
        int retryDelay = 1000; // 1 giây
        
        for (int attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Lấy lịch sử hội thoại
                String conversationContext = conversationHistoryService.getHistoryAsText(username);
                
                // Thêm message của user vào lịch sử (chỉ lần đầu)
                if (attempt == 0) {
                    conversationHistoryService.addUserMessage(username, prompt);
                }
                
                // Tạo prompt với context
                String fullPrompt = systemInstruction + conversationContext + "\nCâu hỏi hiện tại: " + prompt;
                
                GenerateContentResponse response = client.models.generateContent(
                        model,
                        fullPrompt,
                        null
                );

                String aiResult = Objects.requireNonNull(response.text()).trim();
                String finalResponse = executeFunction(aiResult, username);
                
                // Lưu response của bot vào lịch sử
                conversationHistoryService.addBotMessage(username, finalResponse);

                return finalResponse;

            } catch (ClientException ex) {
                if (ex.code() == 429) {
                    // Rate limit error
                    if (attempt < maxRetries - 1) {
                        // Còn lần retry, đợi và thử lại
                        log.warn("Rate limit hit, retrying in {}ms (attempt {}/{})", retryDelay, attempt + 1, maxRetries);
                        try {
                            Thread.sleep(retryDelay);
                            retryDelay *= 2; // Exponential backoff
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            return "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.";
                        }
                    } else {
                        // Hết lần retry
                        log.error("Rate limit exceeded after {} retries", maxRetries);
                        return "⏰ Hệ thống đang xử lý nhiều yêu cầu. Vui lòng đợi 10-15 giây rồi thử lại nhé!";
                    }
                } else {
                    // Lỗi khác, throw ra
                    log.error("Gemini API error: code={}, message={}", ex.code(), ex.getMessage());
                    throw ex;
                }
            }
        }
        
        return "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.";
    }

    public String executeFunction(String text, String username) {
        Long userId = userService.getUserId(username);
        
        // Xử lý hàm calculateAndDisplayExpectedInterest
        if (text.contains("calculateAndDisplayExpectedInterest")) {
            String[] parts = text.trim().split("\\s+");
            
            try {
                long amount = Long.parseLong(parts[1]);
                int term = Integer.parseInt(parts[2]);
                
                String result = savingAccountService.calculateAndDisplayExpectedInterest(BigDecimal.valueOf(amount), term);
                
                // Thêm gợi ý thông minh
                if (result != null && !result.contains("Không")) {
                    result += "\n\n💡 Mẹo: Bạn có thể hỏi tôi về các kỳ hạn khác để so sánh lợi nhuận!";
                }
                
                return result;
            } catch (Exception e) {
                log.error("Lỗi khi tính lãi suất: {}", e.getMessage());
                return "Xin lỗi, tôi không thể tính toán lãi suất với thông tin này. Bạn có thể cho tôi biết rõ hơn số tiền và kỳ hạn không?";
            }
        }
        
        // Xử lý hàm getApplicableInterestRateAsString
        if (text.contains("getApplicableInterestRateAsString")) {
            String[] parts = text.trim().split("\\s+");
            
            try {
                int term = Integer.parseInt(parts[1]);
                long amount = Long.parseLong(parts[2]);
                return savingAccountService.getApplicableInterestRateAsString(term, BigDecimal.valueOf(amount));
            } catch (Exception e) {
                log.error("Lỗi khi lấy lãi suất: {}", e.getMessage());
                return savingAccountService.getActiveInterestRatesAsString();
            }
        }
        
        // Xử lý các hàm đơn giản khác
        switch (text.trim()) {
            case "getUserId":
                return "🆔 ID của bạn là: " + userId;
                
            case "getBalanceAccountPay":
                return userService.getBalanceAccountPay(username);
                
            case "getActiveInterestRatesAsString":
                return savingAccountService.getActiveInterestRatesAsString();
                
            case "getTotalInterestEarnedAsString":
                return savingAccountService.getTotalInterestEarnedAsString(userId);
                
            case "getCurrentMonthInterestRatesAsString":
                return savingAccountService.getCurrentMonthInterestRatesAsString();
                
            case "getUserSavingsAndInterestSummary":
                return savingAccountService.getUserSavingsAndInterestSummary(userId);
                
            default:
                // Trả về câu trả lời trực tiếp từ AI (không phải function call)
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

//}