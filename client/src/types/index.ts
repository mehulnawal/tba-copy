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

export interface PriceBreakdown { karat: "9kt" | "14kt" | "18kt"; goldRate: number; goldValue: number; makingCharge: number; diamondRound: number; diamondFancy: number; certificateCharges: number; totalCost: number; gst: number; finalPrice: number; grossWeight: number; netWeight: number; }
export interface Product { _id?: string; id: string; SKU: string; slug?: string; title?: string; description?: string; name?: string; category?: string; karat?: string; image?: string; tags?: string[]; businessType?: "B2C" | "B2B"; mainCategory?: Category | string; subCategory?: Category | string; isBestSeller?: boolean; isNewProduct?: boolean; images?: { url: string; source: "link" | "upload" }[]; videoLink?: string; colors?: string[]; grossWeight?: Record<"9kt" | "14kt" | "18kt", number>; netWeight?: Record<"9kt" | "14kt" | "18kt", number>; diamond?: { roundPrice: number; roundCarat: number; fancyPrice: number; fancyCarat: number }; certificateCharges?: number; makingChargeRatePerGram?: number; isActive?: boolean; prices?: PriceBreakdown[]; }

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
