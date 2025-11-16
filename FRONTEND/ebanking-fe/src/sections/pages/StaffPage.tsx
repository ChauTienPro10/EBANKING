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
import { useStaffStore } from "@/stores/useStaffStore";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import type { Staff } from "@/services/mock/staffService";
import { Plus } from "lucide-react";

export function StaffPage() {
  const { t } = useTranslation();
  const {
    data,
    loading,
    pagination,
    filters,
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useStaffStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  useEffect(() => {
    fetchStaff();
  }, [pagination.page, pagination.limit, filters, fetchStaff]);

  const handleCreate = async (formData: Record<string, unknown>) => {
    try {
      await createStaff({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        status: formData.status || "Active",
      });
      toast({ type: "success", title: "Created successfully" });
    } catch (error) {
      toast({ type: "error", title: "Failed to create staff", description: (error as Error).message });
    }
  };

  const handleEdit = async (formData: Record<string, unknown>) => {
    if (!selectedStaff) return;
    try {
      await updateStaff(selectedStaff.id, formData);
      toast({ type: "success", title: "Updated successfully" });
      setEditModalOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      toast({ type: "error", title: "Failed to update staff", description: (error as Error).message });
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    try {
      await deleteStaff(selectedStaff.id);
      toast({ type: "success", title: "Deleted successfully" });
      setDeleteModalOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      toast({ type: "error", title: "Failed to delete staff", description: (error as Error).message });
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Role", "Department", "Status"];
    const rows = data.map((s) => [s.id, s.name, s.email, s.phone, s.role, s.department, s.status]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff-${new Date().toISOString()}.csv`;
    a.click();
    toast({ type: "success", title: "Exported to CSV" });
  };

  const columns: Column<Staff>[] = [
    {
      key: "name",
      header: t("staff.table.name") || "Name",
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: "email",
      header: t("staff.table.email") || "Email",
    },
    {
      key: "phone",
      header: t("staff.table.phone") || "Phone",
    },
    {
      key: "department",
      header: t("staff.table.department") || "Department",
    },
    {
      key: "role",
      header: t("staff.table.role") || "Role",
    },
    {
      key: "status",
      header: t("staff.table.status") || "Status",
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
            <CardTitle>{t("staff.title") || "Staff Management"}</CardTitle>
            <div className="flex gap-2">
              <ExportButton onExportCSV={handleExportCSV} />
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("staff.create") || "Add Staff"}
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
                placeholder={t("staff.search") || "Search staff..."}
              />
            </div>
            <Select
              value={filters.role || "all"}
              onChange={(e) => setFilter({ role: e.target.value === "all" ? undefined : e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="all">{t("staff.filterAll") || "All Roles"}</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </Select>
            <Select
              value={filters.status || "all"}
              onChange={(e) => setFilter({ status: e.target.value === "all" ? undefined : e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="all">{t("staff.filterAllStatus") || "All Status"}</option>
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onEdit={(item) => {
              setSelectedStaff(item);
              setEditModalOpen(true);
            }}
            onDelete={(item) => {
              setSelectedStaff(item);
              setDeleteModalOpen(true);
            }}
            emptyMessage={t("staff.empty") || "No staff members found"}
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
        title={t("staff.create") || "Create Staff"}
        fields={[
          { name: "name", label: t("staff.name") || "Name", required: true },
          { name: "email", label: t("staff.email") || "Email", type: "email", required: true },
          { name: "phone", label: t("staff.phone") || "Phone", type: "tel", required: true },
          {
            name: "role",
            label: t("staff.role") || "Role",
            type: "select",
            options: [
              { value: "Admin", label: "Admin" },
              { value: "Manager", label: "Manager" },
              { value: "Staff", label: "Staff" },
            ],
            required: true,
          },
          {
            name: "department",
            label: t("staff.department") || "Department",
            required: true,
          },
          {
            name: "status",
            label: t("staff.status") || "Status",
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
          if (!open) setSelectedStaff(null);
        }}
        title={t("staff.edit") || "Edit Staff"}
        fields={[
          { name: "name", label: t("staff.name") || "Name", required: true },
          { name: "email", label: t("staff.email") || "Email", type: "email", required: true },
          { name: "phone", label: t("staff.phone") || "Phone", type: "tel", required: true },
          {
            name: "role",
            label: t("staff.role") || "Role",
            type: "select",
            options: [
              { value: "Admin", label: "Admin" },
              { value: "Manager", label: "Manager" },
              { value: "Staff", label: "Staff" },
            ],
            required: true,
          },
          {
            name: "department",
            label: t("staff.department") || "Department",
            required: true,
          },
          {
            name: "status",
            label: t("staff.status") || "Status",
            type: "select",
            options: [
              { value: "Active", label: "Active" },
              { value: "Locked", label: "Locked" },
            ],
          },
        ]}
        initialData={selectedStaff || undefined}
        onSubmit={handleEdit}
        loading={loading}
      />

      <DeleteConfirm
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) setSelectedStaff(null);
        }}
        onConfirm={handleDelete}
        title={t("staff.deleteTitle") || "Delete Staff"}
        description={t("staff.deleteDescription") || "Are you sure you want to delete this staff member?"}
        itemName={selectedStaff?.name}
      />
    </div>
  );
}
