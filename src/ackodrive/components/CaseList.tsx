import type { CaseRecord } from "../types";
import { Badge, Card } from "./ui";

export function CaseList({ cases, showFeedback = true }: { cases: CaseRecord[]; showFeedback?: boolean }) {
  if (!cases.length) {
    return (
      <div className="ad-card-flat border-dashed text-center">
        <p className="ad-caption">No past cases yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {cases.map((c) => (
        <Card key={c.id}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="ad-label text-sm">{c.customer_name ?? "Customer"}</span>
                <Badge tone={c.flow_type === "purchase" ? "info" : "ok"}>
                  {c.flow_type === "purchase" ? "Booking" : "Test ride"}
                </Badge>
              </div>
              <div className="ad-caption mt-0.5">
                📍 {c.pincode ?? "—"} · 📞 <span className="font-mono">{c.phone_masked ?? "🔒 masked"}</span>
              </div>
            </div>
            <div className="text-right text-[10px] text-[var(--ad-text-disabled)]">
              {new Date(c.created_at).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[var(--ad-text-secondary)]">
            <div>
              <span className="text-[var(--ad-text-tertiary)]">Model:</span> {c.model ?? "—"} {c.variant ? `· ${c.variant}` : ""}
            </div>
            <div>
              <span className="text-[var(--ad-text-tertiary)]">Dealer:</span> {c.dealer ?? "—"}
            </div>
            {c.flow_type === "testride" && (
              <>
                <div>
                  <span className="text-[var(--ad-text-tertiary)]">Slot:</span> {c.slot ?? "—"}
                </div>
                <div>
                  <span className="text-[var(--ad-text-tertiary)]">Driver:</span> {c.driver_name ?? "—"}
                </div>
              </>
            )}
            {c.flow_type === "purchase" && c.on_road_price != null && (
              <div className="col-span-2">
                <span className="text-[var(--ad-text-tertiary)]">On-road:</span> ₹{Number(c.on_road_price).toFixed(2)} L
              </div>
            )}
          </div>
          {showFeedback && c.rating != null && (
            <div className="ad-info-panel !mb-0 mt-2 !p-2 text-[11px]">
              <div className="font-semibold text-[var(--ad-neutral-n500)]">
                {"⭐".repeat(c.rating)}
                {"☆".repeat(5 - c.rating)} <span className="ml-1">{c.rating}/5</span>
              </div>
              {c.feedback && <div className="mt-0.5 italic text-[var(--ad-text-secondary)]">&quot;{c.feedback}&quot;</div>}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
