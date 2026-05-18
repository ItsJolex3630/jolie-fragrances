"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Sparkles,
  ArrowLeftRight,
} from "lucide-react";
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

// ─── Similar Perfume Card (reused from SimilarPerfumes.tsx) ───
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

// ─── Main Modal Component ───
interface SimilarPerfumesModalProps {
  isOpen: boolean;
  onClose: () => void;
  allPerfumes: Perfume[];
  onSelectPerfume: (perfume: Perfume) => void;
}

export default function SimilarPerfumesModal({
  isOpen,
  onClose,
  allPerfumes,
  onSelectPerfume,
}: SimilarPerfumesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [targetPerfume, setTargetPerfume] = useState<Perfume | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (searchQuery.trim().length < 1) return [];
    const q = searchQuery.toLowerCase().trim();
    return allPerfumes
      .filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
      .slice(0, 6);
  }, [allPerfumes, searchQuery]);

  // Similar results
  const similarResults = useMemo(() => {
    if (!targetPerfume) return [];
    return findSimilarPerfumes(targetPerfume, allPerfumes, 8);
  }, [targetPerfume, allPerfumes]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Internal close handler that resets state
  const handleClose = useCallback(() => {
    setSearchQuery("");
    setTargetPerfume(null);
    setShowDropdown(false);
    onClose();
  }, [onClose]);

  // Handle perfume selection (also resets state)
  const handleSelectPerfume = useCallback((perfume: Perfume) => {
    setSearchQuery("");
    setTargetPerfume(null);
    setShowDropdown(false);
    onSelectPerfume(perfume);
  }, [onSelectPerfume]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="min-h-screen flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[rgba(212,175,55,0.08)] px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-[family-name:var(--font-playfair)]">
                  Descubre Perfumes Similares
                </h2>
                <p className="text-xs text-white/30 font-[family-name:var(--font-inter)]">
                  Busca un perfume y encuentra fragancias con perfil olfativo similar
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-xl border border-[rgba(212,175,55,0.15)] bg-[#111111] flex items-center justify-center text-white/40 hover:text-white hover:border-[#d4af37]/30 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
            {/* Search Section */}
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]/50" />
                <input
                  type="text"
                  placeholder="Escribe el nombre de un perfume..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#111111] border border-[rgba(212,175,55,0.15)] rounded-xl text-white placeholder:text-[#555] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all duration-300 outline-none font-[family-name:var(--font-inter)] text-sm"
                />
              </div>

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showDropdown && suggestions.length > 0 && !targetPerfume && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[rgba(212,175,55,0.15)] rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/50"
                  >
                    {suggestions.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setTargetPerfume(p);
                          setSearchQuery("");
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[rgba(212,175,55,0.05)] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0d0d0d] flex-shrink-0 border border-[rgba(212,175,55,0.1)]">
                          <img
                            src={getImageUrl(p.fragranticaId)}
                            alt=""
                            className="w-full h-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate font-[family-name:var(--font-inter)]">{p.name}</p>
                          <p className="text-xs text-[#d4af37]/60 font-[family-name:var(--font-inter)]">{p.brand} · {p.gender}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected perfume card */}
            {targetPerfume && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[rgba(212,175,55,0.15)] bg-[#111111] p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#080808] flex-shrink-0 border border-[rgba(212,175,55,0.1)]">
                    <img
                      src={getImageUrl(targetPerfume.fragranticaId)}
                      alt={targetPerfume.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#d4af37]/60 tracking-[0.1em] uppercase font-[family-name:var(--font-inter)]">{targetPerfume.brand}</p>
                    <p className="text-base font-semibold text-white font-[family-name:var(--font-playfair)]">{targetPerfume.name}</p>
                    <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border mt-1 ${genderStyles[targetPerfume.gender]}`}>
                      <span>{genderIcons[targetPerfume.gender]}</span>
                      {targetPerfume.gender}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setTargetPerfume(null);
                      setSearchQuery("");
                    }}
                    className="w-8 h-8 rounded-lg border border-[rgba(212,175,55,0.15)] bg-[#0a0a0a] flex items-center justify-center text-white/30 hover:text-white hover:border-[#d4af37]/30 transition-all flex-shrink-0"
                    title="Cambiar perfume"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Results section */}
            {targetPerfume && similarResults.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ArrowLeftRight className="w-4 h-4 text-[#d4af37]/50" />
                  <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-playfair)]">
                    Perfumes similares a {targetPerfume.name}
                  </h3>
                  <span className="text-[10px] text-white/25 font-[family-name:var(--font-inter)]">
                    {similarResults.length} resultados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {similarResults.map((result, i) => (
                    <SimilarPerfumeCard
                      key={result.perfume.id}
                      result={result}
                      onSelect={handleSelectPerfume}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!targetPerfume && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Sparkles className="w-12 h-12 text-[#d4af37]/15 mx-auto mb-4" />
                <p className="text-white/20 font-[family-name:var(--font-inter)] text-sm mb-2">
                  Busca un perfume para descubrir fragancias similares
                </p>
                <p className="text-white/10 font-[family-name:var(--font-inter)] text-xs">
                  Escribe el nombre o marca en la barra de búsqueda
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
