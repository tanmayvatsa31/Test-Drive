import type { DemoState, Qualification } from "./types";
import { isBookingConfirmed } from "./workflow";

/** Static dealer seed metrics — extracted from ackodrive-demo.lovable.app/oem */
export interface DealerSeed {
  key: string;
  name: string;
  leads: number;
  planned: number;
  completed: number;
  ratingSum: number;
  ratingN: number;
  propSum: number;
  propN: number;
}

export interface DealerPerformanceRow {
  key: string;
  name: string;
  leads: number;
  planned: number;
  completed: number;
  conversion: number;
  avgRating: number;
  avgPropensity: number;
}

export interface FleetTotals {
  leads: number;
  planned: number;
  completed: number;
  conversion: number;
  avgRating: number;
  avgPropensity: number;
}

export const DEALER_SEEDS: Record<string, DealerSeed> = {
  prerana: {
    key: "prerana",
    name: "Prerana Motors (Tata) · Koramangala",
    leads: 142,
    planned: 118,
    completed: 96,
    ratingSum: 422.4,
    ratingN: 96,
    propSum: 511.2,
    propN: 142,
  },
  concorde: {
    key: "concorde",
    name: "Concorde Motors (Tata) · Lavelle Road",
    leads: 128,
    planned: 101,
    completed: 84,
    ratingSum: 352.8,
    ratingN: 84,
    propSum: 435.2,
    propN: 128,
  },
  adishakti: {
    key: "adishakti",
    name: "Adishakti Cars (Tata) · Whitefield",
    leads: 97,
    planned: 73,
    completed: 61,
    ratingSum: 274.5,
    ratingN: 61,
    propSum: 358.9,
    propN: 97,
  },
  kht: {
    key: "kht",
    name: "KHT Motors (Tata) · Yeshwanthpur",
    leads: 84,
    planned: 66,
    completed: 52,
    ratingSum: 213.2,
    ratingN: 52,
    propSum: 277.2,
    propN: 84,
  },
  apex: {
    key: "apex",
    name: "Apex Cars (Tata) · Bannerghatta Road",
    leads: 110,
    planned: 88,
    completed: 71,
    ratingSum: 305.3,
    ratingN: 71,
    propSum: 385,
    propN: 110,
  },
};

/** Live session contribution for the assigned dealer (Prerana). */
function liveStateContribution(state: DemoState) {
  return {
    leads: state.qualification == null ? 0 : 1,
    planned: isBookingConfirmed(state) && state.qualification !== "qualified" ? 1 : 0,
    completed: state.rideComplete ? 1 : 0,
    ratingSum: state.rating ?? 0,
    ratingN: state.rating == null ? 0 : 1,
    propSum: state.propensity ?? 0,
    propN: state.propensity == null ? 0 : 1,
  };
}

function mergeDealerRow(seed: DealerSeed, state?: DemoState): DealerPerformanceRow {
  const live =
    state && seed.key === "prerana"
      ? liveStateContribution(state)
      : { leads: 0, planned: 0, completed: 0, ratingSum: 0, ratingN: 0, propSum: 0, propN: 0 };

  const leads = seed.leads + live.leads;
  const planned = seed.planned + live.planned;
  const completed = seed.completed + live.completed;
  const ratingN = seed.ratingN + live.ratingN;
  const propN = seed.propN + live.propN;

  return {
    key: seed.key,
    name: seed.name,
    leads,
    planned,
    completed,
    conversion: leads ? (completed / leads) * 100 : 0,
    avgRating: ratingN ? (seed.ratingSum + live.ratingSum) / ratingN : 0,
    avgPropensity: propN ? (seed.propSum + live.propSum) / propN : 0,
  };
}

export function buildDealerPerformanceRows(state: DemoState): DealerPerformanceRow[] {
  return Object.values(DEALER_SEEDS).map((seed) => mergeDealerRow(seed, state));
}

export function buildFleetTotals(state: DemoState): FleetTotals {
  const seeds = Object.values(DEALER_SEEDS);
  const live = liveStateContribution(state);

  const leads = seeds.reduce((sum, seed) => sum + seed.leads, 0) + live.leads;
  const planned = seeds.reduce((sum, seed) => sum + seed.planned, 0) + live.planned;
  const completed = seeds.reduce((sum, seed) => sum + seed.completed, 0) + live.completed;
  const ratingSum = seeds.reduce((sum, seed) => sum + seed.ratingSum, 0) + live.ratingSum;
  const ratingN = seeds.reduce((sum, seed) => sum + seed.ratingN, 0) + live.ratingN;
  const propSum = seeds.reduce((sum, seed) => sum + seed.propSum, 0) + live.propSum;
  const propN = seeds.reduce((sum, seed) => sum + seed.propN, 0) + live.propN;

  return {
    leads,
    planned,
    completed,
    conversion: leads ? (completed / leads) * 100 : 0,
    avgRating: ratingN ? ratingSum / ratingN : 0,
    avgPropensity: propN ? propSum / propN : 0,
  };
}

/** Random propensity within qualification band — matches live demo behaviour. */
export function computePropensityFromQualification(qualification: Qualification): number {
  const range =
    qualification === "qualified"
      ? [4, 5]
      : qualification === "undecided"
        ? [3, 3.5]
        : qualification === "browsing"
          ? [2, 2.5]
          : null;

  if (!range) return 0;

  const raw = range[0] + Math.random() * (range[1] - range[0]);
  return Math.round(raw * 10) / 10;
}

export function propensityBadgeClass(score: number | null): string {
  if (score == null || score <= 0) return "ad-badge ad-badge-muted";
  if (score >= 3) return "ad-propensity-high";
  return "ad-propensity-low";
}
