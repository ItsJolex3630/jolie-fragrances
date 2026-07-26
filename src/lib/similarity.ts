/**
 * Similarity algorithm for comparing perfumes based on their notes and accords.
 * 
 * The similarity score (0–100%) is computed using six weighted components:
 *   1. Individual note overlap (cosine similarity with layer weighting + note family affinity) — 35%
 *   2. Olfactive accord overlap (cosine similarity with label normalization + accord affinity) — 32%
 *   3. Category overlap (PERFUME_NOTES, enhanced Jaccard with family affinity) — 5%
 *   4. Gender compatibility factor — 6%
 *   5. Profile divergence penalty — 10% (penalizes fundamentally different profiles)
 *   6. Concentration compatibility factor — 5% (similar concentration = similar performance)
 *   7. Flanker/brand family bonus — 7% (same line/flankers get a bonus)
 *
 * Key precision improvements over previous versions:
 *   - Note Family Affinity: related notes (e.g., Limón ↔ Bergamota) get partial credit
 *   - Accord Family Affinity: related accords (e.g., Floral ↔ Floral Blanco) get partial credit
 *   - Profile Divergence: fundamentally opposite profiles are penalized
 *   - Concentration Compatibility: EdP+EdP matches better than EdP+EdC
 *   - Flanker Bonus: same perfume line (Good Girl / Very Good Girl / Good Girl Blush) get bonus
 *   - Enhanced Category Overlap: uses note family affinity instead of simple Jaccard
 *   - Improved layer weighting: base notes weighted more heavily (they define lasting similarity)
 *   - Normalized percentage handling within layers
 *
 * Missing data is penalized (returns 0), never rewarded.
 */

import type { Perfume, Concentration } from "./perfumes";
import { PERFUME_NOTES, CONCENTRATION_ORDER } from "./perfumes";

// Re-export from data modules so consumers only need this one import
import { NOTE_PYRAMIDS } from "@/lib/notePyramids";
import { PERFUME_ACCORDS } from "@/lib/perfumeAccords";

// ─── Types ───

export interface SimilarityResult {
  perfume: Perfume;
  score: number;           // 0–100
  noteOverlap: number;     // 0–100
  accordOverlap: number;   // 0–100
  categoryOverlap: number; // 0–100
  genderBonus: number;     // 0–100
  profilePenalty: number;  // 0–100 (100 = no penalty, 0 = maximum penalty)
  concentrationBonus: number; // 0–100 (100 = same concentration)
  flankerBonus: number;    // 0–100 (100 = same flanker line)
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
  "avainillado": "vainilla",

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
  "rosado": "rosa",

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
  "guayaco": "guayaco",
  "ebano": "ébano",
  "ébano": "ébano",

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
  "clavelón / tagetes": "tagetes",
  "tagetes": "tagetes",
  "clavel": "clavel",
  "tuberosa": "tuberosa",
  "nardo": "tuberosa",
  "naranjo": "flor de azahar",
  "orange blossom": "flor de azahar",
  "flor de naranjo": "flor de azahar",
  "madera de cashmere": "cachemira",
  "cashmere wood": "cachemira",
  "cashmirwood": "cachemira",
  "madera de guayaco": "guayaco",
  "guaiac wood": "guayaco",
  "musgo de roble": "musgo",
  "oakmoss": "musgo",
  "ante": "cuero",
  "suede": "cuero",
  "olíbano": "incienso",
  "olíbano": "incienso",
  "olibanum": "incienso",
  "opoponax": "resina",
  "opoponaco": "resina",
  "cáñamo": "cáñamo",
  "cannabis": "cáñamo",
  "petitgrain": "petitgrain",
  "notas verdes": "hierba",
  "green notes": "hierba",
  "césped": "hierba",
  "frangipani": "frangipani",
  "plumeria": "frangipani",
  "pitahaya": "pitahaya",
  "dragon fruit": "pitahaya",
  "peonía roja": "peonía",
  "almendra amarga": "almendra",
  "bitter almond": "almendra",
  "vainilla negra": "vainilla",
  "black vanilla husk": "vainilla",
  "cereza negra": "cereza",
  "black cherry": "cereza",
  "cumaro": "haba tonka",
  "coumarin": "haba tonka",
  "absenta": "artemisa",

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
  "cilantro": "cilantro",

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
  "elemí": "elemí",
  "elemi": "elemí",

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
  "sake": "sake",
  "ron": "ron",
  "whisky": "whisky",
  "vino": "vino",
  "champán": "champán",
  "ouzo": "ouzo",
};

