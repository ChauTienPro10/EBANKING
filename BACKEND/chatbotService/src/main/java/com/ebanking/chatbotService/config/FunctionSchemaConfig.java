package com.ebanking.chatbotService.config;

import com.ebanking.chatbotService.dto.function.FunctionDeclaration;
import com.ebanking.chatbotService.dto.function.FunctionDeclaration.FunctionParameters;
import com.ebanking.chatbotService.dto.function.FunctionDeclaration.PropertySchema;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class FunctionSchemaConfig {

    /**
     * Định nghĩa các function schemas cho Gemini Function Calling
     * Chỉ tập trung vào user-related functions
     */
    @Bean
    public List<FunctionDeclaration> bankingFunctionDeclarations() {
        return List.of(
                createGetUserInfoFunction(),
                createGetUserIdFunction(),
                createGetUserDetailsWithIdFunction()
        );
    }

    /**
     * Function: Lấy thông tin user từ username
     */
    private FunctionDeclaration createGetUserInfoFunction() {
        Map<String, PropertySchema> properties = new HashMap<>();
        
        properties.put("username", PropertySchema.builder()
                .type("string")
                .description("Tên đăng nhập của người dùng cần lấy thông tin. Nếu không cung cấp, sẽ sử dụng username của người dùng hiện tại.")
                .build());

        return FunctionDeclaration.builder()
                .name("getUserInfo")
                .description("Lấy thông tin chi tiết của người dùng từ tên đăng nhập. Sử dụng khi khách hàng hỏi về thông tin cá nhân, hồ sơ, eKYC. Nếu khách hàng hỏi về 'thông tin của tôi', không cần truyền username.")
                .parameters(FunctionParameters.builder()
                        .type("object")
                        .properties(properties)
                        .required(new String[]{}) // Không bắt buộc username
                        .build())
                .build();
    }

    /**
     * Function: Lấy userId từ username
     */
    private FunctionDeclaration createGetUserIdFunction() {
        Map<String, PropertySchema> properties = new HashMap<>();
        
        properties.put("username", PropertySchema.builder()
                .type("string")
                .description("Tên đăng nhập cần lấy ID. Nếu không cung cấp, sẽ sử dụng username của người dùng hiện tại.")
                .build());

        return FunctionDeclaration.builder()
                .name("getUserId")
                .description("Lấy ID của người dùng từ tên đăng nhập. Sử dụng khi cần ID để thực hiện các thao tác khác. Nếu khách hàng hỏi về 'ID của tôi', không cần truyền username.")
                .parameters(FunctionParameters.builder()
                        .type("object")
                        .properties(properties)
                        .required(new String[]{}) // Không bắt buộc username
                        .build())
                .build();
    }

    /**
     * Function: Lấy thông tin chi tiết user bao gồm userId
     */
    private FunctionDeclaration createGetUserDetailsWithIdFunction() {
        Map<String, PropertySchema> properties = new HashMap<>();
        
        properties.put("username", PropertySchema.builder()
                .type("string")
                .description("Tên đăng nhập cần lấy thông tin chi tiết. Nếu không cung cấp, sẽ sử dụng username của người dùng hiện tại.")
                .build());

        return FunctionDeclaration.builder()
                .name("getUserDetailsWithId")
                .description("Lấy thông tin chi tiết của người dùng bao gồm cả userId để các service khác có thể sử dụng. Sử dụng khi cần userId để truy vấn thông tin từ các service khác như account, transaction, loan.")
                .parameters(FunctionParameters.builder()
                        .type("object")
                        .properties(properties)
                        .required(new String[]{}) // Không bắt buộc username
                        .build())
                .build();
    }
}