import { useCallback, useEffect, useRef, useState } from "react";
import { notificationsFromDemoState, type AdminNotification } from "../adminNotifications";
import { useDemoState } from "./useDemoState";

function mergeNotifications(prev: AdminNotification[], incoming: AdminNotification[]): AdminNotification[] {
  const map = new Map<string, AdminNotification>();
  for (const item of [...prev, ...incoming]) {
    map.set(item.id, item);
  }
  return [...map.values()].sort((a, b) => b.at - a.at).slice(0, 30);
}

export function useAdminNotificationFeed() {
  const { state, loaded } = useDemoState();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);
  const seenLogCount = useRef(0);

  const push = useCallback((item: AdminNotification) => {
    setNotifications((prev) => mergeNotifications(prev, [item]));
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const fromState = notificationsFromDemoState(state, seenLogCount.current);
    seenLogCount.current = state.log.length;

    if (fromState.length) {
      setNotifications((prev) => mergeNotifications(prev, fromState));
    }
  }, [loaded, state]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.length;

  return {
    notifications,
    unreadCount,
    open,
    setOpen,
    push,
    dismiss,
    clearAll,
  };
}
