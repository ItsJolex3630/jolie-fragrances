import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, generateToken, COOKIE_NAME, COOKIE_OPTIONS, verifyAdminFromDB } from '@/lib/auth'
import { checkRateLimit, AUTH_RATE_LIMIT, sanitizeString, isValidEmail, getClientIp } from '@/lib/security'
import { verifyOrigin } from '@/lib/csrf'
import { addSecurityHeaders } from '@/lib/security-headers'

export async function POST(request: NextRequest) {
  try {
    // VULNERABILITY FIX #12: CSRF protection
    const csrfError = verifyOrigin(request)
    if (csrfError) {
      return addSecurityHeaders(NextResponse.json(
        { error: csrfError },
        { status: 403 }
      ))
    }

    // VULNERABILITY FIX #3: DB-backed rate limiting
    const clientIp = getClientIp(request)
    const rateLimit = await checkRateLimit(`login:${clientIp}`, AUTH_RATE_LIMIT)
    if (!rateLimit.allowed) {
      return addSecurityHeaders(NextResponse.json(
        { error: `Demasiados intentos. Intenta de nuevo en ${rateLimit.retryAfter} segundos.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      ))
    }

    const body = await request.json()
    const { email, password } = body

    // VULNERABILITY FIX #9: Input length limits
    if (!email || !password) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      ))
    }

    if (email.length > 254 || password.length > 128) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Datos de entrada demasiado largos' },
        { status: 400 }
      ))
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      ))
    }

    // Sanitize email
    const sanitizedEmail = sanitizeString(email, 254).toLowerCase()

    // Find user
    const user = await db.user.findUnique({ where: { email: sanitizedEmail } })
    if (!user) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      ))
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      ))
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Create response with user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    }

    const response = NextResponse.json(
      { user: userData, message: 'Inicio de sesión exitoso' },
      { status: 200 }
    )

    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS)
    return addSecurityHeaders(response)
  } catch (error) {
    console.error('Login error:', error)
    return addSecurityHeaders(NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    ))
  }
}
