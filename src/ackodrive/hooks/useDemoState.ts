import { useCallback, useEffect, useRef, useState } from "react";
import type { DemoState } from "../types";
import { INITIAL_STATE } from "../workflow";
import { patchSharedDemoState, resetSharedDemoState, subscribeDemoState } from "./demoStateStore";

export function useDemoState() {
  const [state, setStateLocal] = useState<DemoState>(INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => subscribeDemoState(setStateLocal, setLoaded), []);

  const setState = useCallback(async (patch: Partial<DemoState>, logMessage?: string) => {
    const next = await patchSharedDemoState(patch, logMessage);
    stateRef.current = next;
  }, []);

  const reset = useCallback(async () => {
    await resetSharedDemoState();
    stateRef.current = INITIAL_STATE;
  }, []);

  return { state, setState, reset, loaded };
}
