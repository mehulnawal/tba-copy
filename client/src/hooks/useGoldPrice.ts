import { useState, useEffect } from "react";

interface GoldRates {
  "9K": number;
  "12K": number;
  "14K": number;
  "18K": number;
  "22K": number;
  "24K": number;
  updatedAt: string;
}

const GOLD_API_KEY = "goldapi-fdd51ed5fe99f3342e3fdce0585cbf35-io";
const CACHE_KEY = "tba_gold_rates";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function useGoldPrice() {
  const [data, setData] = useState<GoldRates | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    async function fetchGoldPrice() {
      try {
        setIsLoading(true);

        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          const isExpired =
            new Date().getTime() - new Date(parsedCache.updatedAt).getTime() >
            DAY_IN_MS;

          if (!isExpired) {
            setData(parsedCache);
            setIsError(false);
            setIsLoading(false);
            return;
          }
        }

        const response = await fetch("https://www.goldapi.io/api/XAU/INR", {
          method: "GET",
          headers: {
            "x-access-token": GOLD_API_KEY,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("API Network response issue");

        const result = await response.json();
        const rawPrice = result.price_gram_24k || result.price / 31.1035;
        const price24k = Math.round(rawPrice * 1.12);

        if (!price24k || isNaN(price24k))
          throw new Error("Invalid API data data");

        const calculatedRates: GoldRates = {
          "24K": price24k,
          "22K": Math.round(price24k * 0.916),
          "18K": Math.round(price24k * 0.75),
          "14K": Math.round(price24k * 0.585),
          "12K": Math.round(price24k * 0.5),
          "9K": Math.round(price24k * 0.375),
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(calculatedRates));
        setData(calculatedRates);
        setIsError(false);
      } catch (error) {
        console.error("Gold API Error:", error);
        const backupCache = localStorage.getItem(CACHE_KEY);
        if (backupCache) {
          setData(JSON.parse(backupCache));
          setIsError(false);
        } else {
          setIsError(true);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchGoldPrice();
  }, []);

  return { data, isLoading, isError };
}
