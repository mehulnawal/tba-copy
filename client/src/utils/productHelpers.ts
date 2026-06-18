import type { Product } from "../types";

export const slugFromName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const productToCartPayload = (
  product: Product,
  price: number,
) => ({
  productId: product.id,
  slug: slugFromName(product.name),
  name: product.name,
  category: product.category,
  image: product.image,
  price,
  quantity: 1,
  inStock: true,
});

export const productToWishlistPayload = (
  product: Product,
  price: number,
) => ({
  productId: product.id,
  slug: slugFromName(product.name),
  name: product.name,
  category: product.category,
  image: product.image,
  price,
});
