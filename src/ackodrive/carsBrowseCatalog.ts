import { BRAND_MODELS, CAR_BRANDS } from "./constants";
import { getCarListingImage } from "./carImages";

export type BrowseCarHighlight = "Most Viewed" | "Best Seller";

export type BrowseCarSeed = {
  modelId: string;
  brandId: string;
  fuel: string;
  transmission: string;
  rating?: number;
  highlight?: BrowseCarHighlight;
  expressDelivery?: boolean;
  savingsLabel?: string;
};

export type BrowseCar = BrowseCarSeed & {
  brandName: string;
  modelName: string;
  price: string;
  variantCount: number;
  defaultVariant: string;
  imageUrl: string;
};

/** Demo browse catalog — Volkswagen & Skoda line-ups for brand filtering. */
const BROWSE_CAR_SEEDS: BrowseCarSeed[] = [
  {
    modelId: "vw-virtus",
    brandId: "vw",
    fuel: "Petrol",
    transmission: "Manual • Automatic",
    rating: 8.2,
    highlight: "Most Viewed",
    expressDelivery: true,
    savingsLabel: "₹18,400",
  },
  {
    modelId: "vw-taigun",
    brandId: "vw",
    fuel: "Petrol",
    transmission: "Manual • Automatic",
    rating: 8.0,
    expressDelivery: true,
    savingsLabel: "₹17,250",
  },
  {
    modelId: "vw-tiguan",
    brandId: "vw",
    fuel: "Petrol",
    transmission: "Automatic",
    rating: 8.4,
    expressDelivery: true,
    savingsLabel: "₹42,800",
  },
  {
    modelId: "vw-id4",
    brandId: "vw",
    fuel: "Electric",
    transmission: "Automatic",
    rating: 8.6,
    expressDelivery: true,
    savingsLabel: "₹58,000",
  },
  {
    modelId: "skoda-kushaq",
    brandId: "skoda",
    fuel: "Petrol",
    transmission: "Manual • Automatic",
    rating: 8.1,
    highlight: "Best Seller",
    expressDelivery: true,
    savingsLabel: "₹16,900",
  },
  {
    modelId: "skoda-slavia",
    brandId: "skoda",
    fuel: "Petrol",
    transmission: "Manual • Automatic",
    rating: 8.3,
    expressDelivery: true,
    savingsLabel: "₹17,100",
  },
  {
    modelId: "skoda-octavia",
    brandId: "skoda",
    fuel: "Petrol",
    transmission: "Manual • Automatic",
    rating: 8.5,
    expressDelivery: true,
    savingsLabel: "₹24,600",
  },
  {
    modelId: "skoda-kodiaq",
    brandId: "skoda",
    fuel: "Petrol • Diesel",
    transmission: "Automatic",
    rating: 8.4,
    expressDelivery: true,
    savingsLabel: "₹38,200",
  },
  {
    modelId: "skoda-superb",
    brandId: "skoda",
    fuel: "Petrol",
    transmission: "Automatic",
    rating: 8.7,
    expressDelivery: true,
    savingsLabel: "₹32,500",
  },
];

export const BROWSE_BRAND_FILTERS = [
  { id: "vw", label: "Volkswagen" },
  { id: "skoda", label: "Skoda" },
] as const;

export type BrowseBrandFilterId = (typeof BROWSE_BRAND_FILTERS)[number]["id"];

export function getBrowseCars(): BrowseCar[] {
  return BROWSE_CAR_SEEDS.flatMap((seed) => {
    const model = BRAND_MODELS.find((m) => m.id === seed.modelId);
    const brand = CAR_BRANDS.find((b) => b.id === seed.brandId);
    if (!model || !brand) return [];

    return [
      {
        ...seed,
        brandName: brand.name,
        modelName: model.name,
        price: model.price,
        variantCount: model.variants.length,
        defaultVariant: model.variants[0] ?? "Base",
        imageUrl: getCarListingImage(seed.modelId),
      },
    ];
  });
}

export function findBrowseCar(modelId: string): BrowseCar | undefined {
  return getBrowseCars().find((car) => car.modelId === modelId);
}
