import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

interface MetalRates {
  gold9kt: number;
  gold14kt: number;
  gold18kt: number;
  silver: number;
  updatedAt: string;
}

export function useMetalRates() {
  const [data, setData] = useState<MetalRates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    async function fetchMetalRates() {
      try {
        setIsLoading(true);
        const rates = await apiRequest<MetalRates>("/metal-rates");
        setData(rates);
        setIsError(false);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetalRates();
  }, []);

  return { data, isLoading, isError };
}
