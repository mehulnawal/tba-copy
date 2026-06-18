import { apiRequest } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiRequest<AuthUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiRequest<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest<null>("/auth/logout", { method: "POST" }),

  refresh: () =>
    apiRequest<AuthUser>("/auth/refresh", { method: "POST" }),

  getMe: () =>
    apiRequest<AuthUser>("/auth/me"),

  forgotPassword: (email: string) =>
    apiRequest<null>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest<AuthUser>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  googleLogin: (idToken: string) =>
    apiRequest<AuthUser>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),

  facebookLogin: (accessToken: string) =>
    apiRequest<AuthUser>("/auth/facebook", {
      method: "POST",
      body: JSON.stringify({ accessToken }),
    }),
};
