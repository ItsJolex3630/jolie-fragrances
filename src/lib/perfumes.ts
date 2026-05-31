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
    borderColor: "border-orange-500/30"
  },
  Dulce: {
    emoji: "🍬",
    color: "text-pink-300",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/30"
  },
  Amaderado: {
    emoji: "🪵",
    color: "text-amber-300",
    bgColor: "bg-amber-500/20",
    borderColor: "border-amber-500/30"
  },
  Especiado: {
    emoji: "🌶️",
    color: "text-red-300",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30"
  },
  Floral: {
    emoji: "🌸",
    color: "text-rose-300",
    bgColor: "bg-rose-500/20",
    borderColor: "border-rose-500/30"
  },
  Acuático: {
    emoji: "🌊",
    color: "text-teal-300",
    bgColor: "bg-teal-500/20",
    borderColor: "border-teal-500/30"
  },
  Ámbar: {
    emoji: "✨",
    color: "text-yellow-300",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30"
  },
  Ahumado: {
    emoji: "🔥",
    color: "text-stone-300",
    bgColor: "bg-stone-500/20",
    borderColor: "border-stone-500/30"
  },
  Frutal: {
    emoji: "🍓",
    color: "text-fuchsia-300",
    bgColor: "bg-fuchsia-500/20",
    borderColor: "border-fuchsia-500/30"
  }
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
  129: ["Dulce", "Especiado"], // Khamrah Qawha
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

  // ==================== CAROLINA HERRERA ====================
  186: ["Dulce", "Floral"], // Good Girl
  187: ["Floral", "Dulce"], // Good Girl Blush
  188: ["Frutal", "Floral"], // Very Good Girl
  189: ["Frutal", "Dulce"], // Very Good Girl Elixir
  190: ["Floral", "Ámbar"], // Good Girl Blush Elixir EdP
  191: ["Frutal", "Floral"], // La Bomba
  192: ["Amaderado", "Especiado"], // Bad Boy Cobalt PE
  193: ["Especiado", "Amaderado"], // Bad Boy
  194: ["Ahumado", "Especiado"], // Bad Boy Cobalt Elixir
  195: ["Amaderado", "Ahumado"], // Bad Boy Extreme
  196: ["Amaderado", "Especiado"], // Bad Boy Le Parfum
  197: ["Ahumado", "Amaderado"], // Bad Boy Elixir
  198: ["Amaderado", "Especiado"], // CH Men
  199: ["Cítrico", "Especiado"], // 212 VIP Men
  200: ["Cítrico", "Amaderado"], // 212 Men
  201: ["Especiado", "Amaderado"], // 212 VIP Black
  202: ["Dulce", "Floral"], // Club de Nuit Precieux Woman
  203: ["Cítrico", "Dulce"], // Club de Nuit Bling
  204: ["Acuático", "Cítrico"], // Club de Nuit Milestone
  206: ["Floral", "Amaderado"], // Club de Nuit Woman Extrait Parfum
  207: ["Cítrico", "Especiado"], // Odyssey Tyrant
  208: ["Dulce", "Frutal"], // Odyssey Candee
  209: ["Dulce", "Frutal"], // Odyssey Marshmallow
  210: ["Frutal", "Dulce"], // Odyssey Go Mango
  211: ["Dulce", "Especiado"], // Odyssey Black Forest
  212: ["Dulce", "Frutal"], // Odyssey Revolution
  213: ["Dulce", "Especiado"], // Odyssey Dubai Chocolate
  214: ["Floral", "Amaderado"], // Eter Desert Flower

  // ==================== NEW COMBO PERFUMES ====================
  215: ["Cítrico", "Amaderado"], // Fakhar Platin
  216: ["Floral", "Ámbar"], // Veneno Bianco
  217: ["Frutal", "Floral"], // Ana Abiyedh Coral
  218: ["Frutal", "Dulce"], // Mayar Cherry
  219: ["Dulce"], // Eclaire
  220: ["Cítrico", "Amaderado"], // Tharwah Silver
  221: ["Amaderado", "Ahumado"], // Shaghaf Oud Azraq
  222: ["Amaderado", "Floral"], // Casablanca
  223: ["Dulce", "Ámbar"], // Tiramisu Caramel
  224: ["Dulce", "Ámbar"], // Caramel Cascade
  225: ["Cítrico", "Acuático"], // Glacier Pour Homme
  226: ["Amaderado", "Especiado"], // Khair Fusion
  227: ["Dulce", "Especiado"], // Khair Confection
  228: ["Dulce", "Frutal"], // Yara Candy
  230: ["Dulce", "Floral"], // Yara Elixir
  231: ["Amaderado", "Ámbar"], // Bade'e Al Oud Sublime
  232: ["Amaderado", "Especiado"], // Indomitable
  233: ["Dulce", "Floral"], // Marshmallow Blush
  234: ["Dulce", "Floral"], // Khair
  235: ["Floral", "Dulce"], // Khair Felicity
  236: ["Dulce", "Ámbar"], // December
  237: ["Frutal", "Floral"], // Emir Memories of Summer
  238: ["Dulce", "Frutal"], // Taskeen
  239: ["Acuático", "Frutal"], // Taskeen Marina
  240: ["Dulce", "Frutal"], // Lactea Divina
  241: ["Floral", "Dulce"], // Fayora
  242: ["Frutal", "Dulce"], // Mango Punch
  243: ["Frutal", "Cítrico"], // Juice Melange
  244: ["Frutal", "Dulce"], // Pear Potion
  245: ["Floral", "Dulce"], // Qissa Pink
  246: ["Dulce", "Frutal"], // Qissa Delicius
  247: ["Floral", "Amaderado"], // Qissa Blue

  // ==================== ZIMAYA ====================
  248: ["Cítrico", "Amaderado"], // Evolution
  249: ["Dulce", "Ámbar"], // Tiramisu Coco
  250: ["Amaderado", "Especiado"], // Charisma
  251: ["Amaderado", "Ámbar"], // Grandeur
  252: ["Amaderado", "Especiado"], // Is Great
  253: ["Amaderado", "Ahumado"], // Happy Oud
  254: ["Floral", "Dulce"], // Fatima Pink
  255: ["Floral", "Ámbar"], // Fatima Velvet
  256: ["Floral", "Dulce"], // Only You
  257: ["Floral", "Ámbar"], // Hayam
  258: ["Amaderado", "Frutal"], // Anhaar Valley
  259: ["Amaderado", "Especiado"], // Hawwa Red

  // ==================== ARABIYAT ====================
  260: ["Dulce", "Ámbar"], // Coconut Chiffon
  261: ["Frutal", "Dulce"], // Berries Cream Macaron
  262: ["Frutal", "Dulce"], // Strawberry Tres Leches
  263: ["Dulce", "Ámbar"], // Vanilla Cream Macaron
  264: ["Frutal", "Dulce"], // Mango Affogato
  265: ["Dulce", "Ámbar"], // Caramel Chocolate Macaron
  266: ["Dulce", "Ámbar"], // Dulce de Leche
  267: ["Dulce", "Frutal"], // Sugar Cotton
  268: ["Dulce", "Ámbar"], // Pecan Butter
  269: ["Cítrico", "Dulce"], // Lemon Sorbet
  270: ["Dulce", "Ámbar"], // Cookie Dough
  271: ["Dulce", "Amaderado"], // Matcha Latte
  272: ["Dulce", "Ámbar"], // Toffe Ganache
  273: ["Floral", "Dulce"], // Marwa

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
  | "Davidoff"
  | "Carolina Herrera"
  | "Khadlaj"
  | "Bharara"
  | "Jean Paul Gaultier"
  | "Paris Corner"
  | "Zimaya"
  | "Arabiyat";

