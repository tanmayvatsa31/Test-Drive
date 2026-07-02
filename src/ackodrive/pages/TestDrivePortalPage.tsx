import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { PortalGrid } from "../components/PortalGrid";
import { formatIndianMobile, setSession } from "../auth";
import {
  clearPortalGate,
  getPortalGateUser,
  isSuperadminView,
  setSuperadminView,
  type PortalGateUser,
} from "../portalGate";
import type { Role } from "../types";

type PortalStep = "role" | "management";

type PortalRoleChoice = {
  id: "superadmin" | Role;
  label: string;
  emoji: string;
  desc: string;
};

const PORTAL_ROLE_CHOICES: PortalRoleChoice[] = [
  {
    id: "superadmin",
    label: "Superadmin",
    emoji: "👑",
    desc: "Open the full test drive management console and all portals",
  },
];

const ROLE_DESTINATIONS: Record<Role, string> = {
  customer: "/customer",
  dealer: "/dealer",
  driver: "/driver",
  oem: "/master",
};

function resolveInitialStep(): PortalStep {
  if (isSuperadminView()) return "management";
  return "role";
}

function RoleSelectPanel({
  gateUser,
  onSuperadmin,
  onRolePortal,
}: {
  gateUser: PortalGateUser;
  onSuperadmin: () => void;
  onRolePortal: (role: Role) => void;
}) {
  return (
    <>
      <p className="ad-body text-sm">
        Signed in as <span className="font-medium text-[var(--ad-text-primary)]">{gateUser.name}</span>. Choose how you
        want to continue.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PORTAL_ROLE_CHOICES.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => {
              if (choice.id === "superadmin") {
                onSuperadmin();
                return;
              }
              onRolePortal(choice.id);
            }}
            className="ad-portal-card text-left transition-shadow hover:shadow-md"
          >
            <div className="text-2xl">{choice.emoji}</div>
            <div className="mt-3 text-base font-semibold text-[var(--ad-text-primary)]">{choice.label}</div>
            <div className="ad-caption mt-1">{choice.desc}</div>
          </button>
        ))}
      </div>
    </>
  );
}

function ManagementConsole({
  gateUser,
  onSwitchRole,
  onSignOut,
}: {
  gateUser: PortalGateUser;
  onSwitchRole: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--ad-surface-light)] px-3 py-1 text-xs font-medium text-[var(--ad-text-secondary)]">
            <span>👑</span> Superadmin
          </div>
          <h1 className="ad-display text-xl sm:text-2xl">Test Drive Management Portal</h1>
          <p className="ad-body mt-2 max-w-3xl text-sm leading-relaxed">
            Run the complete car test drive lifecycle from one place. Each portal below serves a distinct role in the
            journey — Tata web captures enquiries, the customer app handles booking and feedback, the dealer portal
            coordinates calendar and driver roster, the driver app executes masked calls and ride closure, and the OEM
            control room orchestrates the end-to-end flow. Open portals in separate tabs; state syncs live across all of
            them.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={onSwitchRole} className="ad-btn-secondary">
            Switch role
          </button>
          <button type="button" onClick={onSignOut} className="ad-btn-ghost">
            Sign out
          </button>
        </div>
      </div>

      <p className="ad-caption mb-4">
        Signed in as <span className="font-medium text-[var(--ad-text-primary)]">{gateUser.name}</span> (
        {formatIndianMobile(gateUser.phone)})
      </p>

      <PortalGrid />
    </>
  );
}

export function TestDrivePortalPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<PortalStep>(resolveInitialStep);
  const [gateUser, setGateUser] = useState<PortalGateUser | null>(() => getPortalGateUser());

  useEffect(() => {
    if (!getPortalGateUser()) {
      navigate("/", { replace: true, state: { openLogin: true } });
    }
  }, [navigate]);

  useEffect(() => {
    const sync = () => {
      const user = getPortalGateUser();
      setGateUser(user);
      if (!user) {
        navigate("/", { replace: true, state: { openLogin: true } });
        return;
      }
      if (isSuperadminView()) {
        setStep("management");
        return;
      }
      setStep((current) => (current === "management" ? "role" : current));
    };

    window.addEventListener("ackodrive_portal_gate_changed", sync);
    return () => window.removeEventListener("ackodrive_portal_gate_changed", sync);
  }, [navigate]);

  const handleSuperadmin = () => {
    if (!gateUser) return;
    setSession({ role: "oem", phone: gateUser.phone, name: gateUser.name });
    setSuperadminView(true);
    setStep("management");
  };

  const handleRolePortal = (role: Role) => {
    if (!gateUser) return;
    setSession({ role, phone: gateUser.phone, name: gateUser.name });
    setSuperadminView(false);
    navigate(ROLE_DESTINATIONS[role]);
  };

  const handleSwitchRole = () => {
    setSuperadminView(false);
    setStep("role");
  };

  const handleSignOut = () => {
    clearPortalGate();
    setGateUser(null);
    navigate("/", { replace: true });
  };

  if (!gateUser) return null;

  return (
    <div className="ad-page">
      <SiteHeader />

      <main className="ad-page-main pb-12 pt-6 sm:pb-16 sm:pt-8">
        {step === "role" && (
          <div className="mx-auto max-w-3xl">
            <h1 className="ad-display text-xl sm:text-2xl">Who are you?</h1>
            <RoleSelectPanel gateUser={gateUser} onSuperadmin={handleSuperadmin} onRolePortal={handleRolePortal} />
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={handleSignOut} className="ad-btn-ghost">
                Sign out
              </button>
              <Link to="/" className="ad-btn-ghost inline-flex items-center">
                ← Back to home
              </Link>
            </div>
          </div>
        )}

        {step === "management" && (
          <ManagementConsole gateUser={gateUser} onSwitchRole={handleSwitchRole} onSignOut={handleSignOut} />
        )}
      </main>
    </div>
  );
}