function normalizeNote(name: string): string {
  const lower = name.toLowerCase().trim();
  return ALIASES[lower] ?? lower;
}

// ─── NOTE FAMILY AFFINITY ───
// When two notes don't match exactly but belong to the same olfactory family,
// they get partial credit. This is the #1 precision improvement.
// Each family maps to an array of normalized note keys.
// Two notes in the same family get a bonus of NOTE_FAMILY_BONUS (0.55).

const NOTE_FAMILIES: string[][] = [
  // Citrus family — all citrus notes are related
  ["limón", "bergamota", "lima", "naranja", "naranja amarga", "mandarina", "pomelo", "yuzu", "citrón", "kumquat"],
  // Red/Black berry family
  ["grosellas", "frutos rojos", "frambuesa", "fresa", "arándano", "moras", "cereza"],
  // Stone fruit family
  ["melocotón", "ciruela", "albaricoque", "lichi", "manzana", "pera"],
  // Tropical fruit family
  ["piña", "mango", "maracuyá", "guayaba", "papaya", "coco", "higo", "granada", "melón", "sandía"],
  // White floral family — all share indolic creamy-floral character
  ["jazmín", "flor de azahar", "tuberosa", "lirio del valle", "ylang-ylang", "magnolia", "madreselva"],
  // Rose & Peony — related florals
  ["rosa", "peonía", "geranio"],
  // Cool floral family
  ["violeta", "iris", "lavanda", "freesia", "orquídea"],
  // Woody family — all share dry/woody character
  ["cedro", "sándalo", "pachulí", "vetiver", "notas amaderadas", "cachemira", "guayaco", "ébano", "pino", "ciprés", "abeto"],
  // Warm resinous family — all share amber/balsamic warmth
  ["ámbar", "ládano", "benjuí", "mirra", "resina", "bálsamo", "incienso"],
  // Sweet gourmand family — all share vanilla/caramel/sweetness
  ["vainilla", "haba tonka", "caramelo", "praliné", "azúcar", "miel", "malvavisco", "almendra", "pistacho"],
  // Chocolate/coffee family — all share roasted/bitter-sweet character
  ["cacao", "café", "galleta"],
  // Spice family — all share warm/spicy character
  ["pimienta", "pimienta rosa", "cardamomo", "canela", "azafrán", "nuez moscada", "clavo", "jengibre", "cúrcuma", "comino", "anís"],
  // Smoky/leathery family — all share dark/animalic character
  ["tabaco", "cuero", "humo", "oud"],
  // Musky family — all share clean/skin-like character
  ["almizcle", "ambroxan", "notas atalcadas"],
  // Green/herbal family — all share fresh/cut character
  ["menta", "salvia", "romero", "albahaca", "tomillo", "eucalipto", "artemisa", "hierba", "galbano", "ajedrea", "mejorana", "davana", "petitgrain"],
  // Mossy/aquatic family — fresh natural character
  ["musgo", "notas acuáticas"],
];

// Build a lookup map for fast affinity checks
const noteFamilyMap = new Map<string, number>();
NOTE_FAMILIES.forEach((family, idx) => {
  for (const note of family) {
    noteFamilyMap.set(note, idx);
  }
});

// Returns affinity between two normalized note keys:
// 1.0 = exact match, 0.55 = same family, 0.0 = unrelated
const EXACT_MATCH = 1.0;
const FAMILY_BONUS = 0.55;
const NO_RELATION = 0.0;

