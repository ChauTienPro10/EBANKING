import accountsData from "@/data/accounts.json";
import usersData from "@/data/users.json";

export type AccountStatus = "Active" | "Locked";

export interface Account {
  id: string; // account no
  customerId: string;
  type: string;
  balance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
}

export interface EnrichedAccount extends Account {
  ownerName: string;
  lockReason?: string | null;
  lockedUntil?: string | null;
}

const LS_LOCK_KEY = "ebank_account_lock_overrides";

function readOverrides(): Record<string, { status: AccountStatus; reason?: string; until?: string | null }>
{
  try {
    return JSON.parse(localStorage.getItem(LS_LOCK_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeOverrides(data: Record<string, { status: AccountStatus; reason?: string; until?: string | null }>) {
  localStorage.setItem(LS_LOCK_KEY, JSON.stringify(data));
}

function getAll(): EnrichedAccount[] {
  const accs = (accountsData as any).accounts as Account[];
  const internalUsers = (usersData as any).customers as Array<any>;
  const ownerMap = new Map(internalUsers.map((u) => [u.id, u.name]));
  const overrides = readOverrides();
  return accs.map((a) => {
    const ov = overrides[a.id];
    const status = ov?.status || a.status;
    const lockedUntil = ov?.until ?? null;
    const lockReason = ov?.reason ?? null;
    // auto unlock if until passed
    if (status === "Locked" && lockedUntil && new Date(lockedUntil) <= new Date()) {
      delete overrides[a.id];
      writeOverrides(overrides);
      return { ...a, ownerName: ownerMap.get(a.customerId) || a.customerId, status: "Active", lockReason: null, lockedUntil: null };
    }
    return { ...a, ownerName: ownerMap.get(a.customerId) || a.customerId, status, lockReason, lockedUntil };
  });
}

export async function listAccounts(): Promise<EnrichedAccount[]> {
  return getAll();
}

export async function getAccount(id: string): Promise<EnrichedAccount | null> {
  return getAll().find((a) => a.id === id) || null;
}

export async function lockAccount(id: string, reason: string, until?: string | null) {
  const overrides = readOverrides();
  overrides[id] = { status: "Locked", reason, until: until || null };
  writeOverrides(overrides);
}

export async function unlockAccount(id: string) {
  const overrides = readOverrides();
  delete overrides[id];
  writeOverrides(overrides);
}

