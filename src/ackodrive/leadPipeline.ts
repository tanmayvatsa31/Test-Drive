import type { CaseRecord, DemoState, Lead, Qualification } from "./types";
import { upsertQualInSource } from "./leadIntentStatus";

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

const QUALIFIED_FEEDBACK = [
  "Customer is ready to buy — needs final on-road quote from dealership",
  "Customer confirmed high purchase intent — push for booking",
  "Customer wants to proceed — schedule dealer callback for pricing",
  "Customer is ready to book — needs financing and delivery timeline",
] as const;

const UNDECIDED_FEEDBACK = [
  "Customer is undecided — wants to compare variants before deciding",
  "Customer exploring options — schedule follow-up in 1–2 weeks",
  "Customer liked the car but needs more time — send variant comparison",
  "Customer weighing options — dealer follow-up recommended",
] as const;

const BROWSING_FEEDBACK = [
  "Customer enjoyed the drive — wants to compare variants before deciding",
  "Customer is just browsing — nurture with variant comparison content",
  "Customer exploring options — follow up in 2–3 weeks",
  "Customer wants more time before deciding — low urgency lead",
] as const;

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

/** Customer picked a Shivi qualification option after accept/rejecting the call. */
export function hasCustomerCompletedShiviQualification(
  state: Pick<DemoState, "qualification" | "shiviCallInitiated" | "shiviCallAnswered" | "shiviCallRejected">,
): boolean {
  return (
    state.shiviCallInitiated &&
    (state.shiviCallAnswered || state.shiviCallRejected) &&
    state.qualification !== null
  );
}

/** Customer answered the Shivi qualification step (any option). */
export function isLeadQualificationFeedback(
  lead: Lead,
  state: Pick<
    DemoState,
    "leadId" | "qualification" | "shiviCallInitiated" | "shiviCallAnswered" | "shiviCallRejected"
  >,
  activeLeadId: string | null,
): boolean {
  return (
    activeLeadId !== null &&
    lead.id === activeLeadId &&
    hasCustomerCompletedShiviQualification(state)
  );
}

/** @deprecated Use isLeadQualificationFeedback */
export function isLeadBrowsingFeedback(
  lead: Lead,
  state: Pick<
    DemoState,
    "leadId" | "qualification" | "shiviCallInitiated" | "shiviCallAnswered" | "shiviCallRejected"
  >,
  activeLeadId: string | null,
): boolean {
  return isLeadQualificationFeedback(lead, state, activeLeadId);
}

export function getQualificationLeadFeedback(lead: Lead, qualification: Qualification): string {
  const hash = hashLeadId(lead.id);
  if (qualification === "qualified") {
    return QUALIFIED_FEEDBACK[hash % QUALIFIED_FEEDBACK.length];
  }
  if (qualification === "undecided") {
    return UNDECIDED_FEEDBACK[hash % UNDECIDED_FEEDBACK.length];
  }
  return BROWSING_FEEDBACK[hash % BROWSING_FEEDBACK.length];
}

/** @deprecated Use getQualificationLeadFeedback */
export function getBrowsingLeadFeedback(lead: Lead): string {
  return getQualificationLeadFeedback(lead, "browsing");
}

/** Only brand-new slot-booked leads can start a Shivi call. */
export function canInitiateShiviCall(
  lead: Lead,
  cases: CaseRecord[],
  activeLeadId: string | null,
  state?: Pick<
    DemoState,
    "leadId" | "leadSent" | "qualification" | "shiviCallInitiated" | "shiviCallAnswered" | "shiviCallRejected"
  >,
): boolean {
  if (state && isLeadQualificationFeedback(lead, state, activeLeadId)) return false;
  if (state && !isLeadSlotBooked(lead, state)) return false;
  if (lead.status !== "new") return false;
  if (state?.shiviCallInitiated && lead.id === activeLeadId) return false;
  return !isLeadClosed(lead, cases, activeLeadId);
}

