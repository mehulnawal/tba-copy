import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import type { Category } from "../types";

export function useCategories(metal?: "gold" | "silver") {
  const [data, setData] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  useEffect(() => { const fetchCategories = async () => { try { setIsLoading(true); const query = metal ? `?metal=${metal}` : ""; setData(await apiRequest<Category[]>(`/categories${query}`)); setIsError(false); } catch (error) { console.error("Unable to load categories", error); setIsError(true); } finally { setIsLoading(false); } }; void fetchCategories(); }, [metal]);
  return { data, isLoading, isError };
}