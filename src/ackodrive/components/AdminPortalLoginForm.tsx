import { useState } from "react";
import { DEMO_OTP } from "../constants";
import { parseAckoEmail, setSession, verifyOtp } from "../auth";
import type { Role } from "../types";

export function AdminPortalLoginForm({
  role,
  title = "Superadmin Portal",
  emailHint = "Sign in with your @acko.com or @acko.tech email",
  onSuccess,
}: {
  role: Exclude<Role, "customer">;
  title?: string;
  emailHint?: string;
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
    <div className="ad-admin-login-card">
      <h1 className="ad-admin-login-title">{title}</h1>

      {step === "identity" ? (
        <div className="ad-admin-login-form">
          <div className="ad-admin-login-field-group">
            <label className="sr-only" htmlFor="admin-email">
              Email Address
            </label>
            <input
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email Address"
              className="ad-admin-login-input"
              autoComplete="email"
              autoFocus
            />
            <p className="ad-admin-login-hint">{emailHint}</p>
          </div>
          {error && <p className="ad-admin-login-error">{error}</p>}
          <button type="button" onClick={sendOtp} className="ad-admin-login-submit">
            Send OTP
          </button>
        </div>
      ) : (
        <div className="ad-admin-login-form">
          <p className="ad-admin-login-hint">
            OTP sent to <span className="ad-admin-login-email">{displayTarget}</span>
          </p>
          <label className="sr-only" htmlFor="admin-otp">
            One-time password
          </label>
          <input
            id="admin-otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter OTP"
            className="ad-admin-login-input ad-admin-login-input--otp"
            autoFocus
          />
          <p className="ad-admin-login-otp-demo">
            Demo OTP:{" "}
            <button type="button" className="ad-admin-login-otp-fill" onClick={() => setOtp(DEMO_OTP)}>
              {DEMO_OTP}
            </button>
          </p>
          {error && <p className="ad-admin-login-error">{error}</p>}
          <button type="button" onClick={verify} className="ad-admin-login-submit">
            Verify &amp; continue
          </button>
          <button type="button" onClick={() => setStep("identity")} className="ad-admin-login-back">
            Change email
          </button>
        </div>
      )}
    </div>
  );
}
