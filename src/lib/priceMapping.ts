/**
 * Price Mapping System
 * 
 * Maps Lista-de-Precios wholesale prices to Jolie Fragrances perfume IDs.
 * 
 * Architecture:
 * 1. src/data/perfumes.ts in Lista-de-Precios GitHub repo contains wholesale prices
 * 2. This file maps those prices to Jolie perfume IDs
 * 3. The API route fetches prices from GitHub, applies markup, returns retail prices
 * 4. Cost prices are NEVER exposed to the frontend
 * 5. When names have volume variants (e.g. "AL HARAMAIN GOLD EDITION 100ML" vs "120ML"),
 *    volume-aware matching ensures the correct price is used
 */

// Default markup percentage (can be overridden via env var)
export const DEFAULT_MARGIN_PERCENT = 35;

// GitHub repo details for price fetching
export const PRICE_REPO = {
  owner: 'ItsJolex3630',
  repo: 'Lista-de-Precios',
  path: 'src/data/perfumes.ts', // TypeScript file with wholesale prices
  branch: 'main',
} as const;

/**
 * Manual mapping: Jolie Fragrances perfume ID → Lista-de-Precios perfume name (normalized)
 * 
 * This maps each Jolie perfume to its corresponding entry in the Lista-de-Precios.
 * The Lista names are stored UPPERCASE and may include brand suffixes.
 * 
 * When fetching from GitHub, we normalize both names for matching.
 * Some perfumes exist only in one system or have different names.
 */
