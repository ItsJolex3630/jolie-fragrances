"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeftRight } from "lucide-react";
import {
  type Perfume,
  getImageUrl,
} from "@/lib/perfumes";
import { findSimilarPerfumes, type SimilarityResult } from "@/lib/similarity";

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

// ─── Similarity color helpers ───
function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-amber-400";
  return "text-rose-400";
}

function getScoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 45) return "bg-amber-500/10 border-amber-500/20";
  return "bg-rose-500/10 border-rose-500/20";
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return "bg-emerald-400";
  if (score >= 45) return "bg-amber-400";
  return "bg-rose-400";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Muy Similar";
  if (score >= 60) return "Similar";
  if (score >= 40) return "Algo Similar";
  if (score >= 20) return "Poco Similar";
  return "Diferente";
}

// ─── Similar Perfume Card ───
function SimilarPerfumeCard({
  result,
  onSelect,
  index,
}: {
  result: SimilarityResult;
  onSelect: (perfume: Perfume) => void;
  index: number;
}) {
  const { perfume, score, commonNotes } = result;

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onSelect(perfume)}
      className="group w-full text-left rounded-xl border border-[rgba(212,175,55,0.08)] bg-[#0d0d0d] hover:border-[rgba(212,175,55,0.25)] transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-black/30"
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#080808] flex-shrink-0 border border-[rgba(212,175,55,0.08)]">
          <img
            src={getImageUrl(perfume.fragranticaId)}
            alt={perfume.name}
            className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <p className="text-[9px] text-[#d4af37]/50 tracking-[0.1em] uppercase font-[family-name:var(--font-inter)]">{perfume.brand}</p>
            <p className="text-sm font-semibold text-white/90 font-[family-name:var(--font-playfair)] leading-snug truncate">{perfume.name}</p>
            <span className={`inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full border mt-1 ${genderStyles[perfume.gender]}`}>
              <span>{genderIcons[perfume.gender]}</span>
              {perfume.gender}
            </span>
          </div>

          {/* Score bar */}
          <div className="mt-1.5">
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-xs font-semibold font-[family-name:var(--font-inter)] ${getScoreColor(score)}`}>
                {score}%
              </span>
              <span className="text-[8px] text-white/25 font-[family-name:var(--font-inter)]">
                {getScoreLabel(score)}
              </span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getScoreBarColor(score)} transition-all duration-700`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Common notes */}
      {commonNotes.length > 0 && (
        <div className="px-3 pb-2.5 pt-0">
          <div className="flex flex-wrap gap-1">
            {commonNotes.slice(0, 5).map(note => (
              <span
                key={note}
                className="px-1.5 py-0.5 rounded text-[8px] bg-[#d4af37]/5 text-[#d4af37]/50 border border-[#d4af37]/10 font-[family-name:var(--font-inter)]"
              >
                {note}
              </span>
            ))}
            {commonNotes.length > 5 && (
              <span className="px-1.5 py-0.5 rounded text-[8px] text-white/20 font-[family-name:var(--font-inter)]">
                +{commonNotes.length - 5} más
              </span>
            )}
          </div>
        </div>
      )}
    </motion.button>
  );
}

// ─── Main SimilarPerfumes Component ───
export default function SimilarPerfumes({
  targetPerfume,
  allPerfumes,
  onSelectPerfume,
}: {
  targetPerfume: Perfume;
  allPerfumes: Perfume[];
  onSelectPerfume: (perfume: Perfume) => void;
}) {
  const similar = useMemo(() => {
    return findSimilarPerfumes(targetPerfume, allPerfumes, 8);
  }, [targetPerfume, allPerfumes]);

  if (similar.length === 0) return null;

  // Group by similarity level
  const verySimilar = similar.filter(r => r.score >= 60);
  const somewhatSimilar = similar.filter(r => r.score >= 30 && r.score < 60);
  const different = similar.filter(r => r.score < 30);

  return (
    <div className="mt-6 pt-5 border-t border-[rgba(212,175,55,0.08)]">
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/15 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#d4af37]/60" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-playfair)]">
            Perfumes Similares
          </h3>
          <p className="text-[10px] text-white/30 font-[family-name:var(--font-inter)]">
            Basado en notas, acordes y categorías olfativas
          </p>
        </div>
      </div>

      {/* Similarity groups */}
      {verySimilar.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <p className="text-[10px] text-emerald-400/60 tracking-[0.1em] uppercase font-[family-name:var(--font-inter)]">
              Más similares
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {verySimilar.map((result, i) => (
              <SimilarPerfumeCard
                key={result.perfume.id}
                result={result}
                onSelect={onSelectPerfume}
                index={i}
              />
            ))}
          </div>
        </div>
      )}

      {somewhatSimilar.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <p className="text-[10px] text-amber-400/60 tracking-[0.1em] uppercase font-[family-name:var(--font-inter)]">
              Algo similares
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {somewhatSimilar.map((result, i) => (
              <SimilarPerfumeCard
                key={result.perfume.id}
                result={result}
                onSelect={onSelectPerfume}
                index={i + verySimilar.length}
              />
            ))}
          </div>
        </div>
      )}

      {different.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <p className="text-[10px] text-rose-400/60 tracking-[0.1em] uppercase font-[family-name:var(--font-inter)]">
              Perfil diferente
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {different.map((result, i) => (
              <SimilarPerfumeCard
                key={result.perfume.id}
                result={result}
                onSelect={onSelectPerfume}
                index={i + verySimilar.length + somewhatSimilar.length}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
