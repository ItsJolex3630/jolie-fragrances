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
  perfumes as allPerfumesData,
  type Perfume,
} from "@/lib/perfumes";
import dynamic from "next/dynamic";
const SimilarPerfumes = dynamic(() => import("./SimilarPerfumes"), { ssr: false });

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

export const NOTE_PYRAMIDS: Record<number, NotePyramidDetailed> = {
  // 1. Club de Nuit Intense Man — CORREGIDO: notas de Fragrantica (Grosellas Negras y Manzana en salida, Ámbar Gris en base)
  1: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Piña", percentage: 88 },
      { name: "Bergamota", percentage: 80 },
      { name: "Grosellas Negras", percentage: 70 },
      { name: "Manzana", percentage: 60 },
    ],
    heart: [
      { name: "Abedul", percentage: 88 },
      { name: "Jazmín", percentage: 65 },
      { name: "Rosa", percentage: 55 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ámbar Gris", percentage: 82 },
      { name: "Pachulí", percentage: 72 },
      { name: "Vainilla", percentage: 65 },
    ],
  },
  // 2. Club de Nuit Intense Man Limited Edition — CORREGIDO: notas de Fragrantica (Pimienta Rosa en salida, sin Abedul, Lirio del Valle y Fresia en corazón, Ambroxan+Cuero+Cedro en base)
  2: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Piña", percentage: 85 },
      { name: "Lima", percentage: 75 },
      { name: "Pimienta Negra", percentage: 70 },
      { name: "Bergamota", percentage: 65 },
      { name: "Pimienta Rosa", percentage: 60 },
    ],
    heart: [
      { name: "Jazmín", percentage: 90 },
      { name: "Lirio del Valle", percentage: 75 },
      { name: "Rosa", percentage: 70 },
      { name: "Fresia", percentage: 60 },
    ],
    base: [
      { name: "Almizcle Blanco", percentage: 90 },
      { name: "Ambroxan", percentage: 82 },
      { name: "Ámbar Gris", percentage: 78 },
      { name: "Cedro", percentage: 72 },
      { name: "Cuero", percentage: 68 },
      { name: "Pachulí", percentage: 62 },
    ],
  },
  // 3. Club de Nuit Woman — CORREGIDO: notas de Fragrantica (Lichi antes de Geranio en corazón)
  3: {
    top: [
      { name: "Naranja", percentage: 95 },
      { name: "Bergamota", percentage: 88 },
      { name: "Toronja", percentage: 80 },
      { name: "Melocotón", percentage: 70 },
    ],
    heart: [
      { name: "Rosa", percentage: 95 },
      { name: "Jazmín", percentage: 82 },
      { name: "Lichi", percentage: 72 },
      { name: "Geranio", percentage: 65 },
    ],
    base: [
      { name: "Pachulí", percentage: 95 },
      { name: "Almizcle", percentage: 85 },
      { name: "Vainilla", percentage: 78 },
      { name: "Vetiver", percentage: 68 },
    ],
  },
  // 4. Club de Nuit White Imperiale — CORREGIDO: notas de Fragrantica (Vainilla en corazón y base, sin Vetiver en base)
  4: {
    top: [
      { name: "Lichi", percentage: 95 },
      { name: "Bergamota", percentage: 82 },
      { name: "Nuez Moscada", percentage: 72 },
    ],
    heart: [
      { name: "Rosa Turca", percentage: 95 },
      { name: "Vainilla", percentage: 88 },
      { name: "Almizcle", percentage: 80 },
      { name: "Peonía", percentage: 72 },
    ],
    base: [
      { name: "Vainilla", percentage: 88 },
      { name: "Incienso", percentage: 78 },
      { name: "Cachemira", percentage: 72 },
      { name: "Cedro", percentage: 65 },
    ],
  },
  // 5 (115). Club de Nuit Iconic — CORREGIDO: notas de Fragrantica (Melón antes de Jazmín en corazón, Notas Amaderadas y Ládano en base)
  115: {
    top: [
      { name: "Toronja", percentage: 95 },
      { name: "Limón", percentage: 88 },
      { name: "Menta", percentage: 82 },
      { name: "Pimienta Rosa", percentage: 70 },
      { name: "Cilantro", percentage: 62 },
    ],
    heart: [
      { name: "Jengibre", percentage: 88 },
      { name: "Melón", percentage: 78 },
      { name: "Jazmín", percentage: 68 },
      { name: "Nuez Moscada", percentage: 60 },
    ],
    base: [
      { name: "Notas Amaderadas", percentage: 90 },
      { name: "Incienso", percentage: 82 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
      { name: "Cedro", percentage: 65 },
      { name: "Pachulí", percentage: 60 },
      { name: "Ládano", percentage: 55 },
    ],
  },
  // 6 (116). Club de Nuit Sillage — CORREGIDO: notas de Fragrantica (Hojas de Violeta, Rosa antes de Iris en corazón, Ambroxan en base)
  116: {
    top: [
      { name: "Bergamota", percentage: 95 },
      { name: "Limón", percentage: 85 },
      { name: "Lima", percentage: 80 },
      { name: "Grosellas Negras", percentage: 75 },
      { name: "Hojas de Violeta", percentage: 65 },
      { name: "Jengibre", percentage: 60 },
    ],
    heart: [
      { name: "Rosa", percentage: 88 },
      { name: "Iris", percentage: 82 },
      { name: "Jazmín", percentage: 70 },
    ],
    base: [
      { name: "Ambroxan", percentage: 92 },
      { name: "Almizcle", percentage: 85 },
      { name: "Sándalo", percentage: 72 },
      { name: "Cedro", percentage: 65 },
    ],
  },
  // 7 (117). Club de Nuit Urban Man Elixir — CORREGIDO: notas de Fragrantica (Clavelón/Tagetes en corazón)
  117: {
    top: [
      { name: "Bergamota", percentage: 90 },
      { name: "Pimienta Rosa", percentage: 82 },
      { name: "Jazmín", percentage: 68 },
      { name: "Flor de Azahar", percentage: 62 },
    ],
    heart: [
      { name: "Lavanda", percentage: 85 },
      { name: "Elemí", percentage: 75 },
      { name: "Geranio", percentage: 72 },
      { name: "Vetiver", percentage: 68 },
      { name: "Azafrán", percentage: 65 },
      { name: "Clavelón / Tagetes", percentage: 58 },
    ],
    base: [
      { name: "Ambroxan", percentage: 90 },
      { name: "Ámbar", percentage: 82 },
      { name: "Cedro", percentage: 72 },
      { name: "Pachulí", percentage: 68 },
      { name: "Ládano", percentage: 55 },
    ],
  },
  // 8 (118). Club de Nuit Urban Man — CORREGIDO: notas de Fragrantica (Menta antes de Toronja en salida, Lavanda antes de Nuez Moscada en corazón, Vetiver antes de Pachulí en base)
  118: {
    top: [
      { name: "Bergamota", percentage: 92 },
      { name: "Menta", percentage: 85 },
      { name: "Toronja", percentage: 78 },
      { name: "Cardamomo", percentage: 70 },
    ],
    heart: [
      { name: "Lavanda", percentage: 82 },
      { name: "Jengibre", percentage: 75 },
      { name: "Cedro", percentage: 70 },
      { name: "Nuez Moscada", percentage: 65 },
    ],
    base: [
      { name: "Vetiver", percentage: 88 },
      { name: "Pachulí", percentage: 80 },
      { name: "Sándalo", percentage: 72 },
      { name: "Musgo de Roble", percentage: 65 },
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
  // 11 (121). Club de Nuit Precieux I — CORREGIDO: notas de Fragrantica (Anís en corazón, no Anís Estrellado)
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
      { name: "Anís", percentage: 60 },
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
  // 14 (104). Odyssey Mandarine Sky — CORREGIDO: notas de Fragrantica (Salvia en salida, Clavelón en corazón, Ambroxan+Vetiver en base)
  104: {
    top: [
      { name: "Mandarina", percentage: 95 },
      { name: "Naranja", percentage: 85 },
      { name: "Azafrán", percentage: 75 },
      { name: "Salvia", percentage: 65 },
    ],
    heart: [
      { name: "Caramelo", percentage: 90 },
      { name: "Haba Tonka", percentage: 80 },
      { name: "Clavelón / Tagetes", percentage: 65 },
    ],
    base: [
      { name: "Ambroxan", percentage: 85 },
      { name: "Cedro", percentage: 75 },
      { name: "Vetiver", percentage: 65 },
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
  // 20 (110). Odyssey Homme — CORREGIDO: notas de Fragrantica (Cardamomo+Mandarina+Neroli en salida, Flor de Azahar+Rosa en corazón)
  110: {
    top: [
      { name: "Cardamomo", percentage: 90 },
      { name: "Mandarina", percentage: 85 },
      { name: "Neroli", percentage: 75 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 90 },
      { name: "Rosa", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Sándalo", percentage: 85 },
      { name: "Notas Amaderadas", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
    ],
  },
  // ─── Página 2 ───
  // 21 (111). Odyssey Mandarin Sky Vintage Edition — CORREGIDO: notas de Fragrantica (Cítricos+Mandarina en salida, Especias+Florales en corazón)
  111: {
    top: [
      { name: "Mandarina", percentage: 95 },
      { name: "Notas Cítricas", percentage: 85 },
    ],
    heart: [
      { name: "Especias", percentage: 85 },
      { name: "Notas Florales", percentage: 75 },
    ],
    base: [
      { name: "Notas Amaderadas", percentage: 85 },
      { name: "Ámbar", percentage: 80 },
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
  // 25 (141). Yum Yum — CORREGIDO: notas de Fragrantica (Bayas Silvestres y Cereza primero en salida, Vainilla en corazón, Notas Atalcadas antes que Ámbar en base)
  141: {
    top: [
      { name: "Bayas Silvestres", percentage: 95 },
      { name: "Cereza", percentage: 90 },
      { name: "Naranja", percentage: 82 },
      { name: "Bergamota", percentage: 78 },
    ],
    heart: [
      { name: "Rosa", percentage: 85 },
      { name: "Flores Blancas", percentage: 78 },
      { name: "Vainilla", percentage: 72 },
    ],
    base: [
      { name: "Notas Atalcadas", percentage: 88 },
      { name: "Almizcle", percentage: 82 },
      { name: "Ámbar", percentage: 75 },
    ],
  },
  // 26 (143). Bon Bon — CORREGIDO: notas de Fragrantica (Mandarina primero en salida, Azucena/Flor de Té Verde/Notas Marinas/Chabacano en corazón, Acorde Goloso y Sándalo en base)
  143: {
    top: [
      { name: "Mandarina", percentage: 88 },
      { name: "Bergamota", percentage: 82 },
      { name: "Manzana Granny Smith", percentage: 78 },
      { name: "Papaya", percentage: 72 },
    ],
    heart: [
      { name: "Peonía", percentage: 85 },
      { name: "Azucena", percentage: 78 },
      { name: "Flor de Té Verde", percentage: 72 },
      { name: "Notas Marinas", percentage: 68 },
      { name: "Chabacano", percentage: 62 },
    ],
    base: [
      { name: "Almizcle", percentage: 88 },
      { name: "Acorde Goloso", percentage: 80 },
      { name: "Sándalo", percentage: 72 },
    ],
  },
  // 27 (144). Island Bliss — CORREGIDO: notas de Fragrantica (Flor de Azahar del Naranjo, Nenúfar en corazón)
  144: {
    top: [
      { name: "Bayas Silvestres", percentage: 92 },
      { name: "Notas Verdes", percentage: 82 },
    ],
    heart: [
      { name: "Coco", percentage: 92 },
      { name: "Flor de Azahar del Naranjo", percentage: 82 },
      { name: "Lactonas", percentage: 75 },
      { name: "Nenúfar (Lirio de Agua)", percentage: 68 },
    ],
    base: [
      { name: "Vainilla", percentage: 92 },
      { name: "Haba Tonka", percentage: 82 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 28 (145). Island Breeze — CORREGIDO: notas de Fragrantica (Durazno/Melocotón)
  145: {
    top: [
      { name: "Durazno (Melocotón)", percentage: 92 },
      { name: "Bayas Silvestres", percentage: 85 },
    ],
    heart: [
      { name: "Rosa", percentage: 88 },
    ],
    base: [
      { name: "Almizcle Blanco", percentage: 92 },
    ],
  },
  // 29 (151). Eter Arabian — CORREGIDO: notas de Fragrantica (Aceite de Naranja y Piña primero en salida, Caramelo antes de Lavanda en corazón, Cedro/Vetiver/Pachulí/Cuero en base)
  151: {
    top: [
      { name: "Aceite de Naranja", percentage: 92 },
      { name: "Piña", percentage: 88 },
      { name: "Toronja", percentage: 82 },
      { name: "Limón", percentage: 78 },
      { name: "Bergamota", percentage: 75 },
      { name: "Pimienta", percentage: 70 },
    ],
    heart: [
      { name: "Caramelo", percentage: 85 },
      { name: "Lavanda", percentage: 80 },
      { name: "Geranio", percentage: 75 },
      { name: "Ylang-Ylang", percentage: 68 },
    ],
    base: [
      { name: "Ámbar", percentage: 88 },
      { name: "Cedro", percentage: 80 },
      { name: "Almizcle", percentage: 75 },
      { name: "Vetiver", percentage: 70 },
      { name: "Pachulí", percentage: 65 },
      { name: "Cuero", percentage: 60 },
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
  // 31 (7). Al Haramain Amber Oud Gold Edition — CORREGIDO: notas de Fragrantica (Acorde Goloso en corazón)
  7: {
    top: [
      { name: "Bergamota", percentage: 80 },
      { name: "Notas Verdes", percentage: 75 },
    ],
    heart: [
      { name: "Melón", percentage: 95 },
      { name: "Piña", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Acorde Goloso", percentage: 80 },
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
  // 35 (11). Al Haramain L'Aventure Woman — CORREGIDO: notas de Fragrantica (Cedro antes de Fresia y Rosa en corazón)
  11: {
    top: [
      { name: "Piña", percentage: 90 },
      { name: "Grosellas Negras", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
      { name: "Bayas Silvestres", percentage: 75 },
    ],
    heart: [
      { name: "Cedro", percentage: 85 },
      { name: "Fresia", percentage: 78 },
      { name: "Rosa", percentage: 72 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
      { name: "Vainilla", percentage: 65 },
    ],
  },
  // 36 (154). Al Haramain Amber Oud Aqua Dubai — CORREGIDO: notas de Fragrantica (Ámbar antes de Grosellas y Piña en corazón, Petitgrain y Gálbano en base)
  154: {
    top: [
      { name: "Bergamota", percentage: 95 },
      { name: "Notas Verdes", percentage: 85 },
      { name: "Mandarina", percentage: 80 },
    ],
    heart: [
      { name: "Melón", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Grosellas Negras", percentage: 78 },
      { name: "Piña", percentage: 72 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Petitgrain", percentage: 78 },
      { name: "Gálbano", percentage: 72 },
      { name: "Vainilla", percentage: 68 },
    ],
  },
  // 37 (14). Lattafa Bade'e Al Oud Amethyst — CORREGIDO: notas de Fragrantica (Rosas dominantes en corazón, Oud más fuerte que Ámbar)
  14: {
    top: [
      { name: "Pimienta Rosa", percentage: 90 },
      { name: "Bergamota", percentage: 82 },
    ],
    heart: [
      { name: "Rosa Turca", percentage: 98 },
      { name: "Rosa de Bulgaria", percentage: 92 },
      { name: "Jazmín", percentage: 72 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 92 },
      { name: "Ámbar", percentage: 78 },
      { name: "Vainilla", percentage: 68 },
    ],
  },
  // 38 (15). Lattafa Bade'e Al Oud Oud for Glory — CORREGIDO: notas de Fragrantica (Oud repetido en corazón y base)
  15: {
    top: [
      { name: "Azafrán", percentage: 95 },
      { name: "Nuez Moscada", percentage: 88 },
      { name: "Lavanda", percentage: 78 },
    ],
    heart: [
      { name: "Madera de Oud", percentage: 95 },
      { name: "Pachulí", percentage: 82 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 90 },
      { name: "Pachulí", percentage: 78 },
      { name: "Almizcle", percentage: 72 },
    ],
  },
  // 39 (16). Lattafa Bade'e Al Oud Honor & Glory — CORREGIDO: notas de Fragrantica (Cúrcuma antes de Pimienta Negra, Benjuí último en corazón)
  16: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Crème Brûlée", percentage: 90 },
    ],
    heart: [
      { name: "Canela", percentage: 88 },
      { name: "Cúrcuma", percentage: 72 },
      { name: "Pimienta Negra", percentage: 65 },
      { name: "Benjuí", percentage: 60 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Sándalo", percentage: 80 },
      { name: "Cachemira", percentage: 75 },
      { name: "Musgo", percentage: 60 },
    ],
  },
  // 40 (18). Lattafa Eclaire Pistache — CORREGIDO: notas de Fragrantica (Crema Batida y Cacao co-dominantes en corazón, Pistacho no es "tostado")
  18: {
    top: [
      { name: "Crema de Pistacho", percentage: 95 },
      { name: "Pistacho", percentage: 88 },
    ],
    heart: [
      { name: "Crema Batida", percentage: 92 },
      { name: "Cacao", percentage: 90 },
      { name: "Coco", percentage: 78 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Leche", percentage: 85 },
      { name: "Almizcle", percentage: 68 },
    ],
  },

  // ─── Páginas 3-4: Lattafa ───

  // 41 (19). Lattafa Eclaire Banoffi — CORREGIDO: notas de Fragrantica (Vainilla más dominante en corazón, Galleta como Bizcocho)
  19: {
    top: [
      { name: "Plátano", percentage: 95 },
      { name: "Dulce de Leche", percentage: 90 },
    ],
    heart: [
      { name: "Vainilla", percentage: 92 },
      { name: "Crema Batida", percentage: 88 },
    ],
    base: [
      { name: "Bizcocho", percentage: 85 },
      { name: "Praliné", percentage: 82 },
      { name: "Almizcle", percentage: 68 },
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
  // 43 (21). Lattafa Fakhar Black — CORREGIDO: notas de Fragrantica (Manzana dominante, Bergamota 2da, Cedro antes de Amberwood en base)
  21: {
    top: [
      { name: "Manzana", percentage: 95 },
      { name: "Bergamota", percentage: 88 },
      { name: "Jengibre", percentage: 82 },
    ],
    heart: [
      { name: "Lavanda", percentage: 92 },
      { name: "Salvia", percentage: 82 },
      { name: "Bayas de Enebro", percentage: 76 },
      { name: "Geranio", percentage: 68 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 88 },
      { name: "Cedro", percentage: 82 },
      { name: "Amberwood", percentage: 78 },
      { name: "Vetiver", percentage: 68 },
    ],
  },
  // 44 (22). Lattafa Fakhar Rose — CORREGIDO: notas de Fragrantica (Jazmín co-dominante con Nardos, Ylang-Ylang antes de Rosa y Madreselva)
  22: {
    top: [
      { name: "Notas Afrutadas", percentage: 92 },
      { name: "Azucena", percentage: 85 },
      { name: "Granada", percentage: 78 },
      { name: "Aldehídos", percentage: 62 },
    ],
    heart: [
      { name: "Nardos", percentage: 95 },
      { name: "Jazmín", percentage: 95 },
      { name: "Gardenia", percentage: 82 },
      { name: "Ylang-Ylang", percentage: 75 },
      { name: "Rosa", percentage: 72 },
      { name: "Madreselva", percentage: 72 },
      { name: "Peonía", percentage: 68 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Almizcle Blanco", percentage: 82 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ambroxan", percentage: 68 },
    ],
  },
  // 45 (103). Lattafa Qaed Al Fursan — CORREGIDO: notas de Fragrantica (Abeto antes de Jazmín en corazón, Cedro antes de Ámbar en base)
  103: {
    top: [
      { name: "Piña", percentage: 98 },
      { name: "Azafrán", percentage: 82 },
    ],
    heart: [
      { name: "Abeto", percentage: 78 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Cedro", percentage: 85 },
      { name: "Ámbar", percentage: 82 },
      { name: "Madera de Oud", percentage: 72 },
    ],
  },
  // 46 (25). Lattafa Qaed Al Fursan Untamed — CORREGIDO: notas de Fragrantica (Canela-Cardamomo-Mandarina co-dominantes, Caramelo y Cedro más fuertes)
  25: {
    top: [
      { name: "Canela", percentage: 95 },
      { name: "Cardamomo", percentage: 95 },
      { name: "Mandarina", percentage: 92 },
      { name: "Nuez Moscada", percentage: 82 },
    ],
    heart: [
      { name: "Caramelo", percentage: 92 },
      { name: "Lavanda", percentage: 85 },
      { name: "Salvia Esclarea", percentage: 78 },
      { name: "Geranio", percentage: 72 },
      { name: "Ciprés", percentage: 65 },
    ],
    base: [
      { name: "Ámbar", percentage: 92 },
      { name: "Cedro", percentage: 88 },
      { name: "Olíbano", percentage: 82 },
      { name: "Ládano", percentage: 75 },
      { name: "Vetiver", percentage: 70 },
    ],
  },
  // 47 (26). Lattafa Qaed Al Fursan Unlimited — CORREGIDO: notas de Fragrantica (Piña antes de Cítricos en salida, Frangipani antes de Jazmín en corazón, Notas Dulces en base)
  26: {
    top: [
      { name: "Coco", percentage: 95 },
      { name: "Piña", percentage: 82 },
      { name: "Cítricos", percentage: 78 },
    ],
    heart: [
      { name: "Ylang-Ylang", percentage: 85 },
      { name: "Frangipani", percentage: 80 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 92 },
      { name: "Almizcle", percentage: 85 },
      { name: "Sándalo", percentage: 78 },
      { name: "Notas Dulces", percentage: 68 },
    ],
  },
  // 48 (27). Lattafa Hayaati Florence — CORREGIDO: notas de Lattafa oficial + acordes Fragrantica (sin pirámide tradicional en Fragrantica, se mantiene oficial)
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
  // 49 (142). Lattafa Hayaati Gold Elixir — CORREGIDO: notas de Fragrantica (Cuero 100% en corazón, Vainilla y Ámbar más fuertes en base)
  142: {
    top: [
      { name: "Bergamota", percentage: 88 },
      { name: "Toronja", percentage: 85 },
      { name: "Grosella Negra", percentage: 78 },
    ],
    heart: [
      { name: "Cuero", percentage: 95 },
      { name: "Melocotón", percentage: 85 },
      { name: "Azafrán", percentage: 82 },
    ],
    base: [
      { name: "Vainilla", percentage: 92 },
      { name: "Ámbar", percentage: 90 },
      { name: "Almizcle", percentage: 82 },
      { name: "Vetiver", percentage: 72 },
    ],
  },
  // 50 (146). Lattafa Hayaati — CORREGIDO: notas de Fragrantica (Canela 96% en corazón, Almizcle 96% en base)
  146: {
    top: [
      { name: "Manzana", percentage: 92 },
      { name: "Bergamota", percentage: 82 },
    ],
    heart: [
      { name: "Canela", percentage: 92 },
      { name: "Notas de Madera", percentage: 72 },
    ],
    base: [
      { name: "Almizcle", percentage: 92 },
      { name: "Vainilla", percentage: 80 },
    ],
  },
  // 51 (147). Lattafa Hayaati Al Maleky — CORREGIDO: notas de Fragrantica (Pimienta Rosa-Bergamota-Jengibre co-dominantes, Almizcle y Ambargris más fuertes en base)
  147: {
    top: [
      { name: "Pimienta Rosa", percentage: 95 },
      { name: "Bergamota", percentage: 95 },
      { name: "Jengibre", percentage: 95 },
      { name: "Nuez Moscada", percentage: 85 },
    ],
    heart: [
      { name: "Cedro", percentage: 88 },
      { name: "Notas Amaderadas", percentage: 82 },
      { name: "Incienso", percentage: 78 },
      { name: "Ládano", percentage: 72 },
    ],
    base: [
      { name: "Almizcle", percentage: 95 },
      { name: "Ambargris", percentage: 92 },
      { name: "Ámbar", percentage: 88 },
    ],
  },
  // 52 (148). Lattafa Vintage Radio — CORREGIDO: sin Jengibre (no está en Fragrantica), notas reales verificadas
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
    ],
    base: [
      { name: "Sándalo", percentage: 90 },
      { name: "Madera de Agar / Oud", percentage: 80 },
    ],
  },
  // 53 (149). Lattafa Emeer — CORREGIDO: base completa con Cashmeran y Pachulí (verificado Fragrantica: Ambergris, Cedarwood, Cashmeran, Patchouli)
  149: {
    top: [
      { name: "Limón", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Salvia", percentage: 80 },
      { name: "Enebro", percentage: 75 },
    ],
    heart: [
      { name: "Té Blanco", percentage: 85 },
      { name: "Sándalo", percentage: 80 },
      { name: "Cardamomo", percentage: 75 },
      { name: "Olíbano", percentage: 65 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 90 },
      { name: "Cedro", percentage: 85 },
      { name: "Cashmeran", percentage: 75 },
      { name: "Pachulí", percentage: 70 },
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
  // 55 (29). Lattafa Asad Elixir — CORREGIDO: Ámbar→Ámbar Ligero (Light Amber en Fragrantica)
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
      { name: "Ámbar Ligero", percentage: 85 },
      { name: "Olíbano", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
      { name: "Cashmeran", percentage: 70 },
    ],
  },
  // 56 (30). Lattafa Ansaam Gold — CORREGIDO: base en orden Fragrantica (Musk, Vanilla, Raspberry), corazón = Sweet Notes + Jasmine + Rose
  30: {
    top: [
      { name: "Mandarina", percentage: 90 },
      { name: "Pera", percentage: 80 },
    ],
    heart: [
      { name: "Notas Dulces", percentage: 90 },
      { name: "Jazmín", percentage: 80 },
      { name: "Rosa", percentage: 70 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
      { name: "Frambuesa", percentage: 75 },
    ],
  },
  // 57 (31). Lattafa Ansaam Silver — CORREGIDO: Lavanda antes que Davana, Vainilla>Ámbar>Pachulí en base
  31: {
    top: [
      { name: "Cardamomo", percentage: 90 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Lavanda", percentage: 85 },
      { name: "Davana", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Ámbar", percentage: 80 },
      { name: "Pachulí", percentage: 75 },
    ],
  },
  // 58 (32). Lattafa Shaheen Gold — CORREGIDO: orden base Vainilla>Pachulí>Haba Tonka
  32: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Toronja", percentage: 80 },
    ],
    heart: [
      { name: "Higo", percentage: 85 },
      { name: "Lavanda", percentage: 70 },
    ],
    base: [
      { name: "Vainilla", percentage: 85 },
      { name: "Pachulí", percentage: 80 },
      { name: "Haba Tonka", percentage: 70 },
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
  // 60 (34). Lattafa Hala — CORREGIDO: Pimienta antes que Nuez Moscada, Ámbar en corazón (no base), base=Incienso+Ládano
  34: {
    top: [
      { name: "Pimienta", percentage: 90 },
      { name: "Nuez Moscada", percentage: 80 },
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
  // 63 (37). Lattafa Ta'weel — CORREGIDO: corazón=Flor de Azahar+Lavanda (Fragrantica), base=Ambroxan+Vetiver+Pachulí+Cuero
  37: {
    top: [
      { name: "Jengibre", percentage: 90 },
      { name: "Bergamota", percentage: 80 },
      { name: "Enebro", percentage: 75 },
      { name: "Nuez Moscada", percentage: 70 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 85 },
      { name: "Lavanda", percentage: 80 },
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
  // 65 (39). Lattafa Musamam White Intense — CORREGIDO: Mahonial en corazón, base=Sándalo+Almizcle+Benjuí
  39: {
    top: [
      { name: "Especias", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
      { name: "Naranja", percentage: 75 },
    ],
    heart: [
      { name: "Coco", percentage: 90 },
      { name: "Ylang-Ylang", percentage: 80 },
      { name: "Ambroxan", percentage: 75 },
      { name: "Mahonial", percentage: 65 },
    ],
    base: [
      { name: "Sándalo", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Benjuí", percentage: 70 },
    ],
  },
  // 66 (40). Lattafa Victoria — CORREGIDO: Fragrantica=3 notas (Lemon Meringue Pie, Neroli, Vanilla)
  40: {
    top: [
      { name: "Tarta de Merengue de Limón", percentage: 95 },
    ],
    heart: [
      { name: "Neroli", percentage: 85 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
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
  // 68 (42). Lattafa Vanilla Freak — CORREGIDO: Mantequilla en base (Fragrantica: Butter, Vanilla, Musk)
  42: {
    top: [
      { name: "Cupcake", percentage: 95 },
    ],
    heart: [
      { name: "Azúcar", percentage: 85 },
      { name: "Glaseado", percentage: 80 },
      { name: "Almendra", percentage: 75 },
      { name: "Canela", percentage: 70 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Mantequilla", percentage: 80 },
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
  // 72 (46). Lattafa Whipped Pleasure — CORREGIDO: base sin Ambrofix (Fragrantica: Tonka, Musk, Benzoin)
  46: {
    top: [
      { name: "Caramelo", percentage: 90 },
      { name: "Palomitas", percentage: 85 },
      { name: "Caramelo Salado", percentage: 80 },
    ],
    heart: [
      { name: "Leche", percentage: 85 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Benjuí", percentage: 70 },
    ],
  },
  // 73 (47). Lattafa The Kingdom Woman — CORREGIDO: Fragrantica=Pera+Peonía+Cassis, Praliné+Tonka+Jazmín, Vainilla+Almizcle+Sándalo+Ámbar
  47: {
    top: [
      { name: "Pera", percentage: 90 },
      { name: "Peonía", percentage: 80 },
      { name: "Grosella Negra", percentage: 75 },
    ],
    heart: [
      { name: "Praliné", percentage: 85 },
      { name: "Habas Tonka", percentage: 80 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 80 },
      { name: "Sándalo", percentage: 75 },
      { name: "Ámbar", percentage: 70 },
    ],
  },
  // 74 (48). Lattafa The Kingdom Men — CORREGIDO: corazón=Vainilla+Tabaco+Flor de Azahar (Fragrantica), base=Tonka+Benjuí+Ládano
  48: {
    top: [
      { name: "Lavanda", percentage: 90 },
      { name: "Menta", percentage: 85 },
      { name: "Salvia", percentage: 80 },
    ],
    heart: [
      { name: "Vainilla", percentage: 85 },
      { name: "Tabaco", percentage: 80 },
      { name: "Flor de Azahar", percentage: 75 },
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
  // 76 (50). Lattafa Efeef — CORREGIDO: Fragrantica=Melocotón+Pimienta Rosa+Bergamota, Tuberosa+Azahar+Jazmín, Ámbar+Praliné+Sándalo+Pachulí
  50: {
    top: [
      { name: "Melocotón", percentage: 90 },
      { name: "Pimienta Rosa", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Tuberosa", percentage: 85 },
      { name: "Flor de Azahar", percentage: 80 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Ámbar", percentage: 85 },
      { name: "Praliné", percentage: 80 },
      { name: "Sándalo", percentage: 75 },
      { name: "Pachulí", percentage: 70 },
    ],
  },
  // 77 (51). Lattafa Al Noble Safeer — CORREGIDO: notas de Fragrantica (añadido Aceite de Cipriol en base)
  51: {
    top: [
      { name: "Toronja", percentage: 100 },
      { name: "Bergamota", percentage: 100 },
      { name: "Jengibre", percentage: 99 },
      { name: "Pimienta Negra", percentage: 93 },
    ],
    heart: [
      { name: "Caramelo", percentage: 99 },
      { name: "Jazmín", percentage: 85 },
      { name: "Heliotropo", percentage: 74 },
    ],
    base: [
      { name: "Madera de Gaïac", percentage: 96 },
      { name: "Almizcle", percentage: 92 },
      { name: "Aceite de Cipriol", percentage: 89 },
      { name: "Ámbar Gris", percentage: 80 },
      { name: "Cachemira", percentage: 75 },
    ],
  },
  // 78 (52). Lattafa Al Noble Ameer — CORREGIDO: notas de Fragrantica (Pimienta Rosa primera en salida)
  52: {
    top: [
      { name: "Pimienta Rosa", percentage: 92 },
      { name: "Manzana", percentage: 89 },
      { name: "Romero", percentage: 85 },
    ],
    heart: [
      { name: "Clavo de Olor", percentage: 100 },
      { name: "Notas Florales", percentage: 74 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 100 },
      { name: "Pachulí", percentage: 85 },
      { name: "Ládano", percentage: 84 },
      { name: "Vetiver", percentage: 77 },
      { name: "Ciprés", percentage: 77 },
    ],
  },
  // 79 (53). Lattafa Al Noble Wazeer — CORREGIDO: notas de Fragrantica
  53: {
    top: [
      { name: "Coñac", percentage: 93 },
      { name: "Azafrán", percentage: 87 },
      { name: "Nuez Moscada", percentage: 83 },
      { name: "Manzana", percentage: 79 },
    ],
    heart: [
      { name: "Cedro", percentage: 100 },
      { name: "Sándalo", percentage: 100 },
      { name: "Whisky", percentage: 89 },
      { name: "Roble", percentage: 86 },
    ],
    base: [
      { name: "Mirra", percentage: 85 },
      { name: "Ambroxan", percentage: 82 },
      { name: "Vainilla", percentage: 80 },
      { name: "Almizcle", percentage: 74 },
    ],
  },
  // 80 (54). Lattafa Her Confession — CORREGIDO: notas de Fragrantica
  54: {
    top: [
      { name: "Canela", percentage: 85 },
      { name: "Mystikal", percentage: 81 },
    ],
    heart: [
      { name: "Tuberosa", percentage: 100 },
      { name: "Jazmín", percentage: 96 },
      { name: "Incienso", percentage: 89 },
      { name: "Mahonial", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Almizcle", percentage: 100 },
      { name: "Haba Tonka", percentage: 97 },
    ],
  },

  // ─── Páginas 5-6 ───

  // 81 (55). Lattafa His Confession — CORREGIDO: notas de Fragrantica (Lavanda primera en salida, añadido Pachulí en base)
  55: {
    top: [
      { name: "Lavanda", percentage: 97 },
      { name: "Canela", percentage: 96 },
      { name: "Mandarina", percentage: 77 },
    ],
    heart: [
      { name: "Iris", percentage: 100 },
      { name: "Benjuí", percentage: 94 },
      { name: "Ciprés", percentage: 78 },
      { name: "Mahonial", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Haba Tonka", percentage: 100 },
      { name: "Ámbar", percentage: 96 },
      { name: "Incienso", percentage: 89 },
      { name: "Cedro", percentage: 87 },
      { name: "Pachulí", percentage: 79 },
    ],
  },
  // 82 (56). Lattafa Ajwaa — CORREGIDO: notas de Fragrantica (Limón antes de Bergamota, orden corregido)
  56: {
    top: [
      { name: "Dátiles", percentage: 100 },
      { name: "Elemí", percentage: 95 },
      { name: "Limón", percentage: 79 },
      { name: "Bergamota", percentage: 74 },
    ],
    heart: [
      { name: "Regaliz", percentage: 100 },
      { name: "Mirra", percentage: 100 },
    ],
    base: [
      { name: "Benjuí", percentage: 94 },
      { name: "Incienso", percentage: 92 },
    ],
  },
  // 83 (57). Lattafa Sehr — CORREGIDO: notas de Fragrantica (Pomarose antes de Jazmín, Haba Tonka antes de Ámbar)
  57: {
    top: [
      { name: "Almendra Amarga", percentage: 100 },
      { name: "Canela", percentage: 95 },
    ],
    heart: [
      { name: "Akigalawood", percentage: 100 },
      { name: "Pomarose", percentage: 75 },
      { name: "Jazmín", percentage: 74 },
    ],
    base: [
      { name: "Vainilla Absoluto", percentage: 100 },
      { name: "Haba Tonka", percentage: 97 },
      { name: "Ámbar", percentage: 88 },
    ],
  },
  // 84 (58). Lattafa Habik Woman — CORREGIDO: notas de Fragrantica
  58: {
    top: [
      { name: "Pera", percentage: 100 },
      { name: "Bergamota", percentage: 96 },
    ],
    heart: [
      { name: "Lirio del Valle", percentage: 100 },
      { name: "Jazmín", percentage: 98 },
      { name: "Fresia", percentage: 96 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ámbar", percentage: 86 },
      { name: "Musgo de Roble", percentage: 74 },
    ],
  },
  // 85 (59). Lattafa Eternal Vanille — CORREGIDO: notas de Fragrantica (reordenada base)
  59: {
    top: [
      { name: "Zarzamora", percentage: 74 },
    ],
    heart: [
      { name: "Cocoapulse", percentage: 100 },
      { name: "Caviar de Vainilla", percentage: 100 },
      { name: "Cacao", percentage: 96 },
    ],
    base: [
      { name: "Akigalawood", percentage: 100 },
      { name: "Haba Tonka", percentage: 92 },
      { name: "Ambrofix", percentage: 91 },
      { name: "Cedro", percentage: 87 },
      { name: "Benjuí", percentage: 87 },
      { name: "Almizcle", percentage: 85 },
    ],
  },
  // 86 (60). Lattafa Jassoor — CORREGIDO: notas de Fragrantica (Cardamomo antes de Bergamota, Haba Tonka primera en base)
  60: {
    top: [
      { name: "Manzana", percentage: 100 },
      { name: "Cardamomo", percentage: 97 },
      { name: "Bergamota", percentage: 84 },
    ],
    heart: [
      { name: "Tabaco", percentage: 100 },
      { name: "Lavanda", percentage: 100 },
      { name: "Geranio", percentage: 74 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 93 },
      { name: "Cuero", percentage: 78 },
      { name: "Pachulí", percentage: 75 },
      { name: "Vetiver", percentage: 75 },
    ],
  },
  // 87 (61). Lattafa Dynasty — CORREGIDO: notas de Fragrantica
  61: {
    top: [
      { name: "Bergamota", percentage: 100 },
      { name: "Jengibre", percentage: 98 },
      { name: "Salvia Esclarea", percentage: 83 },
      { name: "Frambuesa", percentage: 79 },
      { name: "Nuez Moscada", percentage: 74 },
    ],
    heart: [
      { name: "Té Rooibos", percentage: 100 },
      { name: "Ante / Gamuza", percentage: 87 },
    ],
    base: [
      { name: "Cedro", percentage: 85 },
      { name: "Cachemira", percentage: 80 },
      { name: "Amberwood", percentage: 76 },
    ],
  },
  // 88 (62). Lattafa Velvet Rose — CORREGIDO: notas de Fragrantica
  62: {
    top: [
      { name: "Rosa", percentage: 100 },
      { name: "Pachulí", percentage: 93 },
    ],
    heart: [
      { name: "Almizcle", percentage: 88 },
      { name: "Ládano", percentage: 74 },
    ],
    base: [
      { name: "Almizcle", percentage: 88 },
      { name: "Ámbar", percentage: 75 },
    ],
  },
  // 89 (63). Lattafa Petra — CORREGIDO: notas de Fragrantica
  63: {
    top: [
      { name: "Ron", percentage: 100 },
      { name: "Ciruela", percentage: 100 },
    ],
    heart: [
      { name: "Tuberosa", percentage: 100 },
      { name: "Coco", percentage: 100 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle", percentage: 86 },
      { name: "Praliné", percentage: 74 },
    ],
  },
  // 90 (64). Lattafa Atheeri — CORREGIDO: notas de Fragrantica
  64: {
    top: [
      { name: "Flor de la Pasión", percentage: 100 },
      { name: "Gotas de Rocío", percentage: 95 },
    ],
    heart: [
      { name: "Orquídea", percentage: 100 },
      { name: "Jazmín", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Amberwood", percentage: 86 },
    ],
  },
  // 91 (65). Lattafa Sakeena — CORREGIDO: notas de Fragrantica (Notas Ozónicas antes de Mandarina, Toffee antes de Praliné)
  65: {
    top: [
      { name: "Fruta de la Pasión", percentage: 100 },
      { name: "Notas Ozónicas", percentage: 79 },
      { name: "Mandarina", percentage: 75 },
    ],
    heart: [
      { name: "Frambuesa", percentage: 100 },
      { name: "Rosa", percentage: 88 },
      { name: "Flor de Azahar", percentage: 75 },
      { name: "Sal Marina", percentage: 74 },
    ],
    base: [
      { name: "Toffee", percentage: 95 },
      { name: "Praliné", percentage: 93 },
      { name: "Vainilla", percentage: 92 },
      { name: "Almizcle", percentage: 80 },
    ],
  },
  // 92 (66). Lattafa Emaan — CORREGIDO: notas de Fragrantica (Flor de Azahar primera en salida)
  66: {
    top: [
      { name: "Flor de Azahar", percentage: 100 },
      { name: "Grosellas Negras", percentage: 94 },
      { name: "Bergamota", percentage: 93 },
    ],
    heart: [
      { name: "Tuberosa", percentage: 100 },
      { name: "Jazmín", percentage: 100 },
      { name: "Caléndula", percentage: 77 },
    ],
    base: [
      { name: "Almizcle", percentage: 88 },
      { name: "Vainilla", percentage: 84 },
      { name: "Cedro", percentage: 76 },
      { name: "Pachulí", percentage: 74 },
    ],
  },
  // 93 (67). Lattafa Qimmah — CORREGIDO: notas de Fragrantica (Vainilla primera en base, Jazmín/Tuberosa 100%)
  67: {
    top: [
      { name: "Almendra", percentage: 100 },
      { name: "Café", percentage: 74 },
    ],
    heart: [
      { name: "Jazmín", percentage: 100 },
      { name: "Tuberosa", percentage: 100 },
      { name: "Haba Tonka", percentage: 95 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Cacao", percentage: 86 },
      { name: "Sándalo", percentage: 84 },
    ],
  },
  // 94 (68). Lattafa Ameer Al Oudh Intense Oud — CORREGIDO: notas de Fragrantica (Notas Amaderadas primera en salida, todos 100%)
  68: {
    top: [
      { name: "Notas Amaderadas", percentage: 100 },
      { name: "Madera de Oud", percentage: 100 },
    ],
    heart: [
      { name: "Azúcar", percentage: 100 },
      { name: "Vainilla", percentage: 100 },
    ],
    base: [
      { name: "Madera de Oud", percentage: 100 },
      { name: "Sándalo", percentage: 96 },
      { name: "Notas Herbales", percentage: 74 },
    ],
  },
  // 95 (69). Lattafa Maahir — CORREGIDO: notas de Fragrantica (Bayas Rojas primera en salida, base 100%)
  69: {
    top: [
      { name: "Bayas Rojas", percentage: 88 },
      { name: "Melocotón", percentage: 85 },
      { name: "Bergamota", percentage: 74 },
    ],
    heart: [
      { name: "Jazmín", percentage: 94 },
      { name: "Peonía", percentage: 90 },
      { name: "Lirio Rojo", percentage: 88 },
    ],
    base: [
      { name: "Sándalo", percentage: 100 },
      { name: "Flor de Vainilla", percentage: 100 },
      { name: "Almizcle", percentage: 100 },
    ],
  },
  // 96 (70). Lattafa Maahir Black Edition — CORREGIDO: notas de Fragrantica (base con 3 notas al 100%)
  70: {
    top: [
      { name: "Pimienta Negra", percentage: 100 },
      { name: "Pimienta Rosa", percentage: 90 },
      { name: "Azafrán", percentage: 86 },
    ],
    heart: [
      { name: "Aceite de Cade / Humo", percentage: 100 },
      { name: "Ládano", percentage: 99 },
      { name: "Bálsamo de Gurjun", percentage: 94 },
      { name: "Ruibarbo", percentage: 74 },
    ],
    base: [
      { name: "Cuero", percentage: 100 },
      { name: "Cedro", percentage: 100 },
      { name: "Madera de Guayaco", percentage: 100 },
      { name: "Pachulí", percentage: 95 },
      { name: "Musgo", percentage: 86 },
      { name: "Almizcle", percentage: 83 },
    ],
  },
  // 97 (71). Lattafa Maahir Legacy — CORREGIDO: notas de Fragrantica (Menta 100%, Incienso en corazón)
  71: {
    top: [
      { name: "Lima", percentage: 100 },
      { name: "Menta", percentage: 100 },
      { name: "Toronja", percentage: 96 },
      { name: "Lavanda", percentage: 90 },
      { name: "Piña", percentage: 81 },
    ],
    heart: [
      { name: "Pimienta Negra", percentage: 87 },
      { name: "Romero", percentage: 84 },
      { name: "Baya de Enebro", percentage: 83 },
      { name: "Geranio", percentage: 76 },
      { name: "Incienso", percentage: 74 },
    ],
    base: [
      { name: "Ambroxan", percentage: 92 },
      { name: "Vetiver", percentage: 80 },
      { name: "Musgo de Roble", percentage: 79 },
      { name: "Haba Tonka", percentage: 77 },
      { name: "Cachemira", percentage: 76 },
    ],
  },
  // 98 (72). Lattafa Ramz Silver — CORREGIDO: notas de Fragrantica (Vainilla 100% en base)
  72: {
    top: [
      { name: "Pera", percentage: 100 },
      { name: "Lavanda", percentage: 93 },
      { name: "Menta", percentage: 84 },
      { name: "Bergamota", percentage: 83 },
    ],
    heart: [
      { name: "Cardamomo", percentage: 83 },
      { name: "Salvia", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Ámbar", percentage: 89 },
      { name: "Almizcle", percentage: 83 },
      { name: "Pachulí", percentage: 77 },
    ],
  },
  // 99 (73). Lattafa Ramz Gold — CORREGIDO: notas de Fragrantica (Manzana primera, Jazmín Sambac, Almizcle Blanco, Sándalo primera en base)
  73: {
    top: [
      { name: "Manzana", percentage: 100 },
      { name: "Melocotón", percentage: 94 },
      { name: "Grosellas Negras", percentage: 84 },
      { name: "Pera", percentage: 83 },
      { name: "Naranja Dulce", percentage: 74 },
    ],
    heart: [
      { name: "Rosa", percentage: 100 },
      { name: "Jazmín Sambac", percentage: 100 },
      { name: "Flor de Azahar", percentage: 80 },
    ],
    base: [
      { name: "Sándalo", percentage: 100 },
      { name: "Almizcle Blanco", percentage: 100 },
      { name: "Vainilla", percentage: 93 },
      { name: "Pachulí", percentage: 92 },
    ],
  },
  // 100 (74). Lattafa Najdia — CORREGIDO: notas de Fragrantica (Manzana y Canela 100% en salida, Notas Acuáticas en corazón)
  74: {
    top: [
      { name: "Limón", percentage: 100 },
      { name: "Manzana", percentage: 100 },
      { name: "Canela", percentage: 100 },
      { name: "Hierba Limón", percentage: 96 },
      { name: "Bergamota", percentage: 95 },
    ],
    heart: [
      { name: "Notas Acuáticas", percentage: 100 },
      { name: "Lavanda", percentage: 99 },
      { name: "Cardamomo", percentage: 83 },
      { name: "Romero", percentage: 83 },
    ],
    base: [
      { name: "Almizcle", percentage: 96 },
      { name: "Ámbar", percentage: 92 },
      { name: "Sándalo", percentage: 85 },
      { name: "Cedro", percentage: 83 },
      { name: "Tabaco", percentage: 74 },
    ],
  },
  // 101 (75). Lattafa Suqraat — CORREGIDO: notas de Fragrantica (Jengibre 100% en salida, Almizcle primera en base)
  75: {
    top: [
      { name: "Bergamota", percentage: 100 },
      { name: "Jengibre", percentage: 100 },
    ],
    heart: [
      { name: "Lavanda", percentage: 92 },
      { name: "Hojas de Violeta", percentage: 88 },
    ],
    base: [
      { name: "Almizcle", percentage: 96 },
      { name: "Sándalo", percentage: 81 },
      { name: "Ámbar", percentage: 74 },
    ],
  },
  // 102 (128). Lattafa Khamrah — CORREGIDO: notas de Fragrantica (Canela 100%, Tuberosa en corazón)
  128: {
    top: [
      { name: "Canela", percentage: 100 },
      { name: "Nuez Moscada", percentage: 92 },
      { name: "Bergamota", percentage: 74 },
    ],
    heart: [
      { name: "Dátiles", percentage: 100 },
      { name: "Praliné", percentage: 99 },
      { name: "Tuberosa", percentage: 75 },
      { name: "Mahonial", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Haba Tonka", percentage: 95 },
      { name: "Amberwood", percentage: 89 },
      { name: "Mirra", percentage: 85 },
      { name: "Benjuí", percentage: 84 },
      { name: "Akigalawood", percentage: 82 },
    ],
  },
  // 103 (129). Lattafa Khamrah Qahwa — CORREGIDO: notas de Fragrantica (Café 100% en base, Vainilla 100%)
  129: {
    top: [
      { name: "Canela", percentage: 100 },
      { name: "Cardamomo", percentage: 92 },
      { name: "Jengibre", percentage: 80 },
    ],
    heart: [
      { name: "Praliné", percentage: 100 },
      { name: "Frutas Escarchadas", percentage: 90 },
      { name: "Flores Blancas", percentage: 74 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Café Arabica", percentage: 100 },
      { name: "Haba Tonka", percentage: 94 },
      { name: "Benjuí", percentage: 83 },
      { name: "Almizcle", percentage: 81 },
    ],
  },
  // 104 (130). Lattafa Khamrah Dukhan — CORREGIDO: notas de Fragrantica (Praliné y Tabaco dominan base)
  130: {
    top: [
      { name: "Especias Ahumadas", percentage: 100 },
      { name: "Pimiento", percentage: 96 },
      { name: "Mandarina", percentage: 81 },
    ],
    heart: [
      { name: "Incienso", percentage: 97 },
      { name: "Ládano", percentage: 78 },
      { name: "Flor de Azahar", percentage: 77 },
      { name: "Pachulí", percentage: 74 },
    ],
    base: [
      { name: "Praliné", percentage: 100 },
      { name: "Tabaco", percentage: 99 },
      { name: "Ámbar", percentage: 95 },
      { name: "Haba Tonka", percentage: 94 },
      { name: "Benjuí", percentage: 89 },
    ],
  },
  // 105 (131). Lattafa Yara — CORREGIDO: notas de Fragrantica (Vainilla 100% y Almizcle 94% en base)
  131: {
    top: [
      { name: "Orquídea", percentage: 91 },
      { name: "Heliotropo", percentage: 86 },
      { name: "Mandarina", percentage: 78 },
    ],
    heart: [
      { name: "Acorde Gourmand", percentage: 100 },
      { name: "Frutas Tropicales", percentage: 96 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Almizcle", percentage: 94 },
      { name: "Sándalo", percentage: 74 },
    ],
  },
  // 106 (132). Lattafa Yara Tous — CORREGIDO: notas de Fragrantica (Mango y Coco 100%, Heliotropo en corazón)
  132: {
    top: [
      { name: "Mango", percentage: 100 },
      { name: "Coco", percentage: 100 },
      { name: "Fruta de la Pasión", percentage: 91 },
    ],
    heart: [
      { name: "Jazmín", percentage: 97 },
      { name: "Flor de Azahar", percentage: 87 },
      { name: "Heliotropo", percentage: 83 },
    ],
    base: [
      { name: "Vainilla", percentage: 96 },
      { name: "Almizcle", percentage: 83 },
      { name: "Cachemira", percentage: 74 },
    ],
  },
  // 107 (133). Lattafa Yara Moi — CORREGIDO: notas de Fragrantica (Jazmín primera en salida, Pachulí 99% en base)
  133: {
    top: [
      { name: "Jazmín", percentage: 100 },
      { name: "Melocotón", percentage: 91 },
    ],
    heart: [
      { name: "Caramelo", percentage: 88 },
      { name: "Ámbar", percentage: 74 },
    ],
    base: [
      { name: "Pachulí", percentage: 99 },
      { name: "Sándalo", percentage: 87 },
    ],
  },
  // 108 (134). Lattafa Asad — CORREGIDO: notas de Fragrantica (Tabaco 99%, Vainilla y Ámbar 100% en base, Maderas Secas 98%)
  134: {
    top: [
      { name: "Pimienta Negra", percentage: 100 },
      { name: "Tabaco", percentage: 99 },
      { name: "Piña", percentage: 81 },
    ],
    heart: [
      { name: "Pachulí", percentage: 86 },
      { name: "Café", percentage: 79 },
      { name: "Iris", percentage: 77 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Ámbar", percentage: 100 },
      { name: "Maderas Secas", percentage: 98 },
      { name: "Benjuí", percentage: 82 },
      { name: "Ládano", percentage: 74 },
    ],
  },
  // 109 (135). Lattafa Asad Bourbon — CORREGIDO: notas de Fragrantica (Vainilla Bourbon 100%, Cacao 100% en corazón)
  135: {
    top: [
      { name: "Lavanda", percentage: 100 },
      { name: "Mirabelle", percentage: 88 },
      { name: "Pimienta Rosa", percentage: 86 },
    ],
    heart: [
      { name: "Cacao", percentage: 100 },
      { name: "Nuez Moscada", percentage: 89 },
      { name: "Davana", percentage: 74 },
    ],
    base: [
      { name: "Vainilla Bourbon", percentage: 100 },
      { name: "Ámbar", percentage: 95 },
      { name: "Vetiver", percentage: 78 },
    ],
  },
  // 110 (136). Lattafa Asad Zanzibar — CORREGIDO: notas de Fragrantica (Agua de Coco e Iris 100%, Sal 89%)
  136: {
    top: [
      { name: "Lavanda", percentage: 95 },
      { name: "Pimienta Negra", percentage: 83 },
    ],
    heart: [
      { name: "Agua de Coco", percentage: 100 },
      { name: "Iris", percentage: 100 },
      { name: "Sal", percentage: 89 },
    ],
    base: [
      { name: "Vainilla", percentage: 100 },
      { name: "Incienso", percentage: 74 },
    ],
  },
  // 111 (150). Lattafa Opulent Dubai — CORREGIDO: notas de Fragrantica (Jengibre 88%, Benjuí y Musgo de Roble en base)
  150: {
    top: [
      { name: "Mango", percentage: 100 },
      { name: "Toronja", percentage: 94 },
      { name: "Limón", percentage: 93 },
      { name: "Jengibre", percentage: 88 },
    ],
    heart: [
      { name: "Jazmín", percentage: 82 },
      { name: "Cedro", percentage: 77 },
      { name: "Violeta", percentage: 75 },
    ],
    base: [
      { name: "Notas Amaderadas", percentage: 78 },
      { name: "Ámbar Gris", percentage: 75 },
      { name: "Benjuí", percentage: 74 },
      { name: "Musgo de Roble", percentage: 74 },
    ],
  },
  // 112 (76). French Avenue Liquid Brun — CORREGIDO: notas de Fragrantica
  76: {
    top: [
      { name: "Canela", percentage: 95 },
      { name: "Flor de Azahar del Naranjo", percentage: 85 },
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
      { name: "Madera de Gaiac", percentage: 80 },
      { name: "Almizcle", percentage: 70 },
    ],
  },
  // 113 (77). French Avenue Aether — CORREGIDO: notas de Fragrantica (Cedro antes de Petitgrain en corazón)
  77: {
    top: [
      { name: "Manzana Verde", percentage: 95 },
      { name: "Bergamota", percentage: 90 },
      { name: "Mandarina", percentage: 80 },
    ],
    heart: [
      { name: "Cedro", percentage: 85 },
      { name: "Petitgrain", percentage: 78 },
      { name: "Cachemira", percentage: 72 },
      { name: "Violeta", percentage: 62 },
    ],
    base: [
      { name: "Musgo de Roble", percentage: 85 },
      { name: "Almizcle", percentage: 80 },
      { name: "Amberwood", percentage: 75 },
    ],
  },
  // 114 (78). French Avenue Luscious — CORREGIDO: notas de Fragrantica
  78: {
    top: [
      { name: "Pistacho (Pistache)", percentage: 95 },
      { name: "Cardamomo", percentage: 85 },
      { name: "Bergamota", percentage: 80 },
    ],
    heart: [
      { name: "Cacahuates", percentage: 90 },
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
  // 119 (83). Afnan Supremacy Silver — CORREGIDO: notas de Fragrantica (Jazmín de Marruecos)
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
      { name: "Jazmín de Marruecos", percentage: 70 },
      { name: "Rosa", percentage: 60 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Musgo de Roble", percentage: 85 },
      { name: "Ámbar Gris", percentage: 75 },
      { name: "Vainilla", percentage: 65 },
    ],
  },
  // 120 (84). Afnan Supremacy Incense — CORREGIDO: notas de Fragrantica (Especias y Notas Herbales en salida, Opopónaco antes de Ámbar en corazón)
  84: {
    top: [
      { name: "Orégano", percentage: 95 },
      { name: "Especias", percentage: 85 },
      { name: "Notas Herbales", percentage: 78 },
      { name: "Bergamota", percentage: 72 },
    ],
    heart: [
      { name: "Opopónaco", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Ládano", percentage: 80 },
    ],
    base: [
      { name: "Humo", percentage: 92 },
      { name: "Madera de Oud", percentage: 88 },
      { name: "Cuero", percentage: 82 },
      { name: "Pachulí", percentage: 78 },
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
  // 122 (86). Afnan 9PM Rebel — CORREGIDO: notas de Fragrantica (Piña primero en salida)
  86: {
    top: [
      { name: "Piña", percentage: 92 },
      { name: "Manzana Granny Smith", percentage: 88 },
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
  // 124 (137). Afnan 9PM — CORREGIDO: notas de Fragrantica (Flor de Azahar del Naranjo, Lirio de los Valles)
  137: {
    top: [
      { name: "Manzana", percentage: 95 },
      { name: "Canela", percentage: 90 },
      { name: "Lavanda Silvestre", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Flor de Azahar del Naranjo", percentage: 90 },
      { name: "Lirio de los Valles (Muguete)", percentage: 85 },
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
  // 126 (139). Afnan 9PM Elixir — CORREGIDO: notas de Fragrantica (Pimienta de Jamaica en corazón, Heliántemo en base)
  139: {
    top: [
      { name: "Cardamomo", percentage: 95 },
      { name: "Nuez Moscada", percentage: 85 },
      { name: "Elemí", percentage: 75 },
    ],
    heart: [
      { name: "Pimienta de Jamaica", percentage: 90 },
      { name: "Cuero", percentage: 85 },
      { name: "Lavanda", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Pachulí", percentage: 85 },
      { name: "Ládano", percentage: 80 },
      { name: "Heliántemo", percentage: 70 },
    ],
  },
  // 127 (140). Afnan 9AM Dive — CORREGIDO: notas de Fragrantica (Jengibre e Incienso en corazón, Sándalo/Jazmín/Pachulí en base)
  140: {
    top: [
      { name: "Limón (Lima Ácida)", percentage: 95 },
      { name: "Menta", percentage: 90 },
      { name: "Grosellas Negras", percentage: 82 },
      { name: "Pimienta Rosa", percentage: 75 },
    ],
    heart: [
      { name: "Manzana", percentage: 85 },
      { name: "Cedro", percentage: 80 },
      { name: "Incienso", percentage: 75 },
      { name: "Jengibre", percentage: 72 },
    ],
    base: [
      { name: "Sándalo", percentage: 85 },
      { name: "Pachulí", percentage: 78 },
      { name: "Jazmín", percentage: 68 },
    ],
  },
  // 128 (152). Afnan Turathi Electric — CORREGIDO: notas de Fragrantica (Toronja Rosada, Flor de Azahar del Naranjo)
  152: {
    top: [
      { name: "Pera", percentage: 95 },
      { name: "Toronja (Pomelo) Rosada", percentage: 90 },
      { name: "Mandarina", percentage: 80 },
      { name: "Bergamota", percentage: 75 },
    ],
    heart: [
      { name: "Flor de Azahar del Naranjo", percentage: 90 },
      { name: "Manzana", percentage: 80 },
      { name: "Cedro", percentage: 75 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ámbar", percentage: 85 },
      { name: "Vainilla", percentage: 80 },
    ],
  },
  // 129 (153). Afnan Turathi Blue — CORREGIDO: notas de Fragrantica (Cítricos en salida, Especias en base)
  153: {
    top: [
      { name: "Cítricos", percentage: 95 },
    ],
    heart: [
      { name: "Ámbar", percentage: 90 },
      { name: "Notas Amaderadas", percentage: 85 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Especias", percentage: 82 },
      { name: "Pachulí", percentage: 78 },
    ],
  },

  // ─── Rave ───

  // 130 (88). Rave Now — CORREGIDO: notas de Fragrantica (Jazmín de Marruecos)
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
      { name: "Jazmín de Marruecos", percentage: 80 },
      { name: "Rosa", percentage: 70 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Vainilla", percentage: 85 },
      { name: "Musgo de Roble", percentage: 80 },
      { name: "Ámbar Gris", percentage: 75 },
    ],
  },
  // 131 (89). Rave Now Women — CORREGIDO: notas de Fragrantica (Frutas Rojas, Malvavisco/Bombón, Lirio de los Valles)
  89: {
    top: [
      { name: "Frutas Rojas", percentage: 90 },
      { name: "Naranja", percentage: 85 },
    ],
    heart: [
      { name: "Malvavisco (Bombón)", percentage: 95 },
      { name: "Jazmín", percentage: 80 },
      { name: "Lirio de los Valles (Muguete)", percentage: 75 },
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
  // 134 (93). Maison Alhambra Cassius — CORREGIDO: notas de Fragrantica (notas correctas)
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
  // 135 (94). Maison Alhambra The Tux — CORREGIDO: notas de Fragrantica (sin pirámide tradicional, solo ingredientes listados)
  94: {
    top: [
      { name: "Pachulí", percentage: 95 },
      { name: "Notas Especiadas", percentage: 85 },
      { name: "Notas Florales", percentage: 75 },
    ],
    heart: [
      { name: "Ámbar", percentage: 90 },
      { name: "Vainilla", percentage: 80 },
    ],
    base: [
      { name: "Ámbar Gris", percentage: 85 },
      { name: "Pachulí", percentage: 75 },
    ],
  },
  // 136 (95). Maison Alhambra Glacier Le Noir — CORREGIDO: notas de Fragrantica (sin pirámide tradicional, ingredientes: Cardamomo, Vainilla, Lavanda, Iris)
  95: {
    top: [
      { name: "Cardamomo", percentage: 95 },
      { name: "Lavanda", percentage: 88 },
    ],
    heart: [
      { name: "Iris", percentage: 90 },
      { name: "Lavanda", percentage: 80 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Notas Amaderadas", percentage: 85 },
    ],
  },
  // 137 (96). Maison Alhambra Céleste — CORREGIDO: notas de Fragrantica (notas correctas, Musgo en base confirmado)
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
  // 159 (158). Maison Alhambra Glacier Bella — VERIFICADO: notas de Fragrantica (pirámide plana: Pera Verde, Vainilla, Bergamota)
  158: {
    top: [
      { name: "Pera Verde", percentage: 90 },
      { name: "Bergamota", percentage: 70 },
    ],
    heart: [
      { name: "Vainilla", percentage: 88 },
    ],
    base: [
      { name: "Almizcle Blanco", percentage: 85 },
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
  // 146 (124). Rasasi Hawas Fire — CORREGIDO: notas de Fragrantica (Notas Marinas en salida y corazón)
  124: {
    top: [
      { name: "Salvia Esclarea", percentage: 95 },
      { name: "Notas Marinas", percentage: 85 },
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

  // ==================== DAVIDOFF ====================
  // 155. Davidoff Cool Water (Caballero) — Fragrantica ID 507
  155: {
    top: [
      { name: "Agua de Mar", percentage: 95 },
      { name: "Lavanda", percentage: 85 },
      { name: "Menta", percentage: 82 },
      { name: "Notas Verdes", percentage: 78 },
      { name: "Romero", percentage: 70 },
      { name: "Calone", percentage: 65 },
      { name: "Cilantro", percentage: 58 },
    ],
    heart: [
      { name: "Sándalo", percentage: 80 },
      { name: "Neroli", percentage: 78 },
      { name: "Geranio", percentage: 75 },
      { name: "Jazmín", percentage: 75 },
    ],
    base: [
      { name: "Almizcle", percentage: 85 },
      { name: "Musgo de Roble", percentage: 82 },
      { name: "Cedro", percentage: 78 },
      { name: "Tabaco", percentage: 75 },
      { name: "Ámbar Gris", percentage: 68 },
    ],
  },
  // 156. Davidoff Cool Water Woman (Dama) — Fragrantica ID 508
  156: {
    top: [
      { name: "Melón", percentage: 95 },
      { name: "Flor de Loto", percentage: 90 },
      { name: "Limón", percentage: 85 },
      { name: "Piña", percentage: 78 },
      { name: "Calone", percentage: 72 },
      { name: "Membrillo", percentage: 72 },
      { name: "Azucena", percentage: 68 },
      { name: "Grosella Negra", percentage: 62 },
    ],
    heart: [
      { name: "Flor de Loto", percentage: 90 },
      { name: "Nenúfar", percentage: 88 },
      { name: "Lirio de los Valles", percentage: 75 },
      { name: "Jazmín", percentage: 70 },
      { name: "Miel", percentage: 65 },
      { name: "Flor del Espino", percentage: 63 },
      { name: "Rosa", percentage: 62 },
    ],
    base: [
      { name: "Almizcle", percentage: 80 },
      { name: "Vetiver", percentage: 75 },
      { name: "Raíz de Violeta", percentage: 73 },
      { name: "Frambuesa", percentage: 72 },
      { name: "Melocotón", percentage: 72 },
      { name: "Zarzamora", percentage: 72 },
      { name: "Sándalo", percentage: 72 },
      { name: "Vainilla", percentage: 65 },
    ],
  },
  // 157. Davidoff Cool Water Intense (Caballero) — Fragrantica ID 55266
  157: {
    top: [
      { name: "Mandarina Verde", percentage: 95 },
    ],
    heart: [
      { name: "Néctar de Coco", percentage: 88 },
    ],
    base: [
      { name: "Ámbar", percentage: 95 },
    ],
  },

  // ─── JEAN PAUL GAULTIER ───
  // 159. Le Male Le Parfum — NOTAS DE FRAGRANTICA
  159: {
    top: [
      { name: "Cardamomo", percentage: 95 },
    ],
    heart: [
      { name: "Lavanda", percentage: 92 },
      { name: "Iris", percentage: 78 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
      { name: "Notas Orientales", percentage: 80 },
      { name: "Notas Amaderadas", percentage: 68 },
    ],
  },
  // 160. Le Beau Le Parfum — NOTAS DE FRAGRANTICA
  160: {
    top: [
      { name: "Piña", percentage: 90 },
      { name: "Iris", percentage: 82 },
      { name: "Jengibre", percentage: 75 },
      { name: "Ciprés", percentage: 65 },
    ],
    heart: [
      { name: "Coco", percentage: 92 },
      { name: "Notas Amaderadas", percentage: 72 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 90 },
      { name: "Sándalo", percentage: 82 },
      { name: "Ámbar", percentage: 75 },
      { name: "Ámbar Gris", percentage: 68 },
    ],
  },
  // 161. Le Male Elixir — NOTAS DE FRAGRANTICA
  161: {
    top: [
      { name: "Lavanda", percentage: 92 },
      { name: "Menta", percentage: 85 },
    ],
    heart: [
      { name: "Vainilla", percentage: 95 },
      { name: "Benjuí", percentage: 78 },
    ],
    base: [
      { name: "Miel", percentage: 92 },
      { name: "Haba Tonka", percentage: 85 },
      { name: "Tabaco", percentage: 80 },
    ],
  },
  // 162. Scandal Pour Homme — NOTAS DE FRAGRANTICA
  162: {
    top: [
      { name: "Mandarina", percentage: 92 },
      { name: "Salvia Esclarea", percentage: 78 },
    ],
    heart: [
      { name: "Caramelo", percentage: 95 },
      { name: "Haba Tonka", percentage: 82 },
    ],
    base: [
      { name: "Vetiver", percentage: 88 },
    ],
  },
  // 163. Le Beau — NOTAS DE FRAGRANTICA
  163: {
    top: [
      { name: "Bergamota", percentage: 92 },
    ],
    heart: [
      { name: "Coco", percentage: 95 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 95 },
    ],
  },
  // 164. Scandal (Mujer) — NOTAS DE FRAGRANTICA
  164: {
    top: [
      { name: "Naranja Sangre", percentage: 92 },
      { name: "Mandarina", percentage: 85 },
    ],
    heart: [
      { name: "Miel", percentage: 95 },
      { name: "Gardenia", percentage: 82 },
      { name: "Flor de Azahar", percentage: 75 },
      { name: "Jazmín", percentage: 68 },
      { name: "Melocotón", percentage: 60 },
    ],
    base: [
      { name: "Cera de Abeja", percentage: 88 },
      { name: "Caramelo", percentage: 82 },
      { name: "Pachulí", percentage: 72 },
      { name: "Regaliz", percentage: 62 },
    ],
  },
  // 165. Scandal Pour Homme Le Parfum — NOTAS DE FRAGRANTICA
  165: {
    top: [
      { name: "Geranio", percentage: 92 },
    ],
    heart: [
      { name: "Haba Tonka", percentage: 95 },
    ],
    base: [
      { name: "Sándalo", percentage: 95 },
    ],
  },
  // 166. Scandal Le Parfum (Mujer) — NOTAS DE FRAGRANTICA
  166: {
    top: [
      { name: "Jazmín", percentage: 95 },
    ],
    heart: [
      { name: "Caramelo", percentage: 90 },
      { name: "Sal", percentage: 72 },
    ],
    base: [
      { name: "Vainilla", percentage: 95 },
    ],
  },
  // 167. Sceptre Malachite (Maison Alhambra) — CORREGIDO: notas de Fragrantica
  167: {
    top: [
      { name: "Mandarina Verde", percentage: 95 },
      { name: "Bergamota", percentage: 82 },
      { name: "Grosella Negra", percentage: 70 },
    ],
    heart: [
      { name: "Notas Aromáticas", percentage: 88 },
      { name: "Notas Especiadas", percentage: 75 },
      { name: "Jazmín", percentage: 65 },
      { name: "Pimienta Rosa", percentage: 58 },
      { name: "Lavanda", percentage: 52 },
    ],
    base: [
      { name: "Ámbar", percentage: 92 },
      { name: "Almizcle", percentage: 80 },
      { name: "Notas Amaderadas", percentage: 72 },
      { name: "Vetiver", percentage: 65 },
    ],
  },
  // 168. Island (Khadlaj) — CORREGIDO: notas de Fragrantica
  168: {
    top: [
      { name: "Piña", percentage: 95 },
      { name: "Iris", percentage: 78 },
      { name: "Jengibre", percentage: 65 },
      { name: "Ciprés", percentage: 55 },
    ],
    heart: [
      { name: "Coco", percentage: 92 },
      { name: "Notas Amaderadas", percentage: 72 },
    ],
    base: [
      { name: "Haba Tonka", percentage: 88 },
      { name: "Sándalo", percentage: 78 },
      { name: "Ámbar", percentage: 68 },
      { name: "Ámbar Gris", percentage: 58 },
    ],
  },
  // 169. Island Dreams — CORREGIDO: notas de Fragrantica
  169: {
    top: [
      { name: "Jengibre", percentage: 92 },
      { name: "Bergamota", percentage: 78 },
    ],
    heart: [
      { name: "Toronja", percentage: 85 },
    ],
    base: [
      { name: "Almizcle", percentage: 90 },
      { name: "Ambroxan", percentage: 78 },
    ],
  },
  // 170. Island Vanilla Dunes — CORREGIDO: notas de Fragrantica
  170: {
    top: [
      { name: "Vainilla", percentage: 95 },
      { name: "Canela", percentage: 82 },
      { name: "Cardamomo", percentage: 72 },
      { name: "Bergamota", percentage: 58 },
    ],
    heart: [
      { name: "Flor de Azahar", percentage: 88 },
      { name: "Madera de Guayaco", percentage: 68 },
    ],
    base: [
      { name: "Praliné", percentage: 90 },
      { name: "Ámbar", percentage: 78 },
      { name: "Almizcle", percentage: 65 },
    ],
  },
  // 176. Rome Pour Homme — CORREGIDO: notas de Fragrantica
  176: {
    top: [
      { name: "Geranio", percentage: 92 },
      { name: "Rosa", percentage: 78 },
    ],
    heart: [
      { name: "Salvia", percentage: 90 },
      { name: "Jengibre", percentage: 72 },
    ],
    base: [
      { name: "Madera de Cedro", percentage: 95 },
      { name: "Vetiver", percentage: 80 },
    ],
  },
  // 178. Bharara King — CORREGIDO: notas de Fragrantica
  178: {
    top: [
      { name: "Naranja", percentage: 92 },
      { name: "Bergamota", percentage: 82 },
      { name: "Limón", percentage: 72 },
    ],
    heart: [
      { name: "Notas Frutales", percentage: 95 },
    ],
    base: [
      { name: "Vainilla", percentage: 90 },
      { name: "Almizcle Blanco", percentage: 80 },
      { name: "Ámbar", percentage: 72 },
    ],
  },
  // 180. Bharara Queen — CORREGIDO: notas de Fragrantica
  180: {
    top: [
      { name: "Bergamota", percentage: 92 },
    ],
    heart: [
      { name: "Flores Blancas", percentage: 88 },
      { name: "Rosa", percentage: 78 },
    ],
    base: [
      { name: "Sándalo", percentage: 90 },
      { name: "Caramelo", percentage: 82 },
      { name: "Vainilla", percentage: 72 },
    ],
  },
  // 181. Viking Rio — CORREGIDO: notas de Fragrantica
  181: {
    top: [
      { name: "Avellana", percentage: 92 },
      { name: "Cacao", percentage: 85 },
    ],
    heart: [
      { name: "Cedro", percentage: 88 },
      { name: "Jazmín Sambac", percentage: 72 },
    ],
    base: [
      { name: "Caramelo", percentage: 90 },
      { name: "Ambroxan", percentage: 78 },
      { name: "Musgo de Roble", percentage: 65 },
    ],
  },
  // 182. Viking Dubai — CORREGIDO: notas de Fragrantica
  182: {
    top: [
      { name: "Limón", percentage: 92 },
      { name: "Bergamota", percentage: 82 },
      { name: "Jengibre", percentage: 72 },
      { name: "Toronja", percentage: 65 },
      { name: "Naranja Dulce", percentage: 58 },
    ],
    heart: [
      { name: "Madera Cashmere", percentage: 85 },
      { name: "Haba Tonka", percentage: 75 },
      { name: "Violeta", percentage: 62 },
      { name: "Magnolia", percentage: 55 },
    ],
    base: [
      { name: "Ambroxan", percentage: 90 },
      { name: "Almizcle Blanco", percentage: 80 },
      { name: "Pachulí", percentage: 68 },
      { name: "Ámbar Gris", percentage: 60 },
    ],
  },
  // 183. Viking Cairo — CORREGIDO: notas de Fragrantica
  183: {
    top: [
      { name: "Mandarina", percentage: 92 },
      { name: "Jengibre", percentage: 78 },
      { name: "Limón", percentage: 68 },
    ],
    heart: [
      { name: "Acorde Fougère", percentage: 85 },
      { name: "Haba Tonka", percentage: 72 },
      { name: "Lavanda", percentage: 62 },
      { name: "Violeta", percentage: 55 },
      { name: "Magnolia", percentage: 50 },
    ],
    base: [
      { name: "Vetiver", percentage: 90 },
      { name: "Ámbar", percentage: 80 },
      { name: "Pachulí", percentage: 68 },
      { name: "Almizcle", percentage: 58 },
    ],
  },
  // 184. Viking Kashmir — CORREGIDO: notas de Fragrantica
  184: {
    top: [
      { name: "Papiro", percentage: 92 },
      { name: "Cardamomo", percentage: 82 },
    ],
    heart: [
      { name: "Hisopo", percentage: 85 },
      { name: "Olíbano", percentage: 72 },
      { name: "Zanahoria", percentage: 58 },
    ],
    base: [
      { name: "Sándalo", percentage: 95 },
      { name: "Madera de Cachemira", percentage: 82 },
    ],
  },
  // 185. Sherif — NOTAS DE FRAGRANTICA
  185: {
    top: [
      { name: "Manzana", percentage: 92 },
      { name: "Petitgrain", percentage: 80 },
      { name: "Bergamota", percentage: 72 },
    ],
    heart: [
      { name: "Madera de Cedro", percentage: 88 },
      { name: "Cashmeran", percentage: 78 },
      { name: "Violeta", percentage: 65 },
    ],
    base: [
      { name: "Musgo de Roble", percentage: 90 },
      { name: "Almizcle", percentage: 82 },
      { name: "Ámbar", percentage: 72 },
    ],
  },
};

// ─── Accords data ───
export const PERFUME_ACCORDS: Record<number, { label: string; percentage: number; color: string }[]> = {
  // 1. Club de Nuit Intense Man — CORREGIDO: acordes de Fragrantica
  1: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Afrutado", percentage: 71, color: "#e75a8d" },
    { label: "Ahumado", percentage: 56, color: "#7a6b5d" },
    { label: "Amaderado", percentage: 55, color: "#c17b2a" },
    { label: "Aromático", percentage: 54, color: "#6b8e4e" },
    { label: "Dulce", percentage: 52, color: "#f0a830" },
    { label: "Fresco", percentage: 51, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 46, color: "#a0a0a0" },
  ],
  // 2. Club de Nuit Intense Man Limited Edition — CORREGIDO: acordes de Fragrantica
  2: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Almizclado", percentage: 73, color: "#a0a0a0" },
    { label: "Ámbar", percentage: 72, color: "#f0a830" },
    { label: "Dulce", percentage: 67, color: "#e75a8d" },
    { label: "Fresco Especiado", percentage: 66, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 61, color: "#e75a8d" },
    { label: "Amaderado", percentage: 61, color: "#c17b2a" },
    { label: "Aromático", percentage: 57, color: "#6b8e4e" },
    { label: "Animalico", percentage: 56, color: "#8b6e4e" },
    { label: "Fresco", percentage: 55, color: "#a0c4e8" },
  ],
  // 3. Club de Nuit Woman — CORREGIDO: acordes de Fragrantica
  3: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Pachulí", percentage: 50, color: "#6b8e4e" },
    { label: "Rosado", percentage: 48, color: "#e75a8d" },
    { label: "Amaderado", percentage: 47, color: "#c17b2a" },
    { label: "Fresco Especiado", percentage: 47, color: "#a0c4e8" },
    { label: "Aromático", percentage: 42, color: "#6b8e4e" },
    { label: "Terroso", percentage: 32, color: "#7a6b5d" },
    { label: "Atalcado", percentage: 30, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 28, color: "#a0a0a0" },
    { label: "Cálido Especiado", percentage: 27, color: "#c45a3a" },
  ],
  // 4. Club de Nuit White Imperiale — CORREGIDO: acordes de Fragrantica
  4: [
    { label: "Rosado", percentage: 100, color: "#e75a8d" },
    { label: "Floral", percentage: 80, color: "#e75a8d" },
    { label: "Almizclado", percentage: 77, color: "#a0a0a0" },
    { label: "Atalcado", percentage: 77, color: "#d4c5a9" },
    { label: "Avainillado", percentage: 72, color: "#c9a033" },
    { label: "Fresco", percentage: 69, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
    { label: "Afrutado", percentage: 64, color: "#e75a8d" },
    { label: "Fresco Especiado", percentage: 62, color: "#a0c4e8" },
    { label: "Ámbar", percentage: 61, color: "#f0a830" },
  ],
  // 5 (115). Club de Nuit Iconic — CORREGIDO: acordes de Fragrantica
  115: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Amaderado", percentage: 91, color: "#c17b2a" },
    { label: "Fresco Especiado", percentage: 60, color: "#a0c4e8" },
    { label: "Ámbar", percentage: 53, color: "#f0a830" },
    { label: "Aromático", percentage: 50, color: "#6b8e4e" },
    { label: "Fresco", percentage: 30, color: "#a0c4e8" },
    { label: "Cálido Especiado", percentage: 27, color: "#c45a3a" },
    { label: "Balsámico", percentage: 24, color: "#8b6e4e" },
  ],
  // 6 (116). Club de Nuit Sillage — CORREGIDO: acordes de Fragrantica
  116: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Almizclado", percentage: 44, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 43, color: "#c17b2a" },
    { label: "Fresco Especiado", percentage: 36, color: "#a0c4e8" },
    { label: "Atalcado", percentage: 36, color: "#d4c5a9" },
    { label: "Aromático", percentage: 31, color: "#6b8e4e" },
    { label: "Ámbar", percentage: 28, color: "#f0a830" },
    { label: "Afrutado", percentage: 27, color: "#e75a8d" },
  ],
  // 7 (117). Club de Nuit Urban Man Elixir — CORREGIDO: acordes de Fragrantica
  117: [
    { label: "Ámbar", percentage: 100, color: "#f0a830" },
    { label: "Aromático", percentage: 82, color: "#6b8e4e" },
    { label: "Cítrico", percentage: 74, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 73, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 67, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 66, color: "#c17b2a" },
    { label: "Lavanda", percentage: 57, color: "#9b8ec4" },
    { label: "Especiado Suave", percentage: 53, color: "#d4855a" },
    { label: "Cálido Especiado", percentage: 47, color: "#c45a3a" },
    { label: "Herbal", percentage: 46, color: "#6b8e4e" },
  ],
  // 8 (118). Club de Nuit Urban Man — CORREGIDO: acordes de Fragrantica
  118: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Fresco Especiado", percentage: 95, color: "#a0c4e8" },
    { label: "Aromático", percentage: 91, color: "#6b8e4e" },
    { label: "Cítrico", percentage: 78, color: "#f0c934" },
    { label: "Cálido Especiado", percentage: 62, color: "#c45a3a" },
    { label: "Terroso", percentage: 62, color: "#7a6b5d" },
    { label: "Verde", percentage: 60, color: "#4a7a3a" },
    { label: "Pachulí", percentage: 51, color: "#4a7a3a" },
    { label: "Lavanda", percentage: 49, color: "#9b8ec4" },
    { label: "Atalcado", percentage: 46, color: "#d4c5a9" },
  ],
  // 9 (119). Club de Nuit Maleka — CORREGIDO: acordes de Fragrantica
  119: [
    { label: "Iris", percentage: 100, color: "#9b8ec4" },
    { label: "Atalcado", percentage: 95, color: "#d4c5a9" },
    { label: "Afrutado", percentage: 91, color: "#e75a8d" },
    { label: "Dulce", percentage: 87, color: "#f0a830" },
    { label: "Amaderado", percentage: 87, color: "#c17b2a" },
    { label: "Tropical", percentage: 84, color: "#f0c934" },
    { label: "Cítrico", percentage: 82, color: "#f0c934" },
    { label: "Ámbar", percentage: 78, color: "#f0a830" },
    { label: "Almizclado", percentage: 69, color: "#a0a0a0" },
    { label: "Fresco", percentage: 69, color: "#a0c4e8" },
  ],
  // 10 (120). Club de Nuit Untold — CORREGIDO: acordes de Fragrantica
  120: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Ámbar", percentage: 97, color: "#f0a830" },
    { label: "Cálido Especiado", percentage: 80, color: "#c45a3a" },
    { label: "Metálico", percentage: 57, color: "#b0b0b0" },
    { label: "Floral Blanco", percentage: 56, color: "#f0e6f6" },
    { label: "Animalico", percentage: 55, color: "#8b6e4e" },
    { label: "Cuero", percentage: 54, color: "#8b5e3c" },
    { label: "Fresco Especiado", percentage: 53, color: "#a0c4e8" },
    { label: "Aromático", percentage: 53, color: "#6b8e4e" },
  ],
  // 11 (121). Club de Nuit Precieux I — CORREGIDO: acordes de Fragrantica
  121: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Cítrico", percentage: 97, color: "#f0c934" },
    { label: "Amaderado", percentage: 97, color: "#c17b2a" },
    { label: "Afrutado", percentage: 89, color: "#e75a8d" },
    { label: "Ámbar", percentage: 83, color: "#f0a830" },
    { label: "Almizclado", percentage: 79, color: "#a0a0a0" },
    { label: "Fresco Especiado", percentage: 68, color: "#a0c4e8" },
    { label: "Fresco", percentage: 68, color: "#a0c4e8" },
    { label: "Musgoso", percentage: 68, color: "#4a7a3a" },
    { label: "Terroso", percentage: 65, color: "#7a6b5d" },
  ],
  // 12 (5). Odyssey Homme White Edition — CORREGIDO: acordes de Fragrantica
  5: [
    { label: "Amaderado", percentage: 95, color: "#c17b2a" },
    { label: "Ámbar", percentage: 66, color: "#f0a830" },
    { label: "Aromático", percentage: 64, color: "#6b8e4e" },
    { label: "Avainillado", percentage: 58, color: "#c9a033" },
    { label: "Cálido Especiado", percentage: 54, color: "#c45a3a" },
    { label: "Especiado Suave", percentage: 54, color: "#d4855a" },
    { label: "Dulce", percentage: 38, color: "#f0a830" },
    { label: "Marino", percentage: 27, color: "#4a8eb8" },
  ],
  // 13 (91). Odyssey Aoud — CORREGIDO: acordes de Fragrantica
  91: [
    { label: "Amaderado", percentage: 95, color: "#c17b2a" },
    { label: "Oud", percentage: 94, color: "#5a3a2a" },
    { label: "Almizclado", percentage: 83, color: "#a0a0a0" },
    { label: "Cálido Especiado", percentage: 82, color: "#c45a3a" },
    { label: "Fresco Especiado", percentage: 81, color: "#a0c4e8" },
    { label: "Ámbar", percentage: 51, color: "#f0a830" },
    { label: "Lavanda", percentage: 47, color: "#9b8ec4" },
    { label: "Pachulí", percentage: 43, color: "#4a7a3a" },
  ],
  // 14 (104). Odyssey Mandarine Sky — CORREGIDO: acordes de Fragrantica
  104: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Caramelo", percentage: 61, color: "#c98030" },
    { label: "Dulce", percentage: 59, color: "#f0a830" },
    { label: "Ámbar", percentage: 38, color: "#f0a830" },
    { label: "Aromático", percentage: 34, color: "#6b8e4e" },
    { label: "Avainillado", percentage: 26, color: "#c9a033" },
    { label: "Amaderado", percentage: 24, color: "#c17b2a" },
    { label: "Cálido Especiado", percentage: 18, color: "#c45a3a" },
  ],
  // 15 (105). Odyssey Artisto — CORREGIDO: acordes de Fragrantica
  105: [
    { label: "Avainillado", percentage: 95, color: "#c9a033" },
    { label: "Ámbar", percentage: 67, color: "#f0a830" },
    { label: "Coco", percentage: 65, color: "#d4c5a9" },
    { label: "Dulce", percentage: 60, color: "#f0a830" },
    { label: "Tropical", percentage: 58, color: "#f0c934" },
    { label: "Cítrico", percentage: 48, color: "#f0c934" },
    { label: "Aromático", percentage: 47, color: "#6b8e4e" },
    { label: "Nueces", percentage: 40, color: "#8b6e4e" },
  ],
  // 16 (106). Odyssey Bahamas — CORREGIDO: acordes de Fragrantica
  106: [
    { label: "Marino", percentage: 95, color: "#4a8eb8" },
    { label: "Acuático", percentage: 92, color: "#5aaad4" },
    { label: "Afrutado", percentage: 70, color: "#e75a8d" },
    { label: "Dulce", percentage: 52, color: "#f0a830" },
    { label: "Fresco", percentage: 49, color: "#a0c4e8" },
    { label: "Salado", percentage: 49, color: "#7ab8d4" },
    { label: "Ozónico", percentage: 38, color: "#a0d4e8" },
    { label: "Aromático", percentage: 34, color: "#6b8e4e" },
  ],
  // 17 (107). Odyssey Toffee Coffee — CORREGIDO: acordes de Fragrantica
  107: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Café", percentage: 41, color: "#5a3a2a" },
    { label: "Cálido Especiado", percentage: 37, color: "#c45a3a" },
    { label: "Avainillado", percentage: 36, color: "#c9a033" },
    { label: "Caramelo", percentage: 23, color: "#c98030" },
    { label: "Lácteo", percentage: 19, color: "#f5f0e0" },
    { label: "Ámbar", percentage: 15, color: "#f0a830" },
    { label: "Atalcado", percentage: 15, color: "#d4c5a9" },
  ],
  // 18 (108). Odyssey Spectra — CORREGIDO: acordes de Fragrantica
  108: [
    { label: "Avainillado", percentage: 95, color: "#c9a033" },
    { label: "Cálido Especiado", percentage: 70, color: "#c45a3a" },
    { label: "Ámbar", percentage: 64, color: "#f0a830" },
    { label: "Canela", percentage: 63, color: "#d4855a" },
    { label: "Dulce", percentage: 61, color: "#f0a830" },
    { label: "Lavanda", percentage: 60, color: "#9b8ec4" },
    { label: "Afrutado", percentage: 47, color: "#e75a8d" },
    { label: "Aromático", percentage: 46, color: "#6b8e4e" },
  ],
  // 19 (109). Odyssey Aqua — CORREGIDO: acordes de Fragrantica
  109: [
    { label: "Aromático", percentage: 95, color: "#6b8e4e" },
    { label: "Cítrico", percentage: 80, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 79, color: "#a0c4e8" },
    { label: "Verde", percentage: 58, color: "#4a7a3a" },
    { label: "Amaderado", percentage: 42, color: "#c17b2a" },
    { label: "Ámbar", percentage: 39, color: "#f0a830" },
    { label: "Herbal", percentage: 32, color: "#6b8e4e" },
    { label: "Lavanda", percentage: 29, color: "#9b8ec4" },
  ],
  // 20 (110). Odyssey Homme — CORREGIDO: acordes de Fragrantica
  110: [
    { label: "Amaderado", percentage: 95, color: "#c17b2a" },
    { label: "Avainillado", percentage: 61, color: "#c9a033" },
    { label: "Cálido Especiado", percentage: 50, color: "#c45a3a" },
    { label: "Atalcado", percentage: 48, color: "#d4c5a9" },
    { label: "Cítrico", percentage: 46, color: "#f0c934" },
    { label: "Floral Blanco", percentage: 42, color: "#f0e6f6" },
    { label: "Ámbar", percentage: 41, color: "#f0a830" },
    { label: "Dulce", percentage: 25, color: "#f0a830" },
  ],
  // ─── Página 2 ───
  // 21 (111). Odyssey Mandarin Sky Vintage Edition — CORREGIDO: acordes de Fragrantica
  111: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Amaderado", percentage: 58, color: "#c17b2a" },
    { label: "Cálido Especiado", percentage: 38, color: "#c45a3a" },
    { label: "Ámbar", percentage: 37, color: "#f0a830" },
    { label: "Floral", percentage: 33, color: "#e75a8d" },
    { label: "Fresco", percentage: 21, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 10, color: "#e75a8d" },
    { label: "Fresco Especiado", percentage: 9, color: "#a0c4e8" },
  ],
  // 22 (112). Odyssey Mandarin Sky Elixir — CORREGIDO: acordes de Fragrantica
  112: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Avainillado", percentage: 82, color: "#c9a033" },
    { label: "Dulce", percentage: 64, color: "#f0a830" },
    { label: "Caramelo", percentage: 47, color: "#c98030" },
    { label: "Aromático", percentage: 43, color: "#6b8e4e" },
    { label: "Cálido Especiado", percentage: 42, color: "#c45a3a" },
    { label: "Ámbar", percentage: 32, color: "#f0a830" },
    { label: "Balsámico", percentage: 29, color: "#8b6e4e" },
  ],
  // 23 (113). Odyssey Mega — CORREGIDO: acordes de Fragrantica
  113: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Aromático", percentage: 81, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 72, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 36, color: "#c17b2a" },
    { label: "Dulce", percentage: 34, color: "#f0a830" },
    { label: "Fresco", percentage: 27, color: "#a0c4e8" },
    { label: "Verde", percentage: 25, color: "#4a7a3a" },
    { label: "Almizclado", percentage: 23, color: "#a0a0a0" },
  ],
  // 24 (114). Odyssey Limoni Fresh — CORREGIDO: acordes de Fragrantica
  114: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 22, color: "#a0c4e8" },
    { label: "Aromático", percentage: 21, color: "#6b8e4e" },
    { label: "Fresco", percentage: 17, color: "#a0c4e8" },
    { label: "Verde", percentage: 16, color: "#4a7a3a" },
    { label: "Dulce", percentage: 12, color: "#f0a830" },
    { label: "Floral Blanco", percentage: 10, color: "#f0e6f6" },
    { label: "Marino", percentage: 10, color: "#4a8eb8" },
  ],
  // 25 (141). Yum Yum — CORREGIDO: accords de Fragrantica
  141: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Atalcado", percentage: 88, color: "#d4c5a9" },
    { label: "Cereza", percentage: 58, color: "#c4385a" },
    { label: "Amaderado", percentage: 55, color: "#c17b2a" },
    { label: "Rosado", percentage: 52, color: "#e75a8d" },
    { label: "Dulce", percentage: 48, color: "#f0a830" },
    { label: "Vainilla", percentage: 43, color: "#c9a033" },
    { label: "Floral Blanco", percentage: 42, color: "#f0e6f6" },
  ],
  // 26 (143). Bon Bon — CORREGIDO: accords de Fragrantica
  143: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Fresco", percentage: 56, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 54, color: "#e75a8d" },
    { label: "Floral", percentage: 51, color: "#e75a8d" },
    { label: "Verde", percentage: 48, color: "#4a8a3a" },
    { label: "Floral Blanco", percentage: 44, color: "#f0e6f6" },
    { label: "Dulce", percentage: 42, color: "#f0a830" },
    { label: "Atalcado", percentage: 42, color: "#d4c5a9" },
  ],
  // 27 (144). Island Bliss — CORREGIDO: accords de Fragrantica
  144: [
    { label: "Vainilla", percentage: 95, color: "#c9a033" },
    { label: "Coco", percentage: 82, color: "#d4c5a9" },
    { label: "Dulce", percentage: 78, color: "#f0a830" },
    { label: "Floral Blanco", percentage: 60, color: "#f0e6f6" },
    { label: "Afrutado", percentage: 36, color: "#e75a8d" },
    { label: "Almizclado", percentage: 36, color: "#a0a0a0" },
    { label: "Floral", percentage: 32, color: "#e75a8d" },
    { label: "Atalcado", percentage: 32, color: "#d4c5a9" },
  ],
  // 28 (145). Island Breeze — CORREGIDO: accords de Fragrantica
  145: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Almizclado", percentage: 58, color: "#a0a0a0" },
    { label: "Atalcado", percentage: 43, color: "#d4c5a9" },
    { label: "Rosado", percentage: 39, color: "#e75a8d" },
    { label: "Amaderado", percentage: 30, color: "#c17b2a" },
    { label: "Dulce", percentage: 27, color: "#f0a830" },
    { label: "Floral", percentage: 12, color: "#e75a8d" },
    { label: "Animal", percentage: 9, color: "#8b4513" },
  ],
  // 29 (151). Eter Arabian — CORREGIDO: accords de Fragrantica
  151: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 70, color: "#a0c4e8" },
    { label: "Aromático", percentage: 60, color: "#6b8e4e" },
    { label: "Dulce", percentage: 58, color: "#f0a830" },
    { label: "Amaderado", percentage: 53, color: "#c17b2a" },
    { label: "Afrutado", percentage: 29, color: "#e75a8d" },
    { label: "Caramelo", percentage: 25, color: "#d4a030" },
    { label: "Lavanda", percentage: 23, color: "#9b7ec8" },
  ],
  // 30 (6). Al Haramain Amber Oud Rouge Edition — CORREGIDO: accords de Fragrantica
  6: [
    { label: "Especiado Cálido", percentage: 95, color: "#c45a3a" },
    { label: "Ámbar", percentage: 88, color: "#f0a830" },
    { label: "Almizclado", percentage: 78, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
    { label: "Animal", percentage: 65, color: "#8b4513" },
    { label: "Metálico", percentage: 55, color: "#b8b8c8" },
    { label: "Floral Blanco", percentage: 50, color: "#f0e6f6" },
    { label: "Atalcado", percentage: 48, color: "#d4c5a9" },
  ],
  // 31 (7). Al Haramain Amber Oud Gold Edition — CORREGIDO: accords de Fragrantica
  7: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Afrutado", percentage: 88, color: "#e75a8d" },
    { label: "Ozónico", percentage: 62, color: "#a0c4e8" },
    { label: "Atalcado", percentage: 58, color: "#d4c5a9" },
    { label: "Vainilla", percentage: 58, color: "#c9a033" },
    { label: "Almizclado", percentage: 57, color: "#a0a0a0" },
    { label: "Fresco", percentage: 56, color: "#a0c4e8" },
    { label: "Ámbar", percentage: 54, color: "#f0a830" },
  ],
  // 32 (8). Al Haramain Amber Oud Carbon Edition — CORREGIDO: accords de Fragrantica
  8: [
    { label: "Aromático", percentage: 95, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 58, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 42, color: "#c17b2a" },
    { label: "Cítrico", percentage: 35, color: "#f0c934" },
    { label: "Marino", percentage: 34, color: "#4a8eb8" },
    { label: "Lavanda", percentage: 28, color: "#9b7ec8" },
    { label: "Herbal", percentage: 27, color: "#4a8a3a" },
    { label: "Terroso", percentage: 22, color: "#8b6b4a" },
  ],
  // 33 (9). Al Haramain Amber Oud White Edition — CORREGIDO: accords de Fragrantica
  9: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Floral", percentage: 82, color: "#e75a8d" },
    { label: "Amaderado", percentage: 66, color: "#c17b2a" },
    { label: "Pachulí", percentage: 64, color: "#4a7a3a" },
    { label: "Floral Blanco", percentage: 61, color: "#f0e6f6" },
    { label: "Rosado", percentage: 48, color: "#e75a8d" },
    { label: "Terroso", percentage: 44, color: "#8b6b4a" },
    { label: "Aromático", percentage: 38, color: "#6b8e4e" },
  ],
  // 34 (10). Al Haramain L'Aventure — CORREGIDO: accords de Fragrantica
  10: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Aromático", percentage: 50, color: "#6b8e4e" },
    { label: "Amaderado", percentage: 48, color: "#c17b2a" },
    { label: "Almizclado", percentage: 33, color: "#a0a0a0" },
    { label: "Fresco Especiado", percentage: 29, color: "#a0c4e8" },
    { label: "Floral Blanco", percentage: 25, color: "#f0e6f6" },
    { label: "Atalcado", percentage: 24, color: "#d4c5a9" },
    { label: "Pachulí", percentage: 20, color: "#4a7a3a" },
  ],
  // 35 (11). Al Haramain L'Aventure Woman — CORREGIDO: accords de Fragrantica
  11: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Amaderado", percentage: 94, color: "#c17b2a" },
    { label: "Atalcado", percentage: 48, color: "#d4c5a9" },
    { label: "Dulce", percentage: 43, color: "#f0a830" },
    { label: "Almizclado", percentage: 38, color: "#a0a0a0" },
    { label: "Floral", percentage: 37, color: "#e75a8d" },
    { label: "Cítrico", percentage: 33, color: "#f0c934" },
    { label: "Aromático", percentage: 25, color: "#6b8e4e" },
  ],
  // 36 (154). Al Haramain Amber Oud Aqua Dubai — CORREGIDO: accords de Fragrantica
  154: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Verde", percentage: 82, color: "#4a8a3a" },
    { label: "Aromático", percentage: 38, color: "#6b8e4e" },
    { label: "Almizclado", percentage: 36, color: "#a0a0a0" },
    { label: "Fresco Especiado", percentage: 33, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 32, color: "#e75a8d" },
    { label: "Atalcado", percentage: 27, color: "#d4c5a9" },
    { label: "Dulce", percentage: 18, color: "#f0a830" },
  ],
  // 37 (14). Lattafa Bade'e Al Oud Amethyst — CORREGIDO: acordes de Fragrantica (Rosado 100%, Oud 78%, Ámbar 42%, Especiado Suave 39%)
  14: [
    { label: "Rosado", percentage: 100, color: "#e75a8d" },
    { label: "Oud", percentage: 78, color: "#5a3a2a" },
    { label: "Ámbar", percentage: 42, color: "#f0a830" },
    { label: "Especiado Suave", percentage: 39, color: "#d4855a" },
    { label: "Floral", percentage: 37, color: "#e75a8d" },
    { label: "Vainilla", percentage: 31, color: "#c9a033" },
    { label: "Cítrico", percentage: 28, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 27, color: "#a0c4e8" },
  ],
  // 38 (15). Lattafa Bade'e Al Oud Oud for Glory — CORREGIDO: acordes de Fragrantica (Oud 100%, Cálido Especiado 91%, Fresco Especiado 80%, Pachulí 56%)
  15: [
    { label: "Oud", percentage: 100, color: "#5a3a2a" },
    { label: "Cálido Especiado", percentage: 91, color: "#c45a3a" },
    { label: "Fresco Especiado", percentage: 80, color: "#a0c4e8" },
    { label: "Pachulí", percentage: 56, color: "#4a7a3a" },
    { label: "Metálico", percentage: 37, color: "#b0b0c0" },
    { label: "Almizclado", percentage: 37, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 34, color: "#c17b2a" },
    { label: "Lavanda", percentage: 31, color: "#9b8ec4" },
  ],
  // 39 (16). Lattafa Bade'e Al Oud Honor & Glory — CORREGIDO: acordes de Fragrantica (Dulce 100%, Cálido Especiado 65%, Frutal 52%, Vainilla 46%)
  16: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Cálido Especiado", percentage: 65, color: "#c45a3a" },
    { label: "Frutal", percentage: 52, color: "#e75a8d" },
    { label: "Vainilla", percentage: 46, color: "#c9a033" },
    { label: "Amaderado", percentage: 34, color: "#c17b2a" },
    { label: "Atalcado", percentage: 31, color: "#d4c5a9" },
    { label: "Canela", percentage: 30, color: "#c45a3a" },
    { label: "Tropical", percentage: 29, color: "#f0c934" },
  ],
  // 40 (18). Lattafa Eclaire Pistache — CORREGIDO: acordes de Fragrantica (Avainillado 100%, Dulce 79%, Lactónico 71%, Cacao 55%)
  18: [
    { label: "Avainillado", percentage: 100, color: "#c9a033" },
    { label: "Dulce", percentage: 79, color: "#f0a830" },
    { label: "Lactónico", percentage: 71, color: "#f5f0e0" },
    { label: "Cacao", percentage: 55, color: "#5a3a2a" },
    { label: "Cálido Especiado", percentage: 33, color: "#c45a3a" },
    { label: "Amaderado", percentage: 32, color: "#c17b2a" },
    { label: "Nueces", percentage: 32, color: "#8b6e4e" },
    { label: "Coco", percentage: 30, color: "#d4c5a9" },
    { label: "Atalcado", percentage: 25, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 22, color: "#a0a0a0" },
  ],

  // ─── Páginas 3-4: Lattafa ───

  // 41 (19). Lattafa Eclaire Banoffi — CORREGIDO: acordes de Fragrantica (Dulce 100%, Vainilla 43%, Lactónico 32%, Afrutado 31%, Tropical 20%)
  19: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Avainillado", percentage: 43, color: "#c9a033" },
    { label: "Lactónico", percentage: 32, color: "#f5f0e0" },
    { label: "Afrutado", percentage: 31, color: "#e75a8d" },
    { label: "Tropical", percentage: 20, color: "#f0c934" },
    { label: "Atalcado", percentage: 13, color: "#d4c5a9" },
    { label: "Verde", percentage: 9, color: "#4a7a3a" },
    { label: "Almizclado", percentage: 8, color: "#a0a0a0" },
  ],
  // 42 (20). Lattafa Mayar Natural Intense — CORREGIDO
  20: [
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Fresco Acuático", percentage: 80, color: "#4a8eb8" },
    { label: "Floral", percentage: 70, color: "#e75a8d" },
    { label: "Almizclado", percentage: 60, color: "#a0a0a0" },
  ],
  // 43 (21). Lattafa Fakhar Black — CORREGIDO: acordes de Fragrantica (Aromático 100%, Fresco Especiado 95%, Amaderado 68%, Frutal 60%)
  21: [
    { label: "Aromático", percentage: 100, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 95, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 68, color: "#c17b2a" },
    { label: "Frutal", percentage: 60, color: "#e75a8d" },
    { label: "Fresco", percentage: 49, color: "#a0c4e8" },
    { label: "Cítrico", percentage: 48, color: "#f0c934" },
    { label: "Lavanda", percentage: 46, color: "#9b8ec4" },
    { label: "Verde", percentage: 37, color: "#4a7a3a" },
  ],
  // 44 (22). Lattafa Fakhar Rose — CORREGIDO: acordes de Fragrantica (Floral Blanco 100%, Frutal 36%, Nardos 34%, Dulce 25%)
  22: [
    { label: "Floral Blanco", percentage: 100, color: "#f0e6f6" },
    { label: "Frutal", percentage: 36, color: "#e75a8d" },
    { label: "Nardos", percentage: 34, color: "#f0e6f6" },
    { label: "Dulce", percentage: 25, color: "#f0a830" },
    { label: "Amaderado", percentage: 23, color: "#c17b2a" },
    { label: "Animálico", percentage: 22, color: "#8b6e4e" },
    { label: "Floral", percentage: 20, color: "#e75a8d" },
    { label: "Almizclado", percentage: 19, color: "#a0a0a0" },
  ],
  // 45 (103). Lattafa Qaed Al Fursan — CORREGIDO: acordes de Fragrantica (Frutal 100%, Dulce 95%, Amaderado 69%, Tropical 69%)
  103: [
    { label: "Frutal", percentage: 100, color: "#e75a8d" },
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Amaderado", percentage: 69, color: "#c17b2a" },
    { label: "Tropical", percentage: 69, color: "#f0c934" },
    { label: "Fresco", percentage: 63, color: "#a0c4e8" },
    { label: "Ámbar", percentage: 56, color: "#f0a830" },
    { label: "Cálido Especiado", percentage: 55, color: "#c45a3a" },
    { label: "Oud", percentage: 47, color: "#5a3a2a" },
    { label: "Floral Blanco", percentage: 45, color: "#f0e6f6" },
    { label: "Fresco Especiado", percentage: 45, color: "#a0c4e8" },
  ],
  // 46 (25). Lattafa Qaed Al Fursan Untamed — CORREGIDO: acordes de Fragrantica (Ámbar 100%, Cálido Especiado 98%, Aromático 95%, Fresco Especiado 77%)
  25: [
    { label: "Ámbar", percentage: 100, color: "#f0a830" },
    { label: "Cálido Especiado", percentage: 98, color: "#c45a3a" },
    { label: "Aromático", percentage: 95, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 77, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 74, color: "#c17b2a" },
    { label: "Caramelo", percentage: 70, color: "#c98030" },
    { label: "Canela", percentage: 66, color: "#c45a3a" },
    { label: "Cítrico", percentage: 60, color: "#f0c934" },
    { label: "Lavanda", percentage: 54, color: "#9b8ec4" },
    { label: "Dulce", percentage: 52, color: "#f0a830" },
  ],
  // 47 (26). Lattafa Qaed Al Fursan Unlimited — CORREGIDO: acordes de Fragrantica (Dulce 100%, Vainilla 85%, Coco 83%, Tropical 72%)
  26: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Vainilla", percentage: 85, color: "#c9a033" },
    { label: "Coco", percentage: 83, color: "#d4c5a9" },
    { label: "Tropical", percentage: 72, color: "#f0c934" },
    { label: "Atalcado", percentage: 61, color: "#d4c5a9" },
    { label: "Amaderado", percentage: 58, color: "#c17b2a" },
    { label: "Floral", percentage: 58, color: "#e75a8d" },
    { label: "Lactónico", percentage: 57, color: "#f5f0e0" },
    { label: "Floral Amarillo", percentage: 56, color: "#e7d860" },
    { label: "Almizclado", percentage: 52, color: "#a0a0a0" },
  ],
  // 48 (27). Lattafa Hayaati Florence — CORREGIDO: acordes de Fragrantica (Cítrico 100%, Dulce 65%, Floral 57%, Almizclado 42%, Fresco 26%)
  27: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Dulce", percentage: 65, color: "#f0a830" },
    { label: "Floral", percentage: 57, color: "#e75a8d" },
    { label: "Almizclado", percentage: 42, color: "#a0a0a0" },
    { label: "Fresco", percentage: 26, color: "#a0c4e8" },
    { label: "Fresco Especiado", percentage: 25, color: "#a0c4e8" },
    { label: "Atalcado", percentage: 21, color: "#d4c5a9" },
    { label: "Aromático", percentage: 12, color: "#6b8e4e" },
  ],
  // 49 (142). Lattafa Hayaati Gold Elixir — CORREGIDO: acordes de Fragrantica (Cuero 100%, Cítrico 61%, Animálico 59%, Vainilla 53%, Atalcado 51%)
  142: [
    { label: "Cuero", percentage: 100, color: "#8b5e3c" },
    { label: "Cítrico", percentage: 61, color: "#f0c934" },
    { label: "Animálico", percentage: 59, color: "#5a3a2a" },
    { label: "Vainilla", percentage: 53, color: "#c9a033" },
    { label: "Atalcado", percentage: 51, color: "#d4c5a9" },
    { label: "Ámbar", percentage: 50, color: "#f0a830" },
    { label: "Aromático", percentage: 37, color: "#6b8e4e" },
    { label: "Frutal", percentage: 35, color: "#e75a8d" },
  ],
  // 50 (146). Lattafa Hayaati — CORREGIDO: acordes de Fragrantica (Frutal 100%, Canela 92%, Almizclado 91%, Cálido Especiado 74%, Atalcado 73%)
  146: [
    { label: "Frutal", percentage: 100, color: "#e75a8d" },
    { label: "Canela", percentage: 92, color: "#c45a3a" },
    { label: "Almizclado", percentage: 91, color: "#a0a0a0" },
    { label: "Cálido Especiado", percentage: 74, color: "#c45a3a" },
    { label: "Atalcado", percentage: 73, color: "#d4c5a9" },
    { label: "Cítrico", percentage: 71, color: "#f0c934" },
    { label: "Amaderado", percentage: 67, color: "#c17b2a" },
    { label: "Vainilla", percentage: 67, color: "#c9a033" },
  ],
  // 51 (147). Lattafa Hayaati Al Maleky — CORREGIDO: acordes de Fragrantica (Ámbar 100%, Fresco Especiado 77%, Almizclado 68%, Amaderado 58%, Cítrico 45%)
  147: [
    { label: "Ámbar", percentage: 100, color: "#f0a830" },
    { label: "Fresco Especiado", percentage: 77, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 68, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 58, color: "#c17b2a" },
    { label: "Cítrico", percentage: 45, color: "#f0c934" },
    { label: "Atalcado", percentage: 41, color: "#d4c5a9" },
    { label: "Especiado Suave", percentage: 35, color: "#d4855a" },
    { label: "Animálico", percentage: 34, color: "#8b6e4e" },
  ],
  // 52 (148). Lattafa Vintage Radio — CORREGIDO: 9 accordes reales de Fragrantica (woody 90%, fruity 88%, aromatic 72%, fresh spicy 70%, citrus 70%, lavender 67%, sweet 61%, herbal 57%, warm spicy 56%)
  148: [
    { label: "Amaderado", percentage: 90, color: "#c17b2a" },
    { label: "Afrutado", percentage: 88, color: "#e75a8d" },
    { label: "Aromático", percentage: 72, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 70, color: "#83C928" },
    { label: "Cítrico", percentage: 70, color: "#f0c934" },
    { label: "Lavanda", percentage: 67, color: "#9B7DB8" },
    { label: "Dulce", percentage: 61, color: "#f0a830" },
    { label: "Herbal", percentage: 57, color: "#4a7a3a" },
    { label: "Cálido Especiado", percentage: 56, color: "#c45a3a" },
  ],
  // 53 (149). Lattafa Emeer — CORREGIDO: 9 accordes reales de Fragrantica (citrus 100%, aromatic 91%, woody 76%, amber 69%, fresh spicy 66%, warm spicy 58%, powdery 56%, green 54%, balsamic 53%)
  149: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Aromático", percentage: 91, color: "#6b8e4e" },
    { label: "Amaderado", percentage: 76, color: "#c17b2a" },
    { label: "Ámbar", percentage: 69, color: "#bc4d10" },
    { label: "Fresco Especiado", percentage: 66, color: "#83C928" },
    { label: "Cálido Especiado", percentage: 58, color: "#c45a3a" },
    { label: "Atalcado", percentage: 56, color: "#d4c5a9" },
    { label: "Verde", percentage: 54, color: "#4a7a3a" },
    { label: "Balsámico", percentage: 53, color: "#8b6e4e" },
  ],
  // 54 (28). Lattafa Nebras Elixir — CORREGIDO: 8 accordes reales de Fragrantica (vanilla 85%, sweet 68%, powdery 64%, musky 55%, amber 40%, lactonic 30%, almond 22%, floral 14%)
  28: [
    { label: "Vainilla", percentage: 85, color: "#c9a033" },
    { label: "Dulce", percentage: 69, color: "#f0a830" },
    { label: "Atalcado", percentage: 64, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 55, color: "#a0a0a0" },
    { label: "Ámbar", percentage: 40, color: "#bc4d10" },
    { label: "Lácteo", percentage: 30, color: "#f5f0e0" },
    { label: "Almendra", percentage: 22, color: "#c9a87c" },
    { label: "Floral", percentage: 14, color: "#f0e6f6" },
  ],
  // 55 (29). Lattafa Asad Elixir — CORREGIDO: 9 accordes reales de Fragrantica (amber 92%, woody 84%, tobacco 73%, vanilla 71%, warm spicy 71%, sweet 66%, powdery 60%, patchouli 59%, soft spicy 56%)
  29: [
    { label: "Ámbar", percentage: 92, color: "#bc4d10" },
    { label: "Amaderado", percentage: 84, color: "#c17b2a" },
    { label: "Tabaco", percentage: 73, color: "#5a3a2a" },
    { label: "Vainilla", percentage: 71, color: "#c9a033" },
    { label: "Cálido Especiado", percentage: 71, color: "#c45a3a" },
    { label: "Dulce", percentage: 66, color: "#f0a830" },
    { label: "Atalcado", percentage: 60, color: "#d4c5a9" },
    { label: "Pachulí", percentage: 59, color: "#5a4a3a" },
    { label: "Especiado Suave", percentage: 56, color: "#d4855a" },
  ],
  // 56 (30). Lattafa Ansaam Gold — CORREGIDO: 8 accordes reales de Fragrantica (sweet 73%, fruity 65%, citrus 61%, musky 60%, vanilla 59%, white floral 58%, rose 57%, powdery 45%)
  30: [
    { label: "Dulce", percentage: 73, color: "#f0a830" },
    { label: "Afrutado", percentage: 65, color: "#e75a8d" },
    { label: "Cítrico", percentage: 61, color: "#f0c934" },
    { label: "Almizclado", percentage: 60, color: "#a0a0a0" },
    { label: "Vainilla", percentage: 59, color: "#c9a033" },
    { label: "Floral Blanco", percentage: 58, color: "#f0e6f6" },
    { label: "Rosa", percentage: 57, color: "#e8a0b4" },
    { label: "Atalcado", percentage: 45, color: "#d4c5a9" },
  ],
  // 57 (31). Lattafa Ansaam Silver — CORREGIDO: Fragrantica (aromatic 100%, warm spicy 95%, vanilla 79%, amber 76%, lavender 70%, citrus 66%, fresh spicy 65%, powdery 62%, balsamic 60%)
  31: [
    { label: "Aromático", percentage: 100, color: "#6b8e4e" },
    { label: "Cálido Especiado", percentage: 95, color: "#c45a3a" },
    { label: "Vainilla", percentage: 79, color: "#c9a033" },
    { label: "Ámbar", percentage: 76, color: "#bc4d10" },
    { label: "Lavanda", percentage: 70, color: "#9B7DB8" },
    { label: "Cítrico", percentage: 66, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 65, color: "#83C928" },
    { label: "Atalcado", percentage: 62, color: "#d4c5a9" },
    { label: "Balsámico", percentage: 60, color: "#8b6e4e" },
  ],
  // 58 (32). Lattafa Shaheen Gold — CORREGIDO: Fragrantica (sweet 98%, fruity 83%, vanilla 67%, citrus 66%, lavender 61%, aromatic 60%, tropical 60%, woody 59%, patchouli 56%)
  32: [
    { label: "Dulce", percentage: 98, color: "#f0a830" },
    { label: "Afrutado", percentage: 83, color: "#e75a8d" },
    { label: "Vainilla", percentage: 67, color: "#c9a033" },
    { label: "Cítrico", percentage: 66, color: "#f0c934" },
    { label: "Lavanda", percentage: 61, color: "#9B7DB8" },
    { label: "Aromático", percentage: 60, color: "#6b8e4e" },
    { label: "Tropical", percentage: 60, color: "#3ac5a9" },
    { label: "Amaderado", percentage: 59, color: "#c17b2a" },
    { label: "Pachulí", percentage: 56, color: "#5a4a3a" },
  ],
  // 59 (33). Lattafa Shaheen Silver — CORREGIDO: Fragrantica (earthy 95%, mossy 90%, woody 81%, citrus 76%, patchouli 73%, aromatic 67%, musky 62%, green 61%, powdery 60%)
  33: [
    { label: "Terroso", percentage: 95, color: "#6b5b3a" },
    { label: "Musgoso", percentage: 90, color: "#4a6b3a" },
    { label: "Amaderado", percentage: 81, color: "#c17b2a" },
    { label: "Cítrico", percentage: 76, color: "#f0c934" },
    { label: "Pachulí", percentage: 73, color: "#5a4a3a" },
    { label: "Aromático", percentage: 67, color: "#6b8e4e" },
    { label: "Almizclado", percentage: 62, color: "#a0a0a0" },
    { label: "Verde", percentage: 61, color: "#4a7a3a" },
    { label: "Atalcado", percentage: 60, color: "#d4c5a9" },
  ],
  // 60 (34). Lattafa Hala — CORREGIDO: Fragrantica (amber 80%, fresh spicy 78%, woody 69%, smoky 65%, warm spicy 61%, balsamic 50%, powdery 30%, musky 25%)
  34: [
    { label: "Ámbar", percentage: 80, color: "#bc4d10" },
    { label: "Fresco Especiado", percentage: 78, color: "#83C928" },
    { label: "Amaderado", percentage: 69, color: "#c17b2a" },
    { label: "Ahumado", percentage: 65, color: "#7a6b5d" },
    { label: "Cálido Especiado", percentage: 61, color: "#c45a3a" },
    { label: "Balsámico", percentage: 50, color: "#8b6e4e" },
    { label: "Atalcado", percentage: 30, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 25, color: "#a0a0a0" },
  ],
  // 61 (35). Lattafa Ishq Al Shuyukh Gold — CORREGIDO: Fragrantica (leather 83%, vanilla 66%, musky 66%, powdery 66%, amber 63%, sweet 63%, caramel 59%, animalic 59%)
  35: [
    { label: "Cuero", percentage: 83, color: "#8b5e3c" },
    { label: "Vainilla", percentage: 66, color: "#c9a033" },
    { label: "Almizclado", percentage: 66, color: "#a0a0a0" },
    { label: "Atalcado", percentage: 66, color: "#d4c5a9" },
    { label: "Ámbar", percentage: 63, color: "#bc4d10" },
    { label: "Dulce", percentage: 63, color: "#f0a830" },
    { label: "Caramelo", percentage: 59, color: "#d4855a" },
    { label: "Animálico", percentage: 59, color: "#8b6e4e" },
  ],
  // 62 (36). Lattafa Ishq Al Shuyukh Silver — CORREGIDO: Fragrantica (sweet 98%, citrus 97%, fruity 90%, woody 88%, fresh spicy 86%, vanilla 72%, tropical 68%, warm spicy 65%, fresh 63%)
  36: [
    { label: "Dulce", percentage: 98, color: "#f0a830" },
    { label: "Cítrico", percentage: 97, color: "#f0c934" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Amaderado", percentage: 88, color: "#c17b2a" },
    { label: "Fresco Especiado", percentage: 86, color: "#83C928" },
    { label: "Vainilla", percentage: 72, color: "#c9a033" },
    { label: "Tropical", percentage: 68, color: "#3ac5a9" },
    { label: "Cálido Especiado", percentage: 65, color: "#c45a3a" },
    { label: "Fresco", percentage: 63, color: "#a0c4e8" },
  ],
  // 63 (37). Lattafa Ta'weel — CORREGIDO: Fragrantica (fresh spicy 80%, aromatic 76%, citrus 70%, woody 66%, amber 57%, fresh 55%, musky 55%, white floral 55%, lavender 53%)
  37: [
    { label: "Fresco Especiado", percentage: 80, color: "#83C928" },
    { label: "Aromático", percentage: 76, color: "#6b8e4e" },
    { label: "Cítrico", percentage: 70, color: "#f0c934" },
    { label: "Amaderado", percentage: 66, color: "#c17b2a" },
    { label: "Ámbar", percentage: 57, color: "#bc4d10" },
    { label: "Fresco", percentage: 55, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 55, color: "#a0a0a0" },
    { label: "Floral Blanco", percentage: 55, color: "#f0e6f6" },
    { label: "Lavanda", percentage: 53, color: "#9B7DB8" },
  ],
  // 64 (38). Lattafa Teriaq Intense — CORREGIDO: Fragrantica (amber 100%, warm spicy 78%, fruity 74%, cinnamon 73%, aromatic 64%, vanilla 54%)
  38: [
    { label: "Ámbar", percentage: 100, color: "#bc4d10" },
    { label: "Cálido Especiado", percentage: 78, color: "#c45a3a" },
    { label: "Afrutado", percentage: 74, color: "#e75a8d" },
    { label: "Canela", percentage: 73, color: "#d4855a" },
    { label: "Aromático", percentage: 64, color: "#6b8e4e" },
    { label: "Vainilla", percentage: 54, color: "#c9a033" },
  ],
  // 65 (39). Lattafa Musamam White Intense — CORREGIDO: Fragrantica (woody 86%, warm spicy 82%, coconut 79%, sweet 78%, citrus 75%, powdery 71%, amber 70%, musky 70%, yellow floral 58%)
  39: [
    { label: "Amaderado", percentage: 86, color: "#c17b2a" },
    { label: "Cálido Especiado", percentage: 82, color: "#c45a3a" },
    { label: "Coco", percentage: 79, color: "#d4c5a9" },
    { label: "Dulce", percentage: 78, color: "#f0a830" },
    { label: "Cítrico", percentage: 75, color: "#f0c934" },
    { label: "Atalcado", percentage: 71, color: "#d4c5a9" },
    { label: "Ámbar", percentage: 70, color: "#bc4d10" },
    { label: "Almizclado", percentage: 70, color: "#a0a0a0" },
    { label: "Floral Amarillo", percentage: 58, color: "#f0e68c" },
  ],
  // 66 (40). Lattafa Victoria — CORREGIDO: Fragrantica (vanilla 59%, citrus 59%, white floral 58%, powdery 52%)
  40: [
    { label: "Vainilla", percentage: 59, color: "#c9a033" },
    { label: "Cítrico", percentage: 59, color: "#f0c934" },
    { label: "Floral Blanco", percentage: 58, color: "#f0e6f6" },
    { label: "Atalcado", percentage: 52, color: "#d4c5a9" },
  ],
  // 67 (41). Lattafa Art of Universe — CORREGIDO: Fragrantica (citrus 77%, fruity 75%, fresh spicy 70%, sweet 65%, musky 64%, green 62%, fresh 59%, white floral 58%, powdery 58%)
  41: [
    { label: "Cítrico", percentage: 77, color: "#f0c934" },
    { label: "Afrutado", percentage: 75, color: "#e75a8d" },
    { label: "Fresco Especiado", percentage: 70, color: "#83C928" },
    { label: "Dulce", percentage: 65, color: "#f0a830" },
    { label: "Almizclado", percentage: 64, color: "#a0a0a0" },
    { label: "Verde", percentage: 62, color: "#4a7a3a" },
    { label: "Fresco", percentage: 59, color: "#a0c4e8" },
    { label: "Floral Blanco", percentage: 58, color: "#f0e6f6" },
    { label: "Atalcado", percentage: 58, color: "#d4c5a9" },
  ],
  // 68 (42). Lattafa Vanilla Freak — CORREGIDO: Fragrantica (sweet 61%, vanilla 55%, almond 53%, lactonic 49%, nutty 30%, powdery 24%, fruity 24%, musky 22%)
  42: [
    { label: "Dulce", percentage: 61, color: "#f0a830" },
    { label: "Vainilla", percentage: 55, color: "#c9a033" },
    { label: "Almendra", percentage: 53, color: "#c9a87c" },
    { label: "Lácteo", percentage: 49, color: "#f5f0e0" },
    { label: "Avellana", percentage: 30, color: "#8b6e4e" },
    { label: "Atalcado", percentage: 24, color: "#d4c5a9" },
    { label: "Afrutado", percentage: 24, color: "#e75a8d" },
    { label: "Almizclado", percentage: 22, color: "#a0a0a0" },
  ],
  // 69 (43). Lattafa Berry On Top — CORREGIDO: Fragrantica (sweet 84%, fruity 73%, vanilla 49%, powdery 45%, musky 30%, balsamic 20%, spicy 15%, animalic 5%)
  43: [
    { label: "Dulce", percentage: 84, color: "#f0a830" },
    { label: "Afrutado", percentage: 73, color: "#e75a8d" },
    { label: "Vainilla", percentage: 49, color: "#c9a033" },
    { label: "Atalcado", percentage: 45, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 30, color: "#a0a0a0" },
    { label: "Balsámico", percentage: 20, color: "#8b6e4e" },
  ],
  // 70 (44). Lattafa Choco Overdose — CORREGIDO: Fragrantica (sweet 96%, cacao 92%, vanilla 91%, warm spicy 76%, caramel 74%, amber 56%, balsamic 40%, powdery 35%)
  44: [
    { label: "Dulce", percentage: 96, color: "#f0a830" },
    { label: "Cacao", percentage: 92, color: "#5a3a2a" },
    { label: "Vainilla", percentage: 91, color: "#c9a033" },
    { label: "Cálido Especiado", percentage: 76, color: "#c45a3a" },
    { label: "Caramelo", percentage: 74, color: "#c98030" },
    { label: "Ámbar", percentage: 56, color: "#bc4d10" },
    { label: "Balsámico", percentage: 40, color: "#8b6e4e" },
    { label: "Atalcado", percentage: 35, color: "#d4c5a9" },
  ],
  // 71 (45). Lattafa Mallow Madness — CORREGIDO: Fragrantica (sweet 68%, vanilla 67%, powdery 67%, fruity 54%, musky 40%, floral 30%, lactonic 25%, spicy 10%)
  45: [
    { label: "Dulce", percentage: 68, color: "#f0a830" },
    { label: "Vainilla", percentage: 67, color: "#c9a033" },
    { label: "Atalcado", percentage: 67, color: "#d4c5a9" },
    { label: "Afrutado", percentage: 54, color: "#e75a8d" },
    { label: "Almizclado", percentage: 40, color: "#a0a0a0" },
    { label: "Floral", percentage: 30, color: "#f0e6f6" },
    { label: "Lácteo", percentage: 25, color: "#f5f0e0" },
  ],
  // 72 (46). Lattafa Whipped Pleasure — CORREGIDO: Fragrantica (lactonic 94%, caramel 76%, sweet 62%, amber 58%, vanilla 54%, musky 40%, savory 30%, spicy 28%)
  46: [
    { label: "Lácteo", percentage: 94, color: "#f5f0e0" },
    { label: "Caramelo", percentage: 76, color: "#c98030" },
    { label: "Dulce", percentage: 62, color: "#f0a830" },
    { label: "Ámbar", percentage: 58, color: "#bc4d10" },
    { label: "Vainilla", percentage: 54, color: "#c9a033" },
    { label: "Almizclado", percentage: 40, color: "#a0a0a0" },
  ],
  // 73 (47). Lattafa The Kingdom Woman — CORREGIDO: Fragrantica (sweet 82%, fresh 81%, fruity 80%, vanilla 72%, floral 70%, powdery 66%, amber 63%, musky 60%, woody 59%)
  47: [
    { label: "Dulce", percentage: 82, color: "#f0a830" },
    { label: "Fresco", percentage: 81, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 80, color: "#e75a8d" },
    { label: "Vainilla", percentage: 72, color: "#c9a033" },
    { label: "Floral", percentage: 70, color: "#f0e6f6" },
    { label: "Atalcado", percentage: 66, color: "#d4c5a9" },
    { label: "Ámbar", percentage: 63, color: "#bc4d10" },
    { label: "Almizclado", percentage: 60, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 59, color: "#c17b2a" },
  ],
  // 74 (48). Lattafa The Kingdom Men — CORREGIDO: Fragrantica (vanilla 84%, aromatic 72%, sweet 71%, amber 67%, lavender 66%, green 61%, fresh spicy 60%, tobacco 53%, herbal 52%)
  48: [
    { label: "Vainilla", percentage: 84, color: "#c9a033" },
    { label: "Aromático", percentage: 72, color: "#6b8e4e" },
    { label: "Dulce", percentage: 71, color: "#f0a830" },
    { label: "Ámbar", percentage: 67, color: "#bc4d10" },
    { label: "Lavanda", percentage: 66, color: "#9B7DB8" },
    { label: "Verde", percentage: 61, color: "#4a7a3a" },
    { label: "Fresco Especiado", percentage: 60, color: "#83C928" },
    { label: "Tabaco", percentage: 53, color: "#5a3a2a" },
    { label: "Herbal", percentage: 52, color: "#4a7a3a" },
  ],
  // 75 (49). Lattafa Layaan — CORREGIDO: Fragrantica (white floral 55%, fresh 54%, musky 52%, green 49%, woody 30%, powdery 30%, citrus 30%, lactonic 24%)
  49: [
    { label: "Floral Blanco", percentage: 55, color: "#f0e6f6" },
    { label: "Fresco", percentage: 54, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 52, color: "#a0a0a0" },
    { label: "Verde", percentage: 49, color: "#4a7a3a" },
    { label: "Amaderado", percentage: 30, color: "#c17b2a" },
    { label: "Atalcado", percentage: 30, color: "#d4c5a9" },
    { label: "Cítrico", percentage: 30, color: "#f0c934" },
    { label: "Lácteo", percentage: 24, color: "#f5f0e0" },
  ],
  // 76 (50). Lattafa Efeef — CORREGIDO: Fragrantica (white floral 80%, sweet 67%, woody 65%, citrus 64%, fruity 64%, tuberose 61%, amber 60%, powdery 56%, animalic 55%)
  50: [
    { label: "Floral Blanco", percentage: 80, color: "#f0e6f6" },
    { label: "Dulce", percentage: 67, color: "#f0a830" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
    { label: "Cítrico", percentage: 64, color: "#f0c934" },
    { label: "Afrutado", percentage: 64, color: "#e75a8d" },
    { label: "Tuberosa", percentage: 61, color: "#f0e6f6" },
    { label: "Ámbar", percentage: 60, color: "#bc4d10" },
    { label: "Atalcado", percentage: 56, color: "#d4c5a9" },
    { label: "Animálico", percentage: 55, color: "#8b6e4e" },
  ],
  // 77 (51). Lattafa Al Noble Safeer — CORREGIDO
  51: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 91, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 64, color: "#c17b2a" },
    { label: "Atalcado", percentage: 39, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 36, color: "#a0a0a0" },
    { label: "Caramelo", percentage: 34, color: "#c98030" },
    { label: "Aromático", percentage: 26, color: "#6b8e4e" },
    { label: "Ámbar", percentage: 22, color: "#f0a830" },
  ],
  // 78 (52). Lattafa Al Noble Ameer — CORREGIDO
  52: [
    { label: "Cálido Especiado", percentage: 100, color: "#c45a3a" },
    { label: "Oud", percentage: 95, color: "#5a3a2a" },
    { label: "Amaderado", percentage: 83, color: "#c17b2a" },
    { label: "Aromático", percentage: 65, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 61, color: "#a0c4e8" },
    { label: "Pachulí", percentage: 34, color: "#4a7a3a" },
    { label: "Afrutado", percentage: 34, color: "#e75a8d" },
    { label: "Especiado Suave", percentage: 33, color: "#c45a3a" },
  ],
  // 79 (53). Lattafa Al Noble Wazeer — CORREGIDO
  53: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Cálido Especiado", percentage: 37, color: "#c45a3a" },
    { label: "Atalcado", percentage: 27, color: "#d4c5a9" },
    { label: "Ámbar", percentage: 17, color: "#f0a830" },
    { label: "Whisky", percentage: 14, color: "#8b5e3c" },
    { label: "Aromático", percentage: 11, color: "#6b8e4e" },
    { label: "Balsámico", percentage: 10, color: "#8b6e4e" },
    { label: "Fresco Especiado", percentage: 9, color: "#a0c4e8" },
  ],
  // 80 (54). Lattafa Her Confession — CORREGIDO
  54: [
    { label: "Vainilla", percentage: 100, color: "#c9a033" },
    { label: "Floral Blanco", percentage: 98, color: "#f0e6f6" },
    { label: "Tuberosa", percentage: 66, color: "#f0e6f6" },
    { label: "Ámbar", percentage: 55, color: "#f0a830" },
    { label: "Almizclado", percentage: 51, color: "#a0a0a0" },
    { label: "Cálido Especiado", percentage: 49, color: "#c45a3a" },
    { label: "Atalcado", percentage: 46, color: "#d4c5a9" },
    { label: "Dulce", percentage: 37, color: "#f0a830" },
  ],

  // ─── Páginas 5-6 ───

  // 81 (55). Lattafa His Confession — CORREGIDO
  55: [
    { label: "Ámbar", percentage: 100, color: "#f0a830" },
    { label: "Vainilla", percentage: 93, color: "#c9a033" },
    { label: "Cálido Especiado", percentage: 63, color: "#c45a3a" },
    { label: "Atalcado", percentage: 59, color: "#d4c5a9" },
    { label: "Iris", percentage: 55, color: "#d4c5a9" },
    { label: "Amaderado", percentage: 51, color: "#c17b2a" },
    { label: "Aromático", percentage: 35, color: "#6b8e4e" },
    { label: "Balsámico", percentage: 33, color: "#8b6e4e" },
  ],
  // 82 (56). Lattafa Ajwaa — CORREGIDO
  56: [
    { label: "Ámbar", percentage: 100, color: "#f0a830" },
    { label: "Dulce", percentage: 94, color: "#f0a830" },
    { label: "Balsámico", percentage: 79, color: "#8b6e4e" },
    { label: "Especiado Suave", percentage: 71, color: "#c45a3a" },
    { label: "Cálido Especiado", percentage: 68, color: "#c45a3a" },
    { label: "Aromático", percentage: 67, color: "#6b8e4e" },
    { label: "Cítrico", percentage: 62, color: "#f0c934" },
    { label: "Afrutado", percentage: 56, color: "#e75a8d" },
    { label: "Ahumado", percentage: 55, color: "#7a6b5d" },
  ],
  // 83 (57). Lattafa Sehr — CORREGIDO
  57: [
    { label: "Vainilla", percentage: 100, color: "#c9a033" },
    { label: "Almendra", percentage: 84, color: "#c98030" },
    { label: "Cálido Especiado", percentage: 75, color: "#c45a3a" },
    { label: "Dulce", percentage: 74, color: "#f0a830" },
    { label: "Oud", percentage: 69, color: "#5a3a2a" },
    { label: "Ámbar", percentage: 68, color: "#f0a830" },
    { label: "Frutos Secos", percentage: 66, color: "#8b5e3c" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
    { label: "Afrutado", percentage: 63, color: "#e75a8d" },
    { label: "Canela", percentage: 62, color: "#c45a3a" },
  ],
  // 84 (58). Lattafa Habik Woman — CORREGIDO
  58: [
    { label: "Floral Blanco", percentage: 100, color: "#f0e6f6" },
    { label: "Floral", percentage: 82, color: "#e75a8d" },
    { label: "Fresco", percentage: 75, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 73, color: "#e75a8d" },
    { label: "Cítrico", percentage: 68, color: "#f0c934" },
    { label: "Dulce", percentage: 64, color: "#f0a830" },
    { label: "Almizclado", percentage: 62, color: "#a0a0a0" },
    { label: "Verde", percentage: 61, color: "#4a7a3a" },
    { label: "Ámbar", percentage: 59, color: "#f0a830" },
    { label: "Acuático", percentage: 58, color: "#4a8eb8" },
  ],
  // 85 (59). Lattafa Eternal Vanille — CORREGIDO
  59: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Vainilla", percentage: 98, color: "#c9a033" },
    { label: "Cálido Especiado", percentage: 92, color: "#c45a3a" },
    { label: "Oud", percentage: 87, color: "#5a3a2a" },
    { label: "Ámbar", percentage: 70, color: "#f0a830" },
    { label: "Cacao", percentage: 69, color: "#5a3a2a" },
    { label: "Dulce", percentage: 59, color: "#f0a830" },
    { label: "Almizclado", percentage: 56, color: "#a0a0a0" },
  ],
  // 86 (60). Lattafa Jassoor — CORREGIDO
  60: [
    { label: "Aromático", percentage: 100, color: "#6b8e4e" },
    { label: "Cálido Especiado", percentage: 84, color: "#c45a3a" },
    { label: "Afrutado", percentage: 81, color: "#e75a8d" },
    { label: "Fresco Especiado", percentage: 78, color: "#a0c4e8" },
    { label: "Tabaco", percentage: 76, color: "#5a3a2a" },
    { label: "Lavanda", percentage: 74, color: "#9b8ec4" },
    { label: "Dulce", percentage: 70, color: "#f0a830" },
    { label: "Fresco", percentage: 63, color: "#a0c4e8" },
    { label: "Verde", percentage: 63, color: "#4a7a3a" },
    { label: "Cítrico", percentage: 59, color: "#f0c934" },
  ],
  // 87 (61). Lattafa Dynasty — CORREGIDO
  61: [
    { label: "Fresco Especiado", percentage: 100, color: "#a0c4e8" },
    { label: "Ahumado", percentage: 86, color: "#7a6b5d" },
    { label: "Amaderado", percentage: 80, color: "#c17b2a" },
    { label: "Cítrico", percentage: 79, color: "#f0c934" },
    { label: "Herbal", percentage: 57, color: "#6b8e4e" },
    { label: "Aromático", percentage: 52, color: "#6b8e4e" },
    { label: "Atalcado", percentage: 44, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 39, color: "#a0a0a0" },
  ],
  // 88 (62). Lattafa Velvet Rose — CORREGIDO
  62: [
    { label: "Rosado", percentage: 100, color: "#e75a8d" },
    { label: "Ámbar", percentage: 88, color: "#f0a830" },
    { label: "Almizclado", percentage: 76, color: "#a0a0a0" },
    { label: "Pachulí", percentage: 66, color: "#4a7a3a" },
    { label: "Amaderado", percentage: 53, color: "#c17b2a" },
    { label: "Atalcado", percentage: 36, color: "#d4c5a9" },
    { label: "Cálido Especiado", percentage: 33, color: "#c45a3a" },
    { label: "Floral", percentage: 30, color: "#e75a8d" },
  ],
  // 89 (63). Lattafa Petra — CORREGIDO
  63: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Tuberosa", percentage: 72, color: "#f0e6f6" },
    { label: "Vainilla", percentage: 61, color: "#c9a033" },
    { label: "Coco", percentage: 60, color: "#f0c934" },
    { label: "Floral Blanco", percentage: 57, color: "#f0e6f6" },
    { label: "Afrutado", percentage: 55, color: "#e75a8d" },
    { label: "Ron", percentage: 53, color: "#8b5e3c" },
    { label: "Almizclado", percentage: 40, color: "#a0a0a0" },
  ],
  // 90 (64). Lattafa Atheeri — CORREGIDO
  64: [
    { label: "Floral", percentage: 100, color: "#e75a8d" },
    { label: "Vainilla", percentage: 65, color: "#c9a033" },
    { label: "Dulce", percentage: 58, color: "#f0a830" },
    { label: "Ámbar", percentage: 40, color: "#f0a830" },
    { label: "Atalcado", percentage: 38, color: "#d4c5a9" },
    { label: "Acuático", percentage: 38, color: "#4a8eb8" },
    { label: "Afrutado", percentage: 33, color: "#e75a8d" },
    { label: "Amaderado", percentage: 32, color: "#c17b2a" },
  ],
  // 91 (65). Lattafa Sakeena — CORREGIDO
  65: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Afrutado", percentage: 65, color: "#e75a8d" },
    { label: "Rosado", percentage: 28, color: "#e75a8d" },
    { label: "Tropical", percentage: 24, color: "#f0c934" },
    { label: "Vainilla", percentage: 23, color: "#c9a033" },
    { label: "Cítrico", percentage: 18, color: "#f0c934" },
    { label: "Fresco", percentage: 14, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 14, color: "#a0a0a0" },
  ],
  // 92 (66). Lattafa Emaan — CORREGIDO
  66: [
    { label: "Floral Blanco", percentage: 100, color: "#f0e6f6" },
    { label: "Tuberosa", percentage: 41, color: "#f0e6f6" },
    { label: "Cítrico", percentage: 39, color: "#f0c934" },
    { label: "Amaderado", percentage: 29, color: "#c17b2a" },
    { label: "Animálico", percentage: 27, color: "#8b6e4e" },
    { label: "Afrutado", percentage: 24, color: "#e75a8d" },
    { label: "Aromático", percentage: 22, color: "#6b8e4e" },
    { label: "Dulce", percentage: 21, color: "#f0a830" },
  ],
  // 93 (67). Lattafa Qimmah — CORREGIDO
  67: [
    { label: "Floral Blanco", percentage: 100, color: "#f0e6f6" },
    { label: "Vainilla", percentage: 99, color: "#c9a033" },
    { label: "Almendra", percentage: 63, color: "#c98030" },
    { label: "Dulce", percentage: 60, color: "#f0a830" },
    { label: "Cálido Especiado", percentage: 59, color: "#c45a3a" },
    { label: "Tuberosa", percentage: 53, color: "#f0e6f6" },
    { label: "Frutos Secos", percentage: 38, color: "#8b5e3c" },
    { label: "Atalcado", percentage: 37, color: "#d4c5a9" },
  ],
  // 94 (68). Lattafa Ameer Al Oudh Intense Oud — CORREGIDO
  68: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Vainilla", percentage: 86, color: "#c9a033" },
    { label: "Dulce", percentage: 70, color: "#f0a830" },
    { label: "Oud", percentage: 59, color: "#5a3a2a" },
    { label: "Atalcado", percentage: 36, color: "#d4c5a9" },
    { label: "Balsámico", percentage: 16, color: "#8b6e4e" },
    { label: "Cálido Especiado", percentage: 14, color: "#c45a3a" },
    { label: "Fresco Especiado", percentage: 12, color: "#a0c4e8" },
  ],
  // 95 (69). Lattafa Maahir — CORREGIDO
  69: [
    { label: "Atalcado", percentage: 100, color: "#d4c5a9" },
    { label: "Amaderado", percentage: 79, color: "#c17b2a" },
    { label: "Vainilla", percentage: 73, color: "#c9a033" },
    { label: "Almizclado", percentage: 69, color: "#a0a0a0" },
    { label: "Floral Blanco", percentage: 60, color: "#f0e6f6" },
    { label: "Dulce", percentage: 40, color: "#f0a830" },
    { label: "Afrutado", percentage: 39, color: "#e75a8d" },
    { label: "Floral", percentage: 37, color: "#e75a8d" },
  ],
  // 96 (70). Lattafa Maahir Black Edition — CORREGIDO
  70: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Fresco Especiado", percentage: 50, color: "#a0c4e8" },
    { label: "Cuero", percentage: 38, color: "#8b5e3c" },
    { label: "Aromático", percentage: 32, color: "#6b8e4e" },
    { label: "Cálido Especiado", percentage: 31, color: "#c45a3a" },
    { label: "Almizclado", percentage: 24, color: "#a0a0a0" },
    { label: "Ámbar", percentage: 21, color: "#f0a830" },
    { label: "Pachulí", percentage: 19, color: "#4a7a3a" },
  ],
  // 97 (71). Lattafa Maahir Legacy — CORREGIDO
  71: [
    { label: "Aromático", percentage: 100, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 96, color: "#a0c4e8" },
    { label: "Cítrico", percentage: 76, color: "#f0c934" },
    { label: "Verde", percentage: 63, color: "#4a7a3a" },
    { label: "Amaderado", percentage: 62, color: "#c17b2a" },
    { label: "Ámbar", percentage: 56, color: "#f0a830" },
    { label: "Dulce", percentage: 54, color: "#f0a830" },
    { label: "Lavanda", percentage: 52, color: "#9b8ec4" },
  ],
  // 98 (72). Lattafa Ramz Silver — CORREGIDO
  72: [
    { label: "Vainilla", percentage: 93, color: "#c9a033" },
    { label: "Aromático", percentage: 80, color: "#6b8e4e" },
    { label: "Dulce", percentage: 76, color: "#f0a830" },
    { label: "Afrutado", percentage: 74, color: "#e75a8d" },
    { label: "Atalcado", percentage: 72, color: "#d4c5a9" },
    { label: "Lavanda", percentage: 70, color: "#9b8ec4" },
    { label: "Fresco Especiado", percentage: 68, color: "#a0c4e8" },
    { label: "Verde", percentage: 67, color: "#4a7a3a" },
    { label: "Cálido Especiado", percentage: 66, color: "#c45a3a" },
  ],
  // 99 (73). Lattafa Ramz Gold — CORREGIDO
  73: [
    { label: "Afrutado", percentage: 84, color: "#e75a8d" },
    { label: "Amaderado", percentage: 78, color: "#c17b2a" },
    { label: "Floral Blanco", percentage: 77, color: "#f0e6f6" },
    { label: "Atalcado", percentage: 75, color: "#d4c5a9" },
    { label: "Rosado", percentage: 66, color: "#e75a8d" },
    { label: "Dulce", percentage: 64, color: "#f0a830" },
    { label: "Almizclado", percentage: 61, color: "#a0a0a0" },
    { label: "Cálido Especiado", percentage: 61, color: "#c45a3a" },
    { label: "Fresco", percentage: 60, color: "#a0c4e8" },
  ],
  // 100 (74). Lattafa Najdia — CORREGIDO
  74: [
    { label: "Cítrico", percentage: 82, color: "#f0c934" },
    { label: "Aromático", percentage: 76, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 73, color: "#a0c4e8" },
    { label: "Acuático", percentage: 72, color: "#4a8eb8" },
    { label: "Fresco", percentage: 71, color: "#a0c4e8" },
    { label: "Cálido Especiado", percentage: 66, color: "#c45a3a" },
    { label: "Amaderado", percentage: 61, color: "#c17b2a" },
    { label: "Canela", percentage: 60, color: "#c45a3a" },
    { label: "Lavanda", percentage: 60, color: "#9b8ec4" },
  ],
  // 101 (75). Lattafa Suqraat — CORREGIDO
  75: [
    { label: "Fresco Especiado", percentage: 94, color: "#a0c4e8" },
    { label: "Cítrico", percentage: 70, color: "#f0c934" },
    { label: "Atalcado", percentage: 69, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 66, color: "#a0a0a0" },
    { label: "Aromático", percentage: 65, color: "#6b8e4e" },
    { label: "Lavanda", percentage: 62, color: "#9b8ec4" },
    { label: "Amaderado", percentage: 61, color: "#c17b2a" },
    { label: "Ozónico", percentage: 58, color: "#4a8eb8" },
    { label: "Fresco", percentage: 56, color: "#a0c4e8" },
  ],
  // 102 (128). Lattafa Khamrah — CORREGIDO
  128: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Cálido Especiado", percentage: 85, color: "#c45a3a" },
    { label: "Vainilla", percentage: 83, color: "#c9a033" },
    { label: "Ámbar", percentage: 80, color: "#f0a830" },
    { label: "Canela", percentage: 73, color: "#c45a3a" },
    { label: "Amaderado", percentage: 56, color: "#c17b2a" },
    { label: "Fresco Especiado", percentage: 56, color: "#a0c4e8" },
    { label: "Afrutado", percentage: 52, color: "#e75a8d" },
  ],
  // 103 (129). Lattafa Khamrah Qahwa — CORREGIDO
  129: [
    { label: "Cálido Especiado", percentage: 100, color: "#c45a3a" },
    { label: "Dulce", percentage: 90, color: "#f0a830" },
    { label: "Vainilla", percentage: 84, color: "#c9a033" },
    { label: "Canela", percentage: 69, color: "#c45a3a" },
    { label: "Café", percentage: 66, color: "#3a2010" },
    { label: "Ámbar", percentage: 59, color: "#f0a830" },
    { label: "Atalcado", percentage: 53, color: "#d4c5a9" },
  ],
  // 104 (130). Lattafa Khamrah Dukhan — CORREGIDO
  130: [
    { label: "Ámbar", percentage: 100, color: "#f0a830" },
    { label: "Cálido Especiado", percentage: 94, color: "#c45a3a" },
    { label: "Dulce", percentage: 79, color: "#f0a830" },
    { label: "Tabaco", percentage: 58, color: "#5a3a2a" },
    { label: "Balsámico", percentage: 55, color: "#8b6e4e" },
    { label: "Vainilla", percentage: 55, color: "#c9a033" },
    { label: "Ahumado", percentage: 54, color: "#7a6b5d" },
  ],
  // 105 (131). Lattafa Yara — CORREGIDO
  131: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Vainilla", percentage: 98, color: "#c9a033" },
    { label: "Atalcado", percentage: 95, color: "#d4c5a9" },
    { label: "Tropical", percentage: 69, color: "#f0c934" },
    { label: "Afrutado", percentage: 67, color: "#e75a8d" },
    { label: "Almizclado", percentage: 67, color: "#a0a0a0" },
    { label: "Floral", percentage: 63, color: "#e75a8d" },
    { label: "Cítrico", percentage: 54, color: "#f0c934" },
  ],
  // 106 (132). Lattafa Yara Tous — CORREGIDO
  132: [
    { label: "Tropical", percentage: 100, color: "#f0c934" },
    { label: "Dulce", percentage: 96, color: "#f0a830" },
    { label: "Vainilla", percentage: 84, color: "#c9a033" },
    { label: "Floral Blanco", percentage: 83, color: "#f0e6f6" },
    { label: "Afrutado", percentage: 82, color: "#e75a8d" },
    { label: "Atalcado", percentage: 75, color: "#d4c5a9" },
    { label: "Coco", percentage: 69, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 65, color: "#a0a0a0" },
  ],
  // 107 (133). Lattafa Yara Moi — CORREGIDO
  133: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Floral Blanco", percentage: 98, color: "#f0e6f6" },
    { label: "Pachulí", percentage: 84, color: "#4a7a3a" },
    { label: "Cálido Especiado", percentage: 75, color: "#c45a3a" },
    { label: "Caramelo", percentage: 74, color: "#c98030" },
    { label: "Atalcado", percentage: 68, color: "#d4c5a9" },
    { label: "Afrutado", percentage: 66, color: "#e75a8d" },
    { label: "Ámbar", percentage: 65, color: "#f0a830" },
  ],
  // 108 (134). Lattafa Asad — CORREGIDO
  134: [
    { label: "Ámbar", percentage: 100, color: "#f0a830" },
    { label: "Fresco Especiado", percentage: 93, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 89, color: "#c17b2a" },
    { label: "Cálido Especiado", percentage: 86, color: "#c45a3a" },
    { label: "Vainilla", percentage: 85, color: "#c9a033" },
    { label: "Dulce", percentage: 77, color: "#f0a830" },
    { label: "Tabaco", percentage: 74, color: "#5a3a2a" },
    { label: "Atalcado", percentage: 64, color: "#d4c5a9" },
  ],
  // 109 (135). Lattafa Asad Bourbon — CORREGIDO
  135: [
    { label: "Vainilla", percentage: 100, color: "#c9a033" },
    { label: "Cacao", percentage: 90, color: "#5a3a2a" },
    { label: "Dulce", percentage: 80, color: "#f0a830" },
    { label: "Lavanda", percentage: 79, color: "#9b8ec4" },
    { label: "Fresco Especiado", percentage: 75, color: "#a0c4e8" },
    { label: "Ámbar", percentage: 70, color: "#f0a830" },
    { label: "Cálido Especiado", percentage: 70, color: "#c45a3a" },
    { label: "Aromático", percentage: 68, color: "#6b8e4e" },
  ],
  // 110 (136). Lattafa Asad Zanzibar — CORREGIDO
  136: [
    { label: "Vainilla", percentage: 100, color: "#c9a033" },
    { label: "Iris", percentage: 88, color: "#d4c5a9" },
    { label: "Atalcado", percentage: 87, color: "#d4c5a9" },
    { label: "Fresco Especiado", percentage: 82, color: "#a0c4e8" },
    { label: "Lavanda", percentage: 80, color: "#9b8ec4" },
    { label: "Salado", percentage: 68, color: "#4a8eb8" },
    { label: "Violeta", percentage: 64, color: "#9b8ec4" },
    { label: "Ámbar", percentage: 61, color: "#f0a830" },
    { label: "Cálido Especiado", percentage: 61, color: "#c45a3a" },
    { label: "Balsámico", percentage: 61, color: "#8b6e4e" },
  ],
  // 111 (150). Lattafa Opulent Dubai — CORREGIDO
  150: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Tropical", percentage: 98, color: "#f0c934" },
    { label: "Afrutado", percentage: 90, color: "#e75a8d" },
    { label: "Dulce", percentage: 75, color: "#f0a830" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
    { label: "Fresco Especiado", percentage: 66, color: "#a0c4e8" },
    { label: "Fresco", percentage: 59, color: "#a0c4e8" },
    { label: "Terpénico", percentage: 58, color: "#4a7a3a" },
    { label: "Ámbar", percentage: 56, color: "#f0a830" },
    { label: "Aromático", percentage: 55, color: "#6b8e4e" },
  ],
  // 112 (76). French Avenue Liquid Brun — CORREGIDO: accords de Fragrantica
  76: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 93, color: "#c45a3a" },
    { label: "Vainilla", percentage: 90, color: "#c9a033" },
    { label: "Canela", percentage: 67, color: "#c45a3a" },
    { label: "Floral Blanco", percentage: 44, color: "#f0e6f6" },
    { label: "Atalcado", percentage: 42, color: "#d4c5a9" },
    { label: "Cítrico", percentage: 40, color: "#f0c934" },
    { label: "Aromático", percentage: 38, color: "#6b8e4e" },
  ],
  // 113 (77). French Avenue Aether — CORREGIDO: accords de Fragrantica
  77: [
    { label: "Amaderado", percentage: 95, color: "#c17b2a" },
    { label: "Cítrico", percentage: 84, color: "#f0c934" },
    { label: "Afrutado", percentage: 62, color: "#e75a8d" },
    { label: "Almizclado", percentage: 50, color: "#a0a0a0" },
    { label: "Atalcado", percentage: 50, color: "#d4c5a9" },
    { label: "Verde", percentage: 48, color: "#4a7a3a" },
    { label: "Fresco Especiado", percentage: 39, color: "#a0c4e8" },
    { label: "Fresco", percentage: 38, color: "#a0c4e8" },
  ],
  // 114 (78). French Avenue Luscious — CORREGIDO: accords de Fragrantica
  78: [
    { label: "Vainilla", percentage: 95, color: "#c9a033" },
    { label: "Frutos Secos", percentage: 72, color: "#8b6b4a" },
    { label: "Especiado Cálido", percentage: 68, color: "#c45a3a" },
    { label: "Dulce", percentage: 62, color: "#f0a830" },
    { label: "Miel", percentage: 52, color: "#e8b830" },
    { label: "Almizclado", percentage: 46, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 46, color: "#c17b2a" },
    { label: "Atalcado", percentage: 46, color: "#d4c5a9" },
  ],
  // 115 (79). French Avenue Intense Addiction — CORREGIDO: accords de Fragrantica
  79: [
    { label: "Floral", percentage: 95, color: "#e75a8d" },
    { label: "Miel", percentage: 82, color: "#e8b830" },
    { label: "Dulce", percentage: 81, color: "#f0a830" },
    { label: "Almizclado", percentage: 55, color: "#a0a0a0" },
    { label: "Atalcado", percentage: 54, color: "#d4c5a9" },
    { label: "Cítrico", percentage: 34, color: "#f0c934" },
    { label: "Vainilla", percentage: 33, color: "#c9a033" },
    { label: "Animal", percentage: 16, color: "#8b4513" },
  ],
  // 116 (80). French Avenue Obsidian — CORREGIDO: accords de Fragrantica
  80: [
    { label: "Ámbar", percentage: 95, color: "#f0a830" },
    { label: "Cítrico", percentage: 85, color: "#f0c934" },
    { label: "Vainilla", percentage: 59, color: "#c9a033" },
    { label: "Aldehídico", percentage: 46, color: "#d4c5a9" },
    { label: "Aromático", percentage: 37, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 32, color: "#a0c4e8" },
    { label: "Dulce", percentage: 31, color: "#f0a830" },
    { label: "Fresco", percentage: 27, color: "#a0c4e8" },
  ],
  // 117 (81). French Avenue Vulcan Feu — CORREGIDO: accords de Fragrantica
  81: [
    { label: "Tropical", percentage: 95, color: "#f0c934" },
    { label: "Afrutado", percentage: 93, color: "#e75a8d" },
    { label: "Dulce", percentage: 87, color: "#f0a830" },
    { label: "Cítrico", percentage: 59, color: "#f0c934" },
    { label: "Amaderado", percentage: 37, color: "#c17b2a" },
    { label: "Fresco", percentage: 36, color: "#a0c4e8" },
    { label: "Fresco Especiado", percentage: 34, color: "#a0c4e8" },
    { label: "Aromático", percentage: 34, color: "#6b8e4e" },
  ],
  // 118 (82). Afnan Supremacy Not Only Intense — CORREGIDO: accords de Fragrantica
  82: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Musgoso", percentage: 77, color: "#4a7a3a" },
    { label: "Amaderado", percentage: 69, color: "#c17b2a" },
    { label: "Terroso", percentage: 68, color: "#8b6b4a" },
    { label: "Cítrico", percentage: 57, color: "#f0c934" },
    { label: "Fresco Especiado", percentage: 46, color: "#a0c4e8" },
    { label: "Ámbar", percentage: 41, color: "#f0a830" },
    { label: "Animal", percentage: 40, color: "#8b4513" },
  ],
  // 119 (83). Afnan Supremacy Silver — CORREGIDO: accords de Fragrantica
  83: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Cuero", percentage: 51, color: "#8b5e3c" },
    { label: "Amaderado", percentage: 50, color: "#c17b2a" },
    { label: "Dulce", percentage: 46, color: "#f0a830" },
    { label: "Ahumado", percentage: 41, color: "#7a6b5d" },
    { label: "Cítrico", percentage: 33, color: "#f0c934" },
    { label: "Almizclado", percentage: 29, color: "#a0a0a0" },
    { label: "Musgoso", percentage: 27, color: "#4a7a3a" },
  ],
  // 120 (84). Afnan Supremacy Incense — CORREGIDO: accords de Fragrantica
  84: [
    { label: "Ámbar", percentage: 95, color: "#f0a830" },
    { label: "Ahumado", percentage: 81, color: "#7a6b5d" },
    { label: "Fresco Especiado", percentage: 52, color: "#a0c4e8" },
    { label: "Amaderado", percentage: 46, color: "#c17b2a" },
    { label: "Especiado Cálido", percentage: 44, color: "#c45a3a" },
    { label: "Oud", percentage: 41, color: "#5a3a2a" },
    { label: "Balsámico", percentage: 37, color: "#8b6e4e" },
    { label: "Aromático", percentage: 32, color: "#6b8e4e" },
  ],

  // ─── Páginas 7-8: Afnan, Rave, Maison Alhambra, Dumont, Rasasi ───

  // 121 (85). Afnan Supremacy In Heaven — CORREGIDO: accords de Fragrantica
  85: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Amaderado", percentage: 88, color: "#c17b2a" },
    { label: "Afrutado", percentage: 64, color: "#e75a8d" },
    { label: "Verde", percentage: 56, color: "#4a7a3a" },
    { label: "Almizclado", percentage: 46, color: "#a0a0a0" },
    { label: "Atalcado", percentage: 44, color: "#d4c5a9" },
    { label: "Fresco Especiado", percentage: 40, color: "#a0c4e8" },
    { label: "Aromático", percentage: 31, color: "#6b8e4e" },
  ],
  // 122 (86). Afnan 9PM Rebel — CORREGIDO: accords de Fragrantica
  86: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Dulce", percentage: 83, color: "#f0a830" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
    { label: "Tropical", percentage: 40, color: "#f0c934" },
    { label: "Fresco", percentage: 36, color: "#a0c4e8" },
    { label: "Ámbar", percentage: 29, color: "#f0a830" },
    { label: "Musgoso", percentage: 29, color: "#4a7a3a" },
    { label: "Caramelo", percentage: 27, color: "#d4a030" },
  ],
  // 123 (87). Afnan 9PM Pour Femme — CORREGIDO: accords de Fragrantica
  87: [
    { label: "Amaderado", percentage: 95, color: "#c17b2a" },
    { label: "Afrutado", percentage: 59, color: "#e75a8d" },
    { label: "Rosado", percentage: 58, color: "#e75a8d" },
    { label: "Floral", percentage: 52, color: "#e75a8d" },
    { label: "Aromático", percentage: 47, color: "#6b8e4e" },
    { label: "Atalcado", percentage: 46, color: "#d4c5a9" },
    { label: "Violeta", percentage: 45, color: "#9b8ec4" },
    { label: "Fresco", percentage: 40, color: "#a0c4e8" },
  ],
  // 124 (137). Afnan 9PM — CORREGIDO: accords de Fragrantica
  137: [
    { label: "Vainilla", percentage: 95, color: "#c9a033" },
    { label: "Ámbar", percentage: 45, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 41, color: "#c45a3a" },
    { label: "Afrutado", percentage: 37, color: "#e75a8d" },
    { label: "Canela", percentage: 34, color: "#c45a3a" },
    { label: "Dulce", percentage: 34, color: "#f0a830" },
    { label: "Lavanda", percentage: 32, color: "#9b7ec8" },
    { label: "Aromático", percentage: 28, color: "#6b8e4e" },
  ],
  // 125 (138). Afnan 9PM Nite Out — CORREGIDO: accords de Fragrantica
  138: [
    { label: "Amaderado", percentage: 95, color: "#c17b2a" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Especiado Cálido", percentage: 82, color: "#c45a3a" },
    { label: "Dulce", percentage: 68, color: "#f0a830" },
    { label: "Tropical", percentage: 66, color: "#f0c934" },
    { label: "Aromático", percentage: 60, color: "#6b8e4e" },
    { label: "Lavanda", percentage: 47, color: "#9b7ec8" },
    { label: "Floral", percentage: 44, color: "#e75a8d" },
  ],
  // 126 (139). Afnan 9PM Elixir — CORREGIDO: accords de Fragrantica
  139: [
    { label: "Especiado Cálido", percentage: 95, color: "#c45a3a" },
    { label: "Vainilla", percentage: 57, color: "#c9a033" },
    { label: "Aromático", percentage: 52, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 47, color: "#a0c4e8" },
    { label: "Cuero", percentage: 33, color: "#8b5e3c" },
    { label: "Lavanda", percentage: 31, color: "#9b7ec8" },
    { label: "Balsámico", percentage: 29, color: "#8b6e4e" },
    { label: "Pachulí", percentage: 26, color: "#4a7a3a" },
  ],
  // 127 (140). Afnan 9AM Dive — CORREGIDO: accords de Fragrantica
  140: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Verde", percentage: 91, color: "#4a7a3a" },
    { label: "Amaderado", percentage: 88, color: "#c17b2a" },
    { label: "Fresco Especiado", percentage: 76, color: "#a0c4e8" },
    { label: "Cítrico", percentage: 75, color: "#f0c934" },
    { label: "Aromático", percentage: 75, color: "#6b8e4e" },
    { label: "Fresco", percentage: 69, color: "#a0c4e8" },
    { label: "Especiado Suave", percentage: 34, color: "#c45a3a" },
  ],
  // 128 (152). Afnan Turathi Electric — CORREGIDO: accords de Fragrantica
  152: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Afrutado", percentage: 60, color: "#e75a8d" },
    { label: "Dulce", percentage: 40, color: "#f0a830" },
    { label: "Almizclado", percentage: 35, color: "#a0a0a0" },
    { label: "Atalcado", percentage: 29, color: "#d4c5a9" },
    { label: "Fresco", percentage: 26, color: "#a0c4e8" },
    { label: "Floral Blanco", percentage: 26, color: "#f0e6f6" },
    { label: "Fresco Especiado", percentage: 25, color: "#a0c4e8" },
  ],
  // 129 (153). Afnan Turathi Blue — CORREGIDO: accords de Fragrantica
  153: [
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Almizclado", percentage: 58, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 49, color: "#c17b2a" },
    { label: "Fresco", percentage: 47, color: "#a0c4e8" },
    { label: "Ámbar", percentage: 36, color: "#f0a830" },
    { label: "Atalcado", percentage: 34, color: "#d4c5a9" },
    { label: "Especiado Cálido", percentage: 30, color: "#c45a3a" },
    { label: "Pachulí", percentage: 23, color: "#4a7a3a" },
  ],

  // ─── Rave ───

  // 130 (88). Rave Now — CORREGIDO: accords de Fragrantica
  88: [
    { label: "Afrutado", percentage: 95, color: "#e75a8d" },
    { label: "Dulce", percentage: 65, color: "#f0a830" },
    { label: "Tropical", percentage: 37, color: "#f0c934" },
    { label: "Fresco", percentage: 31, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 25, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 21, color: "#c17b2a" },
    { label: "Atalcado", percentage: 20, color: "#d4c5a9" },
    { label: "Cítrico", percentage: 19, color: "#f0c934" },
  ],
  // 131 (89). Rave Now Women — CORREGIDO: accords de Fragrantica
  89: [
    { label: "Dulce", percentage: 95, color: "#f0a830" },
    { label: "Atalcado", percentage: 67, color: "#d4c5a9" },
    { label: "Afrutado", percentage: 63, color: "#e75a8d" },
    { label: "Vainilla", percentage: 50, color: "#c9a033" },
    { label: "Floral Blanco", percentage: 48, color: "#f0e6f6" },
    { label: "Almizclado", percentage: 39, color: "#a0a0a0" },
    { label: "Fresco", percentage: 38, color: "#a0c4e8" },
    { label: "Cítrico", percentage: 31, color: "#f0c934" },
  ],
  // 132 (90). Rave Rage — CORREGIDO: accords de Fragrantica
  90: [
    { label: "Ámbar", percentage: 95, color: "#f0a830" },
    { label: "Aromático", percentage: 91, color: "#6b8e4e" },
    { label: "Verde", percentage: 85, color: "#4a7a3a" },
    { label: "Amaderado", percentage: 74, color: "#c17b2a" },
    { label: "Fresco Especiado", percentage: 68, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 46, color: "#a0a0a0" },
    { label: "Balsámico", percentage: 41, color: "#8b6e4e" },
    { label: "Floral", percentage: 41, color: "#e75a8d" },
  ],

  // ─── Maison Alhambra ───

  // 133 (92). Maison Alhambra Baroque Rouge 540 — CORREGIDO: acordes de Fragrantica
  92: [
    { label: "Ámbar", percentage: 100, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 90, color: "#c45a3a" },
    { label: "Almizclado", percentage: 80, color: "#a0a0a0" },
    { label: "Amaderado", percentage: 70, color: "#c17b2a" },
    { label: "Floral Blanco", percentage: 70, color: "#f0e6f6" },
    { label: "Metálico", percentage: 65, color: "#b0b0b0" },
    { label: "Cuero", percentage: 58, color: "#8b5e3c" },
    { label: "Empolvado", percentage: 53, color: "#d4c5a9" },
    { label: "Dulce", percentage: 51, color: "#f0a830" },
    { label: "Tabaco", percentage: 51, color: "#5a3a2a" },
  ],
  // 134 (93). Maison Alhambra Cassius — CORREGIDO: acordes de Fragrantica
  93: [
    { label: "Vainilla", percentage: 100, color: "#c9a033" },
    { label: "Pachulí", percentage: 84, color: "#4a7a3a" },
    { label: "Especiado Fresco", percentage: 79, color: "#a0c4e8" },
    { label: "Especiado Cálido", percentage: 64, color: "#c45a3a" },
    { label: "Amaderado", percentage: 62, color: "#c17b2a" },
    { label: "Afrutado", percentage: 59, color: "#e75a8d" },
    { label: "Balsámico", percentage: 56, color: "#8b6e4e" },
    { label: "Dulce", percentage: 53, color: "#f0a830" },
    { label: "Terroso", percentage: 51, color: "#6b5b3a" },
    { label: "Fresco", percentage: 48, color: "#a0c4e8" },
  ],
  // 135 (94). Maison Alhambra The Tux — CORREGIDO: acordes de Fragrantica
  94: [
    { label: "Pachulí", percentage: 100, color: "#4a7a3a" },
    { label: "Especiado Cálido", percentage: 96, color: "#c45a3a" },
    { label: "Vainilla", percentage: 72, color: "#c9a033" },
    { label: "Amaderado", percentage: 72, color: "#c17b2a" },
    { label: "Ámbar", percentage: 71, color: "#f0a830" },
    { label: "Terroso", percentage: 58, color: "#6b5b3a" },
    { label: "Floral", percentage: 58, color: "#e75a8d" },
    { label: "Balsámico", percentage: 57, color: "#8b6e4e" },
    { label: "Empolvado", percentage: 49, color: "#d4c5a9" },
  ],
  // 136 (95). Maison Alhambra Glacier Le Noir — CORREGIDO: acordes de Fragrantica
  95: [
    { label: "Especiado Cálido", percentage: 100, color: "#c45a3a" },
    { label: "Vainilla", percentage: 90, color: "#c9a033" },
    { label: "Aromático", percentage: 86, color: "#6b8e4e" },
    { label: "Lavanda", percentage: 83, color: "#9b8ec4" },
    { label: "Iris", percentage: 76, color: "#9b8ec4" },
    { label: "Empolvado", percentage: 76, color: "#d4c5a9" },
    { label: "Violeta", percentage: 53, color: "#9b6ec4" },
    { label: "Terroso", percentage: 48, color: "#6b5b3a" },
    { label: "Especiado Fresco", percentage: 46, color: "#a0c4e8" },
    { label: "Dulce", percentage: 45, color: "#f0a830" },
  ],
  // 137 (96). Maison Alhambra Céleste — CORREGIDO: acordes de Fragrantica
  96: [
    { label: "Floral Blanco", percentage: 100, color: "#f0e6f6" },
    { label: "Floral Amarillo", percentage: 89, color: "#f0c934" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Dulce", percentage: 62, color: "#f0a830" },
    { label: "Empolvado", percentage: 56, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 54, color: "#a0a0a0" },
    { label: "Floral", percentage: 54, color: "#e75a8d" },
    { label: "Cítrico", percentage: 52, color: "#f0c934" },
    { label: "Fresco", percentage: 50, color: "#a0c4e8" },
    { label: "Musgoso", percentage: 46, color: "#4a6a3a" },
  ],
  // 138 (97). Maison Alhambra Tobacco Touch — CORREGIDO: acordes de Fragrantica
  97: [
    { label: "Vainilla", percentage: 100, color: "#c9a033" },
    { label: "Dulce", percentage: 93, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 87, color: "#c45a3a" },
    { label: "Tabaco", percentage: 86, color: "#5a3a2a" },
    { label: "Amaderado", percentage: 58, color: "#c17b2a" },
    { label: "Afrutado", percentage: 56, color: "#e75a8d" },
    { label: "Cacao", percentage: 52, color: "#8b5e3c" },
    { label: "Empolvado", percentage: 49, color: "#d4c5a9" },
  ],
  // 159 (158). Maison Alhambra Glacier Bella — VERIFICADO: acordes de Fragrantica
  158: [
    { label: "Vainilla", percentage: 100, color: "#c9a033" },
    { label: "Empolvado", percentage: 53, color: "#d4c5a9" },
    { label: "Cítrico", percentage: 51, color: "#f0c934" },
    { label: "Dulce", percentage: 44, color: "#f0a830" },
    { label: "Especiado Fresco", percentage: 41, color: "#7ab648" },
  ],

  // ─── Dumont ───

  // 139 (98). Dumont Nitro Pour Homme — CORREGIDO: acordes de Fragrantica
  98: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Floral Blanco", percentage: 79, color: "#f0e6f6" },
    { label: "Amaderado", percentage: 75, color: "#c17b2a" },
    { label: "Aromático", percentage: 55, color: "#6b8e4e" },
    { label: "Empolvado", percentage: 54, color: "#d4c5a9" },
    { label: "Especiado Cálido", percentage: 54, color: "#c45a3a" },
    { label: "Especiado Fresco", percentage: 51, color: "#a0c4e8" },
    { label: "Almizclado", percentage: 50, color: "#a0a0a0" },
    { label: "Dulce", percentage: 48, color: "#f0a830" },
  ],
  // 140 (99). Dumont Nitro Blue — CORREGIDO: acordes de Fragrantica
  99: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Especiado Cálido", percentage: 88, color: "#c45a3a" },
    { label: "Ámbar", percentage: 70, color: "#f0a830" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
    { label: "Aromático", percentage: 60, color: "#6b8e4e" },
    { label: "Cítrico", percentage: 59, color: "#f0c934" },
    { label: "Canela", percentage: 54, color: "#c45a3a" },
    { label: "Floral Blanco", percentage: 52, color: "#f0e6f6" },
    { label: "Balsámico", percentage: 51, color: "#8b6e4e" },
    { label: "Empolvado", percentage: 47, color: "#d4c5a9" },
  ],
  // 141 (100). Dumont Nitro Red — CORREGIDO: acordes de Fragrantica
  100: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Ozónico", percentage: 100, color: "#8cbfd4" },
    { label: "Acuático", percentage: 98, color: "#4a8eb8" },
    { label: "Afrutado", percentage: 87, color: "#e75a8d" },
    { label: "Lavanda", percentage: 70, color: "#9b8ec4" },
    { label: "Ámbar", percentage: 69, color: "#f0a830" },
    { label: "Especiado Fresco", percentage: 66, color: "#a0c4e8" },
    { label: "Cítrico", percentage: 63, color: "#f0c934" },
    { label: "Aromático", percentage: 60, color: "#6b8e4e" },
    { label: "Especiado Cálido", percentage: 59, color: "#c45a3a" },
  ],
  // 142 (101). Dumont Nitro White — CORREGIDO: acordes de Fragrantica
  101: [
    { label: "Miel", percentage: 100, color: "#f0a830" },
    { label: "Ámbar", percentage: 99, color: "#f0a830" },
    { label: "Empolvado", percentage: 95, color: "#d4c5a9" },
    { label: "Vainilla", percentage: 90, color: "#c9a033" },
    { label: "Dulce", percentage: 89, color: "#f0a830" },
    { label: "Aromático", percentage: 88, color: "#6b8e4e" },
    { label: "Amaderado", percentage: 81, color: "#c17b2a" },
    { label: "Almizclado", percentage: 68, color: "#a0a0a0" },
    { label: "Especiado Fresco", percentage: 66, color: "#a0c4e8" },
    { label: "Animálico", percentage: 61, color: "#8b6914" },
  ],
  // 143 (102). Dumont Nitro Platinum — CORREGIDO: acordes de Fragrantica
  102: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Afrutado", percentage: 85, color: "#e75a8d" },
    { label: "Cítrico", percentage: 75, color: "#f0c934" },
    { label: "Dulce", percentage: 75, color: "#f0a830" },
    { label: "Vainilla", percentage: 75, color: "#c9a033" },
    { label: "Empolvado", percentage: 59, color: "#d4c5a9" },
    { label: "Especiado Suave", percentage: 56, color: "#c45a3a" },
    { label: "Ámbar", percentage: 55, color: "#f0a830" },
    { label: "Especiado Fresco", percentage: 51, color: "#a0c4e8" },
    { label: "Aromático", percentage: 50, color: "#6b8e4e" },
  ],

  // ─── Rasasi ───

  // 144 (122). Rasasi Hawas For Him — CORREGIDO: acordes de Fragrantica
  122: [
    { label: "Afrutado", percentage: 100, color: "#e75a8d" },
    { label: "Cítrico", percentage: 97, color: "#f0c934" },
    { label: "Acuático", percentage: 86, color: "#4a8eb8" },
    { label: "Fresco", percentage: 80, color: "#a0c4e8" },
    { label: "Especiado Cálido", percentage: 65, color: "#c45a3a" },
    { label: "Ámbar", percentage: 59, color: "#f0a830" },
    { label: "Dulce", percentage: 58, color: "#f0a830" },
    { label: "Almizclado", percentage: 55, color: "#a0a0a0" },
    { label: "Aromático", percentage: 55, color: "#6b8e4e" },
    { label: "Animálico", percentage: 54, color: "#8b6914" },
  ],
  // 145 (123). Rasasi Hawas Tropical — CORREGIDO: acordes de Fragrantica
  123: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Coco", percentage: 97, color: "#d4c5a9" },
    { label: "Verde", percentage: 94, color: "#4a7a3a" },
    { label: "Amaderado", percentage: 86, color: "#c17b2a" },
    { label: "Vainilla", percentage: 72, color: "#c9a033" },
    { label: "Afrutado", percentage: 68, color: "#e75a8d" },
    { label: "Aromático", percentage: 67, color: "#6b8e4e" },
    { label: "Lactónico", percentage: 63, color: "#f5e6c8" },
    { label: "Especiado Fresco", percentage: 60, color: "#a0c4e8" },
    { label: "Fresco", percentage: 59, color: "#a0c4e8" },
  ],
  // 146 (124). Rasasi Hawas Fire — CORREGIDO: acordes de Fragrantica
  124: [
    { label: "Ámbar", percentage: 100, color: "#f0a830" },
    { label: "Aromático", percentage: 88, color: "#6b8e4e" },
    { label: "Mineral", percentage: 65, color: "#7a6b5d" },
    { label: "Marino", percentage: 63, color: "#4a8eb8" },
    { label: "Especiado Suave", percentage: 61, color: "#c45a3a" },
    { label: "Floral Blanco", percentage: 58, color: "#f0e6f6" },
    { label: "Animálico", percentage: 55, color: "#8b6914" },
    { label: "Salado", percentage: 45, color: "#7a8b9a" },
  ],
  // 147 (125). Rasasi Hawas Malibu — CORREGIDO: acordes de Fragrantica
  125: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Ámbar", percentage: 86, color: "#f0a830" },
    { label: "Cítrico", percentage: 78, color: "#f0c934" },
    { label: "Afrutado", percentage: 77, color: "#e75a8d" },
    { label: "Empolvado", percentage: 67, color: "#d4c5a9" },
    { label: "Vainilla", percentage: 60, color: "#c9a033" },
    { label: "Iris", percentage: 57, color: "#9b8ec4" },
    { label: "Tropical", percentage: 56, color: "#f0c934" },
    { label: "Aromático", percentage: 56, color: "#6b8e4e" },
    { label: "Almizclado", percentage: 56, color: "#a0a0a0" },
  ],
  // 148 (126). Rasasi Hawas Ice — CORREGIDO: acordes de Fragrantica
  126: [
    { label: "Afrutado", percentage: 100, color: "#e75a8d" },
    { label: "Cítrico", percentage: 95, color: "#f0c934" },
    { label: "Dulce", percentage: 57, color: "#f0a830" },
    { label: "Fresco", percentage: 54, color: "#a0c4e8" },
    { label: "Aromático", percentage: 53, color: "#6b8e4e" },
    { label: "Almizclado", percentage: 51, color: "#a0a0a0" },
    { label: "Empolvado", percentage: 50, color: "#d4c5a9" },
    { label: "Especiado Fresco", percentage: 49, color: "#a0c4e8" },
    { label: "Verde", percentage: 48, color: "#4a7a3a" },
    { label: "Ámbar", percentage: 47, color: "#f0a830" },
  ],
  // 149 (127). Rasasi Hawas Elixir — CORREGIDO: acordes de Fragrantica
  127: [
    { label: "Vainilla", percentage: 100, color: "#c9a033" },
    { label: "Aromático", percentage: 83, color: "#6b8e4e" },
    { label: "Verde", percentage: 71, color: "#4a7a3a" },
    { label: "Dulce", percentage: 65, color: "#f0a830" },
    { label: "Especiado Fresco", percentage: 65, color: "#a0c4e8" },
    { label: "Especiado Cálido", percentage: 60, color: "#c45a3a" },
    { label: "Ámbar", percentage: 59, color: "#f0a830" },
    { label: "Chocolate", percentage: 56, color: "#5a3a2a" },
    { label: "Lavanda", percentage: 54, color: "#9b8ec4" },
    { label: "Empolvado", percentage: 51, color: "#d4c5a9" },
  ],

  // ==================== DAVIDOFF ====================
  // 155. Davidoff Cool Water (Caballero) — Fragrantica ID 507
  155: [
    { label: "Aromático", percentage: 95, color: "#6b8e4e" },
    { label: "Verde", percentage: 76, color: "#4a7c3f" },
    { label: "Marino", percentage: 73, color: "#4da6c9" },
    { label: "Fresco Especiado", percentage: 69, color: "#a0c4e8" },
    { label: "Lavanda", percentage: 61, color: "#9b8ec4" },
    { label: "Amaderado", percentage: 59, color: "#c17b2a" },
    { label: "Salado", percentage: 53, color: "#7a8b9a" },
  ],
  // 156. Davidoff Cool Water Woman (Dama) — Fragrantica ID 508
  156: [
    { label: "Fresco", percentage: 95, color: "#a0c4e8" },
    { label: "Floral", percentage: 93, color: "#e75a8d" },
    { label: "Afrutado", percentage: 90, color: "#d45a9d" },
    { label: "Acuático", percentage: 83, color: "#4da6c9" },
    { label: "Ozónico", percentage: 72, color: "#8cbfd4" },
    { label: "Dulce", percentage: 69, color: "#f0a830" },
    { label: "Floral Blanco", percentage: 47, color: "#f5c6d0" },
    { label: "Cítrico", percentage: 40, color: "#f0c934" },
  ],
  // 157. Davidoff Cool Water Intense (Caballero) — Fragrantica ID 55266
  157: [
    { label: "Ámbar", percentage: 95, color: "#f0a830" },
    { label: "Cítrico", percentage: 88, color: "#f0c934" },
    { label: "Coco", percentage: 73, color: "#c9a033" },
    { label: "Dulce", percentage: 38, color: "#e75a8d" },
    { label: "Lactónico", percentage: 25, color: "#f5e6c8" },
    { label: "Tropical", percentage: 22, color: "#e8a040" },
    { label: "Vainilla", percentage: 22, color: "#c9a033" },
    { label: "Animálico", percentage: 20, color: "#8b6914" },
  ],

  // ─── JEAN PAUL GAULTIER ───
  // 159. Le Male Le Parfum — ACUERDOS DE FRAGRANTICA
  159: [
    { label: "Cálido Especiado", percentage: 100, color: "#c45a3a" },
    { label: "Avainillado", percentage: 88, color: "#c9a033" },
    { label: "Lavanda", percentage: 82, color: "#9b8ec4" },
    { label: "Aromático", percentage: 75, color: "#6b8e4e" },
    { label: "Atalcado", percentage: 68, color: "#d4c5a9" },
    { label: "Iris", percentage: 62, color: "#9b8ec4" },
    { label: "Amaderado", percentage: 55, color: "#c17b2a" },
    { label: "Ámbar", percentage: 50, color: "#f0a830" },
    { label: "Violeta", percentage: 42, color: "#9b6ec4" },
  ],
  // 160. Le Beau Le Parfum — ACUERDOS DE FRAGRANTICA
  160: [
    { label: "Dulce", percentage: 100, color: "#f0a830" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Coco", percentage: 82, color: "#f5e6c8" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Avainillado", percentage: 72, color: "#c9a033" },
    { label: "Tropical", percentage: 65, color: "#e8a040" },
    { label: "Afrutado", percentage: 58, color: "#e75a8d" },
    { label: "Atalcado", percentage: 52, color: "#d4c5a9" },
    { label: "Iris", percentage: 48, color: "#9b8ec4" },
    { label: "Lactónico", percentage: 42, color: "#f5e6c8" },
  ],
  // 161. Le Male Elixir — ACUERDOS DE FRAGRANTICA
  161: [
    { label: "Avainillado", percentage: 100, color: "#c9a033" },
    { label: "Dulce", percentage: 92, color: "#f0a830" },
    { label: "Miel", percentage: 88, color: "#e8a040" },
    { label: "Aromático", percentage: 78, color: "#6b8e4e" },
    { label: "Ámbar", percentage: 72, color: "#f0a830" },
    { label: "Lavanda", percentage: 65, color: "#9b8ec4" },
    { label: "Tabaco", percentage: 58, color: "#8b6e4e" },
    { label: "Verde", percentage: 52, color: "#6b8e4e" },
    { label: "Fresco Especiado", percentage: 48, color: "#a0c4e8" },
    { label: "Atalcado", percentage: 42, color: "#d4c5a9" },
  ],
  // 162. Scandal Pour Homme — ACUERDOS DE FRAGRANTICA
  162: [
    { label: "Caramelo", percentage: 100, color: "#c9a033" },
    { label: "Aromático", percentage: 82, color: "#6b8e4e" },
    { label: "Dulce", percentage: 78, color: "#f0a830" },
    { label: "Cítrico", percentage: 72, color: "#f0c934" },
    { label: "Avainillado", percentage: 65, color: "#c9a033" },
    { label: "Ámbar", percentage: 58, color: "#f0a830" },
    { label: "Especiado Suave", percentage: 52, color: "#c45a3a" },
    { label: "Amaderado", percentage: 45, color: "#c17b2a" },
  ],
  // 163. Le Beau — ACUERDOS DE FRAGRANTICA
  163: [
    { label: "Coco", percentage: 100, color: "#f5e6c8" },
    { label: "Avainillado", percentage: 82, color: "#c9a033" },
    { label: "Dulce", percentage: 78, color: "#f0a830" },
    { label: "Cítrico", percentage: 65, color: "#f0c934" },
    { label: "Lactónico", percentage: 58, color: "#f5e6c8" },
    { label: "Aromático", percentage: 52, color: "#6b8e4e" },
    { label: "Ámbar", percentage: 48, color: "#f0a830" },
    { label: "Tropical", percentage: 42, color: "#e8a040" },
    { label: "Fresco Especiado", percentage: 38, color: "#a0c4e8" },
  ],
  // 164. Scandal (Mujer) — ACUERDOS DE FRAGRANTICA
  164: [
    { label: "Miel", percentage: 100, color: "#e8a040" },
    { label: "Dulce", percentage: 88, color: "#f0a830" },
    { label: "Floral Blanco", percentage: 78, color: "#e75a8d" },
    { label: "Cítrico", percentage: 72, color: "#f0c934" },
    { label: "Caramelo", percentage: 68, color: "#c9a033" },
    { label: "Animálico", percentage: 58, color: "#8b6914" },
    { label: "Cera de Abeja", percentage: 52, color: "#e8c840" },
    { label: "Pachulí", percentage: 48, color: "#6b8e4e" },
    { label: "Floral", percentage: 42, color: "#e75a8d" },
    { label: "Amaderado", percentage: 35, color: "#c17b2a" },
  ],
  // 165. Scandal Pour Homme Le Parfum — ACUERDOS DE FRAGRANTICA
  165: [
    { label: "Aromático", percentage: 100, color: "#6b8e4e" },
    { label: "Amaderado", percentage: 85, color: "#c17b2a" },
    { label: "Avainillado", percentage: 78, color: "#c9a033" },
    { label: "Cálido Especiado", percentage: 72, color: "#c45a3a" },
    { label: "Fresco Especiado", percentage: 65, color: "#a0c4e8" },
    { label: "Ámbar", percentage: 58, color: "#f0a830" },
    { label: "Dulce", percentage: 52, color: "#f0a830" },
    { label: "Atalcado", percentage: 48, color: "#d4c5a9" },
    { label: "Rosado", percentage: 42, color: "#e75a8d" },
    { label: "Herbal", percentage: 38, color: "#6b8e4e" },
  ],
  // 166. Scandal Le Parfum (Mujer) — ACUERDOS DE FRAGRANTICA
  166: [
    { label: "Caramelo", percentage: 100, color: "#c9a033" },
    { label: "Avainillado", percentage: 88, color: "#c9a033" },
    { label: "Floral Blanco", percentage: 78, color: "#e75a8d" },
    { label: "Dulce", percentage: 72, color: "#f0a830" },
    { label: "Salado", percentage: 65, color: "#a0c4e8" },
    { label: "Atalcado", percentage: 55, color: "#d4c5a9" },
    { label: "Balsámico", percentage: 45, color: "#8b6e4e" },
  ],
  // 167. Sceptre Malachite
  167: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Aromático", percentage: 78, color: "#6b8e4e" },
    { label: "Amaderado", percentage: 72, color: "#c17b2a" },
    { label: "Frutal", percentage: 65, color: "#e75a8d" },
    { label: "Especiado Fresco", percentage: 60, color: "#c45a3a" },
    { label: "Almizclado", percentage: 55, color: "#d4c5a9" },
    { label: "Ámbar", percentage: 50, color: "#f0a830" },
  ],
  // 168. Island (Khadlaj) — CORREGIDO: acordes de Fragrantica
  168: [
    { label: "Dulce", percentage: 100, color: "#c9a033" },
    { label: "Amaderado", percentage: 82, color: "#c17b2a" },
    { label: "Coco", percentage: 78, color: "#c9a033" },
    { label: "Ámbar", percentage: 72, color: "#f0a830" },
    { label: "Frutal", percentage: 68, color: "#e75a8d" },
    { label: "Vainilla", percentage: 62, color: "#c9a033" },
    { label: "Tropical", percentage: 58, color: "#e75a8d" },
  ],
  // 169. Island Dreams — CORREGIDO: acordes de Fragrantica
  169: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Especiado Fresco", percentage: 72, color: "#c45a3a" },
    { label: "Almizclado", percentage: 68, color: "#d4c5a9" },
    { label: "Ámbar", percentage: 62, color: "#f0a830" },
    { label: "Atalcado", percentage: 55, color: "#d4c5a9" },
  ],
  // 170. Island Vanilla Dunes — CORREGIDO: acordes de Fragrantica
  170: [
    { label: "Especiado Cálido", percentage: 100, color: "#c45a3a" },
    { label: "Vainilla", percentage: 88, color: "#c9a033" },
    { label: "Dulce", percentage: 82, color: "#c9a033" },
    { label: "Canela", percentage: 75, color: "#c45a3a" },
    { label: "Atalcado", percentage: 65, color: "#d4c5a9" },
    { label: "Floral Blanco", percentage: 60, color: "#e75a8d" },
    { label: "Ámbar", percentage: 55, color: "#f0a830" },
  ],
  // 176. Rome Pour Homme — CORREGIDO: acordes de Fragrantica
  176: [
    { label: "Aromático", percentage: 100, color: "#6b8e4e" },
    { label: "Especiado Fresco", percentage: 82, color: "#c45a3a" },
    { label: "Amaderado", percentage: 78, color: "#c17b2a" },
    { label: "Rosa", percentage: 65, color: "#e75a8d" },
    { label: "Herbal", percentage: 60, color: "#6b8e4e" },
    { label: "Especiado Suave", percentage: 55, color: "#c45a3a" },
  ],
  // 178. Bharara King — CORREGIDO: acordes de Fragrantica
  178: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Frutal", percentage: 78, color: "#e75a8d" },
    { label: "Dulce", percentage: 72, color: "#c9a033" },
    { label: "Vainilla", percentage: 68, color: "#c9a033" },
    { label: "Atalcado", percentage: 62, color: "#d4c5a9" },
    { label: "Almizclado", percentage: 58, color: "#d4c5a9" },
    { label: "Ámbar", percentage: 55, color: "#f0a830" },
  ],
  // 180. Bharara Queen — CORREGIDO: acordes de Fragrantica
  180: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Floral Blanco", percentage: 85, color: "#e75a8d" },
    { label: "Atalcado", percentage: 78, color: "#d4c5a9" },
    { label: "Caramelo", percentage: 72, color: "#c9a033" },
    { label: "Vainilla", percentage: 68, color: "#c9a033" },
    { label: "Cítrico", percentage: 62, color: "#f0c934" },
    { label: "Rosa", percentage: 58, color: "#e75a8d" },
  ],
  // 181. Viking Rio — CORREGIDO: acordes de Fragrantica
  181: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Avellana", percentage: 82, color: "#8b6e4e" },
    { label: "Cacao", percentage: 78, color: "#8b6e4e" },
    { label: "Caramelo", percentage: 72, color: "#c9a033" },
    { label: "Dulce", percentage: 68, color: "#c9a033" },
    { label: "Especiado Cálido", percentage: 62, color: "#c45a3a" },
    { label: "Musgoso", percentage: 55, color: "#7a6b5d" },
  ],
  // 182. Viking Dubai — CORREGIDO: acordes de Fragrantica
  182: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Ámbar", percentage: 78, color: "#f0a830" },
    { label: "Especiado Fresco", percentage: 72, color: "#c45a3a" },
    { label: "Almizclado", percentage: 68, color: "#d4c5a9" },
    { label: "Amaderado", percentage: 65, color: "#c17b2a" },
  ],
  // 183. Viking Cairo — CORREGIDO: acordes de Fragrantica
  183: [
    { label: "Cítrico", percentage: 100, color: "#f0c934" },
    { label: "Aromático", percentage: 82, color: "#6b8e4e" },
    { label: "Ámbar", percentage: 75, color: "#f0a830" },
    { label: "Especiado Fresco", percentage: 72, color: "#c45a3a" },
    { label: "Amaderado", percentage: 68, color: "#c17b2a" },
  ],
  // 184. Viking Kashmir — CORREGIDO: acordes de Fragrantica
  184: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Especiado Cálido", percentage: 82, color: "#c45a3a" },
    { label: "Aromático", percentage: 75, color: "#6b8e4e" },
    { label: "Atalcado", percentage: 68, color: "#d4c5a9" },
    { label: "Ámbar", percentage: 62, color: "#f0a830" },
  ],
  // 185. Sherif — ACORDES DE FRAGRANTICA
  185: [
    { label: "Amaderado", percentage: 100, color: "#c17b2a" },
    { label: "Frutal", percentage: 88, color: "#e75a8d" },
    { label: "Cítrico", percentage: 82, color: "#f0c934" },
    { label: "Verde", percentage: 72, color: "#6b8e4e" },
    { label: "Atalcado", percentage: 65, color: "#d4c5a9" },
    { label: "Musgoso", percentage: 60, color: "#5a7a3a" },
    { label: "Almizclado", percentage: 58, color: "#d4c5a9" },
    { label: "Fresco", percentage: 55, color: "#4a9eb5" },
    { label: "Especiado Fresco", percentage: 52, color: "#c45a3a" },
    { label: "Aromático", percentage: 48, color: "#6b8e4e" },
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

            {/* ─── Similar Perfumes ─── */}
            <SimilarPerfumes
              targetPerfume={perfume}
              allPerfumes={allPerfumesData}
              onSelectPerfume={(p) => {
                // Close current and let parent handle new selection
                onClose();
              }}
            />

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
