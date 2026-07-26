"use client";

/**
 * src/hooks/useCurrency.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dual-currency system (USD / Bolívares) for Jolie Fragrances.
 *
 * The base price is ALWAYS in USD. The cart logic (subtotal, discounts, etc.)
 * works in USD. Currency conversion happens ONLY at display time, using the
 * `formatPrice` function exposed here.
 *
 * Two modes:
 *  - "usd"  → just `$38`
 *  - "bs"   → `$45`  (BCV equivalent, rounded)  +  `Bs. 31.643,74`  (USDT×price)
 *
 * State:
 *  - `mode`           — "usd" | "bs"  (persisted in localStorage "jolie-currency")
 *  - `usdtRate`       — Bs. per USDT  (market rate, used for the actual payment)
 *  - `bcvRate`        — Bs. per USD   (government rate, used for reference)
 *  - `toggleCurrency()` — switches mode + persists
 *  - `formatPrice(usdPrice)` — returns { primary, secondary } for display
 *
 * Wrap the app in `<CurrencyProvider>` (inside `<CartProvider>`).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { roundPrice } from "@/lib/priceMapping";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CurrencyMode = "usd" | "bs";

export interface ExchangeRates {
  usdtRate: number; // Bs. per USDT (market)
  bcvRate: number;  // Bs. per USD  (BCV reference)
  updatedAt: string; // ISO string
  fallback: boolean;
}

export interface FormattedPrice {
  /** Main price line. In USD mode: `$38`. In Bs. mode: `$45` (BCV equivalent, rounded). */
  primary: string;
  /** Secondary price line. Empty in USD mode. In Bs. mode: `Bs. 31.643,74`. */
  secondary: string;
}

interface CurrencyContextValue {
  mode: CurrencyMode;
  usdtRate: number;
  bcvRate: number;
  updatedAt: string;
  fallback: boolean;
  ratesLoaded: boolean;
  setMode: (m: CurrencyMode) => void;
  toggleCurrency: () => void;
  /** Convert a USD price to the current currency's display strings. */
  formatPrice: (usdPrice: number) => FormattedPrice;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CURRENCY_STORAGE_KEY = "jolie-currency";
const FALLBACK_USDT_RATE = 832.73;
const FALLBACK_BCV_RATE = 701;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Format a Bs. amount using Venezuelan convention:
 *  - `.` as thousands separator
 *  - `,` as decimal separator
 *  - 2 decimals always
 *
 * Example: 31643.74 → "31.643,74"
 */
function formatBs(amount: number): string {
  // Intl with es-VE produces the correct separators. We add a manual fallback
  // in case the runtime doesn't ship the es-VE locale.
  try {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Manual fallback: replace commas in en-US format with placeholders.
    const en = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return en.replace(/,/g, "X").replace(/\./g, ",").replace(/X/g, ".");
  }
}

/**
 * Format a USD amount: integer USD → `$38`, fractional USD → `$45.14`.
 * Joel's prices are whole dollars, so we drop the decimals when the value is
 * a whole number to keep the catalog clean. Handles negative amounts
 * (e.g. savings) by placing the `-` before the `$`.
 */
function formatUsd(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  if (Number.isInteger(abs)) return `${sign}$${abs}`;
  return `${sign}$${abs.toFixed(2)}`;
}

function loadInitialMode(): CurrencyMode {
  if (typeof window === "undefined") return "usd";
  try {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored === "usd" || stored === "bs") return stored;
  } catch {
    // localStorage unavailable — default to usd
  }
  return "usd";
}

