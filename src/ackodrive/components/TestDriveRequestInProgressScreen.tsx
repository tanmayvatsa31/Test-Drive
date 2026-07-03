import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND_MODELS, MODELS } from "../constants";
import { findBrowseCar } from "../carsBrowseCatalog";
import { refreshDemoState } from "../hooks/demoStateStore";
import type { DemoState } from "../types";
import { isBookingConfirmed } from "../workflow";
import { publicAsset } from "../publicAsset";

const REQUEST_VERIFIED_ICON = "/assets/figma/test-drive-request-verified.png";
const HELP_ICON = "/assets/figma/help-icon.png";

function formatSlotTime(slot: NonNullable<DemoState["chosenSlot"]>): string {
  const date = new Date(`${slot.date}T00:00:00`);
  const datePart = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return `${datePart}, ${slot.time}`;
}

export function TestDriveRequestInProgressScreen({ state }: { state: DemoState }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [noUpdateYet, setNoUpdateYet] = useState(false);

  const slot = state.chosenSlot;
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
  const slotTimeLabel = slot ? formatSlotTime(slot) : "—";

  const handleCheckStatus = async () => {
    if (checking) return;

    setChecking(true);
    setNoUpdateYet(false);
    const latest = await refreshDemoState();
    setChecking(false);

    if (!isBookingConfirmed(latest)) {
      setNoUpdateYet(true);
    }
  };

  return (
    <div className="ad-td-request-page">
      <header className="ad-td-request-toolbar">
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
        <button type="button" className="ad-td-request-help" aria-label="Help">
          <img src={publicAsset(HELP_ICON)} alt="" width={16} height={16} />
          <span>Help</span>
        </button>
      </header>

      <main className="ad-td-request-body">
        <img
          src={publicAsset(REQUEST_VERIFIED_ICON)}
          alt=""
          className="ad-td-request-icon"
          width={64}
          height={64}
        />

        <div className="ad-td-request-copy">
          <h1 className="ad-td-request-title">Your test drive request is in progress</h1>
          <p className="ad-td-request-subtitle">
            Once it is confirmed by the dealer and a driver is assigned, you will receive an update here
          </p>
        </div>

        <article className="ad-td-request-card">
          <div className="ad-td-request-car">
            <p className="ad-td-request-car-name">{carTitle}</p>
            <p className="ad-td-request-car-price">{carPrice}</p>
          </div>

          <hr className="ad-driver-assigned-divider" />

          <div className="ad-td-request-slot">
            <p className="ad-td-request-slot-label">Test drive time</p>
            <p className="ad-td-request-slot-value">{slotTimeLabel}</p>
          </div>
        </article>

        {noUpdateYet ? (
          <p className="ad-td-request-hint" role="status">
            No update yet. The dealer is still confirming your request.
          </p>
        ) : null}
      </main>

      <footer className="ad-td-request-footer">
        <button
          type="button"
          className="ad-td-request-cta"
          onClick={() => void handleCheckStatus()}
          disabled={checking}
          aria-busy={checking}
        >
          {checking ? "Checking…" : "Check status"}
        </button>
      </footer>
    </div>
  );
}
