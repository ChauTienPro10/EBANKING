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
import { AccountLockModal } from "./AccountLockModal";
import { AccountUnlockModal } from "./AccountUnlockModal";

export function AccountDetailModal() {
  const selected = useAccountStore((s) => s.selected);
  const closeDetail = useAccountStore((s) => s.closeDetail);
  const [lockOpen, setLockOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);

  if (!selected) return null;

  const isLocked = selected.isLocked;
  const isClosed = selected.closedDate !== null;
  const isActive = selected.status === "ACTIVE" && !isLocked && !isClosed;

  return (
    <Dialog open={!!selected} onOpenChange={(open) => !open && closeDetail()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết tài khoản</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Số tài khoản</p>
              <p className="font-medium">{selected.accountNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Chủ tài khoản</p>
              <p className="font-medium">{selected.userFullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Loại tài khoản</p>
              <p className="font-medium">{selected.accountType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Số dư</p>
              <p className="font-medium text-lg text-green-600">
                {selected.balance.toLocaleString()} {selected.currency}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tài khoản chính</p>
              <p className="font-medium">
                {selected.isPrimary ? (
                  <Badge variant="default">Có</Badge>
                ) : (
                  <span className="text-gray-500">Không</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Trạng thái</p>
              <Badge variant={isLocked ? "destructive" : isClosed ? "secondary" : isActive ? "success" : "secondary"}>
                {isLocked ? "Đã khóa" : isClosed ? "Đã đóng" : isActive ? "Hoạt động" : "Không hoạt động"}
              </Badge>
            </div>
          </div>

          {/* Dates */}
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">Thông tin thời gian</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Ngày mở</p>
                <p className="font-medium">{new Date(selected.openedDate).toLocaleString('vi-VN')}</p>
              </div>
              {selected.closedDate && (
                <div>
                  <p className="text-muted-foreground">Ngày đóng</p>
                  <p className="font-medium">{new Date(selected.closedDate).toLocaleString('vi-VN')}</p>
                </div>
              )}
              {selected.lastTransactionAt && (
                <div>
                  <p className="text-muted-foreground">Giao dịch cuối</p>
                  <p className="font-medium">{new Date(selected.lastTransactionAt).toLocaleString('vi-VN')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lock Info */}
          {isLocked && (
            <div className="border-t pt-3">
              <h4 className="font-medium mb-2 text-red-600">Thông tin khóa</h4>
              <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-2">
                {selected.lockReason && (
                  <div>
                    <span className="font-medium">Lý do:</span> {selected.lockReason}
                  </div>
                )}
                {selected.lockType && (
                  <div>
                    <span className="font-medium">Loại khóa:</span> {selected.lockType}
                  </div>
                )}
                {selected.lockedAt && (
                  <div>
                    <span className="font-medium">Thời gian khóa:</span> {new Date(selected.lockedAt).toLocaleString('vi-VN')}
                  </div>
                )}
                {selected.lockedBy && (
                  <div>
                    <span className="font-medium">Người khóa:</span> {selected.lockedBy}
                  </div>
                )}
                {selected.lockNotes && (
                  <div>
                    <span className="font-medium">Ghi chú:</span> {selected.lockNotes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDetail}>Đóng</Button>
          {isLocked ? (
            <Button onClick={() => setUnlockOpen(true)}>
              Mở khóa
            </Button>
          ) : !isClosed && (
            <Button onClick={() => setLockOpen(true)} variant="destructive">Khóa tài khoản</Button>
          )}
        </DialogFooter>
      </DialogContent>
      <AccountLockModal open={lockOpen} onOpenChange={setLockOpen} accountId={selected.accountId.toString()} />
      <AccountUnlockModal open={unlockOpen} onOpenChange={setUnlockOpen} accountId={selected.accountId.toString()} />
    </Dialog>
  );
}

