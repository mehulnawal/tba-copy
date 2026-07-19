import { useState, useEffect } from "react";
import { apiRequest } from "../api/client";

interface GoldRates {
  "9K": number;
  "12K": number;
  "14K": number;
  "18K": number;
  "22K": number;
  "24K": number;
  updatedAt: string;
}

export function useGoldPrice() {
  const [data, setData] = useState<GoldRates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    async function fetchGoldPrice() {
      try {
        setIsLoading(true);
        const rates = await apiRequest<GoldRates>("/gold-rates");
        setData(rates);
        setIsError(false);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGoldPrice();
  }, []);

  return { data, isLoading, isError };
}
