import { publicAsset } from "../publicAsset";

const DEALER_WAITING_ILLUSTRATION = "/assets/figma/dealer-waiting-car.png";

const WAITING_MESSAGE = "Waiting for a nearby dealership to assign a driver";

export function DealerConfirmingLoader() {
  return (
    <div className="ad-dealer-waiting" role="status" aria-live="polite" aria-busy="true">
      <div className="ad-dealer-waiting-inner">
        <div className="ad-dealer-waiting-art">
          <img
            src={publicAsset(DEALER_WAITING_ILLUSTRATION)}
            alt=""
            width={150}
            height={150}
            className="ad-dealer-waiting-img"
          />
        </div>
        <p className="ad-dealer-waiting-text">{WAITING_MESSAGE}</p>
      </div>
    </div>
  );
}
