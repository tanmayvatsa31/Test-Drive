import { APP_URLS, isGitHubPagesDeploy } from "./appUrls";
import type { DemoState } from "./types";

export type AdminNotificationTone = "info" | "success" | "warn" | "error";

export type AdminNotification = {
  id: string;
  tone: AdminNotificationTone;
  title: string;
  message: string;
  at: number;
};

const DEMO_PORTS: { id: string; label: string; url: string }[] = [
  { id: "customer", label: "Customer app", url: APP_URLS.customer },
  { id: "driver", label: "Driver app", url: APP_URLS.driver },
  { id: "admin", label: "Admin console", url: APP_URLS.admin },
];

export async function checkDemoPortHealth(): Promise<AdminNotification[]> {
  if (isGitHubPagesDeploy()) return [];

  const at = Date.now();
  const checks = await Promise.all(
    DEMO_PORTS.map(async ({ id, label, url }): Promise<AdminNotification | null> => {
      const base = url.replace(/\/$/, "");
      try {
        const res = await fetch(base, { method: "GET", cache: "no-store" });
        if (!res.ok) {
          return {
            id: `port-down-${id}`,
            tone: "error",
            title: `${label} unreachable`,
            message: `${base} returned HTTP ${res.status}. Run npm run dev:all.`,
            at,
          };
        }
        return null;
      } catch {
        return {
          id: `port-down-${id}`,
          tone: "error",
          title: `${label} unreachable`,
          message: `Could not connect to ${base}. Run npm run dev:all and keep the terminal open.`,
          at,
        };
      }
    }),
  );
  return checks.filter((n): n is AdminNotification => n !== null);
}

export function notificationsFromDemoState(state: DemoState, seenLogCount: number): AdminNotification[] {
  const items: AdminNotification[] = [];

  if (state.dealerEscalated) {
    items.push({
      id: "dealer-escalated",
      tone: "error",
      title: "Driver escalation (E3)",
      message: state.customerNotifyMessage ?? "No driver available — dealer action required.",
      at: state.lastUpdatedAt ?? Date.now(),
    });
  }

  const newLogs = state.log.slice(seenLogCount);
  for (const entry of newLogs) {
    if (/^E[123]:/i.test(entry.m) || /escalat/i.test(entry.m)) {
      items.push({
        id: `log-${entry.t}-${entry.m.slice(0, 32)}`,
        tone: /E3/i.test(entry.m) ? "error" : "warn",
        title: "Workflow alert",
        message: entry.m,
        at: entry.t,
      });
    }
  }

  return items;
}

export function demoTabsBlockedNotification(): AdminNotification {
  return {
    id: `popup-blocked-${Date.now()}`,
    tone: "warn",
    title: "Demo tabs blocked",
    message: "Your browser blocked auto-opening demo portals. Allow pop-ups for this site, or open portals from the grid below.",
    at: Date.now(),
  };
}

export function demoTabsLaunchedNotification(tabCount: number): AdminNotification {
  return {
    id: `demo-launched-${Date.now()}`,
    tone: "success",
    title: "Demo flow started",
    message: `Opened ${tabCount} demo portals in the background. SLA monitoring is active.`,
    at: Date.now(),
  };
}
