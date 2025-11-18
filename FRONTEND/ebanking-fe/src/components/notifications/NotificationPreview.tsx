import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useTranslation } from "react-i18next";

export function NotificationPreview() {
  const form = useNotificationStore((state) => state.form);
  const { t } = useTranslation();

  return (
    <Card className="max-w-sm rounded-[32px] border-2 border-muted bg-gradient-to-b from-slate-50 to-white shadow-lg">
      <CardContent className="p-6">
        <div className="rounded-2xl bg-white p-4 shadow-inner">
          <div className="text-xs text-muted-foreground">
            {t("notifications.preview.deviceHeader")}
          </div>
          <div className="mt-3 rounded-xl border border-dashed bg-background p-4">
            <p className="text-sm font-semibold">{form.title || t("notifications.preview.titlePlaceholder")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {form.body || t("notifications.preview.bodyPlaceholder")}
            </p>
            {form.image && (
              <div className="mt-3 overflow-hidden rounded-lg border">
                <img src={form.image} alt="preview" className="h-32 w-full object-cover" />
              </div>
            )}
            {form.link && (
              <Button className="mt-4 w-full" variant="secondary">
                {t("notifications.preview.cta")}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


