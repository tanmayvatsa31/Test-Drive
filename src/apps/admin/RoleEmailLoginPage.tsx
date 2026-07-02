import { useNavigate } from "react-router-dom";
import { PortalEmailLoginForm } from "../../ackodrive/components/PortalEmailLoginForm";
import { setSession } from "../../ackodrive/auth";
import { setPortalGateUser, setSuperadminView } from "../../ackodrive/portalGate";
import type { Role } from "../../ackodrive/types";

export function RoleEmailLoginPage({
  role,
  redirectTo,
  title,
  subtitle,
  setupConsole,
}: {
  role: Exclude<Role, "customer">;
  redirectTo: string;
  title: string;
  subtitle: string;
  setupConsole?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div className="ad-page min-h-dvh">
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">
        <div className="ad-card !mb-0">
          <PortalEmailLoginForm
            role={role}
            title={title}
            subtitle={subtitle}
            onSuccess={(user) => {
              if (setupConsole) {
                setPortalGateUser({ name: user.name, phone: user.email });
                setSession({ role: "oem", email: user.email, phone: user.email, name: user.name });
                setSession({ role: "dealer", email: user.email, phone: user.email, name: user.name });
                setSuperadminView(true);
              }
              navigate(redirectTo, { replace: true });
            }}
          />
        </div>
      </main>
    </div>
  );
}