export type Concentration = "Parfum" | "Elixir" | "Eau de Parfum" | "Eau de Toilette" | "Eau de Cologne" | "Eau Fraîche";

export const CONCENTRATION_ORDER: Concentration[] = [
  "Parfum",
  "Elixir",
  "Eau de Parfum",
  "Eau de Toilette",
  "Eau de Cologne",
  "Eau Fraîche",
];

export const CONCENTRATION_LABELS: Record<Concentration, string> = {
  "Parfum": "Parfum",
  "Elixir": "Elixir",
  "Eau de Parfum": "EdP",
  "Eau de Toilette": "EdT",
  "Eau de Cologne": "EdC",
  "Eau Fraîche": "EdF"
};

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
  concentration?: Concentration; // olfactive concentration type
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
  "Carolina Herrera",
  "Khadlaj",
  "Bharara",
  "Jean Paul Gaultier",
  "Paris Corner",
  "Zimaya",
  "Arabiyat",
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
  "Carolina Herrera": "Carolina-Herrera",
  Khadlaj: "Khadlaj-Perfumes",
  Bharara: "Bharara",
  "Jean Paul Gaultier": "Jean-Paul-Gaultier",
  "Paris Corner": "Paris-Corner",
  "Zimaya": "Zimaya",
  "Arabiyat": "Arabiyat-Sugar"
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
{
    id: 1,
    name: "Club de Nuit Intense Man",
    brand: "Armaf",
    gender: "Caballero",
    size: "105ml",
    fragranticaId: 34696,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Intense-Man",
    available: false
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
    available: false
  },
{
    id: 3,
    name: "Club de Nuit Woman",
    brand: "Armaf",
    gender: "Dama",
    price: 43,
    size: "105ml",
    fragranticaId: 27655,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Woman",
    available: true
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
    available: false
  },
{
    id: 115,
    name: "Club de Nuit Iconic",
    brand: "Armaf",
    gender: "Caballero",
    price: 68,
    size: "100ml",
    fragranticaId: 78475,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Blue-Iconic",
    available: true
  },
{
    id: 116,
    name: "Club de Nuit Sillage",
    brand: "Armaf",
    gender: "Unisex",
    price: 54,
    size: "100ml",
    fragranticaId: 64105,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Sillage",
    available: true
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
    available: false
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
    available: false
  },
{
    id: 119,
    name: "Club de Nuit Maleka",
    brand: "Armaf",
    gender: "Dama",
    price: 61,
    size: "100ml",
    fragranticaId: 106168,
    brandSlug: "Armaf",
    perfumeSlug: "Club-De-Nuit-Maleka",
    available: true
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
    available: false
  },
{
    id: 121,
    name: "Club de Nuit Precieux I",
    brand: "Armaf",
    gender: "Unisex",
    price: 74,
    size: "100ml",
    fragranticaId: 93272,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Precieux-I",
    available: true
  },
{
    id: 202,
    name: "Club de Nuit Precieux Woman",
    brand: "Armaf",
    gender: "Dama",
    price: 74,
    size: "55ml",
    fragranticaId: 115124,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Precieux-IV",
    available: true
  },
{
    id: 203,
    name: "Club de Nuit Bling",
    brand: "Armaf",
    gender: "Caballero",
    price: 74,
    size: "105ml",
    fragranticaId: 117624,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Bling",
    available: true
  },
{
    id: 204,
    name: "Club de Nuit Milestone",
    brand: "Armaf",
    gender: "Unisex",
    price: 55,
    size: "100ml",
    fragranticaId: 64104,
    brandSlug: "Armaf",
    perfumeSlug: "Club-de-Nuit-Milestone",
    available: true
  },
{
    id: 206,
    name: "Club de Nuit Woman Extrait Parfum",
    brand: "Armaf",
    gender: "Dama",
    price: 54,
    size: "105ml",
    fragranticaId: 102814,
    brandSlug: "Armaf",
    perfumeSlug: "Club-De-Nuit-Woman-Extrait",
    available: true
  },
{
    id: 5,
    name: "Odyssey Homme White Edition",
    brand: "Armaf",
    gender: "Caballero",
    price: 41,
    size: "100ml",
    fragranticaId: 64466,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Homme-White-Edition",
    available: true
  },
{
    id: 91,
    name: "Odyssey Aoud",
    brand: "Armaf",
    gender: "Unisex",
    price: 42,
    size: "100ml",
    fragranticaId: 83136,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Aoud",
    available: true
  },
{
    id: 104,
    name: "Odyssey Mandarine Sky",
    brand: "Armaf",
    gender: "Caballero",
    price: 47,
    size: "100ml",
    fragranticaId: 83132,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Mandarin-Sky",
    available: true
  },
{
    id: 105,
    name: "Odyssey Artisto",
    brand: "Armaf",
    gender: "Unisex",
    price: 54,
    size: "100ml",
    fragranticaId: 106710,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Artisto",
    available: true
  },
{
    id: 106,
    name: "Odyssey Bahamas",
    brand: "Armaf",
    gender: "Unisex",
    price: 57,
    size: "100ml",
    fragranticaId: 115127,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-BA-HA-MAS",
    available: true
  },
{
    id: 107,
    name: "Odyssey Toffee Coffee",
    brand: "Armaf",
    gender: "Unisex",
    price: 63,
    size: "100ml",
    fragranticaId: 115137,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Toffee-Coffee",
    available: true
  },
{
    id: 108,
    name: "Odyssey Spectra",
    brand: "Armaf",
    gender: "Unisex",
    price: 41,
    size: "100ml",
    fragranticaId: 98692,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Spectra",
    available: true
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
    available: false
  },
{
    id: 110,
    name: "Odyssey Homme",
    brand: "Armaf",
    gender: "Caballero",
    price: 41,
    size: "100ml",
    fragranticaId: 64464,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Homme",
    available: true
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
    available: false
  },
{
    id: 112,
    name: "Odyssey Mandarin Sky Elixir",
    brand: "Armaf",
    gender: "Unisex",
    price: 70,
    size: "100ml",
    fragranticaId: 106709,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Mandarin-Sky-Elixir",
    available: true
  },
{
    id: 113,
    name: "Odyssey Mega",
    brand: "Armaf",
    gender: "Caballero",
    price: 41,
    size: "100ml",
    fragranticaId: 83133,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Mega-Man",
    available: true
  },
{
    id: 114,
    name: "Odyssey Limoni Fresh",
    brand: "Armaf",
    gender: "Unisex",
    price: 43,
    size: "100ml",
    fragranticaId: 98695,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Limoni-Fresh",
    available: true
  },
{
    id: 207,
    name: "Odyssey Tyrant",
    brand: "Armaf",
    gender: "Caballero",
    price: 42,
    size: "100ml",
    fragranticaId: 83135,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Tyrant-Special-Edition",
    available: true
  },
{
    id: 208,
    name: "Odyssey Candee",
    brand: "Armaf",
    gender: "Dama",
    price: 41,
    size: "100ml",
    fragranticaId: 96990,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Candee",
    available: true
  },
{
    id: 209,
    name: "Odyssey Marshmallow",
    brand: "Armaf",
    gender: "Unisex",
    price: 61,
    size: "100ml",
    fragranticaId: 115132,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Marshmallow",
    available: true
  },
{
    id: 210,
    name: "Odyssey Go Mango",
    brand: "Armaf",
    gender: "Unisex",
    price: 57,
    size: "100ml",
    fragranticaId: 115130,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Go-Mango",
    available: true
  },
{
    id: 211,
    name: "Odyssey Black Forest",
    brand: "Armaf",
    gender: "Unisex",
    price: 61,
    size: "100ml",
    fragranticaId: 115125,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Black-Forest",
    available: true
  },
{
    id: 212,
    name: "Odyssey Revolution",
    brand: "Armaf",
    gender: "Unisex",
    price: 61,
    size: "100ml",
    fragranticaId: 109770,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Revolution",
    available: true
  },
{
    id: 213,
    name: "Odyssey Dubai Chocolate",
    brand: "Armaf",
    gender: "Caballero",
    price: 54,
    size: "100ml",
    fragranticaId: 102117,
    brandSlug: "Armaf",
    perfumeSlug: "Odyssey-Dubai-Chocolat",
    available: true
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
    available: false
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
    available: false
  },
{
    id: 144,
    name: "Island Bliss",
    brand: "Armaf",
    gender: "Unisex",
    price: 62,
    size: "100ml",
    fragranticaId: 98718,
    brandSlug: "Armaf",
    perfumeSlug: "Island-Bliss",
    available: true
  },
{
    id: 145,
    name: "Island Breeze",
    brand: "Armaf",
    gender: "Unisex",
    price: 68,
    size: "100ml",
    fragranticaId: 116844,
    brandSlug: "Armaf",
    perfumeSlug: "Island-Breeze",
    available: true
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
    available: false
  },
{
    id: 214,
    name: "Eter Desert Flower",
    brand: "Armaf",
    gender: "Unisex",
    price: 74,
    size: "100ml",
    fragranticaId: 92896,
    brandSlug: "Armaf",
    perfumeSlug: "Desert-Flower",
    available: true
  },
{
    id: 6,
    name: "Amber Oud Rouge Edition",
    brand: "Al Haramain",
    gender: "Unisex",
    price: 88,
    size: "100ml",
    fragranticaId: 66100,
    brandSlug: "Al-Haramain-Perfumes",
    perfumeSlug: "Amber-Oud-Rouge",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Al-Haramain-Perfumes/Amber-Oud-Rouge-66100.html",
    available: true
  },
{
    id: 7,
    name: "Amber Oud Gold Edition",
    brand: "Al Haramain",
    gender: "Unisex",
    price: 88,
    size: "100ml",
    fragranticaId: 51816,
    brandSlug: "Al-Haramain-Perfumes",
    perfumeSlug: "Amber-Oud-Gold-Edition",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Al-Haramain-Perfumes/Amber-Oud-Gold-Edition-51816.html",
    available: true
  },
{
    id: 8,
    name: "Amber Oud Carbon Edition",
    brand: "Al Haramain",
    gender: "Unisex",
    price: 78,
    size: "100ml",
    fragranticaId: 73207,
    brandSlug: "Al-Haramain-Perfumes",
    perfumeSlug: "Amber-Oud-Carbon-Edition",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Al-Haramain-Perfumes/Amber-Oud-Carbon-Edition-73207.html",
    available: true
  },
{
    id: 9,
    name: "Amber Oud White Edition",
    brand: "Al Haramain",
    gender: "Unisex",
    price: 84,
    size: "100ml",
    fragranticaId: 73210,
    brandSlug: "Al-Haramain-Perfumes",
    perfumeSlug: "Amber-Oud-White-Edition",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Al-Haramain-Perfumes/Amber-Oud-White-Edition-73210.html",
    available: true
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
    available: false
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
    available: false
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
    available: false
  },
{
    id: 14,
    name: "Bade'e Al Oud Amethyst",
    brand: "Lattafa",
    gender: "Unisex",
    price: 41,
    size: "100ml",
    fragranticaId: 68214,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Bade-e-Al-Oud-Amethyst",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Bade-e-Al-Oud-Amethyst-68214.html",
    available: true
  },
{
    id: 15,
    name: "Bade'e Al Oud Oud for Glory",
    brand: "Lattafa",
    gender: "Unisex",
    price: 41,
    size: "100ml",
    fragranticaId: 64948,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Bade-e-Al-Oud-Oud-for-Glory",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Bade-e-Al-Oud-Oud-for-Glory-64948.html",
    available: true
  },
{
    id: 16,
    name: "Bade'e Al Oud Honor & Glory",
    brand: "Lattafa",
    gender: "Unisex",
    price: 41,
    size: "100ml",
    fragranticaId: 84302,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Bade-e-Al-Oud-Honor-Glory",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Bade-e-Al-Oud-Honor-Glory-84302.html",
    available: true
  },
{
    id: 18,
    name: "Eclaire Pistache",
    brand: "Lattafa",
    gender: "Unisex",
    price: 58,
    size: "100ml",
    fragranticaId: 113777,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Eclaire-Pistache",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Eclaire-Pistache-113777.html",
    available: true
  },
{
    id: 19,
    name: "Eclaire Banoffi",
    brand: "Lattafa",
    gender: "Unisex",
    price: 58,
    size: "100ml",
    fragranticaId: 113778,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Eclaire-Banoffi",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Eclaire-Banoffi-113778.html",
    available: true
  },
{
    id: 20,
    name: "Mayar Natural Intense",
    brand: "Lattafa",
    gender: "Dama",
    price: 36,
    size: "100ml",
    fragranticaId: 89759,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Mayar-Natural-Intense",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Mayar-Natural-Intense-89759.html",
    available: true
  },
{
    id: 21,
    name: "Fakhar Black",
    brand: "Lattafa",
    gender: "Caballero",
    price: 41,
    size: "100ml",
    fragranticaId: 70465,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Fakhar-Black",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Fakhar-Black-70465.html",
    available: true
  },
{
    id: 22,
    name: "Fakhar Rose",
    brand: "Lattafa",
    gender: "Dama",
    price: 41,
    size: "100ml",
    fragranticaId: 70466,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Fakhar-Rose",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Fakhar-Rose-70466.html",
    available: true
  },
{
    id: 103,
    name: "Qaed Al Fursan",
    brand: "Lattafa",
    gender: "Caballero",
    price: 34,
    size: "100ml",
    fragranticaId: 67996,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Qaed-Al-Fursan",
    available: true
  },
{
    id: 25,
    name: "Qaed Al Fursan Untamed",
    brand: "Lattafa",
    gender: "Caballero",
    price: 36,
    size: "100ml",
    fragranticaId: 105383,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Qaed-Al-Fursan-Untamed",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Qaed-Al-Fursan-Untamed-105383.html",
    available: true
  },
{
    id: 26,
    name: "Qaed Al Fursan Unlimited",
    brand: "Lattafa",
    gender: "Caballero",
    price: 34,
    size: "100ml",
    fragranticaId: 82590,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Qaed-Al-Fursan-Unlimited",
    available: true
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
    available: false
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
    available: false
  },
{
    id: 146,
    name: "Hayaati",
    brand: "Lattafa",
    gender: "Unisex",
    price: 34,
    size: "100ml",
    fragranticaId: 75902,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Hayaati-75902",
    available: true
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
    available: false
  },
{
    id: 148,
    name: "Vintage Radio",
    brand: "Lattafa",
    gender: "Unisex",
    price: 47,
    size: "100ml",
    fragranticaId: 89454,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Vintage-Radio",
    available: true
  },
{
    id: 149,
    name: "Emeer",
    brand: "Lattafa",
    gender: "Caballero",
    price: 61,
    size: "100ml",
    fragranticaId: 89761,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Emeer",
    available: true
  },
{
    id: 28,
    name: "Nebras Elixir",
    brand: "Lattafa",
    gender: "Unisex",
    price: 61,
    size: "100ml",
    fragranticaId: 85091,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Nebras-Elixir",
    available: true
  },
{
    id: 29,
    name: "Asad Elixir",
    brand: "Lattafa",
    gender: "Caballero",
    price: 53,
    size: "100ml",
    fragranticaId: 117616,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Asad-Elixir",
    available: true
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
  },
{
    id: 38,
    name: "Teriaq Intense",
    brand: "Lattafa",
    gender: "Unisex",
    price: 54,
    size: "100ml",
    fragranticaId: 99586,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Teriaq-Intense",
    available: true
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
    available: false
  },
{
    id: 40,
    name: "Victoria",
    brand: "Lattafa",
    gender: "Dama",
    price: 51,
    size: "100ml",
    fragranticaId: 102906,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Victoria",
    available: true
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
    available: false
  },
{
    id: 42,
    name: "Vanilla Freak",
    brand: "Lattafa",
    gender: "Unisex",
    price: 68,
    size: "100ml",
    fragranticaId: 114400,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Vanilla-Freak",
    available: true
  },
{
    id: 43,
    name: "Berry On Top",
    brand: "Lattafa",
    gender: "Unisex",
    price: 68,
    size: "100ml",
    fragranticaId: 114395,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Berry-On-Top",
    available: true
  },
{
    id: 44,
    name: "Choco Overdose",
    brand: "Lattafa",
    gender: "Unisex",
    price: 68,
    size: "100ml",
    fragranticaId: 114398,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Choco-Overdose",
    available: true
  },
{
    id: 45,
    name: "Mallow Madness",
    brand: "Lattafa",
    gender: "Unisex",
    price: 68,
    size: "100ml",
    fragranticaId: 114396,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Mallow-Madness",
    available: true
  },
{
    id: 46,
    name: "Whipped Pleasure",
    brand: "Lattafa",
    gender: "Unisex",
    price: 68,
    size: "100ml",
    fragranticaId: 114397,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Whipped-Pleasure",
    available: true
  },
{
    id: 47,
    name: "The Kingdom Woman",
    brand: "Lattafa",
    gender: "Dama",
    size: "100ml",
    fragranticaId: 98648,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "The-Kingdom-For-Women",
    available: false
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
    available: false
  },
{
    id: 49,
    name: "Layaan",
    brand: "Lattafa",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 117123,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Layaan",
    available: true
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
    available: false
  },
{
    id: 51,
    name: "Al Noble Safeer",
    brand: "Lattafa",
    gender: "Unisex",
    price: 41,
    size: "100ml",
    fragranticaId: 82795,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Safeer",
    available: true
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
    available: false
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
    available: false
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
    available: false
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
    available: false
  },
{
    id: 56,
    name: "Ajwaa",
    brand: "Lattafa",
    gender: "Unisex",
    price: 61,
    size: "100ml",
    fragranticaId: 85368,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ajwaa",
    available: true
  },
{
    id: 57,
    name: "Sehr",
    brand: "Lattafa",
    gender: "Unisex",
    price: 65,
    size: "100ml",
    fragranticaId: 94967,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Sehr",
    available: true
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
    available: false
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
    available: false
  },
{
    id: 60,
    name: "Jassor",
    brand: "Lattafa",
    gender: "Unisex",
    price: 50,
    size: "100ml",
    fragranticaId: 85093,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Jasoor",
    available: true
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
    available: false
  },
{
    id: 62,
    name: "Velvet Rose",
    brand: "Lattafa",
    gender: "Unisex",
    price: 34,
    size: "100ml",
    fragranticaId: 76867,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Velvet-Rose",
    available: true
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
    available: false
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
    available: false
  },
{
    id: 65,
    name: "Sakeena",
    brand: "Lattafa",
    gender: "Dama",
    price: 41,
    size: "100ml",
    fragranticaId: 85094,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Sakeena",
    available: true
  },
{
    id: 66,
    name: "Emaan",
    brand: "Lattafa",
    gender: "Dama",
    price: 34,
    size: "100ml",
    fragranticaId: 85091,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Emaan",
    available: true
  },
{
    id: 67,
    name: "Qimmah",
    brand: "Lattafa",
    gender: "Dama",
    price: 30,
    size: "100ml",
    fragranticaId: 82793,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Qimmah-for-Women",
    available: true
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
  },
{
    id: 73,
    name: "Ramz Gold",
    brand: "Lattafa",
    gender: "Unisex",
    price: 30,
    size: "100ml",
    fragranticaId: 70368,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ramz-Lattafa-Gold",
    available: true
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
    available: false
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
    available: false
  },
{
    id: 131,
    name: "Yara",
    brand: "Lattafa",
    gender: "Dama",
    price: 38,
    size: "100ml",
    fragranticaId: 76880,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Yara",
    available: true
  },
{
    id: 132,
    name: "Yara Tous",
    brand: "Lattafa",
    gender: "Dama",
    price: 38,
    size: "100ml",
    fragranticaId: 83320,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Yara-Tous",
    available: true
  },
{
    id: 133,
    name: "Yara Moi",
    brand: "Lattafa",
    gender: "Dama",
    price: 38,
    size: "100ml",
    fragranticaId: 80722,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Yara-Moi",
    available: true
  },
{
    id: 228,
    name: "Yara Candy",
    brand: "Lattafa",
    gender: "Dama",
    price: 38,
    size: "100ml",
    fragranticaId: 95752,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Yara-Candy",
    available: true
  },
{
    id: 134,
    name: "Asad",
    brand: "Lattafa",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 72821,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Asad",
    available: false
  },
{
    id: 135,
    name: "Asad Bourbon",
    brand: "Lattafa",
    gender: "Caballero",
    price: 47,
    size: "100ml",
    fragranticaId: 101124,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Asad-Bourbon",
    available: true
  },
{
    id: 136,
    name: "Asad Zanzibar",
    brand: "Lattafa",
    gender: "Caballero",
    price: 38,
    size: "100ml",
    fragranticaId: 90713,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Asad-Zanzibar",
    available: true
  },
{
    id: 128,
    name: "Khamrah",
    brand: "Lattafa",
    gender: "Unisex",
    price: 47,
    size: "100ml",
    fragranticaId: 75805,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Khamrah",
    available: true
  },
{
    id: 129,
    name: "Khamrah Qawha",
    brand: "Lattafa",
    gender: "Unisex",
    price: 47,
    size: "100ml",
    fragranticaId: 88175,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Khamrah-Qahwa",
    available: true
  },
{
    id: 130,
    name: "Khamrah Dukhan",
    brand: "Lattafa",
    gender: "Unisex",
    price: 54,
    size: "100ml",
    fragranticaId: 104529,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Khamrah-Dukhan",
    available: true
  },
{
    id: 150,
    name: "Opulent Dubai",
    brand: "Lattafa",
    gender: "Unisex",
    price: 38,
    size: "100ml",
    fragranticaId: 105609,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Opulent-Dubai",
    available: true
  },
{
    id: 76,
    name: "Liquid Brun",
    brand: "French Avenue",
    gender: "Caballero",
    price: 68,
    size: "100ml",
    fragranticaId: 94713,
    brandSlug: "French-Avenue",
    perfumeSlug: "Liquid-Brun",
    available: true
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
    available: false
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
    available: false
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
    available: false
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
    available: false
  },
{
    id: 81,
    name: "Vulcan Feu",
    brand: "French Avenue",
    gender: "Unisex",
    price: 70,
    size: "100ml",
    fragranticaId: 105520,
    brandSlug: "French-Avenue",
    perfumeSlug: "Vulcan-Feu",
    available: true
  },
{
    id: 82,
    name: "Supremacy Not Only Intense",
    brand: "Afnan",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 68271,
    brandSlug: "Afnan",
    perfumeSlug: "Supremacy-Not-Only-Intense",
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
  },
{
    id: 137,
    name: "9PM",
    brand: "Afnan",
    gender: "Caballero",
    price: 47,
    size: "100ml",
    fragranticaId: 65414,
    brandSlug: "Afnan",
    perfumeSlug: "9pm",
    available: true
  },
{
    id: 138,
    name: "9PM Nite Out",
    brand: "Afnan",
    gender: "Unisex",
    price: 74,
    size: "100ml",
    fragranticaId: 123313,
    brandSlug: "Afnan",
    perfumeSlug: "9-PM-Night-Out",
    available: true
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
    available: false
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
    available: false
  },
{
    id: 152,
    name: "Turathi Electric",
    brand: "Afnan",
    gender: "Unisex",
    price: 58,
    size: "100ml",
    fragranticaId: 108244,
    brandSlug: "Afnan",
    perfumeSlug: "Turathi-Electric",
    available: true
  },
{
    id: 153,
    name: "Turathi Blue",
    brand: "Afnan",
    gender: "Caballero",
    price: 54,
    size: "100ml",
    fragranticaId: 70839,
    brandSlug: "Afnan",
    perfumeSlug: "Turathi-Blue",
    available: true
  },
{
    id: 88,
    name: "Rave Now",
    brand: "Rave",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 82467,
    brandSlug: "RAVE",
    perfumeSlug: "Now",
    available: false
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
    available: false
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
    available: false
  },
{
    id: 92,
    name: "Baroque Rouge 540",
    brand: "Maison Alhambra",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 89849,
    brandSlug: "Maison-Alhambra",
    perfumeSlug: "Baroque-Rouge-540",
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
  },
{
    id: 98,
    name: "Nitro Pour Homme",
    brand: "Dumont",
    gender: "Caballero",
    price: 54,
    size: "100ml",
    fragranticaId: 73020,
    brandSlug: "Dumont",
    perfumeSlug: "Nitro-Pour-Homme",
    available: true
  },
{
    id: 99,
    name: "Nitro Blue",
    brand: "Dumont",
    gender: "Caballero",
    price: 54,
    size: "100ml",
    fragranticaId: 73021,
    brandSlug: "Dumont",
    perfumeSlug: "Nitro-Blue",
    available: true
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
    available: false
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
    available: false
  },
{
    id: 102,
    name: "Nitro Platinum",
    brand: "Dumont",
    gender: "Caballero",
    price: 61,
    size: "100ml",
    fragranticaId: 101991,
    brandSlug: "Dumont",
    perfumeSlug: "Nitro-Platinum",
    available: true
  },
{
    id: 122,
    name: "Hawas For Him",
    brand: "Rasasi",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 46890,
    brandSlug: "Rasasi",
    perfumeSlug: "Hawas-for-Him",
    available: false
  },
{
    id: 123,
    name: "Hawas Tropical",
    brand: "Rasasi",
    gender: "Caballero",
    price: 68,
    size: "100ml",
    fragranticaId: 108054,
    brandSlug: "Rasasi",
    perfumeSlug: "Hawas-Tropical",
    available: true
  },
{
    id: 124,
    name: "Hawas Fire",
    brand: "Rasasi",
    gender: "Unisex",
    price: 65,
    size: "100ml",
    fragranticaId: 101665,
    brandSlug: "Rasasi",
    perfumeSlug: "Hawas-Fire",
    available: true
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
    available: false
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
    available: false
  },
{
    id: 127,
    name: "Hawas Elixir",
    brand: "Rasasi",
    gender: "Unisex",
    price: 57,
    size: "100ml",
    fragranticaId: 110808,
    brandSlug: "Rasasi",
    perfumeSlug: "Hawas-Elixir",
    available: true
  },
{
    id: 155,
    name: "Cool Water",
    brand: "Davidoff",
    gender: "Caballero",
    price: 43,
    size: "125ml",
    fragranticaId: 507,
    brandSlug: "Davidoff",
    perfumeSlug: "Cool-Water",
    available: true
  },
{
    id: 156,
    name: "Cool Water Woman",
    brand: "Davidoff",
    gender: "Dama",
    price: 46,
    size: "100ml",
    fragranticaId: 508,
    brandSlug: "Davidoff",
    perfumeSlug: "Cool-Water-for-Women",
    available: true
  },
{
    id: 157,
    name: "Cool Water Intense",
    brand: "Davidoff",
    gender: "Caballero",
    price: 57,
    size: "125ml",
    fragranticaId: 55266,
    brandSlug: "Davidoff",
    perfumeSlug: "Cool-Water-Intense",
    available: true
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
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
    available: false
  },
{
    id: 167,
    name: "Sceptre Malachite",
    brand: "Maison Alhambra",
    gender: "Unisex",
    price: 41,
    size: "100ml",
    fragranticaId: 94163,
    brandSlug: "Maison-Alhambra",
    perfumeSlug: "Sceptre-Malachite",
    available: true
  },
{
    id: 225,
    name: "Glacier Pour Homme",
    brand: "Maison Alhambra",
    gender: "Caballero",
    price: 30,
    size: "100ml",
    fragranticaId: 93648,
    brandSlug: "Maison-Alhambra",
    perfumeSlug: "Glacier-Pour-Homme",
    available: true
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
    available: false
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
    available: false
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
    available: false
  },
{
    id: 226,
    name: "Khair Fusion",
    brand: "Paris Corner",
    gender: "Dama",
    price: 41,
    size: "100ml",
    fragranticaId: 92768,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Khair-Fusion",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Khair-Fusion-92768.html",
    available: true
  },
{
    id: 227,
    name: "Khair Confection",
    brand: "Paris Corner",
    gender: "Dama",
    price: 41,
    size: "100ml",
    fragranticaId: 99069,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Khair-Confection",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Khair-Confection-99069.html",
    available: true
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
    available: false
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
    available: false
  },
{
    id: 180,
    name: "Bharara Queen",
    brand: "Bharara",
    gender: "Dama",
    price: 92,
    size: "100ml",
    fragranticaId: 95437,
    brandSlug: "Bharara",
    perfumeSlug: "Bharara-Queen",
    available: true
  },
{
    id: 181,
    name: "Viking Rio",
    brand: "Bharara",
    gender: "Unisex",
    price: 109,
    size: "100ml",
    fragranticaId: 96818,
    brandSlug: "Bharara",
    perfumeSlug: "Viking-Rio",
    available: true
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
    available: false
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
    available: false
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
    available: false
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
    available: false
  },
{
    id: 215,
    name: "Fakhar Platin",
    brand: "Lattafa",
    gender: "Caballero",
    price: 41,
    size: "100ml",
    fragranticaId: 107363,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Fakhar-Platin",
    available: true
  },
{
    id: 216,
    name: "Veneno Bianco",
    brand: "Lattafa",
    gender: "Dama",
    price: 74,
    size: "100ml",
    fragranticaId: 105518,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Veneno-Bianco",
    available: true
  },
{
    id: 217,
    name: "Ana Abiyedh Coral",
    brand: "Lattafa",
    gender: "Dama",
    price: 34,
    size: "60ml",
    fragranticaId: 103256,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Ana-Abiyedh-Coral",
    available: true
  },
{
    id: 218,
    name: "Mayar Cherry",
    brand: "Lattafa",
    gender: "Dama",
    price: 45,
    size: "100ml",
    fragranticaId: 99872,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Mayar-Cherry",
    available: true
  },
{
    id: 219,
    name: "Eclaire",
    brand: "Lattafa",
    gender: "Dama",
    price: 47,
    size: "100ml",
    fragranticaId: 93628,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Eclaire",
    available: true
  },
{
    id: 220,
    name: "Tharwah Silver",
    brand: "Lattafa",
    gender: "Caballero",
    price: 51,
    size: "100ml",
    fragranticaId: 82005,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Tharwah-Silver",
    available: true
  },
{
    id: 221,
    name: "Shaghaf Oud Azraq",
    brand: "Lattafa",
    gender: "Unisex",
    price: 61,
    size: "100ml",
    fragranticaId: 82383,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Bade-e-Al-Oud-Shaghaf-Oud-Azraq",
    available: true
  },
{
    id: 222,
    name: "Casablanca",
    brand: "Lattafa",
    gender: "Unisex",
    price: 61,
    size: "100ml",
    fragranticaId: 91556,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Casablanca",
    available: true
  },
{
    id: 223,
    name: "Tiramisu Caramel",
    brand: "Zimaya",
    gender: "Dama",
    price: 47,
    size: "100ml",
    fragranticaId: 98691,
    brandSlug: "Zimaya",
    perfumeSlug: "Tiramisu-Caramel",
    available: true
  },
{
    id: 224,
    name: "Caramel Cascade",
    brand: "Paris Corner",
    gender: "Dama",
    price: 41,
    size: "100ml",
    fragranticaId: 95545,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Caramel-Cascade",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Caramel-Cascade-95545.html",
    available: true
  },
{
    id: 186,
    name: "Good Girl",
    brand: "Carolina Herrera",
    gender: "Dama",
    size: "80ml",
    fragranticaId: 39681,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "Good-Girl",
    concentration: "Eau de Parfum",
    available: false
  },
{
    id: 187,
    name: "Good Girl Blush",
    brand: "Carolina Herrera",
    gender: "Dama",
    size: "80ml",
    fragranticaId: 78576,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "Good-Girl-Blush",
    concentration: "Eau de Parfum",
    available: false
  },
{
    id: 188,
    name: "Very Good Girl",
    brand: "Carolina Herrera",
    gender: "Dama",
    size: "75ml",
    fragranticaId: 65560,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "Very-Good-Girl",
    concentration: "Eau de Parfum",
    available: false
  },
{
    id: 189,
    name: "Very Good Girl Elixir",
    brand: "Carolina Herrera",
    gender: "Dama",
    size: "80ml",
    fragranticaId: 101155,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "Very-Good-Girl-Elixir",
    concentration: "Elixir",
    available: false
  },
{
    id: 190,
    name: "Good Girl Blush Elixir Eau de Parfum",
    brand: "Carolina Herrera",
    gender: "Dama",
    size: "80ml",
    fragranticaId: 88937,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "Good-Girl-Blush-Elixir-Eau-de-Parfum",
    concentration: "Eau de Parfum",
    available: false
  },
{
    id: 191,
    name: "La Bomba",
    brand: "Carolina Herrera",
    gender: "Dama",
    size: "80ml",
    fragranticaId: 105931,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "La-Bomba",
    concentration: "Eau de Parfum",
    available: false
  },
{
    id: 192,
    name: "Bad Boy Cobalt Parfum Electrique",
    brand: "Carolina Herrera",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 71888,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "Bad-Boy-Cobalt-Parfum-Electrique",
    concentration: "Parfum",
    available: false
  },
{
    id: 193,
    name: "Bad Boy",
    brand: "Carolina Herrera",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 55449,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "Bad-Boy",
    concentration: "Eau de Toilette",
    available: false
  },
{
    id: 194,
    name: "Bad Boy Cobalt Elixir",
    brand: "Carolina Herrera",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 89374,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "Bad-Boy-Cobalt-Elixir",
    concentration: "Elixir",
    available: false
  },
{
    id: 195,
    name: "Bad Boy Extreme",
    brand: "Carolina Herrera",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 78562,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "Bad-Boy-Extreme",
    concentration: "Eau de Parfum",
    available: false
  },
{
    id: 196,
    name: "Bad Boy Le Parfum",
    brand: "Carolina Herrera",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 65718,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "Bad-Boy-Le-Parfum",
    concentration: "Parfum",
    available: false
  },
{
    id: 197,
    name: "Bad Boy Elixir",
    brand: "Carolina Herrera",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 101597,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "Bad-Boy-Elixir",
    concentration: "Elixir",
    available: false
  },
{
    id: 198,
    name: "CH Men",
    brand: "Carolina Herrera",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 6759,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "CH-Men",
    concentration: "Eau de Toilette",
    available: false
  },
{
    id: 199,
    name: "212 VIP Men",
    brand: "Carolina Herrera",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 12865,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "212-VIP-Men",
    concentration: "Eau de Toilette",
    available: false
  },
{
    id: 200,
    name: "212 Men",
    brand: "Carolina Herrera",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 297,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "212-Men",
    concentration: "Eau de Toilette",
    available: false
  },
{
    id: 201,
    name: "212 VIP Black",
    brand: "Carolina Herrera",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 46093,
    brandSlug: "Carolina-Herrera",
    perfumeSlug: "212-VIP-Black",
    concentration: "Eau de Parfum",
    available: false
  },

