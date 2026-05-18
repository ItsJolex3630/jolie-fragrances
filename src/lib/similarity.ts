// ─── Similarity Algorithm for Perfumes ───
// Compares perfumes based on their olfactive categories (notes) from PERFUME_NOTES

import { type Perfume, PERFUME_NOTES } from "@/lib/perfumes";

export interface SimilarityResult {
  perfume: Perfume;
  score: number;
  commonNotes: string[];
}

/**
 * Compute similarity between two perfumes based on their olfactive categories.
 * Uses Jaccard index on the sets of olfactive notes.
 */
function computeCategorySimilarity(p1: Perfume, p2: Perfume): number {
  const notes1 = new Set(PERFUME_NOTES[p1.id] || []);
  const notes2 = new Set(PERFUME_NOTES[p2.id] || []);

  if (notes1.size === 0 && notes2.size === 0) return 0;
  if (notes1.size === 0 || notes2.size === 0) return 0;

  const intersection = new Set([...notes1].filter(x => notes2.has(x)));
  const union = new Set([...notes1, ...notes2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Get common olfactive categories between two perfumes.
 */
function getCommonCategories(p1: Perfume, p2: Perfume): string[] {
  const notes1 = new Set(PERFUME_NOTES[p1.id] || []);
  const notes2 = new Set(PERFUME_NOTES[p2.id] || []);
  return [...notes1].filter(x => notes2.has(x));
}

/**
 * Check if two perfumes share the same brand.
 */
function brandBonus(p1: Perfume, p2: Perfume): number {
  return p1.brand === p2.brand ? 0.1 : 0;
}

/**
 * Check if two perfumes share the same gender.
 */
function genderBonus(p1: Perfume, p2: Perfume): number {
  return p1.gender === p2.gender ? 0.05 : 0;
}

/**
 * Find the most similar perfumes to a target.
 * Returns up to `limit` results sorted by similarity score (0-100).
 */
export function findSimilarPerfumes(
  target: Perfume,
  catalog: Perfume[],
  limit: number = 8
): SimilarityResult[] {
  const results: SimilarityResult[] = [];

  for (const perfume of catalog) {
    // Skip the same perfume
    if (perfume.id === target.id) continue;

    const categorySim = computeCategorySimilarity(target, perfume);
    const brand = brandBonus(target, perfume);
    const gender = genderBonus(target, perfume);

    // Weighted score: category similarity is the main factor
    const rawScore = categorySim * 0.85 + brand + gender;
    const score = Math.min(100, Math.round(rawScore * 100));

    const commonNotes = getCommonCategories(target, perfume);

    results.push({ perfume, score, commonNotes });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}
