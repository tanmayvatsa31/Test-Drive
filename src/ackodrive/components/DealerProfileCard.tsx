import { DEALER } from "../constants";
import { Card } from "./ui";

export function DealerProfileCard({ onViewLeads }: { onViewLeads: () => void }) {
  return (
    <Card className="!mb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="ad-overline">Dealer profile</div>
          <div className="ad-label mt-1 text-base">{DEALER.name}</div>
          <div className="ad-caption mt-1">{DEALER.addr}</div>
        </div>
        <button type="button" onClick={onViewLeads} className="ad-btn-secondary shrink-0 !text-xs sm:!text-sm">
          View leads
        </button>
      </div>
    </Card>
  );
}
