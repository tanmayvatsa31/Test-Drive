import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND_MODELS, MODELS } from "../constants";
import { findBrowseCar } from "../carsBrowseCatalog";
import type { DemoState } from "../types";
import type { SetStateFn } from "../workflowActions";
import { publicAsset } from "../publicAsset";
import { driverPlacedCall } from "../workflowActions";

const CREW_ENROUTE_ICON = "/assets/figma/crew-member-enroute-icon.png";
const ENROUTE_MAP = "/assets/figma/enroute-map.png";
const CALL_DRIVER_ICON = "/assets/figma/call-driver-icon.png";

/** Approximate route curve over the map screenshot (viewBox 0 0 320 117). */
const ROUTE_PATH = "M 28 82 C 72 62, 108 52, 148 58 S 228 62, 292 48";

function formatSlotTime(slot: NonNullable<DemoState["chosenSlot"]>): string {
  const date = new Date(`${slot.date}T00:00:00`);
  const datePart = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return `${datePart}, ${slot.time}`;
}

const ARRIVAL_PROGRESS = 1;

function useEnRouteBikeProgress(syncedArrived: boolean) {
  const [progress, setProgress] = useState(syncedArrived ? ARRIVAL_PROGRESS : 0.15);
  const [arrived, setArrived] = useState(syncedArrived);

  useEffect(() => {
    if (syncedArrived) {
      setProgress(ARRIVAL_PROGRESS);
      setArrived(true);
    }
  }, [syncedArrived]);

  useEffect(() => {
    if (arrived) return;

    const id = setInterval(() => {
      setProgress((current) => {
        const next = Math.min(ARRIVAL_PROGRESS, current + 0.014);
        if (next >= ARRIVAL_PROGRESS) {
          setArrived(true);
        }
        return next;
      });
    }, 450);

    return () => clearInterval(id);
  }, [arrived]);

  return { progress, arrived };
}

function EnRouteLiveMap({
  progress,
  arrived,
  driverName,
}: {
  progress: number;
  arrived: boolean;
  driverName: string;
}) {
  const bikeLeft = `${8 + progress * 76}%`;
  const bikeTop = `${58 - Math.sin(progress * Math.PI) * 14}%`;

  return (
    <section className="ad-driver-enroute-map" aria-label="Live driver location">
      <div className="ad-driver-enroute-map-visual">
        <img src={publicAsset(ENROUTE_MAP)} alt="" className="ad-driver-enroute-map-img" />
        <svg
          className="ad-driver-enroute-map-overlay"
          viewBox="0 0 320 117"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={ROUTE_PATH}
            fill="none"
            stroke="#e0e0e8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d={ROUTE_PATH}
            fill="none"
            stroke="#5920c5"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="320"
            strokeDashoffset={320 - progress * 320}
          />
        </svg>
        <div
          className={`ad-driver-enroute-map-bike${arrived ? " ad-driver-enroute-map-bike-arrived" : ""}`}
          style={{ left: bikeLeft, top: bikeTop }}
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="6" cy="17" r="2.5" fill="#121212" />
            <circle cx="18" cy="17" r="2.5" fill="#121212" />
            <path
              d="M5 17h3l2.5-7h5l2 4h2M9 10l1.5-3h3L16 10"
              stroke="#121212"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="ad-driver-enroute-map-destination" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 11h14l-1.5-4H8L5 11zM5 11v6h2v-2h10v2h2v-6"
              stroke="#121212"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="7.5" cy="18" r="1.5" fill="#121212" />
            <circle cx="16.5" cy="18" r="1.5" fill="#121212" />
          </svg>
        </div>
        <button type="button" className="ad-driver-enroute-map-expand" aria-label="Expand map">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M4.5 1.5H1.5V4.5M9.5 1.5H12.5V4.5M4.5 12.5H1.5V9.5M9.5 12.5H12.5V9.5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <footer
        className={`ad-driver-enroute-map-footer${arrived ? " ad-driver-enroute-map-footer-arrived" : ""}`}
      >
        <p className="ad-driver-enroute-map-note">
          {arrived
            ? `${driverName} is at your location`
            : "The location will refresh every 5 minutes"}
        </p>
      </footer>
    </section>
  );
}

