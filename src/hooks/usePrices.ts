'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Detail payload for a BD-only perfume (one that doesn't exist in the
 * static perfumes.ts catalog). The catalog page uses this to construct a
 * Perfume object on the client and merge it into the listing.
 *
 * Mirrors the PerfumeDetail interface in /api/prices/route.ts.
 */
export interface PerfumeDetail {
  name: string;
  brand: string;
  gender: string | null;
  size: string | null;
  fragranticaId: number | null;
  concentration: string | null;
  brandSlug: string | null;
  perfumeSlug: string | null;
}

interface PriceData {
  prices: Record<number, number | null>;
  /** Per-perfume availability flag (false = "No Disponible"). */
  available?: Record<number, boolean>;
  /** Per-perfume temporal discount percentage (0 = no temporal discount). */
  temporalDiscount?: Record<number, number>;
  /** Optional label for the temporal discount (e.g. "Oferta del día"). */
  temporalDiscountLabel?: Record<number, string | null>;
  /**
   * Detail payload for BD-only perfumes (Task 30). The catalog page
   * merges these into the static `perfumes` list to display admin-added
   * perfumes that don't exist in perfumes.ts.
   */
  perfumeDetails?: Record<number, PerfumeDetail>;
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
  /** Get the availability flag for a perfume ID (default true). */
  isAvailable: (perfumeId: number) => boolean;
  /**
   * Get the temporal discount percentage for a perfume ID (0 = none).
   * Only returns > 0 when the perfume is also available.
   */
  getTemporalDiscount: (perfumeId: number) => number;
  /** Get the temporal discount label for a perfume ID (or null). */
  getTemporalDiscountLabel: (perfumeId: number) => string | null;
  /** All availability flags loaded */
  available: Record<number, boolean>;
  /** All temporal discounts loaded */
  temporalDiscount: Record<number, number>;
  /** All temporal discount labels loaded */
  temporalDiscountLabel: Record<number, string | null>;
  /**
   * Detail payloads for BD-only perfumes (Task 30). Map keyed by
   * perfumeId. Empty when running in static-fallback mode.
   */
  perfumeDetails: Record<number, PerfumeDetail>;
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

  const isAvailable = useCallback(
    (perfumeId: number): boolean => {
      const a = priceData?.available?.[perfumeId];
      if (a === undefined) return true; // default: available
      return !!a;
    },
    [priceData]
  );

  const getTemporalDiscount = useCallback(
    (perfumeId: number): number => {
      if (!priceData?.temporalDiscount) return 0;
      // Only honor the temporal discount if the perfume is actually available
      if (!isAvailable(perfumeId)) return 0;
      const pct = priceData.temporalDiscount[perfumeId];
      return typeof pct === 'number' && pct > 0 ? pct : 0;
    },
    [priceData, isAvailable]
  );

  const getTemporalDiscountLabel = useCallback(
    (perfumeId: number): string | null => {
      if (!priceData?.temporalDiscountLabel) return null;
      return priceData.temporalDiscountLabel[perfumeId] ?? null;
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
    isAvailable,
    getTemporalDiscount,
    getTemporalDiscountLabel,
    available: priceData?.available ?? {},
    temporalDiscount: priceData?.temporalDiscount ?? {},
    temporalDiscountLabel: priceData?.temporalDiscountLabel ?? {},
    perfumeDetails: priceData?.perfumeDetails ?? {},
    refresh,
  };
}
