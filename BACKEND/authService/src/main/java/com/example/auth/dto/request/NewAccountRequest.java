package com.example.auth.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class NewAccountRequest {
    private String accountNumber;
    private String accountType;
    private Long userId;
}
