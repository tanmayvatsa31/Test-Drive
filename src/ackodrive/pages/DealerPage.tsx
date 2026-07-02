import { useState } from "react";
import { PortalShell, RequireAuth, TurnBanner } from "../components/PortalShell";
import { FlowStepper } from "../components/FlowStepper";
import { CaseList } from "../components/CaseList";
import { TestRideReminder } from "../components/TestRideReminder";
import { Badge, Card, PrimaryButton, TabButton } from "../components/ui";
import { DEALER, MODELS, BRAND_MODELS, TIME_SLOTS } from "../constants";
import { useCases } from "../hooks/useCases";
import { useDemoState } from "../hooks/useDemoState";
import type { DemoState } from "../types";
import { generateAltOptions, getNextActor, isBookingConfirmed, toggleDriverSlotTime } from "../workflow";
import { allotDriverToRide } from "../workflowActions";

export function DealerPage() {
  return (
    <RequireAuth role="dealer">
      <PortalShell role="dealer" wide>
        <DealerContent />
      </PortalShell>
    </RequireAuth>
  );
}

function DealerContent() {
  const { state, setState, loaded } = useDemoState();
  const { cases } = useCases();
  const [tab, setTab] = useState<"live" | "history">("live");

  if (!loaded) return <div className="ad-caption p-8 text-center">Loading…</div>;

  const next = getNextActor(state);
  const confirmed = isBookingConfirmed(state);
  const model = MODELS.find((m) => m.id === state.model) ?? BRAND_MODELS.find((m) => m.id === state.model);

  const allotDriver = async (driverId: string) => {
    const driver = state.driverRoster.find((d) => d.id === driverId);
    if (!driver || !driver.available) return;
    await allotDriverToRide(setState, state, driver.id, driver.name, driver.reg);
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["live", "history"] as const).map((t) => (
          <TabButton key={t} active={tab === t} onClick={() => setTab(t)} className="flex-1 sm:flex-none">
            {t === "live" ? "Live · ongoing" : `Past cases (${cases.length})`}
          </TabButton>
        ))}
      </div>

      {tab === "live" && (
        <div className="grid gap-4 md:grid-cols-[1fr_360px]">
          <div>
            <TurnBanner active={next === "dealer"} role={next} />

            {state.dealerEscalated && (
              <Card className="ad-card-warning !mb-3 !border-2">
                <Badge tone="warn">E3 Escalation</Badge>
                <p className="mt-2 text-sm">
                  No driver marked en route in time and no reassignment was possible. Contact customer and offer
                  reschedule.
                </p>
              </Card>
            )}

            <TestRideReminder
              slotDate={state.chosenSlot?.date}
              slotLabel={state.chosenSlot?.label}
              slotTime={state.chosenSlot?.time}
              audience="dealer"
              customerName={state.customerName}
            />

            {!state.leadSent && (
              <Card>
                <p className="ad-body text-sm">📭 No active lead. Acko ML will route the next qualified customer here.</p>
              </Card>
            )}

            {state.leadSent && (
              <Card>
                <Badge tone="info">Acko ML · {state.qualification}</Badge>
                <div className="ad-label mt-2 text-base">{state.customerName}</div>
                <div className="ad-caption">📍 Pincode {state.pincode}</div>
                <div className="text-xs">
                  {model?.name} · {state.variant}
                </div>
                {state.chosenSlot?.driverName && (
                  <div className="ad-caption mt-1">Requested driver: {state.chosenSlot.driverName}</div>
                )}
                {!state.dealerAccepted && (
                  <div className="mt-3">
                    <PrimaryButton onClick={() => void setState({ dealerAccepted: true }, "Dealer accepted lead")}>
                      Accept lead
                    </PrimaryButton>
                  </div>
                )}
              </Card>
            )}

            {state.dealerAccepted && !confirmed && (
              <CalendarAllot state={state} setState={setState} onAllot={allotDriver} />
            )}

            {confirmed && (
              <Card className="ad-card-success !border-2">
                <Badge tone="ok">Active ride</Badge>
                <div className="mt-1 text-sm font-semibold">
                  {model?.name} · {state.variant}
                </div>
                <div className="text-xs">
                  Driver: {state.driver?.name} · {state.driver?.reg}
                </div>
                {state.driver && !state.rideComplete && (
                  <button
                    onClick={() => void setState({ driverReminderSent: true }, `Reminder sent to ${state.driver?.name}`)}
                    className="ad-btn-primary mt-3 !text-xs"
                  >
                    📩 {state.driverReminderSent ? "Resend" : "Send"} reminder to driver
                  </button>
                )}
              </Card>
            )}
          </div>

          <div>
            <FlowStepper state={state} />
            <Card className="mt-4">
              <div className="ad-overline">Dealer profile</div>
              <div className="ad-label mt-1 text-sm">{DEALER.name}</div>
              <div className="ad-caption">{DEALER.addr}</div>
            </Card>
            <Card>
              <div className="ad-overline">Driver roster &amp; slot availability</div>
              <p className="ad-caption mt-1 text-[11px]">
                Toggle time windows each available driver can take. Customers only see slots you mark open.
              </p>
              <ul className="mt-3 space-y-3">
                {state.driverRoster.map((d) => (
                  <li key={d.id} className="rounded-lg border border-[var(--ad-border-default)] p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="ad-label text-xs">
                        {d.name} · {d.reg}
                      </span>
                      <Badge tone={d.available ? "ok" : "warn"}>{d.available ? "available" : "busy"}</Badge>
                    </div>
                    {d.available ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {TIME_SLOTS.map((time) => {
                          const open = (d.slotTimes?.length ? d.slotTimes : TIME_SLOTS).includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() =>
                                void setState(
                                  { driverRoster: toggleDriverSlotTime(state.driverRoster, d.id, time) },
                                  `Dealer ${open ? "closed" : "opened"} ${time} for ${d.name}`,
                                )
                              }
                              className={`ad-chip !text-[10px] ${open ? "ad-chip-active" : ""}`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="ad-caption mt-2 text-[10px]">On ride — slot toggles resume when driver is free.</p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === "history" && <CaseList cases={cases} />}
    </>
  );
}

function CalendarAllot({
  state,
  setState,
  onAllot,
}: {
  state: DemoState;
  setState: (p: Partial<DemoState>, log?: string) => Promise<void>;
  onAllot: (id: string) => Promise<void>;
}) {
  if (state.dealerConfirmRequired && state.calendarFree === null) {
    return (
      <Card>
        <Badge tone="warn">Calendar check needed</Badge>
        <p className="mt-1 text-sm">Is the slot ({state.chosenSlot?.label}) free?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => void setState({ calendarFree: true }, "Dealer: calendar FREE")} className="ad-btn-primary !text-sm">
            ✓ Calendar free
          </button>
          <button
            onClick={() =>
              void setState(
                {
                  calendarFree: false,
                  altOptions: generateAltOptions(state.bookingDate ?? Date.now(), state.dateClass === "weekend"),
                },
                "Dealer: calendar BUSY",
              )
            }
            className="ad-btn-secondary !py-2 !text-sm"
          >
            ✗ Calendar busy
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Badge tone="ok">Allot driver</Badge>
      <DriverPicker state={state} onPick={onAllot} />
    </Card>
  );
}

function DriverPicker({ state, onPick }: { state: DemoState; onPick: (id: string) => void }) {
  return (
    <div className="mt-2 space-y-1.5">
      {state.driverRoster.map((d) => (
        <button
          key={d.id}
          type="button"
          disabled={!d.available}
          onClick={() => void onPick(d.id)}
          className="ad-card-flat flex w-full items-center justify-between !p-2 text-xs disabled:opacity-50"
        >
          <span className="ad-label text-xs">
            {d.name} · {d.reg}
          </span>
          <span className="font-medium text-[var(--ad-text-primary)]">
            {state.driver?.id === d.id ? "✓ selected" : d.available ? "Pick →" : "busy"}
          </span>
        </button>
      ))}
    </div>
  );
}
