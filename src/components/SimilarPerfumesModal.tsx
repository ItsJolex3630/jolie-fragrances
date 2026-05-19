"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Sparkles,
  ChevronDown,
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
        <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#080808] flex-shrink-0 border border-[rgba(212,175,55,0.08)]">
          <img
            src={getImageUrl(perfume.fragranticaId)}
            alt={perfume.name}
            className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <p className="text-[9px] text-[#d4af37]/50 tracking-[0.1em] uppercase font-[family-name:var(--font-inter)]">{perfume.brand}</p>
            <p className="text-sm font-semibold text-white/90 font-[family-name:var(--font-playfair)] leading-snug truncate">{perfume.name}</p>
            <span className={`inline-flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 rounded-full border mt-1 ${genderStyles[perfume.gender]}`}>
              <span>{genderIcons[perfume.gender]}</span>
              {perfume.gender}
            </span>
          </div>
          <div className="mt-1.5">
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-xs font-semibold font-[family-name:var(--font-inter)] ${getScoreColor(score)}`}>
                {score}%
              </span>
              <span className="text-[8px] text-white/25 font-[family-name:var(--font-inter)]">
                {score >= 70 ? "Muy Similar" : score >= 45 ? "Similar" : "Algo Similar"}
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
export default function SimilarPerfumesModal({
  isOpen,
  onClose,
  allPerfumes,
  onSelectPerfume,
}: {
  isOpen: boolean;
  onClose: () => void;
  allPerfumes: Perfume[];
  onSelectPerfume: (perfume: Perfume) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<Perfume | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset on close
  const handleClose = useCallback(() => {
    onClose();
    setSearchQuery("");
    setSelectedTarget(null);
    setShowSuggestions(false);
  }, [onClose]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    const query = searchQuery.toLowerCase();
    return allPerfumes.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [allPerfumes, searchQuery]);

  // Similar perfumes
  const similarResults = useMemo(() => {
    if (!selectedTarget) return [];
    return findSimilarPerfumes(selectedTarget, allPerfumes, 8);
  }, [selectedTarget, allPerfumes]);

  const handleSelectSuggestion = useCallback((perfume: Perfume) => {
    setSelectedTarget(perfume);
    setSearchQuery(perfume.name);
    setShowSuggestions(false);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm overflow-y-auto"
        >
          <div className="min-h-full flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[rgba(212,175,55,0.08)]">
              <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/15 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#d4af37]/60" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white font-[family-name:var(--font-playfair)]">
                      Descubre Perfumes Similares
                    </h2>
                    <p className="text-[10px] text-white/30 font-[family-name:var(--font-inter)]">
                      Busca un perfume y encuentra fragancias con perfil similar
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-full border border-[rgba(212,175,55,0.12)] bg-[#111111] flex items-center justify-center text-white/40 hover:text-white hover:border-[#d4af37]/30 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-3xl mx-auto px-4 py-6 w-full">
              {/* Search input */}
              <div className="relative mb-6" ref={searchRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]/50" />
                <input
                  type="text"
                  placeholder="Buscar perfume o marca..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-12 pr-10 py-3.5 bg-[#111111] border border-[rgba(212,175,55,0.15)] rounded-xl text-white placeholder:text-[#555] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all duration-300 outline-none font-[family-name:var(--font-inter)] text-sm"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTarget(null);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Autocomplete dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[rgba(212,175,55,0.15)] rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/50"
                    >
                      {suggestions.map((perfume) => (
                        <button
                          key={perfume.id}
                          onClick={() => handleSelectSuggestion(perfume)}
                          className="autocomplete-item w-full px-4 py-3 flex items-center gap-3 text-left transition-colors duration-200"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0d0d0d] flex-shrink-0 border border-[rgba(212,175,55,0.1)]">
                            <img
                              src={getImageUrl(perfume.fragranticaId)}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white truncate font-[family-name:var(--font-inter)]">
                              {perfume.name}
                            </p>
                            <p className="text-xs text-[#d4af37]/60 font-[family-name:var(--font-inter)]">
                              {perfume.brand} • {perfume.gender}
                            </p>
                          </div>
                          <ChevronDown className="w-3 h-3 text-white/20 rotate-[-90deg]" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected target perfume card */}
              {selectedTarget && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 p-4 rounded-xl border border-[rgba(212,175,55,0.15)] bg-[#111111] flex items-center gap-4"
                >
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#0d0d0d] flex-shrink-0 border border-[rgba(212,175,55,0.1)]">
                    <img
                      src={getImageUrl(selectedTarget.fragranticaId)}
                      alt={selectedTarget.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-[#d4af37]/50 tracking-[0.1em] uppercase font-[family-name:var(--font-inter)]">
                      Perfume seleccionado
                    </p>
                    <p className="text-base font-semibold text-white font-[family-name:var(--font-playfair)]">
                      {selectedTarget.name}
                    </p>
                    <p className="text-xs text-white/40 font-[family-name:var(--font-inter)]">
                      {selectedTarget.brand} • {selectedTarget.gender}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/15 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#d4af37]/60" />
                  </div>
                </motion.div>
              )}

              {/* Similar results */}
              {similarResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-[rgba(212,175,55,0.08)]" />
                    <span className="text-[10px] text-white/30 tracking-[0.15em] uppercase font-[family-name:var(--font-inter)]">
                      {similarResults.length} perfumes similares
                    </span>
                    <div className="h-px flex-1 bg-[rgba(212,175,55,0.08)]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {similarResults.map((result, i) => (
                      <SimilarPerfumeCard
                        key={result.perfume.id}
                        result={result}
                        onSelect={(perfume) => {
                          onSelectPerfume(perfume);
                        }}
                        index={i}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Empty state */}
              {!selectedTarget && searchQuery.trim().length < 2 && (
                <div className="text-center py-16">
                  <Sparkles className="w-10 h-10 text-[#d4af37]/15 mx-auto mb-4" />
                  <p className="text-sm text-white/25 font-[family-name:var(--font-inter)]">
                    Busca un perfume para descubrir fragancias similares
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
