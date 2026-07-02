import { useNavigate } from "react-router-dom";
import { PortalLoginForm } from "../../ackodrive/components/PortalLoginForm";
import { lookupPhone, setSession } from "../../ackodrive/auth";
import { DriverSplashScreen } from "./DriverSplashScreen";

export function DriverLoginPage() {
  const navigate = useNavigate();

  return (
    <DriverSplashScreen>
      <h2 className="ad-driver-splash-sheet-title">Driver login</h2>
      <p className="ad-driver-splash-sheet-subtitle">Sign in with your mobile number</p>
      <div className="ad-driver-splash-form">
        <PortalLoginForm
          hideOtpHint
          onSuccess={(user) => {
            const account = lookupPhone("driver", user.phone);
            setSession({
              role: "driver",
              phone: user.phone,
              name: account?.name ?? `Driver · ${user.phone.slice(-4)}`,
            });
            navigate("/app", { replace: true });
          }}
        />
      </div>
    </DriverSplashScreen>
  );
}
