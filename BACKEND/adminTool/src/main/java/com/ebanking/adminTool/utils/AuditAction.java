package com.ebanking.adminTool.utils;

 public enum AuditAction {
     LOGIN,
     VIEW_DASHBOARD,
     LIST_ADMINS,
     CREATE_ADMIN,
     UPDATE_ADMIN,
     DEACTIVATE_ADMIN,
     RESET_PASSWORD,
     CHANGE_PASSWORD,
     REFRESH_TOKEN,
     LOCK_ACCOUNT,
     UNLOCK_ACCOUNT,
     PUSH_NOTIFICATION,
     PUSH_NOTIFICATION_BULK,
     VIEW_TRANSACTIONS,
     VIEW_USERS,
     VIEW_SYSTEM_INFO;

    public String code() {
        return name();
    }
}


