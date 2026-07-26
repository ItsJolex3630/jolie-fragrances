/**
 * /api/exchange-rates/auto-update
 * ─────────────────────────────────────────────────────────────────────────────
 * Fully automatic exchange-rate refresh. Fetches live USD→Bs. rates from
 * MULTIPLE independent sources in parallel and combines them with a median
 * (robust against any single source failing or returning an outlier).
 *
 * Sources (all queried in parallel, best-effort):
 *
 *   USDT (mercado paralelo / what people actually pay):
 *     1. https://www.usdt.com.ve/api/rates  → data.binance.buyRate
 *     2. https://www.usdt.com.ve/api/rates  → data.bybit.buyRate
 *     3. https://p2p.binance.com Binance P2P (VES/USDT BUY, top ad)
 *     4. https://ve.dolarapi.com/v1/dolares  → fuente "paralelo".promedio
 *
 *   BCV (Banco Central de Venezuela, referencia oficial):
 *     1. https://www.usdt.com.ve/api/rates  → data.bcv.rate
 *     2. https://ve.dolarapi.com/v1/dolares  → fuente "oficial".promedio
 *
 * Precision strategy:
 *   - For each currency, collect every valid numeric sample from the sources
 *     that responded OK.
 *   - Take the MEDIAN of the valid samples (not the mean — the median is
 *     immune to a single wildly-wrong source).
 *   - If only one source is available for a currency, use it directly.
 *   - If zero sources responded for a currency, preserve the existing DB
 *     value (we never overwrite with 0/null/NaN).
 *
 * Endpoints:
 *   - GET  → PUBLIC. Called by Vercel Cron every hour. Cannot authenticate.
 *   - POST → ADMIN only (requireAdmin). Used by the "Sincronizar ahora"
 *            button in the admin panel for an on-demand refresh.
 *
 * The `updatedBy` field is always set to "auto" — manual editing has been
 * removed entirely from the admin UI.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextResponse } from "next/server";
import { rawDb } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UsdtComVeResponse {
  success?: boolean;
  data?: {
    binance?: { buyRate?: number; sellRate?: number };
    bybit?: { buyRate?: number; sellRate?: number };
    bcv?: { rate?: number };
    capturedAt?: string;
  };
}

interface BinanceP2PResponse {
  data?: Array<{ adv?: { price?: string } }>;
}

interface DolarApiItem {
  moneda?: string;
  fuente?: string; // "oficial" | "paralelo" | ...
  promedio?: number;
  fechaActualizacion?: string;
}

type DolarApiResponse = DolarApiItem[];

interface SourceSample {
  source: string;
  value: number;
}

interface AutoUpdateResult {
  usdtRate: number;
  bcvRate: number;
  usdtSamples: SourceSample[];
  bcvSamples: SourceSample[];
  method: "median" | "single" | "preserved";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 8_000; // keep serverless under Vercel's 10s limit

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isValidRate(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/**
 * Median of an array of numbers. Returns NaN if the array is empty.
 * The median is robust against outliers — a single bad source can't skew it.
 */
function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Round to 2 decimals — exchange rates don't need more precision than that
 * and it keeps the DB clean.
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Source fetchers (each returns samples or throws, never crashes) ─────────

