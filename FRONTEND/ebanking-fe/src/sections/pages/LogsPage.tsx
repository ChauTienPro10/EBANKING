import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/table/DataTable";
import type { Column } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { SearchInput } from "@/components/search/SearchInput";
import { StatusBadge } from "@/components/status/StatusBadge";
import { ExportButton } from "@/components/export/ExportButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useLogStore } from "@/stores/useLogStore";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import type { SystemLog } from "@/services/mock/logService";
import { ShieldAlert } from "lucide-react";

export function LogsPage() {
  const { t } = useTranslation();
  const {
    data,
    loading,
    pagination,
    filters,
    fetchLogs,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useLogStore();

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, pagination.limit, filters, fetchLogs]);

  const handleExportCSV = () => {
    const headers = ["ID", "Timestamp", "User", "Role", "Action", "IP", "Device", "Result"];
    const rows = data.map((l) => [l.id, l.timestamp, l.user, l.role, l.action, l.ip, l.device, l.result]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-logs-${new Date().toISOString()}.csv`;
    a.click();
    toast({ type: "success", title: "Exported to CSV" });
  };

  const uniqueActions = Array.from(new Set(data.map((l) => l.action)));

  const columns: Column<SystemLog>[] = [
    {
      key: "timestamp",
      header: t("logs.table.time") || "Time",
      render: (item) => new Date(item.timestamp).toLocaleString("vi-VN"),
    },
    {
      key: "user",
      header: t("logs.table.user") || "User",
      render: (item) => <span className="font-medium">{item.user}</span>,
    },
    {
      key: "role",
      header: t("logs.table.role") || "Role",
      render: (item) => (
        <StatusBadge
          status={item.role === "Admin" ? "failed" : item.role === "Manager" ? "pending" : "active"}
          label={item.role}
        />
      ),
    },
    {
      key: "action",
      header: t("logs.table.action") || "Action",
      render: (item) => <span className="font-medium">{item.action}</span>,
    },
    {
      key: "ip",
      header: t("logs.table.ip") || "IP Address",
      render: (item) => <span className="font-mono text-xs">{item.ip}</span>,
    },
    {
      key: "device",
      header: t("logs.table.device") || "Device",
      render: (item) => <span className="text-sm text-muted-foreground">{item.device}</span>,
    },
    {
      key: "result",
      header: t("logs.table.result") || "Result",
      render: (item) => <StatusBadge status={item.result === "success" ? "success" : "failed"} label={item.result} />,
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              <CardTitle>{t("logs.title") || "System Logs & Monitoring"}</CardTitle>
            </div>
            <ExportButton onExportCSV={handleExportCSV} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Security Note:</strong> All system logs are read-only and cannot be modified or deleted for audit purposes.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <SearchInput
                value={filters.search}
                onChange={setSearch}
                placeholder={t("logs.search") || "Search logs..."}
              />
            </div>
            <Select
              value={filters.action || "all"}
              onChange={(e) => setFilter({ action: e.target.value === "all" ? undefined : e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="all">{t("logs.actionAll") || "All Actions"}</option>
              {uniqueActions.slice(0, 10).map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </Select>
            <Select
              value={filters.role || "all"}
              onChange={(e) => setFilter({ role: e.target.value === "all" ? undefined : e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="all">{t("logs.roleAll") || "All Roles"}</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </Select>
            <Select
              value={filters.result || "all"}
              onChange={(e) => setFilter({ result: e.target.value === "all" ? undefined : e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="all">{t("logs.resultAll") || "All Results"}</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </Select>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Input
              type="date"
              placeholder={t("logs.fromDate") || "From date"}
              value={filters.fromDate || ""}
              onChange={(e) => setFilter({ fromDate: e.target.value || undefined })}
              className="w-full sm:w-40"
            />
            <Input
              type="date"
              placeholder={t("logs.toDate") || "To date"}
              value={filters.toDate || ""}
              onChange={(e) => setFilter({ toDate: e.target.value || undefined })}
              className="w-full sm:w-40"
            />
          </div>

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onView={(item) => {
              setSelectedLog(item);
              setViewModalOpen(true);
            }}
            emptyMessage={t("logs.empty") || "No logs found"}
          />

          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </CardContent>
      </Card>

      {selectedLog && (
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogClose />
            <DialogHeader>
              <DialogTitle>{t("logs.details") || "Log Details"} - {selectedLog.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">{t("logs.table.time") || "Timestamp"}</label>
                  <p className="font-medium">{new Date(selectedLog.timestamp).toLocaleString("vi-VN")}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("logs.table.user") || "User"}</label>
                  <p className="font-medium">{selectedLog.user}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("logs.table.role") || "Role"}</label>
                  <StatusBadge
                    status={selectedLog.role === "Admin" ? "failed" : selectedLog.role === "Manager" ? "pending" : "active"}
                    label={selectedLog.role}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("logs.table.action") || "Action"}</label>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("logs.table.ip") || "IP Address"}</label>
                  <p className="font-mono text-sm">{selectedLog.ip}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("logs.table.device") || "Device"}</label>
                  <p className="font-medium">{selectedLog.device}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("logs.table.result") || "Result"}</label>
                  <StatusBadge status={selectedLog.result === "success" ? "success" : "failed"} label={selectedLog.result} />
                </div>
              </div>
              {selectedLog.details && (
                <div>
                  <label className="text-sm text-muted-foreground">{t("logs.table.details") || "Details"}</label>
                  <p className="font-medium mt-1">{selectedLog.details}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
