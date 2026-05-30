"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, ShoppingBag, Tag, Sparkles, Gem } from "lucide-react";
import type { Combo } from "@/lib/combosData";

// ─── Fragrantica image URL builder ───
function getAvifUrl(fragranticaId: number): string {
  return `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${fragranticaId}.avif`;
}
function getJpgUrl(fragranticaId: number): string {
  return `https://fimgs.net/mdimg/perfume/${fragranticaId}.jpg`;
}

// ─── Category badge colors ───
const categoryStyles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Pareja: {
    bg: "bg-pink-500/15",
    border: "border-pink-500/30",
    text: "text-pink-300",
    icon: "💖",
  },
  "Todo Terreno": {
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    text: "text-blue-300",
    icon: "🏔️",
  },
  Árabe: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-300",
    icon: "✨",
  },
  Gourmand: {
    bg: "bg-purple-500/15",
    border: "border-purple-500/30",
    text: "text-purple-300",
    icon: "🍫",
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
      className={`object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] ${className}`}
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
  };

  const perfumeCount = combo.perfumes.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[#0e0e0e] overflow-hidden shadow-2xl shadow-black/40 transition-shadow duration-500 hover:shadow-[#d4af37]/10 hover:shadow-2xl"
    >
      {/* ─── Top gold accent line ─── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent z-10" />

      {/* ─── Savings badge (upper-left) ─── */}
      <div className="absolute top-3 left-3 z-20">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 border border-emerald-400/50 shadow-lg shadow-emerald-500/20 backdrop-blur-sm">
          <Tag className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold text-white font-[family-name:var(--font-inter)] tracking-wide">
            AHORRA ${combo.savings.toFixed(2)}
          </span>
        </div>
      </div>

      {/* ─── Category badge (upper-right) ─── */}
      <div className="absolute top-3 right-3 z-20">
        <span
          className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border font-[family-name:var(--font-inter)] font-medium backdrop-blur-sm ${catStyle.bg} ${catStyle.border} ${catStyle.text}`}
        >
          <span>{catStyle.icon}</span>
          {combo.category}
        </span>
      </div>

      {/* ─── Bottle Showcase Area ─── */}
      <div className="relative h-56 sm:h-64 bg-gradient-to-b from-[#080808] via-[#0a0a0a] to-[#0e0e0e] flex items-center justify-center overflow-hidden">
        {/* Ambient glow behind bottles */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 60%, rgba(212,175,55,0.6) 0%, transparent 60%)",
            }}
          />
        </div>

        {/* Subtle diagonal lines pattern */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              rgba(212,175,55,0.3) 20px,
              rgba(212,175,55,0.3) 21px
            )`,
          }}
        />

        {/* ─── Bottle arrangement ─── */}
        {perfumeCount === 2 ? (
          /* ── Duo layout: side by side with slight overlap ── */
          <div className="relative flex items-end justify-center gap-0 px-6">
            {/* Left bottle */}
            <motion.div
              initial={{ opacity: 0, x: -20, rotate: 3 }}
              animate={{ opacity: 1, x: 0, rotate: -3 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-10 -mr-6"
              style={{ transform: "rotate(-3deg)" }}
            >
              <div className="w-24 sm:w-28 h-36 sm:h-44">
                <PerfumeBottleImage
                  fragranticaId={combo.perfumes[0].fragranticaId}
                  alt={combo.perfumes[0].name}
                  className="w-full h-full"
                />
              </div>
            </motion.div>

            {/* Right bottle */}
            <motion.div
              initial={{ opacity: 0, x: 20, rotate: -3 }}
              animate={{ opacity: 1, x: 0, rotate: 3 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-20 -ml-6"
              style={{ transform: "rotate(3deg)" }}
            >
              <div className="w-24 sm:w-28 h-36 sm:h-44">
                <PerfumeBottleImage
                  fragranticaId={combo.perfumes[1].fragranticaId}
                  alt={combo.perfumes[1].name}
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        ) : perfumeCount === 3 ? (
          /* ── Trio layout: fan/staggered arrangement ── */
          <div className="relative flex items-end justify-center px-4">
            {/* Left bottle (background, tilted) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-10 -mr-4"
              style={{ transform: "rotate(-6deg) translateY(4px)" }}
            >
              <div className="w-20 sm:w-24 h-32 sm:h-40">
                <PerfumeBottleImage
                  fragranticaId={combo.perfumes[0].fragranticaId}
                  alt={combo.perfumes[0].name}
                  className="w-full h-full"
                />
              </div>
            </motion.div>

            {/* Center bottle (foreground, tallest) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-30 -mx-2"
            >
              <div className="w-22 sm:w-26 h-38 sm:h-48">
                <PerfumeBottleImage
                  fragranticaId={combo.perfumes[1].fragranticaId}
                  alt={combo.perfumes[1].name}
                  className="w-full h-full"
                />
              </div>
            </motion.div>

            {/* Right bottle (background, tilted) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-10 -ml-4"
              style={{ transform: "rotate(6deg) translateY(4px)" }}
            >
              <div className="w-20 sm:w-24 h-32 sm:h-40">
                <PerfumeBottleImage
                  fragranticaId={combo.perfumes[2].fragranticaId}
                  alt={combo.perfumes[2].name}
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        ) : (
          /* ── Fallback for 1 or 4+ perfumes: simple row ── */
          <div className="relative flex items-end justify-center gap-2 px-4">
            {combo.perfumes.map((perfume, i) => (
              <motion.div
                key={perfume.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 + 0.2, duration: 0.5 }}
                className="relative z-10"
              >
                <div className="w-16 sm:w-20 h-28 sm:h-36">
                  <PerfumeBottleImage
                    fragranticaId={perfume.fragranticaId}
                    alt={perfume.name}
                    className="w-full h-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* "X" connector label between bottles */}
        {perfumeCount === 2 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="w-7 h-7 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-black/40">
              <span className="text-[9px] text-[#d4af37] font-bold font-[family-name:var(--font-inter)]">+</span>
            </div>
          </div>
        )}
        {perfumeCount === 3 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
            <span className="text-[9px] text-white/30 font-[family-name:var(--font-inter)]">×3</span>
          </div>
        )}

        {/* Bottom gradient fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent z-25" />
      </div>

      {/* ─── Content area ─── */}
      <div className="flex flex-col flex-1 px-5 pb-5 pt-1">
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
        <div className="space-y-2 mb-5">
          {combo.perfumes.map((perfume, i) => (
            <motion.div
              key={perfume.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.35 }}
              className="flex items-center gap-2.5"
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center">
                <Check className="w-3 h-3 text-[#d4af37]" />
              </div>
              <span className="text-sm text-white/75 font-[family-name:var(--font-inter)] font-medium">
                {perfume.name}
              </span>
              <span className="ml-auto text-[10px] text-white/30 font-[family-name:var(--font-inter)] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {perfume.volume}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ─── Price section ─── */}
        <div className="mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          {/* Original price (strikethrough) */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-white/30 font-[family-name:var(--font-inter)] line-through">
              ${combo.originalTotalPrice.toFixed(2)}
            </span>
            <span className="text-[10px] text-white/20 font-[family-name:var(--font-inter)]">
              precio individual
            </span>
          </div>

          {/* Combo price (giant, gold) */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold font-[family-name:var(--font-inter)] bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] bg-clip-text text-transparent leading-none">
              ${combo.comboPrice.toFixed(2)}
            </span>
            <span className="text-xs text-[#d4af37]/60 font-[family-name:var(--font-inter)] font-semibold">
              USD
            </span>
          </div>

          {/* Discount label */}
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
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
