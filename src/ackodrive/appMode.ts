export type AppTarget = "customer" | "driver" | "admin";

function readAppTarget(): AppTarget | "" {
  const fromDom = document.documentElement.dataset.app as AppTarget | undefined;
  if (fromDom === "customer" || fromDom === "driver" || fromDom === "admin") return fromDom;
  const fromEnv = import.meta.env.VITE_APP_TARGET as AppTarget | undefined;
  if (fromEnv === "customer" || fromEnv === "driver" || fromEnv === "admin") return fromEnv;
  return "";
}

export const APP_TARGET = readAppTarget();

export const isCustomerApp = APP_TARGET === "customer";
export const isDriverApp = APP_TARGET === "driver";
export const isAdminApp = APP_TARGET === "admin";

export function loginPathForRole(role: "customer" | "driver" | "dealer" | "oem"): string {
  if (role === "customer" && isCustomerApp) return "/";
  if (role === "driver" && isDriverApp) return "/";
  if (role === "dealer" && isAdminApp) return "/login/dealer";
  if (role === "oem" && isAdminApp) return "/login/oem";
  return `/login?role=${role}`;
}
