import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerLandingHero } from "../../ackodrive/components/CustomerLandingHero";
import { LoginModal } from "../../ackodrive/components/LoginModal";
import { SiteHeader } from "../../ackodrive/components/SiteHeader";
import { getSession, setSession } from "../../ackodrive/auth";
import {
  intentLoginSubtitle,
  setCustomerIntent,
  type CustomerIntent,
} from "../../ackodrive/customerIntent";
import type { PortalGateUser } from "../../ackodrive/portalGate";

const BUY_NEW_CAR_CARD_ART = "/assets/figma/buy-new-car-card.png";
const BOOK_TEST_DRIVE_CARD_ART = "/assets/figma/book-test-drive-card.png";

const LANDING_ACTIONS: {
  intent: CustomerIntent;
  title: string;
  body: string;
  emoji?: string;
  image?: string;
}[] = [
  {
    intent: "purchase",
    title: "Buy a new car",
    body: "Transparent on-road prices, instant booking amount, and dealer coordination handled for you.",
    image: BUY_NEW_CAR_CARD_ART,
  },
  {
    intent: "testride",
    title: "Book a test drive",
    body: "Free doorstep test rides with verified drivers — pick a slot that fits your schedule.",
    image: BOOK_TEST_DRIVE_CARD_ART,
  },
];

export function CustomerLandingPage() {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<CustomerIntent>("testride");

  const continueToApp = (intent: CustomerIntent) => {
    setCustomerIntent(intent);
    navigate("/cars");
  };

  const handleIntent = (intent: CustomerIntent) => {
    if (getSession("customer")) {
      continueToApp(intent);
      return;
    }
    setPendingIntent(intent);
    setLoginOpen(true);
  };

  const handleLoginSuccess = (user: PortalGateUser) => {
    setSession({ role: "customer", phone: user.phone, name: user.name });
    setLoginOpen(false);
    continueToApp(pendingIntent);
  };

  return (
    <div className="ad-page ad-page-landing">
      <SiteHeader onSignIn={() => handleIntent("testride")} />
      <CustomerLandingHero onIntent={handleIntent} />

      <section className="ad-landing-section" aria-labelledby="ad-landing-actions-title">
        <h2 id="ad-landing-actions-title" className="ad-landing-section-title">
          Everything you need to own your next car
        </h2>
        <p className="ad-landing-section-lead">
          From discovery to delivery — ACKO Drive keeps every step simple, transparent, and on your terms.
        </p>

        <div className="ad-landing-grid">
          {LANDING_ACTIONS.map((action) => (
            <button
              key={action.title}
              type="button"
              className="ad-landing-card"
              onClick={() => handleIntent(action.intent)}
            >
              {action.image ? (
                <img src={action.image} alt="" className="ad-landing-card-art" width={80} height={80} />
              ) : (
                <span className="ad-landing-card-emoji" aria-hidden="true">
                  {action.emoji}
                </span>
              )}
              <span className="ad-landing-card-title">{action.title}</span>
              <span className="ad-landing-card-body">{action.body}</span>
              <span className="ad-landing-card-link">Get started →</span>
            </button>
          ))}
        </div>
      </section>

      <section className="ad-landing-trust" aria-label="Why ACKO Drive">
        <div className="ad-landing-trust-inner">
          <div className="ad-landing-trust-item">
            <strong>Best price guarantee</strong>
            <span>Deals negotiated so you do not have to haggle.</span>
          </div>
          <div className="ad-landing-trust-item">
            <strong>Doorstep test drives</strong>
            <span>Try before you buy — at home or work.</span>
          </div>
          <div className="ad-landing-trust-item">
            <strong>Expert support</strong>
            <span>Real humans to guide you at every step.</span>
          </div>
        </div>
      </section>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        subtitle={intentLoginSubtitle(pendingIntent)}
      />
    </div>
  );
}
