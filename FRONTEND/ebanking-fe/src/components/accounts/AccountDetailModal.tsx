import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccountStore } from "@/stores/useAccountStore";
import { useTranslation } from "react-i18next";
import { AccountLockModal } from "./AccountLockModal";

export function AccountDetailModal() {
  const { t } = useTranslation();
  const selected = useAccountStore((s) => s.selected);
  const closeDetail = useAccountStore((s) => s.closeDetail);
  const unlock = useAccountStore((s) => s.unlock);
  const [lockOpen, setLockOpen] = useState(false);

  if (!selected) return null;

  const isLocked = selected.status === "Locked";

  return (
    <Dialog open={!!selected} onOpenChange={(open) => !open && closeDetail()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("accounts.detailsTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground">{t("accounts.table.no")}</p>
              <p className="font-medium">{selected.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("accounts.table.owner")}</p>
              <p className="font-medium">{selected.ownerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("accounts.table.type")}</p>
              <p className="font-medium">{selected.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("accounts.table.balance")}</p>
              <p className="font-medium">
                {selected.balance.toLocaleString()} {selected.currency}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t("accounts.table.status")}:</span>
            <Badge variant={isLocked ? "destructive" : "success"}>
              {isLocked ? t("accounts.status.locked") : t("accounts.status.active")}
            </Badge>
          </div>
          {isLocked && (
            <div className="rounded-md border p-3 text-xs">
              <div>
                <span className="font-medium">{t("accounts.lock.reasonLabel")}:</span> {t(`accounts.lock.reasons.${selected.lockReason || "other"}`)}
              </div>
              <div>
                <span className="font-medium">{t("accounts.lock.untilLabel")}:</span> {selected.lockedUntil ? new Date(selected.lockedUntil).toLocaleString() : t("accounts.lock.indefinite")}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDetail}>{t("common.cancel")}</Button>
          {isLocked ? (
            <Button onClick={() => unlock(selected.id)}>{t("accounts.actions.unlock")}</Button>
          ) : (
            <Button onClick={() => setLockOpen(true)}>{t("accounts.actions.lock")}</Button>
          )}
        </DialogFooter>
      </DialogContent>
      <AccountLockModal open={lockOpen} onOpenChange={setLockOpen} accountId={selected.id} />
    </Dialog>
  );
}

