import accountsData from "@/data/accounts.json";

export interface Account {
  id: string;
  customerId: string;
  type: "Saving" | "Current";
  balance: number;
  currency: string;
  status: "Active" | "Locked";
  createdAt: string;
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

const accountData: Account[] = accountsData.accounts.map((a) => ({
  id: a.id,
  customerId: a.customerId,
  type: a.type as "Saving" | "Current",
  balance: a.balance,
  currency: a.currency,
  status: a.status as "Active" | "Locked",
  createdAt: a.createdAt,
}));

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAccounts(params: PaginationParams): Promise<PaginatedResponse<Account>> {
  await delay(300 + Math.random() * 500);

  let filtered = [...accountData];

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter((a) => a.id.toLowerCase().includes(searchLower) || a.customerId.toLowerCase().includes(searchLower));
  }

  if (params.filter) {
    if (params.filter.type) {
      filtered = filtered.filter((a) => a.type === params.filter.type);
    }
    if (params.filter.status) {
      filtered = filtered.filter((a) => a.status === params.filter.status);
    }
    if (params.filter.customerId) {
      filtered = filtered.filter((a) => a.customerId === params.filter.customerId);
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

export async function createAccount(account: Omit<Account, "id" | "createdAt">): Promise<Account> {
  await delay(400 + Math.random() * 400);

  const newAccount: Account = {
    ...account,
    id: `ACC${String(accountData.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
  };

  accountData.push(newAccount);
  return newAccount;
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
  await delay(400 + Math.random() * 400);

  const index = accountData.findIndex((a) => a.id === id);
  if (index === -1) throw new Error("Account not found");

  accountData[index] = { ...accountData[index], ...updates };
  return accountData[index];
}

export async function deleteAccount(id: string): Promise<void> {
  await delay(300 + Math.random() * 300);

  const index = accountData.findIndex((a) => a.id === id);
  if (index === -1) throw new Error("Account not found");

  accountData.splice(index, 1);
}

export async function getAccountById(id: string): Promise<Account | null> {
  await delay(200);
  return accountData.find((a) => a.id === id) || null;
}

