import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

/**
 * GET /api/admin/predictions
 *
 * Returns ALL predictions across all users, with the related User + Match
 * info joined. Only the admin (joelmedina2009@gmail.com) can access this.
 *
 * Used by the /admin panel "Predicciones" tab to show every prediction
 * made on the site, who made it, for which match, the predicted score,
 * and whether it was correct.
 */
export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.ok) {
      return NextResponse.json(
        { error: "Forbidden", reason: adminCheck.reason || "unauthenticated" },
        { status: 403 }
      );
    }

    if (!isRawDbAvailable()) {
      return NextResponse.json(
        { error: "Base de datos no disponible" },
        { status: 503 }
      );
    }

    const predictions = await rawDb.prediction.findAll();

    return NextResponse.json({
      predictions: predictions.map((p) => ({
        id: p.id,
        // User info
        userEmail: p.user.email,
        userName: p.user.name,
        userId: p.userId,
        // Match info
        matchId: p.match.externalId || p.matchId,
        homeTeam: p.match.homeTeam,
        awayTeam: p.match.awayTeam,
        homeFlag: p.match.homeFlag,
        awayFlag: p.match.awayFlag,
        competition: p.match.competition,
        matchDate: p.match.matchDate.toISOString(),
        matchStatus: p.match.status,
        matchHomeScore: p.match.homeScore,
        matchAwayScore: p.match.awayScore,
        matchWinner: p.match.winner,
        // Prediction
        homeGoals: p.homeGoals,
        awayGoals: p.awayGoals,
        extraTimeHome: p.extraTimeHome,
        extraTimeAway: p.extraTimeAway,
        penaltiesHome: p.penaltiesHome,
        penaltiesAway: p.penaltiesAway,
        correct: p.correct,
        exactScore: p.exactScore,
        createdAt: p.createdAt.toISOString(),
      })),
      total: predictions.length,
    });
  } catch (error) {
    console.error("[/api/admin/predictions] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
