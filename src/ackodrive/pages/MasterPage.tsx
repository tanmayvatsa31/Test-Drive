import { useState } from "react";
import { Link } from "react-router-dom";
import { DEALERSHIPS, MODELS, BRAND_MODELS } from "../constants";
import { openApp } from "../appUrls";
import { PortalShell, RequireAuth } from "../components/PortalShell";
import { FlowStepper } from "../components/FlowStepper";
import { DemoChecklist } from "../components/DemoChecklist";
import { CaseList } from "../components/CaseList";
import { Badge, Card, TabButton } from "../components/ui";
import { useCases } from "../hooks/useCases";
import { useDemoState } from "../hooks/useDemoState";
import { useSlaWatchdog } from "../hooks/useSlaWatchdog";
import { useLeads, updateLeadStatus } from "../hooks/useLeads";
import type { CaseRecord, Lead } from "../types";
import { getNextActor, maskPhone, buildOemInitiatePatch } from "../workflow";

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
  const { state, setState, reset, loaded } = useDemoState();
  const { cases } = useCases();
  const { leads } = useLeads();
  const [tab, setTab] = useState<"leads" | "live" | "dealers" | "history">("leads");
  useSlaWatchdog();

  if (!loaded) return <div className="ad-caption p-8 text-center">Loading…</div>;

  const next = getNextActor(state);
  const model = MODELS.find((m) => m.id === state.model) ?? BRAND_MODELS.find((m) => m.id === state.model);

  const initiateCall = async (lead: Lead) => {
    const patch = buildOemInitiatePatch(lead);
    await setState(patch, `OEM initiated Shivi call → ${lead.name}`);
    await updateLeadStatus(lead.id, "contacted");
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
        <button
          onClick={() => confirm("Reset the live demo?") && void reset()}
          className="ad-btn-secondary !w-full !border-red-200 !text-red-700 sm:!ml-auto sm:!w-auto"
        >
          Reset demo
        </button>
      </div>


      <TabBar tab={tab} setTab={setTab} leads={leads} cases={cases} />

      {tab === "leads" && (
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <div className="ad-overline">Lead pipeline</div>
            <Badge tone="info">live</Badge>
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
          <ul className="divide-y divide-[var(--ad-border-default)]">
            {leads.map((lead) => (
              <li key={lead.id} className="ad-lead-row gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="ad-label text-sm">{lead.name}</span>
                    <Badge tone={lead.status === "new" ? "warn" : "ok"}>{lead.status}</Badge>
                  </div>
                  <div className="ad-caption break-words">
                    {maskPhone(lead.phone)} · 📍 {lead.pincode} · {lead.model_name}
                  </div>
                </div>
                <button onClick={() => void initiateCall(lead)} className="ad-btn-primary !w-full shrink-0 !px-3 !py-2 !text-xs sm:!w-auto">
                  📞 Initiate Shivi call
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "dealers" && (
        <Card>
          <div className="ad-overline mb-2">Dealerships</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {DEALERSHIPS.map((d) => (
              <div key={d.code} className="ad-card-flat !mb-0 !p-3">
                <div className="flex items-center justify-between">
                  <span className="ad-label text-sm">{d.name}</span>
                  <Badge tone={d.active ? "live" : "ok"}>{d.active ? `${d.active} active` : "idle"}</Badge>
                </div>
                <div className="ad-caption">{d.city} · ⭐ {d.rating} · 🚗 {d.drivers} drivers</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "live" && (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Card>
              <div className="ad-overline">Act next on</div>
              <div className="ad-display mt-1 text-lg">
                {state.shiviCallInitiated ? (next === "done" ? "✅ Flow complete" : `${next.toUpperCase()} screen`) : "⏸ Waiting — customer form or initiate Shivi"}
              </div>
            </Card>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FlowStepper state={state} />
              <DemoChecklist />
            </div>
            <Card className="mt-4">
              <div className="ad-overline mb-2">Privacy audit</div>
              <ul className="max-h-40 space-y-1 overflow-auto text-[11px]">
                {state.privacyAudit.length === 0 && <li className="ad-caption">No events yet</li>}
                {state.privacyAudit.map((e, i) => (
                  <li key={i}>
                    {new Date(e.t).toLocaleTimeString("en-IN")} · {e.event} ({e.actor})
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="mt-4">
              <div className="ad-overline mb-2">Event log</div>
              <ul className="max-h-72 space-y-1 overflow-auto text-[11px]">
                {[...state.log].reverse().map((e, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-[var(--ad-text-disabled)]">{new Date(e.t).toLocaleTimeString("en-IN")}</span>
                    <span className="text-[var(--ad-text-secondary)]">{e.m}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <Card>
            <div className="ad-overline mb-2">Live state</div>
            <dl className="space-y-1 text-xs">
              <Row k="Customer" v={state.customerName} />
              <Row k="Phone" v={state.customerPhone} />
              <Row k="Qualification" v={state.qualification ?? "—"} />
              <Row k="Model" v={model ? `${model.name} · ${state.variant ?? "—"}` : "—"} />
              <Row k="Static OTP" v={state.customerOtpStatic ?? "—"} />
              <Row k="Ride OTP" v={state.otp ?? "—"} />
              <Row k="Driver" v={state.driver ? `${state.driver.name}` : "—"} />
              <Row k="Notify" v={state.customerNotifyMessage ?? "—"} />
              <Row k="Rating" v={state.rating == null ? "—" : `⭐ ${state.rating}/5`} />
            </dl>
          </Card>
        </div>
      )}

      {tab === "history" && <CaseList cases={cases} />}
    </>
  );
}

function TabBar({
  tab,
  setTab,
  leads,
  cases,
}: {
  tab: string;
  setTab: (t: "leads" | "live" | "dealers" | "history") => void;
  leads: Lead[];
  cases: CaseRecord[];
}) {
  const tabs = [
    { id: "leads" as const, label: `📋 Leads (${leads.filter((l) => l.status === "new").length})` },
    { id: "live" as const, label: "🎯 Live flow" },
    { id: "dealers" as const, label: `🏢 Dealerships (${DEALERSHIPS.length})` },
    { id: "history" as const, label: `🗂️ All cases (${cases.length})` },
  ];
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} className="flex-1 sm:flex-none">
          {t.label}
        </TabButton>
      ))}
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2 border-b border-[var(--ad-border-default)] pb-1">
      <dt className="text-[var(--ad-text-tertiary)]">{k}</dt>
      <dd className="text-right font-medium text-[var(--ad-text-primary)]">{v}</dd>
    </div>
  );
}
