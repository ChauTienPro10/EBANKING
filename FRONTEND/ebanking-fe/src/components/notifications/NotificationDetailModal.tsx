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
import { useNotificationStore } from "@/stores/useNotificationStore";
import { formatNotificationForDisplay, getNotificationTypeText } from "@/services/notificationService";

export function NotificationDetailModal() {
  const detailOpen = useNotificationStore((state) => state.detailOpen);
  const detail = useNotificationStore((state) => state.detail);
  const closeDetail = useNotificationStore((state) => state.closeDetail);

  // For now, we'll show a simple detail view since the backend doesn't have detailed notification info yet
  // This will be updated when backend provides more detailed notification data
  const selectedNotification = useNotificationStore((state) => 
    state.history.find(h => h.id.toString() === (detail as any)?.id)
  );

  return (
    <Dialog open={detailOpen && Boolean(selectedNotification)} onOpenChange={(open) => !open && closeDetail()}>
      {selectedNotification && (
        <DialogContent className="max-h-[80vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification.title}
              <Badge variant="outline">
                {getNotificationTypeText(selectedNotification.type)}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              ID: {selectedNotification.id} • {formatNotificationForDisplay(selectedNotification).time}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Nội dung thông báo</p>
              <p className="text-muted-foreground bg-gray-50 p-3 rounded-md">
                {selectedNotification.content}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Loại thông báo</p>
                <Badge variant="outline" className="mt-1">
                  {getNotificationTypeText(selectedNotification.type)}
                </Badge>
              </div>
              
              {selectedNotification.username && (
                <div>
                  <p className="font-semibold">Người nhận</p>
                  <p className="font-mono text-sm mt-1">{selectedNotification.username}</p>
                </div>
              )}
            </div>

            {selectedNotification.type === 'TRANSACTION' && (
              <div className="space-y-3 p-3 bg-blue-50 rounded-md">
                <p className="font-semibold text-blue-800">Thông tin giao dịch</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedNotification.sender && (
                    <div>
                      <p className="font-medium">Người gửi</p>
                      <p className="text-muted-foreground">{selectedNotification.sender}</p>
                    </div>
                  )}
                  
                  {selectedNotification.amount && (
                    <div>
                      <p className="font-medium">Số tiền</p>
                      <p className="font-semibold text-green-600">{selectedNotification.amount}</p>
                    </div>
                  )}
                  
                  {selectedNotification.status && (
                    <div>
                      <p className="font-medium">Trạng thái</p>
                      <Badge 
                        variant={
                          selectedNotification.status === "SUCCESS" ? "default" : 
                          selectedNotification.status === "FAILED" ? "destructive" : 
                          "secondary"
                        }
                        className="mt-1"
                      >
                        {selectedNotification.status}
                      </Badge>
                    </div>
                  )}
                  
                  {selectedNotification.noiDungGiaoDich && (
                    <div className="col-span-2">
                      <p className="font-medium">Nội dung giao dịch</p>
                      <p className="text-muted-foreground">{selectedNotification.noiDungGiaoDich}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedNotification.type === 'PERSONAL' && selectedNotification.username && (
              <div className="p-3 bg-green-50 rounded-md">
                <p className="font-semibold text-green-800">Thông báo cá nhân</p>
                <p className="text-sm text-green-700 mt-1">
                  Gửi đến: <span className="font-mono">{selectedNotification.username}</span>
                </p>
              </div>
            )}

            {selectedNotification.type === 'SYSTEM' && (
              <div className="p-3 bg-orange-50 rounded-md">
                <p className="font-semibold text-orange-800">Thông báo hệ thống</p>
                <p className="text-sm text-orange-700 mt-1">
                  Thông báo này được gửi đến tất cả người dùng trong hệ thống
                </p>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Thông báo ID: {selectedNotification.id} • 
                Tạo lúc: {formatNotificationForDisplay(selectedNotification).time}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDetail}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}


