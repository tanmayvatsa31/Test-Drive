import { SHIVI_CALLER_NAME } from "../constants";
import type { DemoState } from "../types";
import type { SetStateFn } from "../workflowActions";
import { customerPickShiviCall, customerRejectShiviCall } from "../workflowActions";
import { IncomingCallScreen } from "./IncomingCallScreen";

export function IncomingShiviCallScreen({
  state,
  setState,
}: {
  state: DemoState;
  setState: SetStateFn;
}) {
  return (
    <IncomingCallScreen
      callerName={SHIVI_CALLER_NAME}
      onPick={() => void customerPickShiviCall(setState, state)}
      onReject={() => void customerRejectShiviCall(setState)}
    />
  );
}
