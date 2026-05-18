export type Gender = "Dama" | "Caballero" | "Unisex";

export type Note =
  | "Cítrico"
  | "Dulce"
  | "Amaderado"
  | "Especiado"
  | "Floral"
  | "Acuático"
  | "Ámbar"
  | "Ahumado"
  | "Frutal";

export const NOTES: Note[] = [
  "Cítrico",
  "Dulce",
  "Amaderado",
  "Especiado",
  "Floral",
  "Acuático",
  "Ámbar",
  "Ahumado",
  "Frutal",
];

export const NOTES_INFO: Record<
  Note,
  { emoji: string; color: string; bgColor: string; borderColor: string }
> = {
  Cítrico: {
    emoji: "🍊",
    color: "text-orange-300",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
  },
  Dulce: {
    emoji: "🍬",
    color: "text-pink-300",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/30",
  },
  Amaderado: {
    emoji: "🪵",
    color: "text-amber-300",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/30",
  },
  Especiado: {
    emoji: "🌶️",
    color: "text-red-300",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30",
  },
  Floral: {
    emoji: "🌸",
    color: "text-rose-300",
    bgColor: "bg-rose-500/20",
    borderColor: "border-rose-500/30",
  },
  Acuático: {
    emoji: "🌊",
    color: "text-teal-300",
    bgColor: "bg-teal-500/20",
    borderColor: "border-teal-500/30",
  },
  Ámbar: {
    emoji: "✨",
    color: "text-yellow-300",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30",
  },
  Ahumado: {
    emoji: "🔥",
    color: "text-stone-300",
    bgColor: "bg-stone-500/20",
    borderColor: "border-stone-500/30",
  },
  Frutal: {
    emoji: "🍓",
    color: "text-fuchsia-300",
    bgColor: "bg-fuchsia-500/20",
    borderColor: "border-fuchsia-500/30",
  },
};

