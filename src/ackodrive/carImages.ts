import { publicAsset } from "./publicAsset";

const CAR_LISTING_PATHS: Record<string, string> = {
  "hyundai-creta": "/assets/cars/hyundai-creta.png",
  "kia-sonet": "/assets/cars/kia-sonet.png",
  "maruti-brezza": "/assets/cars/maruti-brezza.png",
  "maruti-grand-vitara": "/assets/cars/maruti-grand-vitara.png",
  "mahindra-scorpio-n": "/assets/cars/mahindra-scorpio-n.jpg",
  "tata-nexon": "/assets/cars/tata-nexon.png",
  "tata-nexon-ev": "/assets/cars/tata-nexon-ev.jpg",
  "tata-curvv-ev": "/assets/cars/tata-curvv-ev.jpg",
  "tata-harrier-ev": "/assets/cars/tata-harrier-ev.jpg",
  "tata-sierra": "/assets/cars/tata-sierra.png",
  "tata-punch-ev": "/assets/cars/tata-punch-ev.jpg",
  "maruti-swift": "/assets/cars/maruti-swift.jpg",
  "hyundai-venue": "/assets/cars/hyundai-venue.jpg",
  "kia-seltos": "/assets/cars/kia-seltos.jpg",
  "honda-city": "/assets/cars/honda-city.jpg",
  "toyota-innova-hycross": "/assets/cars/toyota-innova-hycross.jpg",
  "vw-virtus": "/assets/cars/hyundai-creta.png",
  "vw-taigun": "/assets/cars/kia-sonet.png",
  "vw-tiguan": "/assets/cars/hyundai-venue.jpg",
  "vw-id4": "/assets/cars/tata-nexon-ev.jpg",
  "skoda-kushaq": "/assets/cars/kia-seltos.jpg",
  "skoda-slavia": "/assets/cars/honda-city.jpg",
  "skoda-octavia": "/assets/cars/toyota-innova-hycross.jpg",
  "skoda-kodiaq": "/assets/cars/mahindra-scorpio-n.jpg",
  "skoda-superb": "/assets/cars/maruti-grand-vitara.png",
};

const FALLBACK_CAR_IMAGE = "/assets/cars/hyundai-creta.png";

/** Local car hero images (sourced from Wikimedia Commons for demo use). */
export function getCarListingImage(modelId: string): string {
  const path = CAR_LISTING_PATHS[modelId] ?? FALLBACK_CAR_IMAGE;
  return publicAsset(path);
}

/** @deprecated Prefer getCarListingImage — resolves URLs at read time for GitHub Pages. */
export function getCarListingImages(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(CAR_LISTING_PATHS).map(([id, path]) => [id, publicAsset(path)]),
  );
}
