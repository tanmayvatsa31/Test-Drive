import { ANTI_POACHING_COMMITMENT } from "../constants";

export function AntiPoachingBanner() {
  return (
    <div className="ad-info-panel mb-4 !border-emerald-200 !bg-emerald-50/80">
      <div className="ad-overline text-emerald-800">Dealer trust commitment</div>
      <p className="mt-1 text-xs leading-relaxed text-emerald-900">{ANTI_POACHING_COMMITMENT}</p>
    </div>
  );
}
