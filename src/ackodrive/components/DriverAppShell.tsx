import type { ReactNode } from "react";

export function DriverAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="ad-page ad-driver-app">
      <main className="ad-driver-app-main">{children}</main>
    </div>
  );
}
