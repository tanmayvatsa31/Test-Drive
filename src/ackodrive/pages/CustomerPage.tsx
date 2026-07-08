import { useMemo, useState } from "react";
import { PortalShell, RequireAuth, TurnBanner } from "../components/PortalShell";
import { BookFreeConsultationForm } from "../components/BookFreeConsultationForm";
import { TestDriveRequestInProgressScreen } from "../components/TestDriveRequestInProgressScreen";
import { DriverAssignedScreen } from "../components/DriverAssignedScreen";
import { DriverEnRouteScreen } from "../components/DriverEnRouteScreen";
import { IncomingDriverCallScreen } from "../components/IncomingDriverCallScreen";
import { IncomingShiviCallScreen } from "../components/IncomingShiviCallScreen";
import { ShiviQualificationCard } from "../components/ShiviQualificationCard";
import { isCustomerSchedulingSlot, ScheduleTestRideScreen } from "../components/ScheduleTestRideScreen";
import { TestRideReminder } from "../components/TestRideReminder";
import { Badge, Card, PrimaryButton } from "../components/ui";
import { getSession } from "../auth";
import { getSelectedCar } from "../customerIntent";
import { BOOKING_AMOUNT, DEALER, MODELS, BRAND_MODELS } from "../constants";
import { insertCase } from "../hooks/useCases";
import { useDemoState } from "../hooks/useDemoState";
import type { DemoState } from "../types";
import {
  classifyDate,
  generateDriverTiedSlots,
  generateOtp,
  getNextActor,
  getVariantPrice,
  hasActiveTestRideIncident,
  isBookingConfirmed,
  isSlotHoldExpired,
  isWaitingForDealerAssignment,
  parseDateInput,
  shouldShowDealerConfirmingLoader,
  shouldShowDriverAssignedScreen,
  shouldShowDriverEnRouteScreen,
  shouldShowIncomingDriverCallScreen,
  shouldShowIncomingShiviCallScreen,
  shouldShowQualificationCard,
} from "../workflow";
import { bookDriverTiedSlot } from "../workflowActions";

export function CustomerPage() {
  return (
    <RequireAuth role="customer">
      <CustomerPageLayout />
    </RequireAuth>
  );
}

function CustomerPageLayout() {
  const { state, setState, loaded } = useDemoState();

  if (loaded && shouldShowIncomingShiviCallScreen(state)) {
    return <IncomingShiviCallScreen state={state} setState={setState} />;
  }

  if (loaded && shouldShowQualificationCard(state)) {
    return (
      <PortalShell role="customer">
        <ShiviQualificationCard state={state} setState={setState} />
      </PortalShell>
    );
  }

  if (loaded && shouldShowDealerConfirmingLoader(state)) {
    return <TestDriveRequestInProgressScreen state={state} />;
  }

  if (loaded && shouldShowIncomingDriverCallScreen(state)) {
    return <IncomingDriverCallScreen state={state} setState={setState} />;
  }

  if (loaded && shouldShowDriverEnRouteScreen(state)) {
    return <DriverEnRouteScreen state={state} setState={setState} />;
  }

  if (loaded && shouldShowDriverAssignedScreen(state)) {
    return <DriverAssignedScreen state={state} setState={setState} />;
  }

  return (
    <PortalShell role="customer">
      <CustomerContent />
    </PortalShell>
  );
}

