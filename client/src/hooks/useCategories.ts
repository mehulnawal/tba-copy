import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import type { Category } from "../types";

/** Admin-managed category tree, shared by B2C and B2B catalogues. */
export function useCategories(metal?: "gold" | "silver") {
  const query = useQuery({
    queryKey: ["categories", metal || "all"],
    queryFn: () => apiRequest<Category[]>(`/categories${metal ? `?metal=${metal}` : ""}`),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
  return { data: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
}