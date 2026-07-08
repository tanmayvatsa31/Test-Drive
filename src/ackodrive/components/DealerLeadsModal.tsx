import { useEffect, useId, useMemo, useRef, useState } from "react";
import { DEALER } from "../constants";
import { LOGIN_EPOCH_KEY } from "../auth";
import { resolveLeadDisplay } from "../leadDisplay";
import {
  dedupeLeadsForPipeline,
  filterSlotBookedLeads,
  mergeDemoStateIntoLeads,
  sortLeadsByCreatedAt,
} from "../leadPipeline";
import {
  intentStatusToQualification,
  LEAD_INTENT_STATUS_OPTIONS,
  qualificationToIntentStatus,
  resolveLeadIntentStatus,
  type LeadIntentStatus,
} from "../leadIntentStatus";
import { propensityBadgeClass } from "../oemAnalytics";
import { deleteLead } from "../hooks/useLeads";
import type { DemoState, Lead } from "../types";
import { persistLeadQualification, type SetStateFn } from "../workflowActions";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="ad-stat-card">
      <div className="ad-stat-card-value">{value}</div>
      <div className="ad-stat-card-label">{label}</div>
    </div>
  );
}

export function DealerLeadsModal({
  open,
  onClose,
  leads,
  demoState,
  setState,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  leads: Lead[];
  demoState: DemoState;
  setState: SetStateFn;
  onRefresh: () => Promise<void>;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const loginEpoch = Number(sessionStorage.getItem(LOGIN_EPOCH_KEY) ?? "0");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, LeadIntentStatus>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const pipelineLeads = useMemo(() => {
    const merged = mergeDemoStateIntoLeads(leads, demoState);
    const visible = filterSlotBookedLeads(merged, demoState);
    return sortLeadsByCreatedAt(dedupeLeadsForPipeline(visible, demoState), demoState);
  }, [demoState, leads]);

  const rows = useMemo(
    () =>
      pipelineLeads.map((lead) => {
        const display = resolveLeadDisplay(lead, demoState, loginEpoch);
        const status = resolveLeadIntentStatus(lead, demoState, statusOverrides[lead.id]);
        return { lead, display, status };
      }),
    [demoState, loginEpoch, pipelineLeads, statusOverrides],
  );

  const summary = useMemo(() => {
    const counts = { wants_to_buy: 0, still_exploring: 0, not_interested: 0 };
    let propSum = 0;

    for (const row of rows) {
      counts[row.status] += 1;
      propSum += row.display.propensity;
    }

    const total = rows.length;
    return {
      total,
      ...counts,
      avgPropensity: total ? propSum / total : 0,
    };
  }, [rows]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      setStatusOverrides({});
      setDeletingId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    void onRefresh();
  }, [demoState.rideComplete, demoState.qualification, demoState.leadId, demoState.propensity, open, onRefresh]);

  if (!open) return null;

  const handleStatusChange = async (lead: Lead, nextStatus: LeadIntentStatus) => {
    setStatusOverrides((current) => ({ ...current, [lead.id]: nextStatus }));

    await persistLeadQualification(
      lead.id,
      intentStatusToQualification(nextStatus),
      setState,
      demoState.leadId,
    );
    await onRefresh();
  };

  const handleDelete = async (lead: Lead) => {
    const confirmed = window.confirm(`Delete lead for ${lead.name}? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(lead.id);
    try {
      await deleteLead(lead.id);

      if (demoState.leadId === lead.id) {
        await setState(
          {
            leadId: null,
            leadSent: false,
            chosenSlot: null,
            bookingDate: null,
            qualification: null,
            propensity: null,
            shiviCallInitiated: false,
            shiviCallPlaced: false,
            shiviCallAnswered: false,
            shiviCallRejected: false,
          },
          `OEM deleted lead — ${lead.name}`,
        );
      }

      setStatusOverrides((current) => {
        const next = { ...current };
        delete next[lead.id];
        return next;
      });
      await onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="ad-modal-root" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        className="ad-modal-panel ad-modal-panel-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ad-modal-header">
          <div>
            <p className="ad-overline">{DEALER.name}</p>
            <h2 id={titleId} className="ad-display mt-1 text-lg sm:text-xl">
              Dealer leads
            </h2>
            <p className="ad-caption mt-1">{DEALER.addr}</p>
          </div>
          <button type="button" className="ad-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <section className="ad-stat-grid ad-stat-grid-modal" aria-label="Lead summary">
          <StatCard label="Total leads" value={String(summary.total)} />
          <StatCard label="Wants to buy" value={String(summary.wants_to_buy)} />
          <StatCard label="Still exploring" value={String(summary.still_exploring)} />
          <StatCard label="Not interested" value={String(summary.not_interested)} />
          <StatCard label="Avg propensity" value={`${summary.avgPropensity.toFixed(1)}/5`} />
        </section>

        <div className="ad-oem-section-head">
          <h3 className="ad-label text-sm">All booked leads</h3>
        </div>

        {rows.length === 0 ? (
          <p className="ad-caption py-6 text-center">No booked leads for this dealer yet.</p>
        ) : (
          <div className="ad-oem-table-wrap">
            <table className="ad-oem-table ad-dealer-leads-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Propensity</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ lead, display, status }, index) => {
                  const isLive = demoState.leadId === lead.id;
                  const liveQualification =
                    isLive && demoState.qualification
                      ? qualificationToIntentStatus(demoState.qualification)
                      : null;
                  const selectValue = liveQualification ?? statusOverrides[lead.id] ?? status;

                  return (
                    <tr key={lead.id} className={isLive ? "ad-oem-table-row-live" : undefined}>
                      <td className="ad-oem-metric">{index + 1}</td>
                      <td>
                        <div className="ad-oem-dealer-name">{display.name}</div>
                        {isLive && <div className="ad-oem-dealer-note">Live session</div>}
                      </td>
                      <td>
                        <span className={propensityBadgeClass(display.propensity)}>
                          {display.propensity.toFixed(1)}/5
                        </span>
                      </td>
                      <td>
                        <select
                          className="ad-dealer-leads-status-select"
                          value={selectValue}
                          onChange={(event) =>
                            void handleStatusChange(lead, event.target.value as LeadIntentStatus)
                          }
                          aria-label={`Status for ${display.name}`}
                        >
                          {LEAD_INTENT_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="ad-dealer-leads-delete-btn"
                          disabled={deletingId === lead.id}
                          onClick={() => void handleDelete(lead)}
                        >
                          {deletingId === lead.id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
