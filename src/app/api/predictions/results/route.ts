import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/adminAuth";
import { getDb, isDbAvailable } from "@/lib/db";
import { generateDiscountPayload } from "@/lib/predictionSecurity";
import { getResend, OWNER_EMAIL } from "@/lib/resend";

/**
 * Determine the predicted winner from a goal-based prediction
 */
function getPredictedWinner(homeGoals: number, awayGoals: number): string {
  if (homeGoals > awayGoals) return "home";
  if (awayGoals > homeGoals) return "away";
  return "draw";
}

/**
 * Determine the actual winner considering extra time and penalties
 */
function getActualWinner(
  homeScore: number,
  awayScore: number,
  extraTimeHome?: number | null,
  extraTimeAway?: number | null,
  penaltiesHome?: number | null,
  penaltiesAway?: number | null
): { winner: string; wentToExtraTime: boolean; wentToPenalties: boolean } {
  // If not a draw in regular time, winner is decided there
  if (homeScore !== awayScore) {
    return {
      winner: homeScore > awayScore ? "home" : "away",
      wentToExtraTime: false,
      wentToPenalties: false,
    };
  }

  // Draw in regular time → check extra time
  if (extraTimeHome !== null && extraTimeHome !== undefined && extraTimeAway !== null && extraTimeAway !== undefined) {
    const etHome = homeScore + extraTimeHome;
    const etAway = awayScore + extraTimeAway;
    if (etHome !== etAway) {
      return {
        winner: etHome > etAway ? "home" : "away",
        wentToExtraTime: true,
        wentToPenalties: false,
      };
    }

    // Still draw after extra time → check penalties
    if (penaltiesHome !== null && penaltiesHome !== undefined && penaltiesAway !== null && penaltiesAway !== undefined) {
      if (penaltiesHome !== penaltiesAway) {
        return {
          winner: penaltiesHome > penaltiesAway ? "home" : "away",
          wentToExtraTime: true,
          wentToPenalties: true,
        };
      }
    }
  }

  // Still a draw (shouldn't happen in knockout but possible in groups)
  return {
    winner: "draw",
    wentToExtraTime: extraTimeHome !== null && extraTimeHome !== undefined,
    wentToPenalties: penaltiesHome !== null && penaltiesHome !== undefined,
  };
}

