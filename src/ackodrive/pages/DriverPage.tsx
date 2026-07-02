import { useState } from "react";
import { PortalShell, RequireAuth } from "../components/PortalShell";
import { CaseList } from "../components/CaseList";
import {
  DriverLiveRequestCard,
  DriverLiveRequestsEmpty,
  DriverRequestsLogoutButton,
  DriverRequestsTabs,
} from "../components/DriverLiveRequestCard";
import { getDriverIdFromSession } from "../auth";
import { isDriverApp } from "../appMode";
import { useCases } from "../hooks/useCases";
import { useDemoState } from "../hooks/useDemoState";
import { isBookingConfirmed } from "../workflow";

export function DriverPage() {
  return (
    <RequireAuth role="driver">
      <PortalShell role="driver">
        <DriverContent />
      </PortalShell>
    </RequireAuth>
  );
}

function DriverContent() {
  const { state, setState, loaded } = useDemoState();
  const { cases } = useCases();
  const [tab, setTab] = useState<"live" | "history">("live");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  if (!loaded) return <div className="ad-caption p-8 text-center">Loading…</div>;

  const confirmed = isBookingConfirmed(state);
  const myDriverId = getDriverIdFromSession();
  const assignedToMe =
    !!state.driver && (isDriverApp || !myDriverId || state.driver.id === myDriverId);

  const hasLiveAssignment = assignedToMe && confirmed && !state.rideComplete;
  const pastCases = cases.filter((c) => c.flow_type === "testride");
  const liveCount = hasLiveAssignment ? 1 : 0;
  const pastCount = pastCases.length;
  const showLiveCard = tab === "live" && hasLiveAssignment;
  const showLiveEmpty = tab === "live" && !hasLiveAssignment;

  return (
    <div className="ad-driver-requests">
      <div className="ad-driver-requests-top-slot">
        <DriverRequestsLogoutButton />
      </div>

      <DriverRequestsTabs tab={tab} liveCount={liveCount} pastCount={pastCount} onTabChange={setTab} />

      {showLiveCard && (
        <DriverLiveRequestCard
          state={state}
          setState={setState}
          otpInput={otpInput}
          setOtpInput={setOtpInput}
          otpError={otpError}
          setOtpError={setOtpError}
        />
      )}

      {showLiveEmpty && <DriverLiveRequestsEmpty />}

      {tab === "history" && (
        <div className="ad-driver-requests-history">
          <CaseList cases={pastCases} showFeedback={false} />
        </div>
      )}
    </div>
  );
}