export function DriverEnRouteScreen({
  state,
  setState,
}: {
  state: DemoState;
  setState: SetStateFn;
}) {
  const navigate = useNavigate();
  const { progress: bikeProgress, arrived: driverArrivedLocal } = useEnRouteBikeProgress(state.driverAtLocation);
  const driverArrived = driverArrivedLocal || state.driverAtLocation;

  useEffect(() => {
    if (driverArrivedLocal && !state.driverAtLocation) {
      void setState({ driverAtLocation: true }, "Driver reached customer location");
    }
  }, [driverArrivedLocal, state.driverAtLocation, setState]);

  const slot = state.chosenSlot!;
  const driver = state.driver!;
  const otp = state.otp!;

  const catalogModel = BRAND_MODELS.find((m) => m.id === state.model);
  const legacyModel = MODELS.find((m) => m.id === state.model);
  const browseCar = state.model ? findBrowseCar(state.model) : undefined;
  const variant = state.variant ?? browseCar?.defaultVariant ?? "Base";

  const carTitle = useMemo(() => {
    if (browseCar) return `${browseCar.brandName} ${browseCar.modelName} (${variant})`;
    const name = legacyModel?.name ?? catalogModel?.name ?? state.model ?? "Your car";
    return `${name} (${variant})`;
  }, [browseCar, catalogModel, legacyModel, state.model, variant]);

  const carPrice = browseCar?.price ?? catalogModel?.price ?? legacyModel?.price ?? "—";
  const slotTimeLabel = formatSlotTime(slot);
  const pickupAddress = state.customerAddress?.trim() || "Your pickup address";

  return (
    <div className="ad-driver-enroute-page">
      <header className="ad-driver-assigned-toolbar">
        <button
          type="button"
          className="ad-driver-assigned-back"
          onClick={() => navigate("/cars")}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M14.5 5.5L8 12l6.5 6.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <section className="ad-driver-enroute-hero">
        <div className="ad-driver-enroute-icon-wrap">
          <img
            src={publicAsset(CREW_ENROUTE_ICON)}
            alt=""
            className="ad-driver-enroute-icon"
            width={64}
            height={64}
          />
        </div>

        <div className="ad-driver-assigned-heading-row">
          <h1 className="ad-driver-assigned-title">
            {driverArrived
              ? `${driver.name} is at your location`
              : `${driver.name} is on the way to your location`}
          </h1>
          <div className="ad-driver-enroute-otp">
            <span className="ad-driver-assigned-otp-label">Ride OTP</span>
            <span className="ad-driver-enroute-otp-value">{otp}</span>
          </div>
        </div>
      </section>

      <EnRouteLiveMap progress={bikeProgress} arrived={driverArrived} driverName={driver.name} />

      <div className="ad-driver-assigned-card-group">
        <div className="ad-driver-assigned-card">
          <div className="ad-driver-assigned-car-text">
            <p className="ad-driver-assigned-car-name">{carTitle}</p>
            <p className="ad-driver-assigned-car-price">{carPrice}</p>
          </div>

          <hr className="ad-driver-assigned-divider" />

          <div className="ad-driver-assigned-row">
            <div className="ad-driver-assigned-row-text">
              <p className="ad-driver-assigned-label">Your assigned Crew member</p>
              <p className="ad-driver-assigned-value">{driver.name}</p>
            </div>
            <button
              type="button"
              className="ad-driver-assigned-call"
              aria-label={`Call ${driver.name}`}
              onClick={() => void driverPlacedCall(setState)}
            >
              <img src={publicAsset(CALL_DRIVER_ICON)} alt="" width={20} height={20} />
            </button>
          </div>

          <hr className="ad-driver-assigned-divider" />

          <div className="ad-driver-assigned-row">
            <div className="ad-driver-assigned-row-text">
              <p className="ad-driver-assigned-label">Test drive time</p>
              <p className="ad-driver-assigned-slot">{slotTimeLabel}</p>
            </div>
          </div>

          <hr className="ad-driver-assigned-divider" />

          <div className="ad-driver-enroute-pickup">
            <p className="ad-driver-enroute-pickup-label">Pickup address</p>
            <p className="ad-driver-enroute-pickup-value">{pickupAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
