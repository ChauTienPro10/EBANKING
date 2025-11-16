import ticketsData from "@/data/tickets.json";

export interface Ticket {
  id: string;
  ticketId: string;
  customerId: string;
  customerName: string;
  category: "payment" | "account" | "security" | "technical" | "billing";
  priority: "low" | "medium" | "high" | "urgent";
  issue: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  createdAt: string;
  assignedTo?: string;
  lastUpdated: string;
  messages?: Array<{
    id: string;
    sender: "customer" | "staff";
    senderName: string;
    content: string;
    timestamp: string;
  }>;
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

const ticketData: Ticket[] = ticketsData.tickets.map((t) => ({
  id: t.id,
  ticketId: t.id,
  customerId: t.customerId,
  customerName: t.customerName,
  category: t.category.toLowerCase() as Ticket["category"],
  priority: t.priority.toLowerCase() as Ticket["priority"],
  issue: t.subject,
  status: t.status.toLowerCase().replace(" ", "-") as Ticket["status"],
  createdAt: t.createdAt,
  assignedTo: undefined,
  lastUpdated: t.updatedAt,
  messages: (t.messages || []).map((msg) => ({
    ...msg,
    sender: msg.sender as "customer" | "staff",
  })),
}));

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTickets(
  params: PaginationParams
): Promise<PaginatedResponse<Ticket>> {
  await delay(300 + Math.random() * 500);

  let filtered = [...ticketData];

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.ticketId.toLowerCase().includes(searchLower) ||
        t.customerName.toLowerCase().includes(searchLower) ||
        t.issue.toLowerCase().includes(searchLower)
    );
  }

  if (params.filter) {
    if (params.filter.status) {
      filtered = filtered.filter((t) => t.status === params.filter?.status);
    }
    if (params.filter.category) {
      filtered = filtered.filter((t) => t.category === params.filter?.category);
    }
    if (params.filter.priority) {
      filtered = filtered.filter((t) => t.priority === params.filter?.priority);
    }
  }

  if (params.sort) {
    filtered.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[
        params.sort!.field
      ];
      const bVal = (b as unknown as Record<string, unknown>)[
        params.sort!.field
      ];
      const comparison =
        (aVal as number) > (bVal as number)
          ? 1
          : (aVal as number) < (bVal as number)
          ? -1
          : 0;
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

export async function createTicket(
  ticket: Omit<Ticket, "id" | "ticketId" | "createdAt" | "lastUpdated">
): Promise<Ticket> {
  await delay(400 + Math.random() * 400);

  const now = new Date().toISOString();
  const newTicket: Ticket = {
    ...ticket,
    id: `TKT${String(ticketData.length + 1).padStart(3, "0")}`,
    ticketId: `TKT${String(ticketData.length + 1).padStart(3, "0")}`,
    createdAt: now,
    lastUpdated: now,
    messages: [],
  };

  ticketData.push(newTicket);
  return newTicket;
}

export async function updateTicket(
  id: string,
  updates: Partial<Ticket>
): Promise<Ticket> {
  await delay(400 + Math.random() * 400);

  const index = ticketData.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Ticket not found");

  ticketData[index] = {
    ...ticketData[index],
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  return ticketData[index];
}

export async function deleteTicket(id: string): Promise<void> {
  await delay(300 + Math.random() * 300);

  const index = ticketData.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Ticket not found");

  ticketData.splice(index, 1);
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  await delay(200);
  return ticketData.find((t) => t.id === id) || null;
}

export async function addTicketMessage(
  id: string,
  message: Omit<NonNullable<Ticket["messages"]>[number], "id" | "timestamp">
): Promise<Ticket> {
  if (!message) throw new Error("Message is required");
  await delay(300);
  const ticket = await getTicketById(id);
  if (!ticket) throw new Error("Ticket not found");

  const newMessage: NonNullable<Ticket["messages"]>[number] = {
    id: `MSG${String((ticket.messages?.length || 0) + 1).padStart(3, "0")}`,
    timestamp: new Date().toISOString(),
    sender: message.sender,
    senderName: message.senderName,
    content: message.content,
  };

  return updateTicket(id, {
    messages: [...(ticket.messages || []), newMessage],
  });
}
