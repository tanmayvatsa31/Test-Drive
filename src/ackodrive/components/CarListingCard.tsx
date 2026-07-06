import { useState } from "react";
import type { BrowseCar } from "../carsBrowseCatalog";

export function CarListingCard({
  car,
  onBookTestDrive,
}: {
  car: BrowseCar;
  onBookTestDrive: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const alt = `${car.brandName} ${car.modelName}`;

  return (
    <article className="ad-car-listing-card">
      <div className="ad-car-listing-visual">
        {!imageFailed ? (
          <img
            src={car.imageUrl}
            alt={alt}
            className="ad-car-listing-img"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="ad-car-listing-fallback" aria-hidden="true">
            <span className="ad-car-listing-fallback-label">{car.modelName}</span>
          </div>
        )}

        <div className="ad-car-listing-badges-overlay">
          {car.expressDelivery && <span className="ad-car-listing-badge ad-car-listing-badge-express">Express Delivery</span>}
          {car.rating != null && (
            <span className="ad-car-listing-badge ad-car-listing-badge-rating">{car.rating.toFixed(1)}/10 Expert rating</span>
          )}
          {car.highlight && <span className="ad-car-listing-badge ad-car-listing-badge-highlight">{car.highlight}</span>}
        </div>
      </div>

      <div className="ad-car-listing-body">
        <h3 className="ad-car-listing-name">
          {car.brandName} {car.modelName}
        </h3>

        <p className="ad-car-listing-meta">{car.variantCount} Variants</p>
        <p className="ad-car-listing-meta">{car.fuel}</p>
        <p className="ad-car-listing-meta">{car.transmission}</p>

        <div className="ad-car-listing-price-block">
          <span className="ad-car-listing-price-label">On-road price</span>
          <span className="ad-car-listing-price">{car.price}</span>
          {car.savingsLabel && (
            <span className="ad-car-listing-savings">Savings up to {car.savingsLabel} on ACKO Drive</span>
          )}
        </div>

        <button type="button" className="ad-car-listing-cta" onClick={onBookTestDrive}>
          I want to test drive
        </button>
      </div>
    </article>
  );
}
