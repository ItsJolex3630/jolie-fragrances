"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, ShoppingBag, Tag, Gem } from "lucide-react";
import type { Combo } from "@/lib/combosData";

// ─── Fragrantica image URL builder ───
function getAvifUrl(fragranticaId: number): string {
  return `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${fragranticaId}.avif`;
}
function getJpgUrl(fragranticaId: number): string {
  return `https://fimgs.net/mdimg/perfume/${fragranticaId}.jpg`;
}

// ─── Category badge config ───
const categoryStyles: Record<string, { bg: string; border: string; text: string; icon: string; glow: string }> = {
  Pareja: {
    bg: "bg-pink-500/15",
    border: "border-pink-500/30",
    text: "text-pink-300",
    icon: "💖",
    glow: "shadow-pink-500/10",
  },
  "Todo Terreno": {
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    text: "text-blue-300",
    icon: "🏔️",
    glow: "shadow-blue-500/10",
  },
  Árabe: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-300",
    icon: "✨",
    glow: "shadow-amber-500/10",
  },
  Gourmand: {
    bg: "bg-purple-500/15",
    border: "border-purple-500/30",
    text: "text-purple-300",
    icon: "🍫",
    glow: "shadow-purple-500/10",
  },
};

// ─── Single bottle image with fallback chain ───
function PerfumeBottleImage({
  fragranticaId,
  alt,
  className = "",
}: {
  fragranticaId: number;
  alt: string;
  className?: string;
}) {
  const [triedJpg, setTriedJpg] = useState(false);
  const [imgError, setImgError] = useState(false);

  const src = triedJpg ? getJpgUrl(fragranticaId) : getAvifUrl(fragranticaId);

  const handleError = useCallback(() => {
    if (!triedJpg) {
      setTriedJpg(true);
    } else {
      setImgError(true);
    }
  }, [triedJpg]);

  if (imgError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Gem className="w-8 h-8 text-[#d4af37]/20" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain ${className}`}
      onError={handleError}
      loading="lazy"
      decoding="async"
      style={{ color: "transparent" }}
    />
  );
}

interface ComboCardProps {
  combo: Combo;
  onAddToCart?: (combo: Combo) => void;
}

export default function ComboCard({ combo, onAddToCart }: ComboCardProps) {
  const catStyle = categoryStyles[combo.category] ?? {
    bg: "bg-white/10",
    border: "border-white/20",
    text: "text-white/60",
    icon: "🎁",
    glow: "shadow-white/5",
  };

  const perfumeCount = combo.perfumes.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#0e0e0e] overflow-hidden shadow-2xl shadow-black/50 combo-card-glow"
    >
      {/* ─── Shimmer sweep overlay (CSS-driven on hover) ─── */}
      <div className="combo-card-shimmer z-30" />

      {/* ─── Top gold accent line ─── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      {/* ─── Savings badge (upper-left) ─── */}
      <div className="absolute top-3 left-3 z-20">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 border border-emerald-400/50 shadow-lg shadow-emerald-500/25 backdrop-blur-sm">
          <Tag className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white font-[family-name:var(--font-inter)] tracking-wide">
            AHORRA ${combo.savings}
          </span>
        </div>
      </div>

      {/* ─── Category badge (upper-right) ─── */}
      <div className="absolute top-3 right-3 z-20">
        <span
          className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border font-[family-name:var(--font-inter)] font-medium backdrop-blur-md shadow-lg ${catStyle.bg} ${catStyle.border} ${catStyle.text} ${catStyle.glow}`}
        >
          <span>{catStyle.icon}</span>
          {combo.category}
        </span>
      </div>

      {/* ─── Bottle Showcase Area ─── */}
      <div className="relative h-64 sm:h-72 bg-gradient-to-b from-[#060606] via-[#0a0a0a] to-[#0e0e0e] flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient radial glow behind bottles */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 55%, rgba(212,175,55,0.7) 0%, transparent 55%)",
            }}
          />
        </div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* ─── Bottles + Reflection container ─── */}
        <div className="relative flex flex-col items-center">
          {/* ─── Bottles row ─── */}
          <div className="relative flex items-end justify-center">
            {perfumeCount === 2 ? (
              /* ── Duo: V-shape with overlap ── */
              <>
                <motion.div
                  initial={{ opacity: 0, x: -25, rotate: 5 }}
                  animate={{ opacity: 1, x: 0, rotate: -4 }}
                  transition={{ delay: 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative z-10 -mr-5 combo-bottle-lift"
                  style={{ transform: "rotate(-4deg)" }}
                >
                  <div className="w-[100px] sm:w-[115px] h-[150px] sm:h-[170px]">
                    <PerfumeBottleImage
                      fragranticaId={combo.perfumes[0].fragranticaId}
                      alt={combo.perfumes[0].name}
                      className="w-full h-full drop-shadow-[0_6px_25px_rgba(0,0,0,0.7)]"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 25, rotate: -5 }}
                  animate={{ opacity: 1, x: 0, rotate: 4 }}
                  transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative z-20 -ml-5 combo-bottle-lift"
                  style={{ transform: "rotate(4deg)", transitionDelay: "0.05s" }}
                >
                  <div className="w-[100px] sm:w-[115px] h-[150px] sm:h-[170px]">
                    <PerfumeBottleImage
                      fragranticaId={combo.perfumes[1].fragranticaId}
                      alt={combo.perfumes[1].name}
                      className="w-full h-full drop-shadow-[0_6px_25px_rgba(0,0,0,0.7)]"
                    />
                  </div>
                </motion.div>
              </>
            ) : perfumeCount === 3 ? (
              /* ── Trio: fan arrangement with center dominant ── */
              <>
                <motion.div
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative z-10 -mr-3 combo-bottle-lift"
                  style={{ transform: "rotate(-7deg) translateY(6px)", transitionDelay: "0s" }}
                >
                  <div className="w-[85px] sm:w-[100px] h-[135px] sm:h-[155px]">
                    <PerfumeBottleImage
                      fragranticaId={combo.perfumes[0].fragranticaId}
                      alt={combo.perfumes[0].name}
                      className="w-full h-full drop-shadow-[0_6px_25px_rgba(0,0,0,0.7)]"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative z-30 -mx-1 combo-bottle-lift"
                  style={{ transitionDelay: "0.05s" }}
                >
                  <div className="w-[95px] sm:w-[110px] h-[160px] sm:h-[180px]">
                    <PerfumeBottleImage
                      fragranticaId={combo.perfumes[1].fragranticaId}
                      alt={combo.perfumes[1].name}
                      className="w-full h-full drop-shadow-[0_8px_30px_rgba(0,0,0,0.8)]"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative z-10 -ml-3 combo-bottle-lift"
                  style={{ transform: "rotate(7deg) translateY(6px)", transitionDelay: "0.1s" }}
                >
                  <div className="w-[85px] sm:w-[100px] h-[135px] sm:h-[155px]">
                    <PerfumeBottleImage
                      fragranticaId={combo.perfumes[2].fragranticaId}
                      alt={combo.perfumes[2].name}
                      className="w-full h-full drop-shadow-[0_6px_25px_rgba(0,0,0,0.7)]"
                    />
                  </div>
                </motion.div>
              </>
            ) : (
              /* ── Fallback for 1 or 4+ ── */
              <div className="relative flex items-end justify-center gap-3 px-4">
                {combo.perfumes.map((perfume, i) => (
                  <motion.div
                    key={perfume.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12 + 0.2, duration: 0.5 }}
                    className="relative z-10 combo-bottle-lift"
                    style={{ transitionDelay: `${i * 0.05}s` }}
                  >
                    <div className="w-[75px] sm:w-[90px] h-[120px] sm:h-[140px]">
                      <PerfumeBottleImage
                        fragranticaId={perfume.fragranticaId}
                        alt={perfume.name}
                        className="w-full h-full drop-shadow-[0_6px_25px_rgba(0,0,0,0.7)]"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Reflection (mirror effect below bottles) ─── */}
          <div className="relative flex items-end justify-center w-full overflow-hidden" style={{ height: "30px" }}>
            <div className="combo-bottle-reflection flex items-end justify-center" style={{ transform: "scaleY(-1)" }}>
              {perfumeCount === 2 ? (
                <div className="flex items-end -mr-5 -ml-5">
                  <div className="w-[100px] sm:w-[115px] h-[40px]">
                    <PerfumeBottleImage
                      fragranticaId={combo.perfumes[0].fragranticaId}
                      alt=""
                      className="w-full h-full"
                    />
                  </div>
                  <div className="w-[100px] sm:w-[115px] h-[40px]">
                    <PerfumeBottleImage
                      fragranticaId={combo.perfumes[1].fragranticaId}
                      alt=""
                      className="w-full h-full"
                    />
                  </div>
                </div>
              ) : perfumeCount === 3 ? (
                <div className="flex items-end -mx-1">
                  <div className="w-[85px] sm:w-[100px] h-[35px]">
                    <PerfumeBottleImage
                      fragranticaId={combo.perfumes[0].fragranticaId}
                      alt=""
                      className="w-full h-full"
                    />
                  </div>
                  <div className="w-[95px] sm:w-[110px] h-[40px]">
                    <PerfumeBottleImage
                      fragranticaId={combo.perfumes[1].fragranticaId}
                      alt=""
                      className="w-full h-full"
                    />
                  </div>
                  <div className="w-[85px] sm:w-[100px] h-[35px]">
                    <PerfumeBottleImage
                      fragranticaId={combo.perfumes[2].fragranticaId}
                      alt=""
                      className="w-full h-full"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* ─── "+" connector badge (duo) ─── */}
          {perfumeCount === 2 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="w-8 h-8 rounded-full bg-[#d4af37]/25 border border-[#d4af37]/50 flex items-center justify-center backdrop-blur-md combo-plus-pulse">
                <span className="text-[11px] text-[#d4af37] font-bold font-[family-name:var(--font-inter)]">+</span>
              </div>
            </div>
          )}
          {perfumeCount === 3 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="w-8 h-8 rounded-full bg-[#d4af37]/25 border border-[#d4af37]/50 flex items-center justify-center backdrop-blur-md combo-plus-pulse">
                <span className="text-[9px] text-[#d4af37] font-bold font-[family-name:var(--font-inter)]">×3</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom gradient fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/70 to-transparent z-25 pointer-events-none" />
      </div>

      {/* ─── Content area ─── */}
      <div className="flex flex-col flex-1 px-5 pb-5 pt-2">
        {/* Combo name */}
        <h3 className="text-xl sm:text-2xl font-bold text-white/95 font-[family-name:var(--font-playfair)] leading-snug mb-2 group-hover:text-[#d4af37] transition-colors duration-300">
          {combo.name}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-white/45 font-[family-name:var(--font-inter)] leading-relaxed mb-4 line-clamp-3">
          {combo.description}
        </p>

        {/* Gold divider */}
        <div className="w-full h-px bg-gradient-to-r from-[#d4af37]/40 via-[#d4af37]/15 to-transparent mb-4" />

        {/* ─── Perfume list ─── */}
        <div className="space-y-2.5 mb-5">
          {combo.perfumes.map((perfume, i) => (
            <motion.div
              key={perfume.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.35 }}
              className="flex items-center gap-2.5 group/item"
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 flex items-center justify-center group-hover/item:bg-[#d4af37]/20 group-hover/item:border-[#d4af37]/40 transition-all duration-200">
                <Check className="w-3 h-3 text-[#d4af37]" />
              </div>
              <span className="text-sm text-white/70 font-[family-name:var(--font-inter)] font-medium group-hover/item:text-white/90 transition-colors duration-200">
                {perfume.name}
              </span>
              <span className="ml-auto text-[10px] text-white/25 font-[family-name:var(--font-inter)] bg-white/[0.03] px-2.5 py-0.5 rounded-full border border-white/[0.06] group-hover/item:border-white/15 group-hover/item:text-white/40 transition-all duration-200">
                {perfume.volume}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ─── Price section ─── */}
        <div className="mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] group-hover:border-[rgba(212,175,55,0.12)] transition-colors duration-500">
          {/* Original price (strikethrough) */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm text-white/30 font-[family-name:var(--font-inter)] line-through decoration-white/20">
              ${combo.originalTotalPrice}
            </span>
            <span className="text-[10px] text-white/20 font-[family-name:var(--font-inter)]">
              precio individual
            </span>
          </div>

          {/* Combo price (giant, gold) */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold font-[family-name:var(--font-inter)] bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] bg-clip-text text-transparent leading-none tracking-tight">
              ${combo.comboPrice}
            </span>
            <span className="text-xs text-[#d4af37]/60 font-[family-name:var(--font-inter)] font-semibold">
              USD
            </span>
          </div>

          {/* Discount label */}
          <div className="mt-2.5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-[family-name:var(--font-inter)] font-bold tracking-wide uppercase">
              {combo.discountPercentage}% DE DESCUENTO INCLUIDO
            </span>
          </div>
        </div>

        {/* ─── Add to cart button ─── */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAddToCart?.(combo)}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black font-bold text-sm font-[family-name:var(--font-inter)] hover:from-[#e0bf4a] hover:to-[#c9a33a] transition-all duration-200 shadow-lg shadow-[#d4af37]/15 cta-shimmer"
        >
          <ShoppingBag className="w-4.5 h-4.5" />
          Agregar Combo al Carrito
        </motion.button>
      </div>
    </motion.div>
  );
}