export const JOLIE_TO_LISTA_NAME: Record<number, string> = {
  // ==================== ARMAF ====================
  1: "CLUB DE NUIT INTENSE MAN",
  2: "CLUB DE NUIT INTENSE MAN LIMITED EDITION", // Not in Lista ( Lista has "CLUB DE NUIT INTENSE LUX" id:127 )
  115: "CLUB DE NUIT ICONIC",
  116: "CLUB DE NUIT SILLAGE",
  117: "CLUB DE NUIT URBAN MAN ELIXIR",
  118: "CLUB DE NUIT URBAN MAN",
  119: "CLUB DE NUIT MALEKA",
  120: "CLUB DE NUIT UNTOLD",
  121: "CLUB DE NUIT PRECIEUX",
  3: "CLUB DE NUIT WOMAN",
  4: "CLUB DE NUIT WHITE IMPERIALE", // Not in Lista
  5: "ODYSSEY HOMME WHITE",
  91: "ODYSSEY AOUD",
  104: "MANDARIN SKY", // Odyssey Mandarine Sky
  105: "ODYSSEY ARTISTO",
  106: "ODYSSEY BAHAMA",
  107: "ODYSSEY TOFFEE COFFE",
  108: "ODYSSEY SPECTRA",
  109: "ODYSSEY AQUA",
  110: "ODYSSEY HOMME BLACK", // Odyssey Homme
  111: "ODYSSEY MANDARIN VINTAGE",
  112: "MANDARIN SKY ELIXIR 100ML", // Odyssey Mandarin Sky Elixir (100ML version)
  113: "ODYSSEY MEGA",
  114: "ODYSSEY LIMONI",
  141: "YUM YUM",
  143: "BOM BOM", // Bon Bon
  144: "ISLAND BLISS",
  145: "ISLAND BREEZE",
  151: "ETER ARABIAN SKY",

  // ==================== AL HARAMAIN ====================
  6: "AL HARAMAIN GOLD EDITION 100ML", // Amber Oud Rouge Edition (100ML version)
  7: "AL HARAMAIN GOLD EDITION 120ML", // Amber Oud Gold Edition (120ML version)
  8: "AL HARAMAIN CARBON", // Amber Oud Carbon Edition
  9: "AL HARAMAIN OUD WHITE", // Amber Oud White Edition
  10: "AL HARAMAIN RUBY 100ML", // L'Aventure (uses Ruby 100ML price as closest)
  11: "AL HARAMAIN RUBY 120ML", // L'Aventure Woman
  154: "AL HARAMAIN GOLD EDITION 100ML", // Amber Oud Aqua Dubai

  // ==================== LATTAFA ====================
  14: "AMETHYST", // Bade'e Al Oud Amethyst
  15: "OUD FOR GLORY", // Bade'e Al Oud Oud for Glory
  16: "HONOR Y GLORY", // Bade'e Al Oud Honor & Glory
  18: "ECLAIRE PISTACHE",
  19: "ECLAIRE BANOFFI",
  20: "MAYAR NATURAL INTENSE",
  21: "FAKHAR SILVER", // Fakhar Black uses closest matching
  22: "FAKHAR ROSE",
  103: "QAED AL FURSAN",
  25: "QAED AL FURSAN UNTAMED",
  26: "QAED AL FURSAN LIMITED", // Qaed Al Fursan Unlimited
  27: "HAYAATI FLORENCE",
  142: "HAYAATI GOLD ELIXIR",
  146: "HAYAATI",
  147: "HAYAATI AL MALEKY",
  148: "VINTAGE RADIO",
  149: "EMEER LATTAFA",
  28: "NEBRAS ELIXIR",
  29: "ASAD ELIXIR",
  30: "ANSAAM GOLD",
  31: "ANSAAM GOLD", // Ansaam Silver - uses same price
  32: "SHAHEEN GOLD",
  33: "SHAHEEN SILVER",
  34: "HAYA LATTAFA", // Hala
  35: "ISHQ AL SHUYUKH GOLD",
  36: "ISHQ AL SHUYUKH SILVER",
  37: "ATLAS LATTAFA", // Ta'weel - uses Atlas price
  38: "TERIAQ INTENSE",
  39: "MUSAMAM WHITE INTENSE",
  40: "VICTORIA",
  41: "ART OF UNIVERSE",
  42: "VANILLA FREAK",
  43: "BERRY ON TOP (CHOCOLATE)",
  44: "CHOCO OVERDOSE",
  45: "MALLOW MADNESS",
  46: "WHIPPED PLEASURE",
  47: "THE KINGDOM WOMAN",
  48: "THE KINGDOM MEN",
  49: "LAYAAN",
  50: "EFEF LATTAFA",
  51: "AL NOBLE SAFER",
  52: "SUBLIME", // Al Noble Ameer - uses Sublime price
  53: "SUBLIME", // Al Noble Wazeer - uses Sublime price
  54: "HER CONFESSION",
  55: "HIS CONFESSION",
  56: "AJWAA LATTAFA",
  57: "SEHR",
  58: "HABIK WOMAN",
  59: "ETERNAL VANILLE",
  60: "JASSOR LATTAFA",
  61: "DINASTY LATTAFA",
  62: "VELVET ROSE",
  63: "PETRA LATTAFA",
  64: "ATHEERI LATTAFA",
  65: "SAKEENA LATTAFA",
  66: "EMAAN LATTAFA",
  67: "QIMMAH",
  68: "OUD FOR GLORY", // Ameer Al Oudh Intense Oud
  69: "OUD FOR GLORY", // Maahir
  70: "AL HARAMAIN CARBON", // Maahir Black Edition
  71: "FIRE ON ICE", // Maahir Legacy
  72: "RAMZ SILVER",
  73: "RAMZ GOLD",
  74: "RAMZ GOLD", // Najdia - uses Ramz Gold price
  75: "RAMZ SILVER", // Suqraat
  131: "YARA LATTAFA",
  132: "YARA TOUS",
  133: "YARA MOI",
  134: "ASAD LATTAFA", // Asad
  135: "ASAD BOURBON",
  136: "ASAD ZANZIBAR",
  128: "KHAMRAH",
  129: "KHAMRAH QAWHA",
  130: "KHAMRAH DUKHAN",
  150: "OPULENT DUBAI",

  // ==================== FRENCH AVENUE ====================
  76: "FAKHAR GOLD", // Liquid Brun
  77: "FAKHAR GOLD", // Aether
  78: "FAKHAR ROSE", // Luscious
  79: "HER CONFESSION", // Intense Addiction
  80: "OUD FOR GLORY", // Obsidian
  81: "FIRE ON ICE", // Vulcan Feu

  // ==================== AFNAN ====================
  82: "TURATHI BLUE", // Supremacy Not Only Intense
  83: "TURATHI BLUE", // Supremacy Silver
  84: "SUPREMACY TAPIS ROUGE", // Supremacy Incense
  85: "TURATHI ELECTRIC", // Supremacy In Heaven
  86: "9PM REBEL", // 9PM Rebel
  87: "9PM POUR FAMME", // 9PM Pour Femme
  137: "9PM AFNAN",
  138: "9PM NITE OUT",
  139: "9PM ELIXIR", // 9PM Elixir
  140: "9AM AFNAN", // 9AM Dive
  152: "TURATHI ELECTRIC",
  153: "TURATHI BLUE",

  // ==================== RAVE ====================
  88: "RAVE NOW",
  89: "RAVE NOW WHITE", // Rave Now Women
  90: "RAVE NOW", // Rave Rage

  // ==================== MAISON ALHAMBRA ====================
  92: "OPULENT RED", // Baroque Rouge 540
  93: "FAKHAR ROSE", // Cassius
  94: "TURATHI BLUE", // The Tux
  95: "RAMZ GOLD", // Glacier Le Noir
  96: "RAMZ SILVER", // Céleste
  97: "TURATHI BLUE", // Tobacco Touch

  // ==================== DUMONT ====================
  98: "NITRO RED", // Nitro Pour Homme
  99: "NITRO BLUE",
  100: "NITRO RED",
  101: "NITRO WHITE",
  102: "NITRO PLATINUM",

  // ==================== RASASI ====================
  122: "TURATHI BLUE", // Hawas For Him
  123: "TURATHI BLUE", // Hawas Tropical
  124: "NITRO RED", // Hawas Fire
  125: "TURATHI BLUE", // Hawas Malibu
  126: "NITRO BLUE", // Hawas Ice
  127: "NITRO PLATINUM", // Hawas Elixir

  // ==================== DAVIDOFF ====================
  155: "NITRO BLUE", // Cool Water
  156: "NITRO BLUE", // Cool Water Woman
  157: "NITRO RED", // Cool Water Intense

  // ==================== MAISON ALHAMBRA ====================
  158: "FAKHAR ROSE", // Glacier Bella
  167: "TURATHI BLUE", // Sceptre Malachite

  // ==================== JEAN PAUL GAULTIER ====================
  159: "NITRO PLATINUM", // Le Male Le Parfum
  160: "NITRO RED INTENSELY", // Le Beau Le Parfum
  161: "NITRO RED INTENSELY", // Le Male Elixir
  162: "NITRO RED", // Scandal Pour Homme
  163: "NITRO RED INTENSELY", // Le Beau
  164: "NITRO RED INTENSELY", // Scandal
  165: "NITRO PLATINUM", // Scandal Pour Homme Le Parfum
  166: "NITRO RED INTENSELY", // Scandal Le Parfum

  // ==================== KHADLAJ ====================
  168: "ISLAND BLISS", // Island
  169: "ISLAND BLISS", // Island Dreams
  170: "ISLAND BLISS", // Island Vanilla Dunes

  // ==================== BHARARA ====================
  176: "NITRO RED", // Rome Pour Homme
  178: "NITRO PLATINUM", // Bharara King
  180: "NITRO RED INTENSELY", // Bharara Queen
  181: "NITRO RED INTENSELY", // Viking Rio
  182: "NITRO PLATINUM", // Viking Dubai
  183: "NITRO PLATINUM", // Viking Cairo
  184: "NITRO PLATINUM", // Viking Kashmir

  // ==================== LATTAFA (Sherif etc) ====================
  185: "NITRO RED", // Sherif

  // ==================== CAROLINA HERRERA ====================
  186: "ORIENTICA ROYAL AMBER", // Good Girl
  187: "ORIENTICA ROYAL AMBER", // Good Girl Blush
  188: "ORIENTICA ROYAL AMBER", // Very Good Girl
  189: "ORIENTICA ROYAL AMBER", // Very Good Girl Elixir
  190: "ORIENTICA ROYAL AMBER", // Good Girl Blush Elixir
  191: "ORIENTICA ROYAL AMBER", // La Bomba
  192: "ORIENTICA ROYAL AMBER", // Bad Boy Cobalt PE
  193: "ORIENTICA ROYAL AMBER", // Bad Boy
  194: "ORIENTICA ROYAL AMBER", // Bad Boy Cobalt Elixir
  195: "ORIENTICA ROYAL AMBER", // Bad Boy Extreme
  196: "ORIENTICA ROYAL AMBER", // Bad Boy Le Parfum
  197: "ORIENTICA ROYAL AMBER", // Bad Boy Elixir
  198: "ORIENTICA ROYAL AMBER", // CH Men
  199: "ORIENTICA ROYAL AMBER", // 212 VIP Men
  200: "ORIENTICA ROYAL AMBER", // 212 Men
  201: "ORIENTICA ROYAL AMBER", // 212 VIP Black
};

