import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReceiverSelector } from "@/components/notifications/ReceiverSelector";
import { NotificationForm } from "@/components/notifications/NotificationForm";
import { NotificationPreview } from "@/components/notifications/NotificationPreview";
import { NotificationHistoryTable } from "@/components/notifications/NotificationHistoryTable";
import { NotificationDetailModal } from "@/components/notifications/NotificationDetailModal";
import { useNotificationStore } from "@/stores/useNotificationStore";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";

export function NotificationsPage() {
  const role =
    (localStorage.getItem("role") as "Admin" | "Manager" | "Staff") || "Staff";
  const { t } = useTranslation();
  const previewOpen = useNotificationStore((state) => state.previewOpen);
  const closePreview = useNotificationStore((state) => state.closePreview);
  const confirmOpen = useNotificationStore((state) => state.confirmOpen);
  const closeConfirm = useNotificationStore((state) => state.closeConfirm);
  const send = useNotificationStore((state) => state.send);
  const form = useNotificationStore((state) => state.form);
  const toastMessage = useNotificationStore((state) => state.toastMessage);
  const dismissToast = useNotificationStore((state) => state.dismissToast);

  const receiverCount = useMemo(() => {
    if (form.mode === "broadcast")
      return t("notifications.confirmation.broadcastAll");
    return t("notifications.confirmation.receiverCount", {
      count: form.selectedUsers.length || 0,
    });
  }, [form.mode, form.selectedUsers.length, t]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="send">
        <TabsList>
          <TabsTrigger value="send">{t("notifications.tabs.send")}</TabsTrigger>
          <TabsTrigger value="history">
            {t("notifications.tabs.history")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="send">
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <ReceiverSelector role={role} />
              <NotificationForm />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{t("notifications.preview.panelTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <NotificationPreview />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="history">
          <NotificationHistoryTable />
        </TabsContent>
      </Tabs>

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => !open && closePreview()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("notifications.preview.modalTitle")}</DialogTitle>
          </DialogHeader>
          <NotificationPreview />
          <DialogFooter>
            <Button variant="outline" onClick={closePreview}>
              {t("notifications.actions.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => !open && closeConfirm()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("notifications.confirmation.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">
                {t("notifications.confirmation.notification")}:
              </span>{" "}
              {form.title}
            </p>
          
            <p>
              <span className="font-medium">
                {t("notifications.confirmation.receivers")}:
              </span>{" "}
              {receiverCount}
            </p>
            <p>
              <span className="font-medium">
                {t("notifications.confirmation.schedule")}:
              </span>{" "}
              {form.scheduleTime
                ? new Date(form.scheduleTime).toLocaleString()
                : t("notifications.confirmation.sendNow")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirm}>
              {t("notifications.actions.cancel")}
            </Button>
            <Button onClick={() => send(role)}>
              {t("notifications.actions.confirmSend")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toastMessage && (
        <Toast message={t(toastMessage)} onDismiss={dismissToast} />
      )}

      <NotificationDetailModal />
    </div>
  );
}

