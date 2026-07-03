import type { ReactNode } from "react";
import ackoDriveLogo from "../../ackodrive/assets/icons/acko-drive-logo.png";
import { publicAsset } from "../../ackodrive/publicAsset";

const SPLASH_BG_PHOTO = publicAsset("/assets/driver-splash-bg.png");

export function DriverSplashScreen({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="ad-driver-splash">
      <div className="ad-driver-splash-bg" aria-hidden="true">
        <img src={SPLASH_BG_PHOTO} alt="" className="ad-driver-splash-bg-photo" />
        <div className="ad-driver-splash-bg-gradient" />
      </div>

      <section className="ad-driver-splash-hero">
        <div className="ad-driver-splash-hero-content">
          <img
            src={ackoDriveLogo}
            alt="ACKO Drive"
            className="ad-driver-splash-logo"
            width={286}
            height={96}
            decoding="async"
          />
          <h1 className="ad-driver-splash-title">Your crew app for doorstep test drives</h1>
          <p className="ad-driver-splash-lead">
            Accept assignments, confirm customers, and close rides — all from one place.
          </p>
        </div>
      </section>

      <section className="ad-driver-splash-sheet" aria-label="Driver login">
        <div className="ad-driver-splash-sheet-handle" aria-hidden="true" />
        {children}
      </section>
    </div>
  );
}
