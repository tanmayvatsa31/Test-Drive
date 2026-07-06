import { useEffect, useRef } from "react";
import { isEmbedMode } from "../embedMode";
import { APP_URLS, getDemoFlowTabs, isGitHubPagesDeploy } from "../appUrls";
import {
  checkDemoPortHealth,
  demoTabsBlockedNotification,
  demoTabsLaunchedNotification,
  type AdminNotification,
} from "../adminNotifications";

const BOOTSTRAP_KEY = "ackodrive_admin_demo_bootstrapped";

type PushNotification = (n: AdminNotification) => void;

/** Background demo setup: port health + one-time tab launch for the superadmin console. */
export function useAdminDemoBootstrap(push: PushNotification) {
  const started = useRef(false);

  useEffect(() => {
    if (isEmbedMode()) return;
    if (started.current) return;
    started.current = true;

    const run = async () => {
      if (isGitHubPagesDeploy()) return;

      const portIssues = await checkDemoPortHealth();
      portIssues.forEach(push);

      if (portIssues.length > 0) return;

      if (sessionStorage.getItem(BOOTSTRAP_KEY) === "1") return;

      const tabs = getDemoFlowTabs();
      const probe = window.open(tabs[0]?.url ?? APP_URLS.customer, "_blank", "noopener,noreferrer");
      if (!probe) {
        push(demoTabsBlockedNotification());
        sessionStorage.setItem(BOOTSTRAP_KEY, "1");
        return;
      }
      probe.close();

      for (const tab of tabs.slice(1)) {
        window.open(tab.url, "_blank", "noopener,noreferrer");
      }
      window.open(tabs[0].url, "_blank", "noopener,noreferrer");

      sessionStorage.setItem(BOOTSTRAP_KEY, "1");
      push(demoTabsLaunchedNotification(tabs.length));
    };

    void run();

    const healthTimer = setInterval(() => {
      void checkDemoPortHealth().then((issues) => {
        issues.forEach(push);
      });
    }, 60_000);

    return () => clearInterval(healthTimer);
  }, [push]);
}
