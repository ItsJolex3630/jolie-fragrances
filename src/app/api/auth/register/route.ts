import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateToken, COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth'
import { checkRateLimit, REGISTER_RATE_LIMIT, sanitizeString, isValidEmail, isStrongPassword, getClientIp } from '@/lib/security'
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

    // VULNERABILITY FIX #3: DB-backed rate limiting (separate limit for registration)
    const clientIp = getClientIp(request)
    const rateLimit = await checkRateLimit(`register:${clientIp}`, REGISTER_RATE_LIMIT)
    if (!rateLimit.allowed) {
      return addSecurityHeaders(NextResponse.json(
        { error: `Demasiados intentos de registro. Intenta de nuevo en ${rateLimit.retryAfter} segundos.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } }
      ))
    }

    const body = await request.json()
    const { email, password, name } = body

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

    // Validate email
    if (!isValidEmail(email)) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'Por favor, ingresa un email válido' },
        { status: 400 }
      ))
    }

    // Validate password strength
    const passwordCheck = isStrongPassword(password)
    if (!passwordCheck.valid) {
      return addSecurityHeaders(NextResponse.json(
        { error: `La contraseña no cumple los requisitos: ${passwordCheck.issues.join(', ')}` },
        { status: 400 }
      ))
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email, 254).toLowerCase()
    const sanitizedName = name ? sanitizeString(name, 50) : null

    // VULNERABILITY FIX #10: Generic error on duplicate email (prevent user enumeration)
    const existingUser = await db.user.findUnique({ where: { email: sanitizedEmail } })
    if (existingUser) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'No se pudo crear la cuenta. Intenta con datos diferentes.' },
        { status: 409 }
      ))
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const user = await db.user.create({
      data: {
        email: sanitizedEmail,
        name: sanitizedName,
        password: hashedPassword,
        role: 'user',
      },
    })

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
      { user: userData, message: 'Registro exitoso' },
      { status: 201 }
    )

    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS)
    return addSecurityHeaders(response)
  } catch (error) {
    console.error('Registration error:', error)
    return addSecurityHeaders(NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    ))
  }
}
