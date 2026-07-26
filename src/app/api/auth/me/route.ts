import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

/**
 * GET /api/auth/me
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns the current session user + their banned status from the DB.
 *
 * Why this exists:
 *   NextAuth's `signIn` callback rejects banned users at login time, but a
 *   user can be banned AFTER they already have a valid session (e.g. the
 *   admin bans them while they're browsing). Their existing JWT session
 *   cookie is still valid until it expires, so the client needs a way to
 *   detect the ban and show a "cuenta suspendida" message instead of the
 *   normal UI.
 *
 *   This endpoint is that check: the client polls it on page load and, if
 *   `banned: true`, hides the normal content and shows a suspension notice.
 *
 * Response shape:
 *   - Not authenticated:
 *       { authenticated: false }
 *   - Authenticated + DB unavailable (fail open — don't lock users out
 *     during a DB outage):
 *       { authenticated: true, email, banned: false, dbAvailable: false }
 *   - Authenticated + DB available:
 *       { authenticated: true, email, banned, bannedReason, dbAvailable: true }
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ authenticated: false });
    }

    const email = session.user.email.trim().toLowerCase();

    // DB unavailable — fail open (don't block the user during a DB outage)
    if (!isRawDbAvailable()) {
      return NextResponse.json({
        authenticated: true,
        email,
        banned: false,
        bannedReason: null,
        dbAvailable: false,
      });
    }

    const user = await rawDb.user.findUniqueByEmail(email);

    // User not in DB yet (e.g. logged in via Google but hasn't visited
    // /predicciones to register) — treat as not banned.
    if (!user) {
      return NextResponse.json({
        authenticated: true,
        email,
        banned: false,
        bannedReason: null,
        dbAvailable: true,
        registered: false,
      });
    }

    return NextResponse.json({
      authenticated: true,
      email,
      banned: user.banned,
      bannedReason: user.bannedReason,
      dbAvailable: true,
      registered: true,
    });
  } catch (err) {
    console.error("[/api/auth/me] Error:", err);
    // On unexpected errors, fail open — don't block the user.
    return NextResponse.json(
      { authenticated: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
