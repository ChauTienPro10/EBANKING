import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Save } from "lucide-react";

export function SettingsPage() {
  const { t } = useTranslation();
  const { settings, loading, fetchSettings, updateGeneral, updateSecurity, updateBankingLimits, updateNotifications } =
    useSettingsStore();

  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setFormData({
        general: { ...settings.general },
        security: { ...settings.security },
        bankingLimits: { ...settings.bankingLimits },
        notifications: { ...settings.notifications },
      });
    }
  }, [settings]);

  const handleSaveGeneral = async () => {
    try {
      await updateGeneral(formData.general);
      toast({ type: "success", title: "Updated successfully" });
    } catch (error) {
      toast({ type: "error", title: "Failed to update settings", description: (error as Error).message });
    }
  };

  const handleSaveSecurity = async () => {
    try {
      await updateSecurity(formData.security);
      toast({ type: "success", title: "Updated successfully" });
    } catch (error) {
      toast({ type: "error", title: "Failed to update settings", description: (error as Error).message });
    }
  };

  const handleSaveBankingLimits = async () => {
    try {
      await updateBankingLimits(formData.bankingLimits);
      toast({ type: "success", title: "Updated successfully" });
    } catch (error) {
      toast({ type: "error", title: "Failed to update settings", description: (error as Error).message });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateNotifications(formData.notifications);
      toast({ type: "success", title: "Updated successfully" });
    } catch (error) {
      toast({ type: "error", title: "Failed to update settings", description: (error as Error).message });
    }
  };

  const handleChange = (section: string, field: string, value: unknown) => {
    setFormData((prev: Record<string, unknown>) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
  };

  if (loading && !settings) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.title") || "System Settings"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">{t("settings.tabGeneral") || "General"}</TabsTrigger>
              <TabsTrigger value="security">{t("settings.tabSecurity") || "Security"}</TabsTrigger>
              <TabsTrigger value="limits">{t("settings.tabLimits") || "Banking Limits"}</TabsTrigger>
              <TabsTrigger value="notifications">{t("settings.tabNotifications") || "Notifications"}</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("settings.appName") || "Application Name"}</Label>
                  <Input
                    value={formData.general?.appName || ""}
                    onChange={(e) => handleChange("general", "appName", e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.maintenanceMode") || "Maintenance Mode"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.maintenanceModeDesc") || "Enable maintenance mode to restrict access"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.general?.maintenanceMode || false}
                    onChange={(e) => handleChange("general", "maintenanceMode", e.target.checked)}
                    className="rounded"
                  />
                </div>
                {formData.general?.maintenanceMode && (
                  <div className="space-y-2">
                    <Label>{t("settings.maintenanceMessage") || "Maintenance Message"}</Label>
                    <Input
                      value={formData.general?.maintenanceMessage || ""}
                      onChange={(e) => handleChange("general", "maintenanceMessage", e.target.value)}
                      placeholder={t("settings.maintenanceMessagePlaceholder") || "Enter maintenance message"}
                    />
                  </div>
                )}
                <Button onClick={handleSaveGeneral} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("settings.save") || "Save Changes"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.twoFactor") || "Enable 2FA"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.twoFactorDesc") || "Require two-factor authentication for all users"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.security?.twoFactorEnabled || false}
                    onChange={(e) => handleChange("security", "twoFactorEnabled", e.target.checked)}
                    className="rounded"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.sessionTimeout") || "Session Timeout (minutes)"}</Label>
                  <Input
                    type="number"
                    value={formData.security?.sessionTimeout || 30}
                    onChange={(e) => handleChange("security", "sessionTimeout", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.maxLoginAttempts") || "Max Login Attempts"}</Label>
                  <Input
                    type="number"
                    value={formData.security?.maxLoginAttempts || 5}
                    onChange={(e) => handleChange("security", "maxLoginAttempts", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.passwordMinLength") || "Password Minimum Length"}</Label>
                  <Input
                    type="number"
                    value={formData.security?.passwordMinLength || 8}
                    onChange={(e) => handleChange("security", "passwordMinLength", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.auditLogRetention") || "Audit Log Retention (days)"}</Label>
                  <Input
                    type="number"
                    value={formData.security?.auditLogRetention || 90}
                    onChange={(e) => handleChange("security", "auditLogRetention", Number(e.target.value))}
                  />
                </div>
                <Button onClick={handleSaveSecurity} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("settings.save") || "Save Changes"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("settings.transferLimit") || "Transfer Limit (VND)"}</Label>
                  <Input
                    type="number"
                    value={formData.bankingLimits?.transferLimit || 0}
                    onChange={(e) => handleChange("bankingLimits", "transferLimit", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.dailyTransferLimit") || "Daily Transfer Limit (VND)"}</Label>
                  <Input
                    type="number"
                    value={formData.bankingLimits?.dailyTransferLimit || 0}
                    onChange={(e) => handleChange("bankingLimits", "dailyTransferLimit", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.withdrawalLimit") || "Withdrawal Limit (VND)"}</Label>
                  <Input
                    type="number"
                    value={formData.bankingLimits?.withdrawalLimit || 0}
                    onChange={(e) => handleChange("bankingLimits", "withdrawalLimit", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.dailyWithdrawalLimit") || "Daily Withdrawal Limit (VND)"}</Label>
                  <Input
                    type="number"
                    value={formData.bankingLimits?.dailyWithdrawalLimit || 0}
                    onChange={(e) => handleChange("bankingLimits", "dailyWithdrawalLimit", Number(e.target.value))}
                  />
                </div>
                <Button onClick={handleSaveBankingLimits} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("settings.save") || "Save Changes"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.emailEnabled") || "Email Notifications"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.emailEnabledDesc") || "Send email notifications to users"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifications?.emailEnabled || false}
                    onChange={(e) => handleChange("notifications", "emailEnabled", e.target.checked)}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.smsEnabled") || "SMS Notifications"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.smsEnabledDesc") || "Send SMS notifications to users"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifications?.smsEnabled || false}
                    onChange={(e) => handleChange("notifications", "smsEnabled", e.target.checked)}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.pushEnabled") || "Push Notifications"}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("settings.pushEnabledDesc") || "Send push notifications to mobile apps"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifications?.pushEnabled || false}
                    onChange={(e) => handleChange("notifications", "pushEnabled", e.target.checked)}
                    className="rounded"
                  />
                </div>
                <Button onClick={handleSaveNotifications} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("settings.save") || "Save Changes"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.permissionMatrix") || "Permission Matrix"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>{t("settings.module") || "Module"}</TH>
                <TH>Admin</TH>
                <TH>Manager</TH>
                <TH>Staff</TH>
              </TR>
            </THead>
            <TBody>
              {[
                { module: "Dashboard", admin: true, manager: true, staff: true },
                { module: "Transactions", admin: true, manager: true, staff: true },
                { module: "Customers", admin: true, manager: true, staff: true },
                { module: "Accounts", admin: true, manager: true, staff: false },
                { module: "Reports", admin: true, manager: true, staff: false },
                { module: "Loans", admin: true, manager: true, staff: true },
                { module: "Support Tickets", admin: true, manager: true, staff: true },
                { module: "Staff Management", admin: true, manager: true, staff: false },
                { module: "System Logs", admin: true, manager: false, staff: false },
                { module: "Settings", admin: true, manager: false, staff: false },
                { module: "Audit & Security", admin: true, manager: false, staff: false },
              ].map((perm) => (
                <TR key={perm.module}>
                  <TD className="font-medium">{perm.module}</TD>
                  <TD>
                    {perm.admin ? (
                      <Badge variant="success">✓</Badge>
                    ) : (
                      <Badge variant="outline">✗</Badge>
                    )}
                  </TD>
                  <TD>
                    {perm.manager ? (
                      <Badge variant="success">✓</Badge>
                    ) : (
                      <Badge variant="outline">✗</Badge>
                    )}
                  </TD>
                  <TD>
                    {perm.staff ? (
                      <Badge variant="success">✓</Badge>
                    ) : (
                      <Badge variant="outline">✗</Badge>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
