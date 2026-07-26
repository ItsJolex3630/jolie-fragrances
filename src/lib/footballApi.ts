/**
 * API-Football integration for real-time match data
 * Uses api-football.com (API-Sports) for live fixture data
 * 
 * Filters only major leagues/competitions to avoid flooding the DB
 */

import { getDb, isDbAvailable } from "./db";

// Venezuela timezone offset: UTC-4
const VENEZUELA_OFFSET = -4;

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || "";
const API_FOOTBALL_HOST = process.env.API_FOOTBALL_HOST || "v3.football.api-sports.io";
const API_FOOTBALL_BASE = `https://${API_FOOTBALL_HOST}`;

// ─── WORLD CUP ONLY FILTER ───
// Only show FIFA World Cup matches (league ID 1)
const WORLD_CUP_LEAGUE_ID = 1; // FIFA World Cup
const PRIORITY_LEAGUE_IDS: Set<number> = new Set([
  WORLD_CUP_LEAGUE_ID, // FIFA World Cup only
]);

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

function getVenezuelaDate(date: Date = new Date()): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const vzla = new Date(utc + VENEZUELA_OFFSET * 3600000);
  return vzla.toISOString().split("T")[0];
}

export function getVenezuelaNow(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + VENEZUELA_OFFSET * 3600000);
}

/**
 * Map API-Football status to our internal status
 */
function mapStatus(apiStatus: string): { status: string; winner: string | null; shortStatus: string } {
  const finishedStatuses = ["FT", "AET", "PEN", "WO", "AWD"];
  const liveStatuses = ["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT", "LIVE"];

  if (finishedStatuses.includes(apiStatus)) {
    return { status: "finished", winner: null, shortStatus: apiStatus };
  }
  if (liveStatuses.includes(apiStatus)) {
    return { status: "live", winner: null, shortStatus: apiStatus };
  }
  return { status: "upcoming", winner: null, shortStatus: apiStatus };
}

/**
 * Determine winner from goals
 */
function determineWinner(
  homeGoals: number | null,
  awayGoals: number | null,
  status: string
): string | null {
  if (status !== "finished" || homeGoals === null || awayGoals === null) return null;
  if (homeGoals > awayGoals) return "home";
  if (awayGoals > homeGoals) return "away";
  return "draw";
}

/**
 * Fetch fixtures from API-Football for a specific date
 * Only returns fixtures from priority leagues
 */
