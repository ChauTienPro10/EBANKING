package com.ebanking.chatbotService.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value; // Cần thiết để đọc giá trị từ file properties

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

        String systemInstruction = "Bạn là một chatbot trả lời ngắn gọn xúc tích, "
                + "Chỉ trả lời các câu hỏi về lĩnh vực tài chính ngận hàng,"
                + "Đối với các câu hỏi ngoài luồn làm ơn hãy từ chối 1 cách khéo léo"
                + "Nếu người câu hỏi là ngôn ngữ nào thì hãy phản hồi bằng ngôn ngữ đó"
                + "Dưới đây là phần câu hỏi: ";
        // Sử dụng client đã khởi tạo
        GenerateContentResponse response =
                this.client.models.generateContent(
                        model,
                        systemInstruction + ": " + prompt,
                        null);

        return response.text();
    }
}