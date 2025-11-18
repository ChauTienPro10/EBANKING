import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { DashboardLayout } from "./sections/layouts/DashboardLayout";
import { DashboardPage } from "./sections/pages/DashboardPage";
import { TransactionsPage } from "./sections/pages/TransactionsPage";
import { StaffPage } from "./sections/pages/StaffPage";
import { CustomersPage } from "./sections/pages/CustomersPage";
import { AccountsPage } from "./sections/pages/AccountsPage";
import { ReportsPage } from "./sections/pages/ReportsPage";
import { AuditPage } from "./sections/pages/AuditPage";
import { TicketsPage } from "./sections/pages/TicketsPage";
import { LogsPage } from "./sections/pages/LogsPage";
import { SettingsPage } from "./sections/pages/SettingsPage";
import { NotificationsPage } from "./sections/pages/NotificationsPage";
import { LoginPage } from "./sections/pages/LoginPage";
import { NotFoundPage } from "./sections/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LoginPage /> },
      {
        path: "app",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "transactions", element: <TransactionsPage /> },
          { path: "staff", element: <StaffPage /> },
          { path: "customers", element: <CustomersPage /> },
          { path: "accounts", element: <AccountsPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "audit", element: <AuditPage /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "tickets", element: <TicketsPage /> },
          { path: "logs", element: <LogsPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);





