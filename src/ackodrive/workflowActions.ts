import type { DemoState } from "./types";
import {
  buildOemInitiatePatch,
  appendPrivacyAudit,
  deriveStaticOtp,
  markDriverBusy,
  markDriverAvailable,
  pickNextDriver,
} from "./workflow";
import { updateLeadStatus } from "./hooks/useLeads";
import type { Lead } from "./types";
import { EN_ROUTE_SLA_MS, SLOT_HOLD_MS } from "./constants";
import { clearCustomerSessionPrefs, getCustomerIntent, type CustomerIntent } from "./customerIntent";

export type SetStateFn = (patch: Partial<DemoState>, logMessage?: string) => Promise<void>;

function qualificationForIntent(intent: CustomerIntent | null): DemoState["qualification"] {
  if (intent === "purchase") return "qualified";
  if (intent === "testride") return "undecided";
  return null;
}

export async function startCustomerJourney(
  setState: SetStateFn,
  lead: Lead & { variant?: string },
  intentOverride?: CustomerIntent | null,
): Promise<void> {
  const intent = intentOverride ?? getCustomerIntent();
  const patch = buildOemInitiatePatch({
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    address: lead.address,
    pincode: lead.pincode,
    model_id: lead.model_id,
  });
  if (lead.model_name?.includes("·")) {
    const variantPart = lead.model_name.split("·").pop()?.trim();
    if (variantPart) patch.variant = variantPart;
  }
  const qualification = qualificationForIntent(intent);
  if (qualification) {
    patch.qualification = qualification;
  }
  if (intent === "testride") {
    patch.testrideAccepted = true;
  }
  const logSuffix = qualification ? ` (${intent} intent)` : "";
  await setState(patch, `ML flagged ${lead.name} — journey started${logSuffix}`);
  clearCustomerSessionPrefs();
  await updateLeadStatus(lead.id, "contacted");
}

export async function bookDriverTiedSlot(
  setState: SetStateFn,
  slot: DemoState["chosenSlot"],
  extras: Pick<DemoState, "bookingDate" | "dateClass" | "dealerConfirmRequired" | "selectedDealerCode">,
): Promise<void> {
  if (!slot) return;
  await setState(
    {
      chosenSlot: slot,
      bookingDate: extras.bookingDate,
      dateClass: extras.dateClass,
      dealerConfirmRequired: extras.dealerConfirmRequired,
      selectedDealerCode: extras.selectedDealerCode,
      leadSent: true,
      slotHoldExpiresAt: Date.now() + SLOT_HOLD_MS,
    },
    `Customer booked ${slot.label} · ${slot.time}`,
  );
}

export async function allotDriverToRide(
  setState: SetStateFn,
  state: DemoState,
  driverId: string,
  driverName: string,
  driverReg: string,
): Promise<void> {
  const otp = deriveStaticOtp(state.customerPhoneRaw);
  const roster = markDriverBusy(state.driverRoster, driverId);
  await setState(
    {
      driver: { id: driverId, name: driverName, reg: driverReg },
      dealerAcknowledged: true,
      otp,
      customerOtpStatic: otp,
      driverRoster: roster,
      privacyAudit: appendPrivacyAudit(
        state.privacyAudit,
        "Driver assigned — customer phone not exposed to driver",
        "system",
        false,
      ),
    },
    `Driver allotted: ${driverName}`,
  );
}

export async function driverPlacedCall(setState: SetStateFn, logMessage?: string): Promise<void> {
  await setState(
    {
      callPlaced: true,
      callRejected: false,
      enRouteDeadline: Date.now() + EN_ROUTE_SLA_MS,
    },
    logMessage ?? "Driver placed masked confirmation call",
  );
}

export async function customerPickDriverCall(setState: SetStateFn): Promise<void> {
  await setState(
    { custConfirmed: true, callRejected: false },
    "Customer picked driver call",
  );
}

export async function customerRejectDriverCall(setState: SetStateFn): Promise<void> {
  await setState(
    { callPlaced: false, callRejected: true },
    "Customer rejected driver call",
  );
}

export async function handleSlaBreach(setState: SetStateFn, state: DemoState): Promise<boolean> {
  if (!state.callPlaced || state.enRoute || state.rideComplete || !state.enRouteDeadline) return false;
  if (Date.now() <= state.enRouteDeadline) return false;

  const excludeId = state.driver?.id;
  const next = pickNextDriver(state, excludeId);

  if (next && state.driver) {
    let roster = markDriverAvailable(state.driverRoster, state.driver.id);
    roster = markDriverBusy(roster, next.id);
    await setState(
      {
        driver: { id: next.id, name: next.name, reg: next.reg },
        driverRoster: roster,
        reassignmentCount: state.reassignmentCount + 1,
        enRouteDeadline: Date.now() + EN_ROUTE_SLA_MS,
        customerNotifyMessage: `Your driver was reassigned to ${next.name}. Updated ETA ~12 min.`,
        dealerEscalated: false,
      },
      `E2: Auto-reassigned to ${next.name}`,
    );
    return true;
  }

  await setState(
    {
      dealerEscalated: true,
      customerNotifyMessage: "No driver available right now. Please pick an alternate slot or reschedule.",
    },
    "E3: Escalated to dealer — no drivers available",
  );
  return true;
}
