/**
 * Similarity algorithm for comparing perfumes based on their notes and accords.
 * 
 * The similarity score (0–100%) is computed using four weighted components:
 *   1. Individual note overlap (cosine similarity with layer weighting) — 40%
 *   2. Olfactive accord overlap (cosine similarity with label normalization) — 35%
 *   3. Category overlap (PERFUME_NOTES, Jaccard) — 10%
 *   4. Gender compatibility factor — 15%
 *
 * Missing data is penalized (returns 0), never rewarded.
 */

import type { Perfume } from "./perfumes";
import { PERFUME_NOTES } from "./perfumes";

// Re-export from PerfumeDetail so consumers only need this one import
import { NOTE_PYRAMIDS, PERFUME_ACCORDS } from "@/components/PerfumeDetail";

// ─── Types ───

export interface SimilarityResult {
  perfume: Perfume;
  score: number;           // 0–100
  noteOverlap: number;     // 0–100
  accordOverlap: number;   // 0–100
  categoryOverlap: number; // 0–100
  genderBonus: number;     // 0–100
  commonNotes: string[];
  commonAccords: string[];
  commonCategories: string[];
  uniqueToA: string[];
  uniqueToB: string[];
}

// ─── Helper: normalize note name for fuzzy matching ───

const ALIASES: Record<string, string> = {
  // Musk family
  "almizcle": "almizcle",
  "almizcle blanco": "almizcle",
  "musk": "almizcle",
  "white musk": "almizcle",
  "almizcle negro": "almizcle",
  "musk blanco": "almizcle",

  // Amber family
  "ámbar gris": "ámbar",
  "ámbar gris claro": "ámbar",
  "ámbar ligero": "ámbar",
  "amberwood": "ámbar",
  "ambargris": "ámbar",
  "ámbar": "ámbar",
  "amber": "ámbar",

  // Patchouli
  "pachulí": "pachulí",
  "patchouli": "pachulí",

  // Vanilla
  "vainilla": "vainilla",
  "vainilla de madagascar": "vainilla",
  "vainilla negra": "vainilla",
  "vainilla bourbon": "vainilla",

  // Bergamot
  "bergamota": "bergamota",
  "bergamota calabresa": "bergamota",

  // Jasmine
  "jazmín": "jazmín",
  "jazmín sambac": "jazmín",
  "jazmín blanco": "jazmín",

  // Rose family
  "rosa": "rosa",
  "rosa turca": "rosa",
  "rosa de bulgaria": "rosa",
  "rosa búlgara": "rosa",
  "rosa de damasco": "rosa",
  "rosa absoluta": "rosa",
  "damascena": "rosa",
  "peonia": "peonía",

  // Cedar family
  "cedro": "cedro",
  "cedro blanco": "cedro",
  "cedro del atlas": "cedro",
  "cedro de virginia": "cedro",
  "madera de cedro": "cedro",
  "cedro del himalaya": "cedro",

  // Sandalwood
  "sándalo": "sándalo",
  "sándalo blanco": "sándalo",
  "madera de sándalo": "sándalo",

  // Lavender
  "lavanda": "lavanda",
  "lavandín": "lavanda",
  "espliego": "lavanda",

  // Incense / Olibanum
  "incienso": "incienso",
  "olíbano": "incienso",
  "frankincense": "incienso",

  // Vetiver
  "vetiver": "vetiver",
  "vetiver de haití": "vetiver",

  // Pepper family
  "pimienta": "pimienta",
  "pimienta negra": "pimienta",
  "pimienta rosa": "pimienta rosa",
  "pimienta blanca": "pimienta",
  "pink pepper": "pimienta rosa",

  // Spice family
  "cardamomo": "cardamomo",
  "canela": "canela",
  "azafrán": "azafrán",
  "nuez moscada": "nuez moscada",
  "clavo": "clavo",
  "clavo de olor": "clavo",
  "jengibre": "jengibre",
  "cúrcuma": "cúrcuma",
  "comino": "comino",
  "anis": "anís",
  "anís": "anís",
  "hinojo": "hinojo",

  // Tonka
  "haba tonka": "haba tonka",
  "tonka": "haba tonka",
  "faba tonka": "haba tonka",

  // Oud / Agarwood
  "ambroxan": "ambroxan",
  "madera de oud": "oud",
  "madera de agar / oud": "oud",
  "oud": "oud",
  "agarwood": "oud",
  "aloeswood": "oud",

  // Woody notes
  "notas amaderadas": "notas amaderadas",
  "madera blanca": "notas amaderadas",
  "notas de madera": "notas amaderadas",
  "madera": "notas amaderadas",
  "akigalawood": "notas amaderadas",
  "cashmeran": "cachemira",
  "cachemira": "cachemira",

  // Floral family
  "lirio del valle": "lirio del valle",
  "lirio de los valles": "lirio del valle",
  "flor de azahar": "flor de azahar",
  "flor de azahar del naranjo": "flor de azahar",
  "neroli": "flor de azahar",
  "naranja floral": "flor de azahar",
  "flor de naranjo": "flor de azahar",
  "ylang-ylang": "ylang-ylang",
  "cananga": "ylang-ylang",
  "iris": "iris",
  "raíz de iris": "iris",
  "orquídea": "orquídea",
  "magnolia": "magnolia",
  "tulipán": "tulipán",
  "violeta": "violeta",
  "hojas de violeta": "violeta",
  "geranio": "geranio",
  "jacinto": "jacinto",
  "narciso": "narciso",
  "loto": "loto",
  "camelia": "camelia",
  "acacia": "acacia",
  "madreselva": "madreselva",
  "freesia": "freesia",
  "flor de cerezo": "flor de cerezo",
  "sakura": "flor de cerezo",
  "tulipán negro": "tulipán",

  // Citrus family
  "limón": "limón",
  "limón siciliano": "limón",
  "lima": "lima",
  "lime": "lima",
  "naranja": "naranja",
  "naranja amarga": "naranja amarga",
  "naranja dulce": "naranja",
  "mandarina": "mandarina",
  "clementina": "mandarina",
  "pomelo": "pomelo",
  "toronja": "pomelo",
  "yuzu": "yuzu",
  "citrón": "citrón",
  "kumquat": "kumquat",
  "cáscara de limón": "limón",

  // Fruit family
  "manzana": "manzana",
  "manzana verde": "manzana",
  "manzana granny smith": "manzana",
  "piña": "piña",
  "melocotón": "melocotón",
  "durazno (melocotón)": "melocotón",
  "durazno": "melocotón",
  "ciruela": "ciruela",
  "pruna": "ciruela",
  "ciruela negra": "ciruela",
  "grosellas negras": "grosellas",
  "grosella negra": "grosellas",
  "grosella roja": "grosellas",
  "grosellas": "grosellas",
  "frutos rojos": "frutos rojos",
  "frutos del bosque": "frutos rojos",
  "frambuesa": "frambuesa",
  "fresa": "fresa",
  "fresón": "fresa",
  "arándano": "arándano",
  "moras": "moras",
  "mora": "moras",
  "melón": "melón",
  "cantalupo": "melón",
  "sandía": "sandía",
  "coco": "coco",
  "agua de coco": "coco",
  "pera": "pera",
  "higo": "higo",
  "fruta de la pasión": "maracuyá",
  "maracuyá": "maracuyá",
  "granada": "granada",
  "cereza": "cereza",
  "guayaba": "guayaba",
  "mango": "mango",
  "papaya": "papaya",
  "lichi": "lichi",
  "litchi": "lichi",
  "albaricoque": "albaricoque",
  "damasco": "albaricoque",

  // Aquatic / Marine
  "notas acuáticas": "notas acuáticas",
  "notas marinas": "notas acuáticas",
  "agua de mar": "notas acuáticas",
  "brisa marina": "notas acuáticas",
  "algas": "notas acuáticas",
  "sal marina": "notas acuáticas",

  // Moss / Green
  "musgo de roble": "musgo",
  "musgo": "musgo",
  "musgo verde": "musgo",
  "hierba": "hierba",
  "hierba verde": "hierba",
  "hierba recién cortada": "hierba",
  "galbano": "galbano",
  "brezo": "brezo",

  // Resins & Balsams
  "ládano": "ládano",
  "benjuí": "benjuí",
  "mirra": "mirra",
  "resina": "resina",
  "bálsamo": "bálsamo",
  "bálsamo de tolú": "bálsamo",
  "bálsamo de perú": "bálsamo",
  "opopanax": "resina",
  "estoraque": "resina",

  // Gourmand / Sweet
  "cacao": "cacao",
  "chocolate": "cacao",
  "chocolate negro": "cacao",
  "chocolate con leche": "cacao",
  "caramelo": "caramelo",
  "dulce de leche": "caramelo",
  "miel": "miel",
  "café": "café",
  "espresso": "café",
  "café torrado": "café",
  "galleta": "galleta",
  "almendra": "almendra",
  "avellana": "avellana",
  "pistacho": "pistacho",
  "crema de pistacho": "pistacho",
  "nuez": "nuez",
  "cacahuete": "cacahuete",
  "mazapán": "mazapán",
  "praliné": "praliné",
  "azúcar": "azúcar",
  "algodón de azúcar": "azúcar",
  "malvavisco": "malvavisco",
  "crema batida": "crema batida",
  "leche": "leche",
  "leche de almendras": "leche",
  "mantequilla": "mantequilla",
  "tarta": "tarta",
  "tarta de manzana": "tarta",
  "crêpe": "crêpe",

  // Earthy / Smoky
  "notas atalcadas": "notas atalcadas",
  "tabaco": "tabaco",
  "tabaco de pipa": "tabaco",
  "cuero": "cuero",
  "papiro": "papiro",
  "humo": "humo",
  "notas ahumadas": "humo",
  "ceniza": "ceniza",
  "tierra": "tierra",
  "hongos": "hongos",
  "trufa": "trufa",

  // Herbs / Aromatic
  "salvia": "salvia",
  "romero": "romero",
  "tomillo": "tomillo",
  "albahaca": "albahaca",
  "menta": "menta",
  "hierbabuena": "menta",
  "eucalipto": "eucalipto",
  " Artemisa": "artemisa",
  "artemisa": "artemisa",
  "absenta": "artemisa",
  "ajedrea": "ajedrea",
  "mejorana": "mejorana",
  "enebro": "enebro",
  "bayas de enebro": "enebro",
  "pino": "pino",
  "abeto": "abeto",
  "ciprés": "ciprés",

  // Animalic
  "castóreo": "castóreo",
  "civeta": "civeta",
  "ámbar gris (animal)": "ámbar gris animal",

  // Miscellaneous
  "davana": "davana",
  "palo santo": "palo santo",
  "heliotropo": "heliotropo",
  "carrot seed": "semilla de zanahoria",
  "zanahoria": "zanahoria",
  "remolacha": "remolacha",
  "ruibarbo": "ruibarbo",
  "te verde": "té verde",
  "té": "té",
  "té negro": "té negro",
  "té blanco": "té",
  "mate": "mate",
  "pera": "pera",
  "sake": "sake",
  "ron": "ron",
  "whisky": "whisky",
  "vino": "vino",
  "champán": "champán",
  "absenta": "absenta",
  "ouzo": "ouzo",
};