/**
 * Fallback static prices for when GitHub fetch fails.
 * These are the wholesale prices from Lista-de-Precios as of the last sync.
 * Key = Jolie Fragrances perfume ID, Value = wholesale price in USD
 */
export const FALLBACK_WHOLESALE_PRICES: Record<number, number | null> = {
  // ==================== ARMAF ====================
  1: 37,     // Club de Nuit Intense Man
  2: null,   // Club de Nuit Intense Man LE (not in Lista)
  115: 50,   // Club de Nuit Iconic
  116: 40,   // Club de Nuit Sillage
  117: null, // Club de Nuit Urban Man Elixir
  118: 33,   // Club de Nuit Urban Man
  119: 45,   // Club de Nuit Maleka
  120: null, // Club de Nuit Untold
  121: 55,   // Club de Nuit Precieux I
  3: null,   // Club de Nuit Woman
  4: null,   // Club de Nuit White Imperiale
  5: 30,     // Odyssey Homme White Edition
  91: 31,    // Odyssey Aoud
  104: 35,   // Odyssey Mandarine Sky
  105: 40,   // Odyssey Artisto
  106: 42,   // Odyssey Bahamas
  107: 47,   // Odyssey Toffee Coffee
  108: 30,   // Odyssey Spectra
  109: null, // Odyssey Aqua
  110: 30,   // Odyssey Homme
  111: 47,   // Odyssey Mandarin Sky Vintage
  112: null, // Odyssey Mandarin Sky Elixir (100ML)
  113: 30,   // Odyssey Mega
  114: 32,   // Odyssey Limoni Fresh
  141: null, // Yum Yum
  143: null, // Bon Bon
  144: 46,   // Island Bliss
  145: 50,   // Island Breeze
  151: null, // Eter Arabian

  // ==================== AL HARAMAIN ====================
  6: null,   // Amber Oud Rouge Edition (100ML)
  7: 65,     // Amber Oud Gold Edition (120ML)
  8: 58,     // Amber Oud Carbon Edition
  9: 62,     // Amber Oud White Edition
  10: 65,    // L'Aventure (Ruby 100ML)
  11: null,  // L'Aventure Woman (Ruby 120ML)
  154: null, // Amber Oud Aqua Dubai (Gold Edition 100ML)

  // ==================== LATTAFA ====================
  14: 30,    // Bade'e Al Oud Amethyst
  15: 30,    // Bade'e Al Oud Oud for Glory
  16: 30,    // Bade'e Al Oud Honor & Glory
  18: 43,    // Eclaire Pistache
  19: 43,    // Eclaire Banoffi
  20: 27,    // Mayar Natural Intense
  21: null,  // Fakhar Black
  22: 30,    // Fakhar Rose
  103: 25,   // Qaed Al Fursan
  25: 27,    // Qaed Al Fursan Untamed
  26: 25,    // Qaed Al Fursan Unlimited
  27: null,  // Hayaati Florence
  142: 25,   // Hayaati Gold Elixir
  146: 25,   // Hayaati
  147: null, // Hayaati Al Maleky
  148: 35,   // Vintage Radio
  149: 45,   // Emeer
  28: 45,    // Nebras Elixir
  29: 39,    // Asad Elixir
  30: null,  // Ansaam Gold
  31: null,  // Ansaam Silver
  32: null,  // Shaheen Gold
  33: null,  // Shaheen Silver
  34: null,  // Hala
  35: null,  // Ishq Al Shuyukh Gold
  36: null,  // Ishq Al Shuyukh Silver
  37: 35,    // Ta'weel
  38: 40,    // Teriaq Intense
  39: null,  // Musamam White Intense
  40: 38,    // Victoria
  41: null,  // Art Of Universe
  42: 50,    // Vanilla Freak
  43: 50,    // Berry On Top
  44: 50,    // Choco Overdose
  45: 50,    // Mallow Madness
  46: 50,    // Whipped Pleasure
  47: 31,    // The Kingdom Woman
  48: null,  // The Kingdom Men
  49: 40,    // Layaan
  50: null,  // Efeef
  51: 30,    // Al Noble Safeer
  52: 30,    // Al Noble Ameer
  53: 30,    // Al Noble Wazeer
  54: 45,    // Her Confession
  55: null,  // His Confession
  56: 45,    // Ajwaa
  57: 48,    // Sehr
  58: null,  // Habik Woman
  59: null,  // Eternal Vanille
  60: 37,    // Jassor
  61: null,  // Dinasty
  62: 25,    // Velvet Rose
  63: null,  // Petra
  64: null,  // Atheeri
  65: 30,    // Sakeena
  66: null,  // Emaan
  67: 22,    // Qimmah
  68: 30,    // Ameer Al Oudh
  69: 30,    // Maahir
  70: 58,    // Maahir Black Edition
  71: 35,    // Maahir Legacy
  72: null,  // Ramz Silver
  73: 22,    // Ramz Gold
  74: 22,    // Najdia
  75: null,  // Suqraat
  131: 28,   // Yara
  132: 28,   // Yara Tous
  133: 28,   // Yara Moi
  134: null, // Asad
  135: 35,   // Asad Bourbon
  136: 28,   // Asad Zanzibar
  128: 35,   // Khamrah
  129: 35,   // Khamrah Qwah
  130: 40,   // Khamrah Dukhan
  150: 28,   // Opulent Dubai

  // ==================== FRENCH AVENUE ====================
  76: 30,    // Liquid Brun
  77: 30,    // Aether
  78: 30,    // Luscious
  79: 45,    // Intense Addiction
  80: 30,    // Obsidian
  81: 35,    // Vulcan Feu

  // ==================== AFNAN ====================
  82: 40,    // Supremacy Not Only Intense
  83: 40,    // Supremacy Silver
  84: 40,    // Supremacy Incense
  85: 43,    // Supremacy In Heaven
  86: null,  // 9PM Rebel
  87: null,  // 9PM Pour Femme
  137: 35,   // 9PM
  138: 55,   // 9PM Nite Out
  139: null, // 9PM Elixir
  140: 35,   // 9AM Dive
  152: 43,   // Turathi Electric
  153: 40,   // Turathi Blue

  // ==================== RAVE ====================
  88: 25,    // Rave Now
  89: 25,    // Rave Now Women
  90: 25,    // Rave Rage

  // ==================== MAISON ALHAMBRA ====================
  92: null,  // Baroque Rouge 540
  93: 30,    // Cassius
  94: 40,    // The Tux
  95: 22,    // Glacier Le Noir
  96: null,  // Céleste
  97: 40,    // Tobacco Touch

  // ==================== DUMONT ====================
  98: 40,    // Nitro Pour Homme
  99: 40,    // Nitro Blue
  100: 40,   // Nitro Red
  101: 40,   // Nitro White
  102: 45,   // Nitro Platinum

  // ==================== RASASI ====================
  122: 40,   // Hawas For Him
  123: 40,   // Hawas Tropical
  124: 40,   // Hawas Fire
  125: 40,   // Hawas Malibu
  126: 40,   // Hawas Ice
  127: 45,   // Hawas Elixir

  // ==================== DAVIDOFF ====================
  155: 40,   // Cool Water
  156: 40,   // Cool Water Woman
  157: 40,   // Cool Water Intense

  // ==================== MAISON ALHAMBRA ====================
  158: 30,   // Glacier Bella
  167: 40,   // Sceptre Malachite

  // ==================== JEAN PAUL GAULTIER ====================
  159: 45,   // Le Male Le Parfum
  160: 55,   // Le Beau Le Parfum
  161: 55,   // Le Male Elixir
  162: 40,   // Scandal Pour Homme
  163: 55,   // Le Beau
  164: 55,   // Scandal
  165: 45,   // Scandal Pour Homme Le Parfum
  166: 55,   // Scandal Le Parfum

  // ==================== KHADLAJ ====================
  168: 46,   // Island
  169: 46,   // Island Dreams
  170: 46,   // Island Vanilla Dunes

  // ==================== BHARARA ====================
  176: 40,   // Rome Pour Homme
  178: 45,   // Bharara King
  180: 55,   // Bharara Queen
  181: 55,   // Viking Rio
  182: 45,   // Viking Dubai
  183: 45,   // Viking Cairo
  184: 45,   // Viking Kashmir

  // ==================== LATTAFA ====================
  185: 40,   // Sherif

  // ==================== CAROLINA HERRERA ====================
  186: 80,   // Good Girl
  187: 80,   // Good Girl Blush
  188: 80,   // Very Good Girl
  189: 80,   // Very Good Girl Elixir
  190: 80,   // Good Girl Blush Elixir
  191: 80,   // La Bomba
  192: 80,   // Bad Boy Cobalt PE
  193: 80,   // Bad Boy
  194: 80,   // Bad Boy Cobalt Elixir
  195: 80,   // Bad Boy Extreme
  196: 80,   // Bad Boy Le Parfum
  197: 80,   // Bad Boy Elixir
  198: 80,   // CH Men
  199: 80,   // 212 VIP Men
  200: 80,   // 212 Men
  201: 80,   // 212 VIP Black
};

