import { NextResponse } from "next/server";

/**
 * Add security headers to an API response.
 *
 * These headers protect against common web vulnerabilities:
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-XSS-Protection: Enables browser XSS filter
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Restricts browser features
 *
 * Note: We don't use a global middleware because Next.js 16 deprecated
 * the middleware file convention and it caused issues with the sandbox
 * preview iframe. Instead, we apply security headers at the API level
 * where they matter most.
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}