function CustomerContent() {
  const { state, setState, loaded } = useDemoState();

  if (!loaded) return <div className="p-8 text-center text-sm ad-caption">Loading…</div>;

  const session = getSession("customer");
  const hasSelectedCarFromListing = getSelectedCar() != null;

  // Show the booking form whenever: no active journey, OR customer arrived fresh from car listing.
  // clearSelectedCar() is called on submit so this condition becomes false right after submit.
  const showBookingForm =
    !hasActiveTestRideIncident(state) ||
    (hasSelectedCarFromListing && !state.leadSent && !state.chosenSlot);

  if (showBookingForm) {
    return (
      <BookFreeConsultationForm
        defaultName={session?.name}
        defaultPhone={session?.phone}
      />
    );
  }

  const inTestRideJourney =
    state.testrideAccepted &&
    (state.qualification === null ||
      state.qualification === "undecided" ||
      state.qualification === "browsing");

  if (inTestRideJourney && isCustomerSchedulingSlot(state)) {
    return <ScheduleTestRideScreen state={state} setState={setState} />;
  }

  if (isWaitingForDealerAssignment(state)) {
    return null;
  }

  if (inTestRideJourney) {
    const catalogModel = BRAND_MODELS.find((m) => m.id === state.model);
    const model = MODELS.find((m) => m.id === state.model);
    const modelLabel = model?.name ?? catalogModel?.name ?? state.model ?? "Your car";
    const confirmed = isBookingConfirmed(state);

    return (
      <TestRideFlow
        state={state}
        setState={setState}
        model={model}
        modelLabel={modelLabel}
        confirmed={confirmed}
        skipScheduling
      />
    );
  }

  const next = getNextActor(state);
  const confirmed = isBookingConfirmed(state);
  const catalogModel = BRAND_MODELS.find((m) => m.id === state.model);
  const model = MODELS.find((m) => m.id === state.model);
  const modelLabel = model?.name ?? catalogModel?.name ?? state.model ?? "Your car";

  return (
    <>
      <TurnBanner active={next === "customer"} role={next} />
      {state.customerNotifyMessage && (
        <Card className="ad-card-warning !mb-3 !border-2">
          <div className="text-xs font-semibold">📩 Update from Acko</div>
          <p className="mt-1 text-sm">{state.customerNotifyMessage}</p>
        </Card>
      )}
      {state.slotHoldExpiresAt && !state.dealerAccepted && isSlotHoldExpired(state) && (
        <Card className="ad-card-warning !mb-3">
          <p className="text-xs">Your slot hold expired. Please pick another slot.</p>
        </Card>
      )}
      {state.mlFlagged && state.shiviCallInitiated && (
        <Card className="ad-card-accent !mb-3">
          <Badge tone="live">ML nudge</Badge>
          <p className="mt-1 text-sm">High purchase intent — book your free doorstep test ride when Shivi qualifies you.</p>
        </Card>
      )}
      <TestRideReminder
        slotDate={state.chosenSlot?.date}
        slotLabel={state.chosenSlot?.label}
        slotTime={state.chosenSlot?.time}
        audience="customer"
        customerName={state.customerName}
      />

      <Card className="ad-info-panel">
        <div className="ad-overline">📱 Customer&apos;s personal phone</div>
        <p className="mt-1 text-[11px] text-[var(--ad-neutral-n500)]">
          {state.customerName} ({state.customerPhone}) — whitelisted via tata.com enquiry.
        </p>
      </Card>

      {!state.shiviCallInitiated && (
        <WaitingCard name={state.customerName || "there"} />
      )}

      {state.qualification === "qualified" && (
        <PurchaseFlow state={state} setState={setState} model={model} />
      )}

      {(state.qualification === "undecided" || state.qualification === "browsing") && (
        <TestRideFlow
          state={state}
          setState={setState}
          model={model}
          modelLabel={modelLabel}
          confirmed={confirmed}
        />
      )}
    </>
  );
}

function WaitingCard({ name }: { name: string }) {
  return (
    <Card>
      <div className="text-sm font-semibold">Hi {name.split(" ")[0]} — thanks for your enquiry on Tata.com</div>
      <p className="ad-caption mt-2 rounded-lg bg-[var(--ad-accent-purple)] px-3 py-2">Waiting for OEM to initiate your callback…</p>
    </Card>
  );
}

