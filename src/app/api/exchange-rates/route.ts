/**
 * /api/exchange-rates
 * ─────────────────────────────────────────────────────────────────────────────
 * Public GET → { usdtRate, bcvRate, updatedAt, updatedBy, fallback, stale }
 *
 * Stale-while-revalidate:
 *   If the stored rates are older than STALE_AFTER_MS (15 min), this endpoint
 *   fires a background auto-update (non-blocking) so the NEXT request sees
 *   fresh data. The current request still returns immediately with whatever
 *   is in the DB — the user never waits on external APIs.
 *
 * Manual editing has been REMOVED. Rates are 100% automatic via:
 *   - Vercel Cron (every hour) → GET /api/exchange-rates/auto-update
 *   - Background revalidation here (when data goes stale)
 *   - Admin "Sincronizar ahora" button → POST /api/exchange-rates/auto-update
 *
 * Fallbacks (when DB unavailable): usdtRate=832.73, bcvRate=701.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextResponse } from "next/server";
import { rawDb } from "@/lib/dbClient";

// ─── Config ──────────────────────────────────────────────────────────────────

const FALLBACK_USDT_RATE = 832.73;
const FALLBACK_BCV_RATE = 701;
const FALLBACK_UPDATED_AT = new Date(0).toISOString(); // epoch = "unknown"

/** How long before stored rates are considered "stale" and trigger a
 *  background refresh. 15 min keeps rates fresh without hammering sources. */
const STALE_AFTER_MS = 15 * 60 * 1000;

/** In-memory throttle so we don't fire more than one background refresh per
 *  window. Reset by Vercel when the serverless instance cold-starts. */
let lastBackgroundRefreshAt = 0;
const BACKGROUND_REFRESH_THROTTLE_MS = 5 * 60 * 1000; // 5 min

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function toFinite(n: unknown, fallback: number): number {
  return isFiniteNumber(n) ? n : fallback;
}

/**
 * Fire-and-forget background refresh. Catches its own errors so it can never
 * crash the caller. Uses a throttle to avoid spawning duplicate refreshes.
 */
function triggerBackgroundRefresh(req?: Request): void {
  const now = Date.now();
  if (now - lastBackgroundRefreshAt < BACKGROUND_REFRESH_THROTTLE_MS) {
    return; // a refresh was triggered recently — skip
  }
  lastBackgroundRefreshAt = now;

  // fire-and-forget — do NOT await.
  void (async () => {
    try {
      const protocol = req?.headers.get("x-forwarded-proto") || "https";
      const host = req?.headers.get("host") || "localhost:3000";
      const baseUrl = process.env.NEXT_PUBLIC_URL || `${protocol}://${host}`;
      
      await fetch(
        `${baseUrl}/api/exchange-rates/auto-update`,
        { method: "GET" }
      );
    } catch (err) {
      console.warn("[exchange-rates] background refresh failed:", err);
    }
  })();
}

// ─── GET (public, with stale-while-revalidate) ───────────────────────────────

export async function GET(req: Request) {
  try {
    const row = await rawDb.exchangeRate.get();
    if (!row) {
      // No row yet (DB available but never seeded) → seed it now in the
      // background and return fallbacks immediately.
      triggerBackgroundRefresh(req);
      return NextResponse.json({
        usdtRate: FALLBACK_USDT_RATE,
        bcvRate: FALLBACK_BCV_RATE,
        updatedAt: FALLBACK_UPDATED_AT,
        updatedBy: null,
        fallback: true,
        stale: true,
      });
    }

    const updatedAtDate =
      row.updatedAt instanceof Date
        ? row.updatedAt
        : new Date(row.updatedAt as unknown as string);
    const ageMs = Date.now() - (isNaN(updatedAtDate.getTime()) ? 0 : updatedAtDate.getTime());
    const isStale = ageMs > STALE_AFTER_MS;

    if (isStale) {
      // Non-blocking refresh — current response returns the stale value,
      // next request (within ~10s) will see the freshly fetched one.
      triggerBackgroundRefresh(req);
    }

    return NextResponse.json({
      usdtRate: toFinite(row.usdtRate, FALLBACK_USDT_RATE),
      bcvRate: toFinite(row.bcvRate, FALLBACK_BCV_RATE),
      updatedAt: isNaN(updatedAtDate.getTime())
        ? FALLBACK_UPDATED_AT
        : updatedAtDate.toISOString(),
      updatedBy: row.updatedBy ?? null,
      fallback: false,
      stale: isStale,
    });
  } catch (err) {
    console.error("[exchange-rates] GET error:", err);
    return NextResponse.json({
      usdtRate: FALLBACK_USDT_RATE,
      bcvRate: FALLBACK_BCV_RATE,
      updatedAt: FALLBACK_UPDATED_AT,
      updatedBy: null,
      fallback: true,
      stale: true,
    });
  }
}

// ─── PUT removed — manual editing is no longer supported ─────────────────────
//
// Rates are 100% automatic. To force a refresh, an admin uses the
// "Sincronizar ahora" button which calls POST /api/exchange-rates/auto-update.
//
// We export a 405 handler so any old callers get a clear message instead of
// a generic 404.
export async function PUT() {
  return NextResponse.json(
    {
      error:
        "La edición manual de tasas ha sido deshabilitada. Las tasas se actualizan automáticamente cada hora y bajo demanda.",
    },
    { status: 405, headers: { Allow: "GET" } }
  );
}
