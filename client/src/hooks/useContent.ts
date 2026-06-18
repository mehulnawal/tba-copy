import { useQuery } from "@tanstack/react-query";
import { bannerApi } from "../api/banner.api";
import { announcementApi } from "../api/announcement.api";

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: bannerApi.getActiveBanners,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: announcementApi.getActiveAnnouncements,
    staleTime: 5 * 60 * 1000,
  });
}
