import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { isCustomerApp } from "../appMode";
import { HEADER_CITIES } from "../constants";
import chevronDownIcon from "../assets/icons/chevron-down.png";
import ackoDriveLogo from "../assets/icons/acko-drive-logo.png";

function BrandLogo() {
  if (isCustomerApp) {
    return (
      <Link to="/" className="ad-site-logo" aria-label="Your brand home">
        <span className="ad-site-brand-logo">Your Brand Logo</span>
      </Link>
    );
  }

  return (
    <Link to="/" className="ad-site-logo" aria-label="ACKO Drive home">
      <img
        src={ackoDriveLogo}
        alt="ACKO Drive"
        className="ad-site-logo-img"
        width={286}
        height={96}
        decoding="async"
      />
    </Link>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="ad-site-menu-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

function LocationPicker({
  city,
  open,
  onToggle,
  onSelect,
  listId,
  variant = "desktop",
}: {
  city: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (city: string) => void;
  listId: string;
  variant?: "desktop" | "mobile";
}) {
  const wrapClass = variant === "mobile" ? "ad-site-location-wrap ad-site-location-wrap-mobile" : "ad-site-location-wrap";

  return (
    <div className={wrapClass}>
      <button
        type="button"
        className={variant === "mobile" ? "ad-site-mobile-location" : "ad-site-location"}
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={onToggle}
      >
        {city}
        <img
          src={chevronDownIcon}
          alt=""
          className={`ad-site-chevron ${open ? "ad-site-chevron-open" : ""}`}
          width={20}
          height={20}
        />
      </button>

      {open && (
        <ul id={listId} className="ad-site-location-panel" role="listbox" aria-label="Choose city">
          {HEADER_CITIES.map((option) => (
            <li key={option} role="none">
              <button
                type="button"
                role="option"
                aria-selected={city === option}
                className={`ad-site-location-option ${city === option ? "ad-site-location-option-active" : ""}`}
                onClick={() => onSelect(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SiteHeader({
  onSignIn,
  onLogout,
}: {
  onSignIn?: () => void;
  onLogout?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [city, setCity] = useState<string>(HEADER_CITIES[0]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [mobileLocationOpen, setMobileLocationOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const desktopListId = useId();
  const mobileListId = useId();

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setLocationOpen(false);
        setMobileLocationOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLocationOpen(false);
        setMobileLocationOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const selectCity = (next: string) => {
    setCity(next);
    setLocationOpen(false);
    setMobileLocationOpen(false);
  };

  return (
    <header className="ad-site-header" ref={headerRef}>
      <div className="ad-site-header-inner">
        <div className="ad-site-header-left">
          <BrandLogo />
          <span className="ad-site-divider" aria-hidden="true" />
          <LocationPicker
            city={city}
            open={locationOpen}
            onToggle={() => {
              setLocationOpen((o) => !o);
              setMobileLocationOpen(false);
            }}
            onSelect={selectCity}
            listId={desktopListId}
          />
        </div>

        <div className="ad-site-header-actions">
          {onSignIn && (
            <button type="button" className="ad-site-sign-in" onClick={onSignIn}>
              Sign in
            </button>
          )}
          <button
            type="button"
            className="ad-site-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="ad-mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="ad-mobile-nav" className="ad-site-mobile-nav">
          {onSignIn && (
            <button
              type="button"
              className="ad-site-mobile-sign-in"
              onClick={() => {
                setMenuOpen(false);
                onSignIn();
              }}
            >
              Sign in
            </button>
          )}
          {onLogout && (
            <button
              type="button"
              className="ad-site-mobile-logout"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
            >
              Logout
            </button>
          )}
          <LocationPicker
            city={city}
            open={mobileLocationOpen}
            onToggle={() => {
              setMobileLocationOpen((o) => !o);
              setLocationOpen(false);
            }}
            onSelect={selectCity}
            listId={mobileListId}
            variant="mobile"
          />
        </div>
      )}
    </header>
  );
}
