import { apiRequest } from "./client";
import type { Cart } from "./cart.api";
import type { Address } from "./user.api";

export interface CartSummary {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}

export interface CheckoutSummaryResponse {
  cart: Cart;
  summary: CartSummary;
}

export interface OrderSummaryResponse {
  items: Cart["items"];
  address: Address | null;
  coupon: {
    code: string;
    discountType: string;
    discountValue: number;
  } | null;
  summary: CartSummary;
}

export interface Coupon {
  code: string;
  discountType: string;
  discountValue: number;
  minimumCartValue: number;
  expiryDate: string;
  usageLimit: number | null;
  usedCount: number;
}

export const checkoutApi = {
  getSummary: () => apiRequest<CheckoutSummaryResponse>("/checkout/summary"),

  getCoupons: () => apiRequest<Coupon[]>("/coupons"),

  applyCoupon: (code: string) =>
    apiRequest<CheckoutSummaryResponse & { coupon?: { code: string } }>(
      "/checkout/apply-coupon",
      {
        method: "POST",
        body: JSON.stringify({ code }),
      },
    ),

  removeCoupon: () =>
    apiRequest<CheckoutSummaryResponse>("/checkout/coupon", {
      method: "DELETE",
    }),

  getOrderSummary: (addressId?: string) => {
    const query = addressId ? `?addressId=${addressId}` : "";
    return apiRequest<OrderSummaryResponse>(`/checkout/order-summary${query}`);
  },
};
