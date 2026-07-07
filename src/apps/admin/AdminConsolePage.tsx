import { Link } from "react-router-dom";
import { AdminNotificationCenter } from "../../ackodrive/components/AdminNotificationCenter";
import { PortalGrid } from "../../ackodrive/components/PortalGrid";
import { useAdminDemoBootstrap } from "../../ackodrive/hooks/useAdminDemoBootstrap";
import { useAdminNotificationFeed } from "../../ackodrive/hooks/useAdminNotificationFeed";
import { useSlaWatchdog } from "../../ackodrive/hooks/useSlaWatchdog";
import { clearPortalGate, getPortalGateUser } from "../../ackodrive/portalGate";
import { clearSession, formatIndianMobile } from "../../ackodrive/auth";
import { redirectToAppRoute } from "../../ackodrive/appUrls";

export function AdminConsolePage() {
  const gateUser = getPortalGateUser();
  const feed = useAdminNotificationFeed();

  useSlaWatchdog();
  useAdminDemoBootstrap(feed.push);

  if (!gateUser) return null;

  const handleSignOut = () => {
    clearPortalGate();
    clearSession();
    redirectToAppRoute("/login");
  };

  return (
    <div className="ad-page min-h-dvh">
      <header className="border-b border-[var(--ad-border-default)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-[var(--ad-surface-light)] px-3 py-1 text-xs font-medium">
              👑 Superadmin
            </div>
            <h1 className="ad-display text-xl sm:text-2xl">Test Drive Management Portal</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminNotificationCenter
              notifications={feed.notifications}
              unreadCount={feed.unreadCount}
              open={feed.open}
              onToggle={() => feed.setOpen((v) => !v)}
              onDismiss={feed.dismiss}
              onClearAll={feed.clearAll}
            />
            <Link to="/presenter" className="ad-btn-primary !w-auto !text-sm">
              Presenter kit
            </Link>
            <button type="button" onClick={handleSignOut} className="ad-btn-ghost text-sm">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="ad-page-main mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="ad-caption mb-4">
          Signed in as <span className="font-medium">{gateUser.name}</span> ({formatIndianMobile(gateUser.phone)})
        </p>

        <PortalGrid />
      </main>
    </div>
  );
}
