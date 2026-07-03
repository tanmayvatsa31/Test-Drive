import { useNavigate } from "react-router-dom";
import { AdminPortalLoginForm } from "../../ackodrive/components/AdminPortalLoginForm";
import { setSession } from "../../ackodrive/auth";
import { setPortalGateUser, setSuperadminView } from "../../ackodrive/portalGate";
import { publicAsset } from "../../ackodrive/publicAsset";

const ACKO_HORIZONTAL_LOGO = publicAsset("/assets/acko-horizontal.png");

/** Figma ADSC 5519:3827 — Superadmin Portal login */
export function AdminLoginPage() {
  const navigate = useNavigate();

  return (
    <div className="ad-admin-login-page">
      <div className="ad-admin-login-stage">
        <div className="ad-admin-login-panel">
          <AdminPortalLoginForm
            role="oem"
            title="Superadmin Portal"
            emailHint="Sign in with your @acko.com or @acko.tech email"
            onSuccess={(user) => {
              setPortalGateUser({ name: user.name, phone: user.email });
              setSession({ role: "oem", email: user.email, phone: user.email, name: user.name });
              setSession({ role: "dealer", email: user.email, phone: user.email, name: user.name });
              setSuperadminView(true);
              navigate("/", { replace: true });
            }}
          />

          <div className="ad-admin-login-powered">
            <span className="ad-admin-login-powered-label">Powered by</span>
            <img
              src={ACKO_HORIZONTAL_LOGO}
              alt="ACKO"
              className="ad-admin-login-powered-logo"
              width={101}
              height={24}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
