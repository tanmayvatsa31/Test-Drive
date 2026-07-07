export type AppUrlKey = "customer" | "driver" | "admin" | "viewer";

export type AppUrls = Record<AppUrlKey, string>;

const LOCAL_URLS: AppUrls = {
  customer: import.meta.env.VITE_CUSTOMER_URL ?? "http://127.0.0.1:5173",
  driver: import.meta.env.VITE_DRIVER_URL ?? "http://127.0.0.1:5174",
  admin: import.meta.env.VITE_ADMIN_URL ?? "http://127.0.0.1:5175",
  viewer: import.meta.env.VITE_VIEWER_URL ?? "http://127.0.0.1:5176",
};

function joinBasePath(origin: string, basePath: string, page: string): string {
  const base = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return new URL(page, `${origin}${base}`).href;
}

function resolveSiteBase(): string {
  if (typeof document !== "undefined") {
    const { pathname } = new URL(document.baseURI);
    const segment = pathname.split("/").filter(Boolean)[0];
    if (segment && !segment.endsWith(".html")) {
      return `/${segment}/`;
    }
  }
  return import.meta.env.BASE_URL;
}

function isPublishedSite(): boolean {
  if (import.meta.env.VITE_GITHUB_PAGES === "true") return true;
  return typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
}

/** Resolves app entry URLs for local dev servers or GitHub Pages html entries. */
export function getAppUrls(): AppUrls {
  if (isPublishedSite() && typeof window !== "undefined") {
    const origin = window.location.origin;
    const base = resolveSiteBase();
    return {
      customer: joinBasePath(origin, base, "customer.html"),
      driver: joinBasePath(origin, base, "driver.html"),
      admin: joinBasePath(origin, base, "admin.html"),
      viewer: joinBasePath(origin, base, "viewer.html"),
    };
  }
  return { ...LOCAL_URLS };
}

/** Lazy proxy so existing `APP_URLS.customer` call sites work on GitHub Pages. */
export const APP_URLS: AppUrls = new Proxy({} as AppUrls, {
  get(_target, prop: string) {
    return getAppUrls()[prop as AppUrlKey];
  },
});

export type DemoFlowTab = {
  id: string;
  label: string;
  url: string;
};

/** All portals in the live demo — customer, driver, dealer, OEM. */
export function getDemoFlowTabs(): DemoFlowTab[] {
  const urls = getAppUrls();
  const admin = urls.admin.replace(/\/$/, "");
  const customer = urls.customer.replace(/\/$/, "");
  const driver = urls.driver.replace(/\/$/, "");

  const dealerLogin = isGitHubPagesDeploy() ? `${admin}#/login/dealer` : `${admin}/login/dealer`;
  const oemLogin = getOemDataSheetLoginUrl();
  const presenter = isGitHubPagesDeploy() ? `${admin}#/login` : `${admin}/login`;

  return [
    { id: "customer", label: "Customer app", url: customer },
    { id: "driver", label: "Driver app", url: driver },
    { id: "dealer", label: "Dealer portal", url: dealerLogin },
    { id: "oem", label: "OEM data sheet", url: oemLogin },
    { id: "presenter", label: "Presenter kit", url: presenter },
  ];
}

export function isGitHubPagesDeploy(): boolean {
  if (import.meta.env.VITE_GITHUB_PAGES === "true") return true;
  return typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
}

/** Public login URL for the OEM Data Sheet portal. */
export function getOemDataSheetLoginUrl(): string {
  const admin = getAppUrls().admin.replace(/\/$/, "");
  return isGitHubPagesDeploy() ? `${admin}#/login/oem` : `${admin}/login/oem`;
}

/** Direct URL to the OEM Data Sheet dashboard (requires sign-in). */
export function getOemDataSheetUrl(): string {
  const admin = getAppUrls().admin.replace(/\/$/, "");
  return isGitHubPagesDeploy() ? `${admin}#/oem` : `${admin}/oem`;
}

export function openApp(app: AppUrlKey, path = ""): void {
  const base = getAppUrls()[app].replace(/\/$/, "");
  if (isGitHubPagesDeploy() && path) {
    const hash = path.startsWith("/") ? `#${path}` : `#/${path}`;
    window.open(`${base}${hash}`, "_blank", "noopener,noreferrer");
    return;
  }
  const suffix = path.startsWith("/") ? path : path ? `/${path}` : "";
  window.open(`${base}${suffix}`, "_blank", "noopener,noreferrer");
}

/** Open every demo portal in a new tab (must be called from a click handler). */
export function openAllDemoFlowTabs(): void {
  for (const tab of getDemoFlowTabs()) {
    window.open(tab.url, "_blank", "noopener,noreferrer");
  }
}
