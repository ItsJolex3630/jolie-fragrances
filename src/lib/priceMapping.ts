/**
 * Price System — Direct Retail Prices
 * 
 * Prices sourced directly from the Jolie Fragrances inventory Excel.
 * These are the "Precio Sugerido (+35%)" values — already with markup applied.
 * 
 * To update prices: edit this file and redeploy.
 * Prices in USD. null = not yet priced / out of stock.
 */

// Retail prices (already include 35% markup) from inventory Excel
export const RETAIL_PRICES: Record<number, number | null> = {
  // ==================== ARMAF ====================
  1: 50,     // Club de Nuit Intense Man
  2: null,   // Club de Nuit Intense Man Limited Edition
  3: null,   // Club de Nuit Woman
  4: null,   // Club de Nuit White Imperiale
  5: 41,     // Odyssey Homme White Edition
  91: 42,    // Odyssey Aoud
  104: 47,   // Odyssey Mandarine Sky
  105: 54,   // Odyssey Artisto
  106: 57,   // Odyssey Bahamas
  107: 63,   // Odyssey Toffee Coffee
  108: 41,   // Odyssey Spectra
  109: null, // Odyssey Aqua
  110: 41,   // Odyssey Homme
  111: 63,   // Odyssey Mandarin Sky Vintage Edition
  112: null, // Odyssey Mandarin Sky Elixir
  113: 41,   // Odyssey Mega
  114: 43,   // Odyssey Limoni Fresh
  115: 68,   // Club de Nuit Iconic
  116: 54,   // Club de Nuit Sillage
  117: null, // Club de Nuit Urban Man Elixir
  118: 45,   // Club de Nuit Urban Man
  119: 61,   // Club de Nuit Maleka
  120: null, // Club de Nuit Untold
  121: 74,   // Club de Nuit Precieux I
  141: null, // Yum Yum
  143: null, // Bon Bon
  144: 62,   // Island Bliss
  145: 68,   // Island Breeze
  151: null, // Eter Arabian

  // ==================== AL HARAMAIN ====================
  6: 88,     // Amber Oud Rouge Edition (Gold Edition 100ML)
  7: 88,     // Amber Oud Gold Edition (Gold Edition 120ML)
  8: 78,     // Amber Oud Carbon Edition
  9: 84,     // Amber Oud White Edition
  10: 88,    // L'Aventure (Ruby 100ML)
  11: 88,    // L'Aventure Woman (Ruby 120ML)
  154: 88,   // Amber Oud Aqua Dubai

  // ==================== LATTAFA ====================
  14: 41,    // Bade'e Al Oud Amethyst
  15: 41,    // Bade'e Al Oud Oud for Glory
  16: 41,    // Bade'e Al Oud Honor & Glory
  18: 58,    // Eclaire Pistache
  19: 58,    // Eclaire Banoffi
  20: 36,    // Mayar Natural Intense
  21: 41,    // Fakhar Black (Fakhar Silver price)
  22: 41,    // Fakhar Rose
  103: 34,   // Qaed Al Fursan
  25: 36,    // Qaed Al Fursan Untamed
  26: 34,    // Qaed Al Fursan Unlimited
  27: null,  // Hayaati Florence
  142: 34,   // Hayaati Gold Elixir
  146: 34,   // Hayaati
  147: null, // Hayaati Al Maleky
  148: 47,   // Vintage Radio
  149: 61,   // Emeer
  28: 61,    // Nebras Elixir
  29: 53,    // Asad Elixir
  30: null,  // Ansaam Gold
  31: null,  // Ansaam Silver
  32: null,  // Shaheen Gold
  33: null,  // Shaheen Silver
  34: null,  // Hala
  35: null,  // Ishq Al Shuyukh Gold
  36: null,  // Ishq Al Shuyukh Silver
  37: 47,    // Ta'weel (Atlas Lattafa price)
  38: 54,    // Teriaq Intense
  39: null,  // Musamam White Intense
  40: 51,    // Victoria
  41: null,  // Art Of Universe
  42: 68,    // Vanilla Freak
  43: 68,    // Berry On Top
  44: 68,    // Choco Overdose
  45: 68,    // Mallow Madness
  46: 68,    // Whipped Pleasure
  47: 42,    // The Kingdom Woman
  48: null,  // The Kingdom Men
  49: 54,    // Layaan
  50: null,  // Efeef
  51: 41,    // Al Noble Safeer
  52: 41,    // Al Noble Ameer (Sublime price)
  53: 41,    // Al Noble Wazeer (Sublime price)
  54: 61,    // Her Confession
  55: null,  // His Confession
  56: 61,    // Ajwaa
  57: 65,    // Sehr
  58: null,  // Habik Woman
  59: null,  // Eternal Vanille
  60: 50,    // Jassor
  61: null,  // Dinasty
  62: 34,    // Velvet Rose
  63: null,  // Petra
  64: null,  // Atheeri
  65: 41,    // Sakeena
  66: null,  // Emaan
  67: 30,    // Qimmah
  68: 41,    // Ameer Al Oudh (Oud for Glory price)
  69: 41,    // Maahir (Oud for Glory price)
  70: 78,    // Maahir Black Edition (Carbon price)
  71: 47,    // Maahir Legacy (Fire on Ice price)
  72: null,  // Ramz Silver
  73: 30,    // Ramz Gold
  74: 30,    // Najdia (Ramz Gold price)
  75: null,  // Suqraat
  131: 38,   // Yara
  132: 38,   // Yara Tous
  133: 38,   // Yara Moi
  134: null,  // Asad
  135: 47,   // Asad Bourbon
  136: 38,   // Asad Zanzibar
  128: 47,   // Khamrah
  129: 47,   // Khamrah Qwah
  130: 54,   // Khamrah Dukhan
  150: 38,   // Opulent Dubai

  // ==================== FRENCH AVENUE ====================
  76: 68,    // Liquid Brun
  77: 68,    // Aether (Liquid Brun price)
  78: 41,    // Luscious (Fakhar Rose price)
  79: 61,    // Intense Addiction (Her Confession price)
  80: 41,    // Obsidian (Oud for Glory price)
  81: 70,    // Vulcan Feu

  // ==================== AFNAN ====================
  82: 54,    // Supremacy Not Only Intense (Turathi Blue price)
  83: 54,    // Supremacy Silver (Turathi Blue price)
  84: 54,    // Supremacy Incense (Supremacy Tapis Rouge price)
  85: 58,    // Supremacy In Heaven (Turathi Electric price)
  86: null,  // 9PM Rebel
  87: null,  // 9PM Pour Femme
  137: 47,   // 9PM
  138: 74,   // 9PM Nite Out
  139: null, // 9PM Elixir
  140: null, // 9AM Dive
  152: 58,   // Turathi Electric
  153: 54,   // Turathi Blue

  // ==================== RAVE ====================
  88: 34,    // Rave Now
  89: 34,    // Rave Now Women
  90: 34,    // Rave Rage

  // ==================== MAISON ALHAMBRA ====================
  92: null,  // Baroque Rouge 540
  93: 41,    // Cassius (Fakhar Rose price)
  94: 54,    // The Tux (Turathi Blue price)
  95: 30,    // Glacier Le Noir (Ramz Gold price)
  96: null,  // Céleste
  97: 54,    // Tobacco Touch (Turathi Blue price)

  // ==================== DUMONT ====================
  98: 54,    // Nitro Pour Homme
  99: 54,    // Nitro Blue
  100: 54,   // Nitro Red
  101: 54,   // Nitro White
  102: 61,   // Nitro Platinum

  // ==================== RASASI ====================
  122: 54,   // Hawas For Him
  123: 54,   // Hawas Tropical
  124: 54,   // Hawas Fire
  125: 54,   // Hawas Malibu
  126: 54,   // Hawas Ice
  127: 61,   // Hawas Elixir

  // ==================== DAVIDOFF ====================
  155: 43,   // Cool Water
  156: 46,   // Cool Water Woman
  157: 57,   // Cool Water Intense

  // ==================== MAISON ALHAMBRA ====================
  158: 41,   // Glacier Bella (Fakhar Rose price)
  167: 54,   // Sceptre Malachite (Turathi Blue price)

  // ==================== JEAN PAUL GAULTIER ====================
  159: 61,   // Le Male Le Parfum
  160: 74,   // Le Beau Le Parfum
  161: 74,   // Le Male Elixir
  162: 54,   // Scandal Pour Homme
  163: 74,   // Le Beau
  164: 74,   // Scandal
  165: 61,   // Scandal Pour Homme Le Parfum
  166: 74,   // Scandal Le Parfum

  // ==================== KHADLAJ ====================
  168: 62,   // Island (Island Bliss price)
  169: 62,   // Island Dreams
  170: 62,   // Island Vanilla Dunes

  // ==================== BHARARA ====================
  176: 54,   // Rome Pour Homme
  178: 61,   // Bharara King
  180: 74,   // Bharara Queen
  181: 74,   // Viking Rio
  182: 61,   // Viking Dubai
  183: 61,   // Viking Cairo
  184: 61,   // Viking Kashmir

  // ==================== LATTAFA ====================
  185: 54,   // Sherif

  // ==================== CAROLINA HERRERA ====================
  186: 108,  // Good Girl
  187: 108,  // Good Girl Blush
  188: 108,  // Very Good Girl
  189: 108,  // Very Good Girl Elixir
  190: 108,  // Good Girl Blush Elixir
  191: 236,  // La Bomba
  192: 108,  // Bad Boy Cobalt Parfum Electrique
  193: 108,  // Bad Boy
  194: 108,  // Bad Boy Cobalt Elixir
  195: 108,  // Bad Boy Extreme
  196: 108,  // Bad Boy Le Parfum
  197: 108,  // Bad Boy Elixir
  198: 108,  // CH Men
  199: 108,  // 212 VIP Men
  200: 108,  // 212 Men
  201: 108,  // 212 VIP Black
};

/**
 * Get retail price for a perfume ID
 */
export function getRetailPrice(perfumeId: number): number | null {
  return RETAIL_PRICES[perfumeId] ?? null;
}

/**
 * Format price for display (USD)
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return "";
  return `$${price}`;
}

/**
 * Default markup percentage (for reference / future use)
 */
export const DEFAULT_MARGIN_PERCENT = 35;
