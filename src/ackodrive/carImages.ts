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
};

/** Local car hero images (sourced from Wikimedia Commons for demo use). */
export const CAR_LISTING_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(CAR_LISTING_PATHS).map(([id, path]) => [id, publicAsset(path)]),
);

export function getCarListingImage(modelId: string): string | undefined {
  return CAR_LISTING_IMAGES[modelId];
}
