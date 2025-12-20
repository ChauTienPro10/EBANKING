import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { formatNotificationForDisplay, getNotificationTypeText } from "@/services/notificationService";
import { useTranslation } from "react-i18next";

export function NotificationHistoryTable() {
  const { t } = useTranslation();
  const history = useNotificationStore((state) => state.history);
  const totalHistory = useNotificationStore((state) => state.totalHistory);
  const page = useNotificationStore((state) => state.page);
  const pageSize = useNotificationStore((state) => state.pageSize);
  const filters = useNotificationStore((state) => state.filters);
  const setFilters = useNotificationStore((state) => state.setFilters);
  const setPage = useNotificationStore((state) => state.setPage);
  const loadHistory = useNotificationStore((state) => state.loadHistory);
  const loadingHistory = useNotificationStore((state) => state.loadingHistory);
  const selectNotification = useNotificationStore(
    (state) => state.selectNotification
  );

  useEffect(() => {
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalHistory / pageSize));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notifications.history.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="grid gap-4 lg:grid-cols-4">
          <Input
            placeholder="Tìm theo tiêu đề..."
            value={filters.title ?? ""}
            onChange={(e) => setFilters({ title: e.target.value })}
          />
          
          <Input
            placeholder="Tìm theo username..."
            value={filters.username ?? ""}
            onChange={(e) => setFilters({ username: e.target.value })}
          />
          
          <Select
            value={filters.type || "ALL"}
            onValueChange={(value) => setFilters({ type: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại thông báo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="SYSTEM">Hệ thống</SelectItem>
              <SelectItem value="PERSONAL">Cá nhân</SelectItem>
              <SelectItem value="TRANSACTION">Giao dịch</SelectItem>
            </SelectContent>
          </Select>
          
          <button
            onClick={() => {
              setFilters({ 
                title: undefined, 
                username: undefined, 
                type: "ALL",
                fromDate: undefined,
                toDate: undefined 
              });
            }}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            Xóa bộ lọc
          </button>
        </div>
        
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Từ ngày</label>
            <Input
              type="date"
              value={filters.fromDate ?? ""}
              onChange={(e) => setFilters({ fromDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Đến ngày</label>
            <Input
              type="date"
              value={filters.toDate ?? ""}
              onChange={(e) => setFilters({ toDate: e.target.value })}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>ID</TH>
                <TH>Thời gian</TH>
                <TH>Loại</TH>
                <TH>Tiêu đề</TH>
                <TH>Nội dung</TH>
                <TH>Người nhận</TH>
                <TH>Số tiền</TH>
                <TH>Trạng thái</TH>
                <TH>Thao tác</TH>
              </TR>
            </THead>
            <TBody>
              {loadingHistory ? (
                <TR>
                  <TD colSpan={9} className="text-center text-muted-foreground">
                    Đang tải...
                  </TD>
                </TR>
              ) : history.length === 0 ? (
                <TR>
                  <TD colSpan={9} className="text-center text-muted-foreground">
                    Không có thông báo nào
                  </TD>
                </TR>
              ) : (
                history.map((notification) => {
                  const formatted = formatNotificationForDisplay(notification);
                  return (
                    <TR key={notification.id}>
                      <TD className="font-mono text-sm">{notification.id}</TD>
                      <TD className="text-sm">{formatted.time}</TD>
                      <TD>
                        <Badge variant="outline">
                          {getNotificationTypeText(notification.type)}
                        </Badge>
                      </TD>
                      <TD className="font-medium max-w-xs truncate" title={notification.title}>
                        {notification.title}
                      </TD>
                      <TD className="max-w-sm truncate text-sm text-muted-foreground" title={notification.content}>
                        {notification.content}
                      </TD>
                      <TD className="text-sm">
                        {notification.username ? (
                          <span className="font-mono">{notification.username}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TD>
                      <TD className="text-sm">
                        {notification.amount ? (
                          <span className="font-medium text-green-600">
                            {notification.amount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TD>
                      <TD>
                        {notification.status ? (
                          <Badge 
                            variant={
                              notification.status === "SUCCESS" ? "default" : 
                              notification.status === "FAILED" ? "destructive" : 
                              "secondary"
                            }
                          >
                            {notification.status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TD>
                      <TD>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectNotification(notification.id.toString())}
                        >
                          Xem
                        </Button>
                      </TD>
                    </TR>
                  );
                })
              )}
            </TBody>
          </Table>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>
            Trang {page} / {totalPages} - Tổng {totalHistory} thông báo
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || loadingHistory}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || loadingHistory}
            >
              Sau
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
