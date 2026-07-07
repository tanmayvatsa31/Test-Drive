import { DEMO_OTP, DEMO_ACCOUNTS, DRIVER_PHONE_TO_ID } from "./constants";
import type { Role, Session } from "./types";

const STORAGE_KEY = "ackodrive_sessions_v1";
const LEGACY_STORAGE_KEY = "ackodrive_session_v1";
const ACKO_DOMAINS = ["acko.com", "acko.tech"];
export const LOGIN_EPOCH_KEY = "ackodrive_login_epoch";

type SessionStore = Partial<Record<Role, Session>>;

function loadStore(): SessionStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SessionStore;

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const session = JSON.parse(legacy) as Session;
      const store: SessionStore = { [session.role]: session };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return store;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return {};
}

function saveStore(store: SessionStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("ackodrive_session_changed"));
}

export function getSession(role?: Role): Session | null {
  const store = loadStore();
  if (role) return store[role] ?? null;
  return (Object.values(store).find(Boolean) as Session | undefined) ?? null;
}

export function setSession(session: Session): void {
  const store = loadStore();
  store[session.role] = session;
  saveStore(store);
  // Stamp a login epoch so propensity scores re-roll on each new login.
  // Only write if not already set (preserves score within the same session).
  if (!sessionStorage.getItem(LOGIN_EPOCH_KEY)) {
    sessionStorage.setItem(LOGIN_EPOCH_KEY, String(Date.now()));
  }
}

export function clearSession(role?: Role): void {
  if (role) {
    const store = loadStore();
    delete store[role];
    saveStore(store);
    // Clear epoch only when fully logged out (no roles remain).
    if (!Object.values(loadStore()).some(Boolean)) {
      sessionStorage.removeItem(LOGIN_EPOCH_KEY);
    }
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  sessionStorage.removeItem(LOGIN_EPOCH_KEY);
  window.dispatchEvent(new Event("ackodrive_session_changed"));
}

export function lookupPhone(role: Role, phone: string): { name: string } | null {
  if (role === "customer") return null;
  const accounts = DEMO_ACCOUNTS[role];
  const normalized = phone.replace(/\D/g, "").slice(-10);
  const match = accounts.find((a) => a.phone === normalized);
  return match ? { name: match.name } : null;
}

export function parseAckoEmail(email: string): { name: string; domain: string } | null {
  const match = email.trim().toLowerCase().match(/^([a-z0-9._%+-]+)@([a-z0-9.-]+)$/);
  if (!match || !ACKO_DOMAINS.includes(match[2])) return null;
  const name =
    match[1]
      .replace(/[._-]+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0].toUpperCase() + p.slice(1))
      .join(" ") || "Acko User";
  return { name, domain: match[2] };
}

export function verifyOtp(otp: string): boolean {
  return otp.trim() === DEMO_OTP;
}

/** Normalize to 10-digit Indian mobile (strips +91 / leading 0). */
export function normalizeIndianMobile(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits.slice(-10);
  if (!/^[6-9]\d{9}$/.test(normalized)) return null;
  return normalized;
}

export function formatIndianMobile(phone: string): string {
  const normalized = normalizeIndianMobile(phone) ?? phone.replace(/\D/g, "").slice(-10);
  if (normalized.length !== 10) return phone;
  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}

export function portalUserFromPhone(phone: string): { name: string; phone: string } {
  const normalized = normalizeIndianMobile(phone);
  if (!normalized) throw new Error("Invalid phone");
  return { phone: normalized, name: "User" };
}

export function getDriverIdFromSession(): string | null {
  const session = getSession("driver");
  if (!session?.phone) return null;
  const normalized = session.phone.replace(/\D/g, "").slice(-10);
  return DRIVER_PHONE_TO_ID[normalized] ?? null;
}
