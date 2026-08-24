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
  showOnHomepage?: boolean;
  homepageCoverImage?: string;
  shortCode?: string;
  isActive: boolean;
}

export interface MoissaniteEntry {
  caratWeight: number;
  colorClarity?: string;
}
export interface PolkiEntry {
  caratWeight: number;
  colorClarity?: string;
  ratePerCt?: number;
}
export type GoldKaratWeights = { "14kt": number; "18kt": number };
export interface PriceBreakdown {
  metal?: "gold" | "silver";
  karat?: "14kt" | "18kt";
  goldRate?: number;
  goldValue?: number;
  silverRate?: number;
  silverValue?: number;
  metalValue?: number;
  makingRatePerGram?: number;
  makingCharge?: number;
  makingValue?: number;
  diamondValue?: number;
  totalDiamondWeight?: number;
  totalMoissaniteWeight?: number;
  moissaniteRatePerCarat?: number;
  moissaniteValue?: number;
  polkiValue?: number;
  b2bPricingStatus?: "pending";
  b2bFinalPrice?: number;
  stoneValue?: number;
  certificateCharges?: number;
  price?: number;
  totalCost: number;
  gst: number;
  finalPrice: number;
  display?: {
    showGoldWeight?: boolean;
    showDiamondWeight?: boolean;
    showMaking?: boolean;
    showCertificate?: boolean;
    showGst?: boolean;
  };
  grossWeight?: number;
  netWeight?: number;
}
export interface DiamondEntry {
  diamondCategoryRef?: string;
  category: string;
  subType: string;
  caratWeight: number;
  ratePerCt?: number;
  ratePerCtB2B?: number;
  ratePerCtB2C?: number;
  colorClarity: string;
}
export interface Certificate {
  _id: string;
  name: string;
  logoUrl?: string;
}
export interface Product {
  _id?: string;
  id: string;
  SKU: string;
  slug?: string;
  title?: string;
  description?: string;
  name?: string;
  category?: string;
  karat?: string;
  image?: string;
  tags?: string[];
  metal?: "gold" | "silver";
  mainCategory?: Category | string;
  subCategory?: Category | string;
  isBestSeller?: boolean;
  isNewProduct?: boolean;
  isPrimeCollection?: boolean;
  images?: { url: string; source: "link" | "upload"; slot?: number }[];
  videoLink?: string;
  certificates?: Certificate[];
  sizes?: number[];
  colors?: string[];
  grossWeight?: number | GoldKaratWeights;
  netWeight?: number | GoldKaratWeights;
  moissaniteCaratWeight?: number;
  moissaniteEntries?: MoissaniteEntry[];
  polkiEntries?: PolkiEntry[];
  diamondCategoryRef?: string;
  diamondPriceOverride?: { b2bPrice: number; b2cPrice: number };
  diamonds?: DiamondEntry[];
  totalNumberOfDiamonds?: number;
  certificateWeight?: number;
  diamond?: {
    roundPrice: number;
    roundCarat: number;
    fancyPrice: number;
    fancyCarat: number;
  };
  certificateCharges?: number;
  price?: number;
  isActive?: boolean;
  prices?: PriceBreakdown[];
  cadFolderUrl?: string;
}
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
  review: string;
  images: [string, string];
}
