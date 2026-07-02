import { useState } from "react";
import { DEMO_OTP } from "../constants";
import { parseAckoEmail, setSession, verifyOtp } from "../auth";
import type { Role } from "../types";

export function PortalEmailLoginForm({
  role,
  title = "Sign in with Acko email",
  subtitle = "Use your @acko.com or @acko.tech address",
  onSuccess,
}: {
  role: Exclude<Role, "customer">;
  title?: string;
  subtitle?: string;
  onSuccess?: (user: { name: string; email: string }) => void;
}) {
  const [step, setStep] = useState<"identity" | "otp">("identity");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayTarget, setDisplayTarget] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sendOtp = () => {
    setError(null);
    const match = parseAckoEmail(email);
    if (!match) {
      setError("Use a valid @acko.com or @acko.tech email address.");
      return;
    }
    setDisplayName(match.name);
    setDisplayTarget(email.trim().toLowerCase());
    setStep("otp");
  };

  const verify = () => {
    setError(null);
    if (!verifyOtp(otp)) {
      setError(`Wrong OTP. Use ${DEMO_OTP} for the demo.`);
      return;
    }
    const normalized = email.trim().toLowerCase();
    setSession({
      role,
      email: normalized,
      phone: normalized,
      name: displayName,
    });
    onSuccess?.({ name: displayName, email: normalized });
  };

  return (
    <div>
      <h2 className="ad-label text-base font-semibold">{title}</h2>
      <p className="ad-caption mt-1">{subtitle}</p>

      {step === "identity" ? (
        <>
          <label className="ad-caption mb-2 mt-4 block">Acko email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@acko.com"
            className="field-input"
            autoComplete="email"
            autoFocus
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <button type="button" onClick={sendOtp} className="ad-btn-primary mt-4 w-full">
            Send OTP
          </button>
        </>
      ) : (
        <>
          <div className="ad-caption mt-4">
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
          <p className="ad-caption mt-2">
            <button
              type="button"
              onClick={() => setOtp(DEMO_OTP)}
              className="font-mono font-semibold text-[var(--ad-text-primary)] underline"
            >
              OTP: {DEMO_OTP}
            </button>
          </p>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <button type="button" onClick={verify} className="ad-btn-primary mt-4 w-full">
            Verify &amp; continue
          </button>
          <button type="button" onClick={() => setStep("identity")} className="ad-btn-ghost mt-2 w-full">
            Change email
          </button>
        </>
      )}
    </div>
  );
}
