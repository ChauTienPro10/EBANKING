import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccountStore } from "@/stores/useAccountStore";
import { useTranslation } from "react-i18next";
import { DateTimePicker } from "@/components/ui/datetime-picker";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string | null;
}

export function AccountLockModal({ open, onOpenChange, accountId }: Props) {
  const { t } = useTranslation();
  const lock = useAccountStore((s) => s.lock);
  const [reason, setReason] = useState<string>("fraud");
  const [indefinite, setIndefinite] = useState<boolean>(true);
  const [until, setUntil] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("fraud");
      setIndefinite(true);
      setUntil(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!accountId) return;
    setSubmitting(true);
    await lock({ id: accountId, reason, until: indefinite ? null : until || null });
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("accounts.modals.lockTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("accounts.modals.reason")}</label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="fraud">{t("accounts.lock.reasons.fraud")}</option>
              <option value="byRequest">{t("accounts.lock.reasons.byRequest")}</option>
              <option value="kyc">{t("accounts.lock.reasons.kyc")}</option>
              <option value="other">{t("accounts.lock.reasons.other")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("accounts.lock.untilLabel")}</label>
            <div className="flex items-center gap-2">
              <input
                id="indefinite"
                type="checkbox"
                checked={indefinite}
                onChange={(e) => setIndefinite(e.target.checked)}
              />
              <label htmlFor="indefinite" className="text-sm">
                {t("accounts.lock.indefinite")}
              </label>
            </div>
            {!indefinite && (
              <DateTimePicker value={until ?? ""} onChange={(v) => setUntil(v)} />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? t("common.saving") : t("accounts.lock.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

