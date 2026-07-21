import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import type { Category } from "../types";

export function useCategories() {
  const [data, setData] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await apiRequest<Category[]>("/categories");
        setData(categories);
        setIsError(false);
      } catch (error) {
        console.error("Unable to load navigation categories", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchCategories();
  }, []);

  return { data, isLoading, isError };
}
