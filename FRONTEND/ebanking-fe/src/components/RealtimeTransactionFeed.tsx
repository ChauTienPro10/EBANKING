import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Clock,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  generateMockRealtimeTransactions,
  getRandomRealtimeTransactions,
  type RealtimeTransaction,
} from "@/data/mockRealtimeTransactions";

export function RealtimeTransactionFeed() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<RealtimeTransaction[]>([]);

  useEffect(() => {
    // Initial load
    const initial = generateMockRealtimeTransactions(30);
    setTransactions(initial.slice(0, 10));

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      setTransactions((prev) => {
        const newData = getRandomRealtimeTransactions(prev, 3); // Add 3 new transactions
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTransactionIcon = (
    type: RealtimeTransaction["type"],
    status: RealtimeTransaction["status"]
  ) => {
    if (status === "failed") {
      return <XCircle className="h-4 w-4" />;
    }
    if (status === "pending") {
      return <Clock className="h-4 w-4" />;
    }
    if (type === "deposit" || type === "loan_payment") {
      return <ArrowDown className="h-4 w-4" />;
    }
    if (type === "withdraw") {
      return <ArrowUp className="h-4 w-4" />;
    }
    return <ArrowRight className="h-4 w-4" />;
  };

  const getStatusBadge = (status: RealtimeTransaction["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" /> Success
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        );
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === "VND") {
      return `${amount.toLocaleString("vi-VN")} VND`;
    }
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatType = (type: RealtimeTransaction["type"]) => {
    const typeMap: Record<RealtimeTransaction["type"], string> = {
      transfer: "Transfer",
      deposit: "Deposit",
      withdraw: "Withdrawal",
      loan_payment: "Loan Payment",
    };
    return typeMap[type];
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.realtimeTimeline")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`mt-1 flex-shrink-0 ${
                    tx.status === "success"
                      ? "text-green-600"
                      : tx.status === "pending"
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {getTransactionIcon(tx.type, tx.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {formatTime(tx.timestamp)}
                        </span>
                        <span className="text-sm font-semibold truncate">
                          {tx.customerName}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {tx.fromAccount}{" "}
                        {tx.type === "transfer" && `→ ${tx.toAccount}`}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div
                        className={`text-sm font-bold ${
                          tx.status === "success"
                            ? "text-green-600"
                            : tx.status === "pending"
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "deposit" || tx.type === "loan_payment"
                          ? "+"
                          : "-"}
                        {formatAmount(tx.amount, tx.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatType(tx.type)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2">
                    <div className="text-xs text-muted-foreground font-mono">
                      {tx.id}
                    </div>
                    {getStatusBadge(tx.status)}
                  </div>

                  {tx.status === "failed" && tx.reason && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                      {tx.reason}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}





