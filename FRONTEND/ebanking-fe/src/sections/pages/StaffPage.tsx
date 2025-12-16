import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { CRUDModal } from "@/components/dialog/CRUDModal";
import { DeleteConfirm } from "@/components/dialog/DeleteConfirm";
import { useStaffStore } from "@/stores/useStaffStore";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import type { AdminDto } from "@/services/adminStaffService";
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
  const [selectedStaff, setSelectedStaff] = useState<AdminDto | null>(null);

  useEffect(() => {
    fetchStaff();
  }, [pagination.page, pagination.limit, filters, fetchStaff]);

  const handleCreate = async (formData: Record<string, unknown>) => {
    try {
      await createStaff({
        username: String(formData.username || ""),
        fullName: String(formData.fullName || ""),
        role: String(formData.role || "ROLE_USER") as AdminDto["role"],
        password: String(formData.password || ""),
      });
      toast({ type: "success", title: "Created successfully" });
    } catch (error) {
      toast({
        type: "error",
        title: "Failed to create staff",
        description: (error as Error).message,
      });
    }
  };

  const handleEdit = async (formData: Record<string, unknown>) => {
    if (!selectedStaff) return;
    try {
      await updateStaff(selectedStaff.id, {
        fullName: String(formData.fullName || selectedStaff.fullName),
        role: String(formData.role || selectedStaff.role) as AdminDto["role"],
        active:
          String(
            formData.active || (selectedStaff.active ? "true" : "false")
          ) === "true",
      });
      toast({ type: "success", title: "Updated successfully" });
      setEditModalOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      toast({
        type: "error",
        title: "Failed to update staff",
        description: (error as Error).message,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    try {
      await deleteStaff(selectedStaff.id);
      toast({ type: "success", title: "Deactivated successfully" });
      setDeleteModalOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      toast({
        type: "error",
        title: "Failed to deactivate staff",
        description: (error as Error).message,
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Username", "Full Name", "Role", "Active"];
    const rows = data.map((s) => [
      s.id,
      s.username,
      s.fullName,
      s.role,
      s.active ? "Active" : "Inactive",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff-${new Date().toISOString()}.csv`;
    a.click();
    toast({ type: "success", title: "Exported to CSV" });
  };

  const columns: Column<AdminDto>[] = [
    {
      key: "username",
      header: t("staff.table.username") || "Username",
    },
    {
      key: "fullName",
      header: t("staff.table.name") || "Full Name",
    },
    {
      key: "role",
      header: t("staff.table.role") || "Role",
    },
    {
      key: "active",
      header: t("staff.table.status") || "Status",
      render: (item) => (
        <StatusBadge
          status={item.active ? "active" : "locked"}
          label={item.active ? "Active" : "Inactive"}
        />
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
              onValueChange={(value) =>
                setFilter({
                  role:
                    value === "all" ? undefined : (value as AdminDto["role"]),
                })
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t("staff.filter.allRoles")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("staff.filter.allRoles")}
                </SelectItem>
                <SelectItem value="ROLE_ADMIN">{t("roles.admin")}</SelectItem>
                <SelectItem value="ROLE_STAFF">{t("roles.staff")}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={
                filters.active === undefined
                  ? "all"
                  : filters.active
                    ? "true"
                    : "false"
              }
              onValueChange={(value) =>
                setFilter({
                  active: value === "all" ? undefined : value === "true",
                })
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t("staff.filter.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("staff.filter.allStatuses")}
                </SelectItem>
                <SelectItem value="true">{t("staff.status.active")}</SelectItem>
                <SelectItem value="false">
                  {t("staff.status.inactive")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            rowKey="id"
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
          { name: "username", label: "Username", required: true },
          { name: "fullName", label: "Full Name", required: true },
          { name: "password", label: "Password", required: true },
          {
            name: "role",
            label: "Role",
            type: "select",
            options: [
              { value: "ROLE_ADMIN", label: t("roles.admin") || "Admin" },
              { value: "ROLE_STAFF", label: t("roles.staff") || "Staff" },
            ],
            required: true,
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
          { name: "fullName", label: "Full Name", required: true },
          {
            name: "role",
            label: "Role",
            type: "select",
            options: [
              { value: "ROLE_ADMIN", label: t("roles.admin") || "Admin" },
              { value: "ROLE_STAFF", label: t("roles.staff") || "Staff" },
            ],
            required: true,
          },
          {
            name: "active",
            label: "Status",
            type: "select",
            options: [
              { value: "true", label: t("staff.status.active") },
              { value: "false", label: t("staff.status.inactive") },
            ],
          },
        ]}
        initialData={
          selectedStaff
            ? {
              ...selectedStaff,
              active: selectedStaff.active ? "true" : "false",
            }
            : undefined
        }
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
        description={
          t("staff.deleteDescription") ||
          "Are you sure you want to delete this staff member?"
        }
        itemName={selectedStaff?.fullName}
      />
    </div>
  );
}
