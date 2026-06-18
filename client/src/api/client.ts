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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new ApiRequestError(
      data.statusCode || response.status,
      data.message || "Request failed",
      data.errors || [],
    );
  }

  return data.data as T;
}

export { API_BASE_URL };