export function isLeadInProgress(
  lead: Lead,
  cases: CaseRecord[],
  activeLeadId: string | null,
  state?: Pick<
    DemoState,
    "leadId" | "qualification" | "shiviCallInitiated" | "shiviCallAnswered" | "shiviCallRejected"
  >,
): boolean {
  if (state && isLeadQualificationFeedback(lead, state, activeLeadId)) return false;
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
  state?: Pick<
    DemoState,
    "leadId" | "qualification" | "shiviCallInitiated" | "shiviCallAnswered" | "shiviCallRejected"
  >,
): "warn" | "ok" | "mut" {
  if (state && isLeadQualificationFeedback(lead, state, activeLeadId)) return "mut";
  if (isLeadClosed(lead, cases, activeLeadId)) return "mut";
  if (lead.status === "new") return "warn";
  return "ok";
}

export function leadStatusLabel(
  lead: Lead,
  cases: CaseRecord[],
  activeLeadId: string | null,
  state?: Pick<
    DemoState,
    "leadId" | "qualification" | "shiviCallInitiated" | "shiviCallAnswered" | "shiviCallRejected"
  >,
): string {
  if (state && isLeadQualificationFeedback(lead, state, activeLeadId)) return state.qualification ?? "feedback";
  if (isLeadClosed(lead, cases, activeLeadId)) return "closed";
  if (isLeadInProgress(lead, cases, activeLeadId, state)) return "in progress";
  return lead.status;
}

/** @deprecated Use canInitiateShiviCall */
export function isLeadActive(lead: Lead, cases: CaseRecord[]): boolean {
  return canInitiateShiviCall(lead, cases, null) || lead.status === "contacted";
}

export type LeadDateFilter = "today" | "yesterday" | "custom" | "all";

export type LeadPipelineGroup = {
  dateIso: string;
  heading: string;
  leads: Lead[];
};

