export const APP_URLS = {
  customer: import.meta.env.VITE_CUSTOMER_URL ?? "http://127.0.0.1:5173",
  driver: import.meta.env.VITE_DRIVER_URL ?? "http://127.0.0.1:5174",
  admin: import.meta.env.VITE_ADMIN_URL ?? "http://127.0.0.1:5175",
  viewer: import.meta.env.VITE_VIEWER_URL ?? "http://127.0.0.1:5176",
} as const;

export type DemoFlowTab = {
  id: string;
  label: string;
  url: string;
};

/** All portals in the live demo — customer, driver, dealer, OEM. */
export function getDemoFlowTabs(): DemoFlowTab[] {
  const admin = APP_URLS.admin.replace(/\/$/, "");
  const customer = APP_URLS.customer.replace(/\/$/, "");
  const driver = APP_URLS.driver.replace(/\/$/, "");

  return [
    { id: "customer", label: "Customer app", url: customer },
    { id: "driver", label: "Driver app", url: driver },
    { id: "dealer", label: "Dealer portal", url: `${admin}/login/dealer` },
    { id: "oem", label: "OEM control room", url: `${admin}/login/oem` },
    { id: "presenter", label: "Presenter kit", url: `${admin}/login` },
  ];
}

export function openApp(app: keyof typeof APP_URLS, path = ""): void {
  const base = APP_URLS[app].replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : path ? `/${path}` : "";
  window.open(`${base}${suffix}`, "_blank", "noopener,noreferrer");
}

/** Open every demo portal in a new tab (must be called from a click handler). */
export function openAllDemoFlowTabs(): void {
  for (const tab of getDemoFlowTabs()) {
    window.open(tab.url, "_blank", "noopener,noreferrer");
  }
}