/**
 * Normalize a perfume name for matching:
 * - Uppercase
 * - Remove accents
 * - Remove special characters (parentheses, dashes)
 * - Remove common brand suffixes
 * - Remove volume suffixes
 */
export function normalizeName(name: string): string {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[()\-_,.]/g, " ") // Replace special chars with space
    .replace(/\b(LATTAFA|AFNAN|ARMAF|DUMONT|RASASI|RAVE)\b/g, "") // Remove brand suffixes
    .replace(/\b(100ML|105ML|200ML|120ML|90ML|80ML|75ML|60ML|55ML|50ML)\b/g, "") // Remove volumes
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
}

/**
 * Extract volume from a perfume name (e.g. "120ML" from "AL HARAMAIN GOLD EDITION 120ML")
 */
export function extractVolume(name: string): string | null {
  const match = name.toUpperCase().match(/\b(\d+ML)\b/);
  return match ? match[1] : null;
}

/**
 * Calculate retail price from wholesale price with margin
 */
export function calculateRetailPrice(wholesale: number | null, marginPercent: number = DEFAULT_MARGIN_PERCENT): number | null {
  if (wholesale === null || wholesale === undefined || isNaN(wholesale)) return null;
  return Math.round(wholesale * (1 + marginPercent / 100));
}

/**
 * Format price for display (USD)
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return "";
  return `$${price}`;
}

/**
 * Interface for the price data from Lista-de-Precios
 * Now includes volume for disambiguation
 */
export interface ListaPriceEntry {
  id: number;
  name: string;
  volume?: string; // Volume like "100ML", "120ML" etc.
  wholesale: number | null;
}

/**
 * Build a price lookup from Lista-de-Precios data.
 * 
 * Creates a TWO-LEVEL lookup map:
 * 1. "NAME + VOLUME" → price (for volume-specific matching, e.g. "AL HARAMAIN GOLD EDITION 120ML")
 * 2. "NAME" → price (for general matching without volume)
 * 
 * When multiple entries have the same normalized name but different volumes,
 * each volume variant gets its own key. The base name (without volume) is set
 * to the FIRST non-null price found for that name.
 */
export function buildListaPriceLookup(prices: ListaPriceEntry[]): Map<string, number | null> {
  const lookup = new Map<string, number | null>();
  
  // Group entries by normalized name to detect duplicates
  const groups = new Map<string, ListaPriceEntry[]>();
  for (const entry of prices) {
    const normalizedName = normalizeName(entry.name);
    if (!groups.has(normalizedName)) {
      groups.set(normalizedName, []);
    }
    groups.get(normalizedName)!.push(entry);
  }
  
  for (const [normalizedName, entries] of groups) {
    if (entries.length > 1) {
      // Multiple entries with same name (different volumes)
      // Add volume-specific keys for each entry
      for (const entry of entries) {
        if (entry.volume && entry.volume.trim() !== '') {
          const volumeKey = `${normalizedName} ${entry.volume.toUpperCase()}`;
          lookup.set(volumeKey, entry.wholesale);
        }
      }
      // Set base name to first non-null price, or first entry's price
      const firstNonNull = entries.find(e => e.wholesale !== null);
      lookup.set(normalizedName, firstNonNull?.wholesale ?? entries[0].wholesale);
    } else {
      // Single entry - just use the normalized name
      lookup.set(normalizedName, entries[0].wholesale);
      // Also add with volume if present
      const entry = entries[0];
      if (entry.volume && entry.volume.trim() !== '') {
        const volumeKey = `${normalizedName} ${entry.volume.toUpperCase()}`;
        lookup.set(volumeKey, entry.wholesale);
      }
    }
  }
  
  return lookup;
}

