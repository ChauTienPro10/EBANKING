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
        <span className="text-sm text-muted-foreground">{item.details}</span>
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
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SearchInput
            value={filters.username || ""}
            onChange={(value) => setFilter({ username: value || undefined })}
            placeholder={t("audit.filters.username") || "Staff Username"}
          />
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) =>
              setFilter({ startDate: e.target.value || undefined })
            }
          />
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) =>
              setFilter({ endDate: e.target.value || undefined })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="mt-6 space-y-4">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            rowKey="id"
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
    </div>
  );
}
