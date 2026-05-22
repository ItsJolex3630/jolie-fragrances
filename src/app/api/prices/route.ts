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
 * Fetch prices from GitHub private repo using PAT
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
        'Accept': 'application/vnd.github.v3.raw',
        'User-Agent': 'JolieFragrances-PriceSync',
      },
      next: { revalidate: 1800 }, // Cache for 30 min at Next.js level
    });

    if (!response.ok) {
      console.error(`[prices] GitHub API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data as ListaPriceEntry[];
    }
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
