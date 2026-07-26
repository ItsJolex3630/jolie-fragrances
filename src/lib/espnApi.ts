/**
 * ESPN API integration for FIFA World Cup 2026 match data
 * 
 * This is the PRIMARY data source because API-Football free plan
 * doesn't support the 2026 season. ESPN's public API provides
 * real-time World Cup fixtures at no cost.
 * 
 * Endpoint: https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard
 */

// Venezuela timezone offset: UTC-4
const VENEZUELA_OFFSET = -4;

function getVenezuelaNow(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + VENEZUELA_OFFSET * 3600000);
}

function getVenezuelaDate(date: Date = new Date()): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const vzla = new Date(utc + VENEZUELA_OFFSET * 3600000);
  return vzla.toISOString().split("T")[0];
}

/**
 * Get country flag emoji from team name
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
    "Jamaica": "🇯🇲", "Trinidad and Tobago": "🇹🇹", "Haití": "🇭🇹", "Cuba": "🇨🇺",
    "Cape Verde": "🇨🇻", "Cabo Verde": "🇨🇻",
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
    "Bosnia and Herzegovina": "🇧🇦", "Bosnia-Herzegovina": "🇧🇦",
    "Bosnia y Herzegovina": "🇧🇦",
    "North Macedonia": "🇲🇰", "Albania": "🇦🇱", "Georgia": "🇬🇪", "Israel": "🇮🇱",
    // Africa
    "Marruecos": "🇲🇦", "Morocco": "🇲🇦", "Nigeria": "🇳🇬", "Ghana": "🇬🇭",
    "Camerún": "🇨🇲", "Cameroon": "🇨🇲", "Senegal": "🇸🇳",
    "Argelia": "🇩🇿", "Algeria": "🇩🇿", "Túnez": "🇹🇳", "Tunisia": "🇹🇳",
    "Costa de Marfil": "🇨🇮", "Ivory Coast": "🇨🇮", "Congo DR": "🇨🇩",
    "Egipto": "🇪🇬", "Egypt": "🇪🇬", "Sudáfrica": "🇿🇦", "South Africa": "🇿🇦",
    "Malí": "🇲🇱", "Mali": "🇲🇱", "Burkina Faso": "🇧🇫", "Zambia": "🇿🇲",
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

/**
 * Team logo URL from ESPN
 */
function getTeamLogo(teamId: string): string {
  return `https://a.espncdn.com/i/teamlogos/countries/500/${teamId}.png`;
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

/**
 * Map ESPN status to our internal status
 */
function mapEspnStatus(status: { type: { state: string; name: string } }): {
  status: string;
  shortStatus: string;
} {
  const state = status.type.state;
  const name = status.type.name;

  if (state === "post" || name === "STATUS_FULL_TIME" || name === "STATUS_FINAL") {
    return { status: "finished", shortStatus: "FT" };
  }
  if (state === "in" || name === "STATUS_LIVE" || name === "STATUS_HALFTIME" ||
      name === "STATUS_FIRST_HALF" || name === "STATUS_SECOND_HALF" ||
      name === "STATUS_EXTRA_TIME" || name === "STATUS_PENALTY_SHOOTOUT") {
    return { status: "live", shortStatus: "LIVE" };
  }
  if (name === "STATUS_HALFTIME") {
    return { status: "live", shortStatus: "HT" };
  }
  return { status: "upcoming", shortStatus: "NS" };
}

/**
 * Format an ESPN event into our MatchDisplayData format
 */
function formatEspnEvent(event: Record<string, unknown>): MatchDisplayData {
  const competitions = event.competitions as Array<Record<string, unknown>>;
  const comp = competitions?.[0] || {};

  const competitors = comp.competitors as Array<Record<string, unknown>>;

  let homeTeam = "";
  let awayTeam = "";
  let homeFlag = "⚽";
  let awayFlag = "⚽";
  let homeLogo: string | null = null;
  let awayLogo: string | null = null;
  let homeScore: number | null = null;
  let awayScore: number | null = null;

  for (const c of competitors) {
    const team = c.team as Record<string, unknown>;
    const name = (team.displayName || team.name || "?") as string;
    const teamId = (team.id || "") as string;
    const logo = (team.logo || getTeamLogo(teamId)) as string;
    const score = parseInt((c.score || "0") as string, 10) || 0;

    if (c.homeAway === "home") {
      homeTeam = name;
      homeFlag = getCountryFlag(name);
      homeLogo = logo;
      homeScore = c.score !== undefined ? score : null;
    } else {
      awayTeam = name;
      awayFlag = getCountryFlag(name);
      awayLogo = logo;
      awayScore = c.score !== undefined ? score : null;
    }
  }

  const statusInfo = mapEspnStatus(comp.status as { type: { state: string; name: string } });

  let winner: string | null = null;
  if (statusInfo.status === "finished" && homeScore !== null && awayScore !== null) {
    if (homeScore > awayScore) winner = "home";
    else if (awayScore > homeScore) winner = "away";
    else winner = "draw";
  }

  // Match date is in UTC (e.g., "2026-07-01T16:00Z")
  const matchDateStr = (event.date || comp.date) as string;
  const matchDate = new Date(matchDateStr);

  const canPredict = matchDate > new Date() && statusInfo.status === "upcoming";

  // Convert to Venezuela time for display
  const vzlaTime = new Date(matchDate.getTime() + VENEZUELA_OFFSET * 3600000 + matchDate.getTimezoneOffset() * 60000);
  const hours = vzlaTime.getHours().toString().padStart(2, "0");
  const minutes = vzlaTime.getMinutes().toString().padStart(2, "0");
  const timeVzla = `${hours}:${minutes}`;

  // Get round info
  const season = event.season as Record<string, unknown> | undefined;
  const round = (season?.slug || comp.altGameNote || null) as string | null;

  return {
    id: `espn_${event.id}`,
    externalId: String(event.id),
    homeTeam,
    awayTeam,
    homeFlag,
    awayFlag,
    homeLogo,
    awayLogo,
    competition: "FIFA World Cup",
    competitionLogo: "https://a.espncdn.com/i/teamlogos/countries/500/fifa.png",
    matchDate: matchDate.toISOString(),
    status: statusInfo.status,
    homeScore,
    awayScore,
    winner,
    shortStatus: statusInfo.shortStatus,
    round,
    homeVotes: 0,
    awayVotes: 0,
    drawVotes: 0,
    totalVotes: 0,
    canPredict,
    timeVzla,
  };
}

/**
 * Fetch World Cup matches from ESPN API for a date range
 */
export async function getWorldCupMatchesFromESPN(): Promise<{
  today: MatchDisplayData[];
  tomorrow: MatchDisplayData[];
  lastSync: string;
  isLive: boolean;
}> {
  const vzlaNow = getVenezuelaNow();
  const todayStr = getVenezuelaDate(vzlaNow);
  const tomorrowDate = new Date(vzlaNow);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = getVenezuelaDate(tomorrowDate);

  console.log(`[ESPN] Fetching World Cup matches for ${todayStr} and ${tomorrowStr}`);

  // Format dates for ESPN API: YYYYMMDD-YYYYMMDD
  const espnDateRange = `${todayStr.replace(/-/g, "")}-${tomorrowStr.replace(/-/g, "")}`;

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${espnDateRange}`;
    console.log(`[ESPN] URL: ${url}`);

    const response = await fetch(url, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`[ESPN] API error: ${response.status} ${response.statusText}`);
      return { today: [], tomorrow: [], lastSync: new Date().toISOString(), isLive: false };
    }

    const data = await response.json();
    const events = (data.events || []) as Array<Record<string, unknown>>;

    console.log(`[ESPN] Got ${events.length} events`);

    // Categorize events into today and tomorrow based on Venezuela time
    const todayMatches: MatchDisplayData[] = [];
    const tomorrowMatches: MatchDisplayData[] = [];

    for (const event of events) {
      const match = formatEspnEvent(event);
      const matchDateStr = match.matchDate;
      const matchDate = new Date(matchDateStr);

      // Convert match UTC date to Venezuela date string
      const matchVzlaDate = new Date(
        matchDate.getTime() + VENEZUELA_OFFSET * 3600000 + matchDate.getTimezoneOffset() * 60000
      );
      const matchDateOnly = matchVzlaDate.toISOString().split("T")[0];

      if (matchDateOnly === todayStr) {
        todayMatches.push(match);
      } else if (matchDateOnly === tomorrowStr) {
        tomorrowMatches.push(match);
      }
    }

    const isLive = todayMatches.some((m) => m.status === "live");

    console.log(`[ESPN] Today: ${todayMatches.length}, Tomorrow: ${tomorrowMatches.length}, Live: ${isLive}`);

    return {
      today: todayMatches,
      tomorrow: tomorrowMatches,
      lastSync: new Date().toISOString(),
      isLive,
    };
  } catch (error) {
    console.error("[ESPN] Fetch error:", error);
    return { today: [], tomorrow: [], lastSync: new Date().toISOString(), isLive: false };
  }
}

export { getVenezuelaDate, getVenezuelaNow };
