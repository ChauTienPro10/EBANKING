import transactionsData from "@/data/transactions.json";

export interface Transaction {
  id: string;
  fromAccount: string;
  toAccount: string | null;
  amount: number;
  type: string;
  status: "Success" | "Pending" | "Failed" | "Suspicious";
  timestamp: string;
  currency: string;
  description?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  filter?: Record<string, unknown>;
  sort?: { field: string; direction: "asc" | "desc" };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const transactionData: Transaction[] = transactionsData.transactions.map((t) => ({
  id: t.id,
  fromAccount: t.fromAccount,
  toAccount: t.toAccount,
  amount: t.amount,
  type: t.type,
  status: t.status as "Success" | "Pending" | "Failed" | "Suspicious",
  timestamp: t.timestamp,
  currency: t.currency,
  description: t.description,
}));

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTransactions(params: PaginationParams): Promise<PaginatedResponse<Transaction>> {
  await delay(300 + Math.random() * 500);

  let filtered = [...transactionData];

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.id.toLowerCase().includes(searchLower) ||
        t.fromAccount.toLowerCase().includes(searchLower) ||
        (t.toAccount && t.toAccount.toLowerCase().includes(searchLower))
    );
  }

  if (params.filter) {
    if (params.filter.type) {
      filtered = filtered.filter((t) => t.type === params.filter.type);
    }
    if (params.filter.status) {
      filtered = filtered.filter((t) => t.status === params.filter.status);
    }
    if (params.filter.fromDate && params.filter.toDate) {
      filtered = filtered.filter((t) => {
        const txDate = new Date(t.timestamp);
        return txDate >= new Date(params.filter.fromDate) && txDate <= new Date(params.filter.toDate);
      });
    }
  }

  if (params.sort) {
    filtered.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[params.sort!.field];
      const bVal = (b as Record<string, unknown>)[params.sort!.field];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return params.sort!.direction === "asc" ? comparison : -comparison;
    });
  }

  const total = filtered.length;
  const start = (params.page - 1) * params.limit;
  const end = start + params.limit;
  const paginated = filtered.slice(start, end);

  return {
    data: paginated,
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  await delay(200);
  return transactionData.find((t) => t.id === id) || null;
}