// Map perfume IDs to their olfactive notes (primary notes)
export const PERFUME_NOTES: Record<number, Note[]> = {
  // ==================== ARMAF ====================
  1: ["Cítrico", "Amaderado"], // Club de Nuit Intense Man
  2: ["Cítrico", "Amaderado"], // Club de Nuit Intense Man LE
  3: ["Frutal", "Floral"], // Club de Nuit Woman
  4: ["Cítrico", "Amaderado"], // Club de Nuit White Imperiale
  115: ["Cítrico", "Acuático"], // Club de Nuit Iconic
  116: ["Floral", "Amaderado"], // Club de Nuit Sillage
  117: ["Cítrico", "Especiado"], // Club de Nuit Urban Man Elixir
  118: ["Cítrico", "Amaderado"], // Club de Nuit Urban Man
  119: ["Floral", "Dulce"], // Club de Nuit Maleka
  120: ["Floral", "Ámbar"], // Club de Nuit Untold
  121: ["Ámbar", "Dulce"], // Club de Nuit Precieux I
  5: ["Cítrico", "Amaderado"], // Odyssey Homme White Edition
  91: ["Amaderado", "Ahumado"], // Odyssey Aoud
  104: ["Cítrico", "Dulce"], // Odyssey Mandarine Sky
  105: ["Especiado", "Amaderado"], // Odyssey Artisto
  106: ["Acuático", "Frutal"], // Odyssey Bahamas
  107: ["Dulce"], // Odyssey Toffee Coffee
  108: ["Frutal", "Amaderado"], // Odyssey Spectra
  109: ["Acuático", "Cítrico"], // Odyssey Aqua
  110: ["Amaderado", "Ámbar"], // Odyssey Homme
  111: ["Cítrico", "Amaderado"], // Odyssey Mandarin Sky Vintage
  112: ["Cítrico", "Dulce"], // Odyssey Mandarin Sky Elixir
  113: ["Cítrico", "Especiado"], // Odyssey Mega
  114: ["Cítrico"], // Odyssey Limoni Fresh
  141: ["Dulce", "Frutal"], // Yum Yum
  143: ["Dulce", "Floral"], // Bon Bon
  144: ["Frutal", "Dulce"], // Island Bliss
  145: ["Frutal", "Floral"], // Island Breeze
  151: ["Cítrico", "Amaderado"], // Eter Arabian

  // ==================== AL HARAMAIN ====================
  6: ["Ámbar", "Amaderado"], // Amber Oud Rouge
  7: ["Ámbar", "Dulce"], // Amber Oud Gold
  8: ["Amaderado", "Ahumado"], // Amber Oud Carbon
  9: ["Ámbar", "Floral"], // Amber Oud White
  10: ["Cítrico", "Amaderado"], // L'Aventure
  11: ["Floral", "Frutal"], // L'Aventure Woman
  154: ["Ámbar", "Frutal"], // Amber Oud Aqua Dubai

  // ==================== LATTAFA ====================
  14: ["Amaderado", "Ámbar"], // Bade'e Al Oud Amethyst
  15: ["Amaderado", "Ahumado"], // Bade'e Al Oud Oud for Glory
  16: ["Amaderado", "Especiado"], // Bade'e Al Oud Honor & Glory
  18: ["Dulce"], // Eclaire Pistache
  19: ["Dulce"], // Eclaire Banoffi
  20: ["Floral", "Dulce"], // Mayar Natural Intense
  21: ["Cítrico", "Amaderado"], // Fakhar Black
  22: ["Floral", "Dulce"], // Fakhar Rose
  103: ["Amaderado", "Dulce"], // Qaed Al Fursan
  25: ["Especiado", "Amaderado"], // Qaed Al Fursan Untamed
  26: ["Amaderado", "Dulce"], // Qaed Al Fursan Unlimited
  27: ["Floral", "Dulce"], // Hayaati Florence
  142: ["Dulce", "Ámbar"], // Hayaati Gold Elixir
  146: ["Dulce", "Especiado"], // Hayaati
  147: ["Especiado", "Amaderado"], // Hayaati Al Maleky
  148: ["Amaderado", "Ahumado"], // Vintage Radio
  149: ["Amaderado", "Especiado"], // Emeer
  28: ["Dulce", "Ámbar"], // Nebras Elixir
  29: ["Especiado", "Ámbar"], // Asad Elixir
  30: ["Dulce", "Ámbar"], // Ansaam Gold
  31: ["Cítrico", "Amaderado"], // Ansaam Silver
  32: ["Cítrico", "Amaderado"], // Shaheen Gold
  33: ["Cítrico", "Amaderado"], // Shaheen Silver
  34: ["Floral", "Dulce"], // Hala
  35: ["Dulce", "Ámbar"], // Ishq Al Shuyukh Gold
  36: ["Dulce", "Amaderado"], // Ishq Al Shuyukh Silver
  37: ["Amaderado", "Ámbar"], // Ta'weel
  38: ["Dulce", "Amaderado"], // Teriaq Intense
  39: ["Cítrico", "Amaderado"], // Musamam White Intense
  40: ["Floral", "Dulce"], // Victoria
  41: ["Amaderado", "Ámbar"], // Art Of Universe
  42: ["Dulce"], // Vanilla Freak
  43: ["Dulce", "Frutal"], // Berry On Top
  44: ["Dulce"], // Choco Overdose
  45: ["Dulce"], // Mallow Madness
  46: ["Dulce"], // Whipped Pleasure
  47: ["Floral", "Ámbar"], // The Kingdom Woman
  48: ["Amaderado", "Especiado"], // The Kingdom Men
  49: ["Floral", "Dulce"], // Layaan
  50: ["Amaderado", "Floral"], // Efeef
  51: ["Amaderado", "Ámbar"], // Al Noble Safeer
  52: ["Amaderado", "Especiado"], // Al Noble Ameer
  53: ["Amaderado", "Ámbar"], // Al Noble Wazeer
  54: ["Floral", "Dulce"], // Her Confession
  55: ["Amaderado", "Especiado"], // His Confession
  56: ["Dulce", "Amaderado"], // Ajwaa
  57: ["Dulce", "Ámbar"], // Sehr
  58: ["Floral", "Dulce"], // Habik Woman
  59: ["Dulce"], // Eternal Vanille
  60: ["Amaderado", "Especiado"], // Jassor
  61: ["Floral", "Dulce"], // Dinasty
  62: ["Floral", "Amaderado"], // Velvet Rose
  63: ["Floral", "Dulce"], // Petra
  64: ["Amaderado", "Ámbar"], // Atheeri
  65: ["Floral", "Dulce"], // Sakeena
  66: ["Floral", "Dulce"], // Emaan
  67: ["Floral", "Dulce"], // Qimmah
  68: ["Amaderado", "Ahumado"], // Ameer Al Oudh Intense Oud
  69: ["Amaderado", "Ámbar"], // Maahir
  70: ["Amaderado", "Ahumado"], // Maahir Black Edition
  71: ["Amaderado", "Especiado"], // Maahir Legacy
  72: ["Cítrico", "Amaderado"], // Ramz Silver
  73: ["Cítrico", "Amaderado"], // Ramz Gold
  74: ["Cítrico", "Acuático"], // Najdia
  75: ["Cítrico", "Amaderado"], // Suqraat
  131: ["Dulce", "Floral"], // Yara
  132: ["Dulce", "Floral"], // Yara Tous
  133: ["Dulce", "Floral"], // Yara Moi
  134: ["Especiado", "Dulce"], // Asad
  135: ["Dulce", "Amaderado"], // Asad Bourbon
  136: ["Especiado", "Frutal"], // Asad Zanzibar
  128: ["Dulce", "Especiado"], // Khamrah
  129: ["Dulce", "Especiado"], // Khamrah Qwah
  130: ["Ahumado", "Dulce"], // Khamrah Dukhan
  150: ["Frutal", "Amaderado"], // Opulent Dubai

  // ==================== FRENCH AVENUE ====================
  76: ["Dulce", "Amaderado"], // Liquid Brun
  77: ["Cítrico", "Amaderado"], // Aether
  78: ["Dulce", "Floral"], // Luscious
  79: ["Dulce", "Ámbar"], // Intense Addiction
  80: ["Amaderado", "Ahumado"], // Obsidian
  81: ["Especiado", "Ámbar"], // Vulcan Feu

  // ==================== AFNAN ====================
  82: ["Cítrico", "Amaderado"], // Supremacy Not Only Intense
  83: ["Cítrico", "Amaderado"], // Supremacy Silver
  84: ["Ahumado", "Amaderado"], // Supremacy Incense
  85: ["Cítrico", "Frutal"], // Supremacy In Heaven
  86: ["Dulce", "Frutal"], // 9PM Rebel
  87: ["Dulce", "Floral"], // 9PM Pour Femme
  137: ["Dulce", "Amaderado"], // 9PM
  138: ["Dulce", "Especiado"], // 9PM Nite Out
  139: ["Dulce", "Ámbar"], // 9PM Elixir
  140: ["Cítrico", "Acuático"], // 9AM Dive
  152: ["Frutal", "Ámbar"], // Turathi Electric
  153: ["Amaderado", "Ámbar"], // Turathi Blue

  // ==================== RAVE ====================
  88: ["Cítrico", "Amaderado"], // Rave Now
  89: ["Floral", "Dulce"], // Rave Now Women
  90: ["Dulce", "Amaderado"], // Rave Rage

  // ==================== MAISON ALHAMBRA ====================
  92: ["Dulce", "Ámbar"], // Baroque Rouge 540
  93: ["Floral", "Dulce"], // Cassius
  94: ["Amaderado", "Especiado"], // The Tux
  95: ["Cítrico", "Amaderado"], // Glacier Le Noir
  96: ["Cítrico", "Floral"], // Céleste
  97: ["Ahumado", "Dulce"], // Tobacco Touch

  // ==================== DUMONT ====================
  98: ["Cítrico", "Amaderado"], // Nitro Pour Homme
  99: ["Cítrico", "Acuático"], // Nitro Blue
  100: ["Cítrico", "Especiado"], // Nitro Red
  101: ["Cítrico", "Amaderado"], // Nitro White
  102: ["Cítrico", "Amaderado"], // Nitro Platinum

  // ==================== RASASI ====================
  122: ["Acuático", "Frutal"], // Hawas For Him
  123: ["Frutal", "Acuático"], // Hawas Tropical
  124: ["Especiado", "Amaderado"], // Hawas Fire
  125: ["Acuático", "Frutal"], // Hawas Malibu
  126: ["Acuático", "Cítrico"], // Hawas Ice
  127: ["Ámbar", "Amaderado"], // Hawas Elixir

  // ==================== DAVIDOFF ====================
  155: ["Acuático", "Amaderado"], // Cool Water
  156: ["Floral", "Acuático"], // Cool Water Woman
  157: ["Ámbar", "Cítrico"], // Cool Water Intense

  // ==================== MAISON ALHAMBRA ====================
  158: ["Floral", "Ámbar"], // Glacier Bella
  167: ["Amaderado", "Especiado"], // Sceptre Malachite

  // ==================== JEAN PAUL GAULTIER ====================
  159: ["Especiado", "Amaderado"], // Le Male Le Parfum
  160: ["Dulce", "Amaderado"], // Le Beau Le Parfum
  161: ["Dulce", "Especiado"], // Le Male Elixir
  162: ["Cítrico", "Amaderado"], // Scandal Pour Homme
  163: ["Dulce", "Amaderado"], // Le Beau
  164: ["Dulce", "Floral"], // Scandal
  165: ["Especiado", "Amaderado"], // Scandal Pour Homme Le Parfum
  166: ["Dulce", "Floral"], // Scandal Le Parfum

  // ==================== KHADLAJ (Island line) ====================
  168: ["Acuático", "Frutal"], // Island
  169: ["Frutal", "Dulce"], // Island Dreams
  170: ["Dulce", "Amaderado"], // Island Vanilla Dunes

  // ==================== BHARARA (new additions) ====================
  176: ["Especiado", "Amaderado"], // Rome Pour Homme
  178: ["Especiado", "Amaderado"], // Bharara King
  180: ["Floral", "Dulce"], // Bharara Queen
  181: ["Frutal", "Especiado"], // Viking Rio
  182: ["Amaderado", "Especiado"], // Viking Dubai
  183: ["Especiado", "Amaderado"], // Viking Cairo
  184: ["Ámbar", "Amaderado"], // Viking Kashmir

  // ==================== LATTAFA ====================
  185: ["Especiado", "Amaderado"], // Sherif
};

export type Brand =
  | "Armaf"
  | "Al Haramain"
  | "Lattafa"
  | "French Avenue"
  | "Afnan"
  | "Rave"
  | "Maison Alhambra"
  | "Dumont"
  | "Rasasi"
  | "Davidoff";

export interface Perfume {
  id: number;
  name: string;
  brand: Brand;
  gender: Gender;
  size: string;
  price?: number;
  fragranticaId: number;
  brandSlug: string;
  perfumeSlug: string;
  fragranticaSearchUrl?: string;
  notes?: Note[];
  available?: boolean; // defaults to true; false = out of stock / not available
}

export const BRANDS: Brand[] = [
  "Armaf",
  "Al Haramain",
  "Lattafa",
  "French Avenue",
  "Afnan",
  "Rave",
  "Maison Alhambra",
  "Dumont",
  "Rasasi",
  "Davidoff",
];

export const GENDERS: Gender[] = ["Dama", "Caballero", "Unisex"];

export const BRAND_SLUGS: Record<Brand, string> = {
  Armaf: "Armaf",
  "Al Haramain": "Al-Haramain-Perfumes",
  Lattafa: "Lattafa-Perfumes",
  "French Avenue": "French-Avenue",
  Afnan: "Afnan",
  Rave: "RAVE",
  "Maison Alhambra": "Maison-Alhambra",
  Dumont: "Dumont",
  Rasasi: "Rasasi",
  Davidoff: "Davidoff",
};

export function getImageUrl(fragranticaId: number): string {
  return `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${fragranticaId}.avif`;
}

export function getFragranticaUrl(perfume: Perfume): string {
  if (perfume.fragranticaSearchUrl) {
    return perfume.fragranticaSearchUrl;
  }
  return `https://www.fragrantica.es/perfume/${perfume.brandSlug}/${perfume.perfumeSlug}-${perfume.fragranticaId}.html`;
}

