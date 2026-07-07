export type Role = "customer" | "dealer" | "driver" | "oem";

export type Qualification = "qualified" | "undecided" | "browsing";

export type DateClass = "gt7" | "lt7" | "weekend";

export interface CarBrand {
  id: string;
  name: string;
}

export interface BrandModelOption {
  id: string;
  name: string;
  price: string;
  brandId: string;
  variants: string[];
}

export interface Slot {
  date: string;
  label: string;
  time: string;
  driverId?: string;
  driverName?: string;
  dealerCode?: string;
  dealerName?: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  reg: string;
}

export interface DriverRosterEntry {
  id: string;
  name: string;
  reg: string;
  phone: string;
  available: boolean;
  /** Time windows this driver is open for (dealer-marked). */
  slotTimes: string[];
  vehicleVariant: string;
}

export interface PrivacyEvent {
  t: number;
  event: string;
  actor: string;
  exposed: boolean;
}

export interface OtpOverride {
  by: string;
  at: number;
  reason: string;
}

export interface LogEntry {
  t: number;
  m: string;
}

export interface DemoState {
  customerName: string;
  pincode: string;
  customerPhone: string;
  customerPhoneRaw: string;
  customerAddress: string;
  shiviCallInitiated: boolean;
  shiviCallPlaced: boolean;
  shiviCallAnswered: boolean;
  shiviCallRejected: boolean;
  mlFlagged: boolean;
  leadId: string | null;
  qualification: Qualification | null;
  testrideAccepted: boolean;
  model: string | null;
  variant: string | null;
  bookingPaid: boolean;
  bookingDate: number | null;
  chosenSlot: Slot | null;
  dateClass: DateClass | null;
  dealerConfirmRequired: boolean;
  leadSent: boolean;
  dealerAccepted: boolean;
  dealerAcknowledged: boolean;
  slotHoldExpiresAt: number | null;
  calendarFree: boolean | null;
  altOptions: Slot[];
  customerReconfirmed: boolean;
  driver: DriverInfo | null;
  driverRoster: DriverRosterEntry[];
  customerOtpStatic: string | null;
  otp: string | null;
  callPlaced: boolean;
  callRejected: boolean;
  custConfirmed: boolean;
  enRoute: boolean;
  driverAtLocation: boolean;
  rideComplete: boolean;
  enRouteDeadline: number | null;
  reassignmentCount: number;
  customerNotifyMessage: string | null;
  dlUploaded: boolean;
  dlFileName: string | null;
  rating: number | null;
  feedback: string | null;
  caseSaved: boolean;
  /** Dealer closed the ride without waiting for customer feedback. */
  leadClosed: boolean;
  driverReminderSent: boolean;
  otpOverride: OtpOverride | null;
  privacyAudit: PrivacyEvent[];
  lastUpdatedAt: number | null;
  log: LogEntry[];
  selectedDealerCode: string | null;
  dealerEscalated: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  pincode: string | null;
  model_id: string | null;
  model_name: string | null;
  status: string;
  source: string;
  created_at: string;
}

export interface CaseRecord {
  id: string;
  flow_type: "testride" | "purchase";
  status: string;
  customer_name: string | null;
  pincode: string | null;
  phone_masked: string | null;
  model: string | null;
  variant: string | null;
  slot: string | null;
  date_class: string | null;
  dealer: string | null;
  driver_name: string | null;
  driver_reg: string | null;
  otp: string | null;
  on_road_price: number | null;
  rating: number | null;
  feedback: string | null;
  created_at: string;
}

export interface Session {
  role: Role;
  phone?: string;
  email?: string;
  name: string;
}
