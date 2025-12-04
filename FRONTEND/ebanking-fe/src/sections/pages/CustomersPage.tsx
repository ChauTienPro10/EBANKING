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
import { useCustomerStore } from "@/stores/useCustomerStore";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import type { Customer } from "@/services/mock/customerService";
import { Plus } from "lucide-react";

export function CustomersPage() {
  const { t } = useTranslation();
  const {
    data,
    loading,
    pagination,
    filters,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useCustomerStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, pagination.limit, filters, fetchCustomers]);

  const handleCreate = async (formData: Record<string, unknown>) => {
    try {
      await createCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        kycStatus: formData.kycStatus || "Pending",
        status: formData.status || "Active",
      });
      toast({ type: "success", title: "Created successfully" });
    } catch (error) {
      toast({ type: "error", title: "Failed to create customer", description: (error as Error).message });
    }
  };

  const handleEdit = async (formData: Record<string, unknown>) => {
    if (!selectedCustomer) return;
    try {
      await updateCustomer(selectedCustomer.id, formData);
      toast({ type: "success", title: "Updated successfully" });
      setEditModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast({ type: "error", title: "Failed to update customer", description: (error as Error).message });
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      await deleteCustomer(selectedCustomer.id);
      toast({ type: "success", title: "Deleted successfully" });
      setDeleteModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast({ type: "error", title: "Failed to delete customer", description: (error as Error).message });
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "KYC Status", "Status"];
    const rows = data.map((c) => [c.id, c.name, c.email, c.phone, c.kycStatus, c.status]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${new Date().toISOString()}.csv`;
    a.click();
    toast({ type: "success", title: "Exported to CSV" });
  };

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: t("customers.table.name") || "Name",
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: "email",
      header: t("customers.table.email") || "Email",
    },
    {
      key: "phone",
      header: t("customers.table.phone") || "Phone",
    },
    {
      key: "kycStatus",
      header: t("customers.table.kyc") || "KYC",
      render: (item) => (
        <StatusBadge
          status={item.kycStatus === "Verified" ? "verified" : item.kycStatus === "Rejected" ? "rejected" : "pending"}
          label={item.kycStatus}
        />
      ),
    },
    {
      key: "status",
      header: t("customers.table.status") || "Status",
      render: (item) => (
        <StatusBadge status={item.status === "Active" ? "active" : "locked"} label={item.status} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("customers.list") || "Customers"}</CardTitle>
            <div className="flex gap-2">
              <ExportButton onExportCSV={handleExportCSV} />
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("customers.create") || "Add Customer"}
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
                placeholder={t("customers.search") || "Search customers..."}
              />
            </div>
            <Select
              value={filters.status || "all"}
              onChange={(e) => setFilter({ status: e.target.value === "all" ? undefined : e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="all">{t("customers.filterAll") || "All Status"}</option>
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
            </Select>
            <Select
              value={filters.kycStatus || "all"}
              onChange={(e) => setFilter({ kycStatus: e.target.value === "all" ? undefined : e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="all">{t("customers.filterAllKYC") || "All KYC"}</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onEdit={(item) => {
              setSelectedCustomer(item);
              setEditModalOpen(true);
            }}
            onDelete={(item) => {
              setSelectedCustomer(item);
              setDeleteModalOpen(true);
            }}
            emptyMessage={t("customers.empty") || "No customers found"}
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
        title={t("customers.create") || "Create Customer"}
        fields={[
          { name: "name", label: t("customers.name") || "Name", required: true },
          { name: "email", label: t("customers.email") || "Email", type: "email", required: true },
          { name: "phone", label: t("customers.phone") || "Phone", type: "tel", required: true },
          {
            name: "kycStatus",
            label: t("customers.kycStatus") || "KYC Status",
            type: "select",
            options: [
              { value: "Pending", label: "Pending" },
              { value: "Verified", label: "Verified" },
              { value: "Rejected", label: "Rejected" },
            ],
          },
          {
            name: "status",
            label: t("customers.status") || "Status",
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
          if (!open) setSelectedCustomer(null);
        }}
        title={t("customers.edit") || "Edit Customer"}
        fields={[
          { name: "name", label: t("customers.name") || "Name", required: true },
          { name: "email", label: t("customers.email") || "Email", type: "email", required: true },
          { name: "phone", label: t("customers.phone") || "Phone", type: "tel", required: true },
          {
            name: "kycStatus",
            label: t("customers.kycStatus") || "KYC Status",
            type: "select",
            options: [
              { value: "Pending", label: "Pending" },
              { value: "Verified", label: "Verified" },
              { value: "Rejected", label: "Rejected" },
            ],
          },
          {
            name: "status",
            label: t("customers.status") || "Status",
            type: "select",
            options: [
              { value: "Active", label: "Active" },
              { value: "Locked", label: "Locked" },
            ],
          },
        ]}
        initialData={selectedCustomer || undefined}
        onSubmit={handleEdit}
        loading={loading}
      />

      <DeleteConfirm
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) setSelectedCustomer(null);
        }}
        onConfirm={handleDelete}
        title={t("customers.deleteTitle") || "Delete Customer"}
        description={t("customers.deleteDescription") || "Are you sure you want to delete this customer?"}
        itemName={selectedCustomer?.name}
      />
    </div>
  );
}