function normalizeNote(name: string): string {
  const lower = name.toLowerCase().trim();
  return ALIASES[lower] ?? lower;
}

// ─── Accord label normalization ───

const ACCORD_ALIASES: Record<string, string> = {
  // Citrus family
  "cítrico": "cítrico",
  "cítricos": "cítrico",
  "citrus": "cítrico",
  "limón": "cítrico",
  "lima": "cítrico",
  "naranja": "cítrico",

  // Woody family
  "amaderado": "amaderado",
  "woodsy": "amaderado",
  "woody": "amaderado",
  "maderoso": "amaderado",
  "madera": "amaderado",
  "madera aromática": "amaderado",

  // Fresh spicy
  "fresco especiado": "fresco especiado",
  "especiado fresco": "fresco especiado",
  "fresh spicy": "fresco especiado",
  "especiado fresco": "fresco especiado",

  // Warm spicy
  "especiado cálido": "especiado cálido",
  "cálido especiado": "especiado cálido",
  "warm spicy": "especiado cálido",
  "especiado": "especiado cálido",
  "picante": "especiado cálido",

  // Aromatic
  "aromático": "aromático",
  "aromatic": "aromático",
  "fougere": "aromático",
  "fougère": "aromático",
  "hecho de helecho": "aromático",

  // Sweet / Gourmand
  "dulce": "dulce",
  "sweet": "dulce",
  "gourmand": "dulce",
  "azucarado": "dulce",
  "goloso": "dulce",
  "caramelo": "dulce",
  "vainilla": "dulce vainilla",
  "vainilloso": "dulce vainilla",

  // Floral
  "floral": "floral",
  "flores blancas": "floral blanco",
  "white floral": "floral blanco",
  "flor blanca": "floral blanco",
  "florales": "floral",
  "rosa": "rosado floral",
  "floral rosado": "rosado floral",
  "powdery floral": "floral atalcado",

  // Powdery
  "atalcado": "atalcado",
  "polvoriento": "atalcado",
  "powdery": "atalcado",
  "notas atalcadas": "atalcado",
  "talc": "atalcado",

  // Musk
  "almizclado": "almizclado",
  "musky": "almizclado",
  "musk": "almizclado",
  "almizcle": "almizclado",

  // Amber
  "ámbar": "ámbar",
  "amber": "ámbar",
  "ámbar gris": "ámbar",
  "ambarino": "ámbar",

  // Earthy
  "terroso": "terroso",
  "earthy": "terroso",
  "tierra": "terroso",

  // Smoky
  "ahumado": "ahumado",
  "smoky": "ahumado",
  "humo": "ahumado",
  "fumado": "ahumado",

  // Oud
  "oud": "oud",
  "agarwood": "oud",
  "madera de oud": "oud",

  // Leather
  "cuero": "cuero",
  "leather": "cuero",

  // Tobacco
  "tabaco": "tabaco",
  "tobacco": "tabaco",

  // Aquatic / Marine
  "acuático": "acuático",
  "marine": "acuático",
  "marino": "acuático",
  "acuatico": "acuático",
  "agua de mar": "acuático",
  "fresco": "fresco",
  "fresh": "fresco",

  // Green
  "verde": "verde",
  "green": "verde",
  "herbal": "verde herbal",
  "hierba": "verde",

  // Animalic
  "animalico": "animalico",
  "animálico": "animalico",
  "animalic": "animalico",

  // Coffee / Chocolate
  "café": "café cacao",
  "coffee": "café cacao",
  "chocolate": "café cacao",
  "cacao": "café cacao",

  // Fruity
  "afrutado": "afrutado",
  "fruity": "afrutado",
  "frutal": "afrutado",
  "frutas": "afrutado",
  "tropical": "tropical afrutado",

  // Balsamic
  "balsámico": "balsámico",
  "balsamic": "balsámico",

  // Alcoholic
  "alcohólico": "alcohólico",
  "ron": "alcohólico",
  "whisky": "alcohólico",
};

