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

const BROWSE_CAR_SEEDS: BrowseCarSeed[] = [
  {
    modelId: "hyundai-creta",
    brandId: "hyundai",
    fuel: "Petrol • Diesel",
    transmission: "Manual • Automatic",
    rating: 8.4,
    highlight: "Most Viewed",
    expressDelivery: true,
    savingsLabel: "₹16,610",
  },
  {
    modelId: "kia-sonet",
    brandId: "kia",
    fuel: "Petrol • Diesel",
    transmission: "Manual • Automatic",
    rating: 8.1,
    expressDelivery: true,
    savingsLabel: "₹16,225",
  },
  {
    modelId: "maruti-brezza",
    brandId: "maruti",
    fuel: "Petrol • CNG",
    transmission: "Manual • Automatic",
    rating: 7.5,
    expressDelivery: true,
    savingsLabel: "₹12,598",
  },
  {
    modelId: "maruti-grand-vitara",
    brandId: "maruti",
    fuel: "Hybrid • Petrol • CNG",
    transmission: "Manual • Automatic",
    rating: 7.6,
    expressDelivery: true,
    savingsLabel: "₹13,328",
  },
  {
    modelId: "mahindra-scorpio-n",
    brandId: "mahindra",
    fuel: "Petrol • Diesel",
    transmission: "Manual • Automatic",
    expressDelivery: true,
    savingsLabel: "₹26,884",
  },
  {
    modelId: "tata-nexon",
    brandId: "tata",
    fuel: "Petrol • Diesel • CNG",
    transmission: "Manual • Automatic",
    rating: 7.8,
    highlight: "Best Seller",
    expressDelivery: true,
    savingsLabel: "₹16,133",
  },
  {
    modelId: "tata-nexon-ev",
    brandId: "tata",
    fuel: "Electric",
    transmission: "Automatic",
    expressDelivery: true,
    savingsLabel: "₹46,247",
  },
  {
    modelId: "tata-curvv-ev",
    brandId: "tata",
    fuel: "Electric",
    transmission: "Automatic",
    rating: 8.2,
    expressDelivery: true,
    savingsLabel: "₹26,975",
  },
  {
    modelId: "tata-harrier-ev",
    brandId: "tata",
    fuel: "Electric",
    transmission: "Automatic",
    rating: 8.0,
    expressDelivery: true,
    savingsLabel: "₹31,200",
  },
  {
    modelId: "tata-sierra",
    brandId: "tata",
    fuel: "Petrol • Diesel",
    transmission: "Manual • Automatic",
    rating: 7.9,
    expressDelivery: true,
    savingsLabel: "₹18,400",
  },
  {
    modelId: "tata-punch-ev",
    brandId: "tata",
    fuel: "Electric",
    transmission: "Automatic",
    expressDelivery: true,
    savingsLabel: "₹14,800",
  },
  {
    modelId: "maruti-swift",
    brandId: "maruti",
    fuel: "Petrol • CNG",
    transmission: "Manual • Automatic",
    rating: 8.1,
    expressDelivery: true,
    savingsLabel: "₹9,628",
  },
  {
    modelId: "hyundai-venue",
    brandId: "hyundai",
    fuel: "Petrol • Diesel",
    transmission: "Manual • Automatic",
    rating: 7.7,
    expressDelivery: true,
    savingsLabel: "₹11,450",
  },
  {
    modelId: "kia-seltos",
    brandId: "kia",
    fuel: "Petrol • Diesel",
    transmission: "Manual • Automatic",
    rating: 8.0,
    expressDelivery: true,
    savingsLabel: "₹15,900",
  },
  {
    modelId: "honda-city",
    brandId: "honda",
    fuel: "Petrol",
    transmission: "Manual • Automatic",
    rating: 8.2,
    savingsLabel: "₹22,100",
  },
  {
    modelId: "toyota-innova-hycross",
    brandId: "toyota",
    fuel: "Hybrid • Petrol",
    transmission: "Manual • Automatic",
    rating: 8.3,
    savingsLabel: "₹28,500",
  },
];

export function getBrowseCars(): BrowseCar[] {
  return BROWSE_CAR_SEEDS.flatMap((seed) => {
    const model = BRAND_MODELS.find((m) => m.id === seed.modelId);
    const brand = CAR_BRANDS.find((b) => b.id === seed.brandId);
    const imageUrl = getCarListingImage(seed.modelId);
    if (!model || !brand || !imageUrl) return [];

    return [
      {
        ...seed,
        brandName: brand.name,
        modelName: model.name,
        price: model.price,
        variantCount: model.variants.length,
        defaultVariant: model.variants[0] ?? "Base",
        imageUrl,
      },
    ];
  });
}

export function findBrowseCar(modelId: string): BrowseCar | undefined {
  return getBrowseCars().find((car) => car.modelId === modelId);
}