export async function POST(request: NextRequest) {
  // SECURITY: this endpoint finalizes a match result AND immediately mints
  // real, redeemable DiscountCode rows + emails real users — it must only be
  // triggerable by the site operator, never by an arbitrary visitor.
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isDbAvailable()) {
    return NextResponse.json(
      { error: "Base de datos no disponible en modo demo" },
      { status: 503 }
    );
  }

  try {
    const { matchId, homeScore, awayScore, extraTimeHome, extraTimeAway, penaltiesHome, penaltiesAway } = await request.json();
    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { error: "matchId, homeScore y awayScore son requeridos" },
        { status: 400 }
      );
    }

    const hs = parseInt(String(homeScore), 10);
    const as_ = parseInt(String(awayScore), 10);

    // Determine the actual winner
    const { winner, wentToExtraTime, wentToPenalties } = getActualWinner(
      hs,
      as_,
      extraTimeHome,
      extraTimeAway,
      penaltiesHome,
      penaltiesAway
    );

    // Update match
    const match = await getDb()!.match.update({
      where: { id: matchId },
      data: {
        status: "finished",
        winner,
        homeScore: hs,
        awayScore: as_,
        shortStatus: wentToPenalties ? "PEN" : wentToExtraTime ? "AET" : "FT",
      },
    });

    // Get all predictions for this match
    const allPredictions = await getDb()!.prediction.findMany({
      where: { matchId },
      include: { user: true },
    });

    // ─── Evaluate each prediction ───
    const winners5 = []; // Got the winner right → 5%
    const winners10 = []; // Got exact score → 10%
    const losers = [];

    for (const pred of allPredictions) {
      const predWinner = getPredictedWinner(pred.homeGoals, pred.awayGoals);
      const gotWinnerRight = predWinner === winner;

      let gotExactScore = false;

      if (gotWinnerRight) {
        // Check if they got the exact regular time score
        if (pred.homeGoals === hs && pred.awayGoals === as_) {
          // If the match went to extra time, check ET prediction too
          if (wentToExtraTime && pred.extraTimeHome !== null && pred.extraTimeAway !== null) {
            if (pred.extraTimeHome === extraTimeHome && pred.extraTimeAway === extraTimeAway) {
              // If it went to penalties, check penalty prediction too
              if (wentToPenalties && pred.penaltiesHome !== null && pred.penaltiesAway !== null) {
                if (pred.penaltiesHome === penaltiesHome && pred.penaltiesAway === penaltiesAway) {
                  gotExactScore = true; // PERFECT — all levels correct
                }
              } else if (!wentToPenalties) {
                gotExactScore = true; // No penalties needed, ET prediction correct
              }
            }
          } else if (!wentToExtraTime) {
            gotExactScore = true; // No ET needed, regular time prediction is exact
          }
        }
      }

      if (gotExactScore) {
        winners10.push(pred);
      } else if (gotWinnerRight) {
        winners5.push(pred);
      } else {
        losers.push(pred);
      }

      // Update prediction record
      await getDb()!.prediction.update({
        where: { id: pred.id },
        data: {
          correct: gotWinnerRight,
          exactScore: gotExactScore,
        },
      });
    }

    // ─── Generate discount codes ───
    const discountCodes = [];

    // 10% for exact score
    for (const prediction of winners10) {
      const payload = generateDiscountPayload(
        prediction.user.email,
        prediction.id,
        10
      );
      const discount = await getDb()!.discountCode.create({
        data: {
          userId: prediction.user.id,
          predictionId: prediction.id,
          code: payload,
          discountPct: 10,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      discountCodes.push({
        email: prediction.user.email,
        code: discount.code,
        discountPct: 10,
        exact: true,
      });

      // Send winner email (10%)
      const resend = getResend();
      if (resend) {
        try {
          await resend.emails.send({
            from: "Jolie Fragrances <onboarding@resend.dev>",
            to: prediction.user.email,
            subject: "¡ACERTASTE TODO! 10% de descuento - Jolie Fragrances ⚽",
            html: `
              <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;border-radius:16px;border:1px solid rgba(212,175,55,0.2);">
                <div style="padding:32px 24px;text-align:center;">
                  <h1 style="color:#d4af37;font-size:24px;">¡PERFECTO! 🎯</h1>
                </div>
                <div style="padding:0 24px 32px;text-align:center;">
                  <p style="color:rgba(255,255,255,0.7);font-size:14px;margin-bottom:16px;">${match.homeTeam} vs ${match.awayTeam}</p>
                  <p style="color:rgba(255,255,255,0.7);font-size:14px;">Acertaste el marcador exacto. Has ganado un <strong style="color:#d4af37;">10% de descuento</strong></p>
                  <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:16px;">Ve a la página de predicciones para ver tu código QR</p>
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error("Failed to send winner email:", emailErr);
        }
      }
    }

    // 5% for correct winner only
    for (const prediction of winners5) {
      const payload = generateDiscountPayload(
        prediction.user.email,
        prediction.id,
        5
      );
      const discount = await getDb()!.discountCode.create({
        data: {
          userId: prediction.user.id,
          predictionId: prediction.id,
          code: payload,
          discountPct: 5,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      discountCodes.push({
        email: prediction.user.email,
        code: discount.code,
        discountPct: 5,
        exact: false,
      });

      // Send winner email (5%)
      const resend = getResend();
      if (resend) {
        try {
          await resend.emails.send({
            from: "Jolie Fragrances <onboarding@resend.dev>",
            to: prediction.user.email,
            subject: "¡Acertaste el ganador! 5% de descuento - Jolie Fragrances ⚽",
            html: `
              <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;border-radius:16px;border:1px solid rgba(212,175,55,0.2);">
                <div style="padding:32px 24px;text-align:center;">
                  <h1 style="color:#d4af37;font-size:24px;">¡Acertaste! 🎉</h1>
                </div>
                <div style="padding:0 24px 32px;text-align:center;">
                  <p style="color:rgba(255,255,255,0.7);font-size:14px;margin-bottom:16px;">${match.homeTeam} vs ${match.awayTeam}</p>
                  <p style="color:rgba(255,255,255,0.7);font-size:14px;">Acertaste quién ganaba. Has ganado un <strong style="color:#d4af37;">5% de descuento</strong></p>
                  <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:8px;">Si hubieras acertado el marcador exacto, sería 10%</p>
                  <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:16px;">Ve a la página de predicciones para ver tu código QR</p>
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error("Failed to send winner email:", emailErr);
        }
      }
    }

    // ─── Send summary to owner ───
    const resendOwner = getResend();
    const allWinners = [...winners10, ...winners5];
    if (resendOwner && allWinners.length > 0) {
      try {
        const winnerList = allWinners
          .map((p) => {
            const isExact = winners10.includes(p);
            const dc = discountCodes.find((d) => d.email === p.user.email);
            return `<li>${p.user.name} (${p.user.email}) — Predijo: ${p.homeGoals}-${p.awayGoals}${
              p.extraTimeHome !== null ? ` (ET: ${p.extraTimeHome}-${p.extraTimeAway})` : ""
            }${
              p.penaltiesHome !== null ? ` (Pen: ${p.penaltiesHome}-${p.penaltiesAway})` : ""
            } — ${isExact ? "10% EXACTO" : "5% Ganador"} — Código: ${dc?.code || "N/A"}</li>`;
          })
          .join("");

        await resendOwner.emails.send({
          from: "Jolie Fragrances <onboarding@resend.dev>",
          to: OWNER_EMAIL,
          subject: `[Jolie] ${allWinners.length} persona(s) acertaron: ${match.homeTeam} vs ${match.awayTeam}`,
          html: `
            <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#d4af37;">⚽ Resultados de Predicciones</h2>
              <p><strong>${match.homeTeam} ${hs} - ${as_} ${match.awayTeam}</strong>${
                wentToExtraTime ? ` (Prórroga: ${extraTimeHome}-${extraTimeAway})` : ""
              }${
                wentToPenalties ? ` (Penales: ${penaltiesHome}-${penaltiesAway})` : ""
              }</p>
              <p>Ganador: <strong>${
                winner === "home" ? match.homeTeam : winner === "away" ? match.awayTeam : "Empate"
              }</strong></p>
              <h3>10% Exacto (${winners10.length}):</h3>
              <ul>${winners10.map((p) => `<li>${p.user.name} (${p.user.email}) — ${p.homeGoals}-${p.awayGoals}</li>`).join("") || "<li>Ninguno</li>"}</ul>
              <h3>5% Ganador (${winners5.length}):</h3>
              <ul>${winners5.map((p) => `<li>${p.user.name} (${p.user.email}) — ${p.homeGoals}-${p.awayGoals}</li>`).join("") || "<li>Ninguno</li>"}</ul>
              <h3>No acertaron (${losers.length}):</h3>
              <ul>${losers.map((p) => `<li>${p.user.name} (${p.user.email}) — ${p.homeGoals}-${p.awayGoals}</li>`).join("") || "<li>Ninguno</li>"}</ul>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send owner email:", emailErr);
      }
    }

    return NextResponse.json({
      message: "Resultados procesados",
      match: {
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        winner,
        homeScore: hs,
        awayScore: as_,
      },
      winners10: winners10.length,
      winners5: winners5.length,
      losers: losers.length,
      discountCodesGenerated: discountCodes.length,
    });
  } catch (error) {
    console.error("Process results error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isDbAvailable()) {
    return NextResponse.json({ predictions: [], discountCodes: [], demo: true });
  }

  // SECURITY: this used to trust a `?userId=` query param directly, which
  // let anyone read another user's discount codes — including the raw,
  // redeemable `code` string, since redemption only checks the code itself,
  // not who presents it. The user is now resolved from their own session.
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  if (!sessionEmail) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const sessionUser = await getDb()!.user.findUnique({ where: { email: sessionEmail } });
    if (!sessionUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    const userId = sessionUser.id;

    const predictions = await getDb()!.prediction.findMany({
      where: { userId },
      include: { match: true },
      orderBy: { createdAt: "desc" },
    });

    const discountCodes = await getDb()!.discountCode.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      predictions: predictions.map((p) => ({
        id: p.id,
        homeGoals: p.homeGoals,
        awayGoals: p.awayGoals,
        extraTimeHome: p.extraTimeHome,
        extraTimeAway: p.extraTimeAway,
        penaltiesHome: p.penaltiesHome,
        penaltiesAway: p.penaltiesAway,
        correct: p.correct,
        exactScore: p.exactScore,
        match: {
          homeTeam: p.match.homeTeam,
          awayTeam: p.match.awayTeam,
          homeFlag: p.match.homeFlag,
          awayFlag: p.match.awayFlag,
          status: p.match.status,
          winner: p.match.winner,
          homeScore: p.match.homeScore,
          awayScore: p.match.awayScore,
        },
      })),
      discountCodes: discountCodes.map((d) => ({
        id: d.id,
        code: d.code,
        discountPct: d.discountPct,
        verified: d.verified,
        expiresAt: d.expiresAt,
      })),
    });
  } catch (error) {
    console.error("Get results error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
