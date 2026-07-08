import type { DemoState, Lead, Qualification } from "./types";

export type LeadIntentStatus = "wants_to_buy" | "still_exploring" | "not_interested";

export const LEAD_INTENT_STATUS_OPTIONS: { value: LeadIntentStatus; label: string }[] = [
  { value: "wants_to_buy", label: "Wants to buy" },
  { value: "still_exploring", label: "Still exploring" },
  { value: "not_interested", label: "Not interested" },
];

export function qualificationToIntentStatus(qualification: Qualification | null): LeadIntentStatus {
  if (qualification === "qualified") return "wants_to_buy";
  if (qualification === "browsing") return "not_interested";
  return "still_exploring";
}

export function intentStatusToQualification(status: LeadIntentStatus): Qualification {
  if (status === "wants_to_buy") return "qualified";
  if (status === "not_interested") return "browsing";
  return "undecided";
}

export function resolveLeadIntentStatus(
  lead: Lead,
  demoState: DemoState,
  override?: LeadIntentStatus,
): LeadIntentStatus {
  if (override) return override;

  const fromSource = parseQualificationFromSource(lead.source ?? "");
  if (fromSource) return qualificationToIntentStatus(fromSource);

  if (demoState.leadId === lead.id) {
    if (demoState.qualification) return qualificationToIntentStatus(demoState.qualification);
    if (demoState.rideComplete) return "still_exploring";
  }

  if (lead.status === "rejected") return "not_interested";
  if (lead.status === "completed") return "still_exploring";
  return "still_exploring";
}

export function intentStatusLabel(status: LeadIntentStatus): string {
  return LEAD_INTENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function parseQualificationFromSource(source: string): Qualification | null {
  const match = source.match(/:qual:(qualified|undecided|browsing)/);
  if (!match) return null;
  return match[1] as Qualification;
}

export function upsertQualInSource(
  source: string,
  qualification: Qualification,
  rideClosedAt?: string,
): string {
  let next = source
    .replace(/:qual:(qualified|undecided|browsing)/, "")
    .replace(/:ride_closed:[^:]+/, "");
  if (rideClosedAt) next += `:ride_closed:${rideClosedAt}`;
  return `${next}:qual:${qualification}`;
}