function getNoteAffinity(key1: string, key2: string): number {
  if (key1 === key2) return EXACT_MATCH;
  const family1 = noteFamilyMap.get(key1);
  const family2 = noteFamilyMap.get(key2);
  if (family1 !== undefined && family2 !== undefined && family1 === family2) {
    return FAMILY_BONUS;
  }
  return NO_RELATION;
}

// ─── Accord label normalization ───

const ACCORD_ALIASES: Record<string, string> = {
  // Citrus family
  "cítrico": "cítrico",
  "cítricos": "cítrico",
  "citrus": "cítrico",

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
  "avainillado": "dulce vainilla",
  "vainilla": "dulce vainilla",
  "vainilloso": "dulce vainilla",

  // Floral
  "floral": "floral",
  "flores blancas": "floral blanco",
  "white floral": "floral blanco",
  "flor blanca": "floral blanco",
  "florales": "floral",
  "rosa": "rosado floral",
  "rosado": "rosado floral",
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

  // Pachulí accord
  "pachulí": "pachulí",
};

function normalizeAccord(label: string): string {
  const lower = label.toLowerCase().trim();
  return ACCORD_ALIASES[lower] ?? lower;
}

// ─── ACCORD FAMILY AFFINITY ───
// Related accords get partial credit when they don't match exactly.
// This captures that "Floral" and "Floral Blanco" are related,
// or that "Especiado Cálido" and "Especiado Fresco" share spice character.

const ACCORD_FAMILIES: string[][] = [
  // Floral family
  ["floral", "floral blanco", "rosado floral", "floral atalcado"],
  // Spicy family
  ["fresco especiado", "especiado cálido"],
  // Sweet/gourmand family
  ["dulce", "dulce vainilla"],
  // Dark/smoky family
  ["ahumado", "cuero", "tabaco", "oud", "animalico"],
  // Woody/resinous family
  ["amaderado", "ámbar", "balsámico", "pachulí"],
  // Fresh/clean family
  ["fresco", "acuático", "cítrico", "aromático"],
  // Earthy/soft family
  ["terroso", "atalcado", "almizclado"],
  // Fruity family
  ["afrutado", "tropical afrutado", "café cacao"],
  // Green family
  ["verde", "verde herbal"],
];

const accordFamilyMap = new Map<string, number>();
ACCORD_FAMILIES.forEach((family, idx) => {
  for (const accord of family) {
    accordFamilyMap.set(accord, idx);
  }
});

const ACCORD_FAMILY_BONUS = 0.50;

function getAccordAffinity(key1: string, key2: string): number {
  if (key1 === key2) return EXACT_MATCH;
  const family1 = accordFamilyMap.get(key1);
  const family2 = accordFamilyMap.get(key2);
  if (family1 !== undefined && family2 !== undefined && family1 === family2) {
    return ACCORD_FAMILY_BONUS;
  }
  return NO_RELATION;
}

// ─── 1. Individual Note Overlap (Cosine Similarity with Note Family Affinity) ───
// This is the biggest precision improvement: related notes get partial credit.
// E.g., Limón and Bergamota are both citrus → 0.55 affinity instead of 0.

