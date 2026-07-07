import { Link } from "react-router-dom";
import { APP_URLS, getOemDataSheetLoginUrl, openApp } from "../../ackodrive/appUrls";
import { OpenAllDemoTabsButton } from "../../ackodrive/components/OpenAllDemoTabsButton";
import { DemoChecklist } from "../../ackodrive/components/DemoChecklist";
import { FlowStepper } from "../../ackodrive/components/FlowStepper";
import { Card, PrimaryButton } from "../../ackodrive/components/ui";
import { useDemoState } from "../../ackodrive/hooks/useDemoState";
import { useSlaWatchdog } from "../../ackodrive/hooks/useSlaWatchdog";
import { getPortalGateUser } from "../../ackodrive/portalGate";

const FLOW_SCRIPT = [
  "ML flags customer and nudge appears in customer app",
  "Customer selects model/variant and requests test ride",
  "System finds nearest dealer with available drivers",
  "Customer books a driver-tied slot",
  "Booking confirmed — static OTP issued, driver assigned",
  "Driver places masked confirmation call",
  "Customer sees live tracking when driver is en route",
  "Driver conducts test ride at customer location",
  "Customer shares OTP at ride end",
  "Driver enters OTP to close booking",
  "Customer rates the ride experience",
];

export function PresenterPage() {
  const { state, reset, loaded } = useDemoState();
  const gateUser = getPortalGateUser();
  useSlaWatchdog();

  if (!loaded) return <div className="ad-caption p-8 text-center">Loading…</div>;

  return (
    <div className="ad-page min-h-dvh">
      <header className="border-b border-[var(--ad-border-default)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <div className="ad-overline">Presenter kit</div>
            <h1 className="ad-display text-xl">Tri-portal demo launcher</h1>
          </div>
          <Link to="/" className="ad-btn-ghost text-sm">
            ← Console
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {gateUser && (
          <p className="ad-caption mb-4">
            Signed in as <span className="font-medium">{gateUser.name}</span>
          </p>
        )}

        <Card>
          <div className="ad-overline mb-3">Open all portals</div>
          <OpenAllDemoTabsButton className="mb-4" />
          <div className="flex flex-wrap gap-2 border-t border-[var(--ad-border-default)] pt-4">
            <PrimaryButton className="!w-auto" onClick={() => openApp("customer")}>
              Customer app ↗
            </PrimaryButton>
            <PrimaryButton className="!w-auto" onClick={() => openApp("driver")}>
              Driver app ↗
            </PrimaryButton>
            <button type="button" className="ad-btn-secondary" onClick={() => openApp("admin", "/dealer")}>
              Dealer portal ↗
            </button>
            <button
              type="button"
              className="ad-btn-secondary"
              onClick={() => window.open(getOemDataSheetLoginUrl(), "_blank", "noopener,noreferrer")}
            >
              OEM data sheet ↗
            </button>
          </div>
          <p className="ad-caption mt-3">
            Customer {APP_URLS.customer} · Driver {APP_URLS.driver} · Admin {APP_URLS.admin}
          </p>
        </Card>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <FlowStepper state={state} />
          <DemoChecklist />
        </div>

        <Card className="mt-4">
          <div className="ad-overline mb-3">11-step script</div>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-[var(--ad-text-secondary)]">
            {FLOW_SCRIPT.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Card>

        <Card className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="ad-overline">Live event log</div>
            <button
              type="button"
              onClick={() => confirm("Reset the live demo?") && void reset()}
              className="ad-btn-secondary !border-red-200 !text-xs !text-red-700"
            >
              Reset demo
            </button>
          </div>
          <ul className="max-h-64 space-y-1 overflow-auto text-[11px]">
            {[...state.log].reverse().map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-mono text-[var(--ad-text-disabled)]">
                  {new Date(e.t).toLocaleTimeString("en-IN")}
                </span>
                <span>{e.m}</span>
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </div>
  );
}
