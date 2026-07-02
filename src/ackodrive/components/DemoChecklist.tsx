import { DEMO_SCRIPT_STEPS } from "../constants";
import { useDemoState } from "../hooks/useDemoState";
import { Card } from "./ui";

export function DemoChecklist() {
  const { state, loaded } = useDemoState();
  if (!loaded) return null;

  return (
    <Card>
      <div className="ad-overline mb-3">Live demo script</div>
      <ol className="space-y-2">
        {DEMO_SCRIPT_STEPS.map((step, i) => {
          const done = step.check(state);
          return (
            <li key={step.id} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  done ? "bg-emerald-600 text-white" : "border border-[var(--ad-border-default)] text-[var(--ad-text-tertiary)]"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={done ? "text-[var(--ad-text-primary)] line-through opacity-70" : "text-[var(--ad-text-secondary)]"}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
