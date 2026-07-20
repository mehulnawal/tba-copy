import type { Product } from "../types";

export const slugFromName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

// Dynamic API Response shape
export interface ApiProduct {
  id: string;
  slug: string;
  Title: string;
  Category: string;
  "image_link-1": string;
  Is_Best_Seller: boolean;
  Is_New_Product: boolean;
  prices: Array<{
    karat: string;
    finalPrice: number;
    makingCharge?: number;
    gst?: number;
  }>;
  [key: string]: any;
}

/**
 * Adapts dynamic server-side pricing engine payloads into UI component properties
 */
export function adaptApiProductToUI(apiProduct: ApiProduct): Product {
  const tags: string[] = [];
  if (apiProduct.Is_Best_Seller) tags.push("BESTSELLER");
  if (apiProduct.Is_New_Product) tags.push("NEW");
  const defaultPriceObj =
    apiProduct.prices?.find((p) => p.karat === "18kt") ||
    apiProduct.prices?.[0];
  const derivedKarat = defaultPriceObj ? defaultPriceObj.karat : "18kt";

  return {
    id: apiProduct.id,
    SKU: apiProduct.SKU,
    slug: apiProduct.slug,
    name: apiProduct.Title,
    category: apiProduct.Category,
    karat: derivedKarat,
    image: apiProduct["image_link-1"],
    tags: tags,
  };
}

export const productToCartPayload = (
  product: Product,
  price: number,
  options?: { karat?: string; color?: string; size?: string },
) => ({
  productId: product.SKU,
  slug: product.slug || slugFromName(product.name),
  name: product.name,
  category: product.category,
  image: product.image,
  price,
  karat: options?.karat || product.karat || "18kt",
  color: options?.color || "",
  size: options?.size || "",
  quantity: 1,
  inStock: true,
});

export const productToWishlistPayload = (
  product: Product,
  price: number,
  options?: { karat?: string; color?: string; size?: string },
) => ({
  productId: product.SKU
  slug: product.slug || slugFromName(product.name),
  name: product.name,
  category: product.category,
  image: product.image,
  price,
  karat: options?.karat || product.karat || "18kt",
  color: options?.color || "",
  size: options?.size || "",
});
