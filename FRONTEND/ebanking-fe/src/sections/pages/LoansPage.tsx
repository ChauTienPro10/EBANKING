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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useLoanStore } from "@/stores/useLoanStore";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import type { Loan } from "@/services/mock/loanService";
import { Plus, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function LoansPage() {
  const { t } = useTranslation();
  const {
    data,
    loading,
    pagination,
    filters,
    fetchLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    approveLoan,
    rejectLoan,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useLoanStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  useEffect(() => {
    fetchLoans();
  }, [pagination.page, pagination.limit, filters, fetchLoans]);

  const handleCreate = async (formData: Record<string, unknown>) => {
    try {
      await createLoan({
        customerId: String(formData.customerId || ""),
        customerName: String(formData.customerName || ""),
        productType: (formData.productType as string) || "Personal Loan",
        amount: Number(formData.amount) || 0,
        interestRate: Number(formData.interestRate) || 0,
        durationMonths: Number(formData.durationMonths) || 0,
        status:
          (formData.status as "pending" | "approved" | "rejected" | "closed") ||
          "pending",
        purpose: formData.purpose as string | undefined,
      });
      toast({ type: "success", title: "Created successfully" });
    } catch (error) {
      toast({
        type: "error",
        title: "Failed to create loan",
        description: (error as Error).message,
      });
    }
  };

  const handleEdit = async (formData: Record<string, unknown>) => {
    if (!selectedLoan) return;
    try {
      await updateLoan(selectedLoan.id, {
        ...formData,
        amount: formData.amount ? Number(formData.amount) : undefined,
        interestRate: formData.interestRate
          ? Number(formData.interestRate)
          : undefined,
        durationMonths: formData.durationMonths
          ? Number(formData.durationMonths)
          : undefined,
      });
      toast({ type: "success", title: "Updated successfully" });
      setEditModalOpen(false);
      setSelectedLoan(null);
    } catch (error) {
      toast({
        type: "error",
        title: "Failed to update loan",
        description: (error as Error).message,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedLoan) return;
    try {
      await deleteLoan(selectedLoan.id);
      toast({ type: "success", title: "Deleted successfully" });
      setDeleteModalOpen(false);
      setSelectedLoan(null);
    } catch (error) {
      toast({
        type: "error",
        title: "Failed to delete loan",
        description: (error as Error).message,
      });
    }
  };

  const handleApprove = async () => {
    if (!selectedLoan) return;
    try {
      await approveLoan(selectedLoan.id, "Current User");
      toast({ type: "success", title: "Loan approved successfully" });
      setViewModalOpen(false);
      setSelectedLoan(null);
    } catch (error) {
      toast({
        type: "error",
        title: "Failed to approve loan",
        description: (error as Error).message,
      });
    }
  };

  const handleReject = async () => {
    if (!selectedLoan) return;
    try {
      await rejectLoan(selectedLoan.id, "Current User");
      toast({ type: "success", title: "Loan rejected" });
      setViewModalOpen(false);
      setSelectedLoan(null);
    } catch (error) {
      toast({
        type: "error",
        title: "Failed to reject loan",
        description: (error as Error).message,
      });
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Customer",
      "Amount",
      "Interest Rate",
      "Duration",
      "Status",
      "Created At",
    ];
    const rows = data.map((l) => [
      l.loanId,
      l.customerName,
      l.amount,
      l.interestRate,
      l.durationMonths,
      l.status,
      l.createdAt,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loans-${new Date().toISOString()}.csv`;
    a.click();
    toast({ type: "success", title: "Exported to CSV" });
  };

  const isHighRisk = (loan: Loan) => loan.amount > 100000000; // 100M VND

  const columns: Column<Loan>[] = [
    {
      key: "loanId",
      header: t("loans.table.id") || "Loan ID",
      render: (item) => <span className="font-medium">{item.loanId}</span>,
    },
    {
      key: "customerName",
      header: t("loans.table.customer") || "Customer",
    },
    {
      key: "amount",
      header: t("loans.table.amount") || "Amount",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span>{item.amount.toLocaleString("vi-VN")} VND</span>
          {isHighRisk(item) && (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          )}
        </div>
      ),
    },
    {
      key: "interestRate",
      header: t("loans.table.interestRate") || "Interest Rate",
      render: (item) => `${item.interestRate}%`,
    },
    {
      key: "durationMonths",
      header: t("loans.table.duration") || "Duration",
      render: (item) =>
        `${item.durationMonths} ${t("loans.months") || "months"}`,
    },
    {
      key: "status",
      header: t("loans.table.status") || "Status",
      render: (item) => {
        const statusMap: Record<string, "success" | "pending" | "failed"> = {
          approved: "success",
          pending: "pending",
          rejected: "failed",
          closed: "success",
        };
        return (
          <StatusBadge
            status={statusMap[item.status] || "pending"}
            label={item.status}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("loans.title") || "Loan Applications"}</CardTitle>
            <div className="flex gap-2">
              <ExportButton onExportCSV={handleExportCSV} />
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("loans.create") || "Add Loan"}
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
                placeholder={t("loans.search") || "Search loans..."}
              />
            </div>
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
                {t("loans.statusAll") || "All Status"}
              </option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onView={(item) => {
              setSelectedLoan(item);
              setViewModalOpen(true);
            }}
            onEdit={(item) => {
              setSelectedLoan(item);
              setEditModalOpen(true);
            }}
            onDelete={(item) => {
              setSelectedLoan(item);
              setDeleteModalOpen(true);
            }}
            emptyMessage={t("loans.empty") || "No loans found"}
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

      {selectedLoan && (
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogClose />
            <DialogHeader>
              <DialogTitle>
                {t("loans.details") || "Loan Details"} - {selectedLoan.loanId}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("loans.customer") || "Customer"}
                  </label>
                  <p className="font-medium">{selectedLoan.customerName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("loans.amount") || "Amount"}
                  </label>
                  <p className="font-medium">
                    {selectedLoan.amount.toLocaleString("vi-VN")} VND
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("loans.interestRate") || "Interest Rate"}
                  </label>
                  <p className="font-medium">{selectedLoan.interestRate}%</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("loans.duration") || "Duration"}
                  </label>
                  <p className="font-medium">
                    {selectedLoan.durationMonths}{" "}
                    {t("loans.months") || "months"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("loans.purpose") || "Purpose"}
                  </label>
                  <p className="font-medium">{selectedLoan.purpose || "-"}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {t("loans.status") || "Status"}
                  </label>
                  <StatusBadge
                    status={
                      selectedLoan.status === "approved"
                        ? "success"
                        : selectedLoan.status === "rejected"
                        ? "failed"
                        : "pending"
                    }
                    label={selectedLoan.status}
                  />
                </div>
                {selectedLoan.approvedBy && (
                  <div>
                    <label className="text-sm text-muted-foreground">
                      {t("loans.approvedBy") || "Approved By"}
                    </label>
                    <p className="font-medium">{selectedLoan.approvedBy}</p>
                  </div>
                )}
              </div>

              {selectedLoan.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t("loans.approve") || "Approve"}
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={handleReject}
                    disabled={loading}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {t("loans.reject") || "Reject"}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <CRUDModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title={t("loans.create") || "Create Loan"}
        fields={[
          {
            name: "customerId",
            label: t("loans.customerId") || "Customer ID",
            required: true,
          },
          {
            name: "customerName",
            label: t("loans.customerName") || "Customer Name",
            required: true,
          },
          {
            name: "productType",
            label: t("loans.productType") || "Product Type",
            type: "select",
            options: [
              { value: "Personal Loan", label: "Personal Loan" },
              { value: "Business Loan", label: "Business Loan" },
              { value: "Mortgage", label: "Mortgage" },
            ],
          },
          {
            name: "amount",
            label: t("loans.amount") || "Amount",
            type: "number",
            required: true,
          },
          {
            name: "interestRate",
            label: t("loans.interestRate") || "Interest Rate (%)",
            type: "number",
            required: true,
          },
          {
            name: "durationMonths",
            label: t("loans.durationMonths") || "Duration (Months)",
            type: "number",
            required: true,
          },
          { name: "purpose", label: t("loans.purpose") || "Purpose" },
          {
            name: "status",
            label: t("loans.status") || "Status",
            type: "select",
            options: [
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
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
          if (!open) setSelectedLoan(null);
        }}
        title={t("loans.edit") || "Edit Loan"}
        fields={[
          {
            name: "customerId",
            label: t("loans.customerId") || "Customer ID",
            required: true,
          },
          {
            name: "customerName",
            label: t("loans.customerName") || "Customer Name",
            required: true,
          },
          {
            name: "productType",
            label: t("loans.productType") || "Product Type",
            type: "select",
            options: [
              { value: "Personal Loan", label: "Personal Loan" },
              { value: "Business Loan", label: "Business Loan" },
              { value: "Mortgage", label: "Mortgage" },
            ],
          },
          {
            name: "amount",
            label: t("loans.amount") || "Amount",
            type: "number",
            required: true,
          },
          {
            name: "interestRate",
            label: t("loans.interestRate") || "Interest Rate (%)",
            type: "number",
            required: true,
          },
          {
            name: "durationMonths",
            label: t("loans.durationMonths") || "Duration (Months)",
            type: "number",
            required: true,
          },
          { name: "purpose", label: t("loans.purpose") || "Purpose" },
          {
            name: "status",
            label: t("loans.status") || "Status",
            type: "select",
            options: [
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "closed", label: "Closed" },
            ],
          },
        ]}
        initialData={
          selectedLoan
            ? (selectedLoan as unknown as Record<string, unknown>)
            : undefined
        }
        onSubmit={handleEdit}
        loading={loading}
      />

      <DeleteConfirm
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) setSelectedLoan(null);
        }}
        onConfirm={handleDelete}
        title={t("loans.deleteTitle") || "Delete Loan"}
        description={
          t("loans.deleteDescription") ||
          "Are you sure you want to delete this loan?"
        }
        itemName={selectedLoan?.loanId}
      />
    </div>
  );
}
