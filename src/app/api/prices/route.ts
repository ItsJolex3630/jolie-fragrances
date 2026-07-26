/**
 * GET /api/prices
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns the live retail prices for every perfume in the catalog.
 *
 * Primary source: the PerfumeCatalog table in Turso (so the admin can
 * update prices/availability/discounts at runtime via /admin → Catálogo).
 * Fallback: the static RETAIL_PRICES map in src/lib/priceMapping.ts.
 *
 * Response shape (kept backward-compatible with the old static endpoint,
 * plus an optional `perfumeDetails` map added in Task 30 for BD-only
 * perfumes that don't exist in the static perfumes.ts catalog):
 *   {
 *     prices: { "3": 43, "5": 41, ... },          // USD retail price per perfumeId
 *     available: { "3": true, "5": true, ... },    // false = "No Disponible"
 *     temporalDiscount: { "3": 0, "5": 10, ... },  // 0 = no temporal discount
 *     temporalDiscountLabel: { "5": "Oferta del día", ... },
 *     perfumeDetails: {                              // BD-only perfumes (Task 30)
 *       "10001": {
 *         name, brand, gender, size, fragranticaId,
 *         concentration, brandSlug, perfumeSlug
 *       }, ...
 *     },
 *     stats: { total, priced, unpriced },
 *     source: "db" | "static",
 *     lastUpdated: ISO string
 *   }
 *
 * Cache: 15 seconds in-process memory cache (read-heavy endpoint, hit on
 * every catalog page load).
 */
import { NextResponse } from "next/server";
import { RETAIL_PRICES } from "@/lib/priceMapping";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

/**
 * Detail payload for a BD-only perfume (one that doesn't exist in the
 * static `perfumes.ts` catalog). The catalog page uses this to construct
 * a Perfume object on the client and add it to the listing.
 *
 * We only include BD perfumes whose perfumeId is NOT in the static
 * catalog — static perfumes already have all this data in perfumes.ts and
 * we don't want to clobber it.
 */
interface PerfumeDetail {
  name: string;
  brand: string;
  gender: string | null;
  size: string | null;
  fragranticaId: number | null;
  concentration: string | null;
  brandSlug: string | null;
  perfumeSlug: string | null;
}

interface CacheEntry {
  prices: Record<number, number | null>;
  available: Record<number, boolean>;
  temporalDiscount: Record<number, number>;
  temporalDiscountLabel: Record<number, string | null>;
  perfumeDetails: Record<number, PerfumeDetail>;
  stats: { total: number; priced: number; unpriced: number };
  source: "db" | "static";
  lastUpdated: string;
}

let cache: CacheEntry | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 15_000;

/**
 * Set of perfumeIds that exist in the static perfumes.ts catalog.
 *
 * Built once at module load so we can quickly decide whether a BD row
 * is a "static" perfume (price/availability override only) or a "new"
 * perfume (we need to send the full detail payload so the client can
 * construct a Perfume object). Lazy-loaded because perfumes.ts is large.
 */
let staticPerfumeIds: Set<number> | null = null;
async function getStaticPerfumeIds(): Promise<Set<number>> {
  if (staticPerfumeIds) return staticPerfumeIds;
  const { perfumes } = await import("@/lib/perfumes");
  staticPerfumeIds = new Set(perfumes.map((p) => p.id));
  return staticPerfumeIds;
}

async function readFromDb(): Promise<CacheEntry | null> {
  if (!isRawDbAvailable()) return null;
  try {
    // Only return ACTIVE rows (isActive=1). Soft-deleted perfumes (added
    // via the admin "Perfumes" tab then hidden) are excluded from the
    // storefront catalog and from /api/prices.
    const rows = await rawDb.perfumeCatalog.findActive();
    if (rows.length === 0) return null;

    const staticIds = await getStaticPerfumeIds();

    const prices: Record<number, number | null> = {};
    const available: Record<number, boolean> = {};
    const temporalDiscount: Record<number, number> = {};
    const temporalDiscountLabel: Record<number, string | null> = {};
    const perfumeDetails: Record<number, PerfumeDetail> = {};

    let priced = 0;
    for (const r of rows) {
      prices[r.perfumeId] = r.price;
      available[r.perfumeId] = r.available;
      temporalDiscount[r.perfumeId] = r.temporalDiscountPct || 0;
      temporalDiscountLabel[r.perfumeId] = r.temporalDiscountLabel;
      if (r.price !== null) priced++;

      // BD-only perfumes (not in the static catalog) get a detail payload
      // so the storefront can construct a Perfume object on the client.
      // We require at least a name + brand + fragranticaId for the entry
      // to be useful in the catalog (image + label).
      if (!staticIds.has(r.perfumeId) && r.name && r.brand && r.fragranticaId) {
        perfumeDetails[r.perfumeId] = {
          name: r.name,
          brand: r.brand,
          gender: r.gender,
          size: r.size,
          fragranticaId: r.fragranticaId,
          concentration: r.concentration,
          brandSlug: r.brandSlug,
          perfumeSlug: r.perfumeSlug,
        };
      }
    }

    return {
      prices,
      available,
      temporalDiscount,
      temporalDiscountLabel,
      perfumeDetails,
      stats: {
        total: rows.length,
        priced,
        unpriced: rows.length - priced,
      },
      source: "db",
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[prices] DB read failed, falling back to static:", err);
    return null;
  }
}

function readFromStatic(): CacheEntry {
  const prices: Record<number, number | null> = { ...RETAIL_PRICES };
  const available: Record<number, boolean> = {};
  const temporalDiscount: Record<number, number> = {};
  const temporalDiscountLabel: Record<number, string | null> = {};

  let priced = 0;
  for (const k of Object.keys(prices)) {
    const id = Number(k);
    // In static mode, treat null price as "not available" and any price
    // as available. There are no temporal discounts in the static map.
    if (prices[id] === null) {
      available[id] = false;
    } else {
      available[id] = true;
      priced++;
    }
    temporalDiscount[id] = 0;
    temporalDiscountLabel[id] = null;
  }

  return {
    prices,
    available,
    temporalDiscount,
    temporalDiscountLabel,
    perfumeDetails: {},
    stats: {
      total: Object.keys(prices).length,
      priced,
      unpriced: Object.keys(prices).length - priced,
    },
    source: "static",
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "true";

    const now = Date.now();
    if (!forceRefresh && cache && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        ...cache,
        cached: true,
      });
    }

    let entry: CacheEntry | null = null;
    if (isRawDbAvailable()) {
      entry = await readFromDb();
    }
    if (!entry) {
      entry = readFromStatic();
    }

    cache = entry;
    cacheTimestamp = now;

    return NextResponse.json({
      ...entry,
      cached: false,
    });
  } catch (error) {
    console.error("[prices] Error in GET:", error);
    // Last-resort fallback: static prices
    const fallback = readFromStatic();
    return NextResponse.json({
      ...fallback,
      cached: false,
      error: "fallback",
    });
  }
}
