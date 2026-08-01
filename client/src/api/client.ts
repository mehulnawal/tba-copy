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
const WINDOWS_1252_BYTES: Record<number, number> = { 0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f };
const mojibakeMarker = /[\u00c2\u00c3\u00e2\ufffd]/;
const repairMojibakeString = (value: string) => {
  let repaired = value;
  for (let attempt = 0; attempt < 3 && mojibakeMarker.test(repaired); attempt += 1) {
    const bytes = Uint8Array.from(Array.from(repaired, (character) => {
      const code = character.codePointAt(0) || 0;
      return code <= 0xff ? code : WINDOWS_1252_BYTES[code] ?? 0;
    }));
    try {
      const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (!decoded || decoded === repaired || (mojibakeMarker.test(decoded) && decoded.length >= repaired.length)) break;
      repaired = decoded;
    } catch { break; }
  }
  return repaired;
};
const repairMojibake = (value: unknown): unknown => {
  if (typeof value === "string") return repairMojibakeString(value);
  if (Array.isArray(value)) return value.map(repairMojibake);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, repairMojibake(item)]));
  return value;
};
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
  return { response, data: repairMojibake(await response.json().catch(() => ({}))) as ApiSuccessResponse<unknown> | ApiErrorResponse };
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