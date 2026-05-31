/**
 * CSRF Protection — Origin Header Verification
 *
 * Prevents Cross-Site Request Forgery by verifying that the Origin
 * header of mutating requests (POST, PUT, DELETE, PATCH) matches
 * the request's own Host (i.e., same-origin).
 *
 * This is the recommended approach for same-origin API routes:
 * - No need for CSRF tokens in cookies
 * - Works automatically with fetch() from the same origin
 * - Blocks requests from malicious third-party sites
 * - Works regardless of deployment environment (localhost, Caddy gateway, production)
 */

/**
 * Verify that the request Origin matches the Host (same-origin check).
 * Call this at the start of any mutating API handler (POST, PUT, DELETE, PATCH).
 *
 * Returns null if origin is valid, or an error message if invalid.
 */
export function verifyOrigin(request: Request): string | null {
  const method = request.method.toUpperCase();

  // Only check mutating methods — GET/HEAD/OPTIONS are safe
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return null;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // If no origin header and no referer, this could be:
  // - A non-browser client (curl, Postman, etc.)
  // - An older browser
  // - A server-side request
  // Allow these in development; in production, you may want to reject them
  if (!origin && !referer) {
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return "Solicitud no autorizada — falta header de origen";
  }

  // Determine the expected host from the request
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";

  // Determine the expected protocol
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProto || (host.startsWith("localhost") ? "http" : "https");

  // Build the expected origin
  const expectedOrigin = `${protocol}://${host}`;

  // Check Origin header against the request's own host
  if (origin) {
    // The origin must match our own host (same-origin policy)
    if (origin === expectedOrigin) {
      return null;
    }
    // Also allow if origin matches alternative common forms
    const altOrigins = [
      expectedOrigin,
      `http://${host}`,
      `https://${host}`,
    ];
    if (altOrigins.includes(origin)) {
      return null;
    }
    return "Solicitud no autorizada — origen no permitido";
  }

  // Fallback: Check Referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      const altOrigins = [
        expectedOrigin,
        `http://${host}`,
        `https://${host}`,
      ];
      if (altOrigins.includes(refererOrigin)) {
        return null;
      }
      return "Solicitud no autorizada — referer no permitido";
    } catch {
      return "Solicitud no autorizada — referer inválido";
    }
  }

  return null;
}