export function getLeadCreatedTimestamp(
  lead: Lead,
  demoState?: Pick<DemoState, "leadId" | "leadSent" | "bookingDate">,
): number {
  if (demoState?.leadId === lead.id && demoState.leadSent && demoState.bookingDate) {
    return demoState.bookingDate;
  }
  const fromSource = lead.source ? parseBookedAtFromSource(lead.source) : null;
  if (fromSource) return fromSource.getTime();
  const parsed = Date.parse(lead.created_at);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sortLeadsByCreatedAt(
  leads: Lead[],
  demoState?: Pick<DemoState, "leadId" | "leadSent" | "bookingDate">,
): Lead[] {
  return [...leads].sort(
    (a, b) => getLeadCreatedTimestamp(b, demoState) - getLeadCreatedTimestamp(a, demoState),
  );
}

export function formatLeadCreatedAt(
  lead: Lead,
  demoState?: Pick<DemoState, "leadId" | "leadSent" | "bookingDate">,
): string {
  const ts = getLeadCreatedTimestamp(lead, demoState);
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateGroupHeading(iso: string): string {
  const todayIso = todayIsoDate();
  const yesterdayIso = resolveLeadFilterDate("yesterday", todayIso);
  if (iso === todayIso) return "Today";
  if (iso === yesterdayIso) return "Yesterday";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function groupLeadsByCreationDate(
  leads: Lead[],
  demoState: DemoState,
): LeadPipelineGroup[] {
  const sorted = sortLeadsByCreatedAt(leads, demoState);
  const groups = new Map<string, Lead[]>();

  for (const lead of sorted) {
    const dayIso = toIsoDate(new Date(getLeadCreatedTimestamp(lead, demoState)));
    const bucket = groups.get(dayIso) ?? [];
    bucket.push(lead);
    groups.set(dayIso, bucket);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateIso, groupLeads]) => ({
      dateIso,
      heading: formatDateGroupHeading(dateIso),
      leads: groupLeads,
    }));
}

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

export function parseBookedAtFromSource(source: string): Date | null {
  const marker = ":booked:";
  const idx = source.indexOf(marker);
  if (idx === -1) return null;
  const parsed = Date.parse(source.slice(idx + marker.length));
  return Number.isFinite(parsed) ? new Date(parsed) : null;
}

export function getLeadPipelineDay(
  lead: Lead,
  demoState?: Pick<DemoState, "leadId" | "leadSent" | "bookingDate">,
): Date {
  if (demoState?.leadId === lead.id && demoState.leadSent && demoState.bookingDate) {
    return startOfLocalDay(new Date(demoState.bookingDate));
  }
  const fromSource = lead.source ? parseBookedAtFromSource(lead.source) : null;
  if (fromSource) return startOfLocalDay(fromSource);
  return startOfLocalDay(new Date(lead.created_at));
}

export function isLeadOnPipelineDate(
  lead: Lead,
  isoDate: string,
  demoState?: Pick<DemoState, "leadId" | "leadSent" | "bookingDate">,
): boolean {
  const ts = getLeadCreatedTimestamp(lead, demoState);
  if (!ts) return false;
  return toIsoDate(new Date(ts)) === isoDate;
}

export function isLeadOnLocalDate(lead: Lead, isoDate: string): boolean {
  return isLeadOnPipelineDate(lead, isoDate);
}

export function isLeadSlotBooked(
  lead: Lead,
  demoState: Pick<DemoState, "leadId" | "leadSent">,
): boolean {
  if (demoState.leadId === lead.id && demoState.leadSent) return true;
  return parseBookedAtFromSource(lead.source ?? "") != null;
}

export function isLeadVisibleInOemPipeline(
  lead: Lead,
  demoState: Pick<DemoState, "leadId" | "leadSent">,
): boolean {
  if (lead.status === "pending_slot") {
    return demoState.leadId === lead.id && demoState.leadSent;
  }
  return isLeadSlotBooked(lead, demoState);
}

export function filterSlotBookedLeads(
  leads: Lead[],
  demoState?: Pick<DemoState, "leadId" | "leadSent">,
): Lead[] {
  if (!demoState) return leads.filter((lead) => lead.status !== "pending_slot");
  return leads.filter((lead) => isLeadVisibleInOemPipeline(lead, demoState));
}

export function mergeDemoStateIntoLeads(
  dbLeads: Lead[],
  demoState: Pick<
    DemoState,
    | "leadId"
    | "leadSent"
    | "bookingDate"
    | "customerName"
    | "customerPhoneRaw"
    | "customerPhone"
    | "customerAddress"
    | "pincode"
    | "model"
    | "variant"
    | "shiviCallInitiated"
    | "rideComplete"
    | "qualification"
  >,
): Lead[] {
  if (!demoState.leadSent || !demoState.leadId || !demoState.customerName) {
    return dbLeads;
  }

  const dbLead = dbLeads.find((lead) => lead.id === demoState.leadId);
  const bookedAtIso = demoState.bookingDate
    ? new Date(demoState.bookingDate).toISOString()
    : new Date().toISOString();
  const rawPhone =
    demoState.customerPhoneRaw ||
    demoState.customerPhone.replace(/\D/g, "").slice(-10) ||
    dbLead?.phone ||
    "";

  const merged: Lead = {
    id: demoState.leadId,
    name: demoState.customerName,
    phone: rawPhone.length >= 10 ? rawPhone : (dbLead?.phone ?? demoState.customerPhone),
    address:
      demoState.customerAddress && demoState.customerAddress !== "—"
        ? demoState.customerAddress
        : (dbLead?.address ?? null),
    pincode: demoState.pincode ?? dbLead?.pincode ?? null,
    model_id: demoState.model ?? dbLead?.model_id ?? null,
    model_name: dbLead?.model_name ?? demoState.model ?? "Test drive booking",
    status: demoState.rideComplete
      ? "completed"
      : demoState.shiviCallInitiated
        ? dbLead?.status === "completed" || dbLead?.status === "rejected"
          ? dbLead.status
          : "contacted"
        : "new",
    source: (() => {
      const base = dbLead?.source?.includes(":booked:")
        ? dbLead.source
        : `customer_app:booked:${bookedAtIso}`;
      if (demoState.qualification) {
        return upsertQualInSource(
          base,
          demoState.qualification,
          demoState.rideComplete ? bookedAtIso : undefined,
        );
      }
      return base;
    })(),
    created_at: bookedAtIso,
  };

  const rest = dbLeads.filter((lead) => lead.id !== demoState.leadId);
  return [merged, ...rest];
}

export function buildOemPipelineGroups(
  dbLeads: Lead[],
  demoState: DemoState,
  dateFilter: LeadDateFilter,
  customDate: string,
): LeadPipelineGroup[] {
  const merged = mergeDemoStateIntoLeads(dbLeads, demoState);
  const visible = merged.filter((lead) => isLeadVisibleInOemPipeline(lead, demoState));
  const deduped = dedupeLeadsForPipeline(visible, demoState);

  if (dateFilter === "all") {
    return groupLeadsByCreationDate(deduped, demoState);
  }

  const iso = resolveLeadFilterDate(dateFilter, customDate);
  let byDate = deduped.filter((lead) => isLeadOnPipelineDate(lead, iso, demoState));

  // Keep the live session lead visible under the active date filter.
  if (demoState.leadSent && demoState.leadId) {
    const active = deduped.find((lead) => lead.id === demoState.leadId);
    if (active && !byDate.some((lead) => lead.id === active.id)) {
      byDate = [active, ...byDate];
    }
  }

  const sorted = sortLeadsByCreatedAt(byDate, demoState);

  if (!sorted.length) return [];

  return [
    {
      dateIso: iso,
      heading: formatLeadFilterHeading(dateFilter, customDate),
      leads: sorted,
    },
  ];
}

/** @deprecated Use buildOemPipelineGroups */
export function buildOemPipelineLeads(
  dbLeads: Lead[],
  demoState: DemoState,
  dateFilter: LeadDateFilter,
  customDate: string,
): Lead[] {
  return buildOemPipelineGroups(dbLeads, demoState, dateFilter, customDate).flatMap(
    (group) => group.leads,
  );
}

export function countVisibleOemLeads(dbLeads: Lead[], demoState: DemoState): number {
  return mergeDemoStateIntoLeads(dbLeads, demoState).filter((lead) =>
    isLeadVisibleInOemPipeline(lead, demoState),
  ).length;
}

export function resolveLeadFilterDate(filter: LeadDateFilter, customDate: string): string {
  const today = startOfLocalDay(new Date());
  if (filter === "today" || filter === "all") return toIsoDate(today);
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
  demoState?: Pick<DemoState, "leadId" | "leadSent" | "bookingDate">,
): Lead[] {
  const iso = resolveLeadFilterDate(filter, customDate);
  return leads.filter((lead) => isLeadOnPipelineDate(lead, iso, demoState));
}

/** One row per customer + car — latest booking wins (no duplicate pipeline cards). */
export function dedupeLeadsForPipeline(
  leads: Lead[],
  demoState?: Pick<DemoState, "leadId" | "leadSent" | "bookingDate">,
): Lead[] {
  const byKey = new Map<string, Lead>();
  for (const lead of leads) {
    const key = `${phoneLastDigits(lead.phone)}:${lead.model_id ?? ""}`;
    const existing = byKey.get(key);
    if (
      !existing ||
      getLeadCreatedTimestamp(lead, demoState) > getLeadCreatedTimestamp(existing, demoState)
    ) {
      byKey.set(key, lead);
    }
  }
  return sortLeadsByCreatedAt(Array.from(byKey.values()), demoState);
}

export function formatLeadFilterHeading(filter: LeadDateFilter, customDate: string): string {
  if (filter === "all") return "All dates";
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
