export interface SystemSettings {
  general: {
    appName: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    passwordMinLength: number;
    auditLogRetention: number; // days
  };
  bankingLimits: {
    transferLimit: number;
    dailyTransferLimit: number;
    withdrawalLimit: number;
    dailyWithdrawalLimit: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
  };
}

let settingsData: SystemSettings = {
  general: {
    appName: "eBanking Console",
    maintenanceMode: false,
    maintenanceMessage: "System is under maintenance",
  },
  security: {
    twoFactorEnabled: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    auditLogRetention: 90,
  },
  bankingLimits: {
    transferLimit: 100000000, // 100M VND
    dailyTransferLimit: 500000000, // 500M VND
    withdrawalLimit: 50000000, // 50M VND
    dailyWithdrawalLimit: 200000000, // 200M VND
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: false,
  },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSettings(): Promise<SystemSettings> {
  await delay(200);
  return { ...settingsData };
}

export async function updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
  await delay(400 + Math.random() * 400);
  settingsData = {
    ...settingsData,
    ...updates,
    general: { ...settingsData.general, ...(updates.general || {}) },
    security: { ...settingsData.security, ...(updates.security || {}) },
    bankingLimits: { ...settingsData.bankingLimits, ...(updates.bankingLimits || {}) },
    notifications: { ...settingsData.notifications, ...(updates.notifications || {}) },
  };
  return { ...settingsData };
}

export async function updateGeneralSettings(updates: Partial<SystemSettings["general"]>): Promise<SystemSettings> {
  await delay(300);
  settingsData.general = { ...settingsData.general, ...updates };
  return { ...settingsData };
}

export async function updateSecuritySettings(updates: Partial<SystemSettings["security"]>): Promise<SystemSettings> {
  await delay(300);
  settingsData.security = { ...settingsData.security, ...updates };
  return { ...settingsData };
}

export async function updateBankingLimits(updates: Partial<SystemSettings["bankingLimits"]>): Promise<SystemSettings> {
  await delay(300);
  settingsData.bankingLimits = { ...settingsData.bankingLimits, ...updates };
  return { ...settingsData };
}

export async function updateNotificationSettings(updates: Partial<SystemSettings["notifications"]>): Promise<SystemSettings> {
  await delay(300);
  settingsData.notifications = { ...settingsData.notifications, ...updates };
  return { ...settingsData };
}







