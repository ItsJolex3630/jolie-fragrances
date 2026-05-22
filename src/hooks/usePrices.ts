'use client';

import { useState, useEffect, useCallback } from 'react';

interface PriceData {
  prices: Record<number, number | null>;
  margin: number;
  source: string;
  lastUpdated: string | null;
  stats: {
    total: number;
    priced: number;
    unpriced: number;
  };
}

interface UsePricesReturn {
  /** Get the retail price for a perfume ID */
  getPrice: (perfumeId: number) => number | null;
  /** All prices loaded */
  prices: Record<number, number | null>;
  /** Whether prices are currently loading */
  loading: boolean;
  /** Whether there was an error loading prices */
  error: boolean;
  /** The margin percentage being applied */
  margin: number;
  /** When prices were last updated */
  lastUpdated: string | null;
  /** Stats about pricing */
  stats: PriceData['stats'] | null;
  /** Manually refresh prices */
  refresh: () => void;
}

export function usePrices(): UsePricesReturn {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/prices');
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      const data: PriceData = await response.json();
      setPriceData(data);
    } catch (err) {
      console.error('[usePrices] Error fetching prices:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const getPrice = useCallback(
    (perfumeId: number): number | null => {
      if (!priceData?.prices) return null;
      return priceData.prices[perfumeId] ?? null;
    },
    [priceData]
  );

  const refresh = useCallback(() => {
    fetch('/api/prices?refresh=true')
      .then((res) => res.json())
      .then((data: PriceData) => {
        setPriceData(data);
      })
      .catch((err) => {
        console.error('[usePrices] Error refreshing prices:', err);
        setError(true);
      });
  }, []);

  return {
    getPrice,
    prices: priceData?.prices ?? {},
    loading,
    error,
    margin: priceData?.margin ?? 35,
    lastUpdated: priceData?.lastUpdated ?? null,
    stats: priceData?.stats ?? null,
    refresh,
  };
}
