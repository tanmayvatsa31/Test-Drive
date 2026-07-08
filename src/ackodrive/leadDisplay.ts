import { BRAND_MODELS, MODELS } from "./constants";
import { propensityLabel, propensityScore, hasCustomerCompletedShiviQualification } from "./leadPipeline";
import { parseQualificationFromSource } from "./leadIntentStatus";
import { computePropensityFromQualification } from "./oemAnalytics";
import type { DemoState, Lead } from "./types";

export type LeadDisplay = {
  badgeLabel: string;
  name: string;
  pincode: string;
  modelLine: string;
  propensity: number;
  intentLabel: ReturnType<typeof propensityLabel>;
  driverName: string | null;
};

function parseModelName(modelName: string | null): { model: string; variant: string } {
  if (!modelName?.trim()) return { model: "—", variant: "—" };
  const parts = modelName.split("·").map((part) => part.trim());
  if (parts.length >= 2) {
    return { model: parts.slice(0, -1).join(" · "), variant: parts[parts.length - 1] ?? "—" };
  }
  return { model: modelName.trim(), variant: "—" };
}

/** Single source of truth for lead fields shown on dealer + OEM portals. */
export function resolveLeadDisplay(
  lead: Lead,
  demoState: DemoState,
  loginEpoch: number,
): LeadDisplay {
  const isActive = demoState.leadId === lead.id;

  if (isActive) {
    const catalogModel =
      BRAND_MODELS.find((m) => m.id === demoState.model) ??
      MODELS.find((m) => m.id === demoState.model);
    const modelName = catalogModel?.name ?? parseModelName(lead.model_name).model;
    const variant = demoState.variant ?? parseModelName(lead.model_name).variant;
    const phone = demoState.customerPhoneRaw || lead.phone;
    const propensity =
      demoState.propensity ??
      propensityScore(phone, loginEpoch);

    return {
      badgeLabel: `Acko ML · ${
        hasCustomerCompletedShiviQualification(demoState) ? demoState.qualification : "pending"
      }`,
      name: demoState.customerName || lead.name,
      pincode: demoState.pincode || lead.pincode || "—",
      modelLine: `${modelName} · ${variant}`,
      propensity,
      intentLabel: propensityLabel(propensity),
      driverName: demoState.chosenSlot?.driverName ?? null,
    };
  }

  const parsed = parseModelName(lead.model_name);
  const storedQual = parseQualificationFromSource(lead.source ?? "");
  const propensity = storedQual
    ? computePropensityFromQualification(storedQual)
    : propensityScore(lead.phone, loginEpoch);

  return {
    badgeLabel: `Acko ML · ${storedQual ?? (lead.status === "new" ? "pending" : lead.status)}`,
    name: lead.name,
    pincode: lead.pincode ?? "—",
    modelLine: `${parsed.model} · ${parsed.variant}`,
    propensity,
    intentLabel: propensityLabel(propensity),
    driverName: null,
  };
}
