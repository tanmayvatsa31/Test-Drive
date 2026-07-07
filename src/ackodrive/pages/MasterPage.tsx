import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { openApp } from "../appUrls";
import {
  canInitiateShiviCall,
  dedupeLeadsForPipeline,
  filterLeadsByDate,
  formatLeadFilterHeading,
  getClosedLeadFeedback,
  isLeadClosed,
  isLeadInProgress,
  leadStatusBadgeTone,
  leadStatusLabel,
  propensityScore,
  propensityLabel,
  todayIsoDate,
  type LeadDateFilter,
} from "../leadPipeline";
import { LOGIN_EPOCH_KEY } from "../auth";
import { PortalShell, RequireAuth } from "../components/PortalShell";
import { Badge, Card, TabButton } from "../components/ui";
import { useCases } from "../hooks/useCases";
import { useDemoState } from "../hooks/useDemoState";
import { useSlaWatchdog } from "../hooks/useSlaWatchdog";
import { useLeads } from "../hooks/useLeads";
import type { Lead } from "../types";
import { maskPhone } from "../workflow";
import { initiateShiviCallFromOem } from "../workflowActions";

export function MasterPage() {
  return (
    <RequireAuth role="oem">
      <PortalShell role="oem" wide>
        <MasterContent />
      </PortalShell>
    </RequireAuth>
  );
}

function MasterContent() {
  const { state, setState, loaded } = useDemoState();
  const { leads } = useLeads();
  const { cases } = useCases();
  const [dateFilter, setDateFilter] = useState<LeadDateFilter>("today");
  const [customDate, setCustomDate] = useState(todayIsoDate);
  useSlaWatchdog();

  const filteredLeads = useMemo(() => {
    const byDate = filterLeadsByDate(leads, dateFilter, customDate);
    return dedupeLeadsForPipeline(byDate);
  }, [customDate, dateFilter, leads]);
  const filterHeading = formatLeadFilterHeading(dateFilter, customDate);

  if (!loaded) return <div className="ad-caption p-8 text-center">Loading…</div>;

  const initiateCall = async (lead: Lead) => {
    await initiateShiviCallFromOem(setState, state, lead);
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => openApp("customer")} className="ad-btn-secondary !text-[11px] sm:!text-xs">
          Customer app ↗
        </button>
        <button type="button" onClick={() => openApp("driver")} className="ad-btn-secondary !text-[11px] sm:!text-xs">
          Driver app ↗
        </button>
        <Link to="/dealer" className="ad-btn-secondary !text-[11px] sm:!text-xs">
          Dealer portal
        </Link>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="ad-overline">Lead pipeline</div>
          <Badge tone="info">live</Badge>
        </div>

        <div className="ad-lead-date-filter">
          <div className="ad-lead-date-filter-tabs">
            {(
              [
                { id: "today" as const, label: "Today" },
                { id: "yesterday" as const, label: "Yesterday" },
                { id: "custom" as const, label: "Choose date" },
              ] as const
            ).map((option) => (
              <TabButton
                key={option.id}
                active={dateFilter === option.id}
                onClick={() => setDateFilter(option.id)}
                className="flex-1 !text-xs sm:flex-none"
              >
                {option.label}
              </TabButton>
            ))}
          </div>

          {dateFilter === "custom" && (
            <label className="ad-lead-date-picker">
              <span className="sr-only">Choose date</span>
              <input
                type="date"
                value={customDate}
                max={todayIsoDate()}
                onChange={(e) => setCustomDate(e.target.value)}
                className="ad-lead-date-picker-input"
              />
            </label>
          )}
        </div>

        <div className="ad-lead-date-section">
          <h2 className="ad-lead-date-section-title">{filterHeading}</h2>
          <span className="ad-lead-date-section-count">
            {filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"}
          </span>
        </div>

        {!leads.length && (
          <p className="ad-caption text-center">
            No leads yet. Customer submits via the{" "}
            <button type="button" onClick={() => openApp("customer")} className="font-medium underline">
              customer app
            </button>
            .
          </p>
        )}

        {leads.length > 0 && filteredLeads.length === 0 && (
          <p className="ad-caption py-4 text-center">No leads for {filterHeading.toLowerCase()}.</p>
        )}

        <ul className="divide-y divide-[var(--ad-border-default)]">
          {filteredLeads.map((lead) => (
            <LeadPipelineRow
              key={lead.id}
              lead={lead}
              cases={cases}
              activeLeadId={state.leadId}
              onInitiate={() => void initiateCall(lead)}
            />
          ))}
        </ul>
      </Card>
    </>
  );
}

function LeadPipelineRow({
  lead,
  cases,
  activeLeadId,
  onInitiate,
}: {
  lead: Lead;
  cases: ReturnType<typeof useCases>["cases"];
  activeLeadId: string | null;
  onInitiate: () => void;
}) {
  const closed = isLeadClosed(lead, cases, activeLeadId);
  const showInitiate = canInitiateShiviCall(lead, cases, activeLeadId);
  const inProgress = isLeadInProgress(lead, cases, activeLeadId);

  const loginEpoch = Number(sessionStorage.getItem(LOGIN_EPOCH_KEY) ?? "0");
  const score = propensityScore(lead.phone, loginEpoch);
  const label = propensityLabel(score);

  return (
    <li className="ad-lead-row gap-3 py-2.5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ad-label text-sm">{lead.name}</span>
          <Badge tone={leadStatusBadgeTone(lead, cases, activeLeadId)}>
            {leadStatusLabel(lead, cases, activeLeadId)}
          </Badge>
        </div>
        <div className="ad-caption break-words">
          {maskPhone(lead.phone)} · 📍 {lead.pincode} · {lead.model_name}
        </div>
        <div className="ad-caption mt-0.5 flex items-center gap-1.5">
          <span>Propensity score: {score.toFixed(1)}</span>
          <span className={score >= 3 ? "ad-propensity-high" : "ad-propensity-low"}>{label}</span>
        </div>
      </div>
      {showInitiate ? (
        <button type="button" onClick={onInitiate} className="ad-btn-primary ad-lead-initiate-btn !w-full shrink-0 sm:!w-auto">
          📞 Initiate Shivi call
        </button>
      ) : closed ? (
        <p className="ad-lead-closure-note">{getClosedLeadFeedback(lead, cases)}</p>
      ) : inProgress ? (
        <p className="ad-lead-closure-note ad-lead-progress-note">Shivi call in progress — customer journey active</p>
      ) : null}
    </li>
  );
}
