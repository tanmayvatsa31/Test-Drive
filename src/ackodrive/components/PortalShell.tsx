import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { getSession, clearSession } from "../auth";
import { isCustomerApp, isDriverApp, isAdminApp, loginPathForRole } from "../appMode";
import { currentAppPath, redirectToAppRoute } from "../appUrls";
import { CustomerAppShell } from "./CustomerAppShell";
import { DriverAppShell } from "./DriverAppShell";
import { AuthLoading } from "./AuthLoading";
import type { Role } from "../types";

const ROLE_LABELS: Record<Role, string> = {
  customer: "Customer App",
  dealer: "Dealer Portal",
  driver: "Driver App",
  oem: "OEM Data Sheet",
};

export function PortalShell({
  role,
  children,
  wide = false,
}: {
  role: Role;
  children: ReactNode;
  wide?: boolean;
}) {
  const session = useSession(role);
  const loginPath = loginPathForRole(role);

  if (role === "customer" && isCustomerApp) {
    return <CustomerAppShell>{children}</CustomerAppShell>;
  }

  if (role === "driver" && isDriverApp) {
    return <DriverAppShell>{children}</DriverAppShell>;
  }

  const homeLink = isAdminApp ? "/" : "/";

  return (
    <div className="ad-page">
      <header className="ad-header-dark">
        <div className="ad-portal-header-inner mx-auto max-w-6xl">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {!isAdminApp && (
              <Link to={homeLink} className="ad-btn-ghost shrink-0 !text-white/70 hover:!text-white hover:!bg-white/10">
                ← Apps
              </Link>
            )}
            {isAdminApp && (
              <Link to="/" className="ad-btn-ghost shrink-0 !text-white/70 hover:!text-white hover:!bg-white/10">
                ← Console
              </Link>
            )}
            <div className="ad-portal-header-title text-white">{ROLE_LABELS[role]}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {session && (
              <div className="hidden text-right text-[11px] sm:block">
                <div className="font-medium text-white/90">{session.name}</div>
                <button
                  onClick={() => {
                    clearSession(role);
                    redirectToAppRoute(loginPath);
                  }}
                  className="text-[10px] text-white/60 underline hover:text-white/90"
                >
                  Logout
                </button>
              </div>
            )}
            <div className="ad-logo">
              <span className="ad-logo-mark ad-logo-mark-light text-[10px]">AD</span>
              <span className="hidden text-[#121212] sm:inline">Ackodrive</span>
            </div>
          </div>
        </div>
      </header>
      <main className={`ad-portal-main ${wide ? "ad-portal-main--wide" : "ad-portal-main--narrow"}`}>{children}</main>
    </div>
  );
}

export function RequireAuth({ role, children }: { role: Role; children: ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const loginPath = loginPathForRole(role);

  useEffect(() => {
    const check = () => {
      const session = getSession(role);
      if (!session) {
        setOk(false);
        if (currentAppPath() !== loginPath) {
          redirectToAppRoute(loginPath);
        }
      } else {
        setOk(true);
      }
    };
    check();
    window.addEventListener("ackodrive_session_changed", check);
    return () => window.removeEventListener("ackodrive_session_changed", check);
  }, [role, loginPath]);

  if (ok === null) return <AuthLoading />;
  if (ok !== true) return <AuthLoading label="Redirecting to sign in…" />;
  return <>{children}</>;
}

function useSession(role: Role) {
  const [session, setSessionState] = useState(() => getSession(role));
  useEffect(() => {
    const handler = () => setSessionState(getSession(role));
    window.addEventListener("ackodrive_session_changed", handler);
    return () => window.removeEventListener("ackodrive_session_changed", handler);
  }, [role]);
  return session;
}

export function TurnBanner({ active, role }: { active: boolean; role: string }) {
  if (active) {
    return (
      <div className="ad-turn-active">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        Your turn — act on this screen
      </div>
    );
  }
  return <div className="ad-turn-waiting">⏳ Waiting on the {role} screen…</div>;
}
