import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "ok" | "warn" | "live" | "mut" | "info";

const TONE_CLASS: Record<Tone, string> = {
  ok: "ad-badge ad-badge-ok",
  warn: "ad-badge ad-badge-warn",
  live: "ad-badge ad-badge-live",
  mut: "ad-badge ad-badge-muted",
  info: "ad-badge ad-badge-info",
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={TONE_CLASS[tone]}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`ad-card ${className}`}>{children}</section>;
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled} className={`ad-btn-primary ${className}`}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={`ad-btn-secondary ${className}`}>
      {children}
    </button>
  );
}

export function TabButton({
  active,
  onClick,
  children,
  className = "",
  ...rest
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ad-tab ${active ? "ad-tab-active" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