function persistMode(mode: CurrencyMode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, mode);
  } catch {
    // Silently ignore — read-only storage shouldn't break the UI.
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<CurrencyMode>("usd");
  const [rates, setRates] = useState<ExchangeRates>({
    usdtRate: FALLBACK_USDT_RATE,
    bcvRate: FALLBACK_BCV_RATE,
    updatedAt: "",
    fallback: true,
  });
  const [ratesLoaded, setRatesLoaded] = useState(false);

  // ─── Initial mount: read localStorage mode ───────────────────────────────
  // We do this in a useEffect to avoid hydration mismatches (server always
  // renders "usd"; the client may switch to "bs" if the user previously chose it).
  useEffect(() => {
    setModeState(loadInitialMode());
  }, []);

  // ─── Fetch exchange rates on mount ───────────────────────────────────────
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/exchange-rates", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Partial<ExchangeRates>;
        if (cancelled) return;
        setRates({
          usdtRate:
            typeof data.usdtRate === "number" && Number.isFinite(data.usdtRate)
              ? data.usdtRate
              : FALLBACK_USDT_RATE,
          bcvRate:
            typeof data.bcvRate === "number" && Number.isFinite(data.bcvRate)
              ? data.bcvRate
              : FALLBACK_BCV_RATE,
          updatedAt: data.updatedAt ?? "",
          fallback: !!data.fallback,
        });
      } catch (err) {
        console.warn("[useCurrency] failed to load exchange rates:", err);
        // Keep fallback defaults already in state.
      } finally {
        if (!cancelled) setRatesLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Mode setter (persists to localStorage) ──────────────────────────────
  const setMode = useCallback((m: CurrencyMode) => {
    setModeState(m);
    persistMode(m);
  }, []);

  const toggleCurrency = useCallback(() => {
    setModeState((prev) => {
      const next: CurrencyMode = prev === "usd" ? "bs" : "usd";
      persistMode(next);
      return next;
    });
  }, []);

  // ─── formatPrice ─────────────────────────────────────────────────────────
  // Pure display function. The caller is responsible for applying any discount
  // BEFORE calling this (i.e. pass the already-discounted USD price).
  const formatPrice = useCallback(
    (usdPrice: number): FormattedPrice => {
      if (!Number.isFinite(usdPrice)) {
        return { primary: "", secondary: "" };
      }
      if (mode === "usd") {
        return { primary: formatUsd(usdPrice), secondary: "" };
      }
      // Bs. mode — handle the sign once so the prefix is "-Bs. X" (not "Bs. -X").
      const isNeg = usdPrice < 0;
      const absUsd = Math.abs(usdPrice);
      const bcvEquivalent = roundPrice((absUsd * rates.usdtRate) / rates.bcvRate);
      const bsAmount = absUsd * rates.usdtRate;
      return {
        primary: `${isNeg ? "-" : ""}${formatUsd(bcvEquivalent)}`,
        secondary: `${isNeg ? "-" : ""}Bs. ${formatBs(bsAmount)}`,
      };
    },
    [mode, rates.usdtRate, rates.bcvRate]
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      mode,
      usdtRate: rates.usdtRate,
      bcvRate: rates.bcvRate,
      updatedAt: rates.updatedAt,
      fallback: rates.fallback,
      ratesLoaded,
      setMode,
      toggleCurrency,
      formatPrice,
    }),
    [
      mode,
      rates,
      ratesLoaded,
      setMode,
      toggleCurrency,
      formatPrice,
    ]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used inside a <CurrencyProvider>");
  }
  return ctx;
}

// ─── Currency Toggle component ───────────────────────────────────────────────
//
// A pill-style toggle with two options: "💵 USD" and "🇻🇪 Bs."
//  - `variant="full"`     → shows labels + icons (filter bar)
//  - `variant="compact"`  → shows only icons (perfume card)
//
// Both variants control the SAME shared context state, so toggling one updates
// every price across the app instantly.

export function CurrencyToggle({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const { mode, toggleCurrency } = useCurrency();

  const isFull = variant === "full";

  const baseBtn =
    "relative z-10 flex items-center justify-center gap-1 font-[family-name:var(--font-inter)] transition-colors duration-200";
  const sizeBtn = isFull
    ? "px-3 py-1 text-[11px] font-bold"
    : "px-2 py-0.5 text-[12px] leading-none";
  const activeCls =
    "text-black";
  const inactiveCls =
    "text-white/45 hover:text-white/80";

  // The sliding highlight sits behind the active option.
  const sliderCls = isFull
    ? mode === "usd"
      ? "translate-x-0"
      : "translate-x-full"
    : mode === "usd"
    ? "translate-x-0"
    : "translate-x-full";

  const containerCls = isFull
    ? "inline-flex items-center rounded-full border border-[#d4af37]/20 bg-[#111111] p-0.5 relative"
    : "inline-flex items-center rounded-full border border-[#d4af37]/20 bg-black/70 backdrop-blur-sm p-0.5 relative shadow-md shadow-black/40";

  const trackWidthCls = isFull ? "w-[calc(50%-2px)]" : "w-[calc(50%-2px)]";
  const trackHeightCls = isFull ? "h-[calc(100%-0px)]" : "h-[calc(100%-0px)]";

  return (
    <div
      role="group"
      aria-label="Selector de moneda"
      className={`${containerCls} ${className}`}
    >
      {/* Sliding gradient background */}
      <span
        aria-hidden="true"
        className={`absolute top-0.5 left-0.5 ${trackWidthCls} ${trackHeightCls} rounded-full bg-gradient-to-r from-[#d4af37] to-[#f0d060] shadow-sm transition-transform duration-300 ease-out ${sliderCls}`}
      />
      {/* USD option */}
      <button
        type="button"
        onClick={toggleCurrency}
        aria-pressed={mode === "usd"}
        title="Mostrar precios en USD"
        className={`${baseBtn} ${sizeBtn} ${mode === "usd" ? activeCls : inactiveCls}`}
      >
        <span aria-hidden="true">💵</span>
        {isFull && <span>USD</span>}
      </button>
      {/* Bs. option */}
      <button
        type="button"
        onClick={toggleCurrency}
        aria-pressed={mode === "bs"}
        title="Mostrar precios en Bolívares"
        className={`${baseBtn} ${sizeBtn} ${mode === "bs" ? activeCls : inactiveCls}`}
      >
        <span aria-hidden="true">🇻🇪</span>
        {isFull && <span>Bs.</span>}
      </button>
    </div>
  );
}

// ─── Convenience: format a USD amount as Bs. (raw, no mode check) ────────────
// Useful for components that want to ALWAYS show the Bs. line next to a USD
// price regardless of the current mode (e.g. cart totals when in Bs. mode).
export function formatBsFromUsd(usdPrice: number, usdtRate: number): string {
  return `Bs. ${formatBs(usdPrice * usdtRate)}`;
}
