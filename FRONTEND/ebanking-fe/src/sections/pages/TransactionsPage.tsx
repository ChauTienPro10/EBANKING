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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import { RealtimeTransactionFeed } from "@/components/RealtimeTransactionFeed";
import type { Transaction } from "@/services/mock/transactionService";

export function TransactionsPage() {
  const { t } = useTranslation();
  const {
    data,
    loading,
    pagination,
    filters,
    fetchTransactions,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useTransactionStore();

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, pagination.limit, filters, fetchTransactions]);

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "From Account",
      "To Account",
      "Amount",
      "Type",
      "Status",
      "Timestamp",
    ];
    const rows = data.map((tx: Transaction) => [
      tx.id,
      tx.fromAccount,
      tx.toAccount || "-",
      tx.amount,
      tx.type,
      tx.status,
      tx.timestamp,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString()}.csv`;
    a.click();
    toast({ type: "success", title: "Exported to CSV" });
  };

  const columns: Column<Transaction>[] = [
    {
      key: "id",
      header: t("transactions.table.id") || "ID",
      render: (item) => <span className="font-medium">{item.id}</span>,
    },
    {
      key: "type",
      header: t("transactions.table.type") || "Type",
    },
    {
      key: "amount",
      header: t("transactions.table.amount") || "Amount",
      render: (item) =>
        `${item.amount.toLocaleString("vi-VN")} ${item.currency}`,
    },
    {
      key: "status",
      header: t("transactions.table.status") || "Status",
      render: (item) => {
        const statusMap: Record<string, "success" | "pending" | "failed"> = {
          Success: "success",
          Pending: "pending",
          Failed: "failed",
          Suspicious: "failed",
        };
        return (
          <StatusBadge
            status={statusMap[item.status] || "pending"}
            label={item.status}
          />
        );
      },
    },
    {
      key: "timestamp",
      header: t("transactions.table.time") || "Time",
      render: (item) => new Date(item.timestamp).toLocaleString("vi-VN"),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("transactions.search") || "Search & Filters"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <SearchInput
            value={filters.search}
            onChange={setSearch}
            placeholder={t("transactions.filters.id") || "Transaction ID"}
          />
          <Select
            value={filters.type || "all"}
            onChange={(e) =>
              setFilter({
                type: e.target.value === "all" ? undefined : e.target.value,
              })
            }
          >
            <option value="all">
              {t("transactions.filterAll") || "All Types"}
            </option>
            <option value="Transfer">Transfer</option>
            <option value="Topup">Topup</option>
            <option value="Bill Payment">Bill Payment</option>
            <option value="Withdraw">Withdraw</option>
          </Select>
          <Input
            type="date"
            placeholder={t("transactions.filters.from") || "From date"}
            value={filters.fromDate || ""}
            onChange={(e) =>
              setFilter({ fromDate: e.target.value || undefined })
            }
          />
          <Input
            type="date"
            placeholder={t("transactions.filters.to") || "To date"}
            value={filters.toDate || ""}
            onChange={(e) => setFilter({ toDate: e.target.value || undefined })}
          />
        </CardContent>
      </Card>

      <RealtimeTransactionFeed />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              {t("transactions.list") || "Transactions List"}
            </CardTitle>
            <ExportButton onExportCSV={handleExportCSV} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select
              value={filters.status || "all"}
              onChange={(e) =>
                setFilter({
                  status: e.target.value === "all" ? undefined : e.target.value,
                })
              }
              className="w-full sm:w-40"
            >
              <option value="all">
                {t("transactions.filterAllStatus") || "All Status"}
              </option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Suspicious">Suspicious</option>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onView={(item) => {
              setSelectedTransaction(item);
              setViewModalOpen(true);
            }}
            emptyMessage={t("transactions.empty") || "No transactions found"}
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

      {selectedTransaction && (
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogClose />
            <DialogHeader>
              <DialogTitle>
                {t("transactions.details") || "Transaction Details"} -{" "}
                {selectedTransaction.id}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.fromAccount") || "From Account"}
                  </label>
                  <p className="font-medium">
                    {selectedTransaction.fromAccount}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.toAccount") || "To Account"}
                  </label>
                  <p className="font-medium">
                    {selectedTransaction.toAccount || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.amount") || "Amount"}
                  </label>
                  <p className="font-medium">
                    {selectedTransaction.amount.toLocaleString("vi-VN")}{" "}
                    {selectedTransaction.currency}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.type") || "Type"}
                  </label>
                  <p className="font-medium">{selectedTransaction.type}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.status") || "Status"}
                  </label>
                  <StatusBadge
                    status={
                      selectedTransaction.status === "Success"
                        ? "success"
                        : selectedTransaction.status === "Pending"
                        ? "pending"
                        : "failed"
                    }
                    label={selectedTransaction.status}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.timestamp") || "Timestamp"}
                  </label>
                  <p className="font-medium">
                    {new Date(selectedTransaction.timestamp).toLocaleString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>
              {selectedTransaction.description && (
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.description") || "Description"}
                  </label>
                  <p className="font-medium">
                    {selectedTransaction.description}
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
