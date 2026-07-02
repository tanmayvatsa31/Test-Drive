import type { CSSProperties } from "react";
import type { CustomerIntent } from "../customerIntent";

/** Figma hero CTA — 48px height, 12px radius, 16px horizontal inset */
const HERO_CTA_STYLE: CSSProperties = {
  height: 48,
  minHeight: 48,
  paddingLeft: 16,
  paddingRight: 16,
  borderRadius: 12,
  fontSize: 16,
  lineHeight: "24px",
  boxSizing: "border-box",
};

export function CustomerLandingHero({
  onIntent,
}: {
  onIntent: (intent: CustomerIntent) => void;
}) {
  return (
    <section className="ad-hero ad-hero--device" aria-label="ACKO Drive hero">
      <div className="ad-hero-visual">
        <img
          src="/assets/figma-hero-1200.png"
          srcSet="/assets/figma-hero-1200.png 1200w, /assets/figma-hero-image.png 4096w"
          sizes="100vw"
          alt="ACKO Drive — cars lined up for doorstep test drives"
          className="ad-hero-visual-img"
          width={1600}
          height={1200}
          decoding="async"
          fetchPriority="high"
        />
      </div>

      <div className="ad-hero-panel" aria-hidden="true" />

      <div className="ad-hero-copy ad-hero-copy--device">
        <div className="ad-hero-text-block">
          <h1 className="ad-hero-title">Car buying, redefined</h1>
          <p className="ad-hero-subtitle">
            Best prices, doorstep test drives, and a buying experience built around you.
          </p>
          <p className="ad-hero-body">
            Explore curated new cars, book a free doorstep test drive, or lock in your deal — all in one
            place. No haggling, no hidden fees, just clear pricing and expert support from ACKO Drive.
          </p>
        </div>

        <div className="ad-hero-cta-row ad-hero-cta-row--stack">
          <button
            type="button"
            onClick={() => onIntent("testride")}
            className="ad-hero-cta"
            style={HERO_CTA_STYLE}
          >
            Book a test drive
          </button>
          <button
            type="button"
            onClick={() => onIntent("purchase")}
            className="ad-hero-cta ad-hero-cta-secondary"
            style={HERO_CTA_STYLE}
          >
            Buy new car
          </button>
        </div>
      </div>
    </section>
  );
}
