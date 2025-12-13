package com.ebanking.admintool.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SystemInfoResponse {
    private String health;
    private String version;
    private long uptimeSeconds;
    private long totalActiveStaff;
    private long totalLoginsToday;
}

