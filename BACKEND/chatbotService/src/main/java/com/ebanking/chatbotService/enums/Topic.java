package com.ebanking.chatbotService.enums;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;
import java.util.stream.Collectors;

public enum Topic {

    // 1. Cần truy vấn Dữ liệu cá nhân theo thời gian thực (API Integration)
    CHECK_ACCOUNT_BALANCE(
            "KIỂM_TRA_SỐ_DƯ",
            "Để bảo mật thông tin, tôi không thể truy vấn số dư tài khoản của bạn trực tiếp. Vui lòng đăng nhập vào ứng dụng di động hoặc cổng ngân hàng điện tử của bạn để kiểm tra số dư hiện tại."
    ),

    // 2. Cần thực hiện Giao dịch hoặc Thay đổi trạng thái (API Integration)
    EXECUTE_FUNDS_TRANSFER(
            "THỰC_HIỆN_CHUYỂN_KHOẢN",
            "Tôi không được ủy quyền để thực hiện giao dịch chuyển khoản. Vui lòng sử dụng tính năng chuyển khoản trong ứng dụng di động hoặc cổng ngân hàng điện tử để đảm bảo bảo mật và xác thực."
    ),

    // 3. Cần Quy trình Bảo mật nghiêm ngặt (Redirect to Secure Process)
    REQUEST_PASSWORD_RESET(
            "YÊU_CẦU_ĐẶT_LẠI_MẬT_KHẨU",
            "Việc đặt lại mật khẩu cần quy trình xác minh bảo mật. Vui lòng truy cập trang 'Quên mật khẩu' trên cổng đăng nhập hoặc liên hệ trực tiếp tổng đài của chúng tôi để được hỗ trợ nhanh nhất."
    ),

    // 4. Cần Dữ liệu nhạy cảm cá nhân (API Integration)
    CHECK_PERSONAL_CREDIT_LIMIT(
            "KIỂM_TRA_HẠN_MỨC_CÁ_NHÂN",
            "Hạn mức tín dụng là thông tin cá nhân. Vui lòng đăng nhập vào mục quản lý thẻ trên ngân hàng điện tử để xem hạn mức chính xác và các ưu đãi liên quan."
    ),

    // 5. Cần Can thiệp khẩn cấp của con người (Security/Compliance Guardrail)
    REPORT_FRAUD_ACTIVITY(
            "BÁO_CÁO_HOẠT_ĐỘNG_GIAN_LẬN",
            "Đây là vấn đề khẩn cấp. Vui lòng gọi ngay đến đường dây nóng chống gian lận của ngân hàng: [Số điện thoại] hoặc khóa tài khoản/thẻ ngay lập tức qua ứng dụng di động để được hỗ trợ tức thời."
    );



    private final String description;
    private final String safeResponse;

    Topic(String description, String safeResponse) {
        this.description = description;
        this.safeResponse = safeResponse;
    }

    public String getDescription() {
        return description;
    }

    public String getSafeResponse() {
        return safeResponse;
    }

    public static String topicsToJsonGson() {
        JsonArray jsonArray = new JsonArray();

        // Lặp qua tất cả các giá trị trong enum Topic
        for (Topic topic : Topic.values()) {
            JsonObject jsonObject = new JsonObject();

            // Thêm các thuộc tính vào JsonObject
            jsonObject.addProperty("topic_key", topic.name());
            jsonObject.addProperty("description", topic.getDescription());
            jsonObject.addProperty("safe_response", topic.getSafeResponse());

            // Thêm Object vào Array
            jsonArray.add(jsonObject);
        }

        // Sử dụng Gson để chuyển JsonArray thành chuỗi JSON
        Gson gson = new Gson();
        return gson.toJson(jsonArray);
    }

    public static String getTopicNamesAsString() {
        return Arrays.stream(Topic.values()) // Tạo stream từ mảng các giá trị Topic
                .map(Topic::name)        // Chuyển đổi từng giá trị Topic thành tên chuỗi (ví dụ: CHECK_ACCOUNT_BALANCE)
                .collect(Collectors.joining(",")); // Nối tất cả các chuỗi lại bằng dấu phẩy
    }

    public static String getSafeResponseByTopicName(String topicName) {
        if (topicName == null || topicName.trim().isEmpty()) {
            return "Lỗi: Tên Topic không được để trống.";
        }

        try {
            // Sử dụng valueOf() để chuyển đổi chuỗi thành giá trị enum
            Topic topic = Topic.valueOf(topicName.toUpperCase());
            // Trả về safeResponse tương ứng
            return topic.getSafeResponse();
        } catch (IllegalArgumentException e) {
            // Bắt lỗi nếu tên Topic không tồn tại trong enum
            return "Lỗi: Topic '" + topicName + "' không hợp lệ hoặc không được hỗ trợ.";
        }
    }
}