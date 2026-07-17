import { apiRequest } from "./client";
import type { Announcement } from "./announcement.api";
import type { Banner } from "./banner.api";

export interface AdminUser { id: string; name: string; email: string; role: string; }
export interface ManagedUser extends AdminUser { _id: string; phone?: string | null; isBlocked: boolean; createdAt: string; }
export interface Coupon { _id: string; code: string; discountType: "percentage" | "flat"; discountValue: number; minimumCartValue: number; expiryDate: string; usageLimit: number | null; usedCount: number; activeStatus: boolean; }
export type BannerPayload = { title?: string; link?: string; order?: number; isActive?: boolean; image?: string; mobileImage?: string; file?: File | null };
const formData = (payload: BannerPayload) => { const body = new FormData(); Object.entries(payload).forEach(([key, value]) => { if (value !== undefined && value !== null && key !== "file") body.append(key, String(value)); }); if (payload.file) body.append("image", payload.file); return body; };

export const adminApi = {
  login: (email: string, password: string) => apiRequest<AdminUser>("/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }), logout: () => apiRequest<null>("/admin/auth/logout", { method: "POST" }), refresh: () => apiRequest<AdminUser>("/admin/auth/refresh", { method: "POST" }), me: () => apiRequest<AdminUser>("/admin/auth/me"),
  banners: () => apiRequest<Banner[]>("/admin/banners"), createBanner: (p: BannerPayload) => apiRequest<Banner>("/admin/banners", { method: "POST", body: formData(p) }), updateBanner: (id: string, p: BannerPayload) => apiRequest<Banner>(`/admin/banners/${id}`, { method: "PATCH", body: formData(p) }), deleteBanner: (id: string) => apiRequest<null>(`/admin/banners/${id}`, { method: "DELETE" }), setBannerActive: (id: string, active: boolean) => apiRequest<Banner>(`/admin/banners/${id}/${active ? "activate" : "deactivate"}`, { method: "PATCH" }),
  announcements: () => apiRequest<Announcement[]>("/admin/announcements"), createAnnouncement: (p: Partial<Announcement>) => apiRequest<Announcement>("/admin/announcements", { method: "POST", body: JSON.stringify(p) }), updateAnnouncement: (id: string, p: Partial<Announcement>) => apiRequest<Announcement>(`/admin/announcements/${id}`, { method: "PATCH", body: JSON.stringify(p) }), deleteAnnouncement: (id: string) => apiRequest<null>(`/admin/announcements/${id}`, { method: "DELETE" }), setAnnouncementActive: (id: string, active: boolean) => apiRequest<Announcement>(`/admin/announcements/${id}/${active ? "activate" : "deactivate"}`, { method: "PATCH" }),
  coupons: () => apiRequest<Coupon[]>("/admin/coupons"), createCoupon: (p: Omit<Coupon, "_id" | "usedCount">) => apiRequest<Coupon>("/admin/coupons", { method: "POST", body: JSON.stringify(p) }), updateCoupon: (id: string, p: Partial<Coupon>) => apiRequest<Coupon>(`/admin/coupons/${id}`, { method: "PATCH", body: JSON.stringify(p) }), deleteCoupon: (id: string) => apiRequest<null>(`/admin/coupons/${id}`, { method: "DELETE" }),
  users: () => apiRequest<ManagedUser[]>("/admin/users"), setUserBlocked: (id: string, blocked: boolean) => apiRequest<{ id: string; isBlocked: boolean }>(`/admin/users/${id}/${blocked ? "block" : "unblock"}`, { method: "PATCH" }),
};
