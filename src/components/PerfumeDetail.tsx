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
  // 9 (119). Club de Nuit Maleka — CORREGIDO: notas de Fragrantica (Olivier Cresp)
  119: {
    top: [
      { name: "Lichi", percentage: 95 },
      { name: "Bergamota", percentage: 85 },
      { name: "Pimienta Rosa", percentage: 75 },
    ],
    heart: [
      { name: "Iris", percentage: 95 },
    ],
    base: [
      { name: "Praliné", percentage: 90 },
      { name: "Ambroxan", percentage: 80 },
      { name: "Sándalo", percentage: 75 },
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
  // 11 (121). Club de Nuit Precieux I — CORREGIDO: notas de Fragrantica
  121: {
    top: [
      { name: "Piña", percentage: 90 },
      { name: "Limón", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
      { name: "Caramelo", percentage: 75 },
      { name: "Pimienta Rosa", percentage: 70 },
      { name: "Pera", percentage: 65 },
      { name: "Pimienta Negra", percentage: 60 },
    ],
    heart: [
      { name: "Musgo de Roble", percentage: 85 },
      { name: "Madera Blanca", percentage: 80 },
      { name: "Jazmín", percentage: 75 },
      { name: "Lirio del Valle", percentage: 65 },
      { name: "Anís Estrellado", percentage: 60 },
    ],
    base: [
      { name: "Ambroxan", percentage: 90 },
      { name: "Almizcle Blanco", percentage: 85 },
      { name: "Cedro", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
      { name: "Cuero", percentage: 65 },
      { name: "Vainilla", percentage: 60 },
    ],
  },
  // 12 (5). Odyssey Homme White Edition — CORREGIDO: notas de Fragrantica
  5: {
    top: [
      { name: "Pimienta Rosa", percentage: 90 },
      { name: "Cardamomo", percentage: 85 },
      { name: "Menta", percentage: 80 },
    ],
    heart: [
      { name: "Piña", percentage: 90 },
      { name: "Notas Acuáticas", percentage: 80 },
      { name: "Salvia", percentage: 70 },
    ],
    base: [
      { name: "Amberwood", percentage: 90 },
      { name: "Vainilla", percentage: 80 },
      { name: "Cedro", percentage: 70 },
    ],
  },
  // 13 (91). Odyssey Aoud — CORREGIDO: notas de Fragrantica (Ambroxan en base)
  91: {
    top: [
      { name: "Azafrán", percentage: 90 },
      { name: "Nuez Moscada", percentage: 80 },
      { name: "Lavanda", percentage: 70 },
    ],
    heart: [
      { name: "Madera de Oud", percentage: 95 },
      { name: "Notas Amaderadas", percentage: 65 },
    ],
    base: [
      { name: "Ambroxan", percentage: 85 },
      { name: "Almizcle", percentage: 75 },
      { name: "Pachulí", percentage: 70 },
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
      { name: "Bergamota", percentage: 90 },
      { name: "Notas Avellanadas", percentage: 80 },
      { name: "Salvia", percentage: 70 },
    ],
    heart: [
      { name: "Canela", percentage: 85 },
      { name: "Coco", percentage: 80 },
      { name: "Notas Tropicales", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Ámbar", percentage: 75 },
    ],
  },
  // 16 (106). Odyssey Bahamas — CORREGIDO: notas de Fragrantica (aquático, no tropical)
  106: {
    top: [
      { name: "Melón", percentage: 90 },
      { name: "Cantalupo", percentage: 85 },
      { name: "Pera", percentage: 80 },
      { name: "Manzana Granny Smith", percentage: 75 },
      { name: "Ciruela", percentage: 70 },
      { name: "Algas", percentage: 65 },
      { name: "Sal", percentage: 60 },
    ],
    heart: [
      { name: "Notas Acuáticas", percentage: 90 },
      { name: "Lirio de Agua", percentage: 80 },
      { name: "Musgo de Roble", percentage: 75 },
      { name: "Incienso", percentage: 65 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Azúcar", percentage: 80 },
      { name: "Ámbar", percentage: 75 },
      { name: "Cedro", percentage: 70 },
    ],
  },
  // 17 (107). Odyssey Toffee Coffee — CORREGIDO: notas de Fragrantica
  107: {
    top: [
      { name: "Café", percentage: 95 },
      { name: "Dulce de Leche", percentage: 90 },
      { name: "Azafrán", percentage: 80 },
      { name: "Miel", percentage: 75 },
      { name: "Bergamota", percentage: 70 },
    ],
    heart: [
      { name: "Toffee", percentage: 90 },
      { name: "Lactonas", percentage: 80 },
      { name: "Musgo de Roble", percentage: 75 },
      { name: "Flor Blanca", percentage: 70 },
      { name: "Rosa Búlgara", percentage: 65 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Caña de Azúcar", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Notas Amaderadas", percentage: 75 },
      { name: "Almizcle Blanco", percentage: 65 },
    ],
  },
  // 18 (108). Odyssey Spectra — CORREGIDO: notas de Fragrantica (cálido especiado, no iris)
  108: {
    top: [
      { name: "Canela", percentage: 90 },
      { name: "Manzana", percentage: 85 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Canela", percentage: 90 },
      { name: "Lavanda", percentage: 80 },
      { name: "Flor de Azahar", percentage: 75 },
      { name: "Lirio del Valle", percentage: 65 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Tabaco", percentage: 85 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Ámbar", percentage: 75 },
      { name: "Pachulí", percentage: 65 },
    ],
  },
  // 19 (109). Odyssey Aqua — CORREGIDO: notas de Fragrantica (Aquatic Edition)
  109: {
    top: [
      { name: "Naranja", percentage: 90 },
      { name: "Toronja", percentage: 85 },
      { name: "Artemisa", percentage: 75 },
    ],
    heart: [
      { name: "Menta", percentage: 90 },
      { name: "Lavanda", percentage: 80 },
    ],
    base: [
      { name: "Ambroxan", percentage: 90 },
      { name: "Ciprés", percentage: 80 },
      { name: "Pachulí", percentage: 70 },
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
  // ─── Página 2 ───
  // 21 (111). Odyssey Mandarin Sky Vintage Edition
  111: {
    top: [
      { name: "Mandarina", percentage: 95 },
      { name: "Naranja", percentage: 85 },
      { name: "Azafrán", percentage: 70 },
    ],
    heart: [
      { name: "Caramelo", percentage: 90 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Coco", percentage: 65 },
      { name: "Notas Florales Suaves", percentage: 50 },
    ],
    base: [
      { name: "Ámbar", percentage: 85 },
      { name: "Cedro", percentage: 75 },
      { name: "Pachulí", percentage: 60 },
    ],
  },
  // 22 (112). Odyssey Mandarin Sky Elixir — CORREGIDO: notas de Fragrantica
  112: {
    top: [
      { name: "Mandarina", percentage: 95 },
      { name: "Naranja", percentage: 85 },
      { name: "Lavanda", percentage: 75 },
      { name: "Cardamomo", percentage: 70 },
      { name: "Pimienta Negra", percentage: 65 },
    ],
    heart: [
      { name: "Caramelo", percentage: 90 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Pachulí", percentage: 75 },
      { name: "Incienso", percentage: 65 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Vetiver", percentage: 80 },
    ],
  },
  // 23 (113). Odyssey Mega — CORREGIDO: notas de Fragrantica (Mega Man)
  113: {
    top: [
      { name: "Naranja", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Limón", percentage: 80 },
      { name: "Jengibre", percentage: 75 },
      { name: "Menta", percentage: 70 },
    ],
    heart: [
      { name: "Piña", percentage: 85 },
      { name: "Salvia", percentage: 80 },
      { name: "Enebro", percentage: 75 },
      { name: "Geranio", percentage: 70 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Cedro", percentage: 80 },
      { name: "Haba Tonka", percentage: 75 },
      { name: "Vetiver", percentage: 65 },
    ],
  },
  // 24 (114). Odyssey Limoni Fresh — CORREGIDO: notas de Fragrantica
  114: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Naranja Dulce", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 85 },
      { name: "Notas Marinas", percentage: 75 },
      { name: "Jengibre", percentage: 65 },
    ],
    base: [
      { name: "Té", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Ámbar", percentage: 70 },
    ],
  },
  // 25 (141). Yum Yum — CORREGIDO: notas de Fragrantica/Basenotes
  141: {
    top: [
      { name: "Bergamota", percentage: 85 },
      { name: "Naranja", percentage: 80 },
      { name: "Cereza", percentage: 90 },
      { name: "Bayas Silvestres", percentage: 75 },
    ],
    heart: [
      { name: "Vainilla", percentage: 85 },
      { name: "Rosa", percentage: 75 },
      { name: "Flores Blancas", percentage: 70 },
    ],
    base: [
      { name: "Ámbar", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
      { name: "Notas Atalcadas", percentage: 65 },
    ],
  },
  // 26 (143). Bon Bon — CORREGIDO: notas de Fragrantica/Parfumo
  143: {
    top: [
      { name: "Bergamota", percentage: 85 },
      { name: "Manzana Granny Smith", percentage: 80 },
      { name: "Mandarina", percentage: 75 },
      { name: "Papaya", percentage: 70 },
    ],
    heart: [
      { name: "Flor de Té", percentage: 85 },
      { name: "Lirio de Madagascar", percentage: 75 },
      { name: "Peonía", percentage: 70 },
      { name: "Albaricoque", percentage: 65 },
    ],
    base: [
      { name: "Notas Marinas", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
      { name: "Maderas", percentage: 70 },
    ],
  },
  // 27 (144). Island Bliss — CORREGIDO: notas de Fragrantica
  144: {
    top: [
      { name: "Bayas Silvestres", percentage: 90 },
      { name: "Notas Verdes", percentage: 80 },
    ],
    heart: [
      { name: "Coco", percentage: 90 },
      { name: "Flor de Azahar", percentage: 80 },
      { name: "Lactonas", percentage: 75 },
      { name: "Lirio de Agua", percentage: 70 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 28 (145). Island Breeze — CORREGIDO: notas de Fragrantica
  145: {
    top: [
      { name: "Melocotón", percentage: 90 },
      { name: "Bayas Silvestres", percentage: 85 },
    ],
    heart: [
      { name: "Rosa", percentage: 85 },
    ],
    base: [
      { name: "Almizcle Blanco", percentage: 90 },
    ],
  },
  // 29 (151). Eter Arabian — CORREGIDO: notas de Amazon/Armaf oficial
  151: {
    top: [
      { name: "Pimienta", percentage: 80 },
      { name: "Limón", percentage: 85 },
      { name: "Bergamota", percentage: 90 },
      { name: "Toronja", percentage: 75 },
      { name: "Piña", percentage: 70 },
    ],
    heart: [
      { name: "Lavanda", percentage: 85 },
      { name: "Geranio", percentage: 80 },
      { name: "Ylang-Ylang", percentage: 70 },
      { name: "Caramelo", percentage: 65 },
    ],
    base: [
      { name: "Ámbar", percentage: 85 },
      { name: "Almizcle", percentage: 75 },
      { name: "Cuero", percentage: 70 },
    ],
  },
  // 30 (6). Al Haramain Amber Oud Rouge Edition — CORREGIDO: notas de Fragrantica
  6: {
    top: [
      { name: "Azafrán", percentage: 95 },
    ],
    heart: [
      { name: "Jazmín", percentage: 90 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 95 },
      { name: "Almizcle", percentage: 80 },
      { name: "Cedro Blanco", percentage: 70 },
    ],
  },
  // 31 (7). Al Haramain Amber Oud Gold Edition — CORREGIDO: notas de Fragrantica/Basenotes
  7: {
    top: [
      { name: "Bergamota", percentage: 80 },
      { name: "Notas Verdes", percentage: 75 },
    ],
    heart: [
      { name: "Melón", percentage: 95 },
      { name: "Piña", percentage: 90 },
      { name: "Notas Dulces", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Almizcle", percentage: 85 },
      { name: "Notas Amaderadas", percentage: 70 },
    ],
  },
  // 32 (8). Al Haramain Amber Oud Carbon Edition — CORREGIDO: notas de Fragrantica (musgo en base)
  8: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Lavanda", percentage: 85 },
      { name: "Romero", percentage: 80 },
    ],
    heart: [
      { name: "Notas Marinas", percentage: 90 },
      { name: "Geranio", percentage: 75 },
      { name: "Salvia", percentage: 70 },
    ],
    base: [
      { name: "Musgo", percentage: 85 },
      { name: "Vetiver", percentage: 80 },
      { name: "Ámbar", percentage: 75 },
      { name: "Cedro", percentage: 70 },
    ],
  },
  // 33 (9). Al Haramain Amber Oud White Edition — CORREGIDO: notas de Fragrantica
  9: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Naranja", percentage: 80 },
    ],
    heart: [
      { name: "Jazmín", percentage: 85 },
      { name: "Rosa", percentage: 75 },
      { name: "Fresia", percentage: 70 },
      { name: "Ciclamen", percentage: 65 },
    ],
    base: [
      { name: "Pachulí", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Vetiver", percentage: 75 },
      { name: "Vainilla", percentage: 70 },
    ],
  },
  // 34 (10). Al Haramain L'Aventure — CORREGIDO: notas de Fragrantica
  10: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Elemí", percentage: 75 },
    ],
    heart: [
      { name: "Notas Amaderadas", percentage: 85 },
      { name: "Jazmín", percentage: 70 },
      { name: "Lirio de los Valles", percentage: 60 },
    ],
    base: [
      { name: "Almizcle", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Ámbar", percentage: 65 },
    ],
  },
  // 35 (11). Al Haramain L'Aventure Woman — CORREGIDO: notas de Fragrantica
  11: {
    top: [
      { name: "Piña", percentage: 90 },
      { name: "Grosellas Negras", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
      { name: "Bayas Silvestres", percentage: 75 },
    ],
    heart: [
      { name: "Rosa", percentage: 80 },
      { name: "Fresia", percentage: 75 },
      { name: "Cedro", percentage: 65 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
      { name: "Vainilla", percentage: 65 },
    ],
  },
  // 36 (154). Al Haramain Amber Oud Aqua Dubai — CORREGIDO: notas de Basenotes
  154: {
    top: [
      { name: "Bergamota", percentage: 95 },
      { name: "Notas Verdes", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
    ],
    heart: [
      { name: "Melón", percentage: 90 },
      { name: "Piña", percentage: 85 },
      { name: "Grosellas Negras", percentage: 75 },
      { name: "Ámbar", percentage: 80 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
      { name: "Galbano", percentage: 70 },
      { name: "Petitgrain", percentage: 65 },
    ],
  },
  // 37 (14). Lattafa Bade'e Al Oud Amethyst — CORREGIDO: notas de Fragrantica
  14: {
    top: [
      { name: "Pimienta Rosa", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Rosa Turca", percentage: 95 },
      { name: "Rosa de Bulgaria", percentage: 90 },
      { name: "Jazmín", percentage: 70 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
    ],
  },
  // 38 (15). Lattafa Bade'e Al Oud Oud for Glory — CORREGIDO: notas de Fragrantica
  15: {
    top: [
      { name: "Azafrán", percentage: 95 },
      { name: "Nuez Moscada", percentage: 85 },
      { name: "Lavanda", percentage: 75 },
    ],
    heart: [
      { name: "Madera de Oud", percentage: 95 },
      { name: "Pachulí", percentage: 80 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 90 },
      { name: "Pachulí", percentage: 75 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 39 (16). Lattafa Bade'e Al Oud Honor & Glory — CORREGIDO: notas de Fragrantica
  16: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Crème Brûlée", percentage: 90 },
    ],
    heart: [
      { name: "Canela", percentage: 85 },
      { name: "Benjuí", percentage: 75 },
      { name: "Cúrcuma", percentage: 65 },
      { name: "Pimienta Negra", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Sándalo", percentage: 80 },
      { name: "Cachemira", percentage: 75 },
      { name: "Musgo", percentage: 60 },
    ],
  },
  // 40 (18). Lattafa Eclaire Pistache — CORREGIDO: notas de Fragrantica
  18: {
    top: [
      { name: "Crema de Pistacho", percentage: 95 },
      { name: "Pistacho Tostado", percentage: 85 },
    ],
    heart: [
      { name: "Cacao", percentage: 90 },
      { name: "Crema Batida", percentage: 80 },
      { name: "Coco", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Leche", percentage: 85 },
      { name: "Almizcle", percentage: 65 },
    ],
  },

  // ─── Páginas 3-4: Lattafa ───

  // 41 (19). Lattafa Eclaire Banoffi — CORREGIDO: notas de Fragrantica/Lattafa oficial
  19: {
    top: [
      { name: "Plátano", percentage: 95 },
      { name: "Dulce de Leche", percentage: 90 },
    ],
    heart: [
      { name: "Vainilla", percentage: 90 },
      { name: "Crema Batida", percentage: 85 },
    ],
    base: [
      { name: "Galleta", percentage: 85 },
      { name: "Praliné", percentage: 80 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 42 (20). Lattafa Mayar Natural Intense — CORREGIDO: notas de Fragrantica
  20: {
    top: [
      { name: "Higo", percentage: 90 },
      { name: "Melón", percentage: 85 },
      { name: "Mandarina", percentage: 75 },
      { name: "Agua de Coco", percentage: 70 },
    ],
    heart: [
      { name: "Flor de Loto", percentage: 85 },
      { name: "Nenúfar", percentage: 75 },
      { name: "Jazmín", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Sándalo", percentage: 75 },
      { name: "Almizcle", percentage: 70 },
      { name: "Ambroxan", percentage: 65 },
    ],
  },
  // 43 (21). Lattafa Fakhar Black — CORREGIDO: Vetiver en base (no Olíbano)
  21: {
    top: [
      { name: "Manzana", percentage: 95 },
      { name: "Jengibre", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Lavanda", percentage: 90 },
      { name: "Salvia", percentage: 85 },
      { name: "Bayas de Enebro", percentage: 75 },
      { name: "Geranio", percentage: 65 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 90 },
      { name: "Amberwood", percentage: 85 },
      { name: "Cedro", percentage: 70 },
      { name: "Vetiver", percentage: 60 },
    ],
  },
  // 44 (22). Lattafa Fakhar Rose — CORREGIDO: añadidos Rosa y Madreselva en corazón
  22: {
    top: [
      { name: "Notas Afrutadas", percentage: 90 },
      { name: "Azucena", percentage: 85 },
      { name: "Granada", percentage: 75 },
      { name: "Aldehídos", percentage: 60 },
    ],
    heart: [
      { name: "Nardos", percentage: 95 },
      { name: "Rosa", percentage: 88 },
      { name: "Jazmín", percentage: 85 },
      { name: "Gardenia", percentage: 80 },
      { name: "Madreselva", percentage: 75 },
      { name: "Ylang-Ylang", percentage: 70 },
      { name: "Peonía", percentage: 65 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle Blanco", percentage: 85 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ambroxan", percentage: 70 },
    ],
  },
  // 45 (103). Lattafa Qaed Al Fursan — CORREGIDO: notas de Fragrantica
  103: {
    top: [
      { name: "Piña", percentage: 98 },
      { name: "Azafrán", percentage: 75 },
    ],
    heart: [
      { name: "Jazmín", percentage: 80 },
      { name: "Abeto", percentage: 70 },
    ],
    base: [
      { name: "Ámbar", percentage: 85 },
      { name: "Cedro", percentage: 75 },
      { name: "Madera de Oud", percentage: 65 },
    ],
  },
  // 46 (25). Lattafa Qaed Al Fursan Untamed — CORREGIDO: notas completamente revisadas
  25: {
    top: [
      { name: "Canela", percentage: 95 },
      { name: "Cardamomo", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
      { name: "Nuez Moscada", percentage: 75 },
    ],
    heart: [
      { name: "Caramelo", percentage: 90 },
      { name: "Lavanda", percentage: 80 },
      { name: "Salvia Esclarea", percentage: 75 },
      { name: "Geranio", percentage: 70 },
      { name: "Ciprés", percentage: 65 },
    ],
    base: [
      { name: "Ámbar", percentage: 90 },
      { name: "Madera de Cedro", percentage: 80 },
      { name: "Olíbano", percentage: 75 },
      { name: "Ládano", percentage: 70 },
      { name: "Vetiver", percentage: 65 },
    ],
  },
  // 47 (26). Lattafa Qaed Al Fursan Unlimited — CORREGIDO: notas de Fragrantica
  26: {
    top: [
      { name: "Coco", percentage: 95 },
      { name: "Cítricos", percentage: 80 },
      { name: "Piña", percentage: 75 },
    ],
    heart: [
      { name: "Ylang-Ylang", percentage: 85 },
      { name: "Jazmín", percentage: 75 },
      { name: "Frangipani", percentage: 70 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 85 },
      { name: "Sándalo", percentage: 75 },
    ],
  },
  // 48 (27). Lattafa Hayaati Florence — CORREGIDO: notas de Lattafa oficial
  27: {
    top: [
      { name: "Lichi", percentage: 90 },
      { name: "Toronja", percentage: 85 },
      { name: "Grosella Roja", percentage: 80 },
    ],
    heart: [
      { name: "Rosa", percentage: 85 },
      { name: "Melocotón", percentage: 80 },
      { name: "Madera de Cedro", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Praliné", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
    ],
  },
  // 49 (142). Lattafa Hayaati Gold Elixir — CORREGIDO: notas de Fragrantica
  142: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Toronja", percentage: 85 },
      { name: "Grosella Negra", percentage: 80 },
    ],
    heart: [
      { name: "Cuero", percentage: 90 },
      { name: "Melocotón", percentage: 80 },
      { name: "Azafrán", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
      { name: "Vetiver", percentage: 70 },
    ],
  },
  // 50 (146). Lattafa Hayaati — CORREGIDO: notas de Fragrantica
  146: {
    top: [
      { name: "Manzana", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
    ],
    heart: [
      { name: "Canela", percentage: 85 },
      { name: "Notas de Madera", percentage: 70 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
    ],
  },
  // 51 (147). Lattafa Hayaati Al Maleky — CORREGIDO: notas completamente revisadas
  147: {
    top: [
      { name: "Pimienta Rosa", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Jengibre", percentage: 80 },
      { name: "Nuez Moscada", percentage: 75 },
    ],
    heart: [
      { name: "Cedro", percentage: 90 },
      { name: "Notas Amaderadas", percentage: 85 },
      { name: "Incienso", percentage: 80 },
      { name: "Ládano", percentage: 75 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Ambargris", percentage: 80 },
      { name: "Ámbar", percentage: 75 },
    ],
  },
  // 52 (148). Lattafa Vintage Radio — CORREGIDO: Lavanda en salida, Ciruela en corazón
  148: {
    top: [
      { name: "Lavanda", percentage: 90 },
      { name: "Salvia", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Ciruela", percentage: 95 },
      { name: "Palo Santo", percentage: 90 },
      { name: "Pimienta Negra", percentage: 80 },
      { name: "Jengibre", percentage: 70 },
    ],
    base: [
      { name: "Sándalo", percentage: 90 },
      { name: "Madera de Agar / Oud", percentage: 80 },
    ],
  },
  // 53 (149). Lattafa Emeer — CORREGIDO: notas de Fragrantica
  149: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Salvia", percentage: 80 },
      { name: "Enebro", percentage: 75 },
    ],
    heart: [
      { name: "Té Blanco", percentage: 85 },
      { name: "Cardamomo", percentage: 80 },
      { name: "Sándalo", percentage: 75 },
      { name: "Olíbano", percentage: 65 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 85 },
      { name: "Pachulí", percentage: 80 },
      { name: "Cedro", percentage: 75 },
      { name: "Cachemira", percentage: 70 },
    ],
  },
  // 54 (28). Lattafa Nebras Elixir — CORREGIDO: notas del ELIXIR (no del Nebras original)
  28: {
    top: [
      { name: "Caramelo de Leche", percentage: 95 },
      { name: "Crema Batida", percentage: 90 },
    ],
    heart: [
      { name: "Caña de Azúcar", percentage: 90 },
      { name: "Heliotropo", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Almizcle", percentage: 80 },
      { name: "Ambroxan", percentage: 70 },
    ],
  },
  // 55 (29). Lattafa Asad Elixir — CORREGIDO: notas del ELIXIR (no del Asad original)
  29: {
    top: [
      { name: "Pimienta Rosa", percentage: 90 },
      { name: "Azafrán", percentage: 85 },
      { name: "Toronja", percentage: 80 },
    ],
    heart: [
      { name: "Tabaco", percentage: 95 },
      { name: "Vainilla", percentage: 85 },
      { name: "Cedro", percentage: 80 },
    ],
    base: [
      { name: "Ámbar", percentage: 85 },
      { name: "Olíbano", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Cashmeran", percentage: 70 },
    ],
  },
  // 56 (30). Lattafa Ansaam Gold — CORREGIDO: notas de Fragrantica
  30: {
    top: [
      { name: "Mandarina", percentage: 90 },
      { name: "Pera", percentage: 80 },
    ],
    heart: [
      { name: "Malvavisco", percentage: 90 },
      { name: "Flor de Azahar", percentage: 85 },
      { name: "Jazmín", percentage: 70 },
      { name: "Rosa", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Frambuesa", percentage: 85 },
      { name: "Almizcle", percentage: 75 },
    ],
  },
  // 57 (31). Lattafa Ansaam Silver — CORREGIDO: Pachulí en base (no Haba Tonka)
  31: {
    top: [
      { name: "Cardamomo", percentage: 90 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Davana", percentage: 85 },
      { name: "Lavanda", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Pachulí", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
    ],
  },
  // 58 (32). Lattafa Shaheen Gold — CORREGIDO: notas de Fragrantica
  32: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Toronja", percentage: 85 },
    ],
    heart: [
      { name: "Higo", percentage: 85 },
      { name: "Lavanda", percentage: 70 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
    ],
  },
  // 59 (33). Lattafa Shaheen Silver — CORREGIDO: notas de Fragrantica
  33: {
    top: [
      { name: "Grosellas Negras", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
    ],
    heart: [
      { name: "Pachulí", percentage: 85 },
      { name: "Rosa", percentage: 70 },
    ],
    base: [
      { name: "Musgo de Roble", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Ámbar", percentage: 70 },
    ],
  },
  // 60 (34). Lattafa Hala — CORREGIDO: notas de Fragrantica
  34: {
    top: [
      { name: "Nuez Moscada", percentage: 90 },
      { name: "Pimienta", percentage: 80 },
    ],
    heart: [
      { name: "Cedro", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
    ],
    base: [
      { name: "Incienso", percentage: 90 },
      { name: "Ládano", percentage: 75 },
    ],
  },
  // 61 (35). Lattafa Ishq Al Shuyukh Gold — CORREGIDO: Caramelo en salida
  35: {
    top: [
      { name: "Caramelo", percentage: 95 },
      { name: "Azafrán", percentage: 90 },
    ],
    heart: [
      { name: "Gamuza", percentage: 90 },
      { name: "Cuero", percentage: 85 },
      { name: "Haba Tonka", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 62 (36). Lattafa Ishq Al Shuyukh Silver — CORREGIDO: notas de Fragrantica
  36: {
    top: [
      { name: "Piña", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Limón", percentage: 75 },
    ],
    heart: [
      { name: "Pimienta Negra", percentage: 80 },
      { name: "Notas Especiadas", percentage: 70 },
    ],
    base: [
      { name: "Madera de Cedro", percentage: 85 },
      { name: "Pachulí", percentage: 80 },
      { name: "Amberwood", percentage: 75 },
      { name: "Vainilla", percentage: 70 },
    ],
  },
  // 63 (37). Lattafa Ta'weel — CORREGIDO: notas completamente revisadas
  37: {
    top: [
      { name: "Jengibre", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Enebro", percentage: 80 },
      { name: "Nuez Moscada", percentage: 75 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 90 },
      { name: "Lavanda", percentage: 85 },
    ],
    base: [
      { name: "Ambroxan", percentage: 85 },
      { name: "Vetiver", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Cuero", percentage: 70 },
    ],
  },
  // 64 (38). Lattafa Teriaq Intense — CORREGIDO: notas del INTENSE (no del Teriaq original)
  38: {
    top: [
      { name: "Azafrán", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
    ],
    heart: [
      { name: "Licor de Ciruela", percentage: 95 },
      { name: "Canela", percentage: 90 },
    ],
    base: [
      { name: "Ámbar", percentage: 90 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Benjuí", percentage: 80 },
    ],
  },
  // 65 (39). Lattafa Musamam White Intense — CORREGIDO: notas de Fragrantica
  39: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Naranja", percentage: 85 },
      { name: "Especias", percentage: 70 },
    ],
    heart: [
      { name: "Coco", percentage: 95 },
      { name: "Ylang-Ylang", percentage: 80 },
      { name: "Ambroxan", percentage: 75 },
    ],
    base: [
      { name: "Sándalo", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Benjuí", percentage: 70 },
    ],
  },
  // 66 (40). Lattafa Victoria — CORREGIDO: notas completamente revisadas
  40: {
    top: [
      { name: "Tarta de Merengue de Limón", percentage: 95 },
    ],
    heart: [
      { name: "Neroli", percentage: 90 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
    ],
  },
  // 67 (41). Lattafa Art of Universe — CORREGIDO: notas completamente revisadas
  41: {
    top: [
      { name: "Mandarina", percentage: 90 },
      { name: "Jengibre", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
      { name: "Menta", percentage: 75 },
    ],
    heart: [
      { name: "Pera", percentage: 85 },
      { name: "Flor de Azahar", percentage: 80 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Cedro", percentage: 75 },
    ],
  },
  // 68 (42). Lattafa Vanilla Freak — CORREGIDO: notas completamente revisadas
  42: {
    top: [
      { name: "Cupcake", percentage: 95 },
    ],
    heart: [
      { name: "Azúcar", percentage: 90 },
      { name: "Glaseado", percentage: 85 },
      { name: "Almendra", percentage: 80 },
      { name: "Canela", percentage: 75 },
    ],
    base: [
      { name: "Mantequilla", percentage: 85 },
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 69 (43). Lattafa Berry On Top — CORREGIDO: notas de Fragrantica
  43: {
    top: [
      { name: "Fresa", percentage: 95 },
      { name: "Crema Chantilly", percentage: 85 },
    ],
    heart: [
      { name: "Mermelada de Fresa", percentage: 90 },
      { name: "Azúcar", percentage: 85 },
      { name: "Flores Blancas", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
    ],
  },
  // 70 (44). Lattafa Choco Overdose — CORREGIDO: notas de Fragrantica
  44: {
    top: [
      { name: "Fudge de Chocolate", percentage: 95 },
    ],
    heart: [
      { name: "Cacao", percentage: 95 },
      { name: "Cupcake", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Caramelo", percentage: 85 },
      { name: "Benjuí", percentage: 80 },
    ],
  },
  // 71 (45). Lattafa Mallow Madness — CORREGIDO: notas completamente revisadas
  45: {
    top: [
      { name: "Fresa", percentage: 90 },
      { name: "Frambuesa", percentage: 85 },
    ],
    heart: [
      { name: "Malvavisco", percentage: 90 },
      { name: "Fresia", percentage: 80 },
    ],
    base: [
      { name: "Crema Batida", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
    ],
  },
  // 72 (46). Lattafa Whipped Pleasure — CORREGIDO: notas completamente revisadas
  46: {
    top: [
      { name: "Caramelo", percentage: 95 },
      { name: "Palomitas", percentage: 90 },
      { name: "Caramelo Salado", percentage: 85 },
    ],
    heart: [
      { name: "Leche", percentage: 85 },
      { name: "Jazmín", percentage: 80 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Benjuí", percentage: 75 },
    ],
  },
  // 73 (47). Lattafa The Kingdom Woman — CORREGIDO: notas completamente revisadas
  47: {
    top: [
      { name: "Pera", percentage: 90 },
      { name: "Peonía", percentage: 85 },
      { name: "Grosella Negra", percentage: 80 },
    ],
    heart: [
      { name: "Praliné", percentage: 90 },
      { name: "Jazmín", percentage: 85 },
      { name: "Haba Tonka", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
    ],
  },
  // 74 (48). Lattafa The Kingdom Men — CORREGIDO: notas completamente revisadas
  48: {
    top: [
      { name: "Lavanda", percentage: 90 },
      { name: "Menta", percentage: 85 },
      { name: "Salvia", percentage: 80 },
    ],
    heart: [
      { name: "Vainilla", percentage: 90 },
      { name: "Tabaco", percentage: 85 },
      { name: "Flor de Azahar", percentage: 80 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Benjuí", percentage: 80 },
      { name: "Ládano", percentage: 75 },
    ],
  },
  // 75 (49). Lattafa Layaan — CORREGIDO: notas completamente revisadas
  49: {
    top: [
      { name: "Pera Verde", percentage: 90 },
      { name: "Mandarina", percentage: 85 },
    ],
    heart: [
      { name: "Lirio del Valle", percentage: 90 },
      { name: "Jazmín", percentage: 85 },
      { name: "Gardenia", percentage: 80 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Madera de Cedro", percentage: 80 },
    ],
  },
  // 76 (50). Lattafa Efeef — CORREGIDO: notas completamente revisadas
  50: {
    top: [
      { name: "Melocotón", percentage: 90 },
      { name: "Pimienta Rosa", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Tuberosa", percentage: 95 },
      { name: "Flor de Azahar", percentage: 85 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Ámbar", percentage: 85 },
      { name: "Praliné", percentage: 80 },
      { name: "Sándalo", percentage: 75 },
      { name: "Pachulí", percentage: 70 },
    ],
  },
  // 77 (51). Lattafa Al Noble Safeer — CORREGIDO: notas de Fragrantica
  51: {
    top: [
      { name: "Toronja", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Jengibre", percentage: 85 },
      { name: "Pimienta Negra", percentage: 80 },
    ],
    heart: [
      { name: "Caramelo", percentage: 90 },
      { name: "Jazmín", percentage: 85 },
      { name: "Heliotropo", percentage: 80 },
    ],
    base: [
      { name: "Madera de Gaïac", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Ambargris", percentage: 75 },
      { name: "Cachemira", percentage: 70 },
    ],
  },
  // 78 (52). Lattafa Al Noble Ameer — CORREGIDO: notas de Fragrantica + Lattafa oficial
  52: {
    top: [
      { name: "Manzana", percentage: 85 },
      { name: "Pimienta Rosa", percentage: 80 },
      { name: "Romero", percentage: 75 },
    ],
    heart: [
      { name: "Clavo de Olor", percentage: 85 },
      { name: "Notas Florales", percentage: 70 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 95 },
      { name: "Pachulí", percentage: 80 },
      { name: "Ciprés", percentage: 75 },
      { name: "Ládano", percentage: 65 },
      { name: "Vetiver", percentage: 60 },
    ],
  },
  // 79 (53). Lattafa Al Noble Wazeer — CORREGIDO: notas de Fragrantica/Lattafa oficial
  53: {
    top: [
      { name: "Coñac", percentage: 95 },
      { name: "Azafrán", percentage: 90 },
      { name: "Nuez Moscada", percentage: 85 },
      { name: "Manzana", percentage: 80 },
    ],
    heart: [
      { name: "Cedro", percentage: 90 },
      { name: "Sándalo", percentage: 85 },
      { name: "Whisky", percentage: 80 },
      { name: "Roble", percentage: 75 },
    ],
    base: [
      { name: "Mirra", percentage: 85 },
      { name: "Ambroxan", percentage: 80 },
      { name: "Vainilla", percentage: 75 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 80 (54). Lattafa Her Confession — CORREGIDO: notas completamente revisadas
  54: {
    top: [
      { name: "Canela", percentage: 95 },
      { name: "Mystikal", percentage: 90 },
    ],
    heart: [
      { name: "Tuberosa", percentage: 95 },
      { name: "Jazmín", percentage: 85 },
      { name: "Incienso", percentage: 80 },
      { name: "Mahonial", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 85 },
      { name: "Haba Tonka", percentage: 80 },
    ],
  },

  // ─── Páginas 5-6 ───

  // 81 (55). Lattafa His Confession — CORREGIDO: añadido Mahonial, Pachulí→Ámbar/Cedro
  55: {
    top: [
      { name: "Canela", percentage: 90 },
      { name: "Lavanda", percentage: 85 },
      { name: "Mandarina", percentage: 70 },
    ],
    heart: [
      { name: "Iris", percentage: 95 },
      { name: "Benjuí", percentage: 80 },
      { name: "Ciprés", percentage: 65 },
      { name: "Mahonial", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Incienso", percentage: 75 },
      { name: "Cedro", percentage: 65 },
    ],
  },
  // 82 (56). Lattafa Ajwaa — CORREGIDO: añadido Limón, eliminado Oud de base
  56: {
    top: [
      { name: "Dátiles", percentage: 95 },
      { name: "Elemí", percentage: 80 },
      { name: "Bergamota", percentage: 70 },
      { name: "Limón", percentage: 65 },
    ],
    heart: [
      { name: "Mirra", percentage: 90 },
      { name: "Regaliz", percentage: 75 },
    ],
    base: [
      { name: "Incienso", percentage: 90 },
      { name: "Benjuí", percentage: 85 },
    ],
  },
  // 83 (57). Lattafa Sehr — CORREGIDO: notas de Fragrantica
  57: {
    top: [
      { name: "Almendra Amarga", percentage: 90 },
      { name: "Canela", percentage: 85 },
    ],
    heart: [
      { name: "Akigalawood", percentage: 85 },
      { name: "Jazmín", percentage: 70 },
      { name: "Pomarose", percentage: 60 },
    ],
    base: [
      { name: "Vainilla Absoluto", percentage: 95 },
      { name: "Ámbar", percentage: 85 },
      { name: "Haba Tonka", percentage: 80 },
    ],
  },
  // 84 (58). Lattafa Habik Woman — CORREGIDO: notas completamente revisadas
  58: {
    top: [
      { name: "Pera", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
    ],
    heart: [
      { name: "Lirio del Valle", percentage: 90 },
      { name: "Jazmín", percentage: 85 },
      { name: "Fresia", percentage: 80 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Musgo de Roble", percentage: 70 },
    ],
  },
  // 85 (59). Lattafa Eternal Vanille — CORREGIDO: notas completamente revisadas
  59: {
    top: [
      { name: "Zarzamora", percentage: 95 },
    ],
    heart: [
      { name: "Cocoapulse", percentage: 90 },
      { name: "Caviar de Vainilla", percentage: 85 },
      { name: "Cacao", percentage: 80 },
    ],
    base: [
      { name: "Akigalawood", percentage: 85 },
      { name: "Ambrofix", percentage: 80 },
      { name: "Cedro", percentage: 75 },
      { name: "Haba Tonka", percentage: 70 },
      { name: "Benjuí", percentage: 65 },
      { name: "Almizcle", percentage: 60 },
    ],
  },
  // 86 (60). Lattafa Jassoor — CORREGIDO: añadido Haba Tonka en base
  60: {
    top: [
      { name: "Manzana", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Cardamomo", percentage: 75 },
    ],
    heart: [
      { name: "Tabaco", percentage: 85 },
      { name: "Lavanda", percentage: 80 },
      { name: "Geranio", percentage: 65 },
    ],
    base: [
      { name: "Cuero", percentage: 90 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Pachulí", percentage: 80 },
      { name: "Vetiver", percentage: 70 },
    ],
  },
  // 87 (61). Lattafa Dynasty — CORREGIDO: notas completamente revisadas
  61: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Jengibre", percentage: 85 },
      { name: "Salvia Esclarea", percentage: 80 },
      { name: "Frambuesa", percentage: 75 },
      { name: "Nuez Moscada", percentage: 70 },
    ],
    heart: [
      { name: "Té Rooibos", percentage: 90 },
      { name: "Ante / Gamuza", percentage: 85 },
    ],
    base: [
      { name: "Cedro", percentage: 85 },
      { name: "Cachemira", percentage: 80 },
      { name: "Amberwood", percentage: 75 },
    ],
  },
  // 88 (62). Lattafa Velvet Rose — CORREGIDO: notas completamente revisadas
  62: {
    top: [
      { name: "Rosa", percentage: 95 },
      { name: "Pachulí", percentage: 90 },
    ],
    heart: [
      { name: "Almizcle", percentage: 85 },
      { name: "Ládano", percentage: 80 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
    ],
  },
  // 89 (63). Lattafa Petra — CORREGIDO: notas completamente revisadas
  63: {
    top: [
      { name: "Ron", percentage: 95 },
      { name: "Ciruela", percentage: 90 },
    ],
    heart: [
      { name: "Nardos", percentage: 95 },
      { name: "Coco", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 85 },
      { name: "Praliné", percentage: 80 },
    ],
  },
  // 90 (64). Lattafa Atheeri — CORREGIDO: notas completamente revisadas
  64: {
    top: [
      { name: "Flor de la Pasión", percentage: 95 },
      { name: "Gotas de Rocío", percentage: 85 },
    ],
    heart: [
      { name: "Orquídea", percentage: 90 },
      { name: "Jazmín", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Amberwood", percentage: 85 },
    ],
  },
  // 91 (65). Lattafa Sakeena — CORREGIDO: notas de Fragrantica
  65: {
    top: [
      { name: "Fruta de la Pasión", percentage: 95 },
      { name: "Mandarina", percentage: 85 },
      { name: "Notas Ozónicas", percentage: 75 },
    ],
    heart: [
      { name: "Frambuesa", percentage: 90 },
      { name: "Rosa", percentage: 80 },
      { name: "Flor de Azahar", percentage: 70 },
      { name: "Sal Marina", percentage: 65 },
    ],
    base: [
      { name: "Praliné", percentage: 90 },
      { name: "Toffee", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
      { name: "Almizcle", percentage: 65 },
    ],
  },
  // 92 (66). Lattafa Emaan — CORREGIDO: notas de Fragrantica
  66: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Grosellas Negras", percentage: 85 },
      { name: "Flor de Azahar", percentage: 80 },
    ],
    heart: [
      { name: "Nardos", percentage: 95 },
      { name: "Jazmín", percentage: 85 },
      { name: "Caléndula", percentage: 65 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
      { name: "Pachulí", percentage: 75 },
      { name: "Cedro", percentage: 70 },
    ],
  },
  // 93 (67). Lattafa Qimmah — CORREGIDO: notas de Fragrantica
  67: {
    top: [
      { name: "Almendra", percentage: 90 },
      { name: "Café", percentage: 85 },
    ],
    heart: [
      { name: "Jazmín", percentage: 90 },
      { name: "Nardos", percentage: 85 },
      { name: "Haba Tonka", percentage: 75 },
    ],
    base: [
      { name: "Cacao", percentage: 95 },
      { name: "Vainilla", percentage: 90 },
      { name: "Sándalo", percentage: 75 },
    ],
  },
  // 94 (68). Lattafa Ameer Al Oudh Intense Oud — CORREGIDO: notas de Fragrantica
  68: {
    top: [
      { name: "Madera de Oud", percentage: 95 },
      { name: "Notas Amaderadas", percentage: 90 },
    ],
    heart: [
      { name: "Vainilla", percentage: 95 },
      { name: "Azúcar", percentage: 85 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 90 },
      { name: "Sándalo", percentage: 80 },
      { name: "Notas Herbales", percentage: 60 },
    ],
  },
  // 95 (69). Lattafa Maahir — CORREGIDO: notas de Fragrantica
  69: {
    top: [
      { name: "Melocotón", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Bayas Rojas", percentage: 80 },
    ],
    heart: [
      { name: "Jazmín", percentage: 85 },
      { name: "Peonía", percentage: 75 },
      { name: "Lirio Rojo", percentage: 70 },
    ],
    base: [
      { name: "Sándalo", percentage: 85 },
      { name: "Flor de Vainilla", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
    ],
  },
  // 96 (70). Lattafa Maahir Black Edition — CORREGIDO: Oud→Cedro, añadido Musgo
  70: {
    top: [
      { name: "Pimienta Negra", percentage: 95 },
      { name: "Pimienta Rosa", percentage: 85 },
      { name: "Azafrán", percentage: 80 },
    ],
    heart: [
      { name: "Aceite de Cade / Humo", percentage: 95 },
      { name: "Ládano", percentage: 85 },
      { name: "Bálsamo de Gurjun", percentage: 80 },
      { name: "Ruibarbo", percentage: 70 },
    ],
    base: [
      { name: "Cuero", percentage: 95 },
      { name: "Cedro", percentage: 90 },
      { name: "Madera de Guayaco", percentage: 85 },
      { name: "Pachulí", percentage: 80 },
      { name: "Musgo", percentage: 70 },
      { name: "Almizcle", percentage: 65 },
    ],
  },
  // 97 (71). Lattafa Maahir Legacy — CORREGIDO: notas de Fragrantica
  71: {
    top: [
      { name: "Lima", percentage: 95 },
      { name: "Menta", percentage: 90 },
      { name: "Toronja", percentage: 85 },
      { name: "Lavanda", percentage: 75 },
      { name: "Piña", percentage: 70 },
    ],
    heart: [
      { name: "Baya de Enebro", percentage: 85 },
      { name: "Romero", percentage: 80 },
      { name: "Geranio", percentage: 75 },
      { name: "Pimienta Negra", percentage: 65 },
      { name: "Incienso", percentage: 60 },
    ],
    base: [
      { name: "Ambroxan", percentage: 95 },
      { name: "Vetiver", percentage: 85 },
      { name: "Cachemira", percentage: 75 },
      { name: "Musgo de Roble", percentage: 70 },
      { name: "Haba Tonka", percentage: 65 },
    ],
  },
  // 98 (72). Lattafa Ramz Silver — CORREGIDO: notas de Fragrantica
  72: {
    top: [
      { name: "Pera", percentage: 95 },
      { name: "Lavanda", percentage: 90 },
      { name: "Menta", percentage: 85 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Cardamomo", percentage: 85 },
      { name: "Salvia", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Ámbar", percentage: 85 },
      { name: "Almizcle", percentage: 75 },
      { name: "Pachulí", percentage: 65 },
    ],
  },
  // 99 (73). Lattafa Ramz Gold — CORREGIDO: notas de Fragrantica
  73: {
    top: [
      { name: "Naranja Dulce", percentage: 90 },
      { name: "Grosellas Negras", percentage: 85 },
      { name: "Manzana", percentage: 80 },
      { name: "Melocotón", percentage: 75 },
      { name: "Pera", percentage: 70 },
    ],
    heart: [
      { name: "Iris", percentage: 85 },
      { name: "Jazmín", percentage: 80 },
      { name: "Flor de Azahar", percentage: 75 },
      { name: "Rosa", percentage: 65 },
    ],
    base: [
      { name: "Caramelo", percentage: 95 },
      { name: "Vainilla", percentage: 90 },
      { name: "Sándalo", percentage: 75 },
      { name: "Almizcle", percentage: 70 },
      { name: "Pachulí", percentage: 60 },
    ],
  },
  // 100 (74). Lattafa Najdia — CORREGIDO: añadido Sándalo en base
  74: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Hierba Limón", percentage: 90 },
      { name: "Manzana", percentage: 85 },
      { name: "Canela", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Notas Marinas", percentage: 95 },
      { name: "Lavanda", percentage: 80 },
      { name: "Romero", percentage: 75 },
      { name: "Cardamomo", percentage: 65 },
    ],
    base: [
      { name: "Ámbar", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Sándalo", percentage: 78 },
      { name: "Cedro", percentage: 75 },
      { name: "Tabaco", percentage: 60 },
    ],
  },
  // 101 (75). Lattafa Suqraat — CORREGIDO: eliminado Notas Marinas de corazón
  75: {
    top: [
      { name: "Bergamota", percentage: 95 },
      { name: "Jengibre", percentage: 80 },
    ],
    heart: [
      { name: "Lavanda", percentage: 90 },
      { name: "Hojas de Violeta", percentage: 80 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
    ],
  },
  // 102 (128). Lattafa Khamrah — CORREGIDO: notas de Fragrantica
  128: {
    top: [
      { name: "Canela", percentage: 95 },
      { name: "Nuez Moscada", percentage: 90 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Dátiles", percentage: 95 },
      { name: "Praliné", percentage: 90 },
      { name: "Nardos", percentage: 75 },
      { name: "Mahonial", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Haba Tonka", percentage: 90 },
      { name: "Benjuí", percentage: 85 },
      { name: "Amberwood", percentage: 80 },
      { name: "Mirra", percentage: 75 },
      { name: "Akigalawood", percentage: 65 },
    ],
  },
  // 103 (129). Lattafa Khamrah Qahwa — CORREGIDO: Café en base (no corazón)
  129: {
    top: [
      { name: "Canela", percentage: 95 },
      { name: "Cardamomo", percentage: 85 },
      { name: "Jengibre", percentage: 75 },
    ],
    heart: [
      { name: "Praliné", percentage: 90 },
      { name: "Frutas Escarchadas", percentage: 85 },
      { name: "Flores Blancas", percentage: 65 },
    ],
    base: [
      { name: "Café Arabica", percentage: 95 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Benjuí", percentage: 80 },
      { name: "Almizcle", percentage: 70 },
      { name: "Vainilla", percentage: 90 },
    ],
  },
  // 104 (130). Lattafa Khamrah Dukhan — CORREGIDO: notas completamente revisadas
  130: {
    top: [
      { name: "Especias Ahumadas", percentage: 95 },
      { name: "Pimiento", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
    ],
    heart: [
      { name: "Incienso", percentage: 95 },
      { name: "Ládano", percentage: 85 },
      { name: "Flor de Azahar", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
    ],
    base: [
      { name: "Praliné", percentage: 90 },
      { name: "Tabaco", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Haba Tonka", percentage: 75 },
      { name: "Benjuí", percentage: 70 },
    ],
  },
  // 105 (131). Lattafa Yara — CORREGIDO: notas de Fragrantica
  131: {
    top: [
      { name: "Orquídea", percentage: 90 },
      { name: "Heliotropo", percentage: 85 },
      { name: "Mandarina", percentage: 75 },
    ],
    heart: [
      { name: "Acorde Gourmand", percentage: 95 },
      { name: "Frutas Tropicales", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Almizcle", percentage: 85 },
      { name: "Sándalo", percentage: 75 },
    ],
  },
  // 106 (132). Lattafa Yara Tous — CORREGIDO: notas de Fragrantica
  132: {
    top: [
      { name: "Mango", percentage: 95 },
      { name: "Coco", percentage: 90 },
      { name: "Fruta de la Pasión", percentage: 85 },
    ],
    heart: [
      { name: "Jazmín", percentage: 80 },
      { name: "Heliotropo", percentage: 75 },
      { name: "Flor de Azahar", percentage: 70 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Almizcle", percentage: 80 },
      { name: "Cachemira", percentage: 75 },
    ],
  },
  // 107 (133). Lattafa Yara Moi — CORREGIDO: notas de Fragrantica
  133: {
    top: [
      { name: "Melocotón", percentage: 90 },
      { name: "Jazmín", percentage: 80 },
    ],
    heart: [
      { name: "Caramelo", percentage: 95 },
      { name: "Ámbar", percentage: 80 },
    ],
    base: [
      { name: "Pachulí", percentage: 85 },
      { name: "Sándalo", percentage: 75 },
    ],
  },
  // 108 (134). Lattafa Asad — CORREGIDO: notas de Fragrantica
  134: {
    top: [
      { name: "Pimienta Negra", percentage: 95 },
      { name: "Piña", percentage: 80 },
      { name: "Tabaco", percentage: 75 },
    ],
    heart: [
      { name: "Café", percentage: 85 },
      { name: "Pachulí", percentage: 80 },
      { name: "Iris", percentage: 70 },
    ],
    base: [
      { name: "Ámbar", percentage: 95 },
      { name: "Vainilla", percentage: 90 },
      { name: "Maderas Secas", percentage: 85 },
      { name: "Benjuí", percentage: 75 },
      { name: "Ládano", percentage: 65 },
    ],
  },
  // 109 (135). Lattafa Asad Bourbon — CORREGIDO: notas completamente revisadas
  135: {
    top: [
      { name: "Lavanda", percentage: 90 },
      { name: "Mirabelle", percentage: 85 },
      { name: "Pimienta Rosa", percentage: 80 },
    ],
    heart: [
      { name: "Cacao", percentage: 90 },
      { name: "Nuez Moscada", percentage: 85 },
      { name: "Davana", percentage: 80 },
    ],
    base: [
      { name: "Vainilla Bourbon", percentage: 95 },
      { name: "Ámbar", percentage: 85 },
      { name: "Vetiver", percentage: 80 },
    ],
  },
  // 110 (136). Lattafa Asad Zanzibar — CORREGIDO: notas completamente revisadas
  136: {
    top: [
      { name: "Lavanda", percentage: 90 },
      { name: "Pimienta Negra", percentage: 85 },
    ],
    heart: [
      { name: "Agua de Coco", percentage: 95 },
      { name: "Iris", percentage: 90 },
      { name: "Sal", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Incienso", percentage: 85 },
    ],
  },
  // 111 (150). Lattafa Opulent Dubai — CORREGIDO: notas completamente revisadas
  150: {
    top: [
      { name: "Mango", percentage: 95 },
      { name: "Toronja", percentage: 90 },
      { name: "Limón", percentage: 85 },
      { name: "Jengibre", percentage: 80 },
    ],
    heart: [
      { name: "Jazmín", percentage: 85 },
      { name: "Cedro", percentage: 80 },
      { name: "Violeta", percentage: 75 },
    ],
    base: [
      { name: "Notas Amaderadas", percentage: 85 },
      { name: "Ámbar Gris", percentage: 80 },
      { name: "Benjuí", percentage: 75 },
      { name: "Musgo de Roble", percentage: 70 },
    ],
  },
  // 112 (76). French Avenue Liquid Brun — CORREGIDO: corazón/base intercambiados, añadido Elemí/Bergamota
  76: {
    top: [
      { name: "Canela", percentage: 95 },
      { name: "Flor de Azahar", percentage: 85 },
      { name: "Cardamomo", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Vainilla Bourbon", percentage: 95 },
      { name: "Elemí", percentage: 80 },
    ],
    base: [
      { name: "Praliné", percentage: 90 },
      { name: "Ambroxan", percentage: 85 },
      { name: "Madera de Guayaco", percentage: 80 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 113 (77). French Avenue Aether — CORREGIDO: Pomarose→Violeta
  77: {
    top: [
      { name: "Manzana Verde", percentage: 95 },
      { name: "Bergamota de Calabria", percentage: 90 },
      { name: "Mandarina", percentage: 80 },
    ],
    heart: [
      { name: "Petitgrain", percentage: 85 },
      { name: "Cachemira", percentage: 75 },
      { name: "Cedro", percentage: 70 },
      { name: "Violeta", percentage: 60 },
    ],
    base: [
      { name: "Musgo de Roble", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Amberwood", percentage: 75 },
    ],
  },
  // 114 (78). French Avenue Luscious — CORREGIDO: notas completamente revisadas
  78: {
    top: [
      { name: "Pistacho", percentage: 95 },
      { name: "Cardamomo", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Cacahuete", percentage: 90 },
      { name: "Azafrán", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Miel", percentage: 85 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
    ],
  },
  // 115 (79). French Avenue Intense Addiction — CORREGIDO: notas completamente revisadas
  79: {
    top: [
      { name: "Flor de Manzano", percentage: 90 },
      { name: "Naranja", percentage: 85 },
    ],
    heart: [
      { name: "Orquídea", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
    ],
    base: [
      { name: "Miel", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
    ],
  },
  // 116 (80). French Avenue Obsidian — CORREGIDO: notas completamente revisadas
  80: {
    top: [
      { name: "Toronja", percentage: 95 },
      { name: "Aldehídos", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Mirra", percentage: 90 },
      { name: "Ládano", percentage: 85 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Vainilla", percentage: 75 },
    ],
  },
  // 117 (81). French Avenue Vulcan Feu — CORREGIDO: notas completamente revisadas
  81: {
    top: [
      { name: "Mango", percentage: 95 },
      { name: "Limón", percentage: 90 },
      { name: "Jengibre", percentage: 85 },
      { name: "Ruibarbo", percentage: 80 },
    ],
    heart: [
      { name: "Pimienta Rosa", percentage: 90 },
      { name: "Jazmín", percentage: 85 },
      { name: "Violeta", percentage: 80 },
      { name: "Praliné", percentage: 75 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Cedro", percentage: 80 },
      { name: "Ámbar Gris", percentage: 75 },
      { name: "Musgo", percentage: 70 },
    ],
  },
  // 118 (82). Afnan Supremacy Not Only Intense — CORREGIDO: notas de Fragrantica
  82: {
    top: [
      { name: "Grosellas Negras", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Manzana", percentage: 80 },
    ],
    heart: [
      { name: "Musgo de Roble", percentage: 95 },
      { name: "Pachulí", percentage: 85 },
      { name: "Lavanda", percentage: 75 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
      { name: "Azafrán", percentage: 70 },
    ],
  },
  // 119 (83). Afnan Supremacy Silver — CORREGIDO: notas de Fragrantica
  83: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Grosellas Negras", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
      { name: "Manzana", percentage: 80 },
    ],
    heart: [
      { name: "Abedul", percentage: 90 },
      { name: "Pachulí", percentage: 80 },
      { name: "Jazmín", percentage: 70 },
      { name: "Rosa", percentage: 60 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Musgo de Roble", percentage: 85 },
      { name: "Ámbar Gris", percentage: 75 },
      { name: "Vainilla", percentage: 65 },
    ],
  },
  // 120 (84). Afnan Supremacy Incense — CORREGIDO: añadido Humo en base
  84: {
    top: [
      { name: "Orégano", percentage: 95 },
      { name: "Pimiento", percentage: 85 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Incienso", percentage: 98 },
      { name: "Ámbar", percentage: 85 },
      { name: "Ládano", percentage: 80 },
      { name: "Opopónaco", percentage: 75 },
    ],
    base: [
      { name: "Cuero", percentage: 90 },
      { name: "Madera de Agar / Oud", percentage: 85 },
      { name: "Humo", percentage: 82 },
      { name: "Pachulí", percentage: 80 },
      { name: "Sándalo", percentage: 70 },
    ],
  },

  // ─── Páginas 7-8: Afnan, Rave, Maison Alhambra, Dumont, Rasasi ───

  // 121 (85). Afnan Supremacy In Heaven — CORREGIDO: notas de Fragrantica
  85: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Mandarina", percentage: 85 },
    ],
    heart: [
      { name: "Té Verde", percentage: 85 },
      { name: "Grosellas Negras", percentage: 80 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Notas Amaderadas", percentage: 80 },
      { name: "Sándalo", percentage: 75 },
    ],
  },
  // 122 (86). Afnan 9PM Rebel — CORREGIDO: notas de Fragrantica
  86: {
    top: [
      { name: "Manzana Granny Smith", percentage: 90 },
      { name: "Piña", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
    ],
    heart: [
      { name: "Cedro", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
      { name: "Musgo de Roble", percentage: 75 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 90 },
      { name: "Caramelo", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Madera Seca", percentage: 70 },
    ],
  },
  // 123 (87). Afnan 9PM Pour Femme — CORREGIDO: notas de Fragrantica
  87: {
    top: [
      { name: "Frambuesa", percentage: 90 },
      { name: "Violeta", percentage: 85 },
      { name: "Manzana", percentage: 80 },
      { name: "Naranja", percentage: 75 },
    ],
    heart: [
      { name: "Rosa", percentage: 90 },
      { name: "Peonía", percentage: 85 },
      { name: "Iris", percentage: 80 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Ciprés", percentage: 85 },
      { name: "Pino", percentage: 80 },
      { name: "Ámbar", percentage: 75 },
      { name: "Cedro", percentage: 70 },
    ],
  },
  // 124 (137). Afnan 9PM — CORREGIDO: notas de Fragrantica
  137: {
    top: [
      { name: "Manzana", percentage: 95 },
      { name: "Canela", percentage: 90 },
      { name: "Lavanda Silvestre", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 90 },
      { name: "Lirio del Valle", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Haba Tonka", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Pachulí", percentage: 75 },
    ],
  },
  // 125 (138). Afnan 9PM Nite Out — CORREGIDO: notas de Fragrantica
  138: {
    top: [
      { name: "Pitahaya", percentage: 90 },
      { name: "Lavanda", percentage: 85 },
      { name: "Coñac", percentage: 80 },
      { name: "Manzana", percentage: 75 },
      { name: "Bergamota", percentage: 65 },
    ],
    heart: [
      { name: "Toffee", percentage: 90 },
      { name: "Ante / Gamuza", percentage: 85 },
      { name: "Cardamomo", percentage: 80 },
      { name: "Cedro", percentage: 75 },
      { name: "Mahonial", percentage: 65 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 90 },
      { name: "Akigalawood", percentage: 85 },
      { name: "Ambrofix", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
    ],
  },
  // 126 (139). Afnan 9PM Elixir — CORREGIDO: notas de Fragrantica
  139: {
    top: [
      { name: "Cardamomo", percentage: 95 },
      { name: "Nuez Moscada", percentage: 85 },
      { name: "Elemí", percentage: 75 },
    ],
    heart: [
      { name: "Pimiento", percentage: 90 },
      { name: "Cuero", percentage: 85 },
      { name: "Lavanda", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Pachulí", percentage: 85 },
      { name: "Ládano", percentage: 80 },
      { name: "Rosa de Roca", percentage: 70 },
    ],
  },
  // 127 (140). Afnan 9AM Dive — CORREGIDO: notas de Fragrantica
  140: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Menta", percentage: 90 },
      { name: "Grosellas Negras", percentage: 80 },
      { name: "Pimienta Rosa", percentage: 75 },
    ],
    heart: [
      { name: "Manzana", percentage: 85 },
      { name: "Cedro", percentage: 80 },
      { name: "Incienso", percentage: 75 },
    ],
    base: [
      { name: "Jengibre", percentage: 85 },
      { name: "Sándalo", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Jazmín", percentage: 65 },
    ],
  },
  // 128 (152). Afnan Turathi Electric — CORREGIDO: notas de Fragrantica
  152: {
    top: [
      { name: "Pera", percentage: 95 },
      { name: "Toronja Rosa", percentage: 90 },
      { name: "Mandarina", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 90 },
      { name: "Manzana", percentage: 80 },
      { name: "Cedro", percentage: 75 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
    ],
  },
  // 129 (153). Afnan Turathi Blue — CORREGIDO: notas de Fragrantica
  153: {
    top: [
      { name: "Bergamota", percentage: 95 },
      { name: "Mandarina", percentage: 85 },
    ],
    heart: [
      { name: "Ámbar", percentage: 90 },
      { name: "Notas Amaderadas", percentage: 85 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Pachulí", percentage: 85 },
      { name: "Especias", percentage: 75 },
    ],
  },

  // ─── Rave ───

  // 130 (88). Rave Now — CORREGIDO: notas de Fragrantica
  88: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Bergamota", percentage: 85 },
      { name: "Manzana", percentage: 80 },
      { name: "Grosellas Negras", percentage: 75 },
    ],
    heart: [
      { name: "Abedul", percentage: 90 },
      { name: "Pachulí", percentage: 85 },
      { name: "Jazmín Marroquí", percentage: 80 },
      { name: "Rosa", percentage: 70 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
      { name: "Musgo de Roble", percentage: 80 },
      { name: "Ámbar Gris", percentage: 75 },
    ],
  },
  // 131 (89). Rave Now Women — CORREGIDO: notas de Fragrantica
  89: {
    top: [
      { name: "Frutos Rojos", percentage: 90 },
      { name: "Naranja", percentage: 85 },
    ],
    heart: [
      { name: "Malvavisco", percentage: 95 },
      { name: "Jazmín", percentage: 80 },
      { name: "Lirio del Valle", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 85 },
      { name: "Musgo", percentage: 70 },
    ],
  },
  // 132 (90). Rave Rage — CORREGIDO: notas de Fragrantica
  90: {
    top: [
      { name: "Manzana", percentage: 90 },
      { name: "Menta", percentage: 85 },
    ],
    heart: [
      { name: "Cilantro", percentage: 80 },
      { name: "Fresia", percentage: 75 },
      { name: "Albahaca", percentage: 70 },
    ],
    base: [
      { name: "Pachulí", percentage: 85 },
      { name: "Cachemira", percentage: 80 },
      { name: "Ládano", percentage: 75 },
      { name: "Incienso", percentage: 65 },
    ],
  },

  // ─── Maison Alhambra ───

  // 133 (92). Maison Alhambra Baroque Rouge 540 — CORREGIDO: notas de Fragrantica
  92: {
    top: [
      { name: "Azafrán", percentage: 95 },
      { name: "Pera", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
    ],
    heart: [
      { name: "Jazmín", percentage: 90 },
      { name: "Ylang-Ylang", percentage: 85 },
      { name: "Lirio", percentage: 75 },
    ],
    base: [
      { name: "Ámbar", percentage: 90 },
      { name: "Madera de Cachemira", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
    ],
  },
  // 134 (93). Maison Alhambra Cassius — CORREGIDO: notas de Fragrantica
  93: {
    top: [
      { name: "Nuez Moscada", percentage: 90 },
      { name: "Manzana Verde", percentage: 85 },
    ],
    heart: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Rosa", percentage: 80 },
    ],
    base: [
      { name: "Pachulí", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
    ],
  },
  // 135 (94). Maison Alhambra The Tux — CORREGIDO: notas de Fragrantica
  94: {
    top: [
      { name: "Notas Especiadas", percentage: 90 },
      { name: "Notas Florales", percentage: 80 },
    ],
    heart: [
      { name: "Pachulí", percentage: 95 },
      { name: "Ámbar", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Ámbar Gris", percentage: 85 },
    ],
  },
  // 136 (95). Maison Alhambra Glacier Le Noir — CORREGIDO: notas de Fragrantica
  95: {
    top: [
      { name: "Cardamomo", percentage: 95 },
      { name: "Pimienta Negra", percentage: 85 },
    ],
    heart: [
      { name: "Lavanda", percentage: 90 },
      { name: "Iris", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Notas Orientales", percentage: 85 },
      { name: "Notas Amaderadas", percentage: 75 },
    ],
  },
  // 137 (96). Maison Alhambra Céleste — CORREGIDO: notas de Fragrantica
  96: {
    top: [
      { name: "Limón", percentage: 90 },
      { name: "Bergamota", percentage: 85 },
    ],
    heart: [
      { name: "Jazmín", percentage: 90 },
      { name: "Lirio del Valle", percentage: 85 },
      { name: "Rosa", percentage: 80 },
    ],
    base: [
      { name: "Ylang-Ylang", percentage: 85 },
      { name: "Sándalo", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
      { name: "Musgo", percentage: 65 },
    ],
  },
  // 138 (97). Maison Alhambra Tobacco Touch — CORREGIDO: notas de Fragrantica
  97: {
    top: [
      { name: "Tabaco", percentage: 95 },
      { name: "Notas Especiadas", percentage: 85 },
    ],
    heart: [
      { name: "Tabaco", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Cacao", percentage: 75 },
    ],
    base: [
      { name: "Frutas Secas", percentage: 85 },
      { name: "Notas Amaderadas", percentage: 80 },
    ],
  },

  // ─── Dumont ───

  // 139 (98). Dumont Nitro Pour Homme — CORREGIDO: notas de Fragrantica
  98: {
    top: [
      { name: "Mandarina", percentage: 90 },
      { name: "Toronja", percentage: 85 },
      { name: "Cardamomo", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
      { name: "Limón", percentage: 70 },
      { name: "Nuez Moscada", percentage: 65 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 90 },
      { name: "Jazmín", percentage: 85 },
      { name: "Cedro", percentage: 75 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Cedro", percentage: 85 },
      { name: "Sándalo", percentage: 80 },
      { name: "Madera de Guayaco", percentage: 75 },
      { name: "Haba Tonka", percentage: 70 },
    ],
  },
  // 140 (99). Dumont Nitro Blue — CORREGIDO: notas de Fragrantica (base diferente)
  99: {
    top: [
      { name: "Canela", percentage: 90 },
      { name: "Flor de Azahar", percentage: 85 },
      { name: "Limón", percentage: 80 },
      { name: "Salvia", percentage: 75 },
      { name: "Albahaca", percentage: 70 },
    ],
    heart: [
      { name: "Praliné", percentage: 90 },
      { name: "Bálsamo de Tolú", percentage: 85 },
      { name: "Notas Amaderadas", percentage: 80 },
      { name: "Cardamomo Negro", percentage: 75 },
    ],
    base: [
      { name: "Notas Dulces", percentage: 90 },
      { name: "Pachulí", percentage: 85 },
      { name: "Ámbar Negro", percentage: 80 },
      { name: "Palo de Rosa Brasileño", percentage: 70 },
    ],
  },
  // 141 (100). Dumont Nitro Red — CORREGIDO: notas de Fragrantica
  100: {
    top: [
      { name: "Manzana", percentage: 90 },
      { name: "Lavanda", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Sandía", percentage: 90 },
      { name: "Cedro", percentage: 80 },
      { name: "Cálamo", percentage: 70 },
    ],
    base: [
      { name: "Ámbar", percentage: 90 },
      { name: "Sándalo", percentage: 85 },
      { name: "Pachulí", percentage: 75 },
    ],
  },
  // 142 (101). Dumont Nitro White — CORREGIDO: notas de Fragrantica
  101: {
    top: [
      { name: "Bayas de Enebro", percentage: 90 },
      { name: "Iris", percentage: 85 },
      { name: "Ciprés", percentage: 80 },
    ],
    heart: [
      { name: "Mirra", percentage: 90 },
      { name: "Pachulí", percentage: 80 },
    ],
    base: [
      { name: "Miel", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
      { name: "Cuero", percentage: 65 },
    ],
  },
  // 143 (102). Dumont Nitro Platinum — CORREGIDO: notas de Fragrantica
  102: {
    top: [
      { name: "Grosellas Negras", percentage: 90 },
      { name: "Naranja", percentage: 85 },
      { name: "Manzana", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
      { name: "Pimienta Rosa", percentage: 70 },
      { name: "Cardamomo", percentage: 65 },
    ],
    heart: [
      { name: "Vainilla", percentage: 90 },
      { name: "Azúcar", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
      { name: "Madera Seca", percentage: 75 },
      { name: "Azafrán", percentage: 70 },
      { name: "Lirio del Valle", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Ámbar", percentage: 90 },
      { name: "Cedro", percentage: 80 },
      { name: "Musgo", percentage: 75 },
      { name: "Almizcle", percentage: 70 },
      { name: "Madera de Guayaco", percentage: 65 },
    ],
  },

  // ─── Rasasi ───

  // 144 (122). Rasasi Hawas For Him — CORREGIDO: notas de Fragrantica
  122: {
    top: [
      { name: "Manzana", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Limón", percentage: 85 },
      { name: "Canela", percentage: 75 },
    ],
    heart: [
      { name: "Notas Acuáticas", percentage: 90 },
      { name: "Ciruela", percentage: 85 },
      { name: "Flor de Azahar", percentage: 80 },
      { name: "Cardamomo", percentage: 70 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 95 },
      { name: "Almizcle", percentage: 85 },
      { name: "Pachulí", percentage: 80 },
      { name: "Madera de Deriva", percentage: 70 },
    ],
  },
  // 145 (123). Rasasi Hawas Tropical — CORREGIDO: notas de Fragrantica
  123: {
    top: [
      { name: "Agua de Coco", percentage: 95 },
      { name: "Hoja de Higo", percentage: 85 },
      { name: "Jengibre", percentage: 80 },
    ],
    heart: [
      { name: "Coco", percentage: 95 },
      { name: "Higo", percentage: 85 },
      { name: "Menta", percentage: 75 },
    ],
    base: [
      { name: "Sándalo", percentage: 90 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Almizcle", percentage: 75 },
    ],
  },
  // 146 (124). Rasasi Hawas Fire — CORREGIDO: notas de Fragrantica
  124: {
    top: [
      { name: "Salvia Esclarea", percentage: 95 },
    ],
    heart: [
      { name: "Notas Marinas", percentage: 95 },
      { name: "Jazmín Egipcio", percentage: 85 },
    ],
    base: [
      { name: "Ámbar", percentage: 90 },
      { name: "Notas Minerales", percentage: 85 },
      { name: "Ámbar Gris", percentage: 80 },
    ],
  },
  // 147 (125). Rasasi Hawas Malibu — CORREGIDO: notas de Fragrantica
  125: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Naranja", percentage: 85 },
      { name: "Toronja", percentage: 80 },
    ],
    heart: [
      { name: "Ámbar", percentage: 85 },
      { name: "Iris", percentage: 80 },
      { name: "Lavanda", percentage: 75 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 90 },
      { name: "Almizcle", percentage: 85 },
      { name: "Cachemira", percentage: 80 },
      { name: "Pachulí", percentage: 70 },
    ],
  },
  // 148 (126). Rasasi Hawas Ice — CORREGIDO: notas de Fragrantica
  126: {
    top: [
      { name: "Manzana", percentage: 95 },
      { name: "Limón Italiano", percentage: 90 },
      { name: "Bergamota Siciliana", percentage: 85 },
      { name: "Anís Estrellado", percentage: 75 },
    ],
    heart: [
      { name: "Ciruela", percentage: 85 },
      { name: "Flor de Azahar", percentage: 80 },
      { name: "Cardamomo", percentage: 75 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Madera de Deriva", percentage: 80 },
      { name: "Musgo", percentage: 70 },
    ],
  },
  // 149 (127). Rasasi Hawas Elixir — CORREGIDO: notas de Fragrantica
  127: {
    top: [
      { name: "Menta", percentage: 95 },
      { name: "Bergamota", percentage: 85 },
      { name: "Artemisa", percentage: 75 },
    ],
    heart: [
      { name: "Chocolate Oscuro", percentage: 95 },
      { name: "Lavanda", percentage: 85 },
      { name: "Benjuí", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Almizcle Blanco", percentage: 80 },
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
    { label: "Atalcado", percentage: 95, color: "#d4c5a9" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Dulce", percentage: 80, color: "#f0a830" },
    { label: "Iris", percentage: 75, color: "#9b8ec4" },
    { label: "Almizclado", percentage: 65, color: "#a0a0a0" },
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
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Cuero", percentage: 65, color: "#8b5e3c" },
  ],
  // 12 (5). Odyssey Homme White Edition
  5: [
    { label: "Fresco Especiado", percentage: 90, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Acuático", percentage: 80, color: "#4a8eb8" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Dulce", percentage: 65, color: "#f0a830" },
  ],
  // 13 (91). Odyssey Aoud
  91: [
    { label: "Oud", percentage: 90, color: "#5a3a2a" },
    { label: "Especiado Cálido", percentage: 85, color: "#c45a3a" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Almizclado", percentage: 75, color: "#a0a0a0" },
    { label: "Pachulí", percentage: 65, color: "#4a7a3a" },
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
    { label: "Cálido Especiado", percentage: 90, color: "#c45a3a" },
    { label: "Tropical", percentage: 85, color: "#f0c934" },
    { label: "Dulce", percentage: 80, color: "#f0a830" },
    { label: "Coco", percentage: 75, color: "#d4c5a9" },
    { label: "Ámbar", percentage: 65, color: "#f0a830" },
  ],
  // 16 (106). Odyssey Bahamas
  106: [
    { label: "Acuático", percentage: 95, color: "#4a8eb8" },
    { label: "Fresco", percentage: 90, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Almizclado", percentage: 75, color: "#a0a0a0" },
    { label: "Ámbar", percentage: 65, color: "#f0a830" },
  ],
  // 17 (107). Odyssey Toffee Coffee
  107: [
    { label: "Gourmand", percentage: 95, color: "#8b5e3c" },
    { label: "Café", percentage: 90, color: "#5a3a2a" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Caramelo", percentage: 80, color: "#c98030" },
    { label: "Ámbar", percentage: 70, color: "#f0a830" },
  ],
  // 18 (108). Odyssey Spectra
  108: [
    { label: "Cálido Especiado", percentage: 95, color: "#c45a3a" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Tabaco", percentage: 80, color: "#5a3a2a" },
    { label: "Vainilla", percentage: 75, color: "#c9a033" },
    { label: "Ámbar", percentage: 65, color: "#f0a830" },
  ],
  // 19 (109). Odyssey Aqua
  109: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Aromático", percentage: 85, color: "#6b8e4e" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Fresco", percentage: 70, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 60, color: "#a0a0a0" },
  ],
  // 20 (110). Odyssey Homme
  110: [
    { label: "Ámbar", percentage: 90, color: "#f0a830" },
    { label: "Vainilla", percentage: 85, color: "#c9a033" },
    { label: "Atalcado", percentage: 80, color: "#d4c5a9" },
    { label: "Iris", percentage: 75, color: "#9b8ec4" },
    { label: "Especiado Cálido", percentage: 70, color: "#c45a3a" },
  ],
  // ─── Página 2 ───
  // 21 (111). Odyssey Mandarin Sky Vintage Edition
  111: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Caramelo", percentage: 70, color: "#c98030" },
    { label: "Especiado Cálido", percentage: 65, color: "#c45a3a" },
  ],
  // 22 (112). Odyssey Mandarin Sky Elixir
  112: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Caramelo", percentage: 80, color: "#c98030" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Especiado", percentage: 65, color: "#c45a3a" },
  ],
  // 23 (113). Odyssey Mega
  113: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Aromático", percentage: 85, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 80, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Almizclado", percentage: 60, color: "#a0a0a0" },
  ],
  // 24 (114). Odyssey Limoni Fresh
  114: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Fresco", percentage: 85, color: "#a0c4e8" },
    { label: "Floral", percentage: 75, color: "#e75a8d" },
    { label: "Almizclado", percentage: 65, color: "#a0a0a0" },
    { label: "Marino", percentage: 55, color: "#4a8eb8" },
  ],
  // 25 (141). Yum Yum — CORREGIDO
  141: [
    { label: "Dulce / Gourmand", percentage: 95, color: "#f0a830" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Cereza", percentage: 85, color: "#c4385a" },
    { label: "Atalcado", percentage: 75, color: "#d4c5a9" },
    { label: "Ámbar", percentage: 65, color: "#f0a830" },
  ],
  // 26 (143). Bon Bon — CORREGIDO
  143: [
    { label: "Floral", percentage: 95, color: "#e75a8d" },
    { label: "Fresco", percentage: 90, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Cítrico", percentage: 80, color: "#f0c934" },
    { label: "Marino", percentage: 70, color: "#4a8eb8" },
  ],
  // 27 (144). Island Bliss — CORREGIDO
  144: [
    { label: "Tropical", percentage: 95, color: "#f0c934" },
    { label: "Coco", percentage: 90, color: "#d4c5a9" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Floral Blanco", percentage: 75, color: "#f0e6f6" },
    { label: "Afrutado", percentage: 65, color: "#e75a8d" },
  ],
  // 28 (145). Island Breeze — CORREGIDO
  145: [
    { label: "Fresco", percentage: 95, color: "#a0c4e8" },
    { label: "Floral", percentage: 85, color: "#e75a8d" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Almizclado", percentage: 75, color: "#a0a0a0" },
    { label: "Tropical", percentage: 65, color: "#f0c934" },
  ],
  // 29 (151). Eter Arabian — CORREGIDO
  151: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Especiado Cálido", percentage: 85, color: "#c45a3a" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Ámbar", percentage: 65, color: "#f0a830" },
  ],
  // 30 (6). Al Haramain Amber Oud Rouge Edition — CORREGIDO
  6: [
    { label: "Ámbar", percentage: 95, color: "#f0a830" },
    { label: "Azafrán", percentage: 90, color: "#e8a030" },
    { label: "Floral", percentage: 85, color: "#e75a8d" },
    { label: "Almizclado", percentage: 75, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
  ],
  // 31 (7). Al Haramain Amber Oud Gold Edition — CORREGIDO
  7: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Tropical", percentage: 85, color: "#f0c934" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Vainilla", percentage: 75, color: "#c9a033" },
  ],
  // 32 (8). Al Haramain Amber Oud Carbon Edition — CORREGIDO
  8: [
    { label: "Aromático", percentage: 90, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 85, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Cítrico", percentage: 75, color: "#f0c934" },
    { label: "Marino", percentage: 70, color: "#4a8eb8" },
  ],
  // 33 (9). Al Haramain Amber Oud White Edition — CORREGIDO
  9: [
    { label: "Floral Blanco", percentage: 90, color: "#f0e6f6" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Atalcado", percentage: 80, color: "#d4c5a9" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Especiado Suave", percentage: 65, color: "#c45a3a" },
  ],
  // 34 (10). Al Haramain L'Aventure — CORREGIDO
  10: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Atalcado", percentage: 65, color: "#d4c5a9" },
    { label: "Fresco", percentage: 60, color: "#a0c4e8" },
  ],
  // 35 (11). Al Haramain L'Aventure Woman — CORREGIDO
  11: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Floral Blanco", percentage: 80, color: "#f0e6f6" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
    { label: "Almizclado", percentage: 65, color: "#a0a0a0" },
  ],
  // 36 (154). Al Haramain Amber Oud Aqua Dubai — CORREGIDO
  154: [
    { label: "Marino", percentage: 95, color: "#4a8eb8" },
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Fresco", percentage: 85, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Ámbar", percentage: 65, color: "#f0a830" },
  ],
  // 37 (14). Lattafa Bade'e Al Oud Amethyst — CORREGIDO
  14: [
    { label: "Rosado", percentage: 95, color: "#e75a8d" },
    { label: "Oud", percentage: 85, color: "#5a3a2a" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 75, color: "#c45a3a" },
    { label: "Afrutado", percentage: 65, color: "#e75a8d" },
  ],
  // 38 (15). Lattafa Bade'e Al Oud Oud for Glory — CORREGIDO
  15: [
    { label: "Oud", percentage: 95, color: "#5a3a2a" },
    { label: "Especiado Cálido", percentage: 90, color: "#c45a3a" },
    { label: "Azafrán", percentage: 85, color: "#e8a030" },
    { label: "Pachulí", percentage: 75, color: "#4a7a3a" },
    { label: "Atalcado", percentage: 60, color: "#d4c5a9" },
  ],
  // 39 (16). Lattafa Bade'e Al Oud Honor & Glory — CORREGIDO
  16: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Tropical / Piña", percentage: 90, color: "#f0c934" },
    { label: "Gourmand", percentage: 85, color: "#8b5e3c" },
    { label: "Especiado Cálido", percentage: 75, color: "#c45a3a" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
  ],
  // 40 (18). Lattafa Eclaire Pistache — CORREGIDO
  18: [
    { label: "Gourmand", percentage: 95, color: "#8b5e3c" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Pistacho", percentage: 85, color: "#a0b84e" },
    { label: "Lácteo", percentage: 80, color: "#f5f0e0" },
    { label: "Vainilla", percentage: 75, color: "#c9a033" },
  ],

  // ─── Páginas 3-4: Lattafa ───

  // 41 (19). Lattafa Eclaire Banoffi — CORREGIDO
  19: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Vainilla", percentage: 90, color: "#c9a033" },
    { label: "Lácteo", percentage: 85, color: "#f5f0e0" },
    { label: "Tropical", percentage: 80, color: "#f0c934" },
    { label: "Gourmand", percentage: 75, color: "#8b5e3c" },
  ],
  // 42 (20). Lattafa Mayar Natural Intense — CORREGIDO
  20: [
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Fresco Acuático", percentage: 80, color: "#4a8eb8" },
    { label: "Floral", percentage: 70, color: "#e75a8d" },
    { label: "Almizclado", percentage: 60, color: "#a0a0a0" },
  ],
  // 43 (21). Lattafa Fakhar Black — CORREGIDO
  21: [
    { label: "Aromático", percentage: 95, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 88, color: "#a0c4e8" },
    { label: "Cítrico", percentage: 80, color: "#f0c934" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Verde", percentage: 65, color: "#4a7a3a" },
  ],
  // 44 (22). Lattafa Fakhar Rose — CORREGIDO
  22: [
    { label: "Floral Blanco", percentage: 95, color: "#f0e6f6" },
    { label: "Nardos", percentage: 90, color: "#f0e6f6" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Atalcado", percentage: 70, color: "#d4c5a9" },
  ],
  // 45 (103). Lattafa Qaed Al Fursan — CORREGIDO
  103: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Cuero", percentage: 65, color: "#8b5e3c" },
    { label: "Fresco", percentage: 60, color: "#a0c4e8" },
  ],
  // 46 (25). Lattafa Qaed Al Fursan Untamed — CORREGIDO
  25: [
    { label: "Ámbar", percentage: 95, color: "#f0a830" },
    { label: "Cálido Especiado", percentage: 90, color: "#c45a3a" },
    { label: "Aromático", percentage: 85, color: "#6b8e4e" },
    { label: "Caramelo", percentage: 80, color: "#c98030" },
    { label: "Canela", percentage: 75, color: "#c45a3a" },
  ],
  // 47 (26). Lattafa Qaed Al Fursan Unlimited — CORREGIDO
  26: [
    { label: "Tropical", percentage: 95, color: "#f0c934" },
    { label: "Coco", percentage: 90, color: "#d4c5a9" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Cítrico", percentage: 75, color: "#f0c934" },
    { label: "Floral Blanco", percentage: 70, color: "#f0e6f6" },
  ],
  // 48 (27). Lattafa Hayaati Florence — CORREGIDO
  27: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Floral", percentage: 80, color: "#e75a8d" },
    { label: "Afrutado", percentage: 75, color: "#e75a8d" },
    { label: "Almizclado", percentage: 65, color: "#a0a0a0" },
  ],
  // 49 (142). Lattafa Hayaati Gold Elixir — CORREGIDO
  142: [
    { label: "Cuero", percentage: 95, color: "#8b5e3c" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Animálico", percentage: 80, color: "#5a3a2a" },
    { label: "Vainilla", percentage: 75, color: "#c9a033" },
    { label: "Ámbar", percentage: 70, color: "#f0a830" },
  ],
  // 50 (146). Lattafa Hayaati — CORREGIDO
  146: [
    { label: "Fresco", percentage: 90, color: "#a0c4e8" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Especiado Suave", percentage: 70, color: "#c45a3a" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
  ],
  // 51 (147). Lattafa Hayaati Al Maleky — CORREGIDO
  147: [
    { label: "Fresco Especiado", percentage: 90, color: "#a0c4e8" },
    { label: "Aromático", percentage: 85, color: "#6b8e4e" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Almizclado", percentage: 70, color: "#a0a0a0" },
  ],
  // 52 (148). Lattafa Vintage Radio — CORREGIDO
  148: [
    { label: "Amaderado", percentage: 95, color: "#c17b2a" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Especiado Cálido", percentage: 85, color: "#c45a3a" },
    { label: "Aromático", percentage: 75, color: "#6b8e4e" },
    { label: "Balsámico", percentage: 70, color: "#8b6e4e" },
  ],
  // 53 (149). Lattafa Emeer — CORREGIDO
  149: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Aromático", percentage: 90, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 85, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Herbal", percentage: 70, color: "#4a7a3a" },
  ],
  // 54 (28). Lattafa Nebras Elixir — CORREGIDO
  28: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Vainilla", percentage: 90, color: "#c9a033" },
    { label: "Lácteo", percentage: 85, color: "#f5f0e0" },
    { label: "Atalcado", percentage: 75, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 65, color: "#a0a0a0" },
  ],
  // 55 (29). Lattafa Asad Elixir — CORREGIDO
  29: [
    { label: "Especiado Cálido", percentage: 95, color: "#c45a3a" },
    { label: "Tabaco", percentage: 90, color: "#5a3a2a" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Vainilla", percentage: 75, color: "#c9a033" },
  ],
  // 56 (30). Lattafa Ansaam Gold — CORREGIDO
  30: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Floral Blanco", percentage: 80, color: "#f0e6f6" },
    { label: "Atalcado", percentage: 75, color: "#d4c5a9" },
    { label: "Vainilla", percentage: 70, color: "#c9a033" },
  ],
  // 57 (31). Lattafa Ansaam Silver — CORREGIDO
  31: [
    { label: "Aromático", percentage: 95, color: "#6b8e4e" },
    { label: "Cálido Especiado", percentage: 90, color: "#c45a3a" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Vainilla", percentage: 75, color: "#c9a033" },
  ],
  // 58 (32). Lattafa Shaheen Gold — CORREGIDO
  32: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Dulce", percentage: 75, color: "#f0a830" },
    { label: "Cuero", percentage: 65, color: "#8b5e3c" },
  ],
  // 59 (33). Lattafa Shaheen Silver — CORREGIDO
  33: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Ahumado", percentage: 75, color: "#7a6b5d" },
    { label: "Fresco", percentage: 70, color: "#a0c4e8" },
  ],
  // 60 (34). Lattafa Hala — CORREGIDO
  34: [
    { label: "Especiado Cálido", percentage: 95, color: "#c45a3a" },
    { label: "Amaderado", percentage: 90, color: "#c17b2a" },
    { label: "Ahumado", percentage: 85, color: "#7a6b5d" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Balsámico", percentage: 75, color: "#8b6e4e" },
  ],
  // 61 (35). Lattafa Ishq Al Shuyukh Gold — CORREGIDO
  35: [
    { label: "Cuero", percentage: 95, color: "#8b5e3c" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Ámbar", percentage: 85, color: "#f0a830" },
    { label: "Atalcado", percentage: 75, color: "#d4c5a9" },
    { label: "Especiado Cálido", percentage: 70, color: "#c45a3a" },
  ],
  // 62 (36). Lattafa Ishq Al Shuyukh Silver — CORREGIDO
  36: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Especiado", percentage: 75, color: "#c45a3a" },
    { label: "Ozónico", percentage: 65, color: "#a0c4e8" },
  ],
  // 63 (37). Lattafa Ta'weel — CORREGIDO
  37: [
    { label: "Fresco Especiado", percentage: 95, color: "#a0c4e8" },
    { label: "Aromático", percentage: 85, color: "#6b8e4e" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Cuero", percentage: 75, color: "#8b5e3c" },
    { label: "Cítrico", percentage: 70, color: "#f0c934" },
  ],
  // 64 (38). Lattafa Teriaq Intense — CORREGIDO
  38: [
    { label: "Ámbar", percentage: 95, color: "#f0a830" },
    { label: "Cálido Especiado", percentage: 90, color: "#c45a3a" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Canela", percentage: 75, color: "#c45a3a" },
    { label: "Aromático", percentage: 70, color: "#6b8e4e" },
  ],
  // 65 (39). Lattafa Musamam White Intense — CORREGIDO
  39: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Tropical", percentage: 90, color: "#f0c934" },
    { label: "Coco", percentage: 85, color: "#d4c5a9" },
    { label: "Fresco Especiado", percentage: 75, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
  ],
  // 66 (40). Lattafa Victoria — CORREGIDO
  40: [
    { label: "Vainilla", percentage: 95, color: "#c9a033" },
    { label: "Cítrico", percentage: 80, color: "#f0c934" },
    { label: "Floral Blanco", percentage: 75, color: "#f0e6f6" },
    { label: "Atalcado", percentage: 70, color: "#d4c5a9" },
    { label: "Dulce", percentage: 65, color: "#f0a830" },
  ],
  // 67 (41). Lattafa Art of Universe — CORREGIDO
  41: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Fresco Especiado", percentage: 80, color: "#a0c4e8" },
    { label: "Dulce", percentage: 70, color: "#f0a830" },
    { label: "Verde", percentage: 65, color: "#4a7a3a" },
  ],
  // 68 (42). Lattafa Vanilla Freak — CORREGIDO
  42: [
    { label: "Vainilla", percentage: 98, color: "#c9a033" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Almendra", percentage: 85, color: "#8b6e4e" },
    { label: "Lácteo", percentage: 80, color: "#f5f0e0" },
    { label: "Gourmand", percentage: 75, color: "#8b5e3c" },
  ],
  // 69 (43). Lattafa Berry On Top — CORREGIDO
  43: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Berries", percentage: 85, color: "#c4385a" },
    { label: "Vainilla", percentage: 80, color: "#c9a033" },
    { label: "Lácteo", percentage: 75, color: "#f5f0e0" },
  ],
  // 70 (44). Lattafa Choco Overdose — CORREGIDO
  44: [
    { label: "Cacao", percentage: 98, color: "#5a3a2a" },
    { label: "Chocolate", percentage: 95, color: "#3a2010" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Gourmand", percentage: 85, color: "#8b5e3c" },
    { label: "Caramelo", percentage: 80, color: "#c98030" },
  ],
  // 71 (45). Lattafa Mallow Madness — CORREGIDO
  45: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Vainilla", percentage: 80, color: "#c9a033" },
    { label: "Atalcado", percentage: 75, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 65, color: "#a0a0a0" },
  ],
  // 72 (46). Lattafa Whipped Pleasure — CORREGIDO
  46: [
    { label: "Lácteo", percentage: 95, color: "#f5f0e0" },
    { label: "Caramelo", percentage: 90, color: "#c98030" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Vainilla", percentage: 70, color: "#c9a033" },
  ],
  // 73 (47). Lattafa The Kingdom Woman — CORREGIDO
  47: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Fresco", percentage: 85, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Vainilla", percentage: 75, color: "#c9a033" },
    { label: "Floral", percentage: 70, color: "#e75a8d" },
  ],
  // 74 (48). Lattafa The Kingdom Men — CORREGIDO
  48: [
    { label: "Vainilla", percentage: 95, color: "#c9a033" },
    { label: "Aromático", percentage: 85, color: "#6b8e4e" },
    { label: "Dulce", percentage: 80, color: "#f0a830" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Tabaco", percentage: 70, color: "#5a3a2a" },
  ],
  // 75 (49). Lattafa Layaan — CORREGIDO
  49: [
    { label: "Floral Blanco", percentage: 95, color: "#f0e6f6" },
    { label: "Fresco", percentage: 85, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 80, color: "#a0a0a0" },
    { label: "Verde", percentage: 75, color: "#4a7a3a" },
    { label: "Afrutado", percentage: 65, color: "#e75a8d" },
  ],
  // 76 (50). Lattafa Efeef — CORREGIDO
  50: [
    { label: "Floral Blanco", percentage: 95, color: "#f0e6f6" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Tuberosa", percentage: 75, color: "#f0e6f6" },
    { label: "Ámbar", percentage: 70, color: "#f0a830" },
  ],
  // 77 (51). Lattafa Al Noble Safeer — CORREGIDO
  51: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 90, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Caramelo", percentage: 75, color: "#c98030" },
    { label: "Herbal", percentage: 70, color: "#6b8e4e" },
  ],
  // 78 (52). Lattafa Al Noble Ameer — CORREGIDO
  52: [
    { label: "Cálido Especiado", percentage: 95, color: "#c45a3a" },
    { label: "Oud", percentage: 90, color: "#5a3a2a" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Aromático", percentage: 75, color: "#6b8e4e" },
    { label: "Balsámico", percentage: 70, color: "#8b6e4e" },
  ],
  // 79 (53). Lattafa Al Noble Wazeer — CORREGIDO
  53: [
    { label: "Amaderado", percentage: 95, color: "#c17b2a" },
    { label: "Cálido Especiado", percentage: 85, color: "#c45a3a" },
    { label: "Atalcado", percentage: 75, color: "#d4c5a9" },
    { label: "Whisky / Coñac", percentage: 70, color: "#8b5e3c" },
    { label: "Ámbar", percentage: 65, color: "#f0a830" },
  ],
  // 80 (54). Lattafa Her Confession — CORREGIDO
  54: [
    { label: "Vainilla", percentage: 95, color: "#c9a033" },
    { label: "Floral Blanco", percentage: 90, color: "#f0e6f6" },
    { label: "Tuberosa", percentage: 85, color: "#f0e6f6" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 70, color: "#c45a3a" },
  ],

  // ─── Páginas 5-6 ───

  // 81 (55). Lattafa His Confession — CORREGIDO
  55: [
    { label: "Atalcado", percentage: 90, color: "#d4c5a9" },
    { label: "Especiado Cálido", percentage: 85, color: "#c45a3a" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Vainilla", percentage: 75, color: "#c9a033" },
    { label: "Balsámico", percentage: 65, color: "#8b6e4e" },
  ],
  // 82 (56). Lattafa Ajwaa — CORREGIDO
  56: [
    { label: "Ámbar", percentage: 95, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 90, color: "#c45a3a" },
    { label: "Balsámico", percentage: 85, color: "#8b6e4e" },
    { label: "Incienso", percentage: 80, color: "#7a6b5d" },
    { label: "Dulce", percentage: 70, color: "#f0a830" },
  ],
  // 83 (57). Lattafa Sehr — CORREGIDO
  57: [
    { label: "Vainilla", percentage: 95, color: "#c9a033" },
    { label: "Especiado Cálido", percentage: 90, color: "#c45a3a" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
  ],
  // 84 (58). Lattafa Habik Woman — CORREGIDO
  58: [
    { label: "Floral Blanco", percentage: 90, color: "#f0e6f6" },
    { label: "Fresco", percentage: 85, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 80, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
    { label: "Afrutado", percentage: 65, color: "#e75a8d" },
  ],
  // 85 (59). Lattafa Eternal Vanille — CORREGIDO
  59: [
    { label: "Vainilla", percentage: 98, color: "#c9a033" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Cacao", percentage: 85, color: "#5a3a2a" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Berries", percentage: 70, color: "#c4385a" },
  ],
  // 86 (60). Lattafa Jassoor — CORREGIDO
  60: [
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Fresco Especiado", percentage: 85, color: "#a0c4e8" },
    { label: "Cuero", percentage: 80, color: "#8b5e3c" },
    { label: "Tabaco", percentage: 75, color: "#5a3a2a" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
  ],
  // 87 (61). Lattafa Dynasty — CORREGIDO
  61: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 85, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Cuero", percentage: 75, color: "#8b5e3c" },
    { label: "Afrutado", percentage: 70, color: "#e75a8d" },
  ],
  // 88 (62). Lattafa Velvet Rose — CORREGIDO
  62: [
    { label: "Rosado", percentage: 95, color: "#e75a8d" },
    { label: "Pachulí", percentage: 85, color: "#4a7a3a" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Almizclado", percentage: 75, color: "#a0a0a0" },
    { label: "Especiado Suave", percentage: 60, color: "#c45a3a" },
  ],
  // 89 (63). Lattafa Petra — CORREGIDO
  63: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Gourmand", percentage: 90, color: "#8b5e3c" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Tropical", percentage: 80, color: "#f0c934" },
    { label: "Floral", percentage: 75, color: "#e75a8d" },
  ],
  // 90 (64). Lattafa Atheeri — CORREGIDO
  64: [
    { label: "Floral", percentage: 95, color: "#e75a8d" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Vainilla", percentage: 80, color: "#c9a033" },
    { label: "Tropical", percentage: 75, color: "#f0c934" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
  ],
  // 91 (65). Lattafa Sakeena — CORREGIDO
  65: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Tropical", percentage: 85, color: "#f0c934" },
    { label: "Marino", percentage: 75, color: "#4a8eb8" },
    { label: "Gourmand", percentage: 70, color: "#8b5e3c" },
  ],
  // 92 (66). Lattafa Emaan — CORREGIDO
  66: [
    { label: "Floral Blanco", percentage: 95, color: "#f0e6f6" },
    { label: "Nardos", percentage: 90, color: "#f0e6f6" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Almizclado", percentage: 75, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
  ],
  // 93 (67). Lattafa Qimmah — CORREGIDO
  67: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Cacao", percentage: 85, color: "#5a3a2a" },
    { label: "Floral Blanco", percentage: 80, color: "#f0e6f6" },
    { label: "Vainilla", percentage: 75, color: "#c9a033" },
    { label: "Café", percentage: 70, color: "#3a2010" },
  ],
  // 94 (68). Lattafa Ameer Al Oudh Intense Oud — CORREGIDO
  68: [
    { label: "Amaderado", percentage: 95, color: "#c17b2a" },
    { label: "Oud", percentage: 90, color: "#5a3a2a" },
    { label: "Vainilla", percentage: 85, color: "#c9a033" },
    { label: "Dulce", percentage: 80, color: "#f0a830" },
    { label: "Balsámico", percentage: 75, color: "#8b6e4e" },
  ],
  // 95 (69). Lattafa Maahir — CORREGIDO
  69: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Floral", percentage: 80, color: "#e75a8d" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Atalcado", percentage: 65, color: "#d4c5a9" },
  ],
  // 96 (70). Lattafa Maahir Black Edition — CORREGIDO
  70: [
    { label: "Ahumado", percentage: 98, color: "#7a6b5d" },
    { label: "Cuero", percentage: 95, color: "#8b5e3c" },
    { label: "Especiado Oscuro", percentage: 90, color: "#c45a3a" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Balsámico", percentage: 80, color: "#8b6e4e" },
  ],
  // 97 (71). Lattafa Maahir Legacy — CORREGIDO
  71: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Aromático", percentage: 90, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 85, color: "#a0c4e8" },
    { label: "Verde", percentage: 80, color: "#4a7a3a" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
  ],
  // 98 (72). Lattafa Ramz Silver — CORREGIDO
  72: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Vainilla", percentage: 90, color: "#c9a033" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Aromático", percentage: 80, color: "#6b8e4e" },
    { label: "Especiado Suave", percentage: 70, color: "#c45a3a" },
  ],
  // 99 (73). Lattafa Ramz Gold — CORREGIDO
  73: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Atalcado", percentage: 80, color: "#d4c5a9" },
    { label: "Floral", percentage: 75, color: "#e75a8d" },
    { label: "Vainilla", percentage: 70, color: "#c9a033" },
  ],
  // 100 (74). Lattafa Najdia — CORREGIDO
  74: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Marino", percentage: 90, color: "#4a8eb8" },
    { label: "Fresco Especiado", percentage: 85, color: "#a0c4e8" },
    { label: "Aromático", percentage: 80, color: "#6b8e4e" },
    { label: "Verde", percentage: 75, color: "#4a7a3a" },
  ],
  // 101 (75). Lattafa Suqraat — CORREGIDO
  75: [
    { label: "Marino", percentage: 95, color: "#4a8eb8" },
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 85, color: "#a0c4e8" },
    { label: "Aromático", percentage: 80, color: "#6b8e4e" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
  ],
  // 102 (128). Lattafa Khamrah — CORREGIDO
  128: [
    { label: "Dulce", percentage: 98, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 95, color: "#c45a3a" },
    { label: "Ámbar", percentage: 90, color: "#f0a830" },
    { label: "Vainilla", percentage: 85, color: "#c9a033" },
    { label: "Canela", percentage: 80, color: "#c45a3a" },
  ],
  // 103 (129). Lattafa Khamrah Qahwa — CORREGIDO
  129: [
    { label: "Café", percentage: 95, color: "#3a2010" },
    { label: "Especiado Cálido", percentage: 90, color: "#c45a3a" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Vainilla", percentage: 80, color: "#c9a033" },
    { label: "Gourmand", percentage: 85, color: "#8b5e3c" },
  ],
  // 104 (130). Lattafa Khamrah Dukhan — CORREGIDO
  130: [
    { label: "Ahumado", percentage: 95, color: "#7a6b5d" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 85, color: "#c45a3a" },
    { label: "Resinoso", percentage: 80, color: "#8b6e4e" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
  ],
  // 105 (131). Lattafa Yara — CORREGIDO
  131: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Lácteo", percentage: 90, color: "#f5f0e0" },
    { label: "Atalcado", percentage: 85, color: "#d4c5a9" },
    { label: "Vainilla", percentage: 80, color: "#c9a033" },
    { label: "Afrutado", percentage: 75, color: "#e75a8d" },
  ],
  // 106 (132). Lattafa Yara Tous — CORREGIDO
  132: [
    { label: "Tropical", percentage: 98, color: "#f0c934" },
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Coco", percentage: 90, color: "#d4c5a9" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Vainilla", percentage: 80, color: "#c9a033" },
  ],
  // 107 (133). Lattafa Yara Moi — CORREGIDO
  133: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Caramelo", percentage: 90, color: "#c98030" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Floral", percentage: 70, color: "#e75a8d" },
  ],
  // 108 (134). Lattafa Asad — CORREGIDO
  134: [
    { label: "Especiado Cálido", percentage: 95, color: "#c45a3a" },
    { label: "Ámbar", percentage: 90, color: "#f0a830" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Vainilla", percentage: 80, color: "#c9a033" },
    { label: "Aromático", percentage: 75, color: "#6b8e4e" },
  ],
  // 109 (135). Lattafa Asad Bourbon — CORREGIDO
  135: [
    { label: "Vainilla", percentage: 95, color: "#c9a033" },
    { label: "Especiado Cálido", percentage: 90, color: "#c45a3a" },
    { label: "Balsámico", percentage: 85, color: "#8b6e4e" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Licoroso", percentage: 70, color: "#8b5e3c" },
  ],
  // 110 (136). Lattafa Asad Zanzibar — CORREGIDO
  136: [
    { label: "Salado", percentage: 95, color: "#4a8eb8" },
    { label: "Coco", percentage: 90, color: "#d4c5a9" },
    { label: "Atalcado", percentage: 85, color: "#d4c5a9" },
    { label: "Especiado", percentage: 80, color: "#c45a3a" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
  ],
  // 111 (150). Lattafa Opulent Dubai — CORREGIDO
  150: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Musgoso", percentage: 65, color: "#4a7a3a" },
  ],
  // 112 (76). French Avenue Liquid Brun — CORREGIDO
  76: [
    { label: "Vainilla", percentage: 98, color: "#c9a033" },
    { label: "Especiado Cálido", percentage: 95, color: "#c45a3a" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
  ],
  // 113 (77). French Avenue Aether — CORREGIDO
  77: [
    { label: "Verde", percentage: 95, color: "#4a7a3a" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Fresco", percentage: 75, color: "#a0c4e8" },
  ],
  // 114 (78). French Avenue Luscious — CORREGIDO
  78: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Vainilla", percentage: 80, color: "#c9a033" },
    { label: "Gourmand", percentage: 75, color: "#8b5e3c" },
    { label: "Especiado", percentage: 70, color: "#c45a3a" },
  ],
  // 115 (79). French Avenue Intense Addiction — CORREGIDO
  79: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Miel", percentage: 90, color: "#e8b830" },
    { label: "Floral", percentage: 85, color: "#e75a8d" },
    { label: "Atalcado", percentage: 75, color: "#d4c5a9" },
    { label: "Amaderado", percentage: 60, color: "#c17b2a" },
  ],
  // 116 (80). French Avenue Obsidian — CORREGIDO
  80: [
    { label: "Resinoso", percentage: 95, color: "#8b6e4e" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Balsámico", percentage: 75, color: "#8b6e4e" },
    { label: "Aldehídico", percentage: 70, color: "#d4c5a9" },
  ],
  // 117 (81). French Avenue Vulcan Feu — CORREGIDO
  81: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Ámbar Gris", percentage: 75, color: "#f0a830" },
  ],
  // 118 (82). Afnan Supremacy Not Only Intense — CORREGIDO
  82: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Musgoso", percentage: 90, color: "#4a7a3a" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Cuero", percentage: 70, color: "#8b5e3c" },
  ],
  // 119 (83). Afnan Supremacy Silver — CORREGIDO
  83: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Ahumado", percentage: 75, color: "#7a6b5d" },
    { label: "Dulce", percentage: 60, color: "#f0a830" },
  ],
  // 120 (84). Afnan Supremacy Incense — CORREGIDO
  84: [
    { label: "Incienso", percentage: 98, color: "#7a6b5d" },
    { label: "Especiado Herbal", percentage: 95, color: "#6b8e4e" },
    { label: "Ámbar", percentage: 90, color: "#f0a830" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Balsámico", percentage: 80, color: "#8b6e4e" },
  ],

  // ─── Páginas 7-8: Afnan, Rave, Maison Alhambra, Dumont, Rasasi ───

  // 121 (85). Afnan Supremacy In Heaven — CORREGIDO
  85: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Fresco", percentage: 85, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 80, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Afrutado", percentage: 65, color: "#e75a8d" },
  ],
  // 122 (86). Afnan 9PM Rebel — CORREGIDO
  86: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Vainilla", percentage: 70, color: "#c9a033" },
  ],
  // 123 (87). Afnan 9PM Pour Femme — CORREGIDO
  87: [
    { label: "Floral", percentage: 95, color: "#e75a8d" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Violeta", percentage: 65, color: "#9b8ec4" },
  ],
  // 124 (137). Afnan 9PM — CORREGIDO
  137: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 90, color: "#c45a3a" },
    { label: "Vainilla", percentage: 85, color: "#c9a033" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
  ],
  // 125 (138). Afnan 9PM Nite Out — CORREGIDO
  138: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Especiado Cálido", percentage: 80, color: "#c45a3a" },
    { label: "Gourmand", percentage: 75, color: "#8b5e3c" },
  ],
  // 126 (139). Afnan 9PM Elixir — CORREGIDO
  139: [
    { label: "Especiado Cálido", percentage: 95, color: "#c45a3a" },
    { label: "Cuero", percentage: 90, color: "#8b5e3c" },
    { label: "Vainilla", percentage: 85, color: "#c9a033" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Balsámico", percentage: 70, color: "#8b6e4e" },
  ],
  // 127 (140). Afnan 9AM Dive — CORREGIDO
  140: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 90, color: "#a0c4e8" },
    { label: "Aromático", percentage: 85, color: "#6b8e4e" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Verde", percentage: 65, color: "#4a7a3a" },
  ],
  // 128 (152). Afnan Turathi Electric — CORREGIDO
  152: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Floral", percentage: 80, color: "#e75a8d" },
    { label: "Dulce", percentage: 75, color: "#f0a830" },
    { label: "Almizclado", percentage: 65, color: "#a0a0a0" },
  ],
  // 129 (153). Afnan Turathi Blue — CORREGIDO
  153: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Almizclado", percentage: 75, color: "#a0a0a0" },
    { label: "Especiado", percentage: 65, color: "#c45a3a" },
  ],

  // ─── Rave ───

  // 130 (88). Rave Now — CORREGIDO
  88: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Ahumado", percentage: 85, color: "#7a6b5d" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Dulce", percentage: 70, color: "#f0a830" },
  ],
  // 131 (89). Rave Now Women — CORREGIDO
  89: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Floral", percentage: 85, color: "#e75a8d" },
    { label: "Vainilla", percentage: 80, color: "#c9a033" },
    { label: "Almizclado", percentage: 70, color: "#a0a0a0" },
  ],
  // 132 (90). Rave Rage — CORREGIDO
  90: [
    { label: "Aromático", percentage: 95, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 85, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Incienso", percentage: 75, color: "#7a6b5d" },
    { label: "Verde", percentage: 65, color: "#4a7a3a" },
  ],

  // ─── Maison Alhambra ───

  // 133 (92). Maison Alhambra Baroque Rouge 540 — CORREGIDO
  92: [
    { label: "Ámbar", percentage: 95, color: "#f0a830" },
    { label: "Azafrán", percentage: 90, color: "#e8a030" },
    { label: "Floral", percentage: 85, color: "#e75a8d" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Almizclado", percentage: 70, color: "#a0a0a0" },
  ],
  // 134 (93). Maison Alhambra Cassius — CORREGIDO
  93: [
    { label: "Pachulí", percentage: 95, color: "#4a7a3a" },
    { label: "Vainilla", percentage: 90, color: "#c9a033" },
    { label: "Especiado Cálido", percentage: 85, color: "#c45a3a" },
    { label: "Rosado", percentage: 75, color: "#e75a8d" },
    { label: "Afrutado", percentage: 65, color: "#e75a8d" },
  ],
  // 135 (94). Maison Alhambra The Tux — CORREGIDO
  94: [
    { label: "Pachulí", percentage: 95, color: "#4a7a3a" },
    { label: "Oriental", percentage: 90, color: "#8b6e4e" },
    { label: "Especiado", percentage: 85, color: "#c45a3a" },
    { label: "Vainilla", percentage: 80, color: "#c9a033" },
    { label: "Ámbar", percentage: 70, color: "#f0a830" },
  ],
  // 136 (95). Maison Alhambra Glacier Le Noir — CORREGIDO
  95: [
    { label: "Especiado Cálido", percentage: 95, color: "#c45a3a" },
    { label: "Vainilla", percentage: 90, color: "#c9a033" },
    { label: "Atalcado", percentage: 85, color: "#d4c5a9" },
    { label: "Lavanda", percentage: 80, color: "#9b8ec4" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
  ],
  // 137 (96). Maison Alhambra Céleste — CORREGIDO
  96: [
    { label: "Floral Blanco", percentage: 95, color: "#f0e6f6" },
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Almizclado", percentage: 75, color: "#a0a0a0" },
    { label: "Dulce", percentage: 65, color: "#f0a830" },
  ],
  // 138 (97). Maison Alhambra Tobacco Touch — CORREGIDO
  97: [
    { label: "Tabaco", percentage: 98, color: "#5a3a2a" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 85, color: "#c45a3a" },
    { label: "Gourmand", percentage: 80, color: "#8b5e3c" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
  ],

  // ─── Dumont ───

  // 139 (98). Dumont Nitro Pour Homme — CORREGIDO
  98: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Especiado", percentage: 85, color: "#c45a3a" },
    { label: "Floral Blanco", percentage: 80, color: "#f0e6f6" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Almizclado", percentage: 65, color: "#a0a0a0" },
  ],
  // 140 (99). Dumont Nitro Blue — CORREGIDO
  99: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 90, color: "#c45a3a" },
    { label: "Floral", percentage: 85, color: "#e75a8d" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Balsámico", percentage: 70, color: "#8b6e4e" },
  ],
  // 141 (100). Dumont Nitro Red — CORREGIDO
  100: [
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Acuático", percentage: 70, color: "#4a8eb8" },
  ],
  // 142 (101). Dumont Nitro White — CORREGIDO
  101: [
    { label: "Amaderado", percentage: 95, color: "#c17b2a" },
    { label: "Dulce", percentage: 85, color: "#f0a830" },
    { label: "Balsámico", percentage: 80, color: "#8b6e4e" },
    { label: "Cuero", percentage: 75, color: "#8b5e3c" },
    { label: "Iris", percentage: 65, color: "#9b8ec4" },
  ],
  // 143 (102). Dumont Nitro Platinum — CORREGIDO
  102: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Vainilla", percentage: 90, color: "#c9a033" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Especiado", percentage: 70, color: "#c45a3a" },
  ],

  // ─── Rasasi ───

  // 144 (122). Rasasi Hawas For Him — CORREGIDO
  122: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Cítrico", percentage: 90, color: "#f0c934" },
    { label: "Acuático", percentage: 85, color: "#4a8eb8" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Almizclado", percentage: 70, color: "#a0a0a0" },
  ],
  // 145 (123). Rasasi Hawas Tropical — CORREGIDO
  123: [
    { label: "Tropical", percentage: 98, color: "#f0c934" },
    { label: "Coco", percentage: 95, color: "#d4c5a9" },
    { label: "Verde", percentage: 85, color: "#4a7a3a" },
    { label: "Dulce", percentage: 80, color: "#f0a830" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
  ],
  // 146 (124). Rasasi Hawas Fire — CORREGIDO
  124: [
    { label: "Marino", percentage: 95, color: "#4a8eb8" },
    { label: "Ámbar", percentage: 90, color: "#f0a830" },
    { label: "Herbal", percentage: 85, color: "#6b8e4e" },
    { label: "Floral", percentage: 80, color: "#e75a8d" },
    { label: "Mineral", percentage: 75, color: "#7a6b5d" },
  ],
  // 147 (125). Rasasi Hawas Malibu — CORREGIDO
  125: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Ámbar", percentage: 85, color: "#f0a830" },
    { label: "Atalcado", percentage: 80, color: "#d4c5a9" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
  ],
  // 148 (126). Rasasi Hawas Ice — CORREGIDO
  126: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Fresco", percentage: 90, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Especiado", percentage: 65, color: "#c45a3a" },
  ],
  // 149 (127). Rasasi Hawas Elixir — CORREGIDO
  127: [
    { label: "Gourmand", percentage: 95, color: "#8b5e3c" },
    { label: "Vainilla", percentage: 90, color: "#c9a033" },
    { label: "Lavanda", percentage: 85, color: "#9b8ec4" },
    { label: "Chocolate", percentage: 80, color: "#5a3a2a" },
    { label: "Dulce", percentage: 75, color: "#f0a830" },
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
