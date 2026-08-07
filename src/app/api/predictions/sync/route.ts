import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

/**
 * POST /api/predictions/sync
 * Syncs local predictions to the server.
 * This is called when a user logs in from a device that has local-only predictions
 * that haven't been saved to the DB yet.
 *
 * Body: { userId, predictions: [{ matchId, homeGoals, awayGoals, extraTimeHome, extraTimeAway, penaltiesHome, penaltiesAway, matchDate, matchInfo }] }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { predictions } = body;

  if (!Array.isArray(predictions) || predictions.length === 0) {
    return NextResponse.json({ error: "predictions es requerido y no debe estar vacío" }, { status: 400 });
  }

  if (!isRawDbAvailable()) {
    return NextResponse.json({ synced: 0, message: "BD no disponible", demo: true, demoReason: "db_unavailable" });
  }

  try {
    const sessionEmail = session.user.email.trim().toLowerCase();
    const user = await rawDb.user.findUniqueByEmail(sessionEmail);
    
    if (!user) {
      return NextResponse.json({ synced: 0, message: "Usuario no encontrado en BD", demo: true, demoReason: "user_not_found" });
    }

    const userId = user.id;

    if (String(userId).startsWith("demo_")) {
      return NextResponse.json({ synced: 0, message: "Usuarios demo no pueden sincronizar", demo: true });
    }

    let synced = 0;
    const errors: string[] = [];

    for (const pred of predictions) {
      const {
        matchId,
        homeGoals,
        awayGoals,
        extraTimeHome,
        extraTimeAway,
        penaltiesHome,
        penaltiesAway,
        matchDate,
        matchInfo,
      } = pred;

      if (!matchId || homeGoals === undefined || awayGoals === undefined) continue;

      const hg = parseInt(String(homeGoals), 10);
      const ag = parseInt(String(awayGoals), 10);
      if (isNaN(hg) || isNaN(ag) || hg < 0 || ag < 0) continue;

      const isDraw = hg === ag;
      let eth: number | null = null;
      let eta: number | null = null;
      let ph: number | null = null;
      let pa: number | null = null;

      if (isDraw && extraTimeHome !== undefined && extraTimeAway !== undefined) {
        eth = parseInt(String(extraTimeHome), 10) || null;
        eta = parseInt(String(extraTimeAway), 10) || null;
        if (eth === eta && penaltiesHome !== undefined && penaltiesAway !== undefined) {
          ph = parseInt(String(penaltiesHome), 10) || null;
          pa = parseInt(String(penaltiesAway), 10) || null;
        }
      }

      try {
        // For API matches, create or find the Match record
        let dbMatchId = matchId;
        const isApiMatch = String(matchId).startsWith("api_") || String(matchId).startsWith("espn_");

        if (isApiMatch && matchInfo) {
          const externalId = matchId;
          try {
            const existingMatch = await rawDb.match.findByExternalId(externalId);
            if (existingMatch) {
              dbMatchId = existingMatch.id;
            } else {
              const newMatch = await rawDb.match.create({
                externalId,
                homeTeam: matchInfo.homeTeam || "Home",
                awayTeam: matchInfo.awayTeam || "Away",
                homeFlag: matchInfo.homeFlag || null,
                awayFlag: matchInfo.awayFlag || null,
                homeLogo: matchInfo.homeLogo || null,
                awayLogo: matchInfo.awayLogo || null,
                competition: matchInfo.competition || "World Cup 2026",
                competitionLogo: matchInfo.competitionLogo || null,
                matchDate: new Date(matchDate || Date.now()),
                status: "upcoming",
                round: matchInfo.round || null,
              });
              dbMatchId = newMatch.id;
            }
          } catch (matchErr) {
            console.error("[Sync] Error creating/finding match:", matchErr);
            dbMatchId = matchId;
          }
        }

        // Check if prediction already exists for this user+match
        const existing = await rawDb.prediction.findByUserIdAndMatchId(userId, dbMatchId);

        if (!existing) {
          await rawDb.prediction.create({
            userId,
            matchId: dbMatchId,
            homeGoals: hg,
            awayGoals: ag,
            extraTimeHome: eth,
            extraTimeAway: eta,
            penaltiesHome: ph,
            penaltiesAway: pa,
          });
          synced++;
          console.log("[Sync] ✅ Synced prediction:", dbMatchId, "for user:", userId);
        }
        // If prediction already exists, skip it (don't error)
      } catch (predErr) {
        console.error("[Sync] Error syncing prediction:", matchId, predErr);
        errors.push(matchId);
      }
    }

    return NextResponse.json({
      synced,
      total: predictions.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${synced} de ${predictions.length} predicciones sincronizadas`,
    });
  } catch (error) {
    console.error("[Sync] Unexpected error:", error);
    return NextResponse.json({ synced: 0, error: "Error interno del servidor" }, { status: 500 });
  }
}
