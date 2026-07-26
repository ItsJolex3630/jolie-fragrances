import { NextRequest, NextResponse } from "next/server";
import { getDb, isDbAvailable } from "@/lib/db";
import { getVenezuelaNow } from "@/lib/footballApi";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  // SECURITY: this deletes existing demo matches and inserts new ones — a
  // destructive write that used to be callable by anyone, unauthenticated.
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isDbAvailable()) {
    return NextResponse.json(
      { error: "Base de datos no disponible" },
      { status: 503 }
    );
  }

  try {
    const db = getDb()!;

    // Clear existing demo matches (those without externalId)
    await db.match.deleteMany({
      where: { externalId: null },
    });

    const vzlaNow = getVenezuelaNow();
    
    // Helper: create UTC date from Venezuela time
    const vzlaToUTC = (dayOffset: number, hour: number, minute: number = 0) => {
      const d = new Date(vzlaNow);
      d.setDate(d.getDate() + dayOffset);
      d.setHours(hour, minute, 0, 0);
      // Convert from VZLA (UTC-4) to UTC
      return new Date(d.getTime() + 4 * 3600000 - d.getTimezoneOffset() * 60000);
    };

    // ─── TODAY's MATCHES (various statuses) ───
    const todayMatches = [
      {
        homeTeam: "Países Bajos",
        awayTeam: "Marruecos",
        homeFlag: "🇳🇱",
        awayFlag: "🇲🇦",
        competition: "Copa Mundial FIFA",
        matchDate: vzlaToUTC(0, 15, 45),
        status: "finished",
        homeScore: 0,
        awayScore: 0,
        winner: "draw",
        shortStatus: "FT",
        round: "Eliminatoria de 32",
      },
      {
        homeTeam: "Alemania",
        awayTeam: "Paraguay",
        homeFlag: "🇩🇪",
        awayFlag: "🇵🇾",
        competition: "Copa Mundial FIFA",
        matchDate: vzlaToUTC(0, 13, 2),
        status: "finished",
        homeScore: 1,
        awayScore: 1,
        winner: "draw",
        shortStatus: "FT",
        round: "Eliminatoria de 32",
      },
      {
        homeTeam: "Brasil",
        awayTeam: "Japón",
        homeFlag: "🇧🇷",
        awayFlag: "🇯🇵",
        competition: "Copa Mundial FIFA",
        matchDate: vzlaToUTC(0, 18, 0),
        status: "upcoming",
        homeScore: null,
        awayScore: null,
        winner: null,
        shortStatus: "NS",
        round: "Eliminatoria de 32",
      },
      {
        homeTeam: "Venezuela",
        awayTeam: "Colombia",
        homeFlag: "🇻🇪",
        awayFlag: "🇨🇴",
        competition: "Copa América 2026",
        matchDate: vzlaToUTC(0, 20, 0),
        status: "upcoming",
        homeScore: null,
        awayScore: null,
        winner: null,
        shortStatus: "NS",
        round: "Cuartos de final",
      },
      {
        homeTeam: "Argentina",
        awayTeam: "Uruguay",
        homeFlag: "🇦🇷",
        awayFlag: "🇺🇾",
        competition: "Copa América 2026",
        matchDate: vzlaToUTC(0, 22, 30),
        status: "upcoming",
        homeScore: null,
        awayScore: null,
        winner: null,
        shortStatus: "NS",
        round: "Cuartos de final",
      },
    ];

    // ─── TOMORROW's MATCHES ───
    const tomorrowMatches = [
      {
        homeTeam: "México",
        awayTeam: "Ecuador",
        homeFlag: "🇲🇽",
        awayFlag: "🇪🇨",
        competition: "Copa América 2026",
        matchDate: vzlaToUTC(1, 17, 0),
        status: "upcoming",
        homeScore: null,
        awayScore: null,
        winner: null,
        shortStatus: "NS",
        round: "Cuartos de final",
      },
      {
        homeTeam: "Chile",
        awayTeam: "Perú",
        homeFlag: "🇨🇱",
        awayFlag: "🇵🇪",
        competition: "Copa América 2026",
        matchDate: vzlaToUTC(1, 19, 30),
        status: "upcoming",
        homeScore: null,
        awayScore: null,
        winner: null,
        shortStatus: "NS",
        round: "Semifinal",
      },
      {
        homeTeam: "España",
        awayTeam: "Francia",
        homeFlag: "🇪🇸",
        awayFlag: "🇫🇷",
        competition: "Eurocopa 2026",
        matchDate: vzlaToUTC(1, 14, 0),
        status: "upcoming",
        homeScore: null,
        awayScore: null,
        winner: null,
        shortStatus: "NS",
        round: "Semifinal",
      },
      {
        homeTeam: "Inglaterra",
        awayTeam: "Portugal",
        homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        awayFlag: "🇵🇹",
        competition: "Eurocopa 2026",
        matchDate: vzlaToUTC(1, 21, 0),
        status: "upcoming",
        homeScore: null,
        awayScore: null,
        winner: null,
        shortStatus: "NS",
        round: "Semifinal",
      },
    ];

    const allMatches = [...todayMatches, ...tomorrowMatches];
    const created = [];

    for (const matchData of allMatches) {
      const match = await db.match.create({
        data: matchData,
      });
      created.push(match);
    }

    return NextResponse.json({
      message: `Se crearon ${created.length} partidos de demostración`,
      todayCount: todayMatches.length,
      tomorrowCount: tomorrowMatches.length,
      matches: created.map((m) => ({
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        matchDate: m.matchDate,
        status: m.status,
      })),
    });
  } catch (error) {
    console.error("Seed matches error:", error);
    return NextResponse.json({ error: "Error al crear partidos" }, { status: 500 });
  }
}
