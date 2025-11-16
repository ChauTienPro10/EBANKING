import loansData from "@/data/loans.json";

export interface Loan {
  id: string;
  loanId: string;
  customerId: string;
  customerName: string;
  productType: string;
  amount: number;
  interestRate: number;
  durationMonths: number;
  status: "pending" | "approved" | "rejected" | "closed";
  createdAt: string;
  approvedBy?: string;
  disbursementDate?: string;
  purpose?: string;
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

const loanData: Loan[] = loansData.loans.map((l) => ({
  id: l.id,
  loanId: l.id,
  customerId: l.customerId,
  customerName: l.customerName,
  productType: "Personal Loan",
  amount: l.amount,
  interestRate: l.interestRate,
  durationMonths: l.duration,
  status: l.status.toLowerCase() as "pending" | "approved" | "rejected" | "closed",
  createdAt: l.createdAt,
  approvedBy: l.approvedAt ? "Manager One" : undefined,
  disbursementDate: l.approvedAt || undefined,
  purpose: l.purpose,
}));

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getLoans(params: PaginationParams): Promise<PaginatedResponse<Loan>> {
  await delay(300 + Math.random() * 500);

  let filtered = [...loanData];

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.loanId.toLowerCase().includes(searchLower) ||
        l.customerName.toLowerCase().includes(searchLower) ||
        l.customerId.toLowerCase().includes(searchLower)
    );
  }

  if (params.filter) {
    if (params.filter.status) {
      filtered = filtered.filter((l) => l.status === params.filter.status);
    }
    if (params.filter.productType) {
      filtered = filtered.filter((l) => l.productType === params.filter.productType);
    }
    if (params.filter.customerId) {
      filtered = filtered.filter((l) => l.customerId === params.filter.customerId);
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

export async function createLoan(loan: Omit<Loan, "id" | "loanId" | "createdAt">): Promise<Loan> {
  await delay(400 + Math.random() * 400);

  const newLoan: Loan = {
    ...loan,
    id: `LN${String(loanData.length + 1).padStart(3, "0")}`,
    loanId: `LN${String(loanData.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
  };

  loanData.push(newLoan);
  return newLoan;
}

export async function updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
  await delay(400 + Math.random() * 400);

  const index = loanData.findIndex((l) => l.id === id);
  if (index === -1) throw new Error("Loan not found");

  loanData[index] = { ...loanData[index], ...updates };
  return loanData[index];
}

export async function deleteLoan(id: string): Promise<void> {
  await delay(300 + Math.random() * 300);

  const index = loanData.findIndex((l) => l.id === id);
  if (index === -1) throw new Error("Loan not found");

  loanData.splice(index, 1);
}

export async function getLoanById(id: string): Promise<Loan | null> {
  await delay(200);
  return loanData.find((l) => l.id === id) || null;
}

export async function approveLoan(id: string, approvedBy: string): Promise<Loan> {
  await delay(400);
  const loan = await getLoanById(id);
  if (!loan) throw new Error("Loan not found");
  return updateLoan(id, {
    status: "approved",
    approvedBy,
    disbursementDate: new Date().toISOString(),
  });
}

export async function rejectLoan(id: string, approvedBy: string): Promise<Loan> {
  await delay(400);
  return updateLoan(id, {
    status: "rejected",
    approvedBy,
  });
}

