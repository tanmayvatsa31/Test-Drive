import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HeroSection } from "../components/HeroSection";
import { LoginModal } from "../components/LoginModal";
import { SiteHeader } from "../components/SiteHeader";
import { APP_URLS } from "../appUrls";
import { getSession, setSession } from "../auth";
import { type PortalGateUser } from "../portalGate";

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const state = location.state as { openLogin?: boolean } | null;
    if (state?.openLogin) {
      setLoginOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const goToCustomerApp = (path = "") => {
    const base = APP_URLS.customer.replace(/\/$/, "");
    window.location.href = `${base}${path}`;
  };

  const handleGetStarted = () => {
    if (getSession("customer")) {
      goToCustomerApp("/app");
      return;
    }
    goToCustomerApp();
  };

  const handleLoginSuccess = (user: PortalGateUser) => {
    setSession({ role: "customer", phone: user.phone, name: user.name });
    setLoginOpen(false);
    goToCustomerApp("/app");
  };

  return (
    <div className="ad-page ad-page-landing">
      <SiteHeader />
      <HeroSection onGetStarted={handleGetStarted} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={handleLoginSuccess} />
    </div>
  );
}
