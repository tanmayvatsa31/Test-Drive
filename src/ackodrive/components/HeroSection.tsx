import { publicAsset, publicAssetSrcSet } from "../publicAsset";

export function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="ad-hero" aria-label="ACKO Drive hero">
      <div className="ad-hero-visual">
        <img
          src={publicAsset("/assets/figma-hero-1200.png")}
          srcSet={publicAssetSrcSet([
            { path: "/assets/figma-hero-1200.png", width: 1200 },
            { path: "/assets/figma-hero-image.png", width: 4096 },
          ])}
          sizes="55.56vw"
          alt="ACKO Drive test ride vehicles"
          className="ad-hero-visual-img"
          width={1600}
          height={1200}
          decoding="async"
          fetchPriority="high"
        />
      </div>

      <div className="ad-hero-panel" aria-hidden="true" />

      <div className="ad-hero-copy">
        <div className="ad-hero-text-block">
          <h1 className="ad-hero-title">ACKO Drive x Your Brand</h1>
          <p className="ad-hero-subtitle">Test ride &amp; instant booking — Multilevel Platform</p>
          <p className="ad-hero-body">
            Experience the future of transportation with our test ride and booking feature. This demo lets users
            explore vehicle options to find the perfect fit. Whether you want a quick test drive or to book a ride,
            our platform makes it easy. Enjoy a user-friendly interface that guides you through the selection
            process, providing details about each vehicle&apos;s features.
          </p>
        </div>
        <button type="button" onClick={onGetStarted} className="ad-hero-cta">
          Get Started
        </button>
      </div>
    </section>
  );
}
