import { apiRequest } from "./client";
import type { Announcement } from "./announcement.api";
import type { Banner } from "./banner.api";
import type { Category, Product, PriceBreakdown } from "../types";

export interface DiamondCategory {
  _id: string;
  categoryName: string;
  size: string;
  b2bPrice: number;
  b2cPrice: number;
  createdAt: string;
}
export interface DiamondClarity {
  _id: string;
  name: string;
  isActive: boolean;
}
export interface CertificateOption {
  _id: string;
  name: string;
  logoUrl?: string;
  isActive: boolean;
}
export interface PricingConfig {
  _id: string;
  key: string;
  metal: "gold" | "silver";
  categoryType: string;
  makingRatePerGram: number;
  weightBasis: "net" | "gross";
  moissaniteRatePerCarat?: number;
  polkiValuePerUnit?: number;
  silverB2BMakingChargeRate?: number;
  certificateApplies: boolean;
  usesLabGrownFixedDiamondRates: boolean;
  b2bExcludeCharges?: boolean;
  isActive: boolean;
}
export interface B2BAccessStatus {
  active: boolean;
  lastChanged: string | null;
  lastAccessMobile?: string | null;
}
export interface B2BAccessLog {
  id: string;
  mobile: string;
  accessedAt: string;
}
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
export type CategoryCouponCategory = "gold" | "polki" | "moissanite";
export type CategoryCouponAppliesTo = "diamond" | "making" | "moissanite";
export interface CategoryCoupon extends Coupon {
  category: CategoryCouponCategory;
  appliesTo: CategoryCouponAppliesTo;
}
export type CategoryCouponPayload = Omit<Coupon, "_id" | "usedCount"> & { appliesTo?: CategoryCouponAppliesTo };
export interface Partner {
  _id: string;
  referenceId: string;
  firstName: string;
  lastName: string;
  mobile: string;
  dateOfBirth: string;
  city: string;
  address?: string;
  points: string;
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
  categoryCoupons: () =>
    apiRequest<CategoryCoupon[]>("/admin/category-coupons"),
  createCategoryCoupon: (
    category: CategoryCouponCategory,
    p: CategoryCouponPayload,
  ) =>
    apiRequest<CategoryCoupon>(`/admin/category-coupons/${category}`, {
      method: "POST",
      body: JSON.stringify(p),
    }),
  updateCategoryCoupon: (
    category: CategoryCouponCategory,
    p: Partial<CategoryCouponPayload>,
  ) =>
    apiRequest<CategoryCoupon>(`/admin/category-coupons/${category}`, {
      method: "PATCH",
      body: JSON.stringify(p),
    }),
  deleteCategoryCoupon: (category: CategoryCouponCategory) =>
    apiRequest<null>(`/admin/category-coupons/${category}`, {
      method: "DELETE",
    }),
  partners: () => apiRequest<Partner[]>("/admin/partners"),
  createPartner: (p: Omit<Partner, "_id" | "referenceId" | "points">) =>
    apiRequest<Partner>("/admin/partners", {
      method: "POST",
      body: JSON.stringify(p),
    }),
  updatePartner: (
    id: string,
    p: Partial<Omit<Partner, "_id" | "referenceId" | "points">>,
  ) =>
    apiRequest<Partner>(`/admin/partners/${id}`, {
      method: "PATCH",
      body: JSON.stringify(p),
    }),
  updatePartnerPoints: (id: string, points: number) =>
    apiRequest<Partner>(`/admin/partners/${id}/points`, {
      method: "PATCH",
      body: JSON.stringify({ points }),
    }),
  redeemPartnerPoints: (id: string, points: number) =>
    apiRequest<Partner>(`/admin/partners/${id}/redeem-points`, {
      method: "PATCH",
      body: JSON.stringify({ points }),
    }),
  deletePartner: (id: string) =>
    apiRequest<null>(`/admin/partners/${id}`, { method: "DELETE" }),
  adminProducts: (search = "") =>
    apiRequest<Product[]>(
      `/admin/products${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    ),
  adminGetProduct: (id: string) => apiRequest<Product>(`/admin/products/${id}`),
  createProduct: (p: Partial<Product>) =>
    apiRequest<Product>("/admin/products", {
      method: "POST",
      body: JSON.stringify(p),
    }),
  updateProduct: (id: string, p: Partial<Product>) =>
    apiRequest<Product>(`/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(p),
    }),
  deleteProduct: (id: string) =>
    apiRequest<null>(`/admin/products/${id}`, { method: "DELETE" }),
  previewPrice: (p: Partial<Product>) =>
    apiRequest<PriceBreakdown[]>("/admin/products/preview-price", {
      method: "POST",
      body: JSON.stringify(p),
    }),
  uploadImage: (file: File) => {
    const body = new FormData();
    body.append("image", file);
    return apiRequest<{ url: string }>("/admin/upload-image", {
      method: "POST",
      body,
    });
  },
  pricingConfigs: () => apiRequest<PricingConfig[]>("/admin/pricing-configs"),
  updatePricingConfig: (
    key: string,
    changes: Partial<
      Pick<
        PricingConfig,
        | "makingRatePerGram"
        | "moissaniteRatePerCarat"
        | "polkiValuePerUnit"
        | "silverB2BMakingChargeRate"
      >
    >,
  ) =>
    apiRequest<PricingConfig>(
      "/admin/pricing-configs/" + encodeURIComponent(key),
      { method: "PATCH", body: JSON.stringify(changes) },
    ),
  b2bAccessStatus: () => apiRequest<B2BAccessStatus>("/admin/b2b-access"),
  b2bAccessLogs: () => apiRequest<B2BAccessLog[]>("/admin/b2b-access/logs"),
  setB2BPassword: (password: string) =>
    apiRequest<B2BAccessStatus>("/admin/b2b-access", {
      method: "PUT",
      body: JSON.stringify({ password }),
    }),
  revokeB2BPassword: () =>
    apiRequest<B2BAccessStatus>("/admin/b2b-access", { method: "DELETE" }),
  diamondCategories: () =>
    apiRequest<DiamondCategory[]>("/admin/diamond-categories"),
  diamondSubcategories: () =>
    apiRequest<{ _id: string; name: string }[]>("/admin/diamond-subcategories"),
  saveDiamondSubcategory: (name: string) =>
    apiRequest<{ _id: string; name: string }>("/admin/diamond-subcategories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  createDiamondCategory: (
    payload: Omit<DiamondCategory, "_id" | "createdAt">,
  ) =>
    apiRequest<DiamondCategory>("/admin/diamond-categories", {
      method: "POST",
      body: JSON.stringify({ ...payload, name: payload.categoryName }),
    }),
  diamondCategorySizes: (categoryName: string) =>
    apiRequest<string[]>(
      `/admin/diamond-categories/sizes?categoryName=${encodeURIComponent(categoryName)}`,
    ),
  updateDiamondCategory: (
    id: string,
    payload: Pick<
      DiamondCategory,
      "categoryName" | "size" | "b2bPrice" | "b2cPrice"
    >,
  ) =>
    apiRequest<DiamondCategory>(`/admin/diamond-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteDiamondCategory: (id: string) =>
    apiRequest<null>(`/admin/diamond-categories/${id}`, { method: "DELETE" }),
  diamondClarities: () =>
    apiRequest<DiamondClarity[]>("/admin/diamond-clarities"),
  certificates: () => apiRequest<CertificateOption[]>("/admin/certificates"),
  saveCertificate: (name: string, logoUrl = "") =>
    apiRequest<CertificateOption>("/admin/certificates", {
      method: "POST",
      body: JSON.stringify({ name, logoUrl }),
    }),
  deleteCertificate: (id: string) =>
    apiRequest<null>(`/admin/certificates/${id}`, { method: "DELETE" }),
  saveDiamondCategory: (name: string, size = "") =>
    apiRequest<DiamondCategory>("/admin/diamond-categories", {
      method: "POST",
      body: JSON.stringify({
        categoryName: name,
        size: size || "Standard",
        b2bPrice: 0,
        b2cPrice: 0,
      }),
    }),
  saveDiamondClarity: (name: string) =>
    apiRequest<DiamondClarity>("/admin/diamond-clarities", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  categories: () => apiRequest<Category[]>("/admin/categories"),
  createCategory: (p: {
    name: string;
    parent: string | null;
    isActive: boolean;
    showOnHomepage?: boolean;
    homepageCoverImage?: string;
    shortCode?: string;
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
      isActive: boolean;
      showOnHomepage?: boolean;
      homepageCoverImage?: string;
      shortCode?: string;
    }>,
  ) =>
    apiRequest<Category>(`/admin/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(p),
    }),
  deleteCategory: (id: string) =>
    apiRequest<null>(`/admin/categories/${id}`, { method: "DELETE" }),
  reviews: () => apiRequest<AdminReview[]>("/admin/reviews"),
  moderateReview: (id: string, status: "approved" | "rejected") =>
    apiRequest<AdminReview>(`/admin/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteReview: (id: string) =>
    apiRequest<null>(`/admin/reviews/${id}`, { method: "DELETE" }),
  users: () => apiRequest<ManagedUser[]>("/admin/users"),
  setUserBlocked: (id: string, blocked: boolean) =>
    apiRequest<{ id: string; isBlocked: boolean }>(
      `/admin/users/${id}/${blocked ? "block" : "unblock"}`,
      { method: "PATCH" },
    ),
};