function normalizeAccord(label: string): string {
  const lower = label.toLowerCase().trim();
  return ACCORD_ALIASES[lower] ?? lower;
}

// ─── 1. Individual Note Overlap (Cosine Similarity) ───

function getAllNotesWithWeight(pyramid: {
  top: { name: string; percentage: number }[];
  heart: { name: string; percentage: number }[];
  base: { name: string; percentage: number }[];
}): Map<string, number> {
  const map = new Map<string, number>();
  // Slightly rebalanced: top notes matter for first impression,
  // heart is the core identity, base provides depth
  const layerWeights = { top: 0.30, heart: 0.40, base: 0.30 };
  for (const layer of ["top", "heart", "base"] as const) {
    for (const note of pyramid[layer]) {
      const key = normalizeNote(note.name);
      const weighted = note.percentage * layerWeights[layer];
      map.set(key, (map.get(key) ?? 0) + weighted);
    }
  }
  return map;
}

function computeNoteOverlap(p1Id: number, p2Id: number): { score: number; common: string[]; uniqueA: string[]; uniqueB: string[] } {
  const pyramid1 = NOTE_PYRAMIDS[p1Id];
  const pyramid2 = NOTE_PYRAMIDS[p2Id];
  if (!pyramid1 || !pyramid2) return { score: 0, common: [], uniqueA: [], uniqueB: [] };

  const map1 = getAllNotesWithWeight(pyramid1);
  const map2 = getAllNotesWithWeight(pyramid2);

  const allKeys = new Set([...map1.keys(), ...map2.keys()]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  const common: string[] = [];
  const uniqueA: string[] = [];
  const uniqueB: string[] = [];

  for (const key of allKeys) {
    const v1 = map1.get(key) ?? 0;
    const v2 = map2.get(key) ?? 0;
    if (v1 > 0 && v2 > 0) {
      dotProduct += v1 * v2;
      common.push(key);
    } else {
      if (v1 > 0) uniqueA.push(key);
      if (v2 > 0) uniqueB.push(key);
    }
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }

  const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denom === 0) return { score: 0, common: [], uniqueA: [], uniqueB: [] };

  return { score: (dotProduct / denom) * 100, common, uniqueA, uniqueB };
}

