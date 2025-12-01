package com.ebanking.chatbotService.service;

import com.ebanking.chatbotService.enums.Topic;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value; // Cần thiết để đọc giá trị từ file properties

import java.util.Objects;

@Service
public class GeminiService {

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

    public String generate(String prompt) {
        String topicNameList = Topic.getTopicNamesAsString();

        // Tối ưu system prompt
        String systemInstruction =
                """
                Bạn là một chatbot trả lời ngắn gọn và xúc tích.
                Chỉ trả lời các câu hỏi về lĩnh vực tài chính – ngân hàng.
    
                1. Trước tiên hãy kiểm tra xem câu hỏi có liên quan đến một trong các topic sau:
                   %s
    
                2. Nếu khớp topic → chỉ trả lời duy nhất tên topic đó, và thêm tiền tố "INTERNAL_" phía trước.
                   (Ví dụ: INTERNAL_ThanhToan, INTERNAL_TietKiem...)
    
                3. Nếu câu hỏi không nằm trong topic nhưng vẫn thuộc phạm vi tài chính/ngân hàng → vui lòng trả lời bình thường.
    
                4. Nếu câu hỏi nằm ngoài phạm vi tài chính/ngân hàng → từ chối lịch sự.
    
                5. Hãy phản hồi bằng đúng ngôn ngữ mà người dùng sử dụng.
    
                Đây là câu hỏi của người dùng:
                """.formatted(topicNameList);

        int maxRetry = 5;
        int delay = 500;  // ms

        for (int i = 0; i < maxRetry; i++) {
            try {
                GenerateContentResponse response = client.models.generateContent(
                        model,
                        systemInstruction + "\n" + prompt,
                        null
                );

                String answer = Objects.requireNonNull(response.text()).trim();

                // Kiểm tra INTERNAL
                if (answer.contains("INTERNAL_")) {
                    String topic = answer.replace("INTERNAL_", "").trim();
                    return Topic.getSafeResponseByTopicName(topic);
                }

                return answer;

            } catch (Exception ex) {
                if (ex.getMessage() != null && ex.getMessage().contains("503")) {
                    // Google Gemini overloaded — retry
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                    delay *= 2; // exponential backoff
                    continue;
                }
                throw ex; // lỗi khác -> quăng ra
            }
        }

        return "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.";
    }

}