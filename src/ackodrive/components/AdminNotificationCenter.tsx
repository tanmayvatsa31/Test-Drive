import { useEffect, useRef } from "react";
import type { AdminNotification, AdminNotificationTone } from "../adminNotifications";

function toneClass(tone: AdminNotificationTone): string {
  switch (tone) {
    case "error":
      return "ad-admin-notify-item--error";
    case "warn":
      return "ad-admin-notify-item--warn";
    case "success":
      return "ad-admin-notify-item--success";
    default:
      return "ad-admin-notify-item--info";
  }
}

function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AdminNotificationCenter({
  notifications,
  unreadCount,
  open,
  onToggle,
  onDismiss,
  onClearAll,
}: {
  notifications: AdminNotification[];
  unreadCount: number;
  open: boolean;
  onToggle: () => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onToggle]);

  return (
    <div className="ad-admin-notify" ref={panelRef}>
      <button
        type="button"
        className="ad-admin-notify-trigger"
        aria-label={unreadCount ? `${unreadCount} notifications` : "Notifications"}
        aria-expanded={open}
        onClick={onToggle}
      >
        <svg className="ad-admin-notify-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 17H9C7.89543 17 7 16.1046 7 15V11C7 8.23858 9.23858 6 12 6C14.7614 6 17 8.23858 17 11V15C17 16.1046 16.1046 17 15 17Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M12 6V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M9.5 17C9.5 18.3807 10.6193 19.5 12 19.5C13.3807 19.5 14.5 18.3807 14.5 17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="ad-admin-notify-badge" aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="ad-admin-notify-panel" role="region" aria-label="Notifications">
          <div className="ad-admin-notify-panel-head">
            <span className="ad-admin-notify-panel-title">Notifications</span>
            {notifications.length > 0 && (
              <button type="button" className="ad-admin-notify-clear" onClick={onClearAll}>
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="ad-admin-notify-empty">No issues — demo monitoring is running in the background.</p>
          ) : (
            <ul className="ad-admin-notify-list">
              {notifications.map((item) => (
                <li key={item.id} className={`ad-admin-notify-item ${toneClass(item.tone)}`}>
                  <div className="ad-admin-notify-item-head">
                    <strong>{item.title}</strong>
                    <time dateTime={new Date(item.at).toISOString()}>{formatTime(item.at)}</time>
                  </div>
                  <p>{item.message}</p>
                  <button
                    type="button"
                    className="ad-admin-notify-dismiss"
                    onClick={() => onDismiss(item.id)}
                    aria-label={`Dismiss ${item.title}`}
                  >
                    Dismiss
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
