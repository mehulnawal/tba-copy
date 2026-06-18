import { apiRequest } from "./client";

export interface Announcement {
  _id: string;
  message: string;
  order: number;
  isActive: boolean;
}

export const announcementApi = {
  getActiveAnnouncements: () => apiRequest<Announcement[]>("/announcements"),
};
