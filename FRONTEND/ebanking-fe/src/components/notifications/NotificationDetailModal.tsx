import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useTranslation } from "react-i18next";

export function NotificationDetailModal() {
  const detailOpen = useNotificationStore((state) => state.detailOpen);
  const detail = useNotificationStore((state) => state.detail);
  const closeDetail = useNotificationStore((state) => state.closeDetail);
  const { t } = useTranslation();

  return (
    <Dialog open={detailOpen && Boolean(detail)} onOpenChange={(open) => !open && closeDetail()}>
      {detail && (
        <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{detail.title}</DialogTitle>
          <DialogDescription>
            {t("notifications.detail.sentBy", {
              staff: detail.staff,
              time: new Date(detail.time).toLocaleString(),
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-semibold">{t("notifications.detail.body")}</p>
            <p className="text-muted-foreground">{detail.body}</p>
          </div>
          {detail.image && (
            <div>
              <p className="font-semibold">{t("notifications.detail.image")}</p>
              <img src={detail.image} alt="detail" className="mt-2 rounded-md border" />
            </div>
          )}
          {detail.link && (
            <div>
              <p className="font-semibold">{t("notifications.detail.link")}</p>
              <a href={detail.link} target="_blank" rel="noreferrer" className="text-primary underline">
                {detail.link}
              </a>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {t("notifications.detail.priority")}:{" "}
              {detail.priority ? t(`notifications.form.priority.${detail.priority}`) : t("notifications.form.priority.normal")}
            </Badge>
            <Badge variant="outline">
              {t("notifications.detail.schedule")}:{" "}
              {detail.scheduleTime
                ? new Date(detail.scheduleTime).toLocaleString()
                : t("notifications.detail.sendNow")}
            </Badge>
          </div>
          <div>
            <p className="font-semibold">{t("notifications.detail.receivers")}</p>
            <div className="max-h-48 overflow-auto rounded-md border">
              <Table>
                <THead>
                  <TR>
                    <TH>{t("notifications.detail.table.receiver")}</TH>
                    <TH>{t("notifications.detail.table.status")}</TH>
                  </TR>
                </THead>
                <TBody>
                  {detail.receivers.map((receiver) => (
                    <TR key={receiver.id}>
                      <TD>{receiver.name}</TD>
                      <TD>
                        <Badge
                          variant={
                            receiver.status === "delivered"
                              ? "success"
                              : receiver.status === "failed"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {t(`notifications.detail.delivery.${receiver.status}`)}
                        </Badge>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </div>
        </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDetail}>
              {t("notifications.actions.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}


