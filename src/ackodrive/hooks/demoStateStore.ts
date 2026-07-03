import { supabase } from "../supabase";
import { INITIAL_STATE } from "../workflow";
import type { DemoState } from "../types";

type StateListener = (state: DemoState) => void;
type LoadedListener = (loaded: boolean) => void;

let sharedState: DemoState = INITIAL_STATE;
let sharedLoaded = false;
let loadStarted = false;
let subscriberCount = 0;

const stateListeners = new Set<StateListener>();
const loadedListeners = new Set<LoadedListener>();

let activeChannel: ReturnType<typeof supabase.channel> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let teardownTimer: ReturnType<typeof setTimeout> | null = null;
let onlineListenerBound = false;

function cancelTeardown() {
  if (!teardownTimer) return;
  clearTimeout(teardownTimer);
  teardownTimer = null;
}

function scheduleTeardown() {
  cancelTeardown();
  teardownTimer = setTimeout(() => {
    teardownTimer = null;
    if (subscriberCount > 0) return;
    stopPolling();
    if (activeChannel) {
      void supabase.removeChannel(activeChannel);
      activeChannel = null;
    }
  }, 5000);
}

function bindOnlineListener() {
  if (onlineListenerBound || typeof window === "undefined") return;
  onlineListenerBound = true;
  window.addEventListener("online", () => {
    void pollRemoteState();
    ensureRealtimeChannel();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      void pollRemoteState();
      ensureRealtimeChannel();
    }
  });
}

function emitState() {
  stateListeners.forEach((listener) => listener(sharedState));
}

function emitLoaded() {
  loadedListeners.forEach((listener) => listener(sharedLoaded));
}

function parseRemoteUpdatedAt(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function applyRemoteStateIfNewer(remoteState: DemoState, remoteUpdatedAt: number) {
  if (remoteUpdatedAt <= (sharedState.lastUpdatedAt ?? 0)) return;
  sharedState = { ...INITIAL_STATE, ...remoteState, lastUpdatedAt: remoteUpdatedAt };
  emitState();
}

async function pollRemoteState() {
  try {
    const { data, error } = await supabase
      .from("demo_state")
      .select("state, updated_at")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data?.state || typeof data.state !== "object") return;
    applyRemoteStateIfNewer(data.state as DemoState, parseRemoteUpdatedAt(data.updated_at));
  } catch {
    /* offline demo */
  }
}

function ensurePolling() {
  if (pollTimer) return;
  pollTimer = setInterval(() => void pollRemoteState(), 2000);
}

function stopPolling() {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
}

async function loadInitialState() {
  if (loadStarted) return;
  loadStarted = true;
  try {
    const { data } = await supabase
      .from("demo_state")
      .select("state, updated_at")
      .eq("id", 1)
      .maybeSingle();
    if (data?.state && typeof data.state === "object" && Object.keys(data.state).length) {
      applyRemoteStateIfNewer(data.state as DemoState, parseRemoteUpdatedAt(data.updated_at));
    }
  } catch {
    /* offline demo — keep initial state */
  } finally {
    sharedLoaded = true;
    emitLoaded();
  }
}

function ensureRealtimeChannel() {
  if (activeChannel) return;

  activeChannel = supabase
    .channel("demo_state_room")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "demo_state", filter: "id=eq.1" },
      (payload) => {
        const next = payload.new?.state;
        const remoteUpdatedAt = parseRemoteUpdatedAt(payload.new?.updated_at as string | undefined);
        if (next && typeof next === "object") {
          applyRemoteStateIfNewer(next as DemoState, remoteUpdatedAt);
        }
      },
    )
    .subscribe((status) => {
      if (status !== "CHANNEL_ERROR" && status !== "TIMED_OUT") return;
      if (activeChannel) {
        void supabase.removeChannel(activeChannel);
        activeChannel = null;
      }
      if (subscriberCount > 0 && typeof window !== "undefined") {
        window.setTimeout(() => ensureRealtimeChannel(), 1500);
      }
    });
}

export function subscribeDemoState(listener: StateListener, loadedListener: LoadedListener) {
  subscriberCount += 1;
  cancelTeardown();
  stateListeners.add(listener);
  loadedListeners.add(loadedListener);

  listener(sharedState);
  loadedListener(sharedLoaded);

  bindOnlineListener();
  ensureRealtimeChannel();
  ensurePolling();
  void loadInitialState();

  return () => {
    stateListeners.delete(listener);
    loadedListeners.delete(loadedListener);
    subscriberCount -= 1;
    if (subscriberCount <= 0) {
      scheduleTeardown();
    }
  };
}

export async function patchSharedDemoState(patch: Partial<DemoState>, logMessage?: string): Promise<DemoState> {
  const now = Date.now();
  const log = logMessage ? [...sharedState.log, { t: now, m: logMessage }] : sharedState.log;
  const next = { ...sharedState, ...patch, log, lastUpdatedAt: now };
  sharedState = next;
  emitState();

  const { error } = await supabase
    .from("demo_state")
    .update({ state: next, updated_at: new Date(now).toISOString() })
    .eq("id", 1);

  if (error) {
    console.warn("[demo_state] Failed to sync to Supabase:", error.message);
  }

  return next;
}

export async function refreshDemoState(): Promise<DemoState> {
  await pollRemoteState();
  return sharedState;
}

export async function resetSharedDemoState(): Promise<void> {
  const now = Date.now();
  sharedState = { ...INITIAL_STATE, lastUpdatedAt: now };
  emitState();
  const { error } = await supabase
    .from("demo_state")
    .update({ state: sharedState, updated_at: new Date(now).toISOString() })
    .eq("id", 1);
  if (error) {
    console.warn("[demo_state] Failed to reset remote state:", error.message);
  }
}
