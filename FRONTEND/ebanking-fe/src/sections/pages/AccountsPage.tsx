import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/table/DataTable";
import type { Column } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { SearchInput } from "@/components/search/SearchInput";
import { StatusBadge } from "@/components/status/StatusBadge";
import { ExportButton } from "@/components/export/ExportButton";
import { CRUDModal } from "@/components/dialog/CRUDModal";
import { DeleteConfirm } from "@/components/dialog/DeleteConfirm";
import { useAccountStore } from "@/stores/useAccountStore";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import type { Account } from "@/services/mock/accountService";
import { Plus } from "lucide-react";

export function AccountsPage() {
  const { t } = useTranslation();
  const {
    data,
    loading,
    pagination,
    filters,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useAccountStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [pagination.page, pagination.limit, filters, fetchAccounts]);

  const handleCreate = async (formData: Record<string, unknown>) => {
    try {
      await createAccount({
        customerId: String(formData.customerId || ""),
        type: (formData.type as "Saving" | "Current") || "Saving",
        balance: Number(formData.balance) || 0,
        currency: (formData.currency as string) || "VND",
        status: (formData.status as "Active" | "Locked") || "Active",
      });
      toast({ type: "success", title: "Created successfully" });
    } catch (error) {
      toast({
        type: "error",
        title: "Failed to create account",
        description: (error as Error).message,
      });
    }
  };

  const handleEdit = async (formData: Record<string, unknown>) => {
    if (!selectedAccount) return;
    try {
      await updateAccount(selectedAccount.id, {
        ...formData,
        balance: formData.balance ? Number(formData.balance) : undefined,
      });
      toast({ type: "success", title: "Updated successfully" });
      setEditModalOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      toast({
        type: "error",
        title: "Failed to update account",
        description: (error as Error).message,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;
    try {
      await deleteAccount(selectedAccount.id);
      toast({ type: "success", title: "Deleted successfully" });
      setDeleteModalOpen(false);
      setSelectedAccount(null);
    } catch (error) {
      toast({
        type: "error",
        title: "Failed to delete account",
        description: (error as Error).message,
      });
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Customer ID",
      "Type",
      "Balance",
      "Currency",
      "Status",
    ];
    const rows = data.map((a) => [
      a.id,
      a.customerId,
      a.type,
      a.balance,
      a.currency,
      a.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounts-${new Date().toISOString()}.csv`;
    a.click();
    toast({ type: "success", title: "Exported to CSV" });
  };

  const columns: Column<Account>[] = [
    {
      key: "id",
      header: t("accounts.table.no") || "Account No.",
      render: (item) => <span className="font-medium">{item.id}</span>,
    },
    {
      key: "customerId",
      header: t("accounts.table.customer") || "Customer ID",
    },
    {
      key: "type",
      header: t("accounts.table.type") || "Type",
    },
    {
      key: "balance",
      header: t("accounts.table.balance") || "Balance",
      render: (item) =>
        `${item.balance.toLocaleString("vi-VN")} ${item.currency}`,
    },
    {
      key: "status",
      header: t("accounts.table.status") || "Status",
      render: (item) => (
        <StatusBadge
          status={item.status === "Active" ? "active" : "locked"}
          label={item.status}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("accounts.list") || "Accounts"}</CardTitle>
            <div className="flex gap-2">
              <ExportButton onExportCSV={handleExportCSV} />
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("accounts.create") || "Add Account"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <SearchInput
                value={filters.search}
                onChange={setSearch}
                placeholder={t("accounts.search") || "Search accounts..."}
              />
            </div>
            <Select
              value={filters.type || "all"}
              onChange={(e) =>
                setFilter({
                  type: e.target.value === "all" ? undefined : e.target.value,
                })
              }
              className="w-full sm:w-40"
            >
              <option value="all">
                {t("accounts.filterAll") || "All Types"}
              </option>
              <option value="Saving">Saving</option>
              <option value="Current">Current</option>
            </Select>
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
                {t("accounts.filterAllStatus") || "All Status"}
              </option>
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onEdit={(item) => {
              setSelectedAccount(item);
              setEditModalOpen(true);
            }}
            onDelete={(item) => {
              setSelectedAccount(item);
              setDeleteModalOpen(true);
            }}
            emptyMessage={t("accounts.empty") || "No accounts found"}
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

      <CRUDModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title={t("accounts.create") || "Create Account"}
        fields={[
          {
            name: "customerId",
            label: t("accounts.customerId") || "Customer ID",
            required: true,
          },
          {
            name: "type",
            label: t("accounts.type") || "Type",
            type: "select",
            options: [
              { value: "Saving", label: "Saving" },
              { value: "Current", label: "Current" },
            ],
            required: true,
          },
          {
            name: "balance",
            label: t("accounts.balance") || "Balance",
            type: "number",
            required: true,
          },
          {
            name: "currency",
            label: t("accounts.currency") || "Currency",
            type: "select",
            options: [
              { value: "VND", label: "VND" },
              { value: "USD", label: "USD" },
            ],
            required: true,
          },
          {
            name: "status",
            label: t("accounts.status") || "Status",
            type: "select",
            options: [
              { value: "Active", label: "Active" },
              { value: "Locked", label: "Locked" },
            ],
          },
        ]}
        onSubmit={handleCreate}
        loading={loading}
      />

      <CRUDModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setSelectedAccount(null);
        }}
        title={t("accounts.edit") || "Edit Account"}
        fields={[
          {
            name: "customerId",
            label: t("accounts.customerId") || "Customer ID",
            required: true,
          },
          {
            name: "type",
            label: t("accounts.type") || "Type",
            type: "select",
            options: [
              { value: "Saving", label: "Saving" },
              { value: "Current", label: "Current" },
            ],
            required: true,
          },
          {
            name: "balance",
            label: t("accounts.balance") || "Balance",
            type: "number",
            required: true,
          },
          {
            name: "currency",
            label: t("accounts.currency") || "Currency",
            type: "select",
            options: [
              { value: "VND", label: "VND" },
              { value: "USD", label: "USD" },
            ],
            required: true,
          },
          {
            name: "status",
            label: t("accounts.status") || "Status",
            type: "select",
            options: [
              { value: "Active", label: "Active" },
              { value: "Locked", label: "Locked" },
            ],
          },
        ]}
        initialData={
          selectedAccount
            ? (selectedAccount as unknown as Record<string, unknown>)
            : undefined
        }
        onSubmit={handleEdit}
        loading={loading}
      />

      <DeleteConfirm
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) setSelectedAccount(null);
        }}
        onConfirm={handleDelete}
        title={t("accounts.deleteTitle") || "Delete Account"}
        description={
          t("accounts.deleteDescription") ||
          "Are you sure you want to delete this account?"
        }
        itemName={selectedAccount?.id}
      />
    </div>
  );
}
