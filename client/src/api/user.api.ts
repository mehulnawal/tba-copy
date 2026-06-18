import { apiRequest } from "./client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  houseNo: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface AddressPayload {
  fullName: string;
  phone: string;
  houseNo: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export const userApi = {
  getProfile: () => apiRequest<UserProfile>("/user/profile"),

  updateProfile: (payload: Partial<Pick<UserProfile, "name" | "phone">>) =>
    apiRequest<UserProfile>("/user/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<null>("/user/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  getAddresses: () => apiRequest<Address[]>("/user/addresses"),

  addAddress: (payload: AddressPayload) =>
    apiRequest<Address>("/user/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateAddress: (addressId: string, payload: Partial<AddressPayload>) =>
    apiRequest<Address>(`/user/addresses/${addressId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteAddress: (addressId: string) =>
    apiRequest<null>(`/user/addresses/${addressId}`, { method: "DELETE" }),

  setDefaultAddress: (addressId: string) =>
    apiRequest<Address>(`/user/addresses/${addressId}/default`, {
      method: "PATCH",
    }),
};
