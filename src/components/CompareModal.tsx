"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  GitCompareArrows,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ArrowLeftRight,
  Check,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import {
  type Perfume,
  getImageUrl,
} from "@/lib/perfumes";
import {
  NOTE_PYRAMIDS,
  PERFUME_ACCORDS,
} from "@/components/PerfumeDetail";
import { computeSimilarity } from "@/lib/similarity";

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

// ─── Note layer colors ───
const layerColors = {
  top: { bg: "bg-cyan-500/15", border: "border-cyan-500/30", text: "text-cyan-300", bar: "bg-cyan-400", label: "Salida" },
  heart: { bg: "bg-rose-500/15", border: "border-rose-500/30", text: "text-rose-300", bar: "bg-rose-400", label: "Corazón" },
  base: { bg: "bg-amber-500/15", border: "border-amber-500/30", text: "text-amber-300", bar: "bg-amber-400", label: "Base" },
};

// ─── Perfume Search Dropdown ───
function PerfumeSearchDropdown({
  perfumes,
  selected,
  onSelect,
  placeholder,
  excludeId,
}: {
  perfumes: Perfume[];
  selected: Perfume | null;
  onSelect: (p: Perfume) => void;
  placeholder: string;
  excludeId?: number;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return perfumes
      .filter(p => p.id !== excludeId)
      .filter(p => {
        if (!q) return true;
        return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      })
      .slice(0, 12);
  }, [perfumes, query, excludeId]);

  return (
    <div className="relative">
      <button
        onClick={() => { setIsOpen(!isOpen); setQuery(""); }}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-[rgba(212,175,55,0.15)] bg-[#111111] hover:border-[#d4af37]/30 transition-all"
      >
        {selected ? (
          <>
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0a0a0a] flex-shrink-0 border border-[rgba(212,175,55,0.1)]">
              <img
                src={getImageUrl(selected.fragranticaId)}
                alt=""
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="text-xs text-[#d4af37]/60 font-[family-name:var(--font-inter)]">{selected.brand}</p>
              <p className="text-sm text-white truncate font-[family-name:var(--font-playfair)]">{selected.name}</p>
            </div>
            <Check className="w-4 h-4 text-[#d4af37]" />
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-[#d4af37]/40" />
            <span className="text-sm text-white/30 font-[family-name:var(--font-inter)]">{placeholder}</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[rgba(212,175,55,0.15)] rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/50"
            >
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/40" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar perfume..."
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0a0a0a] border border-[rgba(212,175,55,0.1)] rounded-lg text-sm text-white placeholder:text-white/20 outline-none focus:border-[#d4af37]/30 font-[family-name:var(--font-inter)]"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onSelect(p); setIsOpen(false); setQuery(""); }}
                    className="w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-[rgba(212,175,55,0.05)] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#0a0a0a] flex-shrink-0 border border-[rgba(212,175,55,0.1)]">
                      <img
                        src={getImageUrl(p.fragranticaId)}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate font-[family-name:var(--font-inter)]">{p.name}</p>
                      <p className="text-xs text-[#d4af37]/50 font-[family-name:var(--font-inter)]">{p.brand} · {p.gender}</p>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="px-3 py-4 text-sm text-white/20 text-center font-[family-name:var(--font-inter)]">
                    No se encontraron perfumes
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Note Pyramid Column ───
function NotePyramidColumn({ perfumeId }: { perfumeId: number }) {
  const pyramid = NOTE_PYRAMIDS[perfumeId];
  if (!pyramid) {
    return (
      <p className="text-sm text-white/20 text-center py-8 font-[family-name:var(--font-inter)]">
        Pirámide de notas no disponible
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {(["top", "heart", "base"] as const).map(layer => {
        const style = layerColors[layer];
        const notes = pyramid[layer];
        if (!notes || notes.length === 0) return null;
        return (
          <div key={layer}>
            <p className={`text-[10px] tracking-[0.15em] uppercase mb-2 font-[family-name:var(--font-inter)] ${style.text}`}>
              {style.label}
            </p>
            <div className="space-y-1.5">
              {notes.map((note, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-white/70 truncate font-[family-name:var(--font-inter)]">{note.name}</span>
                      <span className="text-[10px] text-white/30 font-[family-name:var(--font-inter)] ml-1">{note.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${style.bar} transition-all duration-500`}
                        style={{ width: `${note.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Accords Row ───
function AccordsColumn({ perfumeId }: { perfumeId: number }) {
  const accords = PERFUME_ACCORDS[perfumeId];
  if (!accords || accords.length === 0) {
    return (
      <p className="text-sm text-white/20 text-center py-4 font-[family-name:var(--font-inter)]">
        Acordes no disponibles
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {accords.slice(0, 6).map((a, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/5 bg-white/[0.03]"
        >
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: a.color }}
          />
          <span className="text-[11px] text-white/60 font-[family-name:var(--font-inter)]">{a.label}</span>
          <span className="text-[9px] text-white/25 font-[family-name:var(--font-inter)]">{a.percentage}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Similarity Gauge ───
function SimilarityGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? "from-emerald-400 to-emerald-600" :
    score >= 45 ? "from-yellow-400 to-amber-500" :
    "from-red-400 to-rose-500";

  const label =
    score >= 80 ? "Muy Similar" :
    score >= 60 ? "Similar" :
    score >= 40 ? "Algo Similar" :
    score >= 20 ? "Poco Similar" :
    "Muy Diferente";

  return (
    <div className="text-center">
      <div className="relative w-28 h-28 mx-auto mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke="url(#simGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${score * 2.64} 264`}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="simGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={score >= 70 ? "#34d399" : score >= 45 ? "#fbbf24" : "#f87171"} />
              <stop offset="100%" stopColor={score >= 70 ? "#059669" : score >= 45 ? "#d97706" : "#dc2626"} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white font-[family-name:var(--font-playfair)]">{score}%</span>
          <span className="text-[9px] text-white/40 font-[family-name:var(--font-inter)] tracking-wider uppercase">Similitud</span>
        </div>
      </div>
      <span className={`text-xs font-semibold font-[family-name:var(--font-inter)] px-3 py-1 rounded-full bg-gradient-to-r ${color} text-[#0a0a0a]`}>
        {label}
      </span>
    </div>
  );
}

// ─── Main Compare Modal ───
export default function CompareModal({
  isOpen,
  onClose,
  perfumes,
  initialPerfume1,
  onViewPerfume,
}: {
  isOpen: boolean;
  onClose: () => void;
  perfumes: Perfume[];
  initialPerfume1?: Perfume | null;
  onViewPerfume?: (perfume: Perfume) => void;
}) {
  const [perfume1, setPerfume1] = useState<Perfume | null>(initialPerfume1 ?? null);
  const [perfume2, setPerfume2] = useState<Perfume | null>(null);

  // Update perfume1 when initialPerfume1 changes
  const handleSetPerfume1 = useCallback((p: Perfume) => {
    setPerfume1(p);
  }, []);
  const handleSetPerfume2 = useCallback((p: Perfume) => {
    setPerfume2(p);
  }, []);

  // Compute similarity
  const similarity = useMemo(() => {
    if (!perfume1 || !perfume2) return null;
    return computeSimilarity(perfume1, perfume2);
  }, [perfume1, perfume2]);

  // Find common individual notes for highlighting
  const commonNoteNames = useMemo(() => {
    if (!similarity) return new Set<string>();
    return new Set(similarity.commonNotes);
  }, [similarity]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 pt-8 pb-20"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="relative w-full max-w-6xl rounded-2xl border border-[rgba(212,175,55,0.15)] bg-[#0a0a0a] shadow-2xl shadow-black/50 overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[rgba(212,175,55,0.08)] px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-[family-name:var(--font-playfair)]">Comparar Perfumes</h2>
                <p className="text-xs text-white/30 font-[family-name:var(--font-inter)]">Selecciona dos perfumes para ver su similitud</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-[rgba(212,175,55,0.15)] bg-[#111111] flex items-center justify-center text-white/40 hover:text-white hover:border-[#d4af37]/30 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selection Row */}
          <div className="px-4 sm:px-6 py-4 border-b border-[rgba(212,175,55,0.05)]">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-center">
              <PerfumeSearchDropdown
                perfumes={perfumes}
                selected={perfume1}
                onSelect={handleSetPerfume1}
                placeholder="Seleccionar perfume 1"
                excludeId={perfume2?.id}
              />
              <div className="hidden sm:flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 flex items-center justify-center">
                  <GitCompareArrows className="w-4 h-4 text-[#d4af37]/60" />
                </div>
              </div>
              <PerfumeSearchDropdown
                perfumes={perfumes}
                selected={perfume2}
                onSelect={handleSetPerfume2}
                placeholder="Seleccionar perfume 2"
                excludeId={perfume1?.id}
              />
            </div>
          </div>

          {/* Comparison Content */}
          {!perfume1 || !perfume2 ? (
            <div className="px-6 py-16 text-center">
              <ArrowLeftRight className="w-12 h-12 text-[#d4af37]/15 mx-auto mb-4" />
              <p className="text-white/20 font-[family-name:var(--font-inter)] text-sm">
                Selecciona dos perfumes para comenzar la comparación
              </p>
            </div>
          ) : similarity ? (
            <div className="p-4 sm:p-6 space-y-6">
              {/* Similarity Score */}
              <div className="flex justify-center">
                <SimilarityGauge score={similarity.score} />
              </div>

              {/* Breakdown bars — 5 components with profile penalty */}
              <div className="grid grid-cols-5 gap-1.5 max-w-lg mx-auto">
                {[
                  { label: "Notas", value: similarity.noteOverlap, weight: "38%", color: "bg-[#d4af37]/60" },
                  { label: "Acordes", value: similarity.accordOverlap, weight: "35%", color: "bg-emerald-400/60" },
                  { label: "Categorías", value: similarity.categoryOverlap, weight: "7%", color: "bg-cyan-400/60" },
                  { label: "Género", value: similarity.genderBonus, weight: "8%", color: "bg-purple-400/60" },
                  { label: "Perfil", value: similarity.profilePenalty ?? 0, weight: "12%", color: "bg-rose-400/60" },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <div className="h-1.5 bg-white/5 rounded-full mb-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-white/50 font-[family-name:var(--font-inter)]">{item.label}</p>
                    <p className="text-[8px] text-white/25 font-[family-name:var(--font-inter)]">({item.weight}) {item.value}%</p>
                  </div>
                ))}
              </div>

              {/* Common notes chips */}
              {similarity.commonNotes.length > 0 && (
                <div className="text-center">
                  <p className="text-[10px] text-[#d4af37]/50 tracking-[0.15em] uppercase mb-2 font-[family-name:var(--font-inter)]">
                    Notas en común ({similarity.commonNotes.length})
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {similarity.commonNotes.map(note => (
                      <span
                        key={note}
                        className="px-2.5 py-1 rounded-full text-[11px] bg-[#d4af37]/10 text-[#d4af37]/70 border border-[#d4af37]/15 font-[family-name:var(--font-inter)]"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Common accords chips */}
              {similarity.commonAccords.length > 0 && (
                <div className="text-center">
                  <p className="text-[10px] text-emerald-400/50 tracking-[0.15em] uppercase mb-2 font-[family-name:var(--font-inter)]">
                    Acordes en común ({similarity.commonAccords.length})
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {similarity.commonAccords.map(accord => (
                      <span
                        key={accord}
                        className="px-2.5 py-1 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/15 font-[family-name:var(--font-inter)] capitalize"
                      >
                        {accord}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Common categories */}
              {similarity.commonCategories.length > 0 && (
                <div className="text-center">
                  <p className="text-[10px] text-purple-400/50 tracking-[0.15em] uppercase mb-2 font-[family-name:var(--font-inter)]">
                    Categorías en común ({similarity.commonCategories.length})
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {similarity.commonCategories.map(cat => (
                      <span
                        key={cat}
                        className="px-2.5 py-1 rounded-full text-[11px] bg-purple-500/10 text-purple-300/70 border border-purple-500/15 font-[family-name:var(--font-inter)] capitalize"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp consultation button */}
              <div className="flex justify-center mt-2">
                <a
                  href={`https://wa.me/584244055386?text=${encodeURIComponent(
                    `Hola Jolie Fragrances! Estoy comparando *${perfume1.name}* (${perfume1.brand}) y *${perfume2.name}* (${perfume2.brand}), y la similitud según sus notas es de *${similarity.score}%*. Me gustaría saber si realmente se parecen en su aroma. ¿Me pueden asesorar?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 flex items-center justify-center group-hover:bg-[#25D366]/25 transition-colors">
                    <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-[#25D366] font-[family-name:var(--font-inter)]">
                      ¿Realmente se parecen?
                    </p>
                    <p className="text-[10px] text-white/40 font-[family-name:var(--font-inter)]">
                      Consulta por WhatsApp — criterio olfativo
                    </p>
                  </div>
                </a>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Perfume 1 */}
                <div className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[#0d0d0d] p-4">
                  {/* Image + Info — clickable */}
                  <button
                    onClick={() => onViewPerfume?.(perfume1)}
                    className="w-full flex items-center gap-3 mb-4 text-left group/img hover:bg-white/[0.02] rounded-lg transition-colors -m-1 p-1 cursor-pointer"
                  >
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#080808] flex-shrink-0 border border-[rgba(212,175,55,0.1)] group-hover/img:border-[#d4af37]/30 transition-colors relative">
                      <img
                        src={getImageUrl(perfume1.fragranticaId)}
                        alt={perfume1.name}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-[#d4af37]/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-[#d4af37]/80" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-[#d4af37]/60 tracking-[0.1em] uppercase font-[family-name:var(--font-inter)]">{perfume1.brand}</p>
                      <p className="text-sm font-semibold text-white font-[family-name:var(--font-playfair)] leading-snug group-hover/img:text-[#d4af37] transition-colors">{perfume1.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border ${genderStyles[perfume1.gender]}`}>
                          <span>{genderIcons[perfume1.gender]}</span>
                          {perfume1.gender}
                        </span>
                        <span className="text-[8px] text-[#d4af37]/40 font-[family-name:var(--font-inter)] opacity-0 group-hover/img:opacity-100 transition-opacity">Ver detalle →</span>
                      </div>
                    </div>
                  </button>

                  {/* Note Pyramid */}
                  <NotePyramidColumn perfumeId={perfume1.id} />

                  {/* Accords */}
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-[10px] text-white/30 tracking-[0.1em] uppercase mb-2 font-[family-name:var(--font-inter)]">Acordes</p>
                    <AccordsColumn perfumeId={perfume1.id} />
                  </div>
                </div>

                {/* Perfume 2 */}
                <div className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[#0d0d0d] p-4">
                  {/* Image + Info — clickable */}
                  <button
                    onClick={() => onViewPerfume?.(perfume2)}
                    className="w-full flex items-center gap-3 mb-4 text-left group/img hover:bg-white/[0.02] rounded-lg transition-colors -m-1 p-1 cursor-pointer"
                  >
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#080808] flex-shrink-0 border border-[rgba(212,175,55,0.1)] group-hover/img:border-[#d4af37]/30 transition-colors relative">
                      <img
                        src={getImageUrl(perfume2.fragranticaId)}
                        alt={perfume2.name}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-[#d4af37]/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-[#d4af37]/80" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-[#d4af37]/60 tracking-[0.1em] uppercase font-[family-name:var(--font-inter)]">{perfume2.brand}</p>
                      <p className="text-sm font-semibold text-white font-[family-name:var(--font-playfair)] leading-snug group-hover/img:text-[#d4af37] transition-colors">{perfume2.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full border ${genderStyles[perfume2.gender]}`}>
                          <span>{genderIcons[perfume2.gender]}</span>
                          {perfume2.gender}
                        </span>
                        <span className="text-[8px] text-[#d4af37]/40 font-[family-name:var(--font-inter)] opacity-0 group-hover/img:opacity-100 transition-opacity">Ver detalle →</span>
                      </div>
                    </div>
                  </button>

                  <NotePyramidColumn perfumeId={perfume2.id} />

                  <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-[10px] text-white/30 tracking-[0.1em] uppercase mb-2 font-[family-name:var(--font-inter)]">Acordes</p>
                    <AccordsColumn perfumeId={perfume2.id} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
