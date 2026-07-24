import { apiRequest } from "./client";

export interface WishlistItem {
  _id: string;
  productId: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
  karat?: string;
}

export interface WishlistProductPayload {
  productId: string;
  karat?: string;
}

export const wishlistApi = {
  getWishlist: () => apiRequest<WishlistItem[]>("/wishlist"),

  addToWishlist: (payload: WishlistProductPayload) =>
    apiRequest<WishlistItem[]>("/wishlist", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  removeFromWishlist: (productId: string) =>
    apiRequest<WishlistItem[]>(`/wishlist/${productId}`, {
      method: "DELETE",
    }),
};
