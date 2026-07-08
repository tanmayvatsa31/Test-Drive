import type { ReactNode } from "react";
import type { LeadDisplay } from "../leadDisplay";
import { Badge } from "./ui";

/** Shared lead body — same fields and order as the dealer live-lead card. */
export function LeadSummaryContent({
  display,
  createdAtLabel,
  actions,
}: {
  display: LeadDisplay;
  createdAtLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="ad-lead-summary">
      <div
        className={`ad-lead-summary-propensity-tag ${
          display.propensity >= 3
            ? "ad-lead-summary-propensity-tag-high"
            : "ad-lead-summary-propensity-tag-low"
        }`}
      >
        <span className="ad-lead-summary-propensity-score">{display.propensity.toFixed(1)}</span>
        <span className="ad-lead-summary-propensity-label">{display.intentLabel}</span>
      </div>

      <Badge tone="info">{display.badgeLabel}</Badge>
      {createdAtLabel ? (
        <div className="ad-caption ad-lead-summary-booked">Booked · {createdAtLabel}</div>
      ) : null}
      <div className="ad-label ad-lead-summary-name text-base">{display.name}</div>
      <div className="ad-caption">📍 Pincode {display.pincode}</div>
      <div className="text-xs break-words">{display.modelLine}</div>
      {display.driverName && (
        <div className="ad-caption mt-1">Requested driver: {display.driverName}</div>
      )}
      {actions ? <div className="mt-3">{actions}</div> : null}
    </div>
  );
}
