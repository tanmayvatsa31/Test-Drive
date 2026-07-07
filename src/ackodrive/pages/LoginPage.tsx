import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { DEMO_ACCOUNTS, DEMO_OTP } from "../constants";
import { getSession, lookupPhone, parseAckoEmail, setSession, verifyOtp } from "../auth";
import type { Role } from "../types";

const ROLES: { role: Role; label: string; emoji: string }[] = [
  { role: "customer", label: "Customer", emoji: "📱" },
  { role: "dealer", label: "Dealer", emoji: "🏢" },
  { role: "driver", label: "Driver", emoji: "🚗" },
  { role: "oem", label: "OEM", emoji: "🎛️" },
];

const REDIRECTS: Record<Role, string> = {
  customer: "/customer",
  dealer: "/dealer",
  driver: "/driver",
  oem: "/oem",
};

export function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>((params.get("role") as Role) ?? "customer");
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<"identity" | "otp">("identity");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayTarget, setDisplayTarget] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const r = params.get("role") as Role | null;
    if (r) setRole(r);
    setStep("identity");
    setOtp("");
    if (r === "customer") setMode("email");
  }, [params]);

  useEffect(() => {
    if (getSession(role)) {
      navigate(params.get("redirect") || REDIRECTS[role], { replace: true });
    }
  }, [navigate, params, role]);

  const sendOtp = () => {
    setError(null);
    if (mode === "phone") {
      const match = lookupPhone(role, phone);
      if (!match) {
        setError("This phone is not registered for this role.");
        return;
      }
      setDisplayName(match.name);
      setDisplayTarget(`+91 ${phone}`);
    } else {
      const match = parseAckoEmail(email);
      if (!match) {
        setError("Use a valid @acko.com or @acko.tech email address.");
        return;
      }
      setDisplayName(match.name);
      setDisplayTarget(email.trim().toLowerCase());
    }
    setStep("otp");
  };

  const verify = () => {
    setError(null);
    if (!verifyOtp(otp)) {
      setError(`Wrong OTP. Use ${DEMO_OTP} for the demo.`);
      return;
    }
    if (mode === "phone") {
      setSession({ role, phone: phone.replace(/\D/g, "").slice(-10), name: displayName });
    } else {
      setSession({ role, email: email.trim().toLowerCase(), phone: email.trim().toLowerCase(), name: displayName });
    }
    navigate(params.get("redirect") || REDIRECTS[role]);
  };

  const demoPhone = role !== "customer" ? (DEMO_ACCOUNTS[role][0]?.phone ?? "") : "";

  return (
    <div className="ad-page">
      <SiteHeader />

      <main className="mx-auto max-w-md px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <h1 className="ad-display text-xl sm:text-2xl">Sign in</h1>
        <p className="ad-body mt-2 text-sm">
          Open each portal in a separate tab — demo state syncs live across all of them. Sign in with any{" "}
          <span className="font-mono text-[var(--ad-text-primary)]">@acko.com</span> /{" "}
          <span className="font-mono text-[var(--ad-text-primary)]">@acko.tech</span> email, OTP{" "}
          <span className="font-mono font-semibold">{DEMO_OTP}</span>.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ROLES.map((r) => (
            <button
              key={r.role}
              onClick={() => {
                setRole(r.role);
                setStep("identity");
                setOtp("");
                if (r.role === "customer") setMode("email");
              }}
              className={`ad-role-btn ${role === r.role ? "ad-role-btn-active" : ""}`}
            >
              <span className="text-lg">{r.emoji}</span>
              {r.label}
            </button>
          ))}
        </div>

        <section className="ad-card mt-5">
          {step === "identity" ? (
            <>
              <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-[var(--ad-surface-light)] p-1 text-xs font-semibold">
                <button
                  onClick={() => {
                    setMode("email");
                    setError(null);
                  }}
                  className={`rounded-md px-3 py-1.5 ${mode === "email" ? "bg-white shadow-sm text-[var(--ad-text-primary)]" : "text-[var(--ad-text-tertiary)]"}`}
                >
                  Acko email SSO
                </button>
                <button
                  disabled={role === "customer"}
                  onClick={() => {
                    setMode("phone");
                    setError(null);
                  }}
                  className={`rounded-md px-3 py-1.5 ${mode === "phone" ? "bg-white shadow-sm text-[var(--ad-text-primary)]" : "text-[var(--ad-text-tertiary)]"} disabled:opacity-40`}
                >
                  Demo phone
                </button>
              </div>

              {mode === "email" ? (
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@acko.com"
                  className="field-input"
                  autoComplete="email"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-[var(--ad-border-default)] px-3 py-2 focus-within:border-[var(--ad-border-selected)]">
                  <span className="text-sm text-[var(--ad-text-tertiary)]">+91</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder={demoPhone}
                    className="w-full border-none bg-transparent text-sm outline-none"
                  />
                </div>
              )}

              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              <button onClick={sendOtp} className="ad-btn-primary mt-4">
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
              />
              <p className="ad-caption mt-2">
                Demo OTP is{" "}
                <button onClick={() => setOtp(DEMO_OTP)} className="font-mono font-semibold text-[var(--ad-text-primary)] underline">
                  {DEMO_OTP}
                </button>
              </p>
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              <button onClick={verify} className="ad-btn-primary mt-4">
                Verify &amp; continue
              </button>
              <button onClick={() => setStep("identity")} className="ad-btn-ghost mt-2 w-full">
                Change {mode === "email" ? "email" : "phone number"}
              </button>
            </>
          )}
        </section>

        <p className="ad-caption mt-6 text-center">
          <Link to="/portal" className="text-[var(--ad-text-primary)] underline">
            ← Back to portal
          </Link>
        </p>
      </main>
    </div>
  );
}
