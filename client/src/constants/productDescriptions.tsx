import type { ReactNode } from "react";

export type ProductDescription = {
  plainText: string;
  content: ReactNode;
};

const defaultDescriptions = {
  gold: {
    plainText: "Elegant Gold and Diamond Jewellery by The Brilliance Atelier (TBA), crafted in gold and beautifully set with diamonds. A timeless piece designed for everyday elegance and special occasions.",
    content: <>Elegant <strong>Gold and Diamond Jewellery</strong> by <strong>The Brilliance Atelier (TBA)</strong>, crafted in gold and beautifully set with diamonds. A timeless piece designed for everyday elegance and special occasions.</>,
  },
  polki: {
    plainText: "Experience traditional elegance with The Brilliance Atelier Polki Jewellery, beautifully crafted with intricate Polki detailing and premium Silver. Perfect for weddings, festive occasions and statement styling, each design blends timeless Indian craftsmanship with sophisticated modern appeal.",
    content: <>Experience traditional elegance with <strong>The Brilliance Atelier</strong> <strong>Polki Jewellery</strong>, beautifully crafted with intricate Polki detailing and premium <strong>Silver</strong>. Perfect for weddings, festive occasions and statement styling, each design blends timeless Indian craftsmanship with sophisticated modern appeal.</>,
  },
  moissanite: {
    plainText: "Discover exceptional brilliance with The Brilliance Atelier Moissanite Jewellery, crafted with premium Silver and sparkling moissanite stones. Designed for weddings, celebrations and elegant everyday styling, each piece offers timeless beauty, refined craftsmanship and a luxurious look.",
    content: <>Discover exceptional brilliance with <strong>The Brilliance Atelier</strong> <strong>Moissanite Jewellery</strong>, crafted with premium <strong>Silver</strong> and sparkling moissanite diamonds. Designed for weddings, celebrations and elegant everyday styling, each piece offers timeless beauty, refined craftsmanship and a luxurious look.</>,
  },
} satisfies Record<string, ProductDescription>;

export function getDefaultProductDescription(metal?: string, categoryNames: string[] = []): ProductDescription | null {
  const categories = categoryNames.join(" ").toLowerCase();

  if (categories.includes("polki")) return defaultDescriptions.polki;
  if (categories.includes("moissanite")) return defaultDescriptions.moissanite;
  if (metal?.toLowerCase() === "gold") return defaultDescriptions.gold;

  return null;
}