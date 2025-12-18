import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Home,
  CreditCard,
  Users,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  Wallet,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Role = "Admin" | "Staff";

const NAV_ITEMS = [
  {
    to: "/app",
    label: "Dashboard",
    translationKey: "dashboard",
    icon: Home,
    roles: ["Admin", "Staff"] as Role[],
  },
  {
    to: "/app/transactions",
    label: "Transactions",
    translationKey: "transactions",
    icon: CreditCard,
    roles: ["Admin", "Staff"] as Role[],
  },
  {
    to: "/app/accounts",
    label: "Accounts",
    translationKey: "accounts",
    icon: Wallet,
    roles: ["Admin", "Staff"] as Role[],
  },
  {
    to: "/app/notifications",
    label: "Notifications",
    translationKey: "notifications",
    icon: Bell,
    roles: ["Admin", "Staff"] as Role[],
  },
  {
    to: "/app/staff",
    label: "Staff",
    translationKey: "staff",
    icon: Users,
    roles: ["Admin"] as Role[],
  },
  {
    to: "/app/audit",
    label: "Audit & Security",
    translationKey: "audit",
    icon: ShieldCheck,
    roles: ["Admin"] as Role[],
  },
];

export function DashboardLayout() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [role, setRole] = useState<Role>(
    () => (localStorage.getItem("role") as Role) || "Staff"
  );
  const [theme, setTheme] = useState<string>(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    localStorage.setItem("role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="grid min-h-svh grid-cols-[260px_1fr] grid-rows-[56px_1fr]">
      <aside className="row-span-2 border-r bg-sidebar p-4">
        <Link to="/app" className="mb-6 block text-lg font-semibold">
          {t("app.title")}
        </Link>
        <div className="mb-4">
          <label className="mb-2 block text-xs text-muted-foreground">
            {t("app.role")}
          </label>
          <select
            className="h-9 w-full rounded-md border bg-background px-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="Admin">{t("app.roles.Admin")}</option>
            <option value="Staff">{t("app.roles.Staff")}</option>
          </select>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.filter((n) => n.roles.includes(role)).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/app"}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                    isActive
                      ? "bg-sidebar-accent text-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  ].join(" ")
                }
              >
                <Icon className="h-4 w-4" />
                {t(`app.nav.${item.translationKey}`)}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <header className="flex items-center justify-between border-b px-4">
        <div className="text-sm text-muted-foreground">
          {t("app.workspace", { role })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={i18n.language}
            onChange={(e) => {
              i18n.changeLanguage(e.target.value);
              localStorage.setItem("lang", e.target.value);
            }}
          >
            <option value="vi">VI</option>
            <option value="en">EN</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            {t("app.logout")} <LogOut className="ml-2 h-4 w-4" />
          </Button>
          <Avatar>U</Avatar>
        </div>
      </header>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
