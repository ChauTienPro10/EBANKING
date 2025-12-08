package com.banking.userService.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvatarUploadRequest {
    private String imageBase64; // Cropped and compressed image in base64 format
}
