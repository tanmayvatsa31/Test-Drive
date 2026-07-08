import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TIME_SLOTS } from "../constants";
import type { DemoState } from "../types";
import { classifyDate, generateDriverTiedSlots, parseDateInput } from "../workflow";
import { bookDriverTiedSlot, type SetStateFn } from "../workflowActions";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type DateOption = {
  iso: string;
  topLabel: string;
  dayNum: number;
  date: Date;
};

function buildDateOptions(start: Date, count = 6): DateOption[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    date.setHours(0, 0, 0, 0);
    return {
      iso: date.toISOString().slice(0, 10),
      topLabel: index === 0 ? "Today" : DAY_LABELS[date.getDay()],
      dayNum: date.getDate(),
      date,
    };
  });
}

function firstOpenSlotIndex(slotsByWindow: (ReturnType<typeof generateDriverTiedSlots>[number])[]): number {
  const index = slotsByWindow.findIndex((slot) => slot != null);
  return index >= 0 ? index : 0;
}

export function isCustomerSchedulingSlot(state: DemoState): boolean {
  if (!state.testrideAccepted || !state.model) return false;
  if (state.chosenSlot) return false;
  if (state.qualification === "qualified") return false;
  return true;
}

export function ScheduleTestRideScreen({
  state,
  setState,
}: {
  state: DemoState;
  setState: SetStateFn;
}) {
  const navigate = useNavigate();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dateOptions = useMemo(() => buildDateOptions(today), [today]);
  const [selectedDateIso, setSelectedDateIso] = useState(dateOptions[0]?.iso ?? "");
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const selectedDate = dateOptions.find((d) => d.iso === selectedDateIso)?.date ?? null;
  const classification = selectedDate ? classifyDate(today.getTime(), selectedDate) : null;
  const slotsByWindow = selectedDate ? generateDriverTiedSlots(state, selectedDate, state.pincode) : [];
  const effectiveTimeIndex =
    slotsByWindow[selectedTimeIndex] != null ? selectedTimeIndex : firstOpenSlotIndex(slotsByWindow);
  const selectedSlot = slotsByWindow[effectiveTimeIndex] ?? null;
  const hasAnyOpenSlot = slotsByWindow.some((slot) => slot != null);

  if (
    state.dealerConfirmRequired &&
    state.calendarFree === false &&
    state.altOptions.length > 0 &&
    !state.customerReconfirmed
  ) {
    return (
      <div className="ad-timeslot-page">
        <button type="button" className="ad-timeslot-back" onClick={() => navigate("/cars")} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M14.5 5.5L8 12l6.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="ad-timeslot-title">Pick another slot</h1>
        <div className="ad-timeslot-slots">
          {state.altOptions.map((alt) => (
            <button
              key={`${alt.date}-${alt.time}`}
              type="button"
              className="ad-timeslot-slot"
              onClick={() => {
                const altDate = parseDateInput(alt.date);
                const classification = altDate ? classifyDate(today.getTime(), altDate) : null;
                void bookDriverTiedSlot(
                  setState,
                  alt,
                  {
                    bookingDate: today.getTime(),
                    dateClass: classification?.dateClass ?? state.dateClass ?? "lt7",
                    dealerConfirmRequired: false,
                    selectedDealerCode: alt.dealerCode ?? state.selectedDealerCode,
                  },
                  state,
                ).then(() =>
                  setState({ customerReconfirmed: true, calendarFree: true }, "Customer picked alt slot"),
                );
              }}
            >
              {alt.label} · {alt.time}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const handleContinue = async () => {
    if (!selectedDate || !classification || !selectedSlot || submitting) return;

    setSubmitting(true);
    await bookDriverTiedSlot(setState, selectedSlot, {
      bookingDate: today.getTime(),
      dateClass: classification.dateClass,
      dealerConfirmRequired: classification.needsConfirm,
      selectedDealerCode: selectedSlot.dealerCode ?? null,
    }, state);
    setSubmitting(false);
  };

  const handleDateSelect = (iso: string) => {
    setSelectedDateIso(iso);
    const date = dateOptions.find((option) => option.iso === iso)?.date;
    if (!date) {
      setSelectedTimeIndex(0);
      return;
    }
    const openSlots = generateDriverTiedSlots(state, date, state.pincode);
    setSelectedTimeIndex(firstOpenSlotIndex(openSlots));
  };

  return (
    <div className="ad-timeslot-page">
      <button type="button" className="ad-timeslot-back" onClick={() => navigate("/cars")} aria-label="Go back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14.5 5.5L8 12l6.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <h1 className="ad-timeslot-title">
        Choose a slot for your
        <br />
        <span className="ad-timeslot-title-accent">test drive</span>
      </h1>

      <div className="ad-timeslot-dates" role="tablist" aria-label="Choose a date">
        {dateOptions.map((option) => {
          const selected = option.iso === selectedDateIso;
          return (
            <button
              key={option.iso}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`ad-timeslot-date ${selected ? "ad-timeslot-date-selected" : ""}`}
              onClick={() => handleDateSelect(option.iso)}
            >
              <span className="ad-timeslot-date-label">{option.topLabel}</span>
              <span className="ad-timeslot-date-num">{option.dayNum}</span>
            </button>
          );
        })}
      </div>

      <div className="ad-timeslot-slots" role="radiogroup" aria-label="Choose a time slot">
        {TIME_SLOTS.map((window, index) => {
          const slot = slotsByWindow[index];
          const open = slot != null;
          const selected = index === effectiveTimeIndex;
          return (
            <button
              key={window}
              type="button"
              role="radio"
              aria-checked={selected && open}
              disabled={!open}
              className={`ad-timeslot-slot ${selected && open ? "ad-timeslot-slot-selected" : ""} ${!open ? "ad-timeslot-slot-unavailable" : ""}`}
              onClick={() => open && setSelectedTimeIndex(index)}
            >
              {window}
            </button>
          );
        })}
      </div>

      {!hasAnyOpenSlot && (
        <p className="ad-timeslot-empty">
          No slots open for this date. Ask your dealer to mark drivers available for more time windows.
        </p>
      )}

      <section className="ad-timeslot-info" aria-label="Important to know">
        <h2 className="ad-timeslot-info-title">Important to know</h2>
        <ul className="ad-timeslot-info-list">
          <li>The driver will be at your mentioned location and will wait for you to start the trip</li>
          <li>You can modify your booking up to 3 hours before the test drive slot.</li>
        </ul>
      </section>

      <div className="ad-timeslot-footer">
        <div className="ad-timeslot-footer-inner">
          <button
            type="button"
            className="ad-timeslot-continue"
            disabled={!selectedDate || !selectedSlot || submitting}
            onClick={() => void handleContinue()}
          >
            {submitting ? "Booking…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
