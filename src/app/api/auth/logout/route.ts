import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, COOKIE_OPTIONS, revokeToken } from '@/lib/auth'
import { addSecurityHeaders } from '@/lib/security-headers'

export async function POST(request: NextRequest) {
  try {
    // VULNERABILITY FIX #5: Revoke the JWT token on logout
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (token) {
      await revokeToken(token)
    }

    const response = NextResponse.json(
      { message: 'Sesión cerrada exitosamente' },
      { status: 200 }
    )

    // VULNERABILITY FIX #11: Consistent secure flag with login
    response.cookies.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    })

    return addSecurityHeaders(response)
  } catch (error) {
    console.error('Logout error:', error)
    return addSecurityHeaders(NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    ))
  }
}
