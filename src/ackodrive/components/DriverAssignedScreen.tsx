import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND_MODELS, DEALER, MODELS } from "../constants";
import { findBrowseCar } from "../carsBrowseCatalog";
import { insertCase } from "../hooks/useCases";
import { updateLeadStatus } from "../hooks/useLeads";
import type { DemoState } from "../types";
import type { SetStateFn } from "../workflowActions";
import { driverPlacedCall } from "../workflowActions";
import { publicAsset } from "../publicAsset";
import { PrimaryButton } from "./ui";

const DRIVER_ASSIGNED_ICON = "/assets/figma/driver-assigned-icon.png";
const CALL_DRIVER_ICON = "/assets/figma/call-driver-icon.png";

function formatAssignedSlotTime(slot: NonNullable<DemoState["chosenSlot"]>): string {
  const date = new Date(`${slot.date}T00:00:00`);
  const datePart = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return `${datePart}, ${slot.time}`;
}

export function DriverAssignedScreen({
  state,
  setState,
}: {
  state: DemoState;
  setState: SetStateFn;
}) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

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
  const slotTimeLabel = formatAssignedSlotTime(slot);

  const modelLabel = legacyModel?.name ?? catalogModel?.name ?? state.model ?? "Your car";

  return (
    <div className="ad-driver-assigned-page">
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

      <section className="ad-driver-assigned-hero">
        <div className="ad-driver-assigned-icon-wrap">
          <div className="ad-driver-assigned-icon-bg" aria-hidden="true" />
          <img
            src={publicAsset(DRIVER_ASSIGNED_ICON)}
            alt=""
            className="ad-driver-assigned-icon"
            width={48}
            height={48}
          />
        </div>

        <div className="ad-driver-assigned-heading-row">
          <h1 className="ad-driver-assigned-title">A driver has been assigned for your test drive</h1>
          <div className="ad-driver-assigned-otp">
            <span className="ad-driver-assigned-otp-label">Ride OTP</span>
            <span className="ad-driver-assigned-otp-value">{otp}</span>
          </div>
        </div>
      </section>

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
        </div>

        <footer className="ad-driver-assigned-note">
          <p className="ad-driver-assigned-note-text">
            <span className="ad-driver-assigned-note-label">Note:</span>
            {" "}
            The driver will contact you via ACKO secure channel, they cannot view your number
          </p>
        </footer>
      </div>

      {state.callRejected && !state.custConfirmed && (
        <section className="ad-driver-assigned-followup ad-driver-assigned-availability">
          <p className="ad-driver-assigned-followup-title">
            You missed a call from {driver.name}. Let them know you&apos;re still available.
          </p>
          <PrimaryButton
            onClick={() =>
              void setState(
                { custConfirmed: true, callRejected: false },
                "Customer confirmed availability",
              )
            }
          >
            Confirm I am available
          </PrimaryButton>
        </section>
      )}

      {state.rideComplete && state.rating == null && !state.leadClosed && (
        <section className="ad-driver-assigned-followup">
          <p className="ad-driver-assigned-followup-title">How was your test ride?</p>
          <div className="ad-driver-assigned-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`ad-driver-assigned-star ${n <= rating ? "ad-driver-assigned-star-active" : ""}`}
                aria-label={`Rate ${n} stars`}
              >
                ⭐
              </button>
            ))}
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value.slice(0, 240))}
            className="ad-driver-assigned-feedback"
            rows={2}
            placeholder="Did you like the overall experience? Drop your feedback"
          />
          <PrimaryButton
            disabled={!rating}
            onClick={async () => {
              await setState({ rating, feedback }, `Rated ${rating}/5`);
              if (!state.caseSaved) {
                await insertCase({
                  flow_type: "testride",
                  status: "completed",
                  customer_name: state.customerName,
                  pincode: state.pincode,
                  phone_masked: state.customerPhone,
                  model: modelLabel,
                  variant: state.variant,
                  slot: `${slot.label} · ${slot.time}`,
                  date_class: state.dateClass,
                  dealer: DEALER.name,
                  driver_name: driver.name,
                  driver_reg: driver.reg,
                  otp,
                  on_road_price: null,
                  rating,
                  feedback,
                });
                await setState({ caseSaved: true });
                if (state.leadId) {
                  await updateLeadStatus(state.leadId, "completed");
                }
              }
            }}
          >
            Submit feedback
          </PrimaryButton>
        </section>
      )}

      {state.rating != null && (
        <section className="ad-driver-assigned-followup ad-driver-assigned-thanks">
          <p className="ad-driver-assigned-followup-title">Thanks for the feedback!</p>
        </section>
      )}
    </div>
  );
}
