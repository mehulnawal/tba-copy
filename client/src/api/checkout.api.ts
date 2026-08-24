import { apiRequest } from "./client";
import type { Cart } from "./cart.api";
import type { Address } from "./user.api";

export interface CartSummary {
  subtotal: number;
  discount: number;
  referenceDiscount?: number;
  taxableSubtotal: number;
  gst: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}
export interface Coupon {
  code: string;
  discountType: string;
  discountValue: number;
  minimumCartValue: number;
  expiryDate?: string;
  usageLimit: number | null;
  usedCount: number;
  eligibilityLabel?: string;
}
export interface AppliedCoupon {
  code: string;
  discount?: number;
  discountType?: string;
  discountValue?: number;
  discountDisplay?: string;
}
export interface CheckoutSummaryResponse {
  cart: Cart;
  summary: CartSummary;
  coupons?: AppliedCoupon[];
  coupon?: AppliedCoupon | null;
}
export interface OrderSummaryResponse {
  items: Cart["items"];
  address: Address | null;
  coupons?: AppliedCoupon[];
  coupon?: AppliedCoupon | null;
  summary: CartSummary;
}

export const checkoutApi = {
  getSummary: () => apiRequest<CheckoutSummaryResponse>("/checkout/summary"),
  getCoupons: () => apiRequest<Coupon[]>("/coupons"),
  getWelcomeCoupons: () => apiRequest<Coupon[]>("/checkout/available-coupons"),
  applyCoupon: (code: string) =>
    apiRequest<CheckoutSummaryResponse>("/checkout/apply-coupon", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  applyReferenceId: (referenceId: string) =>
    apiRequest<CheckoutSummaryResponse>("/checkout/reference-id", {
      method: "POST",
      body: JSON.stringify({ referenceId }),
    }),
  removeReferenceId: () =>
    apiRequest<CheckoutSummaryResponse>("/checkout/reference-id", {
      method: "DELETE",
    }),
  removeCoupon: (code: string) =>
    apiRequest<CheckoutSummaryResponse>("/checkout/coupon", {
      method: "DELETE",
      body: JSON.stringify({ code }),
    }),
  getOrderSummary: (addressId?: string) => {
    const query = addressId ? `?addressId=${addressId}` : "";
    return apiRequest<OrderSummaryResponse>(`/checkout/order-summary${query}`);
  },
};
