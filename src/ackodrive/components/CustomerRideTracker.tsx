import { useEffect, useState } from "react";

const ROUTE_STOPS = ["Dealer", "En route", "Your location"];

export function CustomerRideTracker({ driverName, progress }: { driverName: string; progress: number }) {
  const distanceKm = (3.2 * (1 - progress)).toFixed(1);
  const etaMin = Math.max(0, Math.round(8 * (1 - progress)));
  const pct = Math.round(progress * 100);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[var(--ad-text-primary)]">🚗 {driverName} on the way</div>
        <span className="ad-badge ad-badge-live">● LIVE</span>
      </div>

      <div className="relative mt-4 h-28 overflow-hidden rounded-lg bg-[var(--ad-surface-light)] ring-1 ring-[var(--ad-border-default)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--ad-surface-light)] to-white" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 112" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M24 88 C 80 72, 120 40, 160 56 S 240 80, 296 32"
            fill="none"
            stroke="#e8e8e8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M24 88 C 80 72, 120 40, 160 56 S 240 80, 296 32"
            fill="none"
            stroke="#121212"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="400"
            strokeDashoffset={400 - progress * 400}
          />
        </svg>
        <div
          className="absolute top-1/2 -translate-y-1/2 text-lg transition-all duration-500"
          style={{ left: `calc(${Math.max(8, Math.min(88, progress * 88))}% - 12px)` }}
          aria-hidden="true"
        >
          🚗
        </div>
        <div className="absolute bottom-2 left-3 text-[10px] text-[var(--ad-text-tertiary)]">Koramangala (dealer)</div>
        <div className="absolute bottom-2 right-3 text-[10px] text-[var(--ad-text-tertiary)]">HSR Layout (home)</div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-[var(--ad-surface-light)] p-2">
          <div className="font-bold text-[var(--ad-text-primary)]">{distanceKm} km</div>
          <div className="text-[10px] ad-caption">Distance</div>
        </div>
        <div className="rounded-lg bg-[var(--ad-surface-light)] p-2">
          <div className="font-bold text-[var(--ad-text-primary)]">{etaMin === 0 ? "Now" : `${etaMin} min`}</div>
          <div className="text-[10px] ad-caption">ETA</div>
        </div>
        <div className="rounded-lg bg-[var(--ad-surface-light)] p-2">
          <div className="font-bold text-[var(--ad-text-primary)]">{pct}%</div>
          <div className="text-[10px] ad-caption">Progress</div>
        </div>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--ad-surface-light)]">
        <div className="h-full bg-[var(--ad-surface-dark)] transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 flex justify-between gap-1">
        {ROUTE_STOPS.map((stop, i) => (
          <span
            key={stop}
            className={`text-[10px] ${i <= Math.floor(progress * (ROUTE_STOPS.length - 1)) ? "font-medium text-[var(--ad-text-primary)]" : "ad-caption"}`}
          >
            {stop}
          </span>
        ))}
      </div>

      {progress >= 1 && (
        <div className="mt-3 rounded-lg bg-[var(--ad-accent-green)]/20 px-3 py-2 text-center text-xs font-semibold text-[var(--ad-text-primary)]">
          📍 {driverName} has arrived
        </div>
      )}

      <p className="ad-caption mt-3">Share your OTP only when the ride is over. Your phone number is never shared.</p>
    </div>
  );
}

export function useRideProgress(active: boolean) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    const id = setInterval(() => setProgress((p) => Math.min(1, p + 0.035)), 700);
    return () => clearInterval(id);
  }, [active]);

  return progress;
}
