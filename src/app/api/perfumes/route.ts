import { NextResponse } from 'next/server'
import { perfumes, PERFUME_NOTES } from '@/lib/perfumes'

// Rate limiter en memoria simple para evitar scraping
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 30; // Máximo 30 peticiones por minuto por IP
const WINDOW_MS = 60 * 1000;

export async function GET(request: Request) {
  // Lógica de Rate Limiting
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const now = Date.now();
  
  const record = rateLimit.get(ip);
  if (record) {
    if (now > record.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    } else {
      record.count++;
      if (record.count > MAX_REQUESTS) {
        return NextResponse.json(
          { error: "Demasiadas peticiones. Por favor, intenta de nuevo en 1 minuto." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    }
  } else {
    rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS });
  }

  try {
    return NextResponse.json({
      perfumes: perfumes.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        gender: p.gender,
        size: p.size,
        price: 0,
        fragranticaId: p.fragranticaId,
        brandSlug: p.brandSlug,
        perfumeSlug: p.perfumeSlug,
        fragranticaSearchUrl: p.fragranticaSearchUrl || null,
        notes: PERFUME_NOTES[p.id] || [],
        available: p.available !== false,
        concentration: p.concentration || null,
      })),
      source: "static",
      count: perfumes.length,
    })
  } catch (error) {
    console.error('Error fetching perfumes:', error)
    return NextResponse.json(
      { error: "Error al obtener perfumes" },
      { status: 500 }
    )
  }
}
