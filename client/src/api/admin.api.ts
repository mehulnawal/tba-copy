import { apiRequest } from "./client";
import type { Announcement } from "./announcement.api";
import type { Banner } from "./banner.api";
import type { Category, Product, PriceBreakdown } from "../types";

export interface DiamondCategory { _id: string; name: string; subTypes: string[]; isActive: boolean; }
export interface PricingConfig { _id: string; key: string; metal: "gold" | "silver"; categoryType: string; makingRatePerGram: number; weightBasis: "net" | "gross"; stoneRatePerUnit?: number; certificateApplies: boolean; usesLabGrownFixedDiamondRates: boolean; isActive: boolean; }
export interface B2BAccessStatus { active: boolean; lastChanged: string | null; }
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}
export interface ManagedUser extends AdminUser {
  _id: string;
  phone?: string | null;
  isBlocked: boolean;
  createdAt: string;
}
export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minimumCartValue: number;
  expiryDate: string;
  usageLimit: number | null;
  usedCount: number;
  activeStatus: boolean;
}
export interface AdminReview {
  _id: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  user?: { name?: string; email?: string } | null;
  product?: { SKU?: string; data?: { Title?: string } } | null;
}
export type BannerPayload = {
  title?: string;
  link?: string;
  order?: number;
  isActive?: boolean;
  image?: string;
  mobileImage?: string;
  file?: File | null;
};
const formData = (payload: BannerPayload) => {
  const body = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== "file")
      body.append(key, String(value));
  });
  if (payload.file) body.append("image", payload.file);
  return body;
};

export const adminApi = {
  login: (email: string, password: string) =>
    apiRequest<AdminUser>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => apiRequest<null>("/admin/auth/logout", { method: "POST" }),
  refresh: () =>
    apiRequest<AdminUser>("/admin/auth/refresh", { method: "POST" }),
  me: () => apiRequest<AdminUser>("/admin/auth/me"),
  banners: () => apiRequest<Banner[]>("/admin/banners"),
  createBanner: (p: BannerPayload) =>
    apiRequest<Banner>("/admin/banners", { method: "POST", body: formData(p) }),
  updateBanner: (id: string, p: BannerPayload) =>
    apiRequest<Banner>(`/admin/banners/${id}`, {
      method: "PATCH",
      body: formData(p),
    }),
  deleteBanner: (id: string) =>
    apiRequest<null>(`/admin/banners/${id}`, { method: "DELETE" }),
  setBannerActive: (id: string, active: boolean) =>
    apiRequest<Banner>(
      `/admin/banners/${id}/${active ? "activate" : "deactivate"}`,
      { method: "PATCH" },
    ),
  announcements: () => apiRequest<Announcement[]>("/admin/announcements"),
  createAnnouncement: (p: Partial<Announcement>) =>
    apiRequest<Announcement>("/admin/announcements", {
      method: "POST",
      body: JSON.stringify(p),
    }),
  updateAnnouncement: (id: string, p: Partial<Announcement>) =>
    apiRequest<Announcement>(`/admin/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(p),
    }),
  deleteAnnouncement: (id: string) =>
    apiRequest<null>(`/admin/announcements/${id}`, { method: "DELETE" }),
  setAnnouncementActive: (id: string, active: boolean) =>
    apiRequest<Announcement>(
      `/admin/announcements/${id}/${active ? "activate" : "deactivate"}`,
      { method: "PATCH" },
    ),
  coupons: () => apiRequest<Coupon[]>("/admin/coupons"),
  createCoupon: (p: Omit<Coupon, "_id" | "usedCount">) =>
    apiRequest<Coupon>("/admin/coupons", {
      method: "POST",
      body: JSON.stringify(p),
    }),
  updateCoupon: (id: string, p: Partial<Coupon>) =>
    apiRequest<Coupon>(`/admin/coupons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(p),
    }),
  deleteCoupon: (id: string) =>
    apiRequest<null>(`/admin/coupons/${id}`, { method: "DELETE" }),
  adminProducts: (search = "") => apiRequest<Product[]>(`/admin/products${search ? `?search=${encodeURIComponent(search)}` : ""}`), adminGetProduct: (id: string) => apiRequest<Product>(`/admin/products/${id}`), createProduct: (p: Partial<Product>) => apiRequest<Product>("/admin/products", { method: "POST", body: JSON.stringify(p) }), updateProduct: (id: string, p: Partial<Product>) => apiRequest<Product>(`/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(p) }), deleteProduct: (id: string) => apiRequest<null>(`/admin/products/${id}`, { method: "DELETE" }), previewPrice: (p: Partial<Product>) => apiRequest<PriceBreakdown[]>("/admin/products/preview-price", { method: "POST", body: JSON.stringify(p) }), uploadImage: (file: File) => { const body = new FormData(); body.append("image", file); return apiRequest<{ url: string }>("/admin/upload-image", { method: "POST", body }); },
  pricingConfigs: () => apiRequest<PricingConfig[]>("/admin/pricing-configs"),
  updatePricingConfig: (key: string, makingRatePerGram: number) => apiRequest<PricingConfig>("/admin/pricing-configs/" + encodeURIComponent(key), { method: "PATCH", body: JSON.stringify({ makingRatePerGram }) }),
  b2bAccessStatus: () => apiRequest<B2BAccessStatus>("/admin/b2b-access"),
  setB2BPassword: (password: string) => apiRequest<B2BAccessStatus>("/admin/b2b-access", { method: "PUT", body: JSON.stringify({ password }) }),
  revokeB2BPassword: () => apiRequest<B2BAccessStatus>("/admin/b2b-access", { method: "DELETE" }),
  diamondCategories: () => apiRequest<DiamondCategory[]>("/admin/diamond-categories"),
  saveDiamondCategory: (name: string, subType = "") => apiRequest<DiamondCategory>("/admin/diamond-categories", { method: "POST", body: JSON.stringify({ name, subType }) }),
  categories: () => apiRequest<Category[]>("/admin/categories"),
  createCategory: (p: {
    name: string;
    parent: string | null;
    displayOrder: number;
    isActive: boolean;
  }) =>
    apiRequest<Category>("/admin/categories", {
      method: "POST",
      body: JSON.stringify(p),
    }),
  updateCategory: (
    id: string,
    p: Partial<{
      name: string;
      parent: string | null;
      displayOrder: number;
      isActive: boolean;
    }>,
  ) =>
    apiRequest<Category>(`/admin/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(p),
    }),
  deleteCategory: (id: string) =>
    apiRequest<null>(`/admin/categories/${id}`, { method: "DELETE" }),
  updateProductionStatus: (id: string, productionStatus: string) =>
    apiRequest(`/admin/orders/${id}/production-status`, { method: "PATCH", body: JSON.stringify({ productionStatus }) }),
  reviews: () => apiRequest<AdminReview[]>("/admin/reviews"),
  moderateReview: (id: string, status: "approved" | "rejected") =>
    apiRequest<AdminReview>(`/admin/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteReview: (id: string) => apiRequest<null>(`/admin/reviews/${id}`, { method: "DELETE" }),
  users: () => apiRequest<ManagedUser[]>("/admin/users"),
  setUserBlocked: (id: string, blocked: boolean) =>
    apiRequest<{ id: string; isBlocked: boolean }>(
      `/admin/users/${id}/${blocked ? "block" : "unblock"}`,
      { method: "PATCH" },
    ),
};