export const perfumes: Perfume[] = [
  // ==================== ARMAF ====================
  {
    id: 1,
    name: "Club de Nuit Intense Man",
    brand: "Armaf",
    gender: "Caballero",
    size: "105ml",
    fragranticaId: 34696,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Intense-Man",
  },
  {
    id: 2,
    name: "Club de Nuit Intense Man Limited Edition",
    brand: "Armaf",
    gender: "Caballero",
    size: "105ml",
    fragranticaId: 77861,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Intense-Man-Limited-Edition-Parfum",
  },
  {
    id: 3,
    name: "Club de Nuit Woman",
    brand: "Armaf",
    gender: "Dama",
    size: "105ml",
    fragranticaId: 27655,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Woman",
  },
  {
    id: 4,
    name: "Club de Nuit White Imperiale",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 78474,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-White-Imperiale",
  },
  {
    id: 115,
    name: "Club de Nuit Iconic",
    brand: "Armaf",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 78475,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Blue-Iconic",
  },
  {
    id: 116,
    name: "Club de Nuit Sillage",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 64105,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Sillage",
  },
  {
    id: 117,
    name: "Club de Nuit Urban Man Elixir",
    brand: "Armaf",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 77860,
    brandSlug: "Armaf",
    perfumeSlug: "Club-De-Nuit-Urban-Elixir",
  },
  {
    id: 118,
    name: "Club de Nuit Urban Man",
    brand: "Armaf",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 47394,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Urban-Man",
  },
  {
    id: 119,
    name: "Club de Nuit Maleka",
    brand: "Armaf",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 106168,
    brandSlug: "Armaf",
    perfumeSlug: "Club-De-Nuit-Maleka",
  },
  {
    id: 120,
    name: "Club de Nuit Untold",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 78476,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Untold",
  },
  {
    id: 121,
    name: "Club de Nuit Precieux I",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 93272,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Precieux-I",
  },
  {
    id: 5,
    name: "Odyssey Homme White Edition",
    brand: "Armaf",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 64466,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Homme-White-Edition",
  },
  {
    id: 91,
    name: "Odyssey Aoud",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 83136,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Aoud",
  },
  {
    id: 104,
    name: "Odyssey Mandarine Sky",
    brand: "Armaf",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 83132,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Mandarin-Sky",
  },
  {
    id: 105,
    name: "Odyssey Artisto",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 106710,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Artisto",
  },
  {
    id: 106,
    name: "Odyssey Bahamas",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 115127,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-BA-HA-MAS",
  },
  {
    id: 107,
    name: "Odyssey Toffee Coffee",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 115137,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Toffee-Coffee",
  },
  {
    id: 108,
    name: "Odyssey Spectra",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 98692,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Spectra",
  },
  {
    id: 109,
    name: "Odyssey Aqua",
    brand: "Armaf",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 83134,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Aqua-Edition",
  },
  {
    id: 110,
    name: "Odyssey Homme",
    brand: "Armaf",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 64464,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Homme",
  },
  {
    id: 111,
    name: "Odyssey Mandarin Sky Vintage Edition",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 123184,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Mandarin-Sky-Vintage-Edition",
  },
  {
    id: 112,
    name: "Odyssey Mandarin Sky Elixir",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 106709,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Mandarin-Sky-Elixir",
  },
  {
    id: 113,
    name: "Odyssey Mega",
    brand: "Armaf",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 83133,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Mega-Man",
  },
  {
    id: 114,
    name: "Odyssey Limoni Fresh",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 98695,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Limoni-Fresh",
  },
  {
    id: 141,
    name: "Yum Yum",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 98717,
    brandSlug: "Armaf",
    perfumeSlug: "Yum-Yum",
  },
  {
    id: 143,
    name: "Bon Bon",
    brand: "Armaf",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 123334,
    brandSlug: "Armaf",
    perfumeSlug: "Bon-Bon",
  },
  {
    id: 144,
    name: "Island Bliss",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 98718,
    brandSlug: "Armaf",
    perfumeSlug: "Island-Bliss",
  },
  {
    id: 145,
    name: "Island Breeze",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 116844,
    brandSlug: "Armaf",
    perfumeSlug: "Island-Breeze",
  },
  {
    id: 151,
    name: "Eter Arabian",
    brand: "Armaf",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 92894,
    brandSlug: "Armaf",
    perfumeSlug: "Arabian-Sky",
  },

  // ==================== AL HARAMAIN ====================
  {
    id: 6,
    name: "Amber Oud Rouge Edition",
    brand: "Al Haramain",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 66100,
    brandSlug: "Al-Haramain-Perfumes",
    perfumeSlug: "Amber-Oud-Rouge",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Al-Haramain-Perfumes/Amber-Oud-Rouge-66100.html",
  },
  {
    id: 7,
    name: "Amber Oud Gold Edition",
    brand: "Al Haramain",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 51816,
    brandSlug: "Al-Haramain-Perfumes",
    perfumeSlug: "Amber-Oud-Gold-Edition",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Al-Haramain-Perfumes/Amber-Oud-Gold-Edition-51816.html",
  },
  {
    id: 8,
    name: "Amber Oud Carbon Edition",
    brand: "Al Haramain",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 73207,
    brandSlug: "Al-Haramain-Perfumes",
    perfumeSlug: "Amber-Oud-Carbon-Edition",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Al-Haramain-Perfumes/Amber-Oud-Carbon-Edition-73207.html",
  },
  {
    id: 9,
    name: "Amber Oud White Edition",
    brand: "Al Haramain",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 73210,
    brandSlug: "Al-Haramain-Perfumes",
    perfumeSlug: "Amber-Oud-White-Edition",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Al-Haramain-Perfumes/Amber-Oud-White-Edition-73210.html",
  },
  {
    id: 10,
    name: "L'Aventure",
    brand: "Al Haramain",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 40405,
    brandSlug: "Al-Haramain-Perfumes",
    perfumeSlug: "L-Aventure",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Al-Haramain-Perfumes/L-Aventure-40405.html",
  },
  {
    id: 11,
    name: "L'Aventure Woman",
    brand: "Al Haramain",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 51820,
    brandSlug: "Al-Haramain-Perfumes",
    perfumeSlug: "L-Aventure-Femme",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Al-Haramain-Perfumes/L-Aventure-Femme-51820.html",
  },
  {
    id: 154,
    name: "Amber Oud Aqua Dubai",
    brand: "Al Haramain",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 96482,
    brandSlug: "Al-Haramain-Perfumes",
    perfumeSlug: "Amber-Oud-Aqua-Dubai",
  },

  // ==================== LATTAFA (Verificados Batch 1) ====================
  {
    id: 14,
    name: "Bade'e Al Oud Amethyst",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 68214,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Bade-e-Al-Oud-Amethyst",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Bade-e-Al-Oud-Amethyst-68214.html",
  },
  {
    id: 15,
    name: "Bade'e Al Oud Oud for Glory",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 64948,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Bade-e-Al-Oud-Oud-for-Glory",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Bade-e-Al-Oud-Oud-for-Glory-64948.html",
  },
  {
    id: 16,
    name: "Bade'e Al Oud Honor & Glory",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 84302,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Bade-e-Al-Oud-Honor-Glory",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Bade-e-Al-Oud-Honor-Glory-84302.html",
  },

  {
    id: 18,
    name: "Eclaire Pistache",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 113777,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Eclaire-Pistache",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Eclaire-Pistache-113777.html",
  },
  {
    id: 19,
    name: "Eclaire Banoffi",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 113778,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Eclaire-Banoffi",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Eclaire-Banoffi-113778.html",
  },
  {
    id: 20,
    name: "Mayar Natural Intense",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 89759,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Mayar-Natural-Intense",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Mayar-Natural-Intense-89759.html",
  },
  {
    id: 21,
    name: "Fakhar Black",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 70465,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Fakhar-Black",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Fakhar-Black-70465.html",
  },
  {
    id: 22,
    name: "Fakhar Rose",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 70466,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Fakhar-Rose",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Fakhar-Rose-70466.html",
  },

  {
    id: 103,
    name: "Qaed Al Fursan",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 67996,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Qaed-Al-Fursan",
  },
  {
    id: 25,
    name: "Qaed Al Fursan Untamed",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 105383,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Qaed-Al-Fursan-Untamed",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Qaed-Al-Fursan-Untamed-105383.html",
  },
  {
    id: 26,
    name: "Qaed Al Fursan Unlimited",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 82590,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Qaed-Al-Fursan-Unlimited",
  },
  {
    id: 27,
    name: "Hayaati Florence",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 84769,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Hayaati-Florence",
  },
  {
    id: 142,
    name: "Hayaati Gold Elixir",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 76589,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Hayaati-Gold-Elixir",
  },
  {
    id: 146,
    name: "Hayaati",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 75902,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Hayaati-75902",
  },
  {
    id: 147,
    name: "Hayaati Al Maleky",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 84306,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Hayaati-Al-Maleky",
  },
  {
    id: 148,
    name: "Vintage Radio",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 89454,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Vintage-Radio",
  },
  {
    id: 149,
    name: "Emeer",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 89761,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Emeer",
  },
  {
    id: 28,
    name: "Nebras Elixir",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 85091,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Nebras-Elixir",
  },

  // ==================== LATTAFA (Verificados Batch 2) ====================
  {
    id: 29,
    name: "Asad Elixir",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 117616,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Asad-Elixir",
  },
  {
    id: 30,
    name: "Ansaam Gold",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 82731,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ansaam-Gold",
  },
  {
    id: 31,
    name: "Ansaam Silver",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 82788,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ansaam-Silver",
  },
  {
    id: 32,
    name: "Shaheen Gold",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 82814,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Shaheen-Gold",
  },
  {
    id: 33,
    name: "Shaheen Silver",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 82815,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Shaheen-Silver",
  },
  {
    id: 34,
    name: "Hala",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 82813,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Hala",
  },
  {
    id: 35,
    name: "Ishq Al Shuyukh Gold",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 81121,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ishq-Al-Shuyukh-Gold",
  },
  {
    id: 36,
    name: "Ishq Al Shuyukh Silver",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 81099,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ishq-Al-Shuyukh-Silver",
  },
  {
    id: 37,
    name: "Ta'weel",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 85095,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Taweel",
  },
  {
    id: 38,
    name: "Teriaq Intense",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 99586,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Teriaq-Intense",
  },
  {
    id: 39,
    name: "Musamam White Intense",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 85087,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Musamam-White-Intense",
  },
  {
    id: 40,
    name: "Victoria",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 102906,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Victoria",
  },
  {
    id: 41,
    name: "Art Of Universe",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 101314,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Art-Of-Universe",
  },
  {
    id: 42,
    name: "Vanilla Freak",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 114400,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Vanilla-Freak",
  },
  {
    id: 43,
    name: "Berry On Top",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 114395,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Berry-On-Top",
  },
  {
    id: 44,
    name: "Choco Overdose",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 114398,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Choco-Overdose",
  },
  {
    id: 45,
    name: "Mallow Madness",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 114396,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Mallow-Madness",
  },
  {
    id: 46,
    name: "Whipped Pleasure",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 114397,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Whipped-Pleasure",
  },

  // ==================== LATTAFA (Verificados - IDs corregidos) ====================
  {
    id: 47,
    name: "The Kingdom Woman",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 98648,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "The-Kingdom-For-Women",
  },
  {
    id: 48,
    name: "The Kingdom Men",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 97995,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "The-Kingdom-For-Men",
  },
  {
    id: 49,
    name: "Layaan",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 117123,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Layaan",
  },
  {
    id: 50,
    name: "Efeef",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 100126,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Afeef",
  },
  {
    id: 51,
    name: "Al Noble Safeer",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 82795,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Safeer",
  },
  {
    id: 52,
    name: "Al Noble Ameer",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 82794,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ameer",
  },
  {
    id: 53,
    name: "Al Noble Wazeer",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 82796,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Wazeer",
  },
  {
    id: 54,
    name: "Her Confession",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 96864,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Her-Confession",
  },
  {
    id: 55,
    name: "His Confession",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 96866,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "His-Confession",
  },
  {
    id: 56,
    name: "Ajwaa",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 85368,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ajwaa",
  },
  {
    id: 57,
    name: "Sehr",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 94967,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Sehr",
  },
  {
    id: 58,
    name: "Habik Woman",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 110354,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Habik-For-Women",
  },
  {
    id: 59,
    name: "Eternal Vanille",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 119155,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Eternal-Vanille",
  },
  {
    id: 60,
    name: "Jassor",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 85093,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Jasoor",
  },
  {
    id: 61,
    name: "Dinasty",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 112859,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Dynasty",
  },
  {
    id: 62,
    name: "Velvet Rose",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 76867,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Velvet-Rose",
  },
  {
    id: 63,
    name: "Petra",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 107089,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Petra",
  },
  {
    id: 64,
    name: "Atheeri",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 105152,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Atheeri",
  },
  {
    id: 65,
    name: "Sakeena",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 85094,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Sakeena",
  },
  {
    id: 66,
    name: "Emaan",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 85091,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Emaan",
  },
  {
    id: 67,
    name: "Qimmah",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 82793,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Qimmah-for-Women",
  },
  {
    id: 68,
    name: "Ameer Al Oudh Intense Oud",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 64947,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ameer-Al-Oudh-Intense-Oud",
  },
  {
    id: 69,
    name: "Maahir",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 64950,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Maahir",
  },
  {
    id: 70,
    name: "Maahir Black Edition",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 66564,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Maahir-Black-Edition",
  },
  {
    id: 71,
    name: "Maahir Legacy",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 82727,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Maahir-Legacy",
  },
  {
    id: 72,
    name: "Ramz Silver",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 71868,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ramz-Lattafa-Silver",
  },
  {
    id: 73,
    name: "Ramz Gold",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 70368,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ramz-Lattafa-Gold",
  },
  {
    id: 74,
    name: "Najdia",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 66011,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Najdia",
  },
  {
    id: 75,
    name: "Suqraat",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 75471,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Suqraat",
  },

  // ==================== LATTAFA - YARA ====================
  {
    id: 131,
    name: "Yara",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 76880,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Yara",
  },
  {
    id: 132,
    name: "Yara Tous",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 83320,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Yara-Tous",
  },
  {
    id: 133,
    name: "Yara Moi",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 80722,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Yara-Moi",
  },

  // ==================== LATTAFA - ASAD ====================
  {
    id: 134,
    name: "Asad",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 72821,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Asad",
  },
  {
    id: 135,
    name: "Asad Bourbon",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 101124,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Asad-Bourbon",
  },
  {
    id: 136,
    name: "Asad Zanzibar",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 90713,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Asad-Zanzibar",
  },

  // ==================== LATTAFA - KHAMRAH ====================
  {
    id: 128,
    name: "Khamrah",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 75805,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Khamrah",
  },
  {
    id: 129,
    name: "Khamrah Qwah",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 88175,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Khamrah-Qahwa",
  },
  {
    id: 130,
    name: "Khamrah Dukhan",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 104529,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Khamrah-Dukhan",
  },
  {
    id: 150,
    name: "Opulent Dubai",
    brand: "Lattafa",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 105609,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Opulent-Dubai",
  },

  // ==================== FRENCH AVENUE ====================
  {
    id: 76,
    name: "Liquid Brun",
    brand: "French Avenue",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 94713,
    brandSlug: "French-Avenue",
    perfumeSlug: "Liquid-Brun",
  },
  {
    id: 77,
    name: "Aether",
    brand: "French Avenue",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 94702,
    brandSlug: "French-Avenue",
    perfumeSlug: "Aether",
  },
  {
    id: 78,
    name: "Luscious",
    brand: "French Avenue",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 94023,
    brandSlug: "French-Avenue",
    perfumeSlug: "Luscious",
  },
  {
    id: 79,
    name: "Intense Addiction",
    brand: "French Avenue",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 105090,
    brandSlug: "French-Avenue",
    perfumeSlug: "Intense-Addiction",
  },
  {
    id: 80,
    name: "Obsidian",
    brand: "French Avenue",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 120872,
    brandSlug: "French-Avenue",
    perfumeSlug: "OBSIDIAN",
  },
  {
    id: 81,
    name: "Vulcan Feu",
    brand: "French Avenue",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 105520,
    brandSlug: "French-Avenue",
    perfumeSlug: "Vulcan-Feu",
  },

  // ==================== AFNAN ====================
  {
    id: 82,
    name: "Supremacy Not Only Intense",
    brand: "Afnan",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 68271,
    brandSlug: "Afnan",
    perfumeSlug: "Supremacy-Not-Only-Intense",
  },
  {
    id: 83,
    name: "Supremacy Silver",
    brand: "Afnan",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 27352,
    brandSlug: "Afnan",
    perfumeSlug: "Supremacy-Silver",
  },
  {
    id: 84,
    name: "Supremacy Incense",
    brand: "Afnan",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 64372,
    brandSlug: "Afnan",
    perfumeSlug: "Supremacy-Incense",
  },
  {
    id: 85,
    name: "Supremacy In Heaven",
    brand: "Afnan",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 70703,
    brandSlug: "Afnan",
    perfumeSlug: "Supremacy-In-Heaven",
  },
  {
    id: 86,
    name: "9PM Rebel",
    brand: "Afnan",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 99238,
    brandSlug: "Afnan",
    perfumeSlug: "9-PM-Rebel",
  },
  {
    id: 87,
    name: "9PM Pour Femme",
    brand: "Afnan",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 78544,
    brandSlug: "Afnan",
    perfumeSlug: "9pm-pour-Femme",
  },

  // ==================== AFNAN - 9AM/PM ====================
  {
    id: 137,
    name: "9PM",
    brand: "Afnan",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 65414,
    brandSlug: "Afnan",
    perfumeSlug: "9pm",
  },
  {
    id: 138,
    name: "9PM Nite Out",
    brand: "Afnan",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 123313,
    brandSlug: "Afnan",
    perfumeSlug: "9-PM-Night-Out",
  },
  {
    id: 139,
    name: "9PM Elixir",
    brand: "Afnan",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 111894,
    brandSlug: "Afnan",
    perfumeSlug: "9PM-Elixir",
  },
  {
    id: 140,
    name: "9AM Dive",
    brand: "Afnan",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 78611,
    brandSlug: "Afnan",
    perfumeSlug: "9am-Dive",
  },
  {
    id: 152,
    name: "Turathi Electric",
    brand: "Afnan",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 108244,
    brandSlug: "Afnan",
    perfumeSlug: "Turathi-Electric",
  },
  {
    id: 153,
    name: "Turathi Blue",
    brand: "Afnan",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 70839,
    brandSlug: "Afnan",
    perfumeSlug: "Turathi-Blue",
  },

  // ==================== RAVE ====================
  {
    id: 88,
    name: "Rave Now",
    brand: "Rave",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 82467,
    brandSlug: "RAVE",
    perfumeSlug: "Now",
  },
  {
    id: 89,
    name: "Rave Now Women",
    brand: "Rave",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 85088,
    brandSlug: "RAVE",
    perfumeSlug: "Now-Women",
  },
  {
    id: 90,
    name: "Rave Rage",
    brand: "Rave",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 129938,
    brandSlug: "RAVE",
    perfumeSlug: "Rage",
  },

  // ==================== MAISON ALHAMBRA ====================
  {
    id: 92,
    name: "Baroque Rouge 540",
    brand: "Maison Alhambra",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 89849,
    brandSlug: "Maison-Alhambra",
    perfumeSlug: "Baroque-Rouge-540",
  },
  {
    id: 93,
    name: "Cassius",
    brand: "Maison Alhambra",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 95509,
    brandSlug: "Maison-Alhambra",
    perfumeSlug: "Cassius",
  },
  {
    id: 94,
    name: "The Tux",
    brand: "Maison Alhambra",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 78559,
    brandSlug: "Maison-Alhambra",
    perfumeSlug: "The-Tux",
  },
  {
    id: 95,
    name: "Glacier Le Noir",
    brand: "Maison Alhambra",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 93646,
    brandSlug: "Maison-Alhambra",
    perfumeSlug: "Glacier-Le-Noir",
  },
  {
    id: 96,
    name: "Céleste",
    brand: "Maison Alhambra",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 101640,
    brandSlug: "Maison-Alhambra",
    perfumeSlug: "Celeste",
  },
  {
    id: 97,
    name: "Tobacco Touch",
    brand: "Maison Alhambra",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 79943,
    brandSlug: "Maison-Alhambra",
    perfumeSlug: "Tobacco-Touch",
  },

  // ==================== DUMONT ====================
  {
    id: 98,
    name: "Nitro Pour Homme",
    brand: "Dumont",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 73020,
    brandSlug: "Dumont",
    perfumeSlug: "Nitro-Pour-Homme",
  },
  {
    id: 99,
    name: "Nitro Blue",
    brand: "Dumont",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 73021,
    brandSlug: "Dumont",
    perfumeSlug: "Nitro-Blue",
  },
  {
    id: 100,
    name: "Nitro Red",
    brand: "Dumont",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 73023,
    brandSlug: "Dumont",
    perfumeSlug: "Nitro-Red",
  },
  {
    id: 101,
    name: "Nitro White",
    brand: "Dumont",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 95995,
    brandSlug: "Dumont",
    perfumeSlug: "Nitro-White",
  },
  {
    id: 102,
    name: "Nitro Platinum",
    brand: "Dumont",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 101991,
    brandSlug: "Dumont",
    perfumeSlug: "Nitro-Platinum",
  },

  // ==================== RASASI ====================
  {
    id: 122,
    name: "Hawas For Him",
    brand: "Rasasi",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 46890,
    brandSlug: "Rasasi",
    perfumeSlug: "Hawas-for-Him",
  },
  {
    id: 123,
    name: "Hawas Tropical",
    brand: "Rasasi",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 108054,
    brandSlug: "Rasasi",
    perfumeSlug: "Hawas-Tropical",
  },
  {
    id: 124,
    name: "Hawas Fire",
    brand: "Rasasi",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 101665,
    brandSlug: "Rasasi",
    perfumeSlug: "Hawas-Fire",
  },
  {
    id: 125,
    name: "Hawas Malibu",
    brand: "Rasasi",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 112707,
    brandSlug: "Rasasi",
    perfumeSlug: "Hawas-Malibu",
  },
  {
    id: 126,
    name: "Hawas Ice",
    brand: "Rasasi",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 89050,
    brandSlug: "Rasasi",
    perfumeSlug: "Hawas-Ice",
  },
  {
    id: 127,
    name: "Hawas Elixir",
    brand: "Rasasi",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 110808,
    brandSlug: "Rasasi",
    perfumeSlug: "Hawas-Elixir",
  },

  // ==================== DAVIDOFF ====================
  {
    id: 155,
    name: "Cool Water",
    brand: "Davidoff",
    gender: "Caballero",
    size: "125ml",
    fragranticaId: 507,
    brandSlug: "Davidoff",
    perfumeSlug: "Cool-Water",
  },
  {
    id: 156,
    name: "Cool Water Woman",
    brand: "Davidoff",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 508,
    brandSlug: "Davidoff",
    perfumeSlug: "Cool-Water-for-Women",
  },
  {
    id: 157,
    name: "Cool Water Intense",
    brand: "Davidoff",
    gender: "Caballero",
    size: "125ml",
    fragranticaId: 55266,
    brandSlug: "Davidoff",
    perfumeSlug: "Cool-Water-Intense",
  },
  {
    id: 158,
    name: "Glacier Bella",
    brand: "Maison Alhambra",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 93644,
    brandSlug: "Maison-Alhambra",
    perfumeSlug: "Glacier-Bella",
  },
  {
    id: 159,
    name: "Le Male Le Parfum",
    brand: "Jean Paul Gaultier",
    gender: "Caballero",
    size: "125ml",
    fragranticaId: 61856,
    brandSlug: "Jean-Paul-Gaultier",
    perfumeSlug: "Le-Male-Le-Parfum",
    available: false,
  },
  {
    id: 160,
    name: "Le Beau Le Parfum",
    brand: "Jean Paul Gaultier",
    gender: "Caballero",
    size: "125ml",
    fragranticaId: 72158,
    brandSlug: "Jean-Paul-Gaultier",
    perfumeSlug: "Le-Beau-Le-Parfum",
    available: false,
  },
  {
    id: 161,
    name: "Le Male Elixir",
    brand: "Jean Paul Gaultier",
    gender: "Caballero",
    size: "125ml",
    fragranticaId: 81642,
    brandSlug: "Jean-Paul-Gaultier",
    perfumeSlug: "Le-Male-Elixir",
    available: false,
  },
  {
    id: 162,
    name: "Scandal Pour Homme",
    brand: "Jean Paul Gaultier",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 68074,
    brandSlug: "Jean-Paul-Gaultier",
    perfumeSlug: "Scandal-Pour-Homme",
    available: false,
  },
  {
    id: 163,
    name: "Le Beau",
    brand: "Jean Paul Gaultier",
    gender: "Caballero",
    size: "125ml",
    fragranticaId: 55785,
    brandSlug: "Jean-Paul-Gaultier",
    perfumeSlug: "Le-Beau",
    available: false,
  },
  {
    id: 164,
    name: "Scandal",
    brand: "Jean Paul Gaultier",
    gender: "Dama",
    size: "80ml",
    fragranticaId: 45651,
    brandSlug: "Jean-Paul-Gaultier",
    perfumeSlug: "Scandal",
    available: false,
  },
  {
    id: 165,
    name: "Scandal Pour Homme Le Parfum",
    brand: "Jean Paul Gaultier",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 74915,
    brandSlug: "Jean-Paul-Gaultier",
    perfumeSlug: "Scandal-Pour-Homme-Le-Parfum",
    available: false,
  },
  {
    id: 166,
    name: "Scandal Le Parfum",
    brand: "Jean Paul Gaultier",
    gender: "Dama",
    size: "80ml",
    fragranticaId: 74914,
    brandSlug: "Jean-Paul-Gaultier",
    perfumeSlug: "Scandal-Le-Parfum",
    available: false,
  },
  {
    id: 167,
    name: "Sceptre Malachite",
    brand: "Maison Alhambra",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 94163,
    brandSlug: "Maison-Alhambra",
    perfumeSlug: "Sceptre-Malachite",
  },
  {
    id: 168,
    name: "Island",
    brand: "Khadlaj",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 102362,
    brandSlug: "Khadlaj-Perfumes",
    perfumeSlug: "Island",
  },
  {
    id: 169,
    name: "Island Dreams",
    brand: "Khadlaj",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 113593,
    brandSlug: "Khadlaj-Perfumes",
    perfumeSlug: "Island-Dreams",
  },
  {
    id: 170,
    name: "Island Vanilla Dunes",
    brand: "Khadlaj",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 106802,
    brandSlug: "Khadlaj-Perfumes",
    perfumeSlug: "Island-Vanilla-Dunes",
  },
  {
    id: 176,
    name: "Rome Pour Homme",
    brand: "Bharara",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 126400,
    brandSlug: "Bharara",
    perfumeSlug: "Rome-pour-Homme",
  },
  {
    id: 178,
    name: "Bharara King",
    brand: "Bharara",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 74184,
    brandSlug: "Bharara",
    perfumeSlug: "King",
  },
  {
    id: 180,
    name: "Bharara Queen",
    brand: "Bharara",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 95437,
    brandSlug: "Bharara",
    perfumeSlug: "Bharara-Queen",
  },
  {
    id: 181,
    name: "Viking Rio",
    brand: "Bharara",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 96818,
    brandSlug: "Bharara",
    perfumeSlug: "Viking-Rio",
  },
  {
    id: 182,
    name: "Viking Dubai",
    brand: "Bharara",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 113760,
    brandSlug: "Bharara",
    perfumeSlug: "Viking-Dubai",
  },
  {
    id: 183,
    name: "Viking Cairo",
    brand: "Bharara",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 103876,
    brandSlug: "Bharara",
    perfumeSlug: "Viking-Cairo",
  },
  {
    id: 184,
    name: "Viking Kashmir",
    brand: "Bharara",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 113761,
    brandSlug: "Bharara",
    perfumeSlug: "Viking-Kashmir",
  },
  {
    id: 185,
    name: "Sherif",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 114332,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Sherif",
  },
];
