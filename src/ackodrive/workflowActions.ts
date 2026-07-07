import type { DemoState } from "./types";
import {
  buildOemInitiatePatch,
  buildCustomerLeadPatch,
  appendPrivacyAudit,
  deriveStaticOtp,
  markDriverBusy,
  markDriverAvailable,
  pickNextDriver,
  buildCustomerJourneyResetPatch,
  INITIAL_DRIVER_ROSTER,
  maskPhone,
} from "./workflow";
import { updateLeadStatus, deleteAllLeads } from "./hooks/useLeads";
import { insertCase } from "./hooks/useCases";
import { resetSharedDemoState, patchSharedDemoState } from "./hooks/demoStateStore";
import type { Lead } from "./types";
import { EN_ROUTE_SLA_MS, SLOT_HOLD_MS, DEALER, MODELS, BRAND_MODELS } from "./constants";
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
  currentState?: DemoState,
): Promise<void> {
  const intent = intentOverride ?? getCustomerIntent() ?? "testride";

  if (currentState?.leadId === lead.id) {
    const patch: Partial<DemoState> = {
      customerName: lead.name,
      customerPhone: maskPhone(lead.phone),
      customerPhoneRaw: lead.phone,
      customerAddress: lead.address ?? "—",
      pincode: lead.pincode ?? currentState.pincode,
      model: lead.model_id,
      variant: lead.variant ?? currentState.variant,
    };
    if (intent === "testride") {
      patch.qualification = currentState.qualification ?? "undecided";
      patch.testrideAccepted = true;
    } else if (intent === "purchase") {
      patch.qualification = "qualified";
    }
    await setState(patch, `Customer updated test drive — ${lead.name}`);
    return;
  }

  const patch = buildCustomerLeadPatch(
    {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      address: lead.address,
      pincode: lead.pincode,
      model_id: lead.model_id,
    },
    { variant: lead.variant ?? null },
  );
  if (lead.model_name?.includes("·") && !patch.variant) {
    const variantPart = lead.model_name.split("·").pop()?.trim();
    if (variantPart) patch.variant = variantPart;
  }
  if (intent === "testride") {
    patch.qualification = "undecided";
    patch.testrideAccepted = true;
  } else if (intent === "purchase") {
    patch.qualification = "qualified";
  }
  await setState(patch, `Customer booked test drive — ${lead.name}`);
}

export async function initiateShiviCallFromOem(
  setState: SetStateFn,
  state: DemoState,
  lead: Lead,
): Promise<void> {
  if (state.leadId === lead.id && state.customerName) {
    await setState(
      {
        shiviCallInitiated: true,
        shiviCallPlaced: true,
        shiviCallAnswered: false,
        shiviCallRejected: false,
        mlFlagged: true,
      },
      `OEM initiated Shivi call → ${lead.name}`,
    );
  } else {
    const patch = buildOemInitiatePatch(lead);
    await setState(patch, `OEM initiated Shivi call → ${lead.name}`);
  }
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

export async function customerPickShiviCall(setState: SetStateFn, state?: DemoState): Promise<void> {
  const patch: Partial<DemoState> = {
    shiviCallAnswered: true,
    shiviCallPlaced: false,
    shiviCallRejected: false,
  };
  if (!state?.qualification) {
    const intent = getCustomerIntent() ?? "testride";
    const qualification = qualificationForIntent(intent);
    if (qualification) {
      patch.qualification = qualification;
      if (intent === "testride") {
        patch.testrideAccepted = true;
      }
    }
  }
  clearCustomerSessionPrefs();
  await setState(patch, "Customer picked Shivi call");
}

export async function customerRejectShiviCall(setState: SetStateFn): Promise<void> {
  await setState(
    { shiviCallPlaced: false, shiviCallRejected: true },
    "Customer rejected Shivi call",
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

export async function rejectLead(setState: SetStateFn, state: DemoState): Promise<void> {
  if (state.leadId) {
    await updateLeadStatus(state.leadId, "rejected");
  }
  await setState(
    buildCustomerJourneyResetPatch(
      "Your test drive request was declined. You can pick another car and book again.",
    ),
    `Dealer rejected lead from ${state.customerName}`,
  );
}

export async function deleteAllLeadsAndResetDemo(): Promise<void> {
  await deleteAllLeads();
  await resetSharedDemoState();
  await patchSharedDemoState(
    {
      customerNotifyMessage: "Demo reset — you can start a new test drive from the customer app.",
      driverRoster: INITIAL_DRIVER_ROSTER,
    },
    "Dealer deleted all leads and reset demo",
  );
}

export async function closeLeadAsCompleted(setState: SetStateFn, state: DemoState): Promise<void> {
  const catalogModel = BRAND_MODELS.find((m) => m.id === state.model);
  const model = MODELS.find((m) => m.id === state.model);
  const modelLabel = model?.name ?? catalogModel?.name ?? state.model ?? "Car";
  const slot = state.chosenSlot;
  const driver = state.driver;

  if (!state.caseSaved && slot && driver) {
    await insertCase({
      flow_type: "testride",
      status: "completed",
      customer_name: state.customerName,
      pincode: state.pincode,
      phone_masked: state.customerPhone,
      model: modelLabel,
      variant: state.variant,
      slot: `${slot.label} · ${slot.time}`,
      date_class: state.dateClass,
      dealer: DEALER.name,
      driver_name: driver.name,
      driver_reg: driver.reg,
      otp: state.otp,
      on_road_price: null,
      rating: null,
      feedback: "Closed by dealer",
    });
  }

  if (state.leadId) {
    await updateLeadStatus(state.leadId, "completed");
  }

  const roster = state.driver ? markDriverAvailable(state.driverRoster, state.driver.id) : state.driverRoster;

  await setState(
    {
      caseSaved: true,
      leadClosed: true,
      driver: null,
      driverRoster: roster,
      customerNotifyMessage: "Your test drive is complete. Thank you!",
    },
    `Dealer marked lead completed and closed for ${state.customerName}`,
  );
}
