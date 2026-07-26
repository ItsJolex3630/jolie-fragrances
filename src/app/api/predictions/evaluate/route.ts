import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";
import { generateDiscountPayload } from "@/lib/predictionSecurity";

/**
 * POST /api/predictions/evaluate
 *
 * Called by the frontend when a match finishes and predictions need evaluation.
 * Updates prediction results (correct/exactScore) and generates discount codes in DB.
 *
 * This is the KEY endpoint that connects predictions → discounts → catalog.
 * When a user's prediction is evaluated as correct, a DiscountCode is created
 * in the DB, which /api/discounts/me then serves to the catalog so the user
 * sees their discount applied to prices.
 *
 * SECURITY (fixed): this endpoint used to accept `correct`, `exactScore`,
 * `discountPct`, `userId` and `email` verbatim from the request body, with no
 * authentication at all — meaning anyone could POST here and mint a real,
 * DB-backed, redeemable DiscountCode for any email address at any percentage,
 * without ever making a prediction. It now:
 *   1. Requires a logged-in session (the caller can only evaluate their OWN
 *      predictions — never someone else's).
 *   2. Ignores any `correct`/`exactScore`/`discountPct`/`userId`/`email` the
 *      client sends, and instead re-derives all of it from the Prediction +
 *      Match rows actually stored in the DB. The client only says *which*
 *      prediction to re-check, never what the verdict is.
 *
 * Body: { evaluations: Array<{ predictionId: string }> }
 */
export async function POST(request: NextRequest) {
  if (!isRawDbAvailable()) {
    return NextResponse.json({ demo: true, results: [] });
  }

  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  if (!sessionEmail) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const dbUser = await rawDb.user.findUniqueByEmail(sessionEmail);
  if (!dbUser) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { evaluations } = body as { evaluations: Array<{ predictionId: string }> };

    if (!evaluations || !Array.isArray(evaluations)) {
      return NextResponse.json({ error: "evaluations array required" }, { status: 400 });
    }

    // Load only THIS user's predictions (joined with their Match) — the
    // sole source of truth for whether they actually won. A predictionId
    // that isn't in here does not belong to the caller and is refused below.
    const ownPredictions = await rawDb.prediction.findByUserId(dbUser.id);
    const ownPredictionMap = new Map(ownPredictions.map((p) => [p.id, p]));

    const results: Array<{
      predictionId: string;
      discountCode?: string;
      discountId?: string;
      discountPct?: number;
      error?: string;
    }> = [];

    for (const evalItem of evaluations) {
      const predictionId = evalItem?.predictionId;
      if (!predictionId) continue;

      const pred = ownPredictionMap.get(predictionId);
      if (!pred) {
        // Not this user's prediction (or it doesn't exist) — never let the
        // caller claim/evaluate a prediction that isn't theirs.
        results.push({ predictionId, error: "Predicción no encontrada" });
        continue;
      }

      const match = pred.match;
      if (!match || match.status !== "finished" || match.homeScore === null || match.awayScore === null) {
        results.push({ predictionId, error: "El partido aún no ha finalizado" });
        continue;
      }

      // ─── Compute the verdict server-side from real match data ───
      const predWinner =
        pred.homeGoals > pred.awayGoals ? "home" : pred.awayGoals > pred.homeGoals ? "away" : "draw";
      const actualWinner =
        match.homeScore > match.awayScore ? "home" : match.awayScore > match.homeScore ? "away" : "draw";

      const correct = predWinner === actualWinner;
      const exactScore = correct && pred.homeGoals === match.homeScore && pred.awayGoals === match.awayScore;
      const discountPct = exactScore ? 10 : correct ? 5 : 0;

      // 1. Persist the (server-computed) result
      try {
        await rawDb.prediction.update(predictionId, { correct, exactScore });
      } catch (err) {
        console.error("[Evaluate] Failed to update prediction:", predictionId, err);
      }

      // 2. If correct, generate and save the discount code (idempotent)
      if (correct && discountPct > 0) {
        const existingDiscount = await rawDb.discountCode.findByPredictionId(predictionId);

        if (!existingDiscount) {
          const code = generateDiscountPayload(dbUser.email, predictionId, discountPct);

          const discount = await rawDb.discountCode.create({
            userId: dbUser.id,
            predictionId,
            code,
            discountPct,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          });

          console.log(
            `[Evaluate] ✅ Generated ${discountPct}% discount for ${dbUser.email} (prediction ${predictionId})`
          );

          results.push({
            predictionId,
            discountCode: code,
            discountId: discount.id,
            discountPct,
          });
        } else {
          results.push({
            predictionId,
            discountCode: existingDiscount.code,
            discountId: existingDiscount.id,
            discountPct: existingDiscount.discountPct,
          });
        }
      } else {
        results.push({ predictionId });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[Evaluate] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
