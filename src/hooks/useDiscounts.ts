"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * useDiscounts
 * Fetches the logged-in user's discount codes from /api/discounts/me.
 *
 * This hook uses the NextAuth session (shared across / and /predicciones via
 * the AuthProvider in layout.tsx) to identify the user. If the user is logged
 * in with Google, their 5%/10% discount codes from /predicciones are returned
 * here so the catalog can show a reminder badge.
 */

export interface DiscountCode {
  id: string;
  code: string;
  discountPct: number; // 5 or 10
  verified: boolean;
  expiresAt: string;
  createdAt: string;
}

interface UseDiscountsResult {
  /** Is the user authenticated (logged in with Google)? */
  authenticated: boolean;
  /** User's email (if authenticated) */
  email: string | null;
  /** User's display name (if authenticated) */
  name: string | null;
  /** Active (unexpired + unverified) discount codes */
  discounts: DiscountCode[];
  /** Total active discounts count (convenience) */
  activeCount: number;
  /** Highest discount % available (for the badge) */
  bestDiscountPct: number;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: boolean;
  /** Manually refresh */
  refresh: () => void;
}

export function useDiscounts(): UseDiscountsResult {
  const [data, setData] = useState<{
    authenticated: boolean;
    email: string | null;
    name: string | null;
    discounts: DiscountCode[];
  }>({
    authenticated: false,
    email: null,
    name: null,
    discounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchDiscounts() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/discounts/me", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        setData({
          authenticated: !!json.authenticated,
          email: json.email || null,
          name: json.name || null,
          discounts: Array.isArray(json.discounts) ? json.discounts : [],
        });
      } catch (err) {
        console.error("[useDiscounts] fetch error:", err);
        if (!cancelled) {
          setError(true);
          setData({
            authenticated: false,
            email: null,
            name: null,
            discounts: [],
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDiscounts();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const activeCount = data.discounts.length;
  const bestDiscountPct = data.discounts.reduce(
    (max, d) => Math.max(max, d.discountPct),
    0
  );

  return {
    authenticated: data.authenticated,
    email: data.email,
    name: data.name,
    discounts: data.discounts,
    activeCount,
    bestDiscountPct,
    loading,
    error,
    refresh,
  };
}
