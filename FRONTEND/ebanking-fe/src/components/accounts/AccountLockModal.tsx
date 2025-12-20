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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccountStore } from "@/stores/useAccountStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string | null;
}

export function AccountLockModal({ open, onOpenChange, accountId }: Props) {
  const lock = useAccountStore((s) => s.lock);
  const [reasonType, setReasonType] = useState<string>("policy_violation");
  const [customReason, setCustomReason] = useState<string>("");
  const [lockedBy, setLockedBy] = useState<string>("admin");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Predefined reasons
  const reasonOptions = [
    { value: "policy_violation", label: "Vi phạm chính sách" },
    { value: "fraud_suspicion", label: "Dấu hiệu lừa đảo" },
    { value: "other", label: "Khác" }
  ];

  useEffect(() => {
    if (open) {
      setReasonType("policy_violation");
      setCustomReason("");
      setLockedBy("admin");
      setNotes("");
      setSubmitting(false);
      setError("");
    }
  }, [open]);

  const getFinalReason = () => {
    if (reasonType === "other") {
      return customReason.trim();
    }
    return reasonOptions.find(opt => opt.value === reasonType)?.label || "";
  };

  const handleConfirm = async () => {
    if (!accountId) return;
    
    const finalReason = getFinalReason();
    
    // Validate required fields
    if (!finalReason) {
      if (reasonType === "other") {
        setError("Vui lòng nhập lý do cụ thể");
      } else {
        setError("Vui lòng chọn lý do khóa");
      }
      return;
    }
    if (!lockedBy.trim()) {
      setError("Vui lòng nhập người thực hiện khóa");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      console.log('AccountLockModal: Submitting lock request...');
      await lock({ 
        id: accountId, 
        reason: finalReason, 
        lockedBy: lockedBy.trim(),
        notes: notes.trim() || undefined
      });
      console.log('AccountLockModal: Lock successful, closing modal...');
      onOpenChange(false);
    } catch (err: any) {
      console.error('AccountLockModal: Lock failed:', err);
      setError(err.message || "Không thể khóa tài khoản");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Khóa tài khoản</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Lý do khóa *</label>
            <Select value={reasonType} onValueChange={setReasonType}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Chọn lý do khóa..." />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {reasonType === "other" && (
              <Input
                className="h-11"
                placeholder="Nhập lý do cụ thể..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Người thực hiện *</label>
            <Input
              className="h-11"
              value={lockedBy}
              onChange={(e) => setLockedBy(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Ghi chú</label>
            <Input
              className="h-11"
              placeholder="Ghi chú thêm (tùy chọn)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={submitting} variant="destructive">
            {submitting ? "Đang khóa..." : "Khóa tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

