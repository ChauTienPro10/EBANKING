package com.ebanking.chatService.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingIndicatorRequest {
    @NotBlank(message = "Receiver ID is required")
    private String receiverId;
    
    @JsonProperty("isTyping")
    private boolean isTyping;
}
