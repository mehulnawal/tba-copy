export interface ApiSuccessResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
  data: null;
}

export class ApiRequestError extends Error {
  statusCode: number;
  errors: string[];

  constructor(statusCode: number, message: string, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "ApiRequestError";
  }
}

const developmentApiBaseUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:8000/api/v1` : "http://localhost:8000/api/v1";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || developmentApiBaseUrl;
let adminRefreshInFlight: Promise<boolean> | null = null;
let customerRefreshInFlight: Promise<boolean> | null = null;

const requestOnce = async (endpoint: string, options: RequestInit = {}) => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });
  return { response, data: await response.json().catch(() => ({})) };
};

const refreshAdminSession = async () => {
  if (!adminRefreshInFlight) {
    adminRefreshInFlight = requestOnce("/admin/auth/refresh", { method: "POST" })
      .then(({ response, data }) => response.ok && data.success !== false)
      .catch(() => false)
      .finally(() => { adminRefreshInFlight = null; });
  }
  return adminRefreshInFlight;
};

const refreshCustomerSession = async () => {
  if (!customerRefreshInFlight) {
    customerRefreshInFlight = requestOnce("/auth/refresh", { method: "POST" })
      .then(({ response, data }) => response.ok && data.success !== false)
      .catch(() => false)
      .finally(() => { customerRefreshInFlight = null; });
  }
  return customerRefreshInFlight;
};
const redirectToAdminLogin = () => {
  if (typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
    window.location.assign("/admin/login");
  }
};

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let { response, data } = await requestOnce(endpoint, options);
  const isProtectedAdminCall = endpoint.startsWith("/admin/")
    && endpoint !== "/admin/auth/login"
    && endpoint !== "/admin/auth/logout"
    && endpoint !== "/admin/auth/refresh";

  if (response.status === 401 && isProtectedAdminCall) {
    if (await refreshAdminSession()) ({ response, data } = await requestOnce(endpoint, options));
    else redirectToAdminLogin();
  } else if (response.status === 401 && !endpoint.startsWith("/auth/")) {
    if (await refreshCustomerSession()) ({ response, data } = await requestOnce(endpoint, options));
  }

  if (!response.ok || data.success === false) {
    if (response.status === 401 && isProtectedAdminCall) redirectToAdminLogin();
    throw new ApiRequestError(data.statusCode || response.status, data.message || "Request failed", data.errors || []);
  }
  return data.data as T;
}

export { API_BASE_URL };