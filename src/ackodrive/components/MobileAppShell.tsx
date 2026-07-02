import { useEffect, useState, type ReactNode } from "react";
import { clearSession, getSession } from "../auth";
import type { Role } from "../types";

const APP_TITLES: Record<"customer" | "driver", string> = {
  customer: "Ackodrive",
  driver: "Driver App",
};

export function MobileAppShell({
  role,
  children,
  loginPath = "/",
}: {
  role: "customer" | "driver";
  children: ReactNode;
  loginPath?: string;
}) {
  const session = useMobileSession(role);

  return (
    <div className="ad-page min-h-dvh bg-[var(--ad-surface-white)]">
      <header className="sticky top-0 z-20 border-b border-[var(--ad-border-default)] bg-white/95 backdrop-blur-sm pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-[430px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="ad-logo-mark text-[10px]">AD</span>
            <span className="text-sm font-semibold text-[var(--ad-text-primary)]">{APP_TITLES[role]}</span>
          </div>
          {session && (
            <button
              type="button"
              onClick={() => {
                clearSession(role);
                window.location.href = loginPath;
              }}
              className="text-[11px] text-[var(--ad-text-tertiary)] underline"
            >
              Logout
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-[430px] px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  );
}

export function RequireMobileAuth({
  role,
  children,
  loginPath = "/",
}: {
  role: Role;
  children: ReactNode;
  loginPath?: string;
}) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      const session = getSession(role);
      if (!session) {
        setOk(false);
        window.location.href = loginPath;
      } else {
        setOk(true);
      }
    };
    check();
    window.addEventListener("ackodrive_session_changed", check);
    return () => window.removeEventListener("ackodrive_session_changed", check);
  }, [role, loginPath]);

  if (ok !== true) return null;
  return <>{children}</>;
}

function useMobileSession(role: Role) {
  const [session, setSessionState] = useState(() => getSession(role));
  useEffect(() => {
    const handler = () => setSessionState(getSession(role));
    window.addEventListener("ackodrive_session_changed", handler);
    return () => window.removeEventListener("ackodrive_session_changed", handler);
  }, [role]);
  return session;
}
