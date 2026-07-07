import { useNavigate } from "react-router-dom";
import { AdminPortalLoginForm } from "../../ackodrive/components/AdminPortalLoginForm";
import { AdminLoginPoweredBy } from "./AdminLoginPoweredBy";

/** OEM Data Sheet — same login shell as Superadmin Portal */
export function OemLoginPage() {
  const navigate = useNavigate();

  return (
    <div className="ad-admin-login-page">
      <div className="ad-admin-login-stage">
        <div className="ad-admin-login-panel">
          <AdminPortalLoginForm
            role="oem"
            title="OEM Data Sheet"
            emailHint="Sign in with your @acko.com or @acko.tech email"
            onSuccess={() => {
              navigate("/oem", { replace: true });
            }}
          />

          <AdminLoginPoweredBy />
        </div>
      </div>
    </div>
  );
}
