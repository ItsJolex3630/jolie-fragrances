/**
 * Similarity algorithm for comparing perfumes based on their notes and accords.
 * 
 * The similarity score (0–100%) is computed using three weighted components:
 *   1. Individual note overlap (Jaccard-like with percentage weighting) — 45%
 *   2. Olfactive accord overlap — 35%
 *   3. Category note overlap (PERFUME_NOTES) — 20%
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
  commonNotes: string[];
  commonAccords: string[];
}

// ─── Helper: normalise note name for fuzzy matching ───

const ALIASES: Record<string, string> = {
  "almizcle": "almizcle",
  "almizcle blanco": "almizcle",
  "musk": "almizcle",
  "ámbar gris": "ámbar",
  "ámbar gris claro": "ámbar",
  "ámbar ligero": "ámbar",
  "amberwood": "ámbar",
  "ambargris": "ámbar",
  "pachulí": "pachulí",
  "patchouli": "pachulí",
  "vainilla": "vainilla",
  "bergamota": "bergamota",
  "jazmín": "jazmín",
  "rosa": "rosa",
  "rosa turca": "rosa",
  "rosa de bulgaria": "rosa",
  "rosa búlgara": "rosa",
  "cedro": "cedro",
  "cedro blanco": "cedro",
  "madera de cedro": "cedro",
  "sándalo": "sándalo",
  "lavanda": "lavanda",
  "incienso": "incienso",
  "olíbano": "incienso",
  "vetiver": "vetiver",
  "pimienta": "pimienta",
  "pimienta negra": "pimienta",
  "pimienta rosa": "pimienta rosa",
  "cardamomo": "cardamomo",
  "canela": "canela",
  "azafrán": "azafrán",
  "nuez moscada": "nuez moscada",
  "haba tonka": "haba tonka",
  "tonka": "haba tonka",
  "ambroxan": "ambroxan",
  "madera de oud": "oud",
  "madera de agar / oud": "oud",
  "oud": "oud",
  "notas amaderadas": "notas amaderadas",
  "madera blanca": "notas amaderadas",
  "notas de madera": "notas amaderadas",
  "peonia": "peonía",
  "lirio del valle": "lirio del valle",
  "lirio de los valles": "lirio del valle",
  "flor de azahar": "flor de azahar",
  "flor de azahar del naranjo": "flor de azahar",
  "neroli": "flor de azahar",
  "grosellas negras": "grosellas",
  "grosella negra": "grosellas",
  "grosella roja": "grosellas",
  "notas acuáticas": "notas acuáticas",
  "notas marinas": "notas acuáticas",
  "musgo de roble": "musgo",
  "musgo": "musgo",
  "ládano": "ládano",
  "geranio": "geranio",
  "salvia": "salvia",
  "melocotón": "melocotón",
  "durazno (melocotón)": "melocotón",
  "durazno": "melocotón",
  "ylang-ylang": "ylang-ylang",
  "notas atalcadas": "notas atalcadas",
  "cashmeran": "cachemira",
  "cachemira": "cachemira",
};

function normalizeNote(name: string): string {
  const lower = name.toLowerCase().trim();
  return ALIASES[lower] ?? lower;
}

// ─── 1. Individual Note Overlap ───

function getAllNotesWithWeight(pyramid: { top: { name: string; percentage: number }[]; heart: { name: string; percentage: number }[]; base: { name: string; percentage: number }[] }): Map<string, number> {
  const map = new Map<string, number>();
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

function computeNoteOverlap(p1Id: number, p2Id: number): { score: number; common: string[] } {
  const pyramid1 = NOTE_PYRAMIDS[p1Id];
  const pyramid2 = NOTE_PYRAMIDS[p2Id];
  if (!pyramid1 || !pyramid2) return { score: 0, common: [] };

  const map1 = getAllNotesWithWeight(pyramid1);
  const map2 = getAllNotesWithWeight(pyramid2);

  const allKeys = new Set([...map1.keys(), ...map2.keys()]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  const common: string[] = [];

  for (const key of allKeys) {
    const v1 = map1.get(key) ?? 0;
    const v2 = map2.get(key) ?? 0;
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

// ─── 2. Accord Overlap ───

function computeAccordOverlap(p1Id: number, p2Id: number): { score: number; common: string[] } {
  const accords1 = PERFUME_ACCORDS[p1Id];
  const accords2 = PERFUME_ACCORDS[p2Id];
  if (!accords1 || !accords2) return { score: 0, common: [] };

  const map1 = new Map(accords1.map(a => [a.label.toLowerCase(), a.percentage]));
  const map2 = new Map(accords2.map(a => [a.label.toLowerCase(), a.percentage]));

  const allKeys = new Set([...map1.keys(), ...map2.keys()]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  const common: string[] = [];

  for (const key of allKeys) {
    const v1 = map1.get(key) ?? 0;
    const v2 = map2.get(key) ?? 0;
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

function computeCategoryOverlap(p1Id: number, p2Id: number): number {
  const cats1 = (PERFUME_NOTES as Record<number, string[]>)[p1Id] ?? [];
  const cats2 = (PERFUME_NOTES as Record<number, string[]>)[p2Id] ?? [];
  if (cats1.length === 0 && cats2.length === 0) return 50; // no data → neutral
  if (cats1.length === 0 || cats2.length === 0) return 25;

  const set1 = new Set(cats1.map(c => c.toLowerCase()));
  const set2 = new Set(cats2.map(c => c.toLowerCase()));
  const intersection = [...set1].filter(x => set2.has(x)).length;
  const union = new Set([...set1, ...set2]).size;

  return union === 0 ? 0 : (intersection / union) * 100;
}

// ─── Main: compute full similarity ───

export function computeSimilarity(p1: Perfume, p2: Perfume): SimilarityResult {
  const noteResult = computeNoteOverlap(p1.id, p2.id);
  const accordResult = computeAccordOverlap(p1.id, p2.id);
  const categoryScore = computeCategoryOverlap(p1.id, p2.id);

  // Weighted combination
  const score = Math.round(
    noteResult.score * 0.45 +
    accordResult.score * 0.35 +
    categoryScore * 0.20
  );

  return {
    perfume: p2,
    score: Math.min(100, Math.max(0, score)),
    noteOverlap: Math.round(noteResult.score),
    accordOverlap: Math.round(accordResult.score),
    categoryOverlap: Math.round(categoryScore),
    commonNotes: noteResult.common,
    commonAccords: accordResult.common,
  };
}

// ─── Find top N similar perfumes ───

export function findSimilarPerfumes(
  target: Perfume,
  catalog: Perfume[],
  limit: number = 8
): SimilarityResult[] {
  return catalog
    .filter(p => p.id !== target.id)
    .map(p => computeSimilarity(target, p))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
