import { useState } from "react";
import { DEMO_OTP } from "../constants";
import { formatIndianMobile, normalizeIndianMobile, portalUserFromPhone, verifyOtp } from "../auth";
import type { PortalGateUser } from "../portalGate";

export function PortalLoginForm({
  onSuccess,
  hideOtpHint = false,
}: {
  onSuccess: (user: PortalGateUser) => void;
  hideOtpHint?: boolean;
}) {
  const [step, setStep] = useState<"identity" | "otp">("identity");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [displayTarget, setDisplayTarget] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sendOtp = () => {
    setError(null);
    const normalized = normalizeIndianMobile(phone);
    if (!normalized) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setDisplayTarget(formatIndianMobile(normalized));
    setStep("otp");
  };

  const verify = () => {
    setError(null);
    if (!verifyOtp(otp)) {
      setError(hideOtpHint ? "Wrong OTP. Try again." : `Wrong OTP. Use ${DEMO_OTP} for the demo.`);
      return;
    }
    const normalized = normalizeIndianMobile(phone);
    if (!normalized) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    onSuccess(portalUserFromPhone(normalized));
  };

  return (
    <div>
      {step === "identity" ? (
        <>
          <label className="ad-caption mb-2 block">Mobile number</label>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--ad-border-default)] px-3 py-2 focus-within:border-[var(--ad-border-selected)]">
            <span className="text-sm text-[var(--ad-text-tertiary)]">+91</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              type="tel"
              inputMode="numeric"
              placeholder="9876543210"
              className="w-full border-none bg-transparent text-sm outline-none"
              autoComplete="tel"
              autoFocus
            />
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <button type="button" onClick={sendOtp} className="ad-btn-primary mt-4 w-full">
            Send OTP
          </button>
        </>
      ) : (
        <>
          <div className="ad-caption">
            OTP sent to <span className="font-mono text-[var(--ad-text-primary)]">{displayTarget}</span>
          </div>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            maxLength={6}
            className="mt-3 w-full rounded-lg border border-[var(--ad-border-default)] px-3 py-2 text-center font-mono text-xl tracking-[0.5em] focus:border-[var(--ad-border-selected)] focus:outline-none"
            autoFocus
          />
          {!hideOtpHint && (
            <p className="ad-caption mt-2">
              <button
                type="button"
                onClick={() => setOtp(DEMO_OTP)}
                className="font-mono font-semibold text-[var(--ad-text-primary)] underline"
              >
                OTP: {DEMO_OTP}
              </button>
            </p>
          )}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <button type="button" onClick={verify} className="ad-btn-primary mt-4 w-full">
            Verify &amp; continue
          </button>
          <button type="button" onClick={() => setStep("identity")} className="ad-btn-ghost mt-2 w-full">
            Change mobile number
          </button>
        </>
      )}
    </div>
  );
}
