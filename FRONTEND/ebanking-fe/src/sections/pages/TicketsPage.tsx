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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useTicketStore } from "@/stores/useTicketStore";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import type { Ticket } from "@/services/mock/ticketService";
import { Plus, Send } from "lucide-react";

export function TicketsPage() {
  const { t } = useTranslation();
  const {
    data,
    loading,
    pagination,
    filters,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    addMessage,
    setPage,
    setLimit,
    setSearch,
    setFilter,
  } = useTicketStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, pagination.limit, filters, fetchTickets]);

  const handleCreate = async (formData: Record<string, unknown>) => {
    try {
      await createTicket({
        customerId: formData.customerId,
        customerName: formData.customerName,
        category: formData.category,
        priority: formData.priority,
        issue: formData.issue,
        status: formData.status || "open",
        assignedTo: formData.assignedTo,
      });
      toast({ type: "success", title: "Created successfully" });
    } catch (error) {
      toast({ type: "error", title: "Failed to create ticket", description: (error as Error).message });
    }
  };

  const handleEdit = async (formData: Record<string, unknown>) => {
    if (!selectedTicket) return;
    try {
      await updateTicket(selectedTicket.id, formData);
      toast({ type: "success", title: "Updated successfully" });
      setEditModalOpen(false);
      setSelectedTicket(null);
    } catch (error) {
      toast({ type: "error", title: "Failed to update ticket", description: (error as Error).message });
    }
  };

  const handleDelete = async () => {
    if (!selectedTicket) return;
    try {
      await deleteTicket(selectedTicket.id);
      toast({ type: "success", title: "Deleted successfully" });
      setDeleteModalOpen(false);
      setSelectedTicket(null);
    } catch (error) {
      toast({ type: "error", title: "Failed to delete ticket", description: (error as Error).message });
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      await addMessage(selectedTicket.id, {
        sender: "staff",
        senderName: "Current User",
        content: replyText,
      });
      toast({ type: "success", title: "Reply sent successfully" });
      setReplyText("");
      setReplyModalOpen(false);
      // Refresh to get updated messages
      await fetchTickets();
      // Reopen view modal to show updated messages
      const updatedTicket = data.find((t) => t.id === selectedTicket.id);
      if (updatedTicket) setSelectedTicket(updatedTicket);
    } catch (error) {
      toast({ type: "error", title: "Failed to send reply", description: (error as Error).message });
    }
  };

  const handleStatusChange = async (status: Ticket["status"]) => {
    if (!selectedTicket) return;
    try {
      await updateTicket(selectedTicket.id, { status });
      toast({ type: "success", title: "Status updated successfully" });
      await fetchTickets();
      const updated = data.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    } catch (error) {
      toast({ type: "error", title: "Failed to update status", description: (error as Error).message });
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Customer", "Category", "Priority", "Status", "Created At"];
    const rows = data.map((t) => [t.ticketId, t.customerName, t.category, t.priority, t.status, t.createdAt]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-${new Date().toISOString()}.csv`;
    a.click();
    toast({ type: "success", title: "Exported to CSV" });
  };

  const columns: Column<Ticket>[] = [
    {
      key: "ticketId",
      header: t("tickets.table.id") || "Ticket ID",
      render: (item) => <span className="font-medium">{item.ticketId}</span>,
    },
    {
      key: "customerName",
      header: t("tickets.table.customer") || "Customer",
    },
    {
      key: "issue",
      header: t("tickets.table.subject") || "Subject",
      render: (item) => <span className="truncate max-w-xs">{item.issue}</span>,
    },
    {
      key: "category",
      header: t("tickets.table.category") || "Category",
    },
    {
      key: "priority",
      header: t("tickets.table.priority") || "Priority",
      render: (item) => {
        const priorityMap: Record<string, "failed" | "pending" | "active"> = {
          urgent: "failed",
          high: "failed",
          medium: "pending",
          low: "active",
        };
        return (
          <StatusBadge
            status={priorityMap[item.priority] || "pending"}
            label={item.priority}
          />
        );
      },
    },
    {
      key: "status",
      header: t("tickets.table.status") || "Status",
      render: (item) => {
        const statusMap: Record<string, "success" | "pending" | "failed"> = {
          resolved: "success",
          closed: "success",
          "in-progress": "pending",
          open: "pending",
        };
        return <StatusBadge status={statusMap[item.status] || "pending"} label={item.status} />;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{t("tickets.title") || "Support Tickets"}</CardTitle>
            <div className="flex gap-2">
              <ExportButton onExportCSV={handleExportCSV} />
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("tickets.create") || "Create Ticket"}
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
                placeholder={t("tickets.search") || "Search tickets..."}
              />
            </div>
            <Select
              value={filters.status || "all"}
              onChange={(e) => setFilter({ status: e.target.value === "all" ? undefined : e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="all">{t("tickets.statusAll") || "All Status"}</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </Select>
            <Select
              value={filters.category || "all"}
              onChange={(e) => setFilter({ category: e.target.value === "all" ? undefined : e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="all">{t("tickets.filterAllCategory") || "All Categories"}</option>
              <option value="payment">Payment</option>
              <option value="account">Account</option>
              <option value="security">Security</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
            </Select>
            <Select
              value={filters.priority || "all"}
              onChange={(e) => setFilter({ priority: e.target.value === "all" ? undefined : e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="all">{t("tickets.filterAllPriority") || "All Priorities"}</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            onView={(item) => {
              setSelectedTicket(item);
              setViewModalOpen(true);
            }}
            onEdit={(item) => {
              setSelectedTicket(item);
              setEditModalOpen(true);
            }}
            onDelete={(item) => {
              setSelectedTicket(item);
              setDeleteModalOpen(true);
            }}
            emptyMessage={t("tickets.empty") || "No tickets found"}
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

      {selectedTicket && (
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogClose />
            <DialogHeader>
              <DialogTitle>
                {selectedTicket.issue} - {selectedTicket.ticketId}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">{t("tickets.customer") || "Customer"}</label>
                  <p className="font-medium">{selectedTicket.customerName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("tickets.category") || "Category"}</label>
                  <p className="font-medium">{selectedTicket.category}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("tickets.priority") || "Priority"}</label>
                  <StatusBadge
                    status={
                      selectedTicket.priority === "urgent" || selectedTicket.priority === "high"
                        ? "failed"
                        : selectedTicket.priority === "medium"
                        ? "pending"
                        : "active"
                    }
                    label={selectedTicket.priority}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("tickets.status") || "Status"}</label>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={
                        selectedTicket.status === "resolved" || selectedTicket.status === "closed"
                          ? "success"
                          : "pending"
                      }
                      label={selectedTicket.status}
                    />
                    {selectedTicket.status !== "closed" && (
                      <Select
                        value={selectedTicket.status}
                        onChange={(e) => handleStatusChange(e.target.value as Ticket["status"])}
                        className="h-8 w-32"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{t("tickets.messages") || "Messages"}</h4>
                  {selectedTicket.status !== "closed" && (
                    <Button size="sm" onClick={() => setReplyModalOpen(true)}>
                      <Send className="mr-2 h-4 w-4" />
                      {t("tickets.reply") || "Reply"}
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {selectedTicket.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.sender === "customer"
                          ? "bg-muted"
                          : "bg-primary/10"
                      }`}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm">{msg.senderName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={replyModalOpen} onOpenChange={setReplyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("tickets.reply") || "Reply to Ticket"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t("tickets.replyMessage") || "Your Reply"}</label>
              <textarea
                className="w-full min-h-[120px] rounded-md border p-2"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t("tickets.replyPlaceholder") || "Type your reply here..."}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReplyModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReply} disabled={!replyText.trim() || loading}>
                <Send className="mr-2 h-4 w-4" />
                {t("tickets.sendReply") || "Send Reply"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CRUDModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title={t("tickets.create") || "Create Ticket"}
        fields={[
          { name: "customerId", label: t("tickets.customerId") || "Customer ID", required: true },
          { name: "customerName", label: t("tickets.customerName") || "Customer Name", required: true },
          {
            name: "category",
            label: t("tickets.category") || "Category",
            type: "select",
            options: [
              { value: "payment", label: "Payment" },
              { value: "account", label: "Account" },
              { value: "security", label: "Security" },
              { value: "technical", label: "Technical" },
              { value: "billing", label: "Billing" },
            ],
            required: true,
          },
          {
            name: "priority",
            label: t("tickets.priority") || "Priority",
            type: "select",
            options: [
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ],
            required: true,
          },
          { name: "issue", label: t("tickets.issue") || "Issue", required: true },
          {
            name: "status",
            label: t("tickets.status") || "Status",
            type: "select",
            options: [
              { value: "open", label: "Open" },
              { value: "in-progress", label: "In Progress" },
            ],
          },
          { name: "assignedTo", label: t("tickets.assignedTo") || "Assigned To" },
        ]}
        onSubmit={handleCreate}
        loading={loading}
      />

      <CRUDModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setSelectedTicket(null);
        }}
        title={t("tickets.edit") || "Edit Ticket"}
        fields={[
          { name: "customerId", label: t("tickets.customerId") || "Customer ID", required: true },
          { name: "customerName", label: t("tickets.customerName") || "Customer Name", required: true },
          {
            name: "category",
            label: t("tickets.category") || "Category",
            type: "select",
            options: [
              { value: "payment", label: "Payment" },
              { value: "account", label: "Account" },
              { value: "security", label: "Security" },
              { value: "technical", label: "Technical" },
              { value: "billing", label: "Billing" },
            ],
            required: true,
          },
          {
            name: "priority",
            label: t("tickets.priority") || "Priority",
            type: "select",
            options: [
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ],
            required: true,
          },
          { name: "issue", label: t("tickets.issue") || "Issue", required: true },
          {
            name: "status",
            label: t("tickets.status") || "Status",
            type: "select",
            options: [
              { value: "open", label: "Open" },
              { value: "in-progress", label: "In Progress" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
            ],
          },
          { name: "assignedTo", label: t("tickets.assignedTo") || "Assigned To" },
        ]}
        initialData={selectedTicket || undefined}
        onSubmit={handleEdit}
        loading={loading}
      />

      <DeleteConfirm
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) setSelectedTicket(null);
        }}
        onConfirm={handleDelete}
        title={t("tickets.deleteTitle") || "Delete Ticket"}
        description={t("tickets.deleteDescription") || "Are you sure you want to delete this ticket?"}
        itemName={selectedTicket?.ticketId}
      />
    </div>
  );
}
