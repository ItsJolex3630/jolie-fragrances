"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Heart,
  Gem,
  Sparkles,
  Wind,
  Flower2,
  TreePine,
  Star,
  Instagram,
  Clock,
} from "lucide-react";
import {
  getImageUrl,
  type Perfume,
} from "@/lib/perfumes";

// ─── Gender badge styles ───
const genderStyles: Record<string, string> = {
  Dama: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Caballero: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Unisex: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const genderIcons: Record<string, string> = {
  Dama: "♀",
  Caballero: "♂",
  Unisex: "⚥",
};

// ─── Detailed note pyramid data with percentages ───
interface NoteWithPercentage {
  name: string;
  percentage: number;
}

interface NotePyramidDetailed {
  top: NoteWithPercentage[];
  heart: NoteWithPercentage[];
  base: NoteWithPercentage[];
}

const NOTE_PYRAMIDS: Record<number, NotePyramidDetailed> = {
  // 1. Club de Nuit Intense Man
  1: {
    top: [
      { name: "Limón", percentage: 90 },
      { name: "Piña", percentage: 80 },
      { name: "Bergamota", percentage: 70 },
      { name: "Mandarina", percentage: 60 },
    ],
    heart: [
      { name: "Abedul", percentage: 88 },
      { name: "Jazmín", percentage: 65 },
      { name: "Rosa", percentage: 55 },
    ],
    base: [
      { name: "Vainilla", percentage: 92 },
      { name: "Almizcle", percentage: 78 },
      { name: "Ámbar", percentage: 70 },
      { name: "Pachulí", percentage: 60 },
    ],
  },
  // 2. Club de Nuit Intense Man Limited Edition
  2: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Piña", percentage: 85 },
      { name: "Lima", percentage: 75 },
      { name: "Bergamota", percentage: 70 },
      { name: "Pimienta Negra", percentage: 60 },
    ],
    heart: [
      { name: "Abedul", percentage: 90 },
      { name: "Jazmín", percentage: 70 },
      { name: "Rosa", percentage: 65 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Ámbar Gris", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Vainilla", percentage: 60 },
    ],
  },
  // 3. Club de Nuit Woman
  3: {
    top: [
      { name: "Naranja", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Toronja", percentage: 75 },
      { name: "Melocotón", percentage: 65 },
    ],
    heart: [
      { name: "Rosa", percentage: 85 },
      { name: "Jazmín", percentage: 75 },
      { name: "Geranio", percentage: 60 },
      { name: "Lichi", percentage: 55 },
    ],
    base: [
      { name: "Pachulí", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
      { name: "Vainilla", percentage: 75 },
      { name: "Vetiver", percentage: 60 },
    ],
  },
  // 4. Club de Nuit White Imperiale
  4: {
    top: [
      { name: "Lichi", percentage: 90 },
      { name: "Bergamota", percentage: 80 },
      { name: "Nuez Moscada", percentage: 60 },
    ],
    heart: [
      { name: "Rosa Turca", percentage: 95 },
      { name: "Peonía", percentage: 80 },
      { name: "Almizcle", percentage: 70 },
      { name: "Vainilla", percentage: 65 },
    ],
    base: [
      { name: "Cachemira", percentage: 85 },
      { name: "Incienso", percentage: 70 },
      { name: "Cedro", percentage: 65 },
      { name: "Vetiver", percentage: 50 },
    ],
  },
  // 5 (115). Club de Nuit Iconic
  115: {
    top: [
      { name: "Toronja", percentage: 95 },
      { name: "Limón", percentage: 90 },
      { name: "Menta", percentage: 85 },
      { name: "Pimienta Rosa", percentage: 70 },
      { name: "Cilantro", percentage: 60 },
    ],
    heart: [
      { name: "Jengibre", percentage: 88 },
      { name: "Nuez Moscada", percentage: 75 },
      { name: "Jazmín", percentage: 65 },
      { name: "Melón", percentage: 60 },
    ],
    base: [
      { name: "Incienso", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Cedro", percentage: 75 },
      { name: "Sándalo", percentage: 70 },
      { name: "Pachulí", percentage: 65 },
    ],
  },
  // 6 (116). Club de Nuit Sillage
  116: {
    top: [
      { name: "Bergamota", percentage: 95 },
      { name: "Grosellas Negras", percentage: 85 },
      { name: "Limón", percentage: 80 },
      { name: "Lima", percentage: 75 },
      { name: "Violeta", percentage: 65 },
      { name: "Jengibre", percentage: 60 },
    ],
    heart: [
      { name: "Iris", percentage: 85 },
      { name: "Jazmín", percentage: 70 },
      { name: "Rosa", percentage: 65 },
    ],
    base: [
      { name: "Almizcle", percentage: 95 },
      { name: "Ámbar Gris", percentage: 85 },
      { name: "Sándalo", percentage: 70 },
      { name: "Cedro", percentage: 65 },
    ],
  },
  // 7 (117). Club de Nuit Urban Man Elixir
  117: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Pimienta Rosa", percentage: 80 },
      { name: "Jazmín", percentage: 65 },
      { name: "Flor de Azahar", percentage: 60 },
    ],
    heart: [
      { name: "Lavanda", percentage: 85 },
      { name: "Geranio", percentage: 75 },
      { name: "Azafrán", percentage: 70 },
      { name: "Elemí", percentage: 65 },
      { name: "Vetiver", percentage: 60 },
    ],
    base: [
      { name: "Ambroxan", percentage: 90 },
      { name: "Ámbar", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Cedro", percentage: 70 },
      { name: "Ládano", percentage: 55 },
    ],
  },
  // 8 (118). Club de Nuit Urban Man
  118: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Toronja", percentage: 85 },
      { name: "Menta", percentage: 80 },
      { name: "Cardamomo", percentage: 70 },
    ],
    heart: [
      { name: "Nuez Moscada", percentage: 80 },
      { name: "Jengibre", percentage: 75 },
      { name: "Cedro", percentage: 70 },
      { name: "Lavanda", percentage: 65 },
    ],
    base: [
      { name: "Pachulí", percentage: 85 },
      { name: "Vetiver", percentage: 75 },
      { name: "Sándalo", percentage: 70 },
      { name: "Musgo de Roble", percentage: 60 },
    ],
  },
  // 9 (119). Club de Nuit Maleka
  119: {
    top: [
      { name: "Notas Florales", percentage: 85 },
      { name: "Frutas Silvestres", percentage: 80 },
      { name: "Pera", percentage: 75 },
    ],
    heart: [
      { name: "Jazmín", percentage: 80 },
      { name: "Nardos", percentage: 75 },
      { name: "Notas Especiadas", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
      { name: "Sándalo", percentage: 70 },
      { name: "Caramelo", percentage: 65 },
    ],
  },
  // 10 (120). Club de Nuit Untold
  120: {
    top: [
      { name: "Azafrán", percentage: 95 },
      { name: "Jazmín", percentage: 80 },
    ],
    heart: [
      { name: "Amberwood", percentage: 90 },
      { name: "Ámbar Gris", percentage: 85 },
    ],
    base: [
      { name: "Resina de Abeto", percentage: 85 },
      { name: "Cedro", percentage: 75 },
    ],
  },
  // 11 (121). Club de Nuit Precieux I
  121: {
    top: [
      { name: "Bergamota", percentage: 85 },
      { name: "Limón", percentage: 80 },
      { name: "Pimienta Rosa", percentage: 75 },
      { name: "Piña", percentage: 70 },
      { name: "Caramelo", percentage: 65 },
    ],
    heart: [
      { name: "Madera de Gaïac", percentage: 80 },
      { name: "Jazmín", percentage: 70 },
      { name: "Anís Estrellado", percentage: 65 },
    ],
    base: [
      { name: "Ámbar", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
      { name: "Vainilla", percentage: 75 },
      { name: "Cuero", percentage: 70 },
      { name: "Pachulí", percentage: 60 },
    ],
  },
  // 12 (5). Odyssey Homme White Edition
  5: {
    top: [
      { name: "Toronja", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Notas Verdes", percentage: 80 },
      { name: "Pimienta Rosa", percentage: 65 },
    ],
    heart: [
      { name: "Jengibre", percentage: 80 },
      { name: "Menta", percentage: 75 },
      { name: "Nuez Moscada", percentage: 65 },
    ],
    base: [
      { name: "Cedro", percentage: 85 },
      { name: "Vetiver", percentage: 75 },
      { name: "Almizcle", percentage: 70 },
      { name: "Pachulí", percentage: 60 },
    ],
  },
  // 13 (91). Odyssey Aoud
  91: {
    top: [
      { name: "Azafrán", percentage: 90 },
      { name: "Nuez Moscada", percentage: 80 },
      { name: "Lavanda", percentage: 70 },
    ],
    heart: [
      { name: "Madera de Oud", percentage: 95 },
      { name: "Notas Terrosas", percentage: 65 },
    ],
    base: [
      { name: "Pachulí", percentage: 85 },
      { name: "Almizcle", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
    ],
  },
  // 14 (104). Odyssey Mandarine Sky
  104: {
    top: [
      { name: "Mandarina", percentage: 95 },
      { name: "Naranja", percentage: 85 },
      { name: "Azafrán", percentage: 70 },
    ],
    heart: [
      { name: "Caramelo", percentage: 90 },
      { name: "Tonka", percentage: 80 },
      { name: "Coco", percentage: 65 },
    ],
    base: [
      { name: "Ámbar", percentage: 85 },
      { name: "Cedro", percentage: 70 },
      { name: "Pachulí", percentage: 60 },
    ],
  },
  // 15 (105). Odyssey Artisto
  105: {
    top: [
      { name: "Limón", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Notas Verdes", percentage: 75 },
    ],
    heart: [
      { name: "Jengibre", percentage: 85 },
      { name: "Notas Marinas", percentage: 80 },
      { name: "Menta", percentage: 75 },
    ],
    base: [
      { name: "Cedro", percentage: 85 },
      { name: "Ámbar Gris", percentage: 75 },
      { name: "Vetiver", percentage: 70 },
    ],
  },
  // 16 (106). Odyssey Bahamas
  106: {
    top: [
      { name: "Piña", percentage: 90 },
      { name: "Coco", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
      { name: "Bergamota", percentage: 70 },
    ],
    heart: [
      { name: "Fruta de la Pasión", percentage: 85 },
      { name: "Jengibre", percentage: 70 },
      { name: "Jazmín", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Almizcle", percentage: 75 },
      { name: "Madera de Deriva", percentage: 65 },
    ],
  },
  // 17 (107). Odyssey Toffee Coffee
  107: {
    top: [
      { name: "Grano de Café", percentage: 95 },
      { name: "Toffee / Caramelo", percentage: 90 },
      { name: "Avellana", percentage: 75 },
    ],
    heart: [
      { name: "Leche Condensada", percentage: 85 },
      { name: "Canela", percentage: 75 },
      { name: "Jengibre", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Sándalo", percentage: 70 },
    ],
  },
  // 18 (108). Odyssey Spectra
  108: {
    top: [
      { name: "Pimienta Rosa", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
      { name: "Cardamomo", percentage: 75 },
    ],
    heart: [
      { name: "Iris", percentage: 90 },
      { name: "Hojas de Violeta", percentage: 75 },
      { name: "Especias", percentage: 65 },
    ],
    base: [
      { name: "Ámbar", percentage: 80 },
      { name: "Cedro", percentage: 75 },
      { name: "Pachulí", percentage: 70 },
      { name: "Cuero", percentage: 60 },
    ],
  },
  // 19 (109). Odyssey Aqua
  109: {
    top: [
      { name: "Pomelo", percentage: 90 },
      { name: "Notas Marinas", percentage: 85 },
      { name: "Yuzu", percentage: 80 },
      { name: "Pimienta Rosa", percentage: 65 },
    ],
    heart: [
      { name: "Hierbabuena", percentage: 85 },
      { name: "Hojas de Violeta", percentage: 70 },
      { name: "Lavanda", percentage: 65 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 85 },
      { name: "Madera de Gaïac", percentage: 75 },
      { name: "Madera de Ámbar", percentage: 70 },
    ],
  },
  // 20 (110). Odyssey Homme
  110: {
    top: [
      { name: "Mandarina", percentage: 85 },
      { name: "Pimienta Rosa", percentage: 75 },
    ],
    heart: [
      { name: "Iris", percentage: 90 },
      { name: "Cuero", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Haba Tonka", percentage: 75 },
    ],
  },
};

// ─── Accords data ───
const PERFUME_ACCORDS: Record<number, { label: string; percentage: number; color: string }[]> = {
  // 1. Club de Nuit Intense Man
  1: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Dulce", percentage: 65, color: "#e75a8d" },
    { label: "Ámbar", percentage: 50, color: "#f0a830" },
    { label: "Almizclado", percentage: 40, color: "#a0a0a0" },
  ],
  // 2. Club de Nuit Intense Man Limited Edition
  2: [
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Ahumado", percentage: 75, color: "#7a6b5d" },
    { label: "Afrutado", percentage: 70, color: "#e75a8d" },
    { label: "Cuero", percentage: 50, color: "#8b5e3c" },
  ],
  // 3. Club de Nuit Woman
  3: [
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Pachulí", percentage: 80, color: "#6b8e4e" },
    { label: "Rosado", percentage: 75, color: "#e75a8d" },
    { label: "Fresco Especiado", percentage: 60, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 55, color: "#f0a830" },
  ],
  // 4. Club de Nuit White Imperiale
  4: [
    { label: "Rosado", percentage: 90, color: "#e75a8d" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Tropical", percentage: 70, color: "#f0c934" },
    { label: "Vainilla", percentage: 65, color: "#c9a033" },
  ],
  // 5 (115). Club de Nuit Iconic
  115: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 80, color: "#a0c4e8" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
    { label: "Ahumado", percentage: 60, color: "#7a6b5d" },
  ],
  // 6 (116). Club de Nuit Sillage
  116: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Almizclado", percentage: 85, color: "#a0a0a0" },
    { label: "Atalcado", percentage: 70, color: "#d4c5a9" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
    { label: "Fresco", percentage: 60, color: "#a0c4e8" },
  ],
  // 7 (117). Club de Nuit Urban Man Elixir
  117: [
    { label: "Fresco Especiado", percentage: 85, color: "#a0c4e8" },
    { label: "Cítrico", percentage: 80, color: "#f0c934" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
    { label: "Lavanda", percentage: 65, color: "#9b8ec4" },
  ],
  // 8 (118). Club de Nuit Urban Man
  118: [
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 80, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Herbal", percentage: 65, color: "#6b8e4e" },
    { label: "Pachulí", percentage: 60, color: "#4a7a3a" },
  ],
  // 9 (119). Club de Nuit Maleka
  119: [
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Atalcado", percentage: 75, color: "#d4c5a9" },
    { label: "Floral Blanco", percentage: 70, color: "#f0e6f6" },
    { label: "Amaderado", percentage: 60, color: "#c17b2a" },
  ],
  // 10 (120). Club de Nuit Untold
  120: [
    { label: "Ámbar", percentage: 95, color: "#f0a830" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Especiado Cálido", percentage: 80, color: "#c45a3a" },
    { label: "Azafrán", percentage: 75, color: "#e8a030" },
    { label: "Coníferas", percentage: 65, color: "#4a7a3a" },
  ],
  // 11 (121). Club de Nuit Precieux I
  121: [
    { label: "Ámbar", percentage: 90, color: "#f0a830" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Cítrico", percentage: 80, color: "#f0c934" },
    { label: "Especiado", percentage: 70, color: "#c45a3a" },
    { label: "Cuero", percentage: 65, color: "#8b5e3c" },
  ],
  // 12 (5). Odyssey Homme White Edition
  5: [
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Verde", percentage: 80, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 75, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
    { label: "Almizclado", percentage: 60, color: "#a0a0a0" },
  ],
  // 13 (91). Odyssey Aoud
  91: [
    { label: "Oud", percentage: 90, color: "#5a3a2a" },
    { label: "Especiado Cálido", percentage: 85, color: "#c45a3a" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Balsámico", percentage: 65, color: "#8b6e4e" },
  ],
  // 14 (104). Odyssey Mandarine Sky
  104: [
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Caramelo", percentage: 80, color: "#c98030" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Especiado Suave", percentage: 60, color: "#c45a3a" },
  ],
  // 15 (105). Odyssey Artisto
  105: [
    { label: "Aromático", percentage: 90, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 85, color: "#a0c4e8" },
    { label: "Cítrico", percentage: 80, color: "#f0c934" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Marino", percentage: 65, color: "#4a8eb8" },
  ],
  // 16 (106). Odyssey Bahamas
  106: [
    { label: "Tropical", percentage: 90, color: "#f0c934" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Dulce", percentage: 80, color: "#f0a830" },
    { label: "Cítrico", percentage: 75, color: "#f0c934" },
    { label: "Coco", percentage: 70, color: "#d4c5a9" },
  ],
  // 17 (107). Odyssey Toffee Coffee
  107: [
    { label: "Gourmand", percentage: 95, color: "#8b5e3c" },
    { label: "Café", percentage: 90, color: "#5a3a2a" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Caramelo", percentage: 80, color: "#c98030" },
    { label: "Cálido Especiado", percentage: 70, color: "#c45a3a" },
  ],
  // 18 (108). Odyssey Spectra
  108: [
    { label: "Atalcado", percentage: 85, color: "#d4c5a9" },
    { label: "Especiado Cálido", percentage: 80, color: "#c45a3a" },
    { label: "Iris", percentage: 75, color: "#9b8ec4" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
    { label: "Ambarado", percentage: 65, color: "#f0a830" },
  ],
  // 19 (109). Odyssey Aqua
  109: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Marino", percentage: 85, color: "#4a8eb8" },
    { label: "Fresco Especiado", percentage: 80, color: "#a0c4e8" },
    { label: "Aromático", percentage: 75, color: "#6b8e4e" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
  ],
  // 20 (110). Odyssey Homme
  110: [
    { label: "Ámbar", percentage: 90, color: "#f0a830" },
    { label: "Vainilla", percentage: 85, color: "#c9a033" },
    { label: "Atalcado", percentage: 80, color: "#d4c5a9" },
    { label: "Iris", percentage: 75, color: "#9b8ec4" },
    { label: "Especiado Cálido", percentage: 70, color: "#c45a3a" },
  ],
};

// ─── Star ratings per perfume ───
const PERFUME_RATINGS: Record<number, number> = {
  1: 4,
};

// ─── Timeline tier metadata (Trayecto Olfativo) ───
const noteTiers = [
  {
    key: "top" as const,
    title: "Primer Encuentro",
    subtitle: "La explosión inicial que cautiva los sentidos",
    icon: Wind,
    iconBg: "bg-[#f0c934]/20",
    iconBorder: "border-[#f0c934]/40",
    iconColor: "text-[#f0c934]",
    titleColor: "text-[#f0c934]",
    dotColor: "bg-[#f0c934]",
  },
  {
    key: "heart" as const,
    title: "Revelación",
    subtitle: "El corazón que define la esencia",
    icon: Flower2,
    iconBg: "bg-[#e75a8d]/20",
    iconBorder: "border-[#e75a8d]/40",
    iconColor: "text-[#e75a8d]",
    titleColor: "text-[#e75a8d]",
    dotColor: "bg-[#e75a8d]",
  },
  {
    key: "base" as const,
    title: "Legado",
    subtitle: "La memoria que perdura en la piel",
    icon: TreePine,
    iconBg: "bg-emerald-500/20",
    iconBorder: "border-emerald-500/40",
    iconColor: "text-emerald-400",
    titleColor: "text-emerald-400",
    dotColor: "bg-emerald-400",
  },
];

// ─── Architecture tier metadata ───
const archTiers = [
  {
    key: "top" as const,
    title: "Salida",
    subtitle: "0 – 15 min",
    icon: Wind,
    iconBg: "bg-[#f0c934]/20",
    iconBorder: "border-[#f0c934]/40",
    iconColor: "text-[#f0c934]",
    barColor: "#f0c934",
    barBg: "rgba(240, 201, 52, 0.15)",
  },
  {
    key: "heart" as const,
    title: "Corazón",
    subtitle: "15 min – 3 h",
    icon: Flower2,
    iconBg: "bg-[#e75a8d]/20",
    iconBorder: "border-[#e75a8d]/40",
    iconColor: "text-[#e75a8d]",
    barColor: "#e75a8d",
    barBg: "rgba(231, 90, 141, 0.15)",
  },
  {
    key: "base" as const,
    title: "Base",
    subtitle: "3 h+",
    icon: TreePine,
    iconBg: "bg-emerald-500/20",
    iconBorder: "border-emerald-500/40",
    iconColor: "text-emerald-400",
    barColor: "#34d399",
    barBg: "rgba(52, 211, 153, 0.15)",
  },
];

// ─── Animated progress bar ───
function AccordBar({
  label,
  percentage,
  color,
  delay,
}: {
  label: string;
  percentage: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60 font-[family-name:var(--font-inter)]">
          {label}
        </span>
        <span className="text-xs text-white/40 font-[family-name:var(--font-inter)]">
          {percentage}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </motion.div>
  );
}

// ─── Architecture note progress bar ───
function ArchNoteBar({
  name,
  percentage,
  barColor,
  barBg,
  delay,
}: {
  name: string;
  percentage: number;
  barColor: string;
  barBg: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/70 font-[family-name:var(--font-inter)]">
          {name}
        </span>
        <span className="text-[10px] text-white/35 font-[family-name:var(--font-inter)]">
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: barBg }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.15, duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
        />
      </div>
    </motion.div>
  );
}

interface PerfumeDetailProps {
  perfume: Perfume;
  isFavorited: boolean;
  isLoggedIn: boolean;
  onClose: () => void;
  onToggleFavorite: (id: number) => void;
}

export default function PerfumeDetail({
  perfume,
  isFavorited,
  isLoggedIn,
  onClose,
  onToggleFavorite,
}: PerfumeDetailProps) {
  const [imgTriedJpg, setImgTriedJpg] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const imgSrc = imgTriedJpg
    ? `https://fimgs.net/mdimg/perfume/${perfume.fragranticaId}.jpg`
    : getImageUrl(perfume.fragranticaId);

  const handleImgError = useCallback(() => {
    if (!imgTriedJpg) {
      setImgTriedJpg(true);
      setImgLoaded(false);
    } else {
      setImgError(true);
    }
  }, [imgTriedJpg]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const pyramid = NOTE_PYRAMIDS[perfume.id];
  const accords = PERFUME_ACCORDS[perfume.id];
  const rating = PERFUME_RATINGS[perfume.id] ?? 4;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Detail Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#0e0e0e] shadow-2xl shadow-black/60"
      >
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Heart favorite button */}
        {isLoggedIn && (
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!favoriteLoading) {
                setFavoriteLoading(true);
                onToggleFavorite(perfume.id);
                setTimeout(() => setFavoriteLoading(false), 400);
              }
            }}
            className="absolute top-14 right-4 z-50 p-2 rounded-full backdrop-blur-sm transition-all duration-200 cursor-pointer"
            style={{
              background: isFavorited ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.3)",
              border: isFavorited ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,255,255,0.08)",
            }}
            title={isFavorited ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-200 ${
                isFavorited ? "text-red-400 fill-red-400" : "text-white/30 hover:text-white/50"
              }`}
            />
          </motion.button>
        )}

        {/* Gold accent line top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent z-10" />

        <div className="flex flex-col md:flex-row">
          {/* ─── LEFT: Image Section ─── */}
          <div className="relative md:w-[40%] flex-shrink-0 bg-gradient-to-b from-[#0a0a0a] to-[#080808] flex items-center justify-center min-h-[300px] md:min-h-[500px]">
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex flex-col items-center gap-3"
                >
                  <Sparkles className="w-12 h-12 text-[#d4af37]/20" />
                  <div className="w-16 h-1 rounded-full bg-[#d4af37]/10" />
                </motion.div>
              </div>
            )}

            {imgError ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Gem className="w-16 h-16 text-[#d4af37]/20 mb-3" />
                <span className="text-[#d4af37]/30 text-sm text-center font-[family-name:var(--font-inter)] leading-tight">
                  {perfume.name}
                </span>
              </div>
            ) : (
              <img
                src={imgSrc}
                alt={`${perfume.name} - ${perfume.brand}`}
                className={`w-full h-full object-contain p-6 max-h-[500px] transition-opacity duration-300 ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImgLoaded(true)}
                onError={handleImgError}
              />
            )}

            {/* Gender + Size badges overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border font-[family-name:var(--font-inter)] backdrop-blur-sm ${genderStyles[perfume.gender] || "bg-white/10 text-white/50 border-white/20"}`}
              >
                <span>{genderIcons[perfume.gender] || ""}</span>
                {perfume.gender}
              </span>
              <span className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 bg-black/40 text-white/50 backdrop-blur-sm font-[family-name:var(--font-inter)]">
                {perfume.size}
              </span>
            </div>
          </div>

          {/* ─── RIGHT: Info Section ─── */}
          <div className="md:w-[60%] flex flex-col p-6 md:p-8">
            {/* Brand */}
            <p className="text-xs text-[#d4af37]/80 font-semibold tracking-[0.2em] uppercase font-[family-name:var(--font-inter)] mb-2">
              {perfume.brand}
            </p>

            {/* Name */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white/95 font-[family-name:var(--font-playfair)] leading-snug mb-1">
              {perfume.name}
            </h2>

            {/* Gold divider */}
            <div className="w-full h-px bg-gradient-to-r from-[#d4af37]/40 via-[#d4af37]/15 to-transparent mb-5 mt-4" />

            {/* Star rating */}
            <div className="flex items-center gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating
                      ? "text-[#d4af37] fill-[#d4af37]"
                      : "text-white/10 fill-white/5"
                  }`}
                />
              ))}
              <span className="ml-2 text-xs text-white/30 font-[family-name:var(--font-inter)]">
                {rating}.0
              </span>
            </div>

            {/* ─── ACORDES PRINCIPALES ─── */}
            {accords && (
              <div className="mb-6">
                <h3 className="text-[10px] text-[#d4af37] tracking-[0.2em] uppercase font-semibold font-[family-name:var(--font-inter)] mb-4">
                  Acordes Principales
                </h3>
                <div className="space-y-3">
                  {accords.map((accord, i) => (
                    <AccordBar
                      key={accord.label}
                      label={accord.label}
                      percentage={accord.percentage}
                      color={accord.color}
                      delay={i * 0.1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ─── ARQUITECTURA DE LA FRAGANCIA ─── */}
            {pyramid && (
              <div className="mb-6">
                <h3 className="text-[10px] text-[#d4af37] tracking-[0.2em] uppercase font-semibold font-[family-name:var(--font-inter)] mb-4">
                  Arquitectura de la Fragancia
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {archTiers.map((tier, tierIndex) => {
                    const Icon = tier.icon;
                    const notes = pyramid[tier.key];
                    return (
                      <motion.div
                        key={tier.key}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: tierIndex * 0.12 + 0.2, duration: 0.45 }}
                        className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                      >
                        {/* Icon circle */}
                        <div
                          className={`w-10 h-10 rounded-full ${tier.iconBg} border ${tier.iconBorder} flex items-center justify-center mb-2`}
                        >
                          <Icon className={`w-4 h-4 ${tier.iconColor}`} />
                        </div>

                        {/* Title */}
                        <h4 className={`text-sm font-semibold ${tier.iconColor} font-[family-name:var(--font-inter)] mb-0.5`}>
                          {tier.title}
                        </h4>

                        {/* Subtitle with clock */}
                        <div className="flex items-center gap-1 mb-3">
                          <Clock className="w-2.5 h-2.5 text-white/25" />
                          <span className="text-[9px] text-white/30 font-[family-name:var(--font-inter)]">
                            {tier.subtitle}
                          </span>
                        </div>

                        {/* Notes with progress bars */}
                        <div className="w-full space-y-2">
                          {notes.map((note, noteIndex) => (
                            <ArchNoteBar
                              key={note.name}
                              name={note.name}
                              percentage={note.percentage}
                              barColor={tier.barColor}
                              barBg={tier.barBg}
                              delay={tierIndex * 0.12 + noteIndex * 0.06 + 0.35}
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── TRAYECTO OLFATIVO ─── */}
            {pyramid && (
              <div className="mb-6">
                <h3 className="text-[10px] text-[#d4af37] tracking-[0.2em] uppercase font-semibold font-[family-name:var(--font-inter)] mb-1">
                  Trayecto Olfativo
                </h3>
                <p className="text-[10px] text-white/30 font-[family-name:var(--font-inter)] mb-5">
                  Explora la arquitectura olfativa de esta fragancia...
                </p>

                <div className="relative">
                  {/* Vertical dashed line connecting icons */}
                  <div className="absolute left-[19px] top-6 bottom-6 w-px border-l border-dashed border-white/10" />

                  <div className="space-y-6">
                    {noteTiers.map((tier, tierIndex) => {
                      const Icon = tier.icon;
                      const notes = pyramid[tier.key];
                      return (
                        <motion.div
                          key={tier.key}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: tierIndex * 0.15 + 0.3, duration: 0.5 }}
                          className="flex gap-4"
                        >
                          {/* Icon column */}
                          <div className="relative flex-shrink-0 flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full ${tier.iconBg} border ${tier.iconBorder} flex items-center justify-center z-10`}
                            >
                              <Icon className={`w-4 h-4 ${tier.iconColor}`} />
                            </div>
                          </div>

                          {/* Content column */}
                          <div className="flex-1 pt-0.5">
                            <h4
                              className={`text-sm font-semibold ${tier.titleColor} font-[family-name:var(--font-inter)] mb-0.5`}
                            >
                              {tier.title}
                            </h4>
                            <p className="text-[10px] text-white/40 font-[family-name:var(--font-inter)] mb-3">
                              {tier.subtitle}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {notes.map((note, noteIndex) => (
                                <motion.span
                                  key={note.name}
                                  initial={{ opacity: 0, scale: 0.85 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    delay: tierIndex * 0.15 + noteIndex * 0.05 + 0.5,
                                    duration: 0.3,
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/70 font-[family-name:var(--font-inter)]"
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${tier.dotColor}`}
                                  />
                                  {note.name}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* ─── Action Buttons ─── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-white/5">
              {/* Gold gradient button - Consultar Disponibilidad */}
              <a
                href={`https://wa.me/584244055386?text=${encodeURIComponent(`Hola Jolie Fragances! Me gustaría consultar la disponibilidad de ${perfume.name} - ${perfume.brand}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black font-semibold text-sm font-[family-name:var(--font-inter)] hover:from-[#e0bf4a] hover:to-[#c9a33a] transition-all duration-200 shadow-lg shadow-[#d4af37]/10"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Consultar Disponibilidad
              </a>

              {/* Instagram button */}
              <a
                href="https://www.instagram.com/jolie.fragrances.vnzl"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E1306C]/15 via-[#F77737]/15 to-[#FCAF45]/15 border border-[#E1306C]/25 text-[#E1306C] hover:from-[#E1306C]/25 hover:via-[#F77737]/25 hover:to-[#FCAF45]/25 hover:border-[#E1306C]/40 transition-all duration-200 font-[family-name:var(--font-inter)] text-sm font-medium"
                title="Visitar Instagram"
              >
                <Instagram className="w-4 h-4" />
                <span className="text-xs font-semibold">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
