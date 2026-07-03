import { useMemo, type ReactNode } from "react";
import { clearSession } from "../auth";
import { BRAND_MODELS, DEALER, MODELS } from "../constants";
import { findBrowseCar } from "../carsBrowseCatalog";
import type { DemoState } from "../types";
import type { SetStateFn } from "../workflowActions";
import { publicAsset } from "../publicAsset";
import { driverPlacedCall } from "../workflowActions";

const DIVIDER = "/assets/figma/driver-request-divider.png";

function formatDriverSlotTime(slot: NonNullable<DemoState["chosenSlot"]>): string {
  const date = new Date(`${slot.date}T00:00:00`);
  const datePart = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return `${datePart}, ${slot.time}`;
}

function buildCarTitle(state: DemoState): string {
  const catalogModel = BRAND_MODELS.find((m) => m.id === state.model);
  const legacyModel = MODELS.find((m) => m.id === state.model);
  const browseCar = state.model ? findBrowseCar(state.model) : undefined;
  const variant = state.variant ?? browseCar?.defaultVariant ?? "Base";

  if (browseCar) return `${browseCar.brandName} ${browseCar.modelName} (${variant})`;
  const name = legacyModel?.name ?? catalogModel?.name ?? state.model ?? "Your car";
  return `${name} (${variant})`;
}

function RequestDivider() {
  return (
    <div className="ad-driver-request-divider-wrap" aria-hidden="true">
      <img src={publicAsset(DIVIDER)} alt="" className="ad-driver-request-divider" />
    </div>
  );
}

function RequestField({
  label,
  value,
  action,
}: {
  label: string;
  value: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="ad-driver-request-field">
      <div className="ad-driver-request-field-head">
        <span className="ad-driver-request-label">{label}</span>
      </div>
      {action ? (
        <div className="ad-driver-request-value-row">
          <div className="ad-driver-request-value">{value}</div>
          {action}
        </div>
      ) : (
        <div className="ad-driver-request-value">{value}</div>
      )}
    </div>
  );
}

const LIVE_EMPTY_ILLUSTRATION = "/assets/figma/driver-requests-empty.svg";

export function DriverLiveRequestsEmpty() {
  return (
    <div className="ad-driver-requests-empty" role="status">
      <img
        src={publicAsset(LIVE_EMPTY_ILLUSTRATION)}
        alt=""
        className="ad-driver-requests-empty-art"
        width={56}
        height={56}
      />
      <p className="ad-driver-requests-empty-copy">No new requests at the moment, try again later</p>
    </div>
  );
}

export function DriverRequestsTabs({
  tab,
  liveCount,
  pastCount,
  onTabChange,
}: {
  tab: "live" | "history";
  liveCount: number;
  pastCount: number;
  onTabChange: (tab: "live" | "history") => void;
}) {
  return (
    <div className="ad-driver-requests-tabs" role="tablist" aria-label="Driver requests">
      <button
        type="button"
        role="tab"
        aria-selected={tab === "live"}
        className={`ad-driver-requests-tab${tab === "live" ? " ad-driver-requests-tab--active" : ""}`}
        onClick={() => onTabChange("live")}
      >
        <span className="ad-driver-requests-tab-inner ad-driver-requests-tab-inner--count">
          <span className="ad-driver-requests-tab-label">Live requests</span>
          <span className="ad-driver-requests-tab-count">{liveCount}</span>
        </span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === "history"}
        className={`ad-driver-requests-tab${tab === "history" ? " ad-driver-requests-tab--active" : ""}`}
        onClick={() => onTabChange("history")}
      >
        <span className="ad-driver-requests-tab-inner ad-driver-requests-tab-inner--count">
          <span className="ad-driver-requests-tab-label">Past requests</span>
          <span className="ad-driver-requests-tab-count">{pastCount}</span>
        </span>
      </button>
    </div>
  );
}

