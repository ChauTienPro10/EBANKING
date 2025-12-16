import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Transaction } from "@/services/transactionService";

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(amount);
};

const transactionStatusMap: Record<
  string,
  { labelKey: string; color: "success" | "pending" | "failed" }
> = {
  SUCCESS: { labelKey: "transactions.statuses.success", color: "success" },
  PENDING: { labelKey: "transactions.statuses.pending", color: "pending" },
  FAILED: { labelKey: "transactions.statuses.failed", color: "failed" },
  SUSPICIOUS: { labelKey: "transactions.statuses.suspicious", color: "failed" },
};

export function TransactionsPage() {
  const { t } = useTranslation();
  const {
    data,
    loading,
    pagination,
    filters,
    fetchTransactions,
    selectedTransaction,
    selectTransaction,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useTransactionStore();

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
      tx.transactionId,
      tx.senderAccountNumber,
      tx.receiverAccountNumber || "-",
      tx.amount,
      tx.transactionType,
      tx.status,
      tx.transactionAt,
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
      key: "transactionId",
      header: t("transactions.table.id") || "ID",
      render: (item) => (
        <span className="font-medium">{item.transactionId}</span>
      ),
    },
    {
      key: "transactionType",
      header: t("transactions.table.type") || "Type",
    },
    {
      key: "amount",
      header: t("transactions.table.amount") || "Amount",
      render: (item) => formatCurrency(item.amount, item.currency),
    },
    {
      key: "status",
      header: t("transactions.table.status") || "Status",
      render: (item) => {
        const statusInfo = transactionStatusMap[item.status] || {
          labelKey: item.status,
          color: "pending",
        };
        return (
          <StatusBadge
            status={statusInfo.color}
            label={t(statusInfo.labelKey) as string}
          />
        );
      },
    },
    {
      key: "transactionAt",
      header: t("transactions.table.time") || "Time",
      render: (item) => new Date(item.transactionAt).toLocaleString("vi-VN"),
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
            placeholder={t("transactions.filters.searchPlaceholder")}
          />
          <Select
            value={filters.type || "all"}
            onValueChange={(value) =>
              setFilter({ type: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("transactions.filters.allTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("transactions.filters.allTypes")}
              </SelectItem>
              <SelectItem value="TRANSFER">
                {t("transactions.types.transfer")}
              </SelectItem>
              <SelectItem value="TOPUP">
                {t("transactions.types.topup")}
              </SelectItem>
              <SelectItem value="BILL_PAYMENT">
                {t("transactions.types.billPayment")}
              </SelectItem>
              <SelectItem value="WITHDRAW">
                {t("transactions.types.withdraw")}
              </SelectItem>
            </SelectContent>
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
              onValueChange={(value) =>
                setFilter({ status: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue
                  placeholder={t("transactions.filters.allStatuses")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("transactions.filters.allStatuses")}
                </SelectItem>
                <SelectItem value="SUCCESS">
                  {t("transactions.statuses.success")}
                </SelectItem>
                <SelectItem value="PENDING">
                  {t("transactions.statuses.pending")}
                </SelectItem>
                <SelectItem value="FAILED">
                  {t("transactions.statuses.failed")}
                </SelectItem>
                <SelectItem value="SUSPICIOUS">
                  {t("transactions.statuses.suspicious")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            rowKey="transactionId"
            onView={(item) => selectTransaction(item)}
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
        <Dialog
          open={!!selectedTransaction}
          onOpenChange={() => selectTransaction(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogClose />
            <DialogHeader>
              <DialogTitle>
                {t("transactions.details") || "Transaction Details"} -{" "}
                {selectedTransaction.transactionId}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.fromAccount") || "From Account"}
                  </label>
                  <p className="font-medium">
                    {selectedTransaction.senderAccountNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.toAccount") || "To Account"}
                  </label>
                  <p className="font-medium">
                    {selectedTransaction.receiverAccountNumber || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.amount") || "Amount"}
                  </label>
                  <p className="font-medium">
                    {formatCurrency(
                      selectedTransaction.amount,
                      selectedTransaction.currency
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.type") || "Type"}
                  </label>
                  <p className="font-medium">
                    {selectedTransaction.transactionType}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.status") || "Status"}
                  </label>
                  <StatusBadge
                    status={
                      transactionStatusMap[selectedTransaction.status]?.color ||
                      "pending"
                    }
                    label={
                      t(
                        transactionStatusMap[selectedTransaction.status]
                          ?.labelKey || selectedTransaction.status
                      ) as string
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("transactions.timestamp") || "Timestamp"}
                  </label>
                  <p className="font-medium">
                    {new Date(selectedTransaction.transactionAt).toLocaleString(
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