// ─── 2. Accord Overlap (Cosine Similarity with normalization) ───

function computeAccordOverlap(p1Id: number, p2Id: number): { score: number; common: string[] } {
  const accords1 = PERFUME_ACCORDS[p1Id];
  const accords2 = PERFUME_ACCORDS[p2Id];
  if (!accords1 || !accords2) return { score: 0, common: [] };

  // Normalize accord labels before comparing
  const map1 = new Map(accords1.map(a => [normalizeAccord(a.label), a.percentage]));
  const map2 = new Map(accords2.map(a => [normalizeAccord(a.label), a.percentage]));

  // Merge same-normalized keys (sum percentages)
  const merged1 = new Map<string, number>();
  for (const [key, val] of map1) {
    merged1.set(key, (merged1.get(key) ?? 0) + val);
  }
  const merged2 = new Map<string, number>();
  for (const [key, val] of map2) {
    merged2.set(key, (merged2.get(key) ?? 0) + val);
  }

  const allKeys = new Set([...merged1.keys(), ...merged2.keys()]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  const common: string[] = [];

  for (const key of allKeys) {
    const v1 = merged1.get(key) ?? 0;
    const v2 = merged2.get(key) ?? 0;
    if (v1 > 0 && v2 > 0) {
      dotProduct += v1 * v2;
      common.push(key);
    }
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }

  const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denom === 0) return { score: 0, common: [] };

  return { score: (dotProduct / denom) * 100, common };
}