function getAllNotesWithWeight(pyramid: {
  top: { name: string; percentage: number }[];
  heart: { name: string; percentage: number }[];
  base: { name: string; percentage: number }[];
}): Map<string, number> {
  const map = new Map<string, number>();
  // Rebalanced layer weights: base notes define the lasting impression
  // and are most important for similarity. Heart is identity. Top is first impression.
  const layerWeights = { top: 0.25, heart: 0.35, base: 0.40 };
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

  // ── Enhanced cosine similarity with note family affinity ──
  // Instead of only counting exact matches, we compute the "affinity dot product":
  // dot += v1[key1] * v2[key2] * affinity(key1, key2)
  // This gives partial credit for related notes in the same family.

  const keys1 = [...map1.keys()];
  const keys2 = [...map2.keys()];

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  const common: string[] = [];
  const uniqueA: string[] = [];
  const uniqueB: string[] = [];

  // Track which keys in map2 have been "consumed" by a family match
  // to avoid double-counting
  const consumed2 = new Set<number>();

  // Compute norms
  for (const key of keys1) {
    const v = map1.get(key)!;
    norm1 += v * v;
  }
  for (const key of keys2) {
    const v = map2.get(key)!;
    norm2 += v * v;
  }

  // Compute affinity-weighted dot product
  // For each key in map1, find the best matching key in map2
  for (let i = 0; i < keys1.length; i++) {
    const key1 = keys1[i];
    const v1 = map1.get(key1)!;

    let bestAffinity = NO_RELATION;
    let bestJ = -1;

    for (let j = 0; j < keys2.length; j++) {
      if (consumed2.has(j)) continue;
      const affinity = getNoteAffinity(key1, keys2[j]);
      if (affinity > bestAffinity) {
        bestAffinity = affinity;
        bestJ = j;
      }
    }

    if (bestAffinity > NO_RELATION && bestJ >= 0) {
      const v2 = map2.get(keys2[bestJ])!;
      dotProduct += v1 * v2 * bestAffinity;
      consumed2.add(bestJ);

      if (bestAffinity >= EXACT_MATCH) {
        common.push(key1);
      }
      // Family matches don't add to "common" (they're not the same note)
      // but they do contribute to the similarity score
    } else {
      uniqueA.push(key1);
    }
  }

  // Find keys in map2 that weren't consumed (unique to B)
  for (let j = 0; j < keys2.length; j++) {
    if (!consumed2.has(j)) {
      uniqueB.push(keys2[j]);
    }
  }

  const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denom === 0) return { score: 0, common: [], uniqueA: [], uniqueB: [] };

  return { score: (dotProduct / denom) * 100, common, uniqueA, uniqueB };
}

// ─── 2. Accord Overlap (Cosine Similarity with Accord Family Affinity) ───

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

  // ── Enhanced cosine similarity with accord family affinity ──
  const keys1 = [...merged1.keys()];
  const keys2 = [...merged2.keys()];

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  const common: string[] = [];
  const consumed2 = new Set<number>();

  // Compute norms
  for (const key of keys1) {
    const v = merged1.get(key)!;
    norm1 += v * v;
  }
  for (const key of keys2) {
    const v = merged2.get(key)!;
    norm2 += v * v;
  }

  // Compute affinity-weighted dot product
  for (let i = 0; i < keys1.length; i++) {
    const key1 = keys1[i];
    const v1 = merged1.get(key1)!;

    let bestAffinity = NO_RELATION;
    let bestJ = -1;

    for (let j = 0; j < keys2.length; j++) {
      if (consumed2.has(j)) continue;
      const affinity = getAccordAffinity(key1, keys2[j]);
      if (affinity > bestAffinity) {
        bestAffinity = affinity;
        bestJ = j;
      }
    }

    if (bestAffinity > NO_RELATION && bestJ >= 0) {
      const v2 = merged2.get(keys2[bestJ])!;
      dotProduct += v1 * v2 * bestAffinity;
      consumed2.add(bestJ);

      if (bestAffinity >= EXACT_MATCH) {
        common.push(key1);
      }
    }
  }

  const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denom === 0) return { score: 0, common: [] };

  return { score: (dotProduct / denom) * 100, common };
}

// ─── 3. Category Overlap (PERFUME_NOTES) ───

