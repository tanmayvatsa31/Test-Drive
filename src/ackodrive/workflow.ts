import { DRIVERS, SLOT_HOLD_MS, EN_ROUTE_SLA_MS, DEALERSHIPS, TIME_SLOTS } from "./constants";
import { MODELS } from "./constants";
import type { DateClass, DemoState, DriverRosterEntry, PrivacyEvent, Slot } from "./types";

export const INITIAL_DRIVER_ROSTER: DriverRosterEntry[] = DRIVERS.map((d) => ({
  id: d.id,
  name: d.name,
  reg: d.reg,
  phone: d.phone,
  available: d.status === "available",
  slotTimes: d.status === "available" ? [...TIME_SLOTS] : [],
  vehicleVariant: d.vehicleVariant,
}));

export const INITIAL_STATE: DemoState = {
  customerName: "",
  pincode: "",
  customerPhone: "",
  customerPhoneRaw: "",
  customerAddress: "",
  shiviCallInitiated: false,
  shiviCallPlaced: false,
  shiviCallAnswered: false,
  shiviCallRejected: false,
  mlFlagged: false,
  leadId: null,
  qualification: null,
  propensity: null,
  testrideAccepted: false,
  model: null,
  variant: null,
  bookingPaid: false,
  bookingDate: null,
  chosenSlot: null,
  dateClass: null,
  dealerConfirmRequired: false,
  leadSent: false,
  dealerAccepted: false,
  dealerAcknowledged: false,
  slotHoldExpiresAt: null,
  calendarFree: null,
  altOptions: [],
  customerReconfirmed: false,
  driver: null,
  driverRoster: INITIAL_DRIVER_ROSTER,
  customerOtpStatic: null,
  otp: null,
  callPlaced: false,
  callRejected: false,
  custConfirmed: false,
  enRoute: false,
  driverAtLocation: false,
  rideComplete: false,
  enRouteDeadline: null,
  reassignmentCount: 0,
  customerNotifyMessage: null,
  dlUploaded: false,
  dlFileName: null,
  rating: null,
  feedback: null,
  caseSaved: false,
  leadClosed: false,
  driverReminderSent: false,
  otpOverride: null,
  privacyAudit: [],
  lastUpdatedAt: null,
  log: [],
  selectedDealerCode: null,
  dealerEscalated: false,
};

export function getVariantPrice(modelId: string, variant: string): number | null {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) return null;
  const idx = model.variants.indexOf(variant);
  return idx < 0 ? null : model.vp[idx];
}

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function classifyDate(fromMs: number, toDate: Date): { dateClass: DateClass; needsConfirm: boolean } {
  const from = new Date(fromMs);
  from.setHours(0, 0, 0, 0);
  const to = new Date(toDate);
  to.setHours(0, 0, 0, 0);
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  let dateClass: DateClass;
  if (days > 30) dateClass = "gt7";
  else if (isWeekend(to)) dateClass = "weekend";
  else if (days < 7) dateClass = "lt7";
  else dateClass = "gt7";
  return { dateClass, needsConfirm: dateClass !== "gt7" };
}

export function isBookingConfirmed(state: DemoState): boolean {
  if (!state.dealerAccepted || !state.driver || !state.dealerAcknowledged) return false;
  if (!state.dealerConfirmRequired) return true;
  if (state.calendarFree === true) return true;
  return state.calendarFree === false && state.customerReconfirmed;
}

/** Customer booked a slot and is waiting on dealer acceptance / driver assignment. */
export function isWaitingForDealerAssignment(state: DemoState): boolean {
  if (!state.chosenSlot || !state.leadSent) return false;
  if (isBookingConfirmed(state)) return false;
  if (
    state.dealerConfirmRequired &&
    state.calendarFree === false &&
    state.altOptions.length > 0 &&
    !state.customerReconfirmed
  ) {
    return false;
  }
  return true;
}

/** Full-screen request in progress — render outside app shell (no header). */
export function shouldShowDealerConfirmingLoader(state: DemoState): boolean {
  if (!hasActiveTestRideIncident(state)) return false;
  if (
    (state.qualification === "undecided" || state.qualification === "browsing") &&
    state.testrideAccepted &&
    state.model &&
    !state.chosenSlot
  ) {
    return false;
  }
  return isWaitingForDealerAssignment(state);
}

