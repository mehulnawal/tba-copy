export interface HeroSlide {
  id: string;
  image: string;
}

export interface PrimeProduct {
  id: string;
  name: string;
  karat: string;
  image: string;
}

export interface MetalRates {
  gold24kt: number;
  silver: number;
  makingRatePerGram: number;
  certificateRatePerGram: number;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  metal: "gold" | "silver";
  categoryKind: "metal-root" | "type" | "subcategory";
  parent: string | { _id: string; name: string } | null;
  displayOrder: number;
  isActive: boolean;
}

export interface PriceBreakdown { metal?: "gold" | "silver"; karat?: "14kt" | "18kt"; goldRate?: number; goldValue?: number; silverRate?: number; metalValue?: number; makingRatePerGram?: number; makingCharge?: number; makingValue?: number; diamondValue?: number; stoneValue?: number; certificateCharges?: number; totalCost: number; gst: number; finalPrice: number; display?: { showGoldWeight?: boolean; showDiamondWeight?: boolean; showMaking?: boolean; showCertificate?: boolean; showGst?: boolean }; grossWeight: number; netWeight?: number; }
export interface DiamondEntry { category: string; subType: string; caratWeight: number; ratePerCt?: number; colorClarity: "EF/VVSVS"; }
export interface Product { _id?: string; id: string; SKU: string; slug?: string; title?: string; description?: string; name?: string; category?: string; karat?: string; image?: string; tags?: string[]; metal?: "gold" | "silver"; pricingConfigKey?: string; mainCategory?: Category | string; subCategory?: Category | string; isBestSeller?: boolean; isNewProduct?: boolean; images?: { url: string; source: "link" | "upload" }[]; videoLink?: string; sizes?: number[]; colors?: string[]; grossWeight?: Record<"14kt" | "18kt", number> | number; netWeight?: Record<"14kt" | "18kt", number>; moissaniteCaratWeight?: number; diamonds?: DiamondEntry[]; diamond?: { roundPrice: number; roundCarat: number; fancyPrice: number; fancyCarat: number }; certificateCharges?: number; isActive?: boolean; prices?: PriceBreakdown[]; }
export interface PrimeHotspot {
  id: string;
  x: number;
  y: number;
  product: PrimeProduct;
}
export interface PrimeLook {
  id: string;
  image: string;
  hotspots: PrimeHotspot[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  avatar: string;
  review: string;
}
