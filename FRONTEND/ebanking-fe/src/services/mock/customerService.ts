import usersData from "@/data/users.json";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycStatus: "Verified" | "Pending" | "Rejected";
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

const customerData: Customer[] = usersData.customers.map((c) => ({
  id: c.id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  kycStatus: c.kycStatus as "Verified" | "Pending" | "Rejected",
  status: c.status as "Active" | "Locked",
  createdAt: c.createdAt,
}));

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCustomers(params: PaginationParams): Promise<PaginatedResponse<Customer>> {
  await delay(300 + Math.random() * 500);

  let filtered = [...customerData];

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.phone.includes(searchLower)
    );
  }

  if (params.filter) {
    if (params.filter.status) {
      filtered = filtered.filter((c) => c.status === params.filter.status);
    }
    if (params.filter.kycStatus) {
      filtered = filtered.filter((c) => c.kycStatus === params.filter.kycStatus);
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

export async function createCustomer(customer: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
  await delay(400 + Math.random() * 400);

  const newCustomer: Customer = {
    ...customer,
    id: `C${String(customerData.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
  };

  customerData.push(newCustomer);
  return newCustomer;
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  await delay(400 + Math.random() * 400);

  const index = customerData.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Customer not found");

  customerData[index] = { ...customerData[index], ...updates };
  return customerData[index];
}

export async function deleteCustomer(id: string): Promise<void> {
  await delay(300 + Math.random() * 300);

  const index = customerData.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Customer not found");

  customerData.splice(index, 1);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  await delay(200);
  return customerData.find((c) => c.id === id) || null;
}

