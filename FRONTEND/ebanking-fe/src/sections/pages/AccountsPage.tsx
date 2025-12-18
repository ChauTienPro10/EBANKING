import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/search/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { StatusBadge } from "@/components/status/StatusBadge";
import { useAccountStore } from "@/stores/useAccountStore";
import { useTranslation } from "react-i18next";
import type { EnrichedAccount } from "@/services/mock/accountService";
import { AccountDetailModal } from "@/components/accounts/AccountDetailModal";

export function AccountsPage() {
  const { t } = useTranslation();
  const page = useAccountStore((s) => s.page);
  const limit = useAccountStore((s) => s.limit);
  const total = useAccountStore((s) => s.total);
  const data = useAccountStore((s) => s.data);
  const loading = useAccountStore((s) => s.loading);
  const filters = useAccountStore((s) => s.filters);
  const setFilters = useAccountStore((s) => s.setFilters);
  const setPage = useAccountStore((s) => s.setPage);
  const setLimit = useAccountStore((s) => s.setLimit);
  const fetch = useAccountStore((s) => s.fetch);
  const openDetail = useAccountStore((s) => s.openDetail);

  useEffect(() => {
    void fetch();
  }, [page, limit, filters.search, filters.status, fetch]);

  const columns: Column<EnrichedAccount>[] = [
    {
      key: "index",
      header: t("common.table.index"),
      render: (_item, idx) => (page - 1) * limit + (idx ?? 0) + 1,
    },
    { key: "id", header: t("accounts.table.no") },
    { key: "ownerName", header: t("accounts.table.owner") },
    { key: "type", header: t("accounts.table.type") },
    {
      key: "balance",
      header: t("accounts.table.balance"),
      render: (item) => `${item.balance.toLocaleString()} ${item.currency}`,
    },
    {
      key: "status",
      header: t("accounts.table.status"),
      render: (item) => (
        <StatusBadge
          status={item.status === "Active" ? "active" : "locked"}
          label={t(
            item.status === "Active"
              ? "accounts.status.active"
              : "accounts.status.locked"
          )}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("accounts.list")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <SearchInput
                value={filters.search}
                onChange={(v) => setFilters({ search: v })}
                placeholder={t("accounts.searchPlaceholder")}
              />
            </div>
            <Select
              value={filters.status || "all"}
              onValueChange={(v) =>
                setFilters({
                  status: (v as any) === "all" ? "all" : (v as any),
                })
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t("accounts.filter.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("accounts.filter.allStatuses")}
                </SelectItem>
                <SelectItem value="Active">
                  {t("accounts.status.active")}
                </SelectItem>
                <SelectItem value="Locked">
                  {t("accounts.status.locked")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            rowKey="id"
            onView={(item) => openDetail(item.id)}
            emptyMessage={t("accounts.empty")}
          />

          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </CardContent>
      </Card>

      <AccountDetailModal />
    </div>
  );
}
