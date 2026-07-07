import type { DemoState } from "../types";
import type { SetStateFn } from "../workflowActions";
import { customerPickDriverCall, customerRejectDriverCall } from "../workflowActions";
import { IncomingCallScreen } from "./IncomingCallScreen";

export function IncomingDriverCallScreen({
  setState,
}: {
  state: DemoState;
  setState: SetStateFn;
}) {
  return (
    <IncomingCallScreen
      callerName="ACKO Drive"
      onPick={() => void customerPickDriverCall(setState)}
      onReject={() => void customerRejectDriverCall(setState)}
    />
  );
}
