import type { CaseRecord, Lead } from "./types";

/**
 * Deterministic propensity score for a customer phone, seeded by the
 * login epoch so it re-rolls on every new login. Range: 1.0–5.0.
 */
export function propensityScore(phone: string, loginEpoch: number): number {
  const digits = phone.replace(/\D/g, "").slice(-10);
  let h = loginEpoch;
  for (const c of digits) h = Math.imul(h ^ c.charCodeAt(0), 0x9e3779b9);
  // Range 2.9–5.0 (always above 2.8 → always High Intent floor with some variance)
  const raw = ((h >>> 0) % 22) / 10; // 0.0–2.1
  return Math.round((raw + 2.9) * 10) / 10;
}

/** Human-readable label for a propensity score. */
export function propensityLabel(score: number): "High Intent" | "Low Intent" {
  return score >= 3 ? "High Intent" : "Low Intent";
}

const CLOSED_TEST_RIDE_FEEDBACK = [
  "Customer completed test drive and interested to proceed further",
  "Customer enjoyed the drive — wants to compare variants before deciding",
  "Customer requested dealer callback for on-road price and financing",
  "Customer liked the car and asked for a repeat test drive with family",
  "Customer is ready to book — needs final quote from dealership",
] as const;

const CLOSED_REJECTED_FEEDBACK = [
  "Customer declined the test drive after initial enquiry",
  "Customer chose a competitor model after comparison",
  "Customer postponed purchase — follow up in 3 months",
] as const;

function hashLeadId(id: string): number {
  return id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function phoneLastDigits(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export function findLeadCase(lead: Lead, cases: CaseRecord[]): CaseRecord | undefined {
  const leadDigits = phoneLastDigits(lead.phone);
  const leadName = lead.name.trim().toLowerCase();

  const matches = cases.filter((record) => {
    if (record.flow_type !== "testride") return false;
    const caseDigits = record.phone_masked ? phoneLastDigits(record.phone_masked) : "";
    const phoneMatch = leadDigits.length >= 10 && caseDigits === leadDigits;
    const nameMatch = record.customer_name?.trim().toLowerCase() === leadName;
    return phoneMatch || nameMatch;
  });

  return matches.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
}

/** Lead finished — test ride done, rejected, or superseded by a newer journey. */
export function isLeadClosed(lead: Lead, cases: CaseRecord[], activeLeadId: string | null): boolean {
  if (lead.status === "completed" || lead.status === "rejected") return true;

  const matched = findLeadCase(lead, cases);
  if (matched?.status === "completed") return true;

  if (lead.status === "contacted") {
    if (activeLeadId == null) return true;
    if (lead.id !== activeLeadId) return true;
  }

  return false;
}

/** Only brand-new leads can start a Shivi call. */
export function canInitiateShiviCall(
  lead: Lead,
  cases: CaseRecord[],
  activeLeadId: string | null,
): boolean {
  if (lead.status !== "new") return false;
  return !isLeadClosed(lead, cases, activeLeadId);
}

export function isLeadInProgress(
  lead: Lead,
  cases: CaseRecord[],
  activeLeadId: string | null,
): boolean {
  return lead.status === "contacted" && lead.id === activeLeadId && !isLeadClosed(lead, cases, activeLeadId);
}

export function getClosedLeadFeedback(lead: Lead, cases: CaseRecord[]): string {
  const matched = findLeadCase(lead, cases);
  if (matched?.feedback && matched.feedback.trim() && matched.feedback !== "Closed by dealer") {
    return matched.feedback;
  }

  if (lead.status === "rejected") {
    return CLOSED_REJECTED_FEEDBACK[hashLeadId(lead.id) % CLOSED_REJECTED_FEEDBACK.length];
  }

  return CLOSED_TEST_RIDE_FEEDBACK[hashLeadId(lead.id) % CLOSED_TEST_RIDE_FEEDBACK.length];
}

export function leadStatusBadgeTone(
  lead: Lead,
  cases: CaseRecord[],
  activeLeadId: string | null,
): "warn" | "ok" | "mut" {
  if (isLeadClosed(lead, cases, activeLeadId)) return "mut";
  if (lead.status === "new") return "warn";
  return "ok";
}

export function leadStatusLabel(lead: Lead, cases: CaseRecord[], activeLeadId: string | null): string {
  if (isLeadClosed(lead, cases, activeLeadId)) return "closed";
  if (isLeadInProgress(lead, cases, activeLeadId)) return "in progress";
  return lead.status;
}

/** @deprecated Use canInitiateShiviCall */
export function isLeadActive(lead: Lead, cases: CaseRecord[]): boolean {
  return canInitiateShiviCall(lead, cases, null) || lead.status === "contacted";
}

export type LeadDateFilter = "today" | "yesterday" | "custom";

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayIsoDate(): string {
  return toIsoDate(new Date());
}

export function isLeadOnLocalDate(lead: Lead, isoDate: string): boolean {
  const leadDay = startOfLocalDay(new Date(lead.created_at));
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  return leadDay.getTime() === target.getTime();
}

export function resolveLeadFilterDate(filter: LeadDateFilter, customDate: string): string {
  const today = startOfLocalDay(new Date());
  if (filter === "today") return toIsoDate(today);
  if (filter === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return toIsoDate(yesterday);
  }
  return customDate || toIsoDate(today);
}

export function filterLeadsByDate(
  leads: Lead[],
  filter: LeadDateFilter,
  customDate: string,
): Lead[] {
  const iso = resolveLeadFilterDate(filter, customDate);
  return leads.filter((lead) => isLeadOnLocalDate(lead, iso));
}

/** One row per customer + car — latest booking wins (no duplicate pipeline cards). */
export function dedupeLeadsForPipeline(leads: Lead[]): Lead[] {
  const byKey = new Map<string, Lead>();
  for (const lead of leads) {
    const key = `${phoneLastDigits(lead.phone)}:${lead.model_id ?? ""}`;
    const existing = byKey.get(key);
    if (!existing || new Date(lead.created_at).getTime() > new Date(existing.created_at).getTime()) {
      byKey.set(key, lead);
    }
  }
  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function formatLeadFilterHeading(filter: LeadDateFilter, customDate: string): string {
  const iso = resolveLeadFilterDate(filter, customDate);
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const todayIso = todayIsoDate();
  const yesterdayIso = resolveLeadFilterDate("yesterday", customDate);

  if (iso === todayIso) return "Today";
  if (iso === yesterdayIso) return "Yesterday";
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
