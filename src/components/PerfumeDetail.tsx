"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Heart,
  ExternalLink,
  Gem,
  Sparkles,
  Wind,
  Flower2,
  TreePine,
  ChevronDown,
  Info,
} from "lucide-react";
import {
  getImageUrl,
  getFragranticaUrl,
  NOTES_INFO,
  type Perfume,
  type Note,
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

// ─── Detailed note pyramid data for Club de Nuit Intense Man ───
// This can be expanded per perfume. For now, we use a mapping.
interface NotePyramid {
  top: string[];
  heart: string[];
  base: string[];
}

const NOTE_PYRAMIDS: Record<number, NotePyramid> = {
  1: {
    top: ["Limón", "Pino", "Bergamota", "Artemisia"],
    heart: ["Rosa", "Jazmín", "Lirio del Valle", "Iris", "Azafrán"],
    base: ["Vainilla", "Ámbar", "Almizcle", "Sándalo", "Pachulí", "Tonka"],
  },
  // Add more per perfume as needed
};

// ─── Note category metadata ───
const noteCategories = [
  {
    key: "top" as const,
    label: "Notas de Salida",
    icon: Wind,
    color: "text-amber-200",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    description: "La primera impresión — volátil y efímera (0-15 min)",
    accentColor: "from-amber-500/20 to-transparent",
  },
  {
    key: "heart" as const,
    label: "Notas de Corazón",
    icon: Flower2,
    color: "text-pink-200",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    description: "El alma del perfume — define su carácter (15 min - 4h)",
    accentColor: "from-pink-500/20 to-transparent",
  },
  {
    key: "base" as const,
    label: "Notas de Fondo",
    icon: TreePine,
    color: "text-emerald-200",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    description: "La esencia que perdura en la piel (4h - 24h+)",
    accentColor: "from-emerald-500/20 to-transparent",
  },
];

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
  const [showNotesPyramid, setShowNotesPyramid] = useState(false);

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

  const notes = perfume.notes || [];
  const pyramid = NOTE_PYRAMIDS[perfume.id];

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
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#0e0e0e] shadow-2xl shadow-black/60"
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
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

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

            {/* Price */}
            {perfume.price && perfume.price > 0 && (
              <div className="mb-5">
                <span className="text-[10px] text-[#555] tracking-[0.15em] uppercase font-[family-name:var(--font-inter)]">
                  Precio
                </span>
                <p className="text-2xl font-bold text-[#d4af37] font-[family-name:var(--font-playfair)] mt-0.5">
                  ${perfume.price}
                </p>
              </div>
            )}

            {/* Notes badges section */}
            {notes.length > 0 && (
              <div className="mb-5">
                <span className="text-[10px] text-[#555] tracking-[0.15em] uppercase font-[family-name:var(--font-inter)] block mb-3">
                  Acuerdos Principales
                </span>
                <div className="flex flex-wrap gap-2">
                  {notes.map((note) => {
                    const info = NOTES_INFO[note as Note];
                    if (!info) return null;
                    return (
                      <div
                        key={note}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${info.bgColor} ${info.color} ${info.borderColor}`}
                      >
                        <span className="text-base">{info.emoji}</span>
                        <span className="text-xs font-medium font-[family-name:var(--font-inter)]">
                          {note}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── NOTES PYRAMID SECTION (Advanced) ─── */}
            {pyramid && (
              <div className="mb-5">
                <button
                  onClick={() => setShowNotesPyramid(!showNotesPyramid)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[rgba(212,175,55,0.15)] bg-[#0a0a0a]/50 hover:bg-[#0a0a0a] transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-[#d4af37]/60" />
                    <span className="text-sm text-white/70 font-[family-name:var(--font-inter)] font-medium group-hover:text-white transition-colors">
                      Pirámide Olfativa
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: showNotesPyramid ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4 text-[#d4af37]/40" />
                  </motion.div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: showNotesPyramid ? "auto" : 0,
                    opacity: showNotesPyramid ? 1 : 0,
                  }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    {/* Pyramid visualization */}
                    <div className="grid grid-cols-3 gap-3">
                      {noteCategories.map((category, catIndex) => {
                        const Icon = category.icon;
                        const categoryNotes = pyramid[category.key];
                        return (
                          <motion.div
                            key={category.key}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: catIndex * 0.15, duration: 0.4 }}
                            className={`relative flex flex-col items-center text-center p-4 rounded-xl border ${category.borderColor} ${category.bgColor} overflow-hidden`}
                          >
                            {/* Gradient accent at top */}
                            <div className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b ${category.accentColor}`} />

                            <div className="relative z-10">
                              <div className={`w-10 h-10 rounded-full ${category.bgColor} flex items-center justify-center mb-3 border ${category.borderColor}`}>
                                <Icon className={`w-4 h-4 ${category.color}`} />
                              </div>
                              <h4 className={`text-[11px] tracking-[0.15em] uppercase mb-1 font-medium ${category.color} font-[family-name:var(--font-inter)]`}>
                                {category.key === "top" ? "Salida" : category.key === "heart" ? "Corazón" : "Fondo"}
                              </h4>
                              <p className="text-[8px] text-white/25 mb-3 font-[family-name:var(--font-inter)] leading-tight">
                                {category.description.split("—")[0].trim()}
                              </p>
                              <ul className="space-y-1.5">
                                {categoryNotes.map((note, noteIndex) => (
                                  <motion.li
                                    key={note}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: catIndex * 0.15 + noteIndex * 0.05, duration: 0.3 }}
                                    className="text-[11px] text-white/60 font-light hover:text-white/90 transition-colors font-[family-name:var(--font-inter)]"
                                  >
                                    {note}
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Time progression bar */}
                    <div className="px-2">
                      <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-amber-400/60 to-amber-400/20 rounded-full" />
                        <div className="absolute inset-y-0 left-[15%] w-[35%] bg-gradient-to-r from-pink-400/20 to-pink-400/40 rounded-full" />
                        <div className="absolute inset-y-0 left-[50%] right-0 bg-gradient-to-r from-emerald-400/20 to-emerald-400/40 rounded-full" />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[8px] text-amber-300/40 font-[family-name:var(--font-inter)]">0 min</span>
                        <span className="text-[8px] text-pink-300/40 font-[family-name:var(--font-inter)]">15 min</span>
                        <span className="text-[8px] text-pink-300/40 font-[family-name:var(--font-inter)]">4h</span>
                        <span className="text-[8px] text-emerald-300/40 font-[family-name:var(--font-inter)]">24h+</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Action icons row */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
              <a
                href={`https://wa.me/584244055386?text=${encodeURIComponent(`Hola Jolie Fragances! Me gustaría consultar la disponibilidad de ${perfume.name} - ${perfume.brand}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20 hover:border-[#25D366]/35 transition-all duration-200"
                title="Consultar por WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-xs font-semibold font-[family-name:var(--font-inter)]">
                  Consultar
                </span>
              </a>

              <a
                href={getFragranticaUrl(perfume)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-white/40 hover:text-white/70 hover:border-white/20 transition-all duration-200"
                title="Ver en Fragrantica"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Gold accent line bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
      </motion.div>
    </motion.div>
  );
}