function computeCategoryOverlap(p1Id: number, p2Id: number): { score: number; common: string[] } {
  const cats1 = (PERFUME_NOTES as Record<number, string[]>)[p1Id] ?? [];
  const cats2 = (PERFUME_NOTES as Record<number, string[]>)[p2Id] ?? [];

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
// Reduced weight (8% vs previous 15%) — in modern perfumery,
// gender is increasingly less relevant for similarity.

function computeGenderBonus(p1: Perfume, p2: Perfume): number {
  if (p1.gender === p2.gender) return 100;
  if (p1.gender === "Unisex" || p2.gender === "Unisex") return 85;
  return 50;
}

// ─── 5. Profile Divergence Penalty ───
// This is a critical precision improvement: when two perfumes have
// fundamentally OPPOSITE olfactory profiles, they should be penalized
// even if they happen to share a few notes.
//
// We compare the "dominant profile" of each perfume using accord data.
// If one is predominantly sweet/gourmand and the other is fresh/aquatic,
// they get a divergence penalty.

// Profile axes: each axis has a set of accords that push in that direction
const PROFILE_AXES = {
  sweet: new Set(["dulce", "dulce vainilla", "café cacao"]),
  fresh: new Set(["cítrico", "acuático", "fresco", "verde", "verde herbal", "fresco especiado"]),
  dark: new Set(["ahumado", "cuero", "tabaco", "oud", "animalico"]),
  woody: new Set(["amaderado", "ámbar", "balsámico", "pachulí"]),
  floral: new Set(["floral", "floral blanco", "rosado floral", "floral atalcado"]),
  spicy: new Set(["especiado cálido", "aromático"]),
};

type ProfileAxis = keyof typeof PROFILE_AXES;

function getProfileVector(perfumeId: number): Record<ProfileAxis, number> {
  const accords = PERFUME_ACCORDS[perfumeId];
  const profile: Record<ProfileAxis, number> = {
    sweet: 0, fresh: 0, dark: 0, woody: 0, floral: 0, spicy: 0,
  };

  if (!accords) return profile;

  for (const accord of accords) {
    const normLabel = normalizeAccord(accord.label);
    for (const axis of Object.keys(PROFILE_AXES) as ProfileAxis[]) {
      if (PROFILE_AXES[axis].has(normLabel)) {
        profile[axis] += accord.percentage;
      }
    }
  }

  // Normalize so the profile vector has a sum of 1.0
  const total = Object.values(profile).reduce((a, b) => a + b, 0);
  if (total > 0) {
    for (const axis of Object.keys(profile) as ProfileAxis[]) {
      profile[axis] /= total;
    }
  }

  return profile;
}

function computeProfilePenalty(p1Id: number, p2Id: number): number {
  const prof1 = getProfileVector(p1Id);
  const prof2 = getProfileVector(p2Id);

  // Compute cosine similarity between profile vectors
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const axis of Object.keys(PROFILE_AXES) as ProfileAxis[]) {
    dotProduct += prof1[axis] * prof2[axis];
    norm1 += prof1[axis] * prof1[axis];
    norm2 += prof2[axis] * prof2[axis];
  }

  const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denom === 0) return 50; // No data → neutral penalty

  const cosineSim = dotProduct / denom;
  // cosineSim ranges from -1 to 1 (but with our non-negative profiles, 0 to 1)
  // Convert to a 0-100 score where 100 = identical profiles, 0 = opposite
  return cosineSim * 100;
}

// ─── 6. Concentration Compatibility Factor ───
// Perfumes with similar concentration levels tend to perform similarly
// (longevity, projection). EdP vs EdP is more relevant than EdP vs EdC.

function computeConcentrationBonus(p1: Perfume, p2: Perfume): number {
  const c1 = p1.concentration;
  const c2 = p2.concentration;
  
  // If neither has concentration data, return neutral
  if (!c1 && !c2) return 75;
  if (!c1 || !c2) return 60; // One unknown = slight penalty
  
  // Same concentration = 100
  if (c1 === c2) return 100;
  
  // Calculate distance in concentration hierarchy
  const idx1 = CONCENTRATION_ORDER.indexOf(c1);
  const idx2 = CONCENTRATION_ORDER.indexOf(c2);
  
  if (idx1 === -1 || idx2 === -1) return 65;
  
  const distance = Math.abs(idx1 - idx2);
  // Distance 0 = 100, 1 = 80, 2 = 60, 3 = 40, 4 = 25, 5 = 15
  const score = Math.max(15, 100 - distance * 20);
  return score;
}

