import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * src/lib/adminAuth.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared admin-access helpers for the /admin panel and its API routes.
 *
 * Access policy:
 *   - ONLY `ADMIN_EMAIL` may access /admin or any /api/admin/* endpoint.
 *   - The Google login IS the authentication (no extra password).
 *   - Anyone else (including unauthenticated users) gets a 403 from API
 *     routes and is redirected to "/" from the page.
 *
 * `ADMIN_EMAIL` is hardcoded on purpose — adding a DB lookup would create a
 * chicken-and-egg problem if the DB is down, and the admin must ALWAYS be
 * able to log in to fix things.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ADMIN_EMAIL = "joelmedina2009@gmail.com";

/**
 * Result of an admin access check.
 *  - `ok: true`  → caller is the admin; `email` is set.
 *  - `ok: false` → caller is NOT the admin (or not logged in); API routes
 *                  should return 403 and pages should redirect to "/".
 */
export interface AdminCheckResult {
  ok: boolean;
  email: string | null;
  reason?: "unauthenticated" | "forbidden";
}

/**
 * Check the current NextAuth session against ADMIN_EMAIL.
 *
 * Use this in API routes (`/api/admin/*`) — it does NOT redirect, it just
 * returns a structured result so the route handler can decide how to respond
 * (typically 403 JSON).
 *
 * Usage:
 *   const check = await requireAdmin();
 *   if (!check.ok) {
 *     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 *   }
 */
export async function requireAdmin(): Promise<AdminCheckResult> {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.trim().toLowerCase() || null;

    if (!email) {
      return { ok: false, email: null, reason: "unauthenticated" };
    }
    if (email !== ADMIN_EMAIL.toLowerCase()) {
      return { ok: false, email, reason: "forbidden" };
    }
    return { ok: true, email };
  } catch (err) {
    console.error("[adminAuth] session check error:", err);
    return { ok: false, email: null, reason: "unauthenticated" };
  }
}

/**
 * Server-side helper to check an arbitrary email against ADMIN_EMAIL.
 * Useful when we already have the email from somewhere else (e.g. a JWT
 * token in middleware) and don't want to re-fetch the session.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
