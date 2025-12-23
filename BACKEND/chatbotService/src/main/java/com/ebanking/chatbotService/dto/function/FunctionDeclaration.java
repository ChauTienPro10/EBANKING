package com.ebanking.chatbotService.dto.function;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FunctionDeclaration {
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("parameters")
    private FunctionParameters parameters;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FunctionParameters {
        
        @JsonProperty("type")
        private String type = "object";
        
        @JsonProperty("properties")
        private Map<String, PropertySchema> properties;
        
        @JsonProperty("required")
        private String[] required;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertySchema {
        
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("description")
        private String description;
        
        @JsonProperty("enum")
        private String[] enumValues;
    }
}