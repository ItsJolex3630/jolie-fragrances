import { NextResponse } from "next/server";
import { getWorldCupMatchesFromESPN } from "@/lib/espnApi";
import { getVenezuelaMatches, getVenezuelaDate, getVenezuelaNow } from "@/lib/footballApi";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ─── Step 1: Try ESPN API (PRIMARY - supports World Cup 2026) ───
    console.log("[Matches] Fetching from ESPN API (primary source for World Cup 2026)");
    
    // Rate limit protection: cache results for 5 minutes
    const vzlaNow = getVenezuelaNow();
    const todayStr = getVenezuelaDate(vzlaNow);
    const cacheKey = `wc_espn_${todayStr}`;
    const cached = globalThis as unknown as Record<string, { data: Record<string, unknown>; timestamp: number }>;
    const cachedEntry = cached[cacheKey];
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log("[Matches] Returning cached ESPN results");
      return NextResponse.json(cachedEntry.data);
    }

    const espnData = await getWorldCupMatchesFromESPN();

    if (espnData.today.length > 0 || espnData.tomorrow.length > 0) {
      const responseData = {
        today: espnData.today,
        tomorrow: espnData.tomorrow,
        lastSync: espnData.lastSync,
        isLive: espnData.isLive,
        source: "espn",
      };

      // Cache the results
      cached[cacheKey] = { data: responseData, timestamp: Date.now() };
      console.log(`[Matches] ESPN: cached ${espnData.today.length} today + ${espnData.tomorrow.length} tomorrow matches`);

      return NextResponse.json(responseData);
    }

    // ─── Step 2: Fallback to DB-backed API-Football data ───
    console.log("[Matches] ESPN returned no matches, trying DB-backed flow");
    let data;
    let dbFailed = false;
    try {
      data = await getVenezuelaMatches();
    } catch (e) {
      console.log("[Matches] DB fetch failed:", e);
      dbFailed = true;
    }
    
    if (!dbFailed && data && (data.today.length > 0 || data.tomorrow.length > 0)) {
      return NextResponse.json({
        today: data.today,
        tomorrow: data.tomorrow,
        lastSync: data.lastSync,
        isLive: data.isLive,
        source: "api-football-db",
      });
    }

    // ─── Step 3: Fallback to API-Football direct (may fail on free plan for 2026) ───
    console.log("[Matches] No matches from DB, trying direct API-Football");
    
    const API_KEY = process.env.API_FOOTBALL_KEY || "";
    const API_HOST = process.env.API_FOOTBALL_HOST || "v3.football.api-sports.io";
    
    if (!API_KEY) {
      return NextResponse.json({
        today: [],
        tomorrow: [],
        error: "No hay partidos del Mundial disponibles en este momento",
        source: "none",
      });
    }

    const tomorrowDate = new Date(vzlaNow);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = getVenezuelaDate(tomorrowDate);

    const worldCupSeason = new Date().getFullYear();
    const [todayRes, tomorrowRes] = await Promise.all([
      fetch(`https://${API_HOST}/fixtures?date=${todayStr}&league=1&season=${worldCupSeason}&timezone=America/Caracas`, {
        headers: { "x-apisports-key": API_KEY },
      }),
      fetch(`https://${API_HOST}/fixtures?date=${tomorrowStr}&league=1&season=${worldCupSeason}&timezone=America/Caracas`, {
        headers: { "x-apisports-key": API_KEY },
      }),
    ]);

    const [todayData, tomorrowData] = await Promise.all([
      todayRes.json(),
      tomorrowRes.json(),
    ]);

    // Check for API-Football errors
    const apiErrors = todayData.errors || tomorrowData.errors || {};
    const hasErrors = Object.keys(apiErrors).length > 0;
    if (hasErrors) {
      console.log("[Matches] API-Football errors:", apiErrors);
    }

    const WORLD_CUP_LEAGUE_ID = 1;
    const PRIORITY_LEAGUES = new Set([WORLD_CUP_LEAGUE_ID]);

    const finishedStatuses = ["FT", "AET", "PEN", "WO", "AWD"];
    const liveStatuses = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT", "LIVE"];

    function mapStatus(short: string) {
      if (finishedStatuses.includes(short)) return "finished";
      if (liveStatuses.includes(short)) return "live";
      return "upcoming";
    }

    function getFlag(name: string): string {
      const flags: Record<string, string> = {
        "Venezuela": "🇻🇪", "Colombia": "🇨🇴", "Argentina": "🇦🇷", "Brazil": "🇧🇷",
        "Uruguay": "🇺🇾", "Chile": "🇨🇱", "Mexico": "🇲🇽", "Ecuador": "🇪🇨",
        "Peru": "🇵🇪", "Paraguay": "🇵🇾", "France": "🇫🇷", "Germany": "🇩🇪",
        "Spain": "🇪🇸", "Italy": "🇮🇹", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Portugal": "🇵🇹",
        "Netherlands": "🇳🇱", "United States": "🇺🇸", "Sweden": "🇸🇪", "Norway": "🇳🇴",
        "Ivory Coast": "🇨🇮", "Croatia": "🇭🇷", "Switzerland": "🇨🇭", "Belgium": "🇧🇪",
        "Denmark": "🇩🇰", "Poland": "🇵🇱", "Morocco": "🇲🇦", "Japan": "🇯🇵",
        "South Korea": "🇰🇷", "Australia": "🇦🇺", "Canada": "🇨🇦",
        "Costa Rica": "🇨🇷", "Saudi Arabia": "🇸🇦", "Iran": "🇮🇷",
        "Nigeria": "🇳🇬", "Ghana": "🇬🇭", "Cameroon": "🇨🇲", "Senegal": "🇸🇳",
        "Algeria": "🇩🇿", "Tunisia": "🇹🇳", "Serbia": "🇷🇸", "Ukraine": "🇺🇦",
        "Congo DR": "🇨🇩", "Bosnia and Herzegovina": "🇧🇦",
        "Austria": "🇦🇹", "Cape Verde": "🇨🇻",
      };
      return flags[name] || "⚽";
    }

    function formatFixture(f: Record<string, unknown>): Record<string, unknown> {
      const fixture = f.fixture as Record<string, unknown>;
      const league = f.league as Record<string, unknown>;
      const teams = f.teams as Record<string, unknown>;
      const home = teams.home as Record<string, unknown>;
      const away = teams.away as Record<string, unknown>;
      const goals = f.goals as Record<string, unknown>;
      const statusShort = (fixture.status as Record<string, unknown>)?.short as string || "NS";
      const status = mapStatus(statusShort);
      
      const homeGoals = goals.home as number | null;
      const awayGoals = goals.away as number | null;
      let winner: string | null = null;
      if (status === "finished" && homeGoals !== null && awayGoals !== null) {
        if (homeGoals > awayGoals) winner = "home";
        else if (awayGoals > homeGoals) winner = "away";
        else winner = "draw";
      }

      const matchDate = new Date(fixture.date as string);
      const now = new Date();
      const canPredict = matchDate > now && status === "upcoming";

      const hours = matchDate.getHours().toString().padStart(2, "0");
      const minutes = matchDate.getMinutes().toString().padStart(2, "0");

      return {
        id: `api_${fixture.id}`,
        externalId: String(fixture.id),
        homeTeam: home.name,
        awayTeam: away.name,
        homeFlag: getFlag(home.name as string),
        awayFlag: getFlag(away.name as string),
        homeLogo: home.logo,
        awayLogo: away.logo,
        competition: league.name,
        competitionLogo: league.logo,
        matchDate: matchDate.toISOString(),
        status,
        homeScore: homeGoals,
        awayScore: awayGoals,
        winner,
        shortStatus: statusShort,
        round: league.round || null,
        homeVotes: 0,
        awayVotes: 0,
        drawVotes: 0,
        totalVotes: 0,
        canPredict,
        timeVzla: `${hours}:${minutes}`,
      };
    }

    const todayFixtures = (todayData.response || [])
      .filter((f: Record<string, unknown>) => PRIORITY_LEAGUES.has((f.league as Record<string, unknown>).id as number))
      .map(formatFixture);

    const tomorrowFixtures = (tomorrowData.response || [])
      .filter((f: Record<string, unknown>) => PRIORITY_LEAGUES.has((f.league as Record<string, unknown>).id as number))
      .map(formatFixture);

    const isLive = todayFixtures.some((f: Record<string, unknown>) => f.status === "live");

    console.log(`[Matches] API-Football direct: todayFixtures=${todayFixtures.length}, tomorrowFixtures=${tomorrowFixtures.length}`);

    const responseData = {
      today: todayFixtures,
      tomorrow: tomorrowFixtures,
      lastSync: new Date().toISOString(),
      isLive,
      source: "api-football-direct",
    };

    if (todayFixtures.length > 0 || tomorrowFixtures.length > 0) {
      cached[cacheKey] = { data: responseData, timestamp: Date.now() };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[Matches] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener partidos", today: [], tomorrow: [], source: "error" },
      { status: 500 }
    );
  }
}
