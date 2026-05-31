import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, COOKIE_NAME, verifyAdminFromDB } from '@/lib/auth'
import { addSecurityHeaders } from '@/lib/security-headers'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return addSecurityHeaders(NextResponse.json({ error: 'No autenticado' }, { status: 401 }))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return addSecurityHeaders(NextResponse.json({ error: 'Token inválido' }, { status: 401 }))
    }

    // VULNERABILITY FIX #4: Check admin role from DB, not JWT
    const isAdmin = await verifyAdminFromDB(payload.userId)
    if (!isAdmin) {
      return addSecurityHeaders(NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 }))
    }

    // Get all users (without passwords)
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return addSecurityHeaders(NextResponse.json({ users }, { status: 200 }))
  } catch (error) {
    console.error('Admin users error:', error)
    return addSecurityHeaders(NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 }))
  }
}
