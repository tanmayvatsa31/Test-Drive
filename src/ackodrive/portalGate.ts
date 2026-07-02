export interface PortalGateUser {
  name: string;
  phone: string;
}

const STORAGE_KEY = "ackodrive_portal_gate_v1";
const SUPERADMIN_KEY = "ackodrive_portal_superadmin";

function parseStoredUser(raw: string): PortalGateUser | null {
  try {
    const parsed = JSON.parse(raw) as PortalGateUser & { email?: string };
    if (parsed.phone) return { name: parsed.name, phone: parsed.phone };
    if (parsed.email) return { name: parsed.name, phone: parsed.email };
    return null;
  } catch {
    return null;
  }
}

export function getPortalGateUser(): PortalGateUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseStoredUser(raw);
  } catch {
    return null;
  }
}

export function setPortalGateUser(user: PortalGateUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("ackodrive_portal_gate_changed"));
}

export function clearPortalGate(): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(SUPERADMIN_KEY);
  window.dispatchEvent(new Event("ackodrive_portal_gate_changed"));
}

export function isSuperadminView(): boolean {
  return sessionStorage.getItem(SUPERADMIN_KEY) === "1";
}

export function setSuperadminView(active: boolean): void {
  if (active) {
    sessionStorage.setItem(SUPERADMIN_KEY, "1");
  } else {
    sessionStorage.removeItem(SUPERADMIN_KEY);
  }
  window.dispatchEvent(new Event("ackodrive_portal_gate_changed"));
}
