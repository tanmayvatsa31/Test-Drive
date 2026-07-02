import { useState } from "react";
import type { BrowseCar } from "../carsBrowseCatalog";

export function SelectedCarReadonlyCard({
  car,
  variant,
}: {
  car: BrowseCar;
  variant: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const title = `${car.brandName} ${car.modelName} (${variant})`;

  return (
    <article className="ad-selected-car-card">
      <div className="ad-selected-car-card-text">
        <p className="ad-selected-car-card-name">{title}</p>
        <p className="ad-selected-car-card-price">{car.price}</p>
      </div>

      <div className="ad-selected-car-card-media">
        {!imageFailed ? (
          <img
            src={car.imageUrl}
            alt={`${car.brandName} ${car.modelName}`}
            className="ad-selected-car-card-img"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="ad-selected-car-card-fallback" aria-hidden="true">
            {car.modelName}
          </div>
        )}
      </div>
    </article>
  );
}
