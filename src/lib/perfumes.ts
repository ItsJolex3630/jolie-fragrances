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
    emoji: "💨",
    color: "text-[#d4af37]",
    bgColor: "bg-[#d4af37]/20",
    borderColor: "border-[#d4af37]/30"
  },
  Frutal: {
    emoji: "🍎",
    color: "text-emerald-300",
    bgColor: "bg-emerald-500/20",
    borderColor: "border-emerald-500/30"
  }
};

export type Concentration = "EDP" | "EDT" | "Parfum" | "Elixir" | "EdC" | "EdF";

export interface Perfume {
  id: number;
  name: string;
  brand: Brand;
  gender: Gender;
  size: string;
  fragranticaId: number;
  brandSlug: string;
  perfumeSlug: string;
  price?: number; // Retail price in USD
  available?: boolean;
  temporalDiscountPct?: number; // Admin-set temporary discount percentage
  temporalDiscountLabel?: string; // Admin-set label (e.g., "OFERTA DAMA", "CYBER WEEK")
  customImageUrl?: string; // Custom image override
  fragranticaSearchUrl?: string;
  notes?: Note[];
  concentration?: Concentration;
}

export type Brand =
  | "Armaf"
  | "Afnan"
  | "Lattafa"
  | "Al Haramain"
  | "Maison Alhambra"
  | "French Avenue"
  | "Rasasi"
  | "Fragrance World"
  | "Zimaya"
  | "Arabiyat"
  | "Orientica";

export const BRANDS: Brand[] = [
  "Armaf",
  "Afnan",
  "Lattafa",
  "Al Haramain",
  "Maison Alhambra",
  "French Avenue",
  "Rasasi",
  "Fragrance World",
  "Zimaya",
  "Arabiyat",
  "Orientica"
];

export const GENDERS: Gender[] = ["Dama", "Caballero", "Unisex"];

export function getImageUrl(fragranticaId: number): string {
  return `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${fragranticaId}.avif`;
}

export function getImageFallbackUrl(fragranticaId: number): string {
  return `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${fragranticaId}.jpg`;
}

export function getFragranticaUrl(perfume: Perfume): string {
  if (perfume.fragranticaSearchUrl) {
    return perfume.fragranticaSearchUrl;
  }
  return `https://www.fragrantica.es/perfume/${perfume.brandSlug}/${perfume.perfumeSlug}-${perfume.fragranticaId}.html`;
}