/** Full-screen driver en route — Figma 5515-3820. */
export function shouldShowDriverEnRouteScreen(state: DemoState): boolean {
  if (!shouldShowDriverAssignedScreen(state)) return false;
  return state.enRoute && !state.rideComplete;
}

/** Full-screen incoming Shivi call — only after OEM initiates from portal. */
export function shouldShowIncomingShiviCallScreen(state: DemoState): boolean {
  return (
    state.shiviCallInitiated &&
    state.shiviCallPlaced &&
    !state.shiviCallAnswered &&
    !state.shiviCallRejected
  );
}

/** Full-screen incoming masked call — before driver assigned content. */
export function shouldShowIncomingDriverCallScreen(state: DemoState): boolean {
  if (!shouldShowDriverAssignedScreen(state)) return false;
  return state.callPlaced && !state.custConfirmed;
}

/** Full-screen driver assigned — render outside app shell (custom toolbar only). */
export function shouldShowDriverAssignedScreen(state: DemoState): boolean {
  if (!hasActiveTestRideIncident(state)) return false;
  if (!isBookingConfirmed(state) || !state.otp || !state.chosenSlot || !state.driver) return false;
  return true;
}

/** True when a test-ride or purchase journey is in progress on the customer app. */
export function hasActiveTestRideIncident(state: DemoState): boolean {
  if (!state.leadId && !state.shiviCallInitiated) return false;
  if (state.qualification === "qualified" && state.bookingPaid) return false;
  if (state.rating != null || state.leadClosed) return false;
  return true;
}

export function isSlotHoldExpired(state: DemoState): boolean {
  if (!state.slotHoldExpiresAt) return false;
  return Date.now() > state.slotHoldExpiresAt;
}

export function isEnRouteSlaBreached(state: DemoState): boolean {
  if (!state.enRouteDeadline || state.enRoute || state.rideComplete) return false;
  return Date.now() > state.enRouteDeadline;
}

export type NextActor = "customer" | "dealer" | "driver" | "done";

export function getNextActor(state: DemoState): NextActor {
  if (state.shiviCallPlaced && !state.shiviCallAnswered && !state.shiviCallRejected) {
    return "customer";
  }
  if (!state.qualification) {
    return state.shiviCallInitiated ? "customer" : "done";
  }
  if (state.qualification === "qualified") {
    if (!state.model || !state.bookingPaid) return "customer";
    return "done";
  }
  if (!state.testrideAccepted || !state.model || !state.chosenSlot) return "customer";
  if (!state.dealerAccepted || !state.dealerAcknowledged) return "dealer";
  if (!isBookingConfirmed(state)) {
    if (
      state.dealerConfirmRequired &&
      state.calendarFree === false &&
      state.altOptions.length > 0 &&
      state.driver &&
      !state.customerReconfirmed
    ) {
      return "customer";
    }
    return "dealer";
  }
  if (!state.callPlaced) return "driver";
  if (!state.custConfirmed) return "customer";
  if (!state.enRoute || !state.rideComplete) return "driver";
  if (state.rating == null && !state.leadClosed) return "customer";
  return "done";
}

export interface FlowStep {
  id: string;
  label: string;
  done: boolean;
  active: boolean;
}

export function getFlowSteps(state: DemoState): FlowStep[] {
  const next = getNextActor(state);
  const steps: { id: string; label: string; done: boolean }[] = [
    { id: "ml", label: "ML nudge", done: state.mlFlagged && state.shiviCallInitiated },
    { id: "book", label: "Slot booked", done: !!state.chosenSlot && state.leadSent },
    { id: "ack", label: "Dealer acknowledged", done: state.dealerAcknowledged },
    { id: "otp", label: "OTP issued (app only)", done: !!state.otp && isBookingConfirmed(state) },
    { id: "call", label: "Masked call", done: state.callPlaced },
    { id: "track", label: "En route tracking", done: state.enRoute },
    { id: "close", label: "Ride closed", done: state.rideComplete },
    { id: "feedback", label: "Customer feedback", done: state.rating != null || state.leadClosed },
  ];
  const activeId =
    !state.shiviCallInitiated
      ? "ml"
      : !state.chosenSlot
        ? "book"
        : !state.dealerAcknowledged
          ? "ack"
          : !state.otp
            ? "otp"
            : !state.callPlaced
              ? "call"
              : !state.enRoute
                ? "track"
                : !state.rideComplete
                  ? "close"
                  : state.rating == null && !state.leadClosed
                    ? "feedback"
                    : "feedback";

  return steps.map((s) => ({
    ...s,
    active: s.id === activeId && next !== "done",
  }));
}

