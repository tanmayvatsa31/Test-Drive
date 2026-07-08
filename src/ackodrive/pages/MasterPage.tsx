import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { openApp } from "../appUrls";
import { LeadSummaryContent } from "../components/LeadSummaryContent";
import {
  buildOemPipelineGroups,
  canInitiateShiviCall,
  countVisibleOemLeads,
  formatLeadCreatedAt,
  formatLeadFilterHeading,
  getClosedLeadFeedback,
  getQualificationLeadFeedback,
  isLeadQualificationFeedback,
  isLeadClosed,
  isLeadInProgress,
  todayIsoDate,
  type LeadDateFilter,
} from "../leadPipeline";
import { resolveLeadDisplay } from "../leadDisplay";
import { LOGIN_EPOCH_KEY } from "../auth";
import { PortalShell, RequireAuth } from "../components/PortalShell";
import { Badge, Card, TabButton } from "../components/ui";
import { useCases } from "../hooks/useCases";
import { useDemoState } from "../hooks/useDemoState";
import { useSlaWatchdog } from "../hooks/useSlaWatchdog";
import { useLeads } from "../hooks/useLeads";
import type { DemoState, Lead } from "../types";
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
  const { leads, refresh: refreshLeads } = useLeads();
  const { cases } = useCases();
  const [dateFilter, setDateFilter] = useState<LeadDateFilter>("today");
  const [customDate, setCustomDate] = useState(todayIsoDate);
  useSlaWatchdog();

  const leadGroups = useMemo(
    () => buildOemPipelineGroups(leads, state, dateFilter, customDate),
    [customDate, dateFilter, leads, state],
  );
  const filteredLeadCount = useMemo(
    () => leadGroups.reduce((sum, group) => sum + group.leads.length, 0),
    [leadGroups],
  );
  const visibleLeadCount = useMemo(() => countVisibleOemLeads(leads, state), [leads, state]);
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refreshLeads()}
              className="ad-btn-secondary !px-2 !py-1 !text-[10px]"
              title="Refresh leads"
            >
              ↻ Refresh
            </button>
            <Badge tone="info">live</Badge>
          </div>
        </div>

        <div className="ad-lead-date-filter">
          <div className="ad-lead-date-filter-tabs">
            {(
              [
                { id: "today" as const, label: "Today" },
                { id: "yesterday" as const, label: "Yesterday" },
                { id: "all" as const, label: "All" },
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
            {filteredLeadCount} lead{filteredLeadCount === 1 ? "" : "s"}
          </span>
        </div>

        {!visibleLeadCount && (
          <p className="ad-caption text-center">
            No leads yet. Customer completes a test drive booking (including slot selection) in the{" "}
            <button type="button" onClick={() => openApp("customer")} className="font-medium underline">
              customer app
            </button>
            .
          </p>
        )}

        {visibleLeadCount > 0 && filteredLeadCount === 0 && (
          <p className="ad-caption py-4 text-center">
            No leads for {filterHeading.toLowerCase()}. Try <strong>All</strong> or another date —{" "}
            {visibleLeadCount} booked lead{visibleLeadCount === 1 ? "" : "s"} in the pipeline.
          </p>
        )}

        {leadGroups.map((group) => (
          <section key={group.dateIso} className="ad-lead-date-stack">
            {(dateFilter === "all" || leadGroups.length > 1) && (
              <div className="ad-lead-date-section ad-lead-date-section-stacked">
                <h3 className="ad-lead-date-section-title">{group.heading}</h3>
                <span className="ad-lead-date-section-count">
                  {group.leads.length} lead{group.leads.length === 1 ? "" : "s"}
                </span>
              </div>
            )}
            <ul className="divide-y divide-[var(--ad-border-default)]">
              {group.leads.map((lead) => (
                <LeadPipelineRow
                  key={lead.id}
                  lead={lead}
                  cases={cases}
                  demoState={state}
                  onInitiate={() => void initiateCall(lead)}
                />
              ))}
            </ul>
          </section>
        ))}
      </Card>
    </>
  );
}

function LeadPipelineRow({
  lead,
  cases,
  demoState,
  onInitiate,
}: {
  lead: Lead;
  cases: ReturnType<typeof useCases>["cases"];
  demoState: DemoState;
  onInitiate: () => void;
}) {
  const activeLeadId = demoState.leadId;
  const pipelineState = demoState;
  const qualificationFeedback = isLeadQualificationFeedback(lead, pipelineState, activeLeadId);
  const closed = isLeadClosed(lead, cases, activeLeadId);
  const showInitiate = canInitiateShiviCall(lead, cases, activeLeadId, pipelineState);
  const inProgress = isLeadInProgress(lead, cases, activeLeadId, pipelineState);

  const loginEpoch = Number(sessionStorage.getItem(LOGIN_EPOCH_KEY) ?? "0");
  const display = resolveLeadDisplay(lead, demoState, loginEpoch);

  return (
    <li className="ad-lead-row gap-3 py-3">
      <div className="min-w-0 flex-1">
        <LeadSummaryContent
          display={display}
          createdAtLabel={formatLeadCreatedAt(lead, demoState)}
        />
      </div>
      {showInitiate ? (
        <button type="button" onClick={onInitiate} className="ad-btn-primary ad-lead-initiate-btn !w-full shrink-0 sm:!w-auto">
          📞 Initiate Shivi call
        </button>
      ) : qualificationFeedback && demoState.qualification ? (
        <p className="ad-lead-closure-note shrink-0 sm:max-w-[14rem]">
          {getQualificationLeadFeedback(lead, demoState.qualification)}
        </p>
      ) : closed ? (
        <p className="ad-lead-closure-note shrink-0 sm:max-w-[14rem]">{getClosedLeadFeedback(lead, cases)}</p>
      ) : inProgress ? (
        <p className="ad-lead-closure-note ad-lead-progress-note shrink-0 sm:max-w-[14rem]">
          Shivi call in progress — customer journey active
        </p>
      ) : null}
    </li>
  );
}
