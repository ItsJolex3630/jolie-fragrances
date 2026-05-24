import { NextResponse } from 'next/server';
import { RETAIL_PRICES } from '@/lib/priceMapping';

// Cache for prices
let cachedPrices: Record<number, number | null> | null = null;
let cacheTimestamp = 0;

export async function GET(request: Request) {
  try {
    const now = Date.now();
    
    // Use cache if valid
    if (cachedPrices && (now - cacheTimestamp) < 30000) {
      return NextResponse.json({
        prices: cachedPrices,
        source: 'static',
        cached: true,
        lastUpdated: new Date(cacheTimestamp).toISOString(),
      });
    }

    const prices = { ...RETAIL_PRICES };
    cachedPrices = prices;
    cacheTimestamp = now;

    const pricedCount = Object.values(prices).filter(p => p !== null).length;

    return NextResponse.json({
      prices,
      source: 'static',
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
