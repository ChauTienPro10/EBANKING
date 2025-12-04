package com.ebanking.admintool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * User Detail Response for Admin
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String citizenId;
    private String birthday;
    private Boolean isMale;
    private String address;
    private String createAt;
    private List<String> roles;
    private String status;
    
    // Account information
    private List<AccountInfo> accounts;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountInfo {
        private Long accountId;
        private String accountNumber;
        private String accountType;
        private String balance;
        private String currency;
        private String status;
        private String openedDate;
    }
}

