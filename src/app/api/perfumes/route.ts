import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, COOKIE_NAME, verifyAdminFromDB } from '@/lib/auth'
import { perfumes as staticPerfumes, PERFUME_NOTES } from '@/lib/perfumes'
import { checkRateLimit, ADMIN_RATE_LIMIT, getClientIp, sanitizeString } from '@/lib/security'
import { verifyOrigin } from '@/lib/csrf'
import { addSecurityHeaders } from '@/lib/security-headers'

// ─── Helper: verify admin from DB (not JWT) ───
async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  // VULNERABILITY FIX #4: Verify role from DB
  const isAdmin = await verifyAdminFromDB(payload.userId)
  if (!isAdmin) return null
  return payload
}

// ─── GET /api/perfumes — List all perfumes (from DB, fallback to static) ───
export async function GET(req: NextRequest) {
  try {
    const dbCount = await db.perfume.count()

    if (dbCount > 0) {
      const dbPerfumes = await db.perfume.findMany({ orderBy: { id: "asc" } })

      return addSecurityHeaders(NextResponse.json({
        perfumes: dbPerfumes.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          gender: p.gender,
          size: p.size,
          price: p.price,
          fragranticaId: p.fragranticaId,
          brandSlug: p.brandSlug,
          perfumeSlug: p.perfumeSlug,
          fragranticaSearchUrl: p.fragranticaSearchUrl,
          notes: p.notes ? p.notes.split(",").map((n) => n.trim()) : [],
        })),
        source: "database",
        count: dbPerfumes.length,
      }))
    }

    // No DB perfumes — return from static file
    return addSecurityHeaders(NextResponse.json({
      perfumes: staticPerfumes.map((p) => ({
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
      })),
      source: "static",
      count: staticPerfumes.length,
    }))
  } catch (error) {
    console.error('Error fetching perfumes:', error)
    return addSecurityHeaders(NextResponse.json({
      perfumes: staticPerfumes.map((p) => ({
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
      })),
      source: "static-fallback",
      count: staticPerfumes.length,
    }))
  }
}

// ─── POST /api/perfumes — Add a new perfume (admin only) ───
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return addSecurityHeaders(NextResponse.json(
      { error: "No autorizado — se requieren permisos de administrador" },
      { status: 403 }
    ))
  }

  // VULNERABILITY FIX #12: CSRF protection
  const csrfError = verifyOrigin(req)
  if (csrfError) {
    return addSecurityHeaders(NextResponse.json({ error: csrfError }, { status: 403 }))
  }

  // VULNERABILITY FIX #3: Rate limiting
  const clientIp = getClientIp(req)
  const rateLimit = await checkRateLimit(`admin:${clientIp}`, ADMIN_RATE_LIMIT)
  if (!rateLimit.allowed) {
    return addSecurityHeaders(NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${rateLimit.retryAfter}s.` },
      { status: 429 }
    ))
  }

  try {
    const body = await req.json()
    const { id, name, brand, gender, size, price, fragranticaId, brandSlug, perfumeSlug, fragranticaSearchUrl, notes } = body

    if (!name || !brand || !gender || !fragranticaId) {
      return addSecurityHeaders(NextResponse.json(
        { error: "Faltan campos obligatorios: name, brand, gender, fragranticaId" },
        { status: 400 }
      ))
    }

    // VULNERABILITY FIX #9: Input length limits
    if (String(name).length > 200 || String(brand).length > 100) {
      return addSecurityHeaders(NextResponse.json(
        { error: "Los campos de texto son demasiado largos" },
        { status: 400 }
      ))
    }

    // Auto-generate ID if not provided
    const perfumeId = id ? Number(id) : undefined
    if (perfumeId) {
      const existing = await db.perfume.findUnique({ where: { id: perfumeId } })
      if (existing) {
        return addSecurityHeaders(NextResponse.json(
          { error: `Ya existe un perfume con ID ${perfumeId}` },
          { status: 409 }
        ))
      }
    }

    // Auto-generate slugs if not provided
    const finalBrandSlug = brandSlug || sanitizeString(brand, 100).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    const finalPerfumeSlug = perfumeSlug || sanitizeString(name, 200).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    // Get next available ID if not specified
    let finalId = perfumeId
    if (!finalId) {
      const maxId = await db.perfume.aggregate({ _max: { id: true } })
      finalId = (maxId._max.id || 0) + 1
    }

    const perfume = await db.perfume.create({
      data: {
        id: finalId,
        name: sanitizeString(name, 200),
        brand: sanitizeString(brand, 100),
        gender,
        size: size || "100ml",
        price: price ? Number(price) : 0,
        fragranticaId: Number(fragranticaId),
        brandSlug: finalBrandSlug,
        perfumeSlug: finalPerfumeSlug,
        fragranticaSearchUrl: fragranticaSearchUrl || `https://www.fragrantica.es/search/?query=${encodeURIComponent(String(name).slice(0, 100))}`,
        notes: notes ? (Array.isArray(notes) ? notes.join(",") : String(notes).slice(0, 500)) : null,
      },
    })

    return addSecurityHeaders(NextResponse.json(
      { message: "Perfume añadido correctamente", perfume },
      { status: 201 }
    ))
  } catch (error) {
    console.error('Error adding perfume:', error)
    return addSecurityHeaders(NextResponse.json(
      { error: "Error al añadir el perfume" },
      { status: 500 }
    ))
  }
}

