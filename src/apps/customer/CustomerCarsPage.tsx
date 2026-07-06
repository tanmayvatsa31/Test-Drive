import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CarListingCard } from "../../ackodrive/components/CarListingCard";
import { CustomerAppShell } from "../../ackodrive/components/CustomerAppShell";
import { RequireAuth } from "../../ackodrive/components/PortalShell";
import {
  BROWSE_BRAND_FILTERS,
  getBrowseCars,
  type BrowseBrandFilterId,
  type BrowseCar,
} from "../../ackodrive/carsBrowseCatalog";
import { setCustomerIntent, setSelectedCar } from "../../ackodrive/customerIntent";

function CarsContent() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [expressOnly, setExpressOnly] = useState(false);
  const [brandFilter, setBrandFilter] = useState<BrowseBrandFilterId | null>(null);

  const cars = useMemo(() => getBrowseCars(), []);

  const filteredCars = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cars.filter((car) => {
      if (brandFilter && car.brandId !== brandFilter) return false;
      if (expressOnly && !car.expressDelivery) return false;
      if (!q) return true;
      const haystack = `${car.brandName} ${car.modelName} ${car.fuel}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [brandFilter, cars, expressOnly, query]);

  const handleBookTestDrive = (car: BrowseCar) => {
    setCustomerIntent("testride");
    setSelectedCar({
      brandId: car.brandId,
      modelId: car.modelId,
      variant: car.defaultVariant,
    });
    navigate("/app");
  };

  const toggleBrand = (brandId: BrowseBrandFilterId) => {
    setBrandFilter((current) => (current === brandId ? null : brandId));
  };

  return (
    <>
      <div className="ad-cars-toolbar">
        <h1 className="ad-cars-title">Browse cars as per your interest</h1>

        <label className="ad-cars-search">
          <span className="sr-only">Which car are you looking for?</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Which car are you looking for?"
            className="ad-cars-search-input"
          />
        </label>

        <div className="ad-cars-filters">
          <div className="ad-cars-filters-chips">
            <button
              type="button"
              className={`ad-cars-filter-chip${expressOnly ? " ad-cars-filter-chip--active" : ""}`}
              onClick={() => setExpressOnly((value) => !value)}
            >
              Express Delivery
            </button>
            {BROWSE_BRAND_FILTERS.map((brand) => (
              <button
                key={brand.id}
                type="button"
                className={`ad-cars-filter-chip${brandFilter === brand.id ? " ad-cars-filter-chip--active" : ""}`}
                onClick={() => toggleBrand(brand.id)}
              >
                {brand.label}
              </button>
            ))}
          </div>
          <span className="ad-cars-count">{filteredCars.length} cars</span>
        </div>
      </div>

      <div className="ad-cars-main">
        {filteredCars.length === 0 ? (
          <div className="ad-card-flat ad-cars-empty">
            <p className="ad-label">No cars match your filters</p>
            <p className="ad-caption mt-1">Try another brand or clear Express Delivery.</p>
          </div>
        ) : (
          <div className="ad-cars-grid">
            {filteredCars.map((car) => (
              <CarListingCard
                key={car.modelId}
                car={car}
                onBookTestDrive={() => handleBookTestDrive(car)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function CustomerCarsPage() {
  return (
    <RequireAuth role="customer">
      <CustomerAppShell>
        <CarsContent />
      </CustomerAppShell>
    </RequireAuth>
  );
}