/** usdt.com.ve — gives us 3 samples at once: binance USDT, bybit USDT, BCV. */
async function fetchUsdtComVe(): Promise<{
  usdt: SourceSample[];
  bcv: SourceSample[];
}> {
  const res = await fetchWithTimeout("https://www.usdt.com.ve/api/rates", {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`usdt.com.ve HTTP ${res.status}`);
  const json = (await res.json()) as UsdtComVeResponse;
  if (!json?.success || !json.data) throw new Error("usdt.com.ve: invalid shape");

  const usdt: SourceSample[] = [];
  if (isValidRate(json.data.binance?.buyRate)) {
    usdt.push({ source: "usdt.com.ve/binance", value: json.data.binance!.buyRate! });
  }
  if (isValidRate(json.data.bybit?.buyRate)) {
    usdt.push({ source: "usdt.com.ve/bybit", value: json.data.bybit!.buyRate! });
  }
  const bcv: SourceSample[] = [];
  if (isValidRate(json.data.bcv?.rate)) {
    bcv.push({ source: "usdt.com.ve/bcv", value: json.data.bcv!.rate! });
  }
  if (usdt.length === 0 && bcv.length === 0) {
    throw new Error("usdt.com.ve: no valid rates in response");
  }
  return { usdt, bcv };
}

/** Binance P2P direct — top VES/USDT BUY ad. USDT only. */
async function fetchBinanceP2P(): Promise<SourceSample[]> {
  const res = await fetchWithTimeout(
    "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fiat: "VES",
        asset: "USDT",
        page: 1,
        rows: 5,
        tradeType: "BUY",
      }),
    }
  );
  if (!res.ok) throw new Error(`binance p2p HTTP ${res.status}`);
  const json = (await res.json()) as BinanceP2PResponse;
  // Take the median of the top 5 ads for extra stability.
  const prices = (json?.data ?? [])
    .map((d) => Number(d?.adv?.price))
    .filter(isValidRate);
  if (prices.length === 0) throw new Error("binance p2p: no valid prices");
  return [{ source: "binance_p2p", value: round2(median(prices)) }];
}

