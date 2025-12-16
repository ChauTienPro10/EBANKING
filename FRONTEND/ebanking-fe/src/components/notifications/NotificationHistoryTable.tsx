import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useTranslation } from "react-i18next";

export function NotificationHistoryTable() {
  const { t } = useTranslation();
  const history = useNotificationStore((state) => state.history);
  const totalHistory = useNotificationStore((state) => state.totalHistory);
  const page = useNotificationStore((state) => state.page);
  const pageSize = useNotificationStore((state) => state.pageSize);
  const filters = useNotificationStore((state) => state.filters);
  const setFilters = useNotificationStore((state) => state.setFilters);
  const setPage = useNotificationStore((state) => state.setPage);
  const loadHistory = useNotificationStore((state) => state.loadHistory);
  const loadingHistory = useNotificationStore((state) => state.loadingHistory);
  const selectNotification = useNotificationStore(
    (state) => state.selectNotification
  );

  useEffect(() => {
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalHistory / pageSize));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notifications.history.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-5">
          <Select
            value={filters.staff ?? "all"}
            onChange={(e) => setFilters({ staff: e.target.value })}
            options={[
              {
                value: "all",
                label: t("notifications.history.filters.staffAll"),
              },
              { value: "Pham Tuan", label: "Pham Tuan" },
              { value: "Tran My", label: "Tran My" },
              { value: "System", label: "System" },
            ]}
          />
          <Select
            value={filters.status ?? "all"}
            onChange={(e) => setFilters({ status: e.target.value })}
            options={[
              {
                value: "all",
                label: t("notifications.history.filters.statusAll"),
              },
              {
                value: "success",
                label: t("notifications.history.status.success"),
              },
              {
                value: "failed",
                label: t("notifications.history.status.failed"),
              },
              {
                value: "scheduled",
                label: t("notifications.history.status.scheduled"),
              },
            ]}
          />
          <Input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => setFilters({ dateFrom: e.target.value })}
          />
          <Input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => setFilters({ dateTo: e.target.value })}
          />
          <Input
            placeholder={t("notifications.history.filters.keyword")}
            value={filters.keyword ?? ""}
            onChange={(e) => setFilters({ keyword: e.target.value })}
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>{t("notifications.history.table.time")}</TH>
                <TH>{t("notifications.history.table.staff")}</TH>
                <TH>{t("notifications.history.table.title")}</TH>
                <TH>{t("notifications.history.table.receivers")}</TH>
                <TH>{t("notifications.form.fields.priority")}</TH>
                <TH>{t("notifications.history.table.status")}</TH>
                <TH>{t("notifications.history.table.action")}</TH>
              </TR>
            </THead>
            <TBody>
              {loadingHistory ? (
                <TR>
                  <TD colSpan={6} className="text-center text-muted-foreground">
                    {t("notifications.history.loading")}
                  </TD>
                </TR>
              ) : history.length === 0 ? (
                <TR>
                  <TD colSpan={6} className="text-center text-muted-foreground">
                    {t("notifications.history.empty")}
                  </TD>
                </TR>
              ) : (
                history.map((item) => (
                  <TR key={item.id}>
                    <TD>{new Date(item.time).toLocaleString()}</TD>
                    <TD>{item.staff}</TD>
                    <TD className="font-medium">{item.title}</TD>
                    <TD>{item.receiverCount.toLocaleString()}</TD>
                    <TD>
                      <Badge
                        variant={
                          item.priority === "high"
                            ? "destructive"
                            : item.priority === "low"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {t(
                          `notifications.form.priority.${
                            item.priority || "normal"
                          }`
                        )}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge
                        variant={
                          item.status === "success"
                            ? "success"
                            : item.status === "failed"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {t(`notifications.history.status.${item.status}`)}
                      </Badge>
                    </TD>
                    <TD>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectNotification(item.id)}
                      >
                        {t("notifications.history.table.view")}
                      </Button>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>
            {t("notifications.history.pagination.info", {
              page,
              totalPages,
              total: totalHistory,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              {t("notifications.history.pagination.prev")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              {t("notifications.history.pagination.next")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
