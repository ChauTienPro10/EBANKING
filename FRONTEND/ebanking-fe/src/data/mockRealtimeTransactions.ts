export type RealtimeTransaction = {
  id: string;
  timestamp: string;
  fromAccount: string;
  toAccount: string;
  customerName: string;
  amount: number;
  currency: "VND" | "USD";
  type: "transfer" | "deposit" | "withdraw" | "loan_payment";
  status: "success" | "pending" | "failed";
  reason?: string;
};

const CUSTOMER_NAMES = [
  "Nguyen Van An",
  "Tran Thi Binh",
  "Le Van Cuong",
  "Pham Thi Dung",
  "Hoang Van Em",
  "Vu Thi Phuong",
  "Do Van Giang",
  "Bui Thi Ha",
  "Ngo Van Hung",
  "Dang Thi Lan",
  "Ly Van Minh",
  "Nguyen Thi Nga",
  "Tran Van Oanh",
  "Le Thi Phuong",
  "Pham Van Quang",
];

const ACCOUNT_NUMBERS = [
  "ACC001",
  "ACC002",
  "ACC003",
  "ACC004",
  "ACC005",
  "ACC006",
  "ACC007",
  "ACC008",
  "ACC009",
  "ACC010",
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTimestamp(): string {
  const now = new Date();
  const minutesAgo = randomBetween(0, 120); // Last 2 hours
  const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000);
  return timestamp.toISOString();
}

function generateStatus(): "success" | "pending" | "failed" {
  const rand = Math.random();
  if (rand < 0.7) return "success"; // 70%
  if (rand < 0.9) return "pending"; // 20%
  return "failed"; // 10%
}

function generateAmount(currency: "VND" | "USD"): number {
  if (currency === "VND") {
    return randomBetween(100000, 300000000);
  } else {
    return randomBetween(5, 5000);
  }
}

function generateFailedReason(): string {
  const reasons = [
    "Insufficient funds",
    "Account locked",
    "Network timeout",
    "Invalid recipient",
    "Daily limit exceeded",
    "KYC verification required",
  ];
  return randomElement(reasons);
}

export function generateMockRealtimeTransactions(count: number = 30): RealtimeTransaction[] {
  const transactions: RealtimeTransaction[] = [];
  const types: Array<"transfer" | "deposit" | "withdraw" | "loan_payment"> = [
    "transfer",
    "deposit",
    "withdraw",
    "loan_payment",
  ];

  for (let i = 0; i < count; i++) {
    const currency = Math.random() > 0.8 ? "USD" : "VND"; // 80% VND, 20% USD
    const type = randomElement(types);
    const status = generateStatus();
    const amount = generateAmount(currency);
    const customerName = randomElement(CUSTOMER_NAMES);
    const fromAccount = randomElement(ACCOUNT_NUMBERS);
    const toAccount = type === "transfer" ? randomElement(ACCOUNT_NUMBERS.filter((a) => a !== fromAccount)) : fromAccount;

    transactions.push({
      id: `RTX${String(i + 1).padStart(6, "0")}`,
      timestamp: generateTimestamp(),
      fromAccount,
      toAccount,
      customerName,
      amount,
      currency,
      type,
      status,
      reason: status === "failed" ? generateFailedReason() : undefined,
    });
  }

  // Sort by timestamp descending (newest first)
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Function to get a random subset for rotation (simulates new transactions)
export function getRandomRealtimeTransactions(
  existing: RealtimeTransaction[],
  count: number = 5
): RealtimeTransaction[] {
  const newTransactions = generateMockRealtimeTransactions(count);
  // Mix with some existing ones and return top 10
  const combined = [...newTransactions, ...existing].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return combined.slice(0, 10);
}

