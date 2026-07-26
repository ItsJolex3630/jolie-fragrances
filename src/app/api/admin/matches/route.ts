import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

/**
 * GET /api/admin/matches
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns every match in the DB (newest first by matchDate), for the
 * /admin "Resultados" tab dropdown. Only `ADMIN_EMAIL` may call this.
 *
 * Response shape:
 *   {
 *     matches: Array<{
 *       id: string,                  // internal DB id (pass back to POST /api/predictions/results)
 *       externalId: string | null,
 *       homeTeam: string,
 *       awayTeam: string,
 *       homeFlag: string | null,
 *       awayFlag: string | null,
 *       competition: string,
 *       matchDate: string (ISO),
 *       status: string,              // "upcoming" | "in_progress" | "finished" | …
 *       homeScore: number | null,
 *       awayScore: number | null,
 *       winner: string | null,
 *       shortStatus: string | null,
 *       round: string | null,
 *     }>,
 *     total: number,
 *     dbAvailable: boolean,
 *   }
 *
 * If the DB is unavailable, returns an empty list with `dbAvailable: false`
 * so the admin UI can show a warning.
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
      matches: [],
      total: 0,
      dbAvailable: false,
    });
  }

  try {
    // 3. Fetch all matches (newest kickoff first). Cap at 500 — there are
    //    ~64 World Cup matches total, but cap is a safety net.
    const matches = await rawDb.match.findMany({
      orderBy: { matchDate: "desc" },
      limit: 500,
    });

    return NextResponse.json({
      matches: matches.map((m) => ({
        id: m.id,
        externalId: m.externalId,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeFlag: m.homeFlag,
        awayFlag: m.awayFlag,
        homeLogo: m.homeLogo,
        awayLogo: m.awayLogo,
        competition: m.competition,
        matchDate: m.matchDate.toISOString(),
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        winner: m.winner,
        shortStatus: m.shortStatus,
        round: m.round,
      })),
      total: matches.length,
      dbAvailable: true,
    });
  } catch (err) {
    console.error("[/api/admin/matches] Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