// ─── PUT /api/perfumes — Update an existing perfume (admin only) ───
export async function PUT(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return addSecurityHeaders(NextResponse.json(
      { error: "No autorizado — se requieren permisos de administrador" },
      { status: 403 }
    ))
  }

  // VULNERABILITY FIX #12: CSRF protection
  const csrfError = verifyOrigin(req)
  if (csrfError) {
    return addSecurityHeaders(NextResponse.json({ error: csrfError }, { status: 403 }))
  }

  try {
    const body = await req.json()
    const { id, name, brand, gender, size, price, fragranticaId, brandSlug, perfumeSlug, fragranticaSearchUrl, notes } = body

    if (!id) {
      return addSecurityHeaders(NextResponse.json(
        { error: "Se requiere el ID del perfume a actualizar" },
        { status: 400 }
      ))
    }

    const existing = await db.perfume.findUnique({ where: { id: Number(id) } })
    if (!existing) {
      return addSecurityHeaders(NextResponse.json(
        { error: `No existe un perfume con ID ${id}` },
        { status: 404 }
      ))
    }

    // Build update data with only provided fields, with length limits
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = sanitizeString(String(name), 200)
    if (brand !== undefined) updateData.brand = sanitizeString(String(brand), 100)
    if (gender !== undefined) updateData.gender = gender
    if (size !== undefined) updateData.size = size
    if (price !== undefined) updateData.price = Number(price)
    if (fragranticaId !== undefined) updateData.fragranticaId = Number(fragranticaId)
    if (brandSlug !== undefined) updateData.brandSlug = brandSlug
    if (perfumeSlug !== undefined) updateData.perfumeSlug = perfumeSlug
    if (fragranticaSearchUrl !== undefined) updateData.fragranticaSearchUrl = fragranticaSearchUrl
    if (notes !== undefined) {
      updateData.notes = Array.isArray(notes) ? notes.join(",").slice(0, 500) : (notes || null)
    }

    const perfume = await db.perfume.update({
      where: { id: Number(id) },
      data: updateData,
    })

    return addSecurityHeaders(NextResponse.json({
      message: "Perfume actualizado correctamente",
      perfume,
    }))
  } catch (error) {
    console.error('Error updating perfume:', error)
    return addSecurityHeaders(NextResponse.json(
      { error: "Error al actualizar el perfume" },
      { status: 500 }
    ))
  }
}

// ─── DELETE /api/perfumes — Delete individual perfume only (admin only) ───
// VULNERABILITY FIX #7: Removed "delete all" functionality
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin(req)
  if (!admin) {
    return addSecurityHeaders(NextResponse.json(
      { error: "No autorizado — se requieren permisos de administrador" },
      { status: 403 }
    ))
  }

  // VULNERABILITY FIX #12: CSRF protection
  const csrfError = verifyOrigin(req)
  if (csrfError) {
    return addSecurityHeaders(NextResponse.json({ error: csrfError }, { status: 403 }))
  }

  try {
    const { searchParams } = new URL(req.url)
    const perfumeId = searchParams.get("id")

    // VULNERABILITY FIX #7: Require ID for deletion — no more "delete all"
    if (!perfumeId) {
      return addSecurityHeaders(NextResponse.json(
        { error: "Se requiere el ID del perfume a eliminar. La eliminación masiva no está disponible." },
        { status: 400 }
      ))
    }

    const id = Number(perfumeId)
    const existing = await db.perfume.findUnique({ where: { id } })
    if (!existing) {
      return addSecurityHeaders(NextResponse.json(
        { error: `No existe un perfume con ID ${id}` },
        { status: 404 }
      ))
    }

    // Delete associated favorites first
    await db.favorite.deleteMany({ where: { perfumeId: id } })
    await db.perfume.delete({ where: { id } })

    return addSecurityHeaders(NextResponse.json({
      message: "Perfume eliminado correctamente",
      deleted: { id, name: existing.name },
    }))
  } catch (error) {
    console.error('Error deleting perfume:', error)
    return addSecurityHeaders(NextResponse.json(
      { error: "Error al eliminar perfume" },
      { status: 500 }
    ))
  }
}
