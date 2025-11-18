import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useTranslation } from "react-i18next";
import type { ReceiverMode } from "@/services/mock/notificationService";

interface ReceiverSelectorProps {
  role: "Admin" | "Manager" | "Staff";
}

export function ReceiverSelector({ role }: ReceiverSelectorProps) {
  const { t } = useTranslation();
  const users = useNotificationStore((state) => state.users);
  const userSearch = useNotificationStore((state) => state.userSearch);
  const setUserSearch = useNotificationStore((state) => state.setUserSearch);
  const form = useNotificationStore((state) => state.form);
  const setMode = useNotificationStore((state) => state.setMode);
  const toggleUserSelection = useNotificationStore(
    (state) => state.toggleUserSelection
  );
  const removeUser = useNotificationStore((state) => state.removeUser);
  const loadUsers = useNotificationStore((state) => state.loadUsers);

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    const term = userSearch.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.phone.includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  }, [userSearch, users]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notifications.receiver.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          {([
            { value: "single", label: t("notifications.receiver.single") },
            { value: "multi", label: t("notifications.receiver.multi") },
            {
              value: "broadcast",
              label: t("notifications.receiver.broadcast"),
              disabled: role === "Staff",
            },
          ] as { value: ReceiverMode; label: string; disabled?: boolean }[]).map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                form.mode === option.value ? "border-primary" : ""
              } ${option.disabled ? "opacity-50" : ""}`}
            >
              <input
                type="radio"
                name="receiver-mode"
                value={option.value}
                disabled={option.disabled}
                checked={form.mode === option.value}
                onChange={() => setMode(option.value)}
              />
              {option.label}
              {option.disabled && (
                <span className="text-xs text-muted-foreground">
                  {t("notifications.receiver.broadcastDisabled")}
                </span>
              )}
            </label>
          ))}
        </div>

        {form.mode !== "broadcast" && (
          <div className="space-y-3">
            <Input
              placeholder={t("notifications.receiver.searchPlaceholder")}
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
              }}
            />
            <div className="max-h-40 overflow-auto rounded-md border">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  {t("notifications.receiver.noResults")}
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const selected = form.selectedUsers.some((u) => u.id === user.id);
                  return (
                    <button
                      type="button"
                      key={user.id}
                      onClick={() => toggleUserSelection(user)}
                      className={`flex w-full items-center justify-between border-b px-4 py-2 text-left text-sm last:border-none ${
                        selected ? "bg-muted" : ""
                      }`}
                    >
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.phone} • {user.email}
                        </div>
                      </div>
                      <Badge variant={selected ? "secondary" : "outline"}>
                        {selected ? t("notifications.receiver.selected") : t("notifications.receiver.select")}
                      </Badge>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {form.selectedUsers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {t("notifications.receiver.selectedUsers", { count: form.selectedUsers.length })}
            </p>
            <div className="flex flex-wrap gap-2">
              {form.selectedUsers.map((user) => (
                <Badge key={user.id} className="gap-2">
                  {user.name}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUser(user.id)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


