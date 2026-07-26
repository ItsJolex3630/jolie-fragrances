import { NextResponse } from "next/server";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/users
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns all registered users (newest first) with per-user counts of
 * discount codes and predictions. Only `ADMIN_EMAIL` may call this.
 *
 * Response shape:
 *   {
 *     users: Array<{
 *       id: string,
 *       email: string,
 *       name: string | null,
 *       image: string | null,
 *       authProvider: string,
 *       banned: boolean,
 *       bannedReason: string | null,
 *       createdAt: string (ISO),
 *       discountCount: number,
 *       predictionCount: number,
 *     }>,
 *     total: number,
 *   }
 *
 * If the DB is unavailable, returns an empty list with `dbAvailable: false`
 * so the admin UI can show a warning instead of an error.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function GET() {
  // 1. Admin-only access
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: "Forbidden", reason: check.reason },
      { status: 403 }
    );
  }

  // 2. DB availability check
  if (!isRawDbAvailable()) {
    return NextResponse.json({
      users: [],
      total: 0,
      dbAvailable: false,
    });
  }

  try {
    // 3. Fetch all users (capped at 500 by rawDb.user.findMany)
    const users = await rawDb.user.findMany(500);

    // 4. For each user, fetch their discount count + prediction count.
    //    Two simple COUNT queries per user is fine at this scale (≤500 users);
    //    if the user base grows large we can switch to a GROUP BY aggregate.
    const enriched = await Promise.all(
      users.map(async (u) => {
        const [discountCount, predictionCount] = await Promise.all([
          rawDb.discountCode.countByUserId(u.id),
          rawDb.prediction.countByUserId(u.id),
        ]);
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          image: u.image,
          authProvider: u.authProvider,
          banned: u.banned,
          bannedReason: u.bannedReason,
          createdAt: u.createdAt.toISOString(),
          discountCount,
          predictionCount,
        };
      })
    );

    return NextResponse.json({
      users: enriched,
      total: enriched.length,
      dbAvailable: true,
    });
  } catch (err) {
    console.error("[/api/admin/users] Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