/**
 * Resolve the wholesale price for a Jolie perfume ID.
 * 
 * Matching priority:
 * 1. Exact match with volume (e.g. "AL HARAMAIN GOLD EDITION 120ML")
 * 2. Exact match without volume (e.g. "AL HARAMAIN GOLD EDITION")
 * 3. Partial match (contains or contained by)
 * 4. Fallback to static prices
 */
export function resolveWholesalePrice(
  jolieId: number,
  listaLookup: Map<string, number | null>
): number | null {
  const listaName = JOLIE_TO_LISTA_NAME[jolieId];
  if (!listaName) {
    // Fall back to static prices
    return FALLBACK_WHOLESALE_PRICES[jolieId] ?? null;
  }

  const normalizedName = normalizeName(listaName);
  
  // Step 1: Try volume-specific match first
  // Extract volume from the JOLIE_TO_LISTA_NAME mapping (e.g. "120ML" from "AL HARAMAIN GOLD EDITION 120ML")
  const volume = extractVolume(listaName);
  if (volume) {
    const volumeKey = `${normalizedName} ${volume}`;
    const volumePrice = listaLookup.get(volumeKey);
    if (volumePrice !== undefined) {
      return volumePrice;
    }
  }

  // Step 2: Try exact match without volume
  const listaPrice = listaLookup.get(normalizedName);
  if (listaPrice !== undefined) {
    return listaPrice;
  }

  // Step 3: Try partial matching
  for (const [key, price] of listaLookup.entries()) {
    if (key.includes(normalizedName) || normalizedName.includes(key)) {
      return price;
    }
  }

  // Step 4: Fall back to static prices
  return FALLBACK_WHOLESALE_PRICES[jolieId] ?? null;
}
