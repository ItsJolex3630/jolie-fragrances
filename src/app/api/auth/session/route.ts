import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, COOKIE_NAME, verifyAdminFromDB } from '@/lib/auth'
import { addSecurityHeaders } from '@/lib/security-headers'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      ))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      ))
    }

    // Get fresh user data from DB (includes current role)
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      ))
    }

    return addSecurityHeaders(NextResponse.json({ user }, { status: 200 }))
  } catch (error) {
    console.error('Session error:', error)
    return addSecurityHeaders(NextResponse.json(
      { error: 'Error al obtener sesión' },
      { status: 500 }
    ))
  }
}
