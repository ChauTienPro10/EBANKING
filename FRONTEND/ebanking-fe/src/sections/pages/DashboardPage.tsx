import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getDashboardStats } from "@/services/dashboardService";
import type { DashboardStats } from "@/services/dashboardService";
import type { Transaction } from "@/services/transactionService";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        setError("dashboard.errors.loadFailed");
      } finally {
        setLoading(false);
      }
    };
    void fetchStats();
  }, [setError]);

  const dailyCounts = stats?.dailyTransactionCounts ?? [];
  const dailyTxData = dailyCounts.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
    }),
  }));

  const typeDist = stats?.accountTypeDistribution ?? [];
  const accountTypeData = typeDist.map((item) => ({
    name: item.type,
    value: item.count,
  }));

  // Recent transactions are not part of stats endpoint, this can be a separate feature.
  const recentTransactions: Transaction[] = [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive">{t(error)}</div>;
  }

  if (!stats) {
    return <div className="text-center">{t("dashboard.loading")}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t("dashboard.metrics.customers")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stats.totalUsers}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t("dashboard.metrics.accounts")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stats.totalAccounts}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t("dashboard.metrics.txToday")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {stats.totalTransactionsToday}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {t("dashboard.metrics.suspicious")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-destructive">
              {stats.suspiciousTransactions}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t("dashboard.metrics.activeUsers")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-green-600">
              {stats.activeUsers}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t("dashboard.metrics.lockedAccounts")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-amber-600">
              {stats.lockedAccounts}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {t("dashboard.metrics.failedTransactions")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-red-600">
              {stats.failedTransactions}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.chartDaily")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.chartAccountTypes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={accountTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {accountTypeData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentTransactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>{t("transactions.table.id")}</TH>
                  <TH>{t("transactions.table.type")}</TH>
                  <TH>{t("transactions.table.amount")}</TH>
                  <TH>{t("transactions.table.status")}</TH>
                  <TH>{t("transactions.table.time")}</TH>
                </TR>
              </THead>
              <TBody>
                {recentTransactions.length === 0 ? (
                  <TR>
                    <TD colSpan={5} className="text-center">
                      {t("dashboard.noRecentTransactions")}
                    </TD>
                  </TR>
                ) : (
                  recentTransactions.map((tx) => (
                    <TR key={tx.transactionId}>
                      <TD className="font-medium">{tx.transactionId}</TD>
                      <TD>{tx.transactionType}</TD>
                      <TD>
                        {tx.amount.toLocaleString("vi-VN")} {tx.currency}
                      </TD>
                      <TD>
                        <Badge
                          variant={
                            tx.status === "Success"
                              ? "success"
                              : tx.status === "Failed"
                              ? "destructive"
                              : tx.status === "Suspicious"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </TD>
                      <TD>
                        {new Date(tx.transactionAt).toLocaleTimeString("vi-VN")}
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
