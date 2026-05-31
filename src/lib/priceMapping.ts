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
  1: null,
  2: null,
  3: 43,
  4: null,
  5: 41,
  6: 88,
  7: 88,
  8: 78,
  9: 84,
  10: null,
  11: null,
  14: 41,
  15: 41,
  16: 41,
  18: 58,
  19: 58,
  20: 36,
  21: 41,
  22: 41,
  25: 36,
  26: 34,
  27: null,
  28: 61,
  29: 53,
  30: null,
  31: null,
  32: null,
  33: null,
  34: null,
  35: null,
  36: null,
  37: null,
  38: 54,
  39: null,
  40: 51,
  41: null,
  42: 68,
  43: 68,
  44: 68,
  45: 68,
  46: 68,
  47: null,
  48: null,
  49: 54,
  50: null,
  51: 41,
  52: null,
  53: null,
  54: null,
  55: null,
  56: 61,
  57: 65,
  58: null,
  59: null,
  60: 50,
  61: null,
  62: 34,
  63: null,
  64: null,
  65: 41,
  66: 34,
  67: 30,
  68: null,
  69: null,
  70: null,
  71: null,
  72: null,
  73: 30,
  74: null,
  75: null,
  76: 68,
  77: null,
  78: null,
  79: null,
  80: null,
  81: 70,
  82: null,
  83: null,
  84: null,
  85: null,
  86: null,
  87: null,
  88: null,
  89: null,
  90: null,
  91: 42,
  92: null,
  93: null,
  94: null,
  95: null,
  96: null,
  97: null,
  98: 54,
  99: 54,
  100: null,
  101: null,
  102: 61,
  103: 34,
  104: 47,
  105: 54,
  106: 57,
  107: 63,
  108: 41,
  109: null,
  110: 41,
  111: null,
  112: 70,
  113: 41,
  114: 43,
  115: 68,
  116: 54,
  117: null,
  118: null,
  119: 61,
  120: null,
  121: 74,
  122: null,
  123: 68,
  124: 65,
  125: null,
  126: null,
  127: 57,
  128: 47,
  129: 47,
  130: 54,
  131: 38,
  132: 38,
  133: 38,
  134: null,
  135: 47,
  136: 38,
  137: 47,
  138: 74,
  139: null,
  140: null,
  141: null,
  142: null,
  143: null,
  144: 62,
  145: 68,
  146: 34,
  147: null,
  148: 47,
  149: 61,
  150: 38,
  151: null,
  152: 58,
  153: 54,
  154: null,
  155: 43,
  156: 46,
  157: 57,
  158: null,
  159: null,
  160: null,
  161: null,
  162: null,
  163: null,
  164: null,
  165: null,
  166: null,
  167: 41,
  168: 62,
  169: null,
  170: null,
  176: null,
  178: null,
  180: 92,
  181: 109,
  182: null,
  183: null,
  184: null,
  185: null,
  186: null,
  187: null,
  188: null,
  189: null,
  190: null,
  191: null,
  192: null,
  193: null,
  194: null,
  195: null,
  196: null,
  197: null,
  198: null,
  199: null,
  200: null,
  201: null,
  202: 74,
  203: 74,
  204: 55,
  206: 54,
  207: 42,
  208: 41,
  209: 61,
  210: 57,
  211: 61,
  212: 61,
  213: 54,
  214: 74,

  // ==================== LATTAFA (combos/nuevos) ====================
  215: 41,  // Fakhar Silver
  216: 74,  // Veneno Bianco
  217: 34,  // Ana Abiyedh Coral
  218: 45,  // Mayar Cherry
  219: 47,  // Eclaire
  220: 51,  // Tharwah Silver
  221: 61,  // Shaghaf Oud Azraq
  222: 61,  // Casablanca
  223: 47,  // Tiramisu Caramel
  228: 47,  // Yara Candy
  230: 47,  // Yara Elixir
  231: 47,  // Bade'e Al Oud Sublime

  // ==================== PARIS CORNER ====================
  224: 41,  // Caramel Cascade (catálogo $30 → +35% = $41)
  226: 41,  // Khair Fusion (catálogo $30 → +35% = $41)
  227: 41,  // Khair Confection (catálogo $30 → +35% = $41)
  232: 55,  // Indomitable (catálogo $41 → +35% = $55)
  233: 72,  // Marshmallow Blush (catálogo $53 → +35% = $72)
  234: 32,  // Khair (catálogo $24 → +35% = $32)
  235: 45,  // Khair Felicity (catálogo $33 → +35% = $45)
  236: 57,  // December (catálogo $42 → +35% = $57)
  237: 57,  // Emir Memories of Summer (catálogo $42 → +35% = $57)
  238: 54,  // Taskeen (catálogo $40 → +35% = $54)
  239: 41,  // Taskeen Marina (catálogo $30 → +35% = $41)
  240: 41,  // Lactea Divina (catálogo $30 → +35% = $41)
  241: 53,  // Fayora (catálogo $39 → +35% = $53)
  242: 43,  // Mango Punch (catálogo $32 → +35% = $43)
  243: 43,  // Juice Melange (catálogo $32 → +35% = $43)
  244: 43,  // Pear Potion (catálogo $32 → +35% = $43)
  245: 38,  // Qissa Pink (catálogo $28 → +35% = $38)
  246: 38,  // Qissa Delicius (catálogo $28 → +35% = $38)
  247: 38,  // Qissa Blue (catálogo $28 → +35% = $38)

  // ==================== ZIMAYA ====================
  248: 32,  // Evolution (catálogo $24 → +35% = $32)
  249: 47,  // Tiramisu Coco (catálogo $35 → +35% = $47)
  250: 36,  // Charisma (catálogo $27 → +35% = $36)
  251: 31,  // Grandeur (catálogo $23 → +35% = $31)
  252: null, // Is Great (No Disponible)
  253: null, // Happy Oud (No Disponible)
  254: 38,  // Fatima Pink (catálogo $28 → +35% = $38)
  255: 38,  // Fatima Velvet (catálogo $28 → +35% = $38)
  256: 32,  // Only You (catálogo $24 → +35% = $32)
  257: 38,  // Hayam (catálogo $28 → +35% = $38)
  258: 35,  // Anhaar Valley (catálogo $26 → +35% = $35)
  259: null, // Hawwa Red (No Disponible)

  // ==================== ARABIYAT (Arabiyat Sugar) ====================
  260: 54,  // Coconut Chiffon (catálogo $40 → +35% = $54)
  261: 54,  // Berries Cream Macaron (catálogo $40 → +35% = $54)
  262: 54,  // Strawberry Tres Leches (catálogo $40 → +35% = $54)
  263: 54,  // Vanilla Cream Macaron (catálogo $40 → +35% = $54)
  264: 54,  // Mango Affogato (catálogo $40 → +35% = $54)
  265: 54,  // Caramel Chocolate Macaron (catálogo $40 → +35% = $54)
  266: 54,  // Dulce de Leche (catálogo $40 → +35% = $54)
  267: 54,  // Sugar Cotton (catálogo $40 → +35% = $54)
  268: 54,  // Pecan Butter (catálogo $40 → +35% = $54)
  269: 54,  // Lemon Sorbet (catálogo $40 → +35% = $54)
  270: 54,  // Cookie Dough (catálogo $40 → +35% = $54)
  271: 54,  // Matcha Latte (catálogo $40 → +35% = $54)
  272: 54,  // Toffe Ganache (catálogo $40 → +35% = $54)

  // ==================== ARABIYAT ====================
  273: 74,  // Marwa (compra $55 → +35% = $74)
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