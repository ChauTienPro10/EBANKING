import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useTranslation } from "react-i18next";

export function NotificationForm() {
  const { t } = useTranslation();
  const form = useNotificationStore((state) => state.form);
  const errors = useNotificationStore((state) => state.errors);
  const setFormValue = useNotificationStore((state) => state.setFormValue);
  const uploadImage = useNotificationStore((state) => state.uploadImage);
  const openPreview = useNotificationStore((state) => state.openPreview);
  const openConfirm = useNotificationStore((state) => state.openConfirm);
  const loadingSend = useNotificationStore((state) => state.loadingSend);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notifications.form.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("notifications.form.fields.title")}
          </label>
          <Input
            value={form.title}
            onChange={(e) => setFormValue("title", e.target.value)}
            placeholder={t("notifications.form.placeholders.title")}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{t(errors.title)}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("notifications.form.fields.body")}
          </label>
          <Textarea
            value={form.body}
            onChange={(e) => setFormValue("body", e.target.value)}
            placeholder={t("notifications.form.placeholders.body")}
            rows={4}
          />
          {errors.body && (
            <p className="text-sm text-destructive">{t(errors.body)}</p>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("notifications.form.fields.image")}
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => uploadImage(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("notifications.form.fields.link")}
            </label>
            <Input
              value={form.link}
              onChange={(e) => setFormValue("link", e.target.value)}
              placeholder={t("notifications.form.placeholders.link")}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("notifications.form.fields.priority")}
            </label>
            <Select
              value={form.priority}
              onChange={(e) => setFormValue("priority", e.target.value)}
              options={[
                { value: "low", label: t("notifications.form.priority.low") },
                {
                  value: "normal",
                  label: t("notifications.form.priority.normal"),
                },
                { value: "high", label: t("notifications.form.priority.high") },
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("notifications.form.fields.schedule")}
            </label>
            <DateTimePicker
              value={form.scheduleTime}
              onChange={(value) => setFormValue("scheduleTime", value)}
            />
            {errors.scheduleTime && (
              <p className="text-sm text-destructive">
                {t(errors.scheduleTime)}
              </p>
            )}
          </div>
        </div>
        {errors.receivers && (
          <p className="text-sm text-destructive">{t(errors.receivers)}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={openPreview}>
            {t("notifications.actions.preview")}
          </Button>
          <Button type="button" onClick={openConfirm} disabled={loadingSend}>
            {loadingSend
              ? t("notifications.actions.sending")
              : t("notifications.actions.send")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
