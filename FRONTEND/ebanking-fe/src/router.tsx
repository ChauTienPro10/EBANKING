import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { DashboardLayout } from "./sections/layouts/DashboardLayout";
import { DashboardPage } from "./sections/pages/DashboardPage";
import { TransactionsPage } from "./sections/pages/TransactionsPage";
import { StaffPage } from "./sections/pages/StaffPage";
import { AuditPage } from "./sections/pages/AuditPage";
import { LoginPage } from "./sections/pages/LoginPage";
import { NotFoundPage } from "./sections/pages/NotFoundPage";
import { NotificationsPage } from "./sections/pages/NotificationsPage";
import { AccountsPage } from "./sections/pages/AccountsPage";

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
          { path: "audit", element: <AuditPage /> },
          { path: "accounts", element: <AccountsPage /> },
          { path: "notifications", element: <NotificationsPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