function ModelPicker({
  state,
  setState,
  ctaLabel,
  onConfirm,
}: {
  state: DemoState;
  setState: (p: Partial<DemoState>, log?: string) => Promise<void>;
  ctaLabel: string;
  onConfirm: () => void;
}) {
  return (
    <Card>
      <div className="mb-2 text-sm font-semibold">Pick a model</div>
      <div className="space-y-2">
        {MODELS.map((m) => (
          <div key={m.id} className={`ad-card-flat !mb-0 !p-3 ${state.model === m.id ? "!bg-[var(--ad-accent-purple)] !ring-2 !ring-[var(--ad-border-selected)]" : ""}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{m.emoji}</span>
              <div className="text-sm font-semibold">{m.name}</div>
              <Badge tone={m.tag === "New" ? "info" : "ok"}>{m.tag}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {m.variants.map((v) => (
                <button
                  key={v}
                  onClick={() => void setState({ model: m.id, variant: v }, `Picked ${m.name} · ${v}`)}
                  className={`ad-chip ${state.model === m.id && state.variant === v ? "ad-chip-active" : ""}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {state.model && state.variant && (
        <div className="mt-3">
          <PrimaryButton onClick={onConfirm}>{ctaLabel}</PrimaryButton>
        </div>
      )}
    </Card>
  );
}

function PurchaseFlow({
  state,
  setState,
  model,
}: {
  state: DemoState;
  setState: (p: Partial<DemoState>, log?: string) => Promise<void>;
  model: (typeof MODELS)[number] | undefined;
}) {
  const price = state.model && state.variant ? getVariantPrice(state.model, state.variant) : null;

  if (!state.model) {
    return <ModelPicker state={state} setState={setState} ctaLabel="Review & pay booking →" onConfirm={() => {}} />;
  }

  if (!state.bookingPaid) {
    return (
      <>
        <Card>
          <div className="text-lg font-semibold">{model?.name} · {state.variant}</div>
          <div className="mt-2 text-sm">On-road: <span className="font-bold text-[var(--ad-text-primary)]">₹{price?.toFixed(2)} L</span></div>
          <div className="mt-1 text-xs ad-caption">{DEALER.name}</div>
        </Card>
        <Card>
          <p className="text-sm">Pay refundable token of <span className="font-bold">₹{BOOKING_AMOUNT.toLocaleString("en-IN")}</span></p>
          <div className="mt-3">
            <PrimaryButton
              onClick={async () => {
                const otp = generateOtp();
                await setState({ bookingPaid: true, otp }, `Customer paid ₹${BOOKING_AMOUNT.toLocaleString("en-IN")}`);
                if (!state.caseSaved && model && state.variant && price) {
                  await insertCase({
                    flow_type: "purchase",
                    status: "completed",
                    customer_name: state.customerName,
                    pincode: state.pincode,
                    phone_masked: state.customerPhone,
                    model: model.name,
                    variant: state.variant,
                    slot: null,
                    date_class: null,
                    dealer: DEALER.name,
                    driver_name: null,
                    driver_reg: null,
                    otp,
                    on_road_price: price,
                    rating: null,
                    feedback: null,
                  });
                  await setState({ caseSaved: true });
                }
              }}
            >
              Pay ₹{BOOKING_AMOUNT.toLocaleString("en-IN")} &amp; reserve
            </PrimaryButton>
          </div>
        </Card>
      </>
    );
  }

  return (
    <Card className="ad-card-success !border-2">
      <Badge tone="ok">✓ Reserved</Badge>
      <div className="mt-2 font-mono text-sm font-semibold">ACK-{state.otp}-{state.model?.toUpperCase()}</div>
      <div className="mt-2 text-xs">Balance due at delivery: ₹{((price ?? 0) * 1e5 - BOOKING_AMOUNT).toLocaleString("en-IN")}</div>
    </Card>
  );
}

function TestRideFlow({
  state,
  setState,
  model: _model,
  modelLabel: _modelLabel,
  confirmed,
  skipScheduling = false,
}: {
  state: DemoState;
  setState: (p: Partial<DemoState>, log?: string) => Promise<void>;
  model: (typeof MODELS)[number] | undefined;
  modelLabel: string;
  confirmed: boolean;
  skipScheduling?: boolean;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [dateIso, setDateIso] = useState("");
  const [dateText, setDateText] = useState("");
  const [selectedSlotKey, setSelectedSlotKey] = useState("");

  const pickedDate = parseDateInput(dateText) ?? (dateIso ? new Date(dateIso) : null);
  const classification = pickedDate ? classifyDate(today.getTime(), pickedDate) : null;
  const driverSlots = pickedDate ? generateDriverTiedSlots(state, pickedDate, state.pincode) : [];
  const chosenSlot = state.chosenSlot;

  if (!skipScheduling && !state.testrideAccepted) {
    return (
      <Card>
        <div className="ad-overline text-[var(--ad-text-secondary)]">Free doorstep test ride</div>
        <div className="mt-3">
          <PrimaryButton onClick={() => void setState({ testrideAccepted: true }, "Customer accepted free test ride")}>
            Yes, book a test ride
          </PrimaryButton>
        </div>
      </Card>
    );
  }

  if (!skipScheduling && !state.model) {
    return <ModelPicker state={state} setState={setState} ctaLabel="Continue to date →" onConfirm={() => {}} />;
  }

  if (
    state.dealerConfirmRequired &&
    state.calendarFree === false &&
    state.altOptions.length > 0 &&
    !state.customerReconfirmed
  ) {
    return (
      <Card>
        <Badge tone="warn">Reschedule needed</Badge>
        <p className="mt-2 text-sm">Your original slot is busy. Pick an alternate:</p>
        <div className="mt-3 space-y-2">
          {state.altOptions.map((alt) => (
            <button
              key={`${alt.date}-${alt.time}`}
              type="button"
              onClick={() =>
                void setState(
                  { chosenSlot: alt, customerReconfirmed: true, calendarFree: true },
                  `Customer picked alt slot ${alt.label}`,
                )
              }
              className="ad-card-flat w-full !p-3 text-left text-xs"
            >
              {alt.label} · {alt.time}
            </button>
          ))}
        </div>
      </Card>
    );
  }

  if (!skipScheduling && !chosenSlot) {
    return (
      <Card>
        <div className="text-xs font-semibold uppercase tracking-wider ad-caption">📩 Pick date &amp; time</div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input type="date" value={dateIso} min={today.toISOString().slice(0, 10)} onChange={(e) => { setDateIso(e.target.value); setDateText(""); }} className="field-input" />
          <input value={dateText} onChange={(e) => { setDateText(e.target.value); setDateIso(""); }} placeholder="DD/MM/YYYY" className="field-input" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {driverSlots.map((s) => {
            if (!s) return null;
            const key = `${s.date}-${s.time}-${s.driverId ?? "open"}`;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedSlotKey(key)}
                className={`ad-chip text-left ${selectedSlotKey === key ? "ad-chip-active" : ""}`}
              >
                {s.time}
                {s.driverName ? ` · ${s.driverName}` : ""}
                {s.dealerName ? ` @ ${s.dealerName}` : ""}
              </button>
            );
          })}
        </div>
        {classification && (
          <p className="mt-3 rounded-lg bg-[var(--ad-surface-light)] px-3 py-2 text-[11px] text-[var(--ad-text-primary)]">
            {classification.dateClass === "gt7" && "✅ More than a week — auto-schedule with dealer."}
            {classification.dateClass === "lt7" && "⚠️ Less than a week — dealer confirms calendar."}
            {classification.dateClass === "weekend" && "⚠️ Weekend — dealer review needed."}
          </p>
        )}
        <div className="mt-3">
          <PrimaryButton
            disabled={!pickedDate || !selectedSlotKey}
            onClick={() => {
              if (!pickedDate || !classification) return;
              const chosen = driverSlots.find(
                (s) => s && `${s.date}-${s.time}-${s.driverId ?? "open"}` === selectedSlotKey,
              );
              if (!chosen) return;
              void bookDriverTiedSlot(setState, chosen, {
                bookingDate: today.getTime(),
                dateClass: classification.dateClass,
                dealerConfirmRequired: classification.needsConfirm,
                selectedDealerCode: chosen.dealerCode ?? null,
              }, state);
            }}
          >
            Confirm test ride →
          </PrimaryButton>
        </div>
      </Card>
    );
  }

  if (confirmed && state.otp && chosenSlot) {
    return null;
  }

  if (isWaitingForDealerAssignment(state)) {
    return null;
  }

  return (
    <Card>
      <p className="text-xs ad-caption">Waiting for dealer to confirm and assign driver…</p>
    </Card>
  );
}
