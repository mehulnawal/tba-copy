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

export interface GoldRates {
  "9K": number;
  "12K": number;
  "14K": number;
  "18K": number;
  "22K": number;
  "24K": number;
  updatedAt: string;
  error?: string;
  isFallback?: boolean;
  isCachedFallback?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  karat: string;
  image: string;
  tags: string[];
  couponTag?: string;
}

export interface PrimeHotspot {
  id: string;
  x: number;
  y: number;
  product: {
    id: string;
    name: string;
    karat: string;
    image: string;
  };
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