export function DriverRequestsLogoutButton() {
  return (
    <button
      type="button"
      className="ad-driver-requests-logout"
      onClick={() => {
        clearSession("driver");
        window.location.href = "/";
      }}
    >
      Logout
    </button>
  );
}

export function DriverLiveRequestCard({
  state,
  setState,
  otpInput,
  setOtpInput,
  otpError,
  setOtpError,
}: {
  state: DemoState;
  setState: SetStateFn;
  otpInput: string;
  setOtpInput: (value: string) => void;
  otpError: string | null;
  setOtpError: (value: string | null) => void;
}) {
  const slot = state.chosenSlot;
  const carTitle = useMemo(() => buildCarTitle(state), [state]);
  const dealerLabel = slot?.dealerName ?? DEALER.name;
  const slotLabel = slot ? formatDriverSlotTime(slot) : "—";
  const address = state.customerAddress?.trim() || "—";

  return (
    <article className="ad-driver-request-card">
      <header className="ad-driver-request-card-head">
        <h2 className="ad-driver-request-car">{carTitle}</h2>
        <p className="ad-driver-request-dealer">{dealerLabel}</p>
      </header>

      <RequestDivider />

      <RequestField label="Customer name" value={state.customerName || "—"} />
      <RequestDivider />
      <RequestField label="Test drive slot" value={slotLabel} />
      <RequestDivider />
      <RequestField
        label="Customer address"
        value={<p className="ad-driver-request-address">{address}</p>}
        action={
          <button type="button" className="ad-driver-request-edit">
            Edit
          </button>
        }
      />
      <RequestDivider />

      {!state.rideComplete && (
        <section className="ad-driver-request-action">
          {!state.custConfirmed && !state.enRoute && !state.callPlaced && (
            <>
              <div className="ad-driver-request-action-copy-block">
                <h3 className="ad-driver-request-action-title">Confirm with customer</h3>
                <p className="ad-driver-request-action-copy">
                  You can call the customer and confirm if they are available on the chosen slot
                </p>
              </div>
              <button type="button" className="ad-driver-request-cta" onClick={() => void driverPlacedCall(setState)}>
                Call customer to confirm
              </button>
            </>
          )}

          {!state.custConfirmed && !state.enRoute && state.callPlaced && (
            <div className="ad-driver-request-action-copy-block">
              <h3 className="ad-driver-request-action-title">Call placed</h3>
              <p className="ad-driver-request-action-copy">
                Waiting for the customer to confirm availability on the chosen slot.
              </p>
            </div>
          )}

          {state.custConfirmed && !state.enRoute && (
            <>
              <div className="ad-driver-request-action-copy-block">
                <h3 className="ad-driver-request-action-title">Customer confirmed</h3>
                <p className="ad-driver-request-action-copy">Start the trip when you are ready to head out.</p>
              </div>
              <button
                type="button"
                className="ad-driver-request-cta"
                onClick={() => void setState({ enRoute: true }, "Driver started trip")}
              >
                Start trip · Mark en route
              </button>
            </>
          )}

          {state.enRoute && !state.rideComplete && (
            <>
              <div className="ad-driver-request-action-copy-block">
                <h3 className="ad-driver-request-action-title">Close ride</h3>
                <p className="ad-driver-request-action-copy">
                  Enter the customer&apos;s 4-digit OTP to complete the ride.
                </p>
              </div>
              <input
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                inputMode="numeric"
                maxLength={4}
                className="ad-driver-request-otp"
                aria-label="Ride OTP"
              />
              {otpError && <p className="ad-driver-request-error">{otpError}</p>}
              <button
                type="button"
                className="ad-driver-request-cta"
                onClick={() => {
                  if (otpInput === state.otp) {
                    void setState({ rideComplete: true }, "Driver closed ride with correct OTP");
                    setOtpError(null);
                  } else {
                    setOtpError("Wrong OTP. Ask the customer.");
                  }
                }}
              >
                Verify &amp; close ride
              </button>
            </>
          )}
        </section>
      )}
    </article>
  );
}
