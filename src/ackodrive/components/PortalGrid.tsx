import { Link } from "react-router-dom";
import { APP_URLS } from "../appUrls";
import { isAdminApp } from "../appMode";
import { PORTALS } from "../constants";

export function PortalGrid() {
  if (isAdminApp) {
    const adminPortals = [
      { emoji: "🏢", title: "Dealer Portal", desc: "Inbox, roster, calendar, insights & OTP override", href: "/dealer", external: false },
      { emoji: "📊", title: "OEM Data Sheet", desc: "Fleet metrics, dealer performance, and live lead propensity", href: "/oem", external: false },
      { emoji: "📱", title: "Customer app", desc: "Mobile app — booking, tracking, OTP & feedback", href: APP_URLS.customer, external: true },
      { emoji: "🚗", title: "Driver app", desc: "Mobile app — assignment, masked call, ride closure", href: APP_URLS.driver, external: true },
      { emoji: "🎯", title: "Presenter kit", desc: "Open all portals, script, reset demo", href: "/presenter", external: false },
    ];

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {adminPortals.map((p) =>
          p.external ? (
            <button
              key={p.title}
              type="button"
              onClick={() => window.open(p.href, "_blank", "noopener,noreferrer")}
              className="ad-portal-card group text-left"
            >
              <PortalCardContent emoji={p.emoji} title={p.title} desc={p.desc} />
            </button>
          ) : (
            <Link key={p.title} to={p.href} className="ad-portal-card group">
              <PortalCardContent emoji={p.emoji} title={p.title} desc={p.desc} />
            </Link>
          ),
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      {PORTALS.map((p) => (
        <Link
          key={p.to}
          to={p.loginTo}
          target={p.role === "tata" ? undefined : "_blank"}
          className="ad-portal-card group"
        >
          <PortalCardContent emoji={p.emoji} title={p.title} desc={p.desc} badge={p.role} />
        </Link>
      ))}
    </div>
  );
}

function PortalCardContent({
  emoji,
  title,
  desc,
  badge,
}: {
  emoji: string;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div className="text-3xl">{emoji}</div>
        {badge && <span className="ad-badge ad-badge-muted">{badge}</span>}
      </div>
      <div className="mt-3 text-base font-semibold text-[var(--ad-text-primary)]">{title}</div>
      <div className="ad-caption mt-1">{desc}</div>
      <div className="mt-3 text-[11px] font-medium text-[var(--ad-text-primary)] group-hover:underline">
        Open portal ↗
      </div>
    </>
  );
}