{
    id: 230,
    name: "Yara Elixir",
    brand: "Lattafa",
    gender: "Dama",
    price: 47,
    size: "100ml",
    fragranticaId: 117615,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Yara-Elixir",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Yara-Elixir-117615.html",
    available: true
  },
{
    id: 231,
    name: "Bade'e Al Oud Sublime",
    brand: "Lattafa",
    gender: "Unisex",
    price: 47,
    size: "100ml",
    fragranticaId: 83309,
    brandSlug: "Lattafa-Perfumes",
    perfumeSlug: "Bade-e-Al-Oud-Sublime",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Lattafa-Perfumes/Bade-e-Al-Oud-Sublime-83309.html",
    available: true
  },

  // ═══════════════════════════════════════════════════════
  // 🏛️ PARIS CORNER
  // ═══════════════════════════════════════════════════════
{
    id: 232,
    name: "Indomitable",
    brand: "Paris Corner",
    gender: "Dama",
    price: 55,
    size: "100ml",
    fragranticaId: 106231,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Indomitable",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Indomitable-106231.html",
    available: true
  },
{
    id: 233,
    name: "Marshmallow Blush",
    brand: "Paris Corner",
    gender: "Dama",
    price: 72,
    size: "100ml",
    fragranticaId: 102791,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Marshmallow-Blush",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Marshmallow-Blush-102791.html",
    available: true
  },
{
    id: 234,
    name: "Khair",
    brand: "Paris Corner",
    gender: "Dama",
    price: 32,
    size: "100ml",
    fragranticaId: 92767,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Khair",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Khair-92767.html",
    available: true
  },
{
    id: 235,
    name: "Khair Felicity",
    brand: "Paris Corner",
    gender: "Dama",
    price: 45,
    size: "100ml",
    fragranticaId: 102874,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Khair-Felicity",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Khair-Felicity-102874.html",
    available: true
  },
{
    id: 236,
    name: "December",
    brand: "Paris Corner",
    gender: "Dama",
    price: 57,
    size: "100ml",
    fragranticaId: 96254,
    brandSlug: "Paris-Corner",
    perfumeSlug: "December-Vanilla",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/December-Vanilla-96254.html",
    available: true
  },
{
    id: 237,
    name: "Emir Memories of Summer",
    brand: "Paris Corner",
    gender: "Unisex",
    price: 57,
    size: "100ml",
    fragranticaId: 111166,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Emir-Memories-of-Summer",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Lueur-d-Espoir-Memories-of-Summer-111166.html",
    available: true
  },
{
    id: 238,
    name: "Taskeen",
    brand: "Paris Corner",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 97355,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Taskeen",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Taskeen-97355.html",
    available: true
  },
{
    id: 239,
    name: "Taskeen Marina",
    brand: "Paris Corner",
    gender: "Dama",
    price: 41,
    size: "100ml",
    fragranticaId: 97356,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Taskeen-Marina",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Taskeen-Marina-97356.html",
    available: true
  },
{
    id: 240,
    name: "Lactea Divina",
    brand: "Paris Corner",
    gender: "Dama",
    price: 41,
    size: "100ml",
    fragranticaId: 99799,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Lactea-Divina",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Taskeen-Lactea-Divina-99799.html",
    available: true
  },
{
    id: 241,
    name: "Fayora",
    brand: "Paris Corner",
    gender: "Dama",
    price: 53,
    size: "100ml",
    fragranticaId: 109930,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Fayora",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Fayora-109930.html",
    available: true
  },
{
    id: 242,
    name: "Mango Punch",
    brand: "Paris Corner",
    gender: "Dama",
    price: 43,
    size: "100ml",
    fragranticaId: 102678,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Mango-Punch",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Mango-Punch-102678.html",
    available: true
  },
{
    id: 243,
    name: "Juice Melange",
    brand: "Paris Corner",
    gender: "Dama",
    price: 43,
    size: "100ml",
    fragranticaId: 104124,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Juice-Melange",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Juicy-Melange-104124.html",
    available: true
  },
{
    id: 244,
    name: "Pear Potion",
    brand: "Paris Corner",
    gender: "Dama",
    price: 43,
    size: "100ml",
    fragranticaId: 100625,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Pear-Potion",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Pear-Potion-100625.html",
    available: true
  },
{
    id: 245,
    name: "Qissa Pink",
    brand: "Paris Corner",
    gender: "Dama",
    price: 38,
    size: "100ml",
    fragranticaId: 98578,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Qissa-Pink",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Qissa-Pink-98578.html",
    available: true
  },
{
    id: 246,
    name: "Qissa Delicius",
    brand: "Paris Corner",
    gender: "Dama",
    price: 38,
    size: "100ml",
    fragranticaId: 98552,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Qissa-Delicius",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Qissa-Delicious-98552.html",
    available: true
  },
{
    id: 247,
    name: "Qissa Blue",
    brand: "Paris Corner",
    gender: "Dama",
    price: 38,
    size: "100ml",
    fragranticaId: 98579,
    brandSlug: "Paris-Corner",
    perfumeSlug: "Qissa-Blue",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Paris-Corner/Qissa-Blue-98579.html",
    available: true
  },

  // ═══════════════════════════════════════════════════════
  // 🏜️ ZIMAYA
  // ═══════════════════════════════════════════════════════
{
    id: 248,
    name: "Evolution",
    brand: "Zimaya",
    gender: "Caballero",
    price: 32,
    size: "100ml",
    fragranticaId: 103823,
    brandSlug: "Zimaya",
    perfumeSlug: "Evolution",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Zimaya/Evolution-103823.html",
    available: true
  },
{
    id: 249,
    name: "Tiramisu Coco",
    brand: "Zimaya",
    gender: "Dama",
    price: 47,
    size: "100ml",
    fragranticaId: 98690,
    brandSlug: "Zimaya",
    perfumeSlug: "Tiramisu-Coco",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Zimaya/Tiramisu-Coco-98690.html",
    available: true
  },
{
    id: 250,
    name: "Charisma",
    brand: "Zimaya",
    gender: "Caballero",
    price: 36,
    size: "100ml",
    fragranticaId: 103119,
    brandSlug: "Zimaya",
    perfumeSlug: "Charisma-Pour-Homme",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Zimaya/Charisma-Pour-Homme-103119.html",
    available: true
  },
{
    id: 251,
    name: "Grandeur",
    brand: "Zimaya",
    gender: "Caballero",
    price: 31,
    size: "100ml",
    fragranticaId: 92578,
    brandSlug: "Zimaya",
    perfumeSlug: "Grandeur",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Zimaya/Grandeur-92578.html",
    available: true
  },
{
    id: 252,
    name: "Is Great",
    brand: "Zimaya",
    gender: "Caballero",
    size: "100ml",
    fragranticaId: 92588,
    brandSlug: "Zimaya",
    perfumeSlug: "Is-Great",
    available: false
  },
{
    id: 253,
    name: "Happy Oud",
    brand: "Zimaya",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 95992,
    brandSlug: "Zimaya",
    perfumeSlug: "Happy-Oud",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Zimaya/Happy-Oud-95992.html",
    available: false
  },
{
    id: 254,
    name: "Fatima Pink",
    brand: "Zimaya",
    gender: "Dama",
    price: 38,
    size: "100ml",
    fragranticaId: 92817,
    brandSlug: "Zimaya",
    perfumeSlug: "Fatima-Pink",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Zimaya/Fatima-Pink-92817.html",
    available: true
  },
{
    id: 255,
    name: "Fatima Velvet",
    brand: "Zimaya",
    gender: "Dama",
    price: 38,
    size: "100ml",
    fragranticaId: 120898,
    brandSlug: "Zimaya",
    perfumeSlug: "Fatima-Velvet-Love",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Zimaya/Fatima-Velvet-Love-120898.html",
    available: true
  },
{
    id: 256,
    name: "Only You",
    brand: "Zimaya",
    gender: "Dama",
    price: 32,
    size: "100ml",
    fragranticaId: 92819,
    brandSlug: "Zimaya",
    perfumeSlug: "Only-You",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Zimaya/Only-You-92819.html",
    available: true
  },
{
    id: 257,
    name: "Hayam",
    brand: "Zimaya",
    gender: "Dama",
    price: 38,
    size: "100ml",
    fragranticaId: 92593,
    brandSlug: "Zimaya",
    perfumeSlug: "Hayam",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Zimaya/Hayam-92593.html",
    available: true
  },
{
    id: 258,
    name: "Anhaar Valley",
    brand: "Zimaya",
    gender: "Unisex",
    price: 35,
    size: "100ml",
    fragranticaId: 97032,
    brandSlug: "Zimaya",
    perfumeSlug: "Anhaar-Valley",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Zimaya/Anhaar-Valley-97032.html",
    available: true
  },
{
    id: 259,
    name: "Hawwa Red",
    brand: "Zimaya",
    gender: "Unisex",
    size: "100ml",
    fragranticaId: 92588,
    brandSlug: "Zimaya",
    perfumeSlug: "Hawwa-Red",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Zimaya/Hawwa-Red-92588.html",
    available: false
  },

  // ═══════════════════════════════════════════════════════
  // 🧁 ARABIYAT (línea gourmand / Arabiyat Sugar)
  // ═══════════════════════════════════════════════════════
{
    id: 260,
    name: "Coconut Chiffon",
    brand: "Arabiyat",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 118599,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Coconut-Chiffon",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Coconut-Chiffon-118599.html",
    available: true
  },
{
    id: 261,
    name: "Berries Cream Macaron",
    brand: "Arabiyat",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 118602,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Berries-Cream-Macaron",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Berries-Cream-Macaron-118602.html",
    available: true
  },
{
    id: 262,
    name: "Strawberry Tres Leches",
    brand: "Arabiyat",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 118598,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Strawberry-Tres-Leches",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Strawberry-Tres-Leches-118598.html",
    available: true
  },
{
    id: 263,
    name: "Vanilla Cream Macaron",
    brand: "Arabiyat",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 118601,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Vanilla-Cream-Macaron",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Vanilla-Cream-Macaron-118601.html",
    available: true
  },
{
    id: 264,
    name: "Mango Affogato",
    brand: "Arabiyat",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 118592,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Mango-Affogato",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Mango-Affogato-118592.html",
    available: true
  },
{
    id: 265,
    name: "Caramel Chocolate Macaron",
    brand: "Arabiyat",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 118600,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Caramel-Chocolate-Macaron",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Caramel-Chocolate-Macaron-118600.html",
    available: true
  },
{
    id: 266,
    name: "Dulce de Leche",
    brand: "Arabiyat",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 118595,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Dulce-de-Leche",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Dulce-de-Leche-118595.html",
    available: true
  },
{
    id: 267,
    name: "Sugar Cotton",
    brand: "Arabiyat",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 118597,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Cotton-Blush",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Cotton-Blush-118597.html",
    available: true
  },
{
    id: 268,
    name: "Pecan Butter",
    brand: "Arabiyat",
    gender: "Unisex",
    price: 54,
    size: "100ml",
    fragranticaId: 118603,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Pecan-Butter-Cookie",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Pecan-Butter-Cookie-118603.html",
    available: true
  },
{
    id: 269,
    name: "Lemon Sorbet",
    brand: "Arabiyat",
    gender: "Unisex",
    price: 54,
    size: "100ml",
    fragranticaId: 118596,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Lemon-Sorbet",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Lemon-Sorbet-118596.html",
    available: true
  },
{
    id: 270,
    name: "Cookie Dough",
    brand: "Arabiyat",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 118604,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Cookie-Dough",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Cookie-Dough-118604.html",
    available: true
  },
{
    id: 271,
    name: "Matcha Latte",
    brand: "Arabiyat",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 118608,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Matcha-Latte",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Matcha-Latte-118608.html",
    available: true
  },
{
    id: 272,
    name: "Toffe Ganache",
    brand: "Arabiyat",
    gender: "Dama",
    price: 54,
    size: "100ml",
    fragranticaId: 118605,
    brandSlug: "Arabiyat-Sugar",
    perfumeSlug: "Toffee-Ganache",
    fragranticaSearchUrl: "https://www.fragrantica.es/perfume/Arabiyat-Sugar/Toffee-Ganache-118605.html",
    available: true
  },
{
    id: 273,
    name: "Marwa",
    brand: "Arabiyat",
    gender: "Dama",
    price: 74,
    size: "100ml",
    fragranticaId: 107084,
    brandSlug: "Arabiyat-Prestige",
    perfumeSlug: "Marwa",
    available: true
  }
];
