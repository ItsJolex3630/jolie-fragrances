import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

// VULNERABILITY FIX #1 & #6: No hardcoded fallback, JWT_SECRET must be in env
const JWT_SECRET = process.env.JWT_SECRET!
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Set it in .env')
}

// VULNERABILITY FIX #5: Reduced token expiry from 7 days to 24 hours
const JWT_EXPIRES_IN = '24h'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// VULNERABILITY FIX #5: Check token revocation list on every verify
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    if (!payload.userId) return null

    // Check if token has been revoked (logged out)
    const revoked = await db.revokedToken.findUnique({
      where: { tokenJti: `${payload.userId}-${payload.iat}` }
    })
    if (revoked) return null

    return payload
  } catch {
    return null
  }
}

// VULNERABILITY FIX #5: Revoke token on logout
export async function revokeToken(token: string): Promise<void> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    if (payload.userId && payload.iat) {
      await db.revokedToken.upsert({
        where: { tokenJti: `${payload.userId}-${payload.iat}` },
        update: {},
        create: {
          tokenJti: `${payload.userId}-${payload.iat}`,
          expiresAt: new Date((payload.exp || 0) * 1000),
        }
      })
    }
  } catch {
    // Token already invalid, nothing to revoke
  }
}

// VULNERABILITY FIX #4: Verify admin role from DB, not from JWT
export async function verifyAdminFromDB(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  return user?.role === 'admin'
}

export const COOKIE_NAME = 'jolie-auth-token'
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  // VULNERABILITY FIX #11: Use 'strict' for auth cookies
  sameSite: 'strict' as const,
  path: '/',
  // Reduced from 7 days to 24 hours
  maxAge: 86400, // 24 hours in seconds
}
