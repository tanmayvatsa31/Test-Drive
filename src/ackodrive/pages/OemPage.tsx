import { PortalShell, RequireAuth } from "../components/PortalShell";
import { Card } from "../components/ui";
import { useDemoState } from "../hooks/useDemoState";
import { buildDealerPerformanceRows, buildFleetTotals, propensityBadgeClass } from "../oemAnalytics";

export function OemPage() {
  return (
    <RequireAuth role="oem">
      <OemContent />
    </RequireAuth>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="ad-stat-card">
      <div className="ad-stat-card-value">{value}</div>
      <div className="ad-stat-card-label">{label}</div>
    </div>
  );
}

function OemContent() {
  const { state, loaded } = useDemoState();

  if (!loaded) {
    return (
      <PortalShell role="oem">
        <div className="ad-caption p-32 text-center">Loading…</div>
      </PortalShell>
    );
  }

  const dealers = buildDealerPerformanceRows(state);
  const totals = buildFleetTotals(state);

  return (
    <PortalShell role="oem" wide>
      <header className="ad-oem-header">
        <div className="ad-oem-header-copy">
          <p className="ad-overline">OEM console · Tata Motors</p>
          <h1 className="ad-display mt-4 text-xl sm:text-2xl">Test ride performance</h1>
          <p className="ad-caption ad-oem-header-desc mt-4">
            Fleet-wide view of test ride demand, booking progress, and dealer outcomes across the Tata Motors network.
            Summary cards show network totals; the dealer table compares performance by location; a live lead card appears
            when a customer session is active.
          </p>
        </div>
      </header>

      <section className="ad-stat-grid" aria-label="Fleet summary">
        <StatCard label="Total leads" value={String(totals.leads)} />
        <StatCard label="Rides planned" value={String(totals.planned)} />
        <StatCard label="Completed" value={String(totals.completed)} />
        <StatCard label="Conversion" value={`${totals.conversion.toFixed(1)}%`} />
        <StatCard label="Fleet avg rating" value={totals.avgRating.toFixed(1)} />
        <StatCard label="Fleet avg propensity" value={`${totals.avgPropensity.toFixed(1)}/5`} />
      </section>

      <Card>
        <div className="ad-oem-section-head">
          <h2 className="ad-label text-base">Dealer-wise breakdown</h2>
        </div>

        <div className="ad-oem-table-wrap">
          <table className="ad-oem-table">
            <thead>
              <tr>
                <th scope="col">Dealer</th>
                <th scope="col">Leads</th>
                <th scope="col">Planned</th>
                <th scope="col">Completed</th>
                <th scope="col">Conversion</th>
                <th scope="col">Avg rating</th>
                <th scope="col">Avg propensity</th>
              </tr>
            </thead>
            <tbody>
              {dealers.map((dealer) => {
                const isLiveDealer = dealer.key === "prerana";
                return (
                  <tr key={dealer.key} className={isLiveDealer ? "ad-oem-table-row-live" : undefined}>
                    <td>
                      <div className="ad-oem-dealer-name">{dealer.name}</div>
                      {isLiveDealer && <div className="ad-oem-dealer-note">Assigned to live session</div>}
                    </td>
                    <td className="ad-oem-metric">{dealer.leads}</td>
                    <td className="ad-oem-metric">{dealer.planned}</td>
                    <td className="ad-oem-metric">{dealer.completed}</td>
                    <td className="ad-oem-metric">{dealer.conversion.toFixed(1)}%</td>
                    <td className="ad-oem-metric">{dealer.avgRating.toFixed(1)}</td>
                    <td>
                      <span className={propensityBadgeClass(dealer.avgPropensity)}>
                        {dealer.avgPropensity.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {state.propensity != null && (
        <Card className="ad-card-accent !mb-0">
          <div className="ad-oem-live-lead">
            <div>
              <p className="ad-overline">Current live lead</p>
              <p className="ad-label mt-4 text-base">{state.customerName || "—"}</p>
              <p className="ad-caption mt-4">Qualification: {state.qualification ?? "—"}</p>
            </div>
            <span className={`ad-oem-live-lead-score ${propensityBadgeClass(state.propensity)}`}>
              {state.propensity.toFixed(1)}/5
            </span>
          </div>
        </Card>
      )}
    </PortalShell>
  );
}