// ─── 3. Category Overlap (PERFUME_NOTES) ───
// FIXED: Missing data now returns 0 instead of inflating scores

function computeCategoryOverlap(p1Id: number, p2Id: number): { score: number; common: string[] } {
  const cats1 = (PERFUME_NOTES as Record<number, string[]>)[p1Id] ?? [];
  const cats2 = (PERFUME_NOTES as Record<number, string[]>)[p2Id] ?? [];

  // If either perfume lacks category data, return 0 (penalize missing data)
  if (cats1.length === 0 || cats2.length === 0) return { score: 0, common: [] };

  const set1 = new Set(cats1.map(c => c.toLowerCase()));
  const set2 = new Set(cats2.map(c => c.toLowerCase()));
  const intersection = [...set1].filter(x => set2.has(x));
  const union = new Set([...set1, ...set2]);

  return {
    score: union.size === 0 ? 0 : (intersection.length / union.size) * 100,
    common: intersection,
  };
}

// ─── 4. Gender Compatibility Factor ───
// Same gender = 100 bonus, Unisex match = 80, Cross-gender = 40 (small penalty)

function computeGenderBonus(p1: Perfume, p2: Perfume): number {
  // Same gender → full bonus
  if (p1.gender === p2.gender) return 100;

  // One is Unisex → high compatibility
  if (p1.gender === "Unisex" || p2.gender === "Unisex") return 85;

  // Cross-gender (Dama vs Caballero) → reduced but not zero
  // People do wear opposite-gender fragrances sometimes
  return 50;
}

// ─── Main: compute full similarity ───

export function computeSimilarity(p1: Perfume, p2: Perfume): SimilarityResult {
  const noteResult = computeNoteOverlap(p1.id, p2.id);
  const accordResult = computeAccordOverlap(p1.id, p2.id);
  const categoryResult = computeCategoryOverlap(p1.id, p2.id);
  const genderBonus = computeGenderBonus(p1, p2);

  // Weighted combination:
  // Notes: 40% (most precise — specific ingredient data)
  // Accords: 35% (very important — olfactory profile)
  // Categories: 10% (coarse, supplementary)
  // Gender: 15% (contextual relevance)
  const rawScore =
    noteResult.score * 0.40 +
    accordResult.score * 0.35 +
    categoryResult.score * 0.10 +
    genderBonus * 0.15;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  return {
    perfume: p2,
    score,
    noteOverlap: Math.round(noteResult.score),
    accordOverlap: Math.round(accordResult.score),
    categoryOverlap: Math.round(categoryResult.score),
    genderBonus,
    commonNotes: noteResult.common,
    commonAccords: accordResult.common,
    commonCategories: categoryResult.common,
    uniqueToA: noteResult.uniqueA,
    uniqueToB: noteResult.uniqueB,
  };
}

// ─── Find top N similar perfumes ───
// Now with a minimum score threshold to filter out irrelevant results

export function findSimilarPerfumes(
  target: Perfume,
  catalog: Perfume[],
  limit: number = 8,
  minScore: number = 15
): SimilarityResult[] {
  return catalog
    .filter(p => p.id !== target.id)
    .map(p => computeSimilarity(target, p))
    .filter(r => r.score >= minScore) // Filter out irrelevant results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
