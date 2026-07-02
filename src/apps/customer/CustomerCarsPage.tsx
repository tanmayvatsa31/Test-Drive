import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CarListingCard } from "../../ackodrive/components/CarListingCard";
import { CustomerAppShell } from "../../ackodrive/components/CustomerAppShell";
import { RequireAuth } from "../../ackodrive/components/PortalShell";
import { getBrowseCars } from "../../ackodrive/carsBrowseCatalog";
import { setCustomerIntent, setSelectedCar } from "../../ackodrive/customerIntent";
import type { BrowseCar } from "../../ackodrive/carsBrowseCatalog";

function CarsContent() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [expressOnly, setExpressOnly] = useState(false);

  const cars = useMemo(() => getBrowseCars(), []);

  const filteredCars = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cars.filter((car) => {
      if (expressOnly && !car.expressDelivery) return false;
      if (!q) return true;
      const haystack = `${car.brandName} ${car.modelName} ${car.fuel}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [cars, expressOnly, query]);

  const handleBookTestDrive = (car: BrowseCar) => {
    setCustomerIntent("testride");
    setSelectedCar({
      brandId: car.brandId,
      modelId: car.modelId,
      variant: car.defaultVariant,
    });
    navigate("/app");
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
            className="field-input"
          />
        </label>

        <div className="ad-cars-filters">
          <button
            type="button"
            className={`ad-chip ${expressOnly ? "ad-chip-active" : ""}`}
            onClick={() => setExpressOnly((v) => !v)}
          >
            Express Delivery
          </button>
          <span className="ad-cars-count">{filteredCars.length} cars</span>
        </div>
      </div>

      <div className="ad-cars-main">
        {filteredCars.length === 0 ? (
          <div className="ad-card-flat ad-cars-empty">
            <p className="ad-label">No cars match your search</p>
            <p className="ad-caption mt-1">Try a different name or turn off Express Delivery.</p>
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