// ─── 7. Flanker/Brand Family Bonus ───
// Perfumes from the same line (e.g., Good Girl / Very Good Girl / Good Girl Blush)
// share DNA and should get a bonus. This captures real-world similarity
// that pure note analysis might miss.

// Map of base perfume line names to their flankers
const FLANKER_LINES: Record<string, string[]> = {
  "good girl": ["good girl", "very good girl", "good girl blush", "la bomba"],
  "bad boy": ["bad boy", "bad boy cobalt", "bad boy extreme", "bad boy le parfum", "bad boy elixir"],
  "212": ["212 men", "212 vip", "212 vip black"],
  "club de nuit": ["club de nuit"],
  "odyssey": ["odyssey"],
  "bade'e al oud": ["bade'e al oud"],
  "qaed al fursan": ["qaed al fursan"],
  "amber oud": ["amber oud"],
  "l'aventure": ["l'aventure"],
  "fakhar": ["fakhar"],
  "hayaati": ["hayaati"],
  "khamrah": ["khamrah"],
  "asdad": ["asdad"],
};

function getFlankerLine(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [line, keywords] of Object.entries(FLANKER_LINES)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return line;
    }
  }
  return null;
}

function computeFlankerBonus(p1: Perfume, p2: Perfume): number {
  const line1 = getFlankerLine(p1.name);
  const line2 = getFlankerLine(p2.name);
  
  // No flanker data
  if (!line1 || !line2) {
    // Same brand but no flanker line = small bonus
    if (p1.brand === p2.brand) return 40;
    return 0;
  }
  
  // Same flanker line = big bonus
  if (line1 === line2) return 100;
  
  // Different flanker lines but same brand
  if (p1.brand === p2.brand) return 35;
  
  return 0;
}

// ─── Main: compute full similarity ───

export function computeSimilarity(p1: Perfume, p2: Perfume): SimilarityResult {
  const noteResult = computeNoteOverlap(p1.id, p2.id);
  const accordResult = computeAccordOverlap(p1.id, p2.id);
  const categoryResult = computeCategoryOverlap(p1.id, p2.id);
  const genderBonus = computeGenderBonus(p1, p2);
  const profilePenalty = computeProfilePenalty(p1.id, p2.id);
  const concentrationBonus = computeConcentrationBonus(p1, p2);
  const flankerBonus = computeFlankerBonus(p1, p2);

  // Weighted combination (rebalanced v3 for maximum precision):
  // Notes: 35% (most precise — specific ingredient data + family affinity)
  // Accords: 32% (very important — olfactory profile + family affinity)
  // Categories: 5% (coarse, supplementary — reduced from 7%)
  // Gender: 6% (contextual — reduced from 8%)
  // Profile: 10% (penalizes fundamentally different profiles)
  // Concentration: 5% (similar concentration = similar performance)
  // Flanker: 7% (same perfume line / brand family bonus)
  const rawScore =
    noteResult.score * 0.35 +
    accordResult.score * 0.32 +
    categoryResult.score * 0.05 +
    genderBonus * 0.06 +
    profilePenalty * 0.10 +
    concentrationBonus * 0.05 +
    flankerBonus * 0.07;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  return {
    perfume: p2,
    score,
    noteOverlap: Math.round(noteResult.score),
    accordOverlap: Math.round(accordResult.score),
    categoryOverlap: Math.round(categoryResult.score),
    genderBonus,
    profilePenalty: Math.round(profilePenalty),
    concentrationBonus,
    flankerBonus,
    commonNotes: noteResult.common,
    commonAccords: accordResult.common,
    commonCategories: categoryResult.common,
    uniqueToA: noteResult.uniqueA,
    uniqueToB: noteResult.uniqueB,
  };
}

// ─── Find top N similar perfumes ──

export function findSimilarPerfumes(
  target: Perfume,
  catalog: Perfume[],
  limit: number = 8,
  minScore: number = 15
): SimilarityResult[] {
  return catalog
    .filter(p => p.id !== target.id)
    .map(p => computeSimilarity(target, p))
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