export function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
}

export function generateAltOptions(bookingDateMs: number, isWeekendFlow: boolean): Slot[] {
  const start = new Date(bookingDateMs);
  const offset = isWeekendFlow ? 30 : 3;
  const cursor = new Date(start);
  cursor.setDate(cursor.getDate() + offset);
  const options: Slot[] = [];
  while (options.length < 2) {
    if (!isWeekend(cursor)) {
      options.push({
        date: cursor.toISOString().slice(0, 10),
        label: `${formatDateLabel(cursor)} · 4:00–5:00 PM`,
        time: "4:00–5:00 PM",
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return options;
}

/** Static OTP per customer — derived from phone, stable across bookings */
export function deriveStaticOtp(phoneRaw: string): string {
  const digits = phoneRaw.replace(/\D/g, "");
  const last4 = digits.slice(-4).padStart(4, "0");
  return last4;
}

export function generateOtp(phoneRaw?: string): string {
  if (phoneRaw) return deriveStaticOtp(phoneRaw);
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function parseDateInput(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const dmy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
  return null;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `+91 ••••• ••${digits.slice(-2) || "••"}`;
}

export function appendPrivacyAudit(
  audit: PrivacyEvent[],
  event: string,
  actor: string,
  exposed: boolean,
): PrivacyEvent[] {
  return [...audit, { t: Date.now(), event, actor, exposed }];
}

export function getAvailableDrivers(state: DemoState): DriverRosterEntry[] {
  return state.driverRoster.filter((d) => d.available);
}

export function getDriversForTimeWindow(state: DemoState, time: string): DriverRosterEntry[] {
  return state.driverRoster.filter((d) => {
    if (!d.available) return false;
    const windows = d.slotTimes?.length ? d.slotTimes : TIME_SLOTS;
    return windows.includes(time);
  });
}

export function toggleDriverSlotTime(
  roster: DriverRosterEntry[],
  driverId: string,
  time: string,
): DriverRosterEntry[] {
  return roster.map((driver) => {
    if (driver.id !== driverId || !driver.available) return driver;
    const current = driver.slotTimes?.length ? driver.slotTimes : [...TIME_SLOTS];
    const open = current.includes(time);
    const slotTimes = open ? current.filter((slot) => slot !== time) : [...current, time];
    return { ...driver, slotTimes };
  });
}

export function pickNextDriver(state: DemoState, excludeId?: string): DriverRosterEntry | null {
  const pool = getAvailableDrivers(state).filter((d) => d.id !== excludeId);
  return pool[0] ?? null;
}

export function markDriverBusy(roster: DriverRosterEntry[], driverId: string): DriverRosterEntry[] {
  return roster.map((d) => (d.id === driverId ? { ...d, available: false } : d));
}

export function markDriverAvailable(roster: DriverRosterEntry[], driverId: string): DriverRosterEntry[] {
  return roster.map((d) =>
    d.id === driverId
      ? { ...d, available: true, slotTimes: d.slotTimes?.length ? d.slotTimes : [...TIME_SLOTS] }
      : d,
  );
}

/** Clears an in-progress test-ride journey so the customer can book again. */
export function buildCustomerJourneyResetPatch(
  customerNotifyMessage: string,
): Partial<DemoState> {
  return {
    customerNotifyMessage,
    leadSent: false,
    dealerAccepted: false,
    dealerAcknowledged: false,
    chosenSlot: null,
    slotHoldExpiresAt: null,
    bookingDate: null,
    dateClass: null,
    dealerConfirmRequired: false,
    calendarFree: null,
    altOptions: [],
    customerReconfirmed: false,
    driver: null,
    customerOtpStatic: null,
    otp: null,
    callPlaced: false,
    callRejected: false,
    custConfirmed: false,
    enRoute: false,
    driverAtLocation: false,
    rideComplete: false,
    enRouteDeadline: null,
    reassignmentCount: 0,
    leadId: null,
    shiviCallInitiated: false,
    shiviCallPlaced: false,
    shiviCallAnswered: false,
    shiviCallRejected: false,
    mlFlagged: false,
    qualification: null,
    propensity: null,
    testrideAccepted: false,
    model: null,
    variant: null,
    rating: null,
    feedback: null,
    caseSaved: false,
    leadClosed: false,
    driverReminderSent: false,
    dealerEscalated: false,
    selectedDealerCode: null,
  };
}

export function pincodeDistanceLabel(pincode: string): string {
  const p = parseInt(pincode, 10);
  if (Number.isNaN(p)) return "2.1 km";
  const diff = Math.abs(p - 560095) % 100;
  return `${(diff / 10 + 1.5).toFixed(1)} km`;
}

export function findBookableDealers(pincode: string): typeof DEALERSHIPS {
  const prefix = pincode.slice(0, 3);
  const matches = DEALERSHIPS.filter((d) => d.pincode.startsWith(prefix));
  return matches.length ? matches : DEALERSHIPS.slice(0, 2);
}

/** One entry per TIME_SLOTS window; null when no dealer-marked driver is open for that window. */
export function generateDriverTiedSlots(
  state: DemoState,
  date: Date,
  pincode: string,
): (Slot | null)[] {
  const dealers = findBookableDealers(pincode);
  const dateStr = date.toISOString().slice(0, 10);
  const label = formatDateLabel(date);

  return TIME_SLOTS.map((time, index) => {
    const driversForWindow = getDriversForTimeWindow(state, time);
    if (!driversForWindow.length) return null;

    const driver = driversForWindow[index % driversForWindow.length];
    const dealer = dealers[index % dealers.length];

    return {
      date: dateStr,
      label,
      time,
      driverId: driver.id,
      driverName: driver.name,
      dealerCode: dealer.code,
      dealerName: dealer.name,
    };
  });
}

export function buildCustomerLeadPatch(
  lead: {
    id: string;
    name: string;
    phone: string;
    address: string | null;
    pincode: string | null;
    model_id: string | null;
  },
  extras?: { variant?: string | null },
): Partial<DemoState> {
  const masked = maskPhone(lead.phone);
  const staticOtp = deriveStaticOtp(lead.phone);
  return {
    ...INITIAL_STATE,
    customerName: lead.name,
    customerPhone: masked,
    customerPhoneRaw: lead.phone,
    customerAddress: lead.address ?? "—",
    pincode: lead.pincode ?? "560034",
    model: lead.model_id,
    variant: extras?.variant ?? null,
    leadId: lead.id,
    mlFlagged: true,
    shiviCallInitiated: false,
    shiviCallPlaced: false,
    shiviCallAnswered: false,
    shiviCallRejected: false,
    customerOtpStatic: staticOtp,
    driverRoster: INITIAL_DRIVER_ROSTER.map((d) => ({ ...d })),
    privacyAudit: appendPrivacyAudit(
      [],
      "Customer booked test drive — lead sent to OEM pipeline",
      "customer",
      false,
    ),
    log: [],
  };
}

export function buildOemInitiatePatch(lead: {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  pincode: string | null;
  model_id: string | null;
}): Partial<DemoState> {
  const masked = maskPhone(lead.phone);
  const staticOtp = deriveStaticOtp(lead.phone);
  return {
    ...INITIAL_STATE,
    customerName: lead.name,
    customerPhone: masked,
    customerPhoneRaw: lead.phone,
    customerAddress: lead.address ?? "—",
    pincode: lead.pincode ?? "560034",
    model: lead.model_id,
    shiviCallInitiated: true,
    shiviCallPlaced: true,
    shiviCallAnswered: false,
    shiviCallRejected: false,
    mlFlagged: true,
    leadId: lead.id,
    customerOtpStatic: staticOtp,
    driverRoster: INITIAL_DRIVER_ROSTER.map((d) => ({ ...d })),
    privacyAudit: appendPrivacyAudit([], "OEM initiated — phone masked for portals", "oem", false),
    log: [],
  };
}

export function resolveRideOtp(state: DemoState): string {
  return state.customerOtpStatic ?? state.otp ?? "";
}

export { SLOT_HOLD_MS, EN_ROUTE_SLA_MS };
