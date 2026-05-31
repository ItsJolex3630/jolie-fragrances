/**
 * Rate Limiter — Database-backed sliding window rate limiting
 * VULNERABILITY FIX #3 & #14: Consolidated into single implementation,
 * uses database for persistence across server restarts and instances.
 */

import { db } from '@/lib/db'

export interface RateLimitOptions {
  /** Max requests per window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

/**
 * Check if a request should be rate limited using database persistence.
 * Returns { allowed: true } if under limit, { allowed: false, retryAfter } if over limit.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<{ allowed: true } | { allowed: false; retryAfter: number }> {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  try {
    // Clean up expired entries for this identifier
    await db.rateLimitEntry.deleteMany({
      where: {
        identifier,
        timestamp: { lt: windowStart },
      }
    });

    // Count entries in the current window
    const count = await db.rateLimitEntry.count({
      where: {
        identifier,
        timestamp: { gte: windowStart },
      }
    });

    if (count >= options.limit) {
      const oldestInWindow = await db.rateLimitEntry.findFirst({
        where: {
          identifier,
          timestamp: { gte: windowStart },
        },
        orderBy: { timestamp: 'asc' }
      });

      const retryAfter = oldestInWindow
        ? Math.ceil((oldestInWindow.timestamp + options.windowMs - now) / 1000)
        : Math.ceil(options.windowMs / 1000);

      return { allowed: false, retryAfter };
    }

    // Add new entry
    await db.rateLimitEntry.create({
      data: { identifier, timestamp: now }
    });

    return { allowed: true };
  } catch {
    // If DB fails, allow the request (fail open rather than blocking)
    return { allowed: true };
  }
}

// ─── Pre-configured rate limits ───

/** Auth endpoints: 5 attempts per 15 minutes per IP */
export const AUTH_RATE_LIMIT: RateLimitOptions = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
};

/** Registration: 3 accounts per hour per IP */
export const REGISTER_RATE_LIMIT: RateLimitOptions = {
  limit: 3,
  windowMs: 60 * 60 * 1000,
};

/** General API: 60 requests per minute per IP */
export const API_RATE_LIMIT: RateLimitOptions = {
  limit: 60,
  windowMs: 60 * 1000,
};

/** Admin endpoints: 20 requests per minute per IP */
export const ADMIN_RATE_LIMIT: RateLimitOptions = {
  limit: 20,
  windowMs: 60 * 1000,
};

/**
 * Extract client IP from request headers (behind reverse proxy)
 */
export function getClientIp(request: { headers: Headers }): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

/**
 * Input sanitization — removes dangerous characters from strings
 * VULNERABILITY FIX #9: Also enforces max length
 */
export function sanitizeString(input: string, maxLength: number = 200): string {
  if (input.length > maxLength) {
    input = input.slice(0, maxLength);
  }
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['";\\]/g, "") // Remove potential injection characters
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  // VULNERABILITY FIX #9: Enforce max length
  if (email.length > 254) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (min 8 chars, at least 1 uppercase, 1 number, 1 special)
 */
export function isStrongPassword(password: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  if (password.length < 8) issues.push("Mínimo 8 caracteres");
  if (password.length > 128) issues.push("Máximo 128 caracteres");
  if (!/[A-Z]/.test(password)) issues.push("Al menos una mayúscula");
  if (!/[0-9]/.test(password)) issues.push("Al menos un número");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    issues.push("Al menos un carácter especial");
  return { valid: issues.length === 0, issues };
}
