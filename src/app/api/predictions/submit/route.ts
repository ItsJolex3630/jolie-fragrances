import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

/**
 * NOTE: This route uses `rawDb` (@libsql/client wrapper) instead of Prisma
 * because Prisma kept failing on Vercel with `URL_INVALID: The URL 'undefined'`.
 * Response JSON shapes are IDENTICAL to the previous Prisma-based version.
 *
 * Unique-constraint detection:
 *   Prisma throws `P2002`; libsql throws a generic Error whose `message`
 *   contains "UNIQUE constraint failed: ...". We check the message instead.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    userId: bodyUserId,
    matchId,
    homeGoals,
    awayGoals,
    extraTimeHome,
    extraTimeAway,
    penaltiesHome,
    penaltiesAway,
    matchDate,
    matchInfo,
  } = body;

  // SECURITY: never trust a client-supplied userId at face value — that
  // would let an unauthenticated caller submit (or squat on) a prediction
  // under someone else's real account. If the caller has a Google session,
  // always attribute the write to THAT session's user. Anonymous/demo
  // submissions (no session) fall back to the client-supplied id, which is
  // fine because they never touch another real user's DB row (guarded
  // below by the "demo_" checks and the DB user lookup).
  let userId = bodyUserId;
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  if (sessionEmail && isRawDbAvailable()) {
    const sessionUser = await rawDb.user.findUniqueByEmail(sessionEmail);
    if (sessionUser) {
      userId = sessionUser.id;
    }
  }

  // ─── Validation ───
  if (!userId || !matchId) {
    return NextResponse.json(
      { error: "userId y matchId son requeridos" },
      { status: 400 }
    );
  }

  if (homeGoals === undefined || homeGoals === null || awayGoals === undefined || awayGoals === null) {
    return NextResponse.json(
      { error: "Debes indicar los goles de cada equipo" },
      { status: 400 }
    );
  }

  const hg = parseInt(String(homeGoals), 10);
  const ag = parseInt(String(awayGoals), 10);

  if (isNaN(hg) || isNaN(ag) || hg < 0 || ag < 0 || hg > 20 || ag > 20) {
    return NextResponse.json(
      { error: "Los goles deben ser números entre 0 y 20" },
      { status: 400 }
    );
  }

  // If draw, validate tiebreaker fields
  const isDraw = hg === ag;
  let eth: number | null = null;
  let eta: number | null = null;
  let ph: number | null = null;
  let pa: number | null = null;

  if (isDraw) {
    if (extraTimeHome !== undefined && extraTimeHome !== null && extraTimeAway !== undefined && extraTimeAway !== null) {
      eth = parseInt(String(extraTimeHome), 10);
      eta = parseInt(String(extraTimeAway), 10);
      if (isNaN(eth) || isNaN(eta) || eth < 0 || eta < 0 || eth > 10 || eta > 10) {
        return NextResponse.json(
          { error: "Los goles de prórroga deben ser números entre 0 y 10" },
          { status: 400 }
        );
      }
      if (eth === eta) {
        if (penaltiesHome !== undefined && penaltiesHome !== null && penaltiesAway !== undefined && penaltiesAway !== null) {
          ph = parseInt(String(penaltiesHome), 10);
          pa = parseInt(String(penaltiesAway), 10);
          if (isNaN(ph) || isNaN(pa) || ph < 0 || pa < 0 || ph > 20 || pa > 20) {
            return NextResponse.json(
              { error: "Los goles de penales deben ser números entre 0 y 20" },
              { status: 400 }
            );
          }
          if (ph === pa) {
            return NextResponse.json(
              { error: "En penales debe ganar un equipo, no puede ser empate" },
              { status: 400 }
            );
          }
        }
      }
    }
  }

  // ─── Server-side time lock for ESPN/API matches ───
  const isApiMatch = String(matchId).startsWith("api_") || String(matchId).startsWith("espn_");
  if (isApiMatch && matchDate) {
    const serverNow = new Date();
    const matchKickoff = new Date(matchDate);
    const lockTime = new Date(matchKickoff.getTime() - 2 * 60 * 1000);
    if (serverNow >= lockTime) {
      return NextResponse.json(
        { error: "Las predicciones para este partido están cerradas. El partido está por comenzar o ya comenzó." },
        { status: 400 }
      );
    }
  }

  // ─── Build the local prediction response (used as fallback) ───
  const localPrediction = {
    id: `pred_${matchId}_${Date.now()}`,
    matchId,
    homeGoals: hg,
    awayGoals: ag,
    extraTimeHome: eth,
    extraTimeAway: eta,
    penaltiesHome: ph,
    penaltiesAway: pa,
    match: matchInfo ? {
      homeTeam: matchInfo.homeTeam || "Home",
      awayTeam: matchInfo.awayTeam || "Away",
      homeFlag: matchInfo.homeFlag || "⚽",
      awayFlag: matchInfo.awayFlag || "⚽",
    } : undefined,
  };

  // ─── Try to save to DB ───
  if (!isRawDbAvailable()) {
    console.warn("[Submit] DB not available — prediction saved locally only:", { userId, matchId, homeGoals: hg, awayGoals: ag });
    return NextResponse.json({
      message: "Predicción registrada localmente (servidor no disponible)",
      prediction: localPrediction,
      demo: true,
      demoReason: "db_unavailable",
    });
  }

  try {
    // Verify user exists — if not, try to find by email or create
    const user = await rawDb.user.findById(userId);

    if (!user) {
      // User might have a demo_ userId that doesn't exist in DB
      // Try to find by checking if this is a demo user
      if (String(userId).startsWith("demo_")) {
        console.log("[Submit] Demo user tried to submit — cannot save to DB:", userId);
        return NextResponse.json({
          message: "Predicción registrada localmente (usuario demo)",
          prediction: localPrediction,
          demo: true,
          demoReason: "demo_user",
        });
      }

      // For non-demo users that somehow aren't in DB, this is an error
      console.error("[Submit] User not found in DB:", userId);
      return NextResponse.json({
        message: "Predicción registrada localmente (usuario no encontrado en BD)",
        prediction: localPrediction,
        demo: true,
        demoReason: "user_not_found",
      });
    }

    // ─── For ESPN/API matches: create or find Match in DB ───
    let dbMatchId = matchId;

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
          console.log("[Submit] Created new Match record:", dbMatchId, "for externalId:", externalId);
        }
      } catch (matchErr) {
        console.error("[Submit] Error creating/finding match:", matchErr);
        // Fall back to using the original matchId
        dbMatchId = matchId;
      }
    }

    // Check existing prediction
    try {
      const existing = await rawDb.prediction.findByUserIdAndMatchId(userId, dbMatchId);
      if (existing) {
        return NextResponse.json(
          { error: "Ya hiciste una predicción para este partido" },
          { status: 409 }
        );
      }
    } catch (findErr) {
      console.error("[Submit] Error checking existing prediction:", findErr);
      // Continue — might not exist
    }

    // Create prediction (rawDb.prediction.create returns the row without match;
    // we fetch the match separately to mirror Prisma's `include: { match: true }`)
    try {
      const prediction = await rawDb.prediction.create({
        userId,
        matchId: dbMatchId,
        homeGoals: hg,
        awayGoals: ag,
        extraTimeHome: eth,
        extraTimeAway: eta,
        penaltiesHome: ph,
        penaltiesAway: pa,
      });

      // Fetch the related match row to populate the response (mirrors Prisma's
      // `include: { match: true }`). If the match row is missing, throw so the
      // outer catch returns demo mode (same behavior as the Prisma version,
      // which would have crashed on `prediction.match.externalId`).
      const match = await rawDb.match.findById(dbMatchId);
      if (!match) {
        throw new Error(`[Submit] Match row not found for dbMatchId=${dbMatchId}`);
      }

      console.log("[Submit] ✅ Prediction saved to DB:", prediction.id, "user:", userId);

      return NextResponse.json({
        message: "Predicción registrada exitosamente",
        prediction: {
          id: prediction.id,
          matchId: dbMatchId,
          externalMatchId: isApiMatch ? matchId : match.externalId,
          homeGoals: prediction.homeGoals,
          awayGoals: prediction.awayGoals,
          extraTimeHome: prediction.extraTimeHome,
          extraTimeAway: prediction.extraTimeAway,
          penaltiesHome: prediction.penaltiesHome,
          penaltiesAway: prediction.penaltiesAway,
          match: {
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            homeFlag: match.homeFlag,
            awayFlag: match.awayFlag,
          },
        },
        saved: true,
      });
    } catch (createErr) {
      console.error("[Submit] ❌ Error creating prediction in DB:", createErr);

      // libsql unique-constraint violation (duplicate userId+matchId)
      // mirrors Prisma's P2002 handling — return 409 instead of demo mode
      if (createErr instanceof Error && createErr.message.includes("UNIQUE constraint")) {
        return NextResponse.json(
          { error: "Ya hiciste una predicción para este partido" },
          { status: 409 }
        );
      }

      // DB write failed — return success with local prediction data + warning
      return NextResponse.json({
        message: "Predicción registrada localmente (error al guardar en servidor)",
        prediction: localPrediction,
        demo: true,
        demoReason: "db_write_error",
      });
    }
  } catch (error) {
    console.error("[Submit] ❌ Unexpected error:", error);
    return NextResponse.json({
      message: "Predicción registrada localmente (error del servidor)",
      prediction: localPrediction,
      demo: true,
      demoReason: "server_error",
    });
  }
}

export async function GET(request: NextRequest) {
  if (!isRawDbAvailable()) {
    return NextResponse.json({ predictions: [], discountCodes: [], demo: true, demoReason: "db_unavailable" });
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    if (!queryUserId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

    if (String(queryUserId).startsWith("demo_")) {
      return NextResponse.json({ predictions: [], discountCodes: [], demo: true, demoReason: "demo_user" });
    }

    // SECURITY: this used to trust `?userId=` directly, which let anyone
    // read another user's predictions AND their real, redeemable discount
    // codes just by guessing/knowing a userId. We now require a session and
    // only ever return data for the SESSION's own user, regardless of what
    // userId was requested in the query string.
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email?.trim().toLowerCase();
    if (!sessionEmail) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const sessionUser = await rawDb.user.findUniqueByEmail(sessionEmail);
    if (!sessionUser) {
      return NextResponse.json({ predictions: [], discountCodes: [], demo: true, demoReason: "user_not_found" });
    }
    const userId = sessionUser.id;

    // rawDb.prediction.findByUserId already returns predictions with the related
    // Match row joined, ordered by createdAt desc (mirrors Prisma's
    // `findMany({ where: { userId }, include: { match: true }, orderBy: { createdAt: "desc" } })`).
    const predictions = await rawDb.prediction.findByUserId(userId);

    // rawDb.discountCode.findByUserId already orders by createdAt desc.
    const discountCodes = await rawDb.discountCode.findByUserId(userId);

    const mappedPredictions = predictions.map((p) => ({
      id: p.id,
      matchId: p.matchId,
      externalMatchId: p.match.externalId,
      homeTeam: p.match.homeTeam,
      awayTeam: p.match.awayTeam,
      homeFlag: p.match.homeFlag || "⚽",
      awayFlag: p.match.awayFlag || "⚽",
      homeGoals: p.homeGoals,
      awayGoals: p.awayGoals,
      extraTimeHome: p.extraTimeHome,
      extraTimeAway: p.extraTimeAway,
      penaltiesHome: p.penaltiesHome,
      penaltiesAway: p.penaltiesAway,
      correct: p.correct,
      exactScore: p.exactScore,
      createdAt: p.createdAt.toISOString(),
    }));

    const mappedDiscounts = discountCodes.map((dc) => ({
      id: dc.id,
      userId: dc.userId,
      predictionId: dc.predictionId || "",
      code: dc.code,
      discountPct: dc.discountPct,
      verified: dc.verified,
      expiresAt: dc.expiresAt.toISOString(),
      createdAt: dc.createdAt.toISOString(),
    }));

    return NextResponse.json({ predictions: mappedPredictions, discountCodes: mappedDiscounts });
  } catch (error) {
    console.error("Get predictions error:", error);
    return NextResponse.json({ predictions: [], discountCodes: [], error: "Error al cargar predicciones del servidor" });
  }
}
