import { useEffect, useId, useRef } from "react";
import { PortalLoginForm } from "./PortalLoginForm";
import type { PortalGateUser } from "../portalGate";

export function LoginModal({
  open,
  onClose,
  onSuccess,
  title = "Sign in",
  subtitle = "Login now to schedule your test drive",
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: PortalGateUser) => void;
  title?: string;
  subtitle?: string;
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ad-modal-root" role="presentation" onClick={onClose}>
      <div
        ref={panelRef}
        className="ad-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ad-modal-header">
          <div>
            <h2 id={titleId} className="ad-display text-lg sm:text-xl">
              {title}
            </h2>
            <p id={descId} className="ad-body mt-1 text-sm">
              {subtitle}
            </p>
          </div>
          <button type="button" className="ad-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <PortalLoginForm onSuccess={onSuccess} />
      </div>
    </div>
  );
}
