import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/DataTable";
import type { Column } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { SearchInput } from "@/components/search/SearchInput";
import { StatusBadge } from "@/components/status/StatusBadge";
import { useAuditLogStore } from "@/stores/useAuditLogStore";
import { useTranslation } from "react-i18next";
import type { AuditLog } from "@/services/logService";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export function AuditPage() {
  const { t } = useTranslation();
  const {
    data,
    loading,
    pagination,
    filters,
    fetchLogs,
    setPage,
    setLimit,
    setFilter,
    selectedLog,
    selectLog,
  } = useAuditLogStore();

  useEffect(() => {
    console.log('Fetching audit logs with:', { page: pagination.page, limit: pagination.limit, filters });
    fetchLogs();
  }, [pagination.page, pagination.limit, filters, fetchLogs]);

  const columns: Column<AuditLog>[] = [
    {
      key: "timestamp",
      header: t("audit.table.time") || "Time",
      render: (item) => new Date(item.timestamp).toLocaleString("vi-VN"),
    },
    {
      key: "staffUsername",
      header: t("audit.table.staff") || "Staff",
      render: (item) => (
        <span className="font-medium">{item.staffUsername}</span>
      ),
    },
    {
      key: "ipAddress",
      header: t("audit.table.ip") || "IP Address",
    },
    {
      key: "action",
      header: t("audit.table.action") || "Action",
    },
    {
      key: "details",
      header: t("audit.table.details") || "Details",
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.details && item.details.length > 80
            ? `${item.details.slice(0, 80)}...`
            : item.details}
        </span>
      ),
    },
    {
      key: "success",
      header: t("audit.table.status") || "Status",
      render: (item) => (
        <StatusBadge
          status={item.success ? "success" : "failed"}
          label={item.success ? "SUCCESS" : "FAILURE"}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("audit.title") || "Audit Logs"}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <SearchInput
            value={filters.username || ""}
            onChange={(value) => setFilter({ username: value || undefined })}
            placeholder={t("audit.filters.username") || "Staff Username"}
          />
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              setFilter({
                status: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t("audit.filters.status") || "Status"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("audit.filters.statusAll") || "All"}
              </SelectItem>
              <SelectItem value="SUCCESS">SUCCESS</SelectItem>
              <SelectItem value="FAILURE">FAILURE</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.action || "all"}
            onValueChange={(value) =>
              setFilter({
                action: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t("audit.filters.action") || "Action"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("audit.filters.actionAll") || "All Actions"}
              </SelectItem>
              <SelectItem value="LOGIN">LOGIN</SelectItem>
              <SelectItem value="VIEW_DASHBOARD">VIEW_DASHBOARD</SelectItem>
              <SelectItem value="LIST_ADMINS">LIST_ADMINS</SelectItem>
              <SelectItem value="CREATE_ADMIN">CREATE_ADMIN</SelectItem>
              <SelectItem value="UPDATE_ADMIN">UPDATE_ADMIN</SelectItem>
              <SelectItem value="DEACTIVATE_ADMIN">DEACTIVATE_ADMIN</SelectItem>
              <SelectItem value="RESET_PASSWORD">RESET_PASSWORD</SelectItem>
              <SelectItem value="CHANGE_PASSWORD">CHANGE_PASSWORD</SelectItem>
              <SelectItem value="REFRESH_TOKEN">REFRESH_TOKEN</SelectItem>
              <SelectItem value="LOCK_ACCOUNT">LOCK_ACCOUNT</SelectItem>
              <SelectItem value="UNLOCK_ACCOUNT">UNLOCK_ACCOUNT</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={t("audit.filters.ip") || "IP Address"}
            value={filters.ip || ""}
            onChange={(e) => setFilter({ ip: e.target.value || undefined })}
          />
          <Select
            value={filters.role || "all"}
            onValueChange={(value) =>
              setFilter({
                role: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("audit.filters.role") || "Role"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("audit.filters.roleAll") || "All Roles"}
              </SelectItem>
              <SelectItem value="ROLE_ADMIN">ROLE_ADMIN</SelectItem>
              <SelectItem value="ROLE_STAFF">ROLE_STAFF</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="mt-6 space-y-4">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            rowKey="id"
            onView={(item) => selectLog(item)}
            emptyMessage={t("audit.empty") || "No audit logs found"}
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
        <Dialog open={!!selectedLog} onOpenChange={() => selectLog(null)}>
          <DialogContent className="max-w-3xl">
            <DialogClose />
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {t("audit.detailsTitle") || "Audit Log Details"} ·{" "}
                <Badge variant="outline">#{selectedLog.id}</Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">
                    {t("audit.fields.staff") || "Staff"}
                  </div>
                  <div className="text-base font-semibold">
                    {selectedLog.staffUsername}
                  </div>
                </div>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {t("audit.fields.time") || "Time"}
                  </div>
                  <div className="flex items-center gap-2 text-base font-medium">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {new Date(selectedLog.timestamp).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">
                    {t("audit.fields.ip") || "IP Address"}
                  </div>
                  <div className="text-base font-semibold">
                    {selectedLog.ipAddress || "-"}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">
                    {t("audit.fields.action") || "Action"}
                  </div>
                  <div className="text-base font-semibold">
                    {selectedLog.action}
                  </div>
                </div>

                {selectedLog.targetType && (
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">
                      {t("audit.fields.targetType") || "Target Type"}
                    </div>
                    <div className="text-base font-semibold">
                      {selectedLog.targetType}
                    </div>
                  </div>
                )}
                {selectedLog.targetId && (
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">
                      {t("audit.fields.targetId") || "Target ID"}
                    </div>
                    <div className="text-base font-semibold">
                      {selectedLog.targetId}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">
                    {t("audit.fields.status") || "Status"}
                  </div>
                  <StatusBadge
                    status={selectedLog.success ? "success" : "failed"}
                    label={selectedLog.success ? "SUCCESS" : "FAILURE"}
                  />
                </div>
              </div>

              {selectedLog.details && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">
                    {t("audit.fields.details") || "Details"}
                  </div>
                  <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedLog.details}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
