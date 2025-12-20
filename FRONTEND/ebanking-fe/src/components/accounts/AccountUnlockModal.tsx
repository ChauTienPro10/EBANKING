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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string | null;
}

export function AccountUnlockModal({ open, onOpenChange, accountId }: Props) {
  const unlock = useAccountStore((s) => s.unlock);
  const [unlockedBy, setUnlockedBy] = useState<string>("admin");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setUnlockedBy("admin");
      setSubmitting(false);
      setError("");
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!accountId) return;
    
    // Validate required fields
    if (!unlockedBy.trim()) {
      setError("Vui lòng nhập người thực hiện mở khóa");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      await unlock(accountId, unlockedBy.trim());
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Không thể mở khóa tài khoản");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Mở khóa tài khoản</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Người thực hiện mở khóa *</label>
            <Input
              className="h-11"
              value={unlockedBy}
              onChange={(e) => setUnlockedBy(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !submitting) {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Đang mở khóa..." : "Mở khóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}