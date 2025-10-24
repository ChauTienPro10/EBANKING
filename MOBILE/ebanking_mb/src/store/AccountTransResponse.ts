export interface AccountTransResponse {
  accountId: number;
  accountNumber: string;
  accountType: string;       // Ví dụ: "SAVINGS", "CHECKING", ...
  balance: number;
  currency: string;          // Ví dụ: "VND", "USD", ...
  status: string;            // Ví dụ: "ACTIVE", "INACTIVE", ...
  openedDate: string;        // ISO datetime string, ex: "2025-09-27T17:25:04.696299"
  createdAt: string;         // ISO datetime string
}
