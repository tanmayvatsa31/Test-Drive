import type { BrandModelOption, CarBrand, DemoState, Role } from "./types";
import { INDIA_BRAND_MODELS, INDIA_CAR_BRANDS } from "./indiaCarCatalog";

export const DEMO_OTP = "123456";
export const BOOKING_AMOUNT = 25_000;
export const MASKED_LINE = "+91 80 4718 ••22";
export const SHIVI_LINE = "+91 80 4718 0000";
export const SHIVI_CALLER_NAME = "Shivi ACKO";
export const SLOT_HOLD_MS = 5 * 60 * 1000;
export const EN_ROUTE_SLA_MS = 3 * 60 * 1000;

export const ANTI_POACHING_COMMITMENT =
  "Acko commits that customer data from dealer-managed test rides will not be used for direct sales or marketing outreach by Acko. (Policy v1.0 · June 2026)";

export const DRIVER_PHONE_TO_ID: Record<string, string> = {
  "9000000003": "d1",
};

export const MODELS = [
  { id: "harrier-ev", name: "Tata Harrier EV", tag: "New", variants: ["Adventure", "Empowered", "Empowered+ QWD"], price: "₹21.5L–30.2L", vp: [24.2, 27.8, 31.6], emoji: "🚙" },
  { id: "sierra", name: "Tata Sierra", tag: "New", variants: ["Pure", "Adventure", "Accomplished"], price: "₹16.0L–24.0L", vp: [17.2, 20.4, 24.3], emoji: "🟫" },
  { id: "curvv-ev", name: "Tata Curvv EV", tag: "New", variants: ["Creative", "Accomplished", "Empowered+"], price: "₹17.5L–22.3L", vp: [19.1, 21.2, 23.9], emoji: "🏎️" },
  { id: "nexon-ev", name: "Tata Nexon EV", tag: "Popular", variants: ["Creative", "Fearless+", "Empowered"], price: "₹12.5L–17.3L", vp: [14.1, 15.9, 17.8], emoji: "🚗" },
  { id: "punch-ev", name: "Tata Punch EV", tag: "Popular", variants: ["Adventure", "Empowered", "Empowered+"], price: "₹10.0L–14.2L", vp: [11.2, 12.8, 15.1], emoji: "🚐" },
];

export type { CarBrand, BrandModelOption } from "./types";

export const CAR_BRANDS: CarBrand[] = INDIA_CAR_BRANDS;

export const BRAND_MODELS: BrandModelOption[] = INDIA_BRAND_MODELS;

export function getModelsForBrand(brandId: string): BrandModelOption[] {
  return BRAND_MODELS.filter((m) => m.brandId === brandId);
}

export const DRIVERS = [
  { id: "d1", name: "Ravi Kumar", reg: "KA-01-MJ-4412", phone: "9000000003", status: "available" as const, vehicleVariant: "all" },
  { id: "d2", name: "Sunil Patil", reg: "KA-05-AC-9087", phone: "9000000002", status: "available" as const, vehicleVariant: "all" },
  { id: "d3", name: "Imran Shaikh", reg: "KA-03-HD-2231", phone: "9000000004", status: "on ride" as const, vehicleVariant: "all" },
];

export const DEALER = {
  name: "Prerana Motors (Tata) · Koramangala",
  addr: "Hosur Road, 6th Block, Koramangala, Bengaluru 560095",
  distance: "2.1 km",
  rating: 4.5,
  hours: "9:00 AM – 8:00 PM",
  code: "TML-BLR-014",
  phone: "+91 80 4718 0000",
};

export const HEADER_CITIES = ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune"] as const;

