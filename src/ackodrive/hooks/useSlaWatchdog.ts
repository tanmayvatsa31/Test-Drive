import { useEffect, useRef } from "react";
import { useDemoState } from "./useDemoState";
import { isEnRouteSlaBreached } from "../workflow";
import { handleSlaBreach } from "../workflowActions";

const POLL_MS = 5_000;

/** Runs SLA checks (E1–E3) from the admin app only. */
export function useSlaWatchdog() {
  const { state, setState, loaded } = useDemoState();
  const handling = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!loaded) return;

    const id = setInterval(() => {
      if (handling.current) return;
      const current = stateRef.current;
      if (!isEnRouteSlaBreached(current)) return;
      handling.current = true;
      void handleSlaBreach(setState, current).finally(() => {
        handling.current = false;
      });
    }, POLL_MS);

    return () => clearInterval(id);
  }, [loaded, setState]);
}
