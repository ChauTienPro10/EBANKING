import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import usersData from "@/data/users.json";
import accountsData from "@/data/accounts.json";
import transactionsData from "@/data/transactions.json";
import loansData from "@/data/loans.json";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function DashboardPage() {
  const { t } = useTranslation();
  
  const today = new Date().toISOString().split("T")[0];
  const todayTransactions = transactionsData.transactions.filter(
    (tx) => tx.timestamp.startsWith(today)
  );
  const suspiciousTx = transactionsData.transactions.filter(
    (tx) => tx.status === "Suspicious"
  );
  
  const approvedLoans = loansData.loans.filter((l) => l.status === "Approved").length;
  const pendingLoans = loansData.loans.filter((l) => l.status === "Pending").length;
  const rejectedLoans = loansData.loans.filter((l) => l.status === "Rejected").length;
  
  const savingAccounts = accountsData.accounts.filter((a) => a.type === "Saving").length;
  const currentAccounts = accountsData.accounts.filter((a) => a.type === "Current").length;
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });
  
  const dailyTxData = last7Days.map((date) => {
    const count = transactionsData.transactions.filter((tx) =>
      tx.timestamp.startsWith(date)
    ).length;
    return { date: new Date(date).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }), count };
  });
  
  const accountTypeData = [
    { name: "Saving", value: savingAccounts },
    { name: "Current", value: currentAccounts },
  ];
  
  const recentTransactions = transactionsData.transactions
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

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
              {usersData.customers.length}
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
              {accountsData.accounts.length}
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
              {todayTransactions.length}
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
              {suspiciousTx.length}
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
              <CardTitle className="text-sm">{t("dashboard.metrics.loansApproved")}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-green-600">
              {approvedLoans}
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
              <CardTitle className="text-sm">{t("dashboard.metrics.loansPending")}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-amber-600">
              {pendingLoans}
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
              <CardTitle className="text-sm">{t("dashboard.metrics.loansRejected")}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-red-600">
              {rejectedLoans}
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
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {accountTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                {recentTransactions.map((tx) => (
                  <TR key={tx.id}>
                    <TD className="font-medium">{tx.id}</TD>
                    <TD>{tx.type}</TD>
                    <TD>{tx.amount.toLocaleString("vi-VN")} {tx.currency}</TD>
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
                    <TD>{new Date(tx.timestamp).toLocaleTimeString("vi-VN")}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
