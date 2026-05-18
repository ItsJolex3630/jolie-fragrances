import { NextResponse } from 'next/server'
import { perfumes, PERFUME_NOTES } from '@/lib/perfumes'

export async function GET() {
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
