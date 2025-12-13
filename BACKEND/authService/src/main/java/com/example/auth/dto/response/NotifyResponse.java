package com.example.auth.dto.response;

import lombok.Data;

@Data
public class NotifyResponse<T> {
    T data;
    boolean seen;
}
