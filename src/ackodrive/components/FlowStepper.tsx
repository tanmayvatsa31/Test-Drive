import { Badge, Card } from "./ui";
import type { DemoState } from "../types";
import { getFlowSteps } from "../workflow";

export function FlowStepper({ state }: { state: DemoState }) {
  const steps = getFlowSteps(state);

  return (
    <Card>
      <div className="ad-overline mb-3">Flow progress</div>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={step.id} className="flex items-center gap-2 text-xs">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                step.done
                  ? "bg-emerald-100 text-emerald-800"
                  : step.active
                    ? "bg-[var(--ad-surface-dark)] text-white"
                    : "bg-[var(--ad-surface-light)] text-[var(--ad-text-tertiary)]"
              }`}
            >
              {step.done ? "✓" : i + 1}
            </span>
            <span className={step.active ? "font-semibold text-[var(--ad-text-primary)]" : "text-[var(--ad-text-secondary)]"}>
              {step.label}
            </span>
            {step.active && <Badge tone="live">active</Badge>}
          </li>
        ))}
      </ol>
    </Card>
  );
}
