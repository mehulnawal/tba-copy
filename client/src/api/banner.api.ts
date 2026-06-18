import { apiRequest } from "./client";

export interface Banner {
  _id: string;
  title?: string;
  image: string;
  mobileImage?: string | null;
  link?: string;
  order: number;
  isActive: boolean;
}

export const bannerApi = {
  getActiveBanners: () => apiRequest<Banner[]>("/banners"),
};
