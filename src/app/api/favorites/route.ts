import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { addSecurityHeaders } from '@/lib/security-headers'
import { verifyOrigin } from '@/lib/csrf'

async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true },
  })

  return user
}

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      ))
    }

    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      select: { id: true, perfumeId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    return addSecurityHeaders(NextResponse.json(
      { favorites: favorites.map((f) => f.perfumeId) },
      { status: 200 }
    ))
  } catch (error) {
    console.error('Get favorites error:', error)
    return addSecurityHeaders(NextResponse.json(
      { error: 'Error al obtener favoritos' },
      { status: 500 }
    ))
  }
}

// POST /api/favorites - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      ))
    }

    // VULNERABILITY FIX #12: CSRF protection
    const csrfError = verifyOrigin(request)
    if (csrfError) {
      return addSecurityHeaders(NextResponse.json({ error: csrfError }, { status: 403 }))
    }

    const body = await request.json()
    const { perfumeId } = body

    if (typeof perfumeId !== 'number' || !Number.isInteger(perfumeId)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'ID de perfume inválido' },
        { status: 400 }
      ))
    }

    await db.favorite.upsert({
      where: {
        userId_perfumeId: {
          userId: user.id,
          perfumeId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        perfumeId,
      },
    })

    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      select: { perfumeId: true },
      orderBy: { createdAt: 'desc' },
    })

    return addSecurityHeaders(NextResponse.json(
      { favorites: favorites.map((f) => f.perfumeId) },
      { status: 200 }
    ))
  } catch (error) {
    console.error('Add favorite error:', error)
    return addSecurityHeaders(NextResponse.json(
      { error: 'Error al agregar a favoritos' },
      { status: 500 }
    ))
  }
}

// DELETE /api/favorites - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      ))
    }

    // VULNERABILITY FIX #12: CSRF protection
    const csrfError = verifyOrigin(request)
    if (csrfError) {
      return addSecurityHeaders(NextResponse.json({ error: csrfError }, { status: 403 }))
    }

    const body = await request.json()
    const { perfumeId } = body

    if (typeof perfumeId !== 'number' || !Number.isInteger(perfumeId)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'ID de perfume inválido' },
        { status: 400 }
      ))
    }

    await db.favorite.deleteMany({
      where: {
        userId: user.id,
        perfumeId,
      },
    })

    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      select: { perfumeId: true },
      orderBy: { createdAt: 'desc' },
    })

    return addSecurityHeaders(NextResponse.json(
      { favorites: favorites.map((f) => f.perfumeId) },
      { status: 200 }
    ))
  } catch (error) {
    console.error('Remove favorite error:', error)
    return addSecurityHeaders(NextResponse.json(
      { error: 'Error al eliminar de favoritos' },
      { status: 500 }
    ))
  }
}
