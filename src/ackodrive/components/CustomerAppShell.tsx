import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { clearSession } from "../auth";

export function CustomerAppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="ad-page ad-customer-app min-h-dvh">
      <SiteHeader
        onLogout={() => {
          clearSession("customer");
          navigate("/");
        }}
      />
      <main className="ad-customer-main">{children}</main>
    </div>
  );
}
