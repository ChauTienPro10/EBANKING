import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, TrendingUp, Users, CreditCard, AlertTriangle } from "lucide-react";
import { formatNumber, formatCurrency, formatPercentage } from "@/utils/formatters";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { formatNotificationForDisplay, getNotificationTypeText } from "@/services/notificationService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function DashboardPage() {
  const { t } = useTranslation();
  
  // Use dashboard store
  const {
    stats,
    recentNotifications,
    loading,
    error,
    lastUpdated,
    loadDashboardData,
    clearError,
    getSuccessRate,
    getLockRate,
    getTransactionsPerUser,
    getAccountsPerUser,
  } = useDashboardStore();

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  // Process chart data
  const accountTypeData = stats?.accountTypeDistribution ?? [];

  // Format recent notifications
  const formattedNotifications = recentNotifications.map(notification => ({
    ...notification,
    ...formatNotificationForDisplay(notification),
    typeText: getNotificationTypeText(notification.type),
  }));

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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Lỗi tải dữ liệu</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => { clearError(); loadDashboardData(); }} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center">{t("dashboard.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Cập nhật lần cuối: {lastUpdated?.toLocaleTimeString('vi-VN') || 'Chưa cập nhật'}
          </p>
        </div>
        <Button onClick={loadDashboardData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng khách hàng
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.totalUsers)}</div>
              <p className="text-xs text-muted-foreground">
                Người dùng trong hệ thống
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng giao dịch
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.totalTransactions)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(stats?.totalTransactionsToday)} giao dịch hôm nay
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng số tiền
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Hôm nay: {formatCurrency(stats?.totalAmountToday)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng tài khoản
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.totalAccounts)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(stats?.lockedAccounts)} tài khoản bị khóa
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Giao dịch đáng ngờ
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatNumber(stats?.suspiciousTransactions)}
              </div>
              <p className="text-xs text-muted-foreground">
                Cần kiểm tra
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Giao dịch chờ xử lý
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {formatNumber(stats?.pendingTransactions)}
              </div>
              <p className="text-xs text-muted-foreground">
                Đang chờ xử lý
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tỷ lệ thành công
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(getSuccessRate())}
              </div>
              <p className="text-xs text-muted-foreground">
                Giao dịch thành công
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Giao dịch thất bại
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatNumber(stats?.failedTransactions)}
              </div>
              <p className="text-xs text-muted-foreground">
                Giao dịch lỗi
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary Overview */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan hệ thống</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng khách hàng:</span>
                  <span className="font-semibold">{formatNumber(stats?.totalUsers)} người</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng giao dịch:</span>
                  <span className="font-semibold">{formatNumber(stats?.totalTransactions)} giao dịch</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng số tiền:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(stats?.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tổng tài khoản:</span>
                  <span className="font-semibold">{formatNumber(stats?.totalAccounts)} tài khoản</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Hoạt động hôm nay</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Giao dịch:</span>
                    <span className="font-semibold">{formatNumber(stats?.totalTransactionsToday)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Số tiền:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(stats?.totalAmountToday)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Phân bố loại tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={accountTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) =>
                      `${type}: ${count}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1.0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Thống kê giao dịch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Thành công:</span>
                <span className="font-semibold text-green-600">{formatNumber(stats?.successfulTransactions)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Thất bại:</span>
                <span className="font-semibold text-red-600">{formatNumber(stats?.failedTransactions)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Chờ xử lý:</span>
                <span className="font-semibold text-amber-600">{formatNumber(stats?.pendingTransactions)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Đáng ngờ:</span>
                <span className="font-semibold text-destructive">{formatNumber(stats?.suspiciousTransactions)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Tỷ lệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tỷ lệ thành công:</span>
                <span className="font-semibold text-green-600">{formatPercentage(getSuccessRate())}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tỷ lệ khóa:</span>
                <span className="font-semibold text-amber-600">{formatPercentage(getLockRate())}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">GD/Khách hàng:</span>
                <span className="font-semibold text-blue-600">{getTransactionsPerUser().toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">TK/Khách hàng:</span>
                <span className="font-semibold text-blue-600">{getAccountsPerUser().toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tổng tài khoản:</span>
                <span className="font-semibold">{formatNumber(stats?.totalAccounts)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Đang hoạt động:</span>
                <span className="font-semibold text-green-600">{formatNumber((stats?.totalAccounts || 0) - (stats?.lockedAccounts || 0))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bị khóa:</span>
                <span className="font-semibold text-red-600">{formatNumber(stats?.lockedAccounts)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Thông báo gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>ID</TH>
                  <TH>Loại</TH>
                  <TH>Tiêu đề</TH>
                  <TH>Nội dung</TH>
                  <TH>Người nhận</TH>
                  <TH>Thời gian</TH>
                </TR>
              </THead>
              <TBody>
                {formattedNotifications.length === 0 ? (
                  <TR>
                    <TD colSpan={6} className="text-center text-muted-foreground">
                      Chưa có thông báo nào
                    </TD>
                  </TR>
                ) : (
                  formattedNotifications.map((notification) => (
                    <TR key={notification.id}>
                      <TD className="font-mono text-sm">{notification.id}</TD>
                      <TD>
                        <Badge variant="outline">{notification.typeText}</Badge>
                      </TD>
                      <TD className="font-medium max-w-xs truncate">
                        {notification.title}
                      </TD>
                      <TD className="max-w-sm truncate text-sm text-muted-foreground">
                        {notification.content}
                      </TD>
                      <TD className="text-sm">
                        {notification.username || '-'}
                      </TD>
                      <TD className="text-sm">{notification.time}</TD>
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
