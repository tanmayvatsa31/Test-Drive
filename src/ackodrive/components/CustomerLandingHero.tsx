import type { CSSProperties } from "react";
import type { CustomerIntent } from "../customerIntent";
import { publicAsset } from "../publicAsset";

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
    <section className="ad-hero ad-hero--device" aria-label="Customer landing hero">
      <div className="ad-hero-visual">
        <img
          src={publicAsset("/assets/figma-hero-1200.png")}
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
          <h1 className="ad-hero-title">Looking for a new car?</h1>
          <p className="ad-hero-subtitle">
            Test drive and check before you buy with ACKO Drive.
          </p>
          <p className="ad-hero-body">
            Book a free doorstep test ride at your location, experience the car on your terms, and decide
            with confidence — clear pricing and expert support every step of the way.
          </p>
        </div>

        <div className="ad-hero-cta-row">
          <button
            type="button"
            onClick={() => onIntent("testride")}
            className="ad-hero-cta"
            style={HERO_CTA_STYLE}
          >
            I want to test drive
          </button>
        </div>
      </div>
    </section>
  );
}
