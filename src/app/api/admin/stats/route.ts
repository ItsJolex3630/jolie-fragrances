import { NextResponse } from "next/server";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * GET /api/admin/stats
 * ─────────────────────────────────────────────────────────────────────────────
 * Quick dashboard statistics for the /admin panel. Only `ADMIN_EMAIL` may
 * call this.
 *
 * Response shape:
 *   {
 *     totalUsers: number,
 *     totalDiscounts: number,      // all DiscountCode rows
 *     activeDiscounts: number,     // not verified + not expired
 *     totalPredictions: number,
 *     totalCartItems: number,
 *     dbAvailable: boolean,
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: "Forbidden", reason: check.reason },
      { status: 403 }
    );
  }

  if (!isRawDbAvailable()) {
    return NextResponse.json({
      totalUsers: 0,
      totalDiscounts: 0,
      activeDiscounts: 0,
      totalPredictions: 0,
      totalCartItems: 0,
      dbAvailable: false,
    });
  }

  try {
    // Run all five COUNT queries in parallel — they're independent.
    const [
      totalUsers,
      totalDiscounts,
      activeDiscounts,
      totalPredictions,
      totalCartItems,
    ] = await Promise.all([
      rawDb.user.count(),
      rawDb.discountCode.count(),
      rawDb.discountCode.countActive(),
      rawDb.prediction.count(),
      rawDb.cartItem.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalDiscounts,
      activeDiscounts,
      totalPredictions,
      totalCartItems,
      dbAvailable: true,
    });
  } catch (err) {
    console.error("[/api/admin/stats] Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
