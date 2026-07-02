import type { ReactNode } from "react";

interface DeviceFrameProps {
  children: ReactNode;
  /** iPhone 16 logical viewport — 393 × 852pt */
  model?: "iphone-16";
}

/** Hyperrealistic iPhone 16 shell for demo / presentation previews. */
export function DeviceFrame({ children, model = "iphone-16" }: DeviceFrameProps) {
  return (
    <div className="iphone16-stage" data-device={model}>
      <div className="iphone16-shadow" aria-hidden="true" />
      <div className="iphone16-shell">
        <div className="iphone16-antenna iphone16-antenna--top" aria-hidden="true" />
        <div className="iphone16-antenna iphone16-antenna--bottom" aria-hidden="true" />

        <div className="iphone16-btn iphone16-btn--vol-up" aria-hidden="true" />
        <div className="iphone16-btn iphone16-btn--vol-down" aria-hidden="true" />
        <div className="iphone16-btn iphone16-btn--action" aria-hidden="true" />
        <div className="iphone16-btn iphone16-btn--power" aria-hidden="true" />

        <div className="iphone16-screen">
          <div className="iphone16-bezel" aria-hidden="true" />
          <div className="iphone16-island" aria-hidden="true">
            <span className="iphone16-island-lens" />
            <span className="iphone16-island-sensor" />
          </div>
          <div className="iphone16-viewport">
            <div className="iphone16-app-root">{children}</div>
          </div>
          <div className="iphone16-home-indicator" aria-hidden="true" />
          <div className="iphone16-screen-glare" aria-hidden="true" />
        </div>
      </div>
      <div className="iphone16-floor-reflection" aria-hidden="true" />
    </div>
  );
}
