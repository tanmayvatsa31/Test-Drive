import { getDemoFlowTabs, openAllDemoFlowTabs } from "../appUrls";
import { PrimaryButton } from "./ui";

export function OpenAllDemoTabsButton({ className = "" }: { className?: string }) {
  const tabs = getDemoFlowTabs();

  return (
    <div className={className}>
      <PrimaryButton className="!w-auto" onClick={() => openAllDemoFlowTabs()}>
        Open all demo flow in tabs ↗
      </PrimaryButton>
      <p className="ad-caption mt-2">
        Opens {tabs.length} tabs: {tabs.map((t) => t.label).join(" · ")}. Run{" "}
        <code className="font-mono text-[11px]">npm run dev:all</code> first so all ports are live.
      </p>
      <p className="ad-caption mt-1 text-[var(--ad-text-tertiary)]">
        If your browser blocks pop-ups, allow them for this site and click again.
      </p>
    </div>
  );
}
