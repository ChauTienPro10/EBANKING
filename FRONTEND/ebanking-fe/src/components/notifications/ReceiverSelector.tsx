import { useEffect, useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useUserStore } from "@/stores/useUserStore";
import { useTranslation } from "react-i18next";
import type { ReceiverMode } from "@/services/notificationService";

interface ReceiverSelectorProps {
  role: "Admin" | "Manager" | "Staff";
}

export function ReceiverSelector({ role }: ReceiverSelectorProps) {
  const { t } = useTranslation();
  
  // Local state for input value to prevent focus loss
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  
  // Use the new user store
  const { 
    filteredUsers, 
    loading: usersLoading, 
    error: usersError,
    searchQuery,
    loadUsers,
    setSearchQuery,
    searchUsers,
    clearError
  } = useUserStore();
  
  // Notification store for form state
  const form = useNotificationStore((state) => state.form);
  const setMode = useNotificationStore((state) => state.setMode);
  const toggleUserSelection = useNotificationStore(
    (state) => state.toggleUserSelection
  );
  const removeUser = useNotificationStore((state) => state.removeUser);

  useEffect(() => {
    console.log('ReceiverSelector: Component mounted, loading users...');
    void loadUsers();
  }, [loadUsers]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setSearchQuery(localSearchQuery);
        searchUsers(localSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, searchQuery, setSearchQuery, searchUsers]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchQuery(value);
  }, []);

  // Clear error when component unmounts or when user interacts
  useEffect(() => {
    if (usersError) {
      console.error('ReceiverSelector: User loading error:', usersError);
    }
  }, [usersError]);

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
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={usersLoading}
            />
            
            {usersError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                <div className="flex items-center justify-between">
                  <span>Lỗi: {usersError}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      clearError();
                      if (localSearchQuery.trim()) {
                        searchUsers(localSearchQuery);
                      } else {
                        loadUsers();
                      }
                    }}
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            )}
            
            <div className="max-h-40 overflow-auto rounded-md border">
              {usersLoading ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Đang tải danh sách người dùng...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  {localSearchQuery ? 
                    `Không tìm thấy người dùng với từ khóa "${localSearchQuery}"` : 
                    "Không có người dùng nào"
                  }
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const selected = form.selectedUsers.some((u) => u.id === user.id);
                  return (
                    <button
                      type="button"
                      key={user.id}
                      onClick={() => toggleUserSelection(user)}
                      className={`flex w-full items-center justify-between border-b px-4 py-2 text-left text-sm last:border-none hover:bg-gray-50 ${
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


