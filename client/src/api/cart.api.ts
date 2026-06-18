import { apiRequest } from "./client";

export interface CartItem {
  _id: string;
  productId: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
  inStock: boolean;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  appliedCoupon: string | null;
}

export interface CartProductPayload {
  productId: string;
  slug: string;
  name: string;
  category?: string;
  image: string;
  price: number;
  quantity?: number;
  inStock?: boolean;
}

export const cartApi = {
  getCart: () => apiRequest<Cart>("/cart"),

  addToCart: (payload: CartProductPayload) =>
    apiRequest<Cart>("/cart", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateQuantity: (itemId: string, quantity: number) =>
    apiRequest<Cart>(`/cart/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),

  removeFromCart: (itemId: string) =>
    apiRequest<Cart>(`/cart/${itemId}`, { method: "DELETE" }),

  clearCart: () => apiRequest<Cart>("/cart", { method: "DELETE" }),
};
