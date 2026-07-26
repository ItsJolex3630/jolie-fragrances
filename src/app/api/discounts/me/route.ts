import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

/**
 * GET /api/discounts/me
 * Returns the authenticated user's discount codes (5% / 10% from predictions).
 * Uses NextAuth session to identify the user by email, then looks up their
 * User record + DiscountCodes in the DB.
 *
 * This endpoint powers the "discount reminder" badge in the catalog TopBar:
 * when a user wins a discount on /predicciones, it shows up here too so they
 * remember to use it when shopping for perfumes.
 *
 * NOTE: This route uses `rawDb` (@libsql/client wrapper) instead of Prisma
 * because Prisma kept failing on Vercel with `URL_INVALID: The URL 'undefined'`.
 * Response JSON shape is IDENTICAL to the previous Prisma-based version.
 */
export async function GET() {
  try {
    // 1. Get the NextAuth session (works on both / and /predicciones because
    //    AuthProvider wraps the whole app and the session cookie is shared)
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        authenticated: false,
        discounts: [],
        message: "No autenticado",
      });
    }

    const email = session.user.email.trim().toLowerCase();

    // Only allow Gmail (matches the /predicciones sign-in restriction)
    if (!email.endsWith("@gmail.com")) {
      return NextResponse.json({
        authenticated: false,
        discounts: [],
        message: "Solo cuentas Gmail",
      });
    }

    // 2. If DB is unavailable, return empty (don't break the catalog UI)
    if (!isRawDbAvailable()) {
      return NextResponse.json({
        authenticated: true,
        email,
        name: session.user.name || email.split("@")[0],
        discounts: [],
        dbAvailable: false,
      });
    }

    // 3. Find the user by email
    const user = await rawDb.user.findUniqueByEmail(email);

    if (!user) {
      // User has a valid Google session but hasn't registered through /predicciones yet.
      // This is fine — they just have no discounts.
      return NextResponse.json({
        authenticated: true,
        email,
        name: session.user.name || email.split("@")[0],
        discounts: [],
        userRegistered: false,
      });
    }

    // 4. Fetch all discount codes for this user, newest first.
    //    Filter out expired ones so the UI only shows active discounts.
    const now = new Date();
    const allCodes = await rawDb.discountCode.findByUserId(user.id);

    // Separate active (unverified + not expired) from used/expired
    const active = allCodes.filter((dc) => !dc.verified && dc.expiresAt > now);
    const used = allCodes.filter((dc) => dc.verified);
    const expired = allCodes.filter((dc) => !dc.verified && dc.expiresAt <= now);

    const mapped = (list: typeof active) =>
      list.map((dc) => ({
        id: dc.id,
        code: dc.code,
        discountPct: dc.discountPct,
        verified: dc.verified,
        expiresAt: dc.expiresAt.toISOString(),
        createdAt: dc.createdAt.toISOString(),
      }));

    return NextResponse.json({
      authenticated: true,
      email,
      name: user.name || session.user.name || email.split("@")[0],
      userId: user.id,
      userRegistered: true,
      discounts: mapped(active),
      stats: {
        active: active.length,
        used: used.length,
        expired: expired.length,
        total: allCodes.length,
      },
    });
  } catch (error) {
    console.error("[/api/discounts/me] Error:", error);
    return NextResponse.json(
      { authenticated: false, discounts: [], error: "Error interno" },
      { status: 500 }
    );
  }
}