/** dolarapi.com — gives BCV (oficial) + enparalelovzla (paralelo). */
async function fetchDolarApi(): Promise<{
  usdt: SourceSample[];
  bcv: SourceSample[];
}> {
  const res = await fetchWithTimeout("https://ve.dolarapi.com/v1/dolares", {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`dolarapi HTTP ${res.status}`);
  const json = (await res.json()) as DolarApiResponse;
  if (!Array.isArray(json)) throw new Error("dolarapi: invalid shape");

  const usdt: SourceSample[] = [];
  const bcv: SourceSample[] = [];
  for (const item of json) {
    if (!isValidRate(item.promedio)) continue;
    const fuente = (item.fuente || "").toLowerCase();
    if (fuente === "paralelo" || fuente === "enparalelovzla") {
      usdt.push({ source: "dolarapi/paralelo", value: item.promedio });
    } else if (fuente === "oficial" || fuente === "bcv") {
      bcv.push({ source: "dolarapi/oficial", value: item.promedio });
    }
  }
  if (usdt.length === 0 && bcv.length === 0) {
    throw new Error("dolarapi: no usable rates");
  }
  return { usdt, bcv };
}

// ─── Core routine ────────────────────────────────────────────────────────────

/**
 * Query every source in parallel, collect samples, take the median.
 * Never throws for partial failures — only throws if ALL sources fail.
 */
async function runAutoUpdate(): Promise<AutoUpdateResult> {
  const existing = await rawDb.exchangeRate.get();
  const fallbackUsdt = existing?.usdtRate ?? 832.73;
  const fallbackBcv = existing?.bcvRate ?? 701;

  // Fire all sources in parallel. Each is wrapped so a rejection in one
  // doesn't break the others — Promise.allSettled guarantees this.
  const [usdtComVeR, binanceR, dolarApiR] = await Promise.allSettled([
    fetchUsdtComVe(),
    fetchBinanceP2P(),
    fetchDolarApi(),
  ]);

  const usdtSamples: SourceSample[] = [];
  const bcvSamples: SourceSample[] = [];

  if (usdtComVeR.status === "fulfilled") {
    usdtSamples.push(...usdtComVeR.value.usdt);
    bcvSamples.push(...usdtComVeR.value.bcv);
  } else {
    console.warn("[auto-update] usdt.com.ve failed:", usdtComVeR.reason?.message);
  }
  if (binanceR.status === "fulfilled") {
    usdtSamples.push(...binanceR.value);
  } else {
    console.warn("[auto-update] binance p2p failed:", binanceR.reason?.message);
  }
  if (dolarApiR.status === "fulfilled") {
    usdtSamples.push(...dolarApiR.value.usdt);
    bcvSamples.push(...dolarApiR.value.bcv);
  } else {
    console.warn("[auto-update] dolarapi failed:", dolarApiR.reason?.message);
  }

  // Compute final rates via median (or preserve existing if none responded).
  let usdtRate: number;
  let bcvRate: number;
  let method: "median" | "single" | "preserved";

  if (usdtSamples.length >= 2) {
    usdtRate = round2(median(usdtSamples.map((s) => s.value)));
    method = "median";
  } else if (usdtSamples.length === 1) {
    usdtRate = round2(usdtSamples[0].value);
    method = "single";
  } else {
    usdtRate = fallbackUsdt; // preserve existing
    method = "preserved";
  }

  if (bcvSamples.length >= 2) {
    bcvRate = round2(median(bcvSamples.map((s) => s.value)));
    if (method === "preserved") method = "median";
  } else if (bcvSamples.length === 1) {
    bcvRate = round2(bcvSamples[0].value);
    if (method === "preserved") method = "single";
  } else {
    bcvRate = fallbackBcv; // preserve existing
  }

  // Sanity guard: never write 0/NaN/Infinity.
  if (!isValidRate(usdtRate)) usdtRate = fallbackUsdt;
  if (!isValidRate(bcvRate)) bcvRate = fallbackBcv;

  // If EVERY source failed, throw so the caller knows nothing was updated.
  if (usdtSamples.length === 0 && bcvSamples.length === 0) {
    throw new Error(
      "Todas las fuentes externas fallaron. Se conservan las tasas existentes."
    );
  }

  return { usdtRate, bcvRate, usdtSamples, bcvSamples, method };
}

// ─── GET (public — Vercel Cron, every hour) ──────────────────────────────────

export async function GET() {
  try {
    const result = await runAutoUpdate();
    await rawDb.exchangeRate.update(result.usdtRate, result.bcvRate, "auto");
    const row = await rawDb.exchangeRate.get();
    return NextResponse.json({
      success: true,
      usdtRate: row?.usdtRate ?? result.usdtRate,
      bcvRate: row?.bcvRate ?? result.bcvRate,
      updatedAt:
        row?.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : new Date().toISOString(),
      updatedBy: "auto",
      method: result.method,
      usdtSamples: result.usdtSamples,
      bcvSamples: result.bcvSamples,
    });
  } catch (err) {
    console.error("[exchange-rates/auto-update] GET error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "No se pudieron obtener las tasas de las APIs externas.",
        detail: err instanceof Error ? err.message : "unknown error",
      },
      { status: 502 }
    );
  }
}

// ─── POST (admin only — manual trigger from the admin panel) ─────────────────

export async function POST() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: "Forbidden", reason: check.reason ?? "forbidden" },
      { status: 403 }
    );
  }

  try {
    const result = await runAutoUpdate();
    await rawDb.exchangeRate.update(result.usdtRate, result.bcvRate, "auto");
    const row = await rawDb.exchangeRate.get();
    return NextResponse.json({
      success: true,
      usdtRate: row?.usdtRate ?? result.usdtRate,
      bcvRate: row?.bcvRate ?? result.bcvRate,
      updatedAt:
        row?.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : new Date().toISOString(),
      updatedBy: "auto",
      method: result.method,
      usdtSamples: result.usdtSamples,
      bcvSamples: result.bcvSamples,
    });
  } catch (err) {
    console.error("[exchange-rates/auto-update] POST error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          "No se pudieron obtener las tasas de las APIs externas. Inténtalo de nuevo en unos minutos.",
        detail: err instanceof Error ? err.message : "unknown error",
      },
      { status: 502 }
    );
  }
}
