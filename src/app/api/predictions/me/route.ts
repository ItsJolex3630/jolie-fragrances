import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

/**
 * GET /api/predictions/me
 *
 * Identifies the user by their NextAuth Google session (NOT localStorage),
 * then returns their userId + predictions + discount codes from the DB.
 *
 * This is the KEY endpoint for cross-device sync: when a user logs in with
 * Google on a NEW device/browser, the /predicciones page calls this endpoint
 * to recover their account and all their server-side data — no localStorage
 * dependency.
 *
 * Flow:
 * 1. User logs in with Google on Device A → /predicciones/auth creates their
 *    User record in DB (userId = cmr...) and saves to localStorage.
 * 2. User opens /predicciones on Device B (new browser, no localStorage).
 * 3. They click "Iniciar sesión con Google" again → Google session is created.
 * 4. /predicciones page calls /api/predictions/me → this endpoint finds their
 *    existing User by email → returns their userId + all predictions/discounts.
 * 5. /predicciones page saves the recovered userId to localStorage and
 *    displays their predictions + discount QR codes.
 *
 * NOTE: This route uses `rawDb` (@libsql/client wrapper) instead of Prisma
 * because Prisma kept failing on Vercel with `URL_INVALID: The URL 'undefined'`.
 * The response JSON shape is IDENTICAL to the previous Prisma-based version so
 * the frontend doesn't break.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        predictions: [],
        discountCodes: [],
        message: "No autenticado — inicia sesión con Google",
      });
    }

    const email = session.user.email.trim().toLowerCase();

    if (!email.endsWith("@gmail.com")) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        predictions: [],
        discountCodes: [],
        message: "Solo cuentas Gmail",
      });
    }

    if (!isRawDbAvailable()) {
      return NextResponse.json({
        authenticated: true,
        email,
        name: session.user.name || email.split("@")[0],
        user: null,
        predictions: [],
        discountCodes: [],
        dbAvailable: false,
        message: "BD no disponible",
      });
    }

    // Find the user by email
    const user = await rawDb.user.findUniqueByEmail(email);

    if (!user) {
      // User has a Google session but no DB record yet (never registered via
      // /predicciones/auth). Return authenticated=true with empty data; the
      // frontend should prompt them to complete registration.
      return NextResponse.json({
        authenticated: true,
        email,
        name: session.user.name || email.split("@")[0],
        user: null,
        userRegistered: false,
        predictions: [],
        discountCodes: [],
        message: "Cuenta no registrada — completa tu registro en /predicciones",
      });
    }

    // Fetch all predictions for this user (with match info, ordered by createdAt desc)
    const predictions = await rawDb.prediction.findByUserId(user.id);

    // Fetch all discount codes for this user (ordered by createdAt desc)
    const discountCodes = await rawDb.discountCode.findByUserId(user.id);

    const mappedPredictions = predictions.map((p) => ({
      id: p.id,
      matchId: p.match.externalId || p.matchId,
      internalMatchId: p.matchId,
      externalMatchId: p.match.externalId,
      homeTeam: p.match.homeTeam,
      awayTeam: p.match.awayTeam,
      homeFlag: p.match.homeFlag || "⚽",
      awayFlag: p.match.awayFlag || "⚽",
      homeLogo: p.match.homeLogo,
      awayLogo: p.match.awayLogo,
      competition: p.match.competition,
      matchDate: p.match.matchDate.toISOString(),
      matchStatus: p.match.status,
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

    return NextResponse.json({
      authenticated: true,
      email,
      name: user.name || session.user.name || email.split("@")[0],
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
      },
      userRegistered: true,
      predictions: mappedPredictions,
      discountCodes: mappedDiscounts,
      stats: {
        predictionsCount: predictions.length,
        discountCodesCount: discountCodes.length,
        activeDiscounts: discountCodes.filter(
          (dc) => !dc.verified && dc.expiresAt > new Date()
        ).length,
      },
    });
  } catch (error) {
    console.error("[/api/predictions/me] Error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        predictions: [],
        discountCodes: [],
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