export const DEALERSHIPS = [
  { code: "TML-BLR-014", name: "Prerana Motors", city: "Bengaluru · Koramangala", pincode: "560095", rating: 4.5, drivers: 6, active: 1 },
  { code: "TML-BLR-022", name: "Concorde Motors", city: "Bengaluru · Whitefield", pincode: "560066", rating: 4.3, drivers: 4, active: 0 },
  { code: "TML-MUM-007", name: "Wasan Motors", city: "Mumbai · Andheri East", pincode: "400069", rating: 4.4, drivers: 8, active: 2 },
  { code: "TML-DEL-031", name: "Autovikas Tata", city: "New Delhi · Lajpat Nagar", pincode: "110024", rating: 4.2, drivers: 5, active: 0 },
  { code: "TML-HYD-018", name: "Malik Cars", city: "Hyderabad · Banjara Hills", pincode: "500034", rating: 4.6, drivers: 7, active: 1 },
];

export const TIME_SLOTS = [
  "10:00 AM – 12:00 PM",
  "12:00 PM – 2:00 PM",
  "2:00 PM – 4:00 PM",
  "4:00 PM – 6:00 PM",
];

export const DEMO_ACCOUNTS: Record<Exclude<Role, "customer">, { phone: string; name: string; label: string }[]> = {
  dealer: [{ phone: "9000000002", name: "Prerana Motors Admin", label: "Dealer · Prerana Motors" }],
  driver: [{ phone: "9000000003", name: "Ravi Kumar", label: "Driver · Ravi Kumar" }],
  oem: [{ phone: "9000000004", name: "Tata Motors Control", label: "OEM · Tata Motors" }],
};

export const DEMO_SCRIPT_STEPS: { id: string; label: string; check: (s: DemoState) => boolean }[] = [
  { id: "tata", label: "Customer submits enquiry on /tata", check: (s) => !!s.leadId },
  { id: "oem", label: "OEM initiates Shivi / ML nudge", check: (s) => s.shiviCallInitiated },
  { id: "qualify", label: "Customer completes qualification", check: (s) => !!s.qualification },
  { id: "slot", label: "Customer books test ride slot", check: (s) => !!s.chosenSlot },
  { id: "dealer", label: "Dealer accepts & acknowledges", check: (s) => s.dealerAccepted && s.dealerAcknowledged },
  { id: "driver", label: "Driver completes ride (OTP)", check: (s) => s.rideComplete },
  { id: "feedback", label: "Customer submits feedback", check: (s) => s.rating != null },
];

export const PRESENTER_KIT = [
  { label: "OEM Data Sheet", url: "/login/oem" },
  { label: "Tata Form", url: "/tata" },
  { label: "Customer", url: "/login?role=customer&redirect=/customer" },
  { label: "Dealer", url: "/login?role=dealer&redirect=/dealer" },
  { label: "Driver", url: "/login?role=driver&redirect=/driver" },
];

export const PORTALS = [
  { to: "/tata", loginTo: "/tata", role: "tata", title: "Tata Web (public)", desc: "Customer enquiry form → seeds OEM pipeline", emoji: "🌐", newTab: true },
  { to: "/login?role=customer&redirect=/customer", loginTo: "/login?role=customer&redirect=/customer", role: "customer", title: "Customer app", desc: "ML nudge, booking, tracking, OTP & feedback", emoji: "📱", newTab: true },
  { to: "/login?role=dealer&redirect=/dealer", loginTo: "/login?role=dealer&redirect=/dealer", role: "dealer", title: "Dealer Portal", desc: "Inbox, roster, calendar, insights & OTP override", emoji: "🏢", newTab: true },
  { to: "/login?role=driver&redirect=/driver", loginTo: "/login?role=driver&redirect=/driver", role: "driver", title: "Driver App", desc: "Assignment, masked call, en-route, OTP close", emoji: "🚗", newTab: true },
  { to: "/login?role=oem&redirect=/oem", loginTo: "/login?role=oem&redirect=/oem", role: "oem", title: "OEM Data Sheet", desc: "Fleet metrics, dealer performance, and live lead propensity", emoji: "📊", newTab: true },
];
