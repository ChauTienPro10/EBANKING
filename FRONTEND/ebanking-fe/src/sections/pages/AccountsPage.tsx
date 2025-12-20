import { useEffect, useState } from "react";
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
import type { EnrichedAccount } from "@/services/accountService";
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

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [searchType, setSearchType] = useState<'keyword' | 'userName' | 'accountNumber'>('keyword');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    console.log('AccountsPage: Filters changed, fetching...', { 
      page, 
      limit, 
      search: debouncedSearch, 
      status: filters.status,
      searchType
    });
    
    // Update filters based on search type
    if (debouncedSearch.trim()) {
      if (searchType === 'userName') {
        setFilters({ userName: debouncedSearch, accountNumber: undefined });
      } else if (searchType === 'accountNumber') {
        setFilters({ accountNumber: debouncedSearch, userName: undefined });
      } else {
        // keyword search - clear specific searches
        setFilters({ userName: undefined, accountNumber: undefined });
      }
    } else {
      // Clear all search filters when search is empty
      setFilters({ userName: undefined, accountNumber: undefined });
    }
    
    void fetch();
  }, [page, limit, debouncedSearch, filters.status, searchType, fetch]);

  const columns: Column<EnrichedAccount>[] = [
    {
      key: "index",
      header: t("common.table.index"),
      render: (_item, idx) => (page - 1) * limit + (idx ?? 0) + 1,
    },
    { 
      key: "accountNumber", 
      header: t("accounts.table.no"),
      render: (item) => item.accountNumber
    },
    { 
      key: "ownerName", 
      header: t("accounts.table.owner"),
      render: (item) => item.userFullName
    },
    { 
      key: "type", 
      header: t("accounts.table.type"),
      render: (item) => item.accountType
    },
    {
      key: "balance",
      header: t("accounts.table.balance"),
      render: (item) => `${item.balance.toLocaleString()} ${item.currency}`,
    },
    {
      key: "isPrimary",
      header: "Tài khoản chính",
      render: (item) => item.isPrimary ? (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Chính</span>
      ) : null,
    },
    {
      key: "status",
      header: t("accounts.table.status"),
      render: (item) => {
        const isLocked = item.isLocked;
        const isClosed = item.closedDate !== null;
        const isActive = item.status === "ACTIVE" && !isLocked && !isClosed;
        
        return (
          <StatusBadge
            status={isLocked ? "locked" : isClosed ? "inactive" : isActive ? "active" : "inactive"}
            label={
              isLocked ? "Đã khóa" : 
              isClosed ? "Đã đóng" : 
              isActive ? "Hoạt động" : 
              "Không hoạt động"
            }
          />
        );
      },
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
                <div className="flex-1 flex gap-2">
                  <Select
                    value={searchType}
                    onValueChange={(v) => setSearchType(v as any)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword">Tìm tổng hợp</SelectItem>
                      <SelectItem value="userName">Tên người dùng</SelectItem>
                      <SelectItem value="accountNumber">Số tài khoản</SelectItem>
                    </SelectContent>
                  </Select>
                  <SearchInput
                    value={filters.search}
                    onChange={(v) => setFilters({ search: v })}
                    placeholder={
                      searchType === 'userName' 
                        ? "Tìm theo tên người dùng..." 
                        : searchType === 'accountNumber'
                        ? "Tìm theo số tài khoản..."
                        : t("accounts.searchPlaceholder")
                    }
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
                      Tất cả trạng thái
                    </SelectItem>
                    <SelectItem value="Active">
                      Hoạt động
                    </SelectItem>
                    <SelectItem value="Locked">
                      Đã khóa
                    </SelectItem>
                    <SelectItem value="Inactive">
                      Không hoạt động
                    </SelectItem>
                    <SelectItem value="Closed">
                      Đã đóng
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                rowKey="accountNumber"
                onView={(item) => openDetail(item.accountNumber)}
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
