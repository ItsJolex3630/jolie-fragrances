import { NextResponse } from 'next/server';
import {
  PRICE_REPO,
  DEFAULT_MARGIN_PERCENT,
  FALLBACK_WHOLESALE_PRICES,
  calculateRetailPrice,
  buildListaPriceLookup,
  resolveWholesalePrice,
  type ListaPriceEntry,
} from '@/lib/priceMapping';

// Cache for prices (refresh every 30 minutes)
let cachedPrices: Record<number, number | null> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Parse the TypeScript file content from Lista-de-Precios repo.
 * The file has entries like:
 *   { id: 1, name: "YARA ELIXIR", volume: "100ML", gender: "DAMA", wholesale: 39 },
 *   { id: 72, name: "QIMMAH", volume: "100ML", gender: "CABALLERO", wholesale: null },
 */
function parseTypeScriptPrices(tsContent: string): ListaPriceEntry[] {
  const entries: ListaPriceEntry[] = [];

  // Match each object entry in the array: { id: N, name: "...", volume: "...", gender: "...", wholesale: N | null }
  const entryRegex = /\{\s*id:\s*(\d+),\s*name:\s*"([^"]+)",\s*volume:\s*"([^"]*)",\s*gender:\s*"[^"]+",\s*wholesale:\s*(null|\d+(?:\.\d+)?)\s*\}/g;

  let match;
  while ((match = entryRegex.exec(tsContent)) !== null) {
    const id = parseInt(match[1], 10);
    const name = match[2];
    const wholesaleRaw = match[4];

    const volume = match[3]; // Extract volume field for disambiguation

    entries.push({
      id,
      name,
      volume: volume || undefined, // Include volume for volume-aware matching
      wholesale: wholesaleRaw === 'null' ? null : parseFloat(wholesaleRaw),
    });
  }

  return entries;
}

/**
 * Fetch prices from GitHub private repo using PAT.
 * Reads the TypeScript source file directly and parses it.
 */
async function fetchPricesFromGitHub(): Promise<ListaPriceEntry[] | null> {
  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    console.log('[prices] No GITHUB_PAT env var, using fallback prices');
    return null;
  }

  try {
    const url = `https://api.github.com/repos/${PRICE_REPO.owner}/${PRICE_REPO.repo}/contents/${PRICE_REPO.path}?ref=${PRICE_REPO.branch}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Accept': 'application/vnd.github.v3.raw', // Get raw file content
        'User-Agent': 'JolieFragrances-PriceSync',
      },
      next: { revalidate: 1800 }, // Cache for 30 min at Next.js level
    });

    if (!response.ok) {
      console.error(`[prices] GitHub API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const tsContent = await response.text();

    // Parse TypeScript file to extract price entries
    const entries = parseTypeScriptPrices(tsContent);

    if (entries.length > 0) {
      console.log(`[prices] Parsed ${entries.length} price entries from GitHub TypeScript file`);
      return entries;
    }

    // Fallback: try to parse as JSON (for backward compatibility with prices.json)
    try {
      const jsonData = JSON.parse(tsContent);
      if (Array.isArray(jsonData)) {
        return jsonData as ListaPriceEntry[];
      }
    } catch {
      // Not JSON, that's fine
    }

    console.error('[prices] Could not parse price data from GitHub file');
    return null;
  } catch (error) {
    console.error('[prices] Error fetching from GitHub:', error);
    return null;
  }
}

/**
 * Build the price map: Jolie perfume ID → retail price (with markup applied)
 */
async function buildRetailPriceMap(marginPercent?: number): Promise<Record<number, number | null>> {
  const margin = marginPercent ?? DEFAULT_MARGIN_PERCENT;
  const listaPrices = await fetchPricesFromGitHub();

  if (listaPrices) {
    const lookup = buildListaPriceLookup(listaPrices);
    const result: Record<number, number | null> = {};

    // Build prices for all known Jolie IDs
    for (const jolieIdStr of Object.keys(FALLBACK_WHOLESALE_PRICES)) {
      const jolieId = parseInt(jolieIdStr, 10);
      const wholesale = resolveWholesalePrice(jolieId, lookup);
      result[jolieId] = calculateRetailPrice(wholesale, margin);
    }

    return result;
  }

  // Fallback: use static prices
  const result: Record<number, number | null> = {};
  for (const [jolieIdStr, wholesale] of Object.entries(FALLBACK_WHOLESALE_PRICES)) {
    const jolieId = parseInt(jolieIdStr, 10);
    result[jolieId] = calculateRetailPrice(wholesale, margin);
  }

  return result;
}

export async function GET(request: Request) {
  try {
    // Check URL params for margin override
    const { searchParams } = new URL(request.url);
    const marginParam = searchParams.get('margin');
    const margin = marginParam ? parseInt(marginParam, 10) : DEFAULT_MARGIN_PERCENT;
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Use cache if valid and no forced refresh
    const now = Date.now();
    if (cachedPrices && !forceRefresh && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json({
        prices: cachedPrices,
        margin,
        source: 'cache',
        cached: true,
        lastUpdated: new Date(cacheTimestamp).toISOString(),
      });
    }

    const prices = await buildRetailPriceMap(margin);
    cachedPrices = prices;
    cacheTimestamp = now;

    const pricedCount = Object.values(prices).filter(p => p !== null).length;

    return NextResponse.json({
      prices,
      margin,
      source: 'github-api',
      cached: false,
      lastUpdated: new Date(now).toISOString(),
      stats: {
        total: Object.keys(prices).length,
        priced: pricedCount,
        unpriced: Object.keys(prices).length - pricedCount,
      },
    });
  } catch (error) {
    console.error('[prices] Error in GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener precios' },
      { status: 500 }
    );
  }
}
