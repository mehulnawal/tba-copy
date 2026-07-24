import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

interface MetalRates {
  gold24kt: number;
  silver: number;
  makingRatePerGram: number;
  certificateRatePerGram: number;
  updatedAt: string;
}

export function useMetalRates() {
  const [data, setData] = useState<MetalRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  useEffect(() => { async function fetchMetalRates() { try { setIsLoading(true); setData(await apiRequest<MetalRates>("/metal-rates")); setIsError(false); } catch { setIsError(true); } finally { setIsLoading(false); } } fetchMetalRates(); }, []);
  return { data, isLoading, isError };
}