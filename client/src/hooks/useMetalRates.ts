import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
interface MetalRates {
  gold24kt: number;
  silver: number;
  makingRatePerGram: number;
  certificateRatePerGram: number;
  updatedAt: string;
}

export function useMetalRates() {
  const query = useQuery({
    queryKey: ["metal-rates"],
    queryFn: () => apiRequest<MetalRates>("/metal-rates"),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
