import { SHIVI_LINE } from "../constants";
import { computePropensityFromQualification } from "../oemAnalytics";
import { updateLeadQualification } from "../hooks/useLeads";
import type { DemoState, Qualification } from "../types";
import type { SetStateFn } from "../workflowActions";
import { Badge, Card, PrimaryButton } from "./ui";

export function ShiviQualificationCard({
  state,
  setState,
}: {
  state: DemoState;
  setState: SetStateFn;
}) {
  const name = state.customerName || "there";

  const onPick = (q: Qualification) => {
    const propensity = computePropensityFromQualification(q);
    void setState(
      {
        qualification: q,
        propensity,
        ...(q !== "qualified" ? { testrideAccepted: true } : {}),
      },
      `Shivi: lead "${q}" · propensity ${propensity}/5`,
    );
    if (state.leadId) {
      void updateLeadQualification(state.leadId, q);
    }
  };

  return (
    <Card>
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--ad-surface-dark)] text-xl text-white">
          S
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Shivi · Acko Assistant</div>
          <div className="text-[11px] ad-caption">
            {state.shiviCallRejected ? (
              <>Missed call from <span className="font-mono">{SHIVI_LINE}</span></>
            ) : (
              <>Incoming call from <span className="font-mono">{SHIVI_LINE}</span></>
            )}
          </div>
        </div>
        <Badge tone="live">● LIVE</Badge>
      </div>
      <p className="text-sm text-[var(--ad-text-primary)]">
        &quot;Hi {name.split(" ")[0]} — how serious are you about a new Tata?&quot;
      </p>
      <div className="mt-4 grid gap-2">
        <PrimaryButton onClick={() => onPick("qualified")}>✅ Ready to buy now</PrimaryButton>
        <button type="button" onClick={() => onPick("undecided")} className="ad-btn-secondary !w-full !py-3 !text-sm">
          🤔 Undecided — exploring
        </button>
        <button type="button" onClick={() => onPick("browsing")} className="ad-btn-secondary !w-full !py-3 !text-sm">
          👀 Just browsing
        </button>
      </div>
    </Card>
  );
}