async function fetchFixturesFromAPI(date: string): Promise<ApiFixture[]> {
  if (!API_FOOTBALL_KEY) {
    console.log("[FootballAPI] No API key configured, using fallback");
    return [];
  }

  try {
    // Filter by World Cup league directly on API call (saves quota)
    // Use current year as season (World Cup 2026 = season 2026)
    const season = new Date().getFullYear();
    const url = `${API_FOOTBALL_BASE}/fixtures?date=${date}&league=${WORLD_CUP_LEAGUE_ID}&season=${season}&timezone=America/Caracas`;
    const response = await fetch(url, {
      headers: {
        "x-apisports-key": API_FOOTBALL_KEY,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`[FootballAPI] API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error("[FootballAPI] API errors:", data.errors);
      return [];
    }

    const allFixtures: ApiFixture[] = data.response || [];

    // Filter to only priority leagues
    const filtered = allFixtures.filter((f) => PRIORITY_LEAGUE_IDS.has(f.league.id));

    console.log(`[FootballAPI] ${date}: ${allFixtures.length} total fixtures, ${filtered.length} priority league fixtures`);

    return filtered;
  } catch (error) {
    console.error("[FootballAPI] Fetch error:", error);
    return [];
  }
}

/**
 * Get country flag emoji from team/country name
 */
function getCountryFlag(name: string): string {
  const flagMap: Record<string, string> = {
    // South America
    "Venezuela": "🇻🇪", "Colombia": "🇨🇴", "Argentina": "🇦🇷", "Brasil": "🇧🇷",
    "Brazil": "🇧🇷", "Uruguay": "🇺🇾", "Chile": "🇨🇱", "Ecuador": "🇪🇨",
    "Perú": "🇵🇪", "Peru": "🇵🇪", "Paraguay": "🇵🇾", "Bolivia": "🇧🇴",
    // CONCACAF
    "México": "🇲🇽", "Mexico": "🇲🇽", "Estados Unidos": "🇺🇸",
    "United States": "🇺🇸", "USA": "🇺🇸", "Canadá": "🇨🇦", "Canada": "🇨🇦",
    "Costa Rica": "🇨🇷", "Panamá": "🇵🇦", "Panama": "🇵🇦",
    "Honduras": "🇭🇳", "Guatemala": "🇬🇹", "El Salvador": "🇸🇻",
    "Jamaica": "🇯🇲", "Trinidad y Tobago": "🇹🇹", "Haití": "🇭🇹", "Cuba": "🇨🇺",
    // Europe
    "Francia": "🇫🇷", "France": "🇫🇷", "Alemania": "🇩🇪", "Germany": "🇩🇪",
    "España": "🇪🇸", "Spain": "🇪🇸", "Italia": "🇮🇹", "Italy": "🇮🇹",
    "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Portugal": "🇵🇹", "Países Bajos": "🇳🇱", "Netherlands": "🇳🇱", "Holland": "🇳🇱",
    "Croacia": "🇭🇷", "Croatia": "🇭🇷", "Suiza": "🇨🇭", "Switzerland": "🇨🇭",
    "Bélgica": "🇧🇪", "Belgium": "🇧🇪", "Dinamarca": "🇩🇰", "Denmark": "🇩🇰",
    "Polonia": "🇵🇱", "Poland": "🇵🇱", "Suecia": "🇸🇪", "Sweden": "🇸🇪",
    "Noruega": "🇳🇴", "Norway": "🇳🇴", "Austria": "🇦🇹",
    "Serbia": "🇷🇸", "Ucrania": "🇺🇦", "Ukraine": "🇺🇦",
    "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "Gales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    "Irlanda": "🇮🇪", "Ireland": "🇮🇪",
    "República Checa": "🇨🇿", "Czech Republic": "🇨🇿",
    "Rumania": "🇷🇴", "Romania": "🇷🇴", "Hungría": "🇭🇺", "Hungary": "🇭🇺",
    "Grecia": "🇬🇷", "Greece": "🇬🇷", "Turquía": "🇹🇷", "Turkey": "🇹🇷",
    "Rusia": "🇷🇺", "Russia": "🇷🇺",
    "Eslovaquia": "🇸🇰", "Slovakia": "🇸🇰", "Eslovenia": "🇸🇮", "Slovenia": "🇸🇮",
    "Finlandia": "🇫🇮", "Finland": "🇫🇮", "Islandia": "🇮🇸", "Iceland": "🇮🇸",
    "Bosnia y Herzegovina": "🇧🇦", "Bosnia & Herzegovina": "🇧🇦",
    "Macedonia del Norte": "🇲🇰", "North Macedonia": "🇲🇰",
    "Albania": "🇦🇱", "Georgia": "🇬🇪", "Israel": "🇮🇱",
    // Africa
    "Marruecos": "🇲🇦", "Morocco": "🇲🇦", "Nigeria": "🇳🇬", "Ghana": "🇬🇭",
    "Camerún": "🇨🇲", "Cameroon": "🇨🇲", "Senegal": "🇸🇳",
    "Argelia": "🇩🇿", "Algeria": "🇩🇿", "Túnez": "🇹🇳", "Tunisia": "🇹🇳",
    "Costa de Marfil": "🇨🇮", "Ivory Coast": "🇨🇮",
    "Egipto": "🇪🇬", "Egypt": "🇪🇬", "Sudáfrica": "🇿🇦", "South Africa": "🇿🇦",
    "Congo DR": "🇨🇩", "Malí": "🇲🇱", "Mali": "🇲🇱",
    "Burkina Faso": "🇧🇫", "Zambia": "🇿🇲",
    // Asia
    "Japón": "🇯🇵", "Japan": "🇯🇵", "Corea del Sur": "🇰🇷", "South Korea": "🇰🇷",
    "Arabia Saudita": "🇸🇦", "Saudi Arabia": "🇸🇦",
    "Irán": "🇮🇷", "Iran": "🇮🇷", "Australia": "🇦🇺",
    "Qatar": "🇶🇦", "Emiratos Árabes": "🇦🇪", "United Arab Emirates": "🇦🇪",
    "China": "🇨🇳", "Irak": "🇮🇶", "Iraq": "🇮🇶",
    "Uzbekistán": "🇺🇿", "Uzbekistan": "🇺🇿",
    "Jordania": "🇯🇴", "Jordan": "🇯🇴", "Omán": "🇴🇲", "Oman": "🇴🇲",
    "Siria": "🇸🇾", "Syria": "🇸🇾", "Tailandia": "🇹🇭", "Thailand": "🇹🇭",
    "Vietnam": "🇻🇳", "Indonesia": "🇮🇩", "Malasia": "🇲🇾", "Malaysia": "🇲🇾",
    "Filipinas": "🇵🇭", "Philippines": "🇵🇭",
    // Oceania
    "Nueva Zelanda": "🇳🇿", "New Zealand": "🇳🇿",
  };

  return flagMap[name] || "⚽";
}

// Cache: prevent hitting API rate limit (100/day)
let lastSyncTime = 0;
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes between syncs

/**
 * Sync fixtures from API-Football into our database
 * Only syncs if enough time has passed since last sync (rate limit protection)
 */
export async function syncFixtures(force = false): Promise<{
  todayCount: number;
  tomorrowCount: number;
  totalSynced: number;
}> {
  if (!isDbAvailable() || !API_FOOTBALL_KEY) {
    return { todayCount: 0, tomorrowCount: 0, totalSynced: 0 };
  }

  // Rate limit: don't sync more often than every 5 minutes
  const now = Date.now();
  if (!force && now - lastSyncTime < SYNC_INTERVAL_MS) {
    console.log("[FootballAPI] Skipping sync — too recent, rate limit protection");
    return { todayCount: 0, tomorrowCount: 0, totalSynced: 0 };
  }
  lastSyncTime = now;

  const db = getDb()!;
  const todayStr = getVenezuelaDate();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = getVenezuelaDate(tomorrowDate);

  // Fetch both days (2 API requests)
  const [todayFixtures, tomorrowFixtures] = await Promise.all([
    fetchFixturesFromAPI(todayStr),
    fetchFixturesFromAPI(tomorrowStr),
  ]);

  const allFixtures = [...todayFixtures, ...tomorrowFixtures];
  let totalSynced = 0;

  for (const fixture of allFixtures) {
    try {
      const statusInfo = mapStatus(fixture.fixture.status.short);
      const winner = determineWinner(
        fixture.goals.home,
        fixture.goals.away,
        statusInfo.status
      );

      let homeScore = fixture.goals.home;
      let awayScore = fixture.goals.away;

      // For penalty wins, show fulltime score
      if (fixture.fixture.status.short === "PEN" && fixture.score.penalty) {
        homeScore = fixture.score.fulltime.home ?? fixture.goals.home;
        awayScore = fixture.score.fulltime.away ?? fixture.goals.away;
      }

      const externalId = String(fixture.fixture.id);
      const existing = await db.match.findFirst({
        where: { externalId },
      });

      const matchData = {
        externalId,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeFlag: getCountryFlag(fixture.teams.home.name),
        awayFlag: getCountryFlag(fixture.teams.away.name),
        homeLogo: fixture.teams.home.logo,
        awayLogo: fixture.teams.away.logo,
        competition: fixture.league.name,
        competitionLogo: fixture.league.logo,
        matchDate: new Date(fixture.fixture.date),
        status: statusInfo.status,
        homeScore,
        awayScore,
        winner: winner ?? (statusInfo.status === "finished" ? "draw" : null),
        shortStatus: statusInfo.shortStatus,
        round: fixture.league.round || null,
        lastSyncedAt: new Date(),
      };

      if (existing) {
        await db.match.update({
          where: { id: existing.id },
          data: matchData,
        });
      } else {
        await db.match.create({ data: matchData });
      }
      totalSynced++;
    } catch (error) {
      console.error(`[FootballAPI] Error syncing fixture ${fixture.fixture.id}:`, error);
    }
  }

  // Update winners for finished matches where goals are known
  const finishedMatches = await db.match.findMany({
    where: { status: "finished", winner: null, homeScore: { not: null }, awayScore: { not: null } },
  });
  for (const match of finishedMatches) {
    const w = determineWinner(match.homeScore, match.awayScore, "finished");
    if (w) {
      await db.match.update({ where: { id: match.id }, data: { winner: w } });
    }
  }

  // Clean up old matches (more than 3 days old, no predictions)
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
  try {
    const oldMatches = await db.match.findMany({
      where: {
        matchDate: { lt: threeDaysAgo },
        predictions: { none: {} },
      },
    });
    if (oldMatches.length > 0) {
      await db.match.deleteMany({
        where: {
          id: { in: oldMatches.map((m) => m.id) },
        },
      });
      console.log(`[FootballAPI] Cleaned up ${oldMatches.length} old matches`);
    }
  } catch (e) {
    console.error("[FootballAPI] Cleanup error:", e);
  }

  return {
    todayCount: todayFixtures.length,
    tomorrowCount: tomorrowFixtures.length,
    totalSynced,
  };
}

/**
 * Get matches for display (today + tomorrow in Venezuela timezone)
 * Includes auto-sync if data is stale
 */
export async function getVenezuelaMatches(): Promise<{
  today: Array<MatchDisplayData>;
  tomorrow: Array<MatchDisplayData>;
  lastSync: Date | null;
  isLive: boolean;
}> {
  const db = getDb();

  // Auto-sync from API
  if (API_FOOTBALL_KEY) {
    try {
      await syncFixtures();
    } catch (e) {
      console.error("[FootballAPI] Auto-sync failed:", e);
    }
  }

  const vzlaNow = getVenezuelaNow();
  const todayStart = new Date(vzlaNow);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(vzlaNow);
  todayEnd.setHours(23, 59, 59, 999);

  const tomorrowStart = new Date(vzlaNow);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(vzlaNow);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  tomorrowEnd.setHours(23, 59, 59, 999);

  // Convert Venezuela dates to UTC for DB query
  const todayStartUTC = new Date(todayStart.getTime() - VENEZUELA_OFFSET * 3600000);
  const todayEndUTC = new Date(todayEnd.getTime() - VENEZUELA_OFFSET * 3600000);
  const tomorrowStartUTC = new Date(tomorrowStart.getTime() - VENEZUELA_OFFSET * 3600000);
  const tomorrowEndUTC = new Date(tomorrowEnd.getTime() - VENEZUELA_OFFSET * 3600000);

  if (!db) {
    return { today: [], tomorrow: [], lastSync: null, isLive: false };
  }

  const [todayMatches, tomorrowMatches] = await Promise.all([
    db.match.findMany({
      where: { matchDate: { gte: todayStartUTC, lte: todayEndUTC } },
      include: { predictions: true },
      orderBy: { matchDate: "asc" },
    }),
    db.match.findMany({
      where: { matchDate: { gte: tomorrowStartUTC, lte: tomorrowEndUTC } },
      include: { predictions: true },
      orderBy: { matchDate: "asc" },
    }),
  ]);

  const isLive = todayMatches.some((m) => m.status === "live");

  return {
    today: todayMatches.map(formatMatchForDisplay),
    tomorrow: tomorrowMatches.map(formatMatchForDisplay),
    lastSync: todayMatches[0]?.lastSyncedAt ?? null,
    isLive,
  };
}

export interface MatchDisplayData {
  id: string;
  externalId: string | null;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string | null;
  awayFlag: string | null;
  homeLogo: string | null;
  awayLogo: string | null;
  competition: string;
  competitionLogo: string | null;
  matchDate: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
  shortStatus: string | null;
  round: string | null;
  homeVotes: number;
  awayVotes: number;
  drawVotes: number;
  totalVotes: number;
  canPredict: boolean;
  timeVzla: string;
}

function formatMatchForDisplay(m: {
  id: string;
  externalId: string | null;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string | null;
  awayFlag: string | null;
  homeLogo: string | null;
  awayLogo: string | null;
  competition: string;
  competitionLogo: string | null;
  matchDate: Date;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
  shortStatus: string | null;
  round: string | null;
  predictions: Array<{ pick: string }>;
}): MatchDisplayData {
  const now = new Date();
  const matchTime = new Date(m.matchDate);
  const canPredict = matchTime > now && m.status === "upcoming";

  // Format Venezuela time
  // API already returns dates in America/Caracas timezone when we pass timezone param
  // But stored as UTC, so we need to convert
  const vzlaTime = new Date(matchTime.getTime() + VENEZUELA_OFFSET * 3600000 + matchTime.getTimezoneOffset() * 60000);
  const hours = vzlaTime.getHours().toString().padStart(2, "0");
  const minutes = vzlaTime.getMinutes().toString().padStart(2, "0");
  const timeVzla = `${hours}:${minutes}`;

  return {
    id: m.id,
    externalId: m.externalId,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeFlag: m.homeFlag,
    awayFlag: m.awayFlag,
    homeLogo: m.homeLogo,
    awayLogo: m.awayLogo,
    competition: m.competition,
    competitionLogo: m.competitionLogo,
    matchDate: m.matchDate.toISOString(),
    status: m.status,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    winner: m.winner,
    shortStatus: m.shortStatus,
    round: m.round,
    homeVotes: m.predictions.filter((p) => p.pick === "home").length,
    awayVotes: m.predictions.filter((p) => p.pick === "away").length,
    drawVotes: m.predictions.filter((p) => p.pick === "draw").length,
    totalVotes: m.predictions.length,
    canPredict,
    timeVzla,
  };
}

export { getVenezuelaDate, VENEZUELA_OFFSET };
