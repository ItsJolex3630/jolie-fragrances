"use client";

import { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Scroll Reveal Hook (lightweight IntersectionObserver) ───
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── ScrollRevealDiv component ───
function ScrollRevealDiv({ children, className = "", variant = "up" }: { children: React.ReactNode; className?: string; variant?: "up" | "left" | "scale" }) {
  const ref = useScrollReveal();
  const variantClass = variant === "left" ? "scroll-reveal-left" : variant === "scale" ? "scroll-reveal-scale" : "scroll-reveal";
  return (
    <div ref={ref} className={`${variantClass} ${className}`}>
      {children}
    </div>
  );
}

import {
  Search,
  X,
  MessageCircle,
  Sparkles,
  Filter,
  Instagram,
  Phone,
  Crown,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Heart,
  Gem,
  Clock,
  ArrowLeftRight,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import dynamic from "next/dynamic";
import {
  GENDERS,
  getImageUrl,
  getFragranticaUrl,
  NOTES,
  NOTES_INFO,
  type Perfume,
  type Brand,
  type Gender,
  type Note,
  type Concentration,
} from "@/lib/perfumes";
import { usePrices } from "@/hooks/usePrices";
import { useBannedCheck } from "@/hooks/useBannedCheck";
import { formatPrice, applyDiscount } from "@/lib/priceMapping";
import { useCurrency, CurrencyToggle } from "@/hooks/useCurrency";
import BannedNotice from "@/components/BannedNotice";
import {
  TIMES_OF_DAY,
  CLIMATES,
  OCCASIONS,
  TIME_INFO,
  CLIMATE_INFO,
  OCCASION_INFO,
  PERFUME_OCCASIONS,
  type TimeOfDay,
  type Climate,
  type Occasion,
} from "@/lib/perfumeOccasions";

// ─── Dynamic imports for heavy modal components (only loaded when needed) ───
const PerfumeDetail = dynamic(() => import("@/components/PerfumeDetail"), { ssr: false });
const CompareModal = dynamic(() => import("@/components/CompareModal"), { ssr: false });
const SimilarPerfumesModal = dynamic(() => import("@/components/SimilarPerfumesModal"), { ssr: false });
const FathersDayBanner = dynamic(() => import("@/components/FathersDayBanner"), { ssr: false });
const FathersDaySection = dynamic(() => import("@/components/FathersDaySection"), { ssr: false });
const ComboShowcase = dynamic(() => import("@/components/ComboShowcase"), { ssr: false });
import TopBar from "@/components/TopBar";

// ─── Gender badge colors ───
const genderStyles: Record<Gender, string> = {
  Dama: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Caballero: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Unisex: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const genderIcons: Record<Gender, string> = {
  Dama: "♀",
  Caballero: "♂",
  Unisex: "⚥",
};

// ─── Skeleton Card Component (shown while loading) ───
function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="card-fade-in"
      style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
    >
      <div className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[#111111] overflow-hidden">
        <div className="aspect-[3/4] bg-gradient-to-b from-[#0d0d0d] to-[#080808] flex items-center justify-center skeleton-pulse">
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-8 h-8 text-[#d4af37]/15" />
            <div className="w-12 h-1 rounded-full bg-[#d4af37]/8" />
          </div>
        </div>
        <div className="p-3 sm:p-4 space-y-2">
          <div className="h-2.5 w-16 rounded-full bg-[#d4af37]/10 skeleton-pulse" />
          <div className="h-3.5 w-full rounded-full bg-white/5 skeleton-pulse" />
          <div className="h-3.5 w-2/3 rounded-full bg-white/5 skeleton-pulse" />
        </div>
      </div>
    </div>
  );
}

function PerfumePriceBlock({
  retailPrice,
  discountPct,
  useTemporal,
  temporalLabel,
}: {
  retailPrice: number;
  discountPct: number;
  useTemporal: boolean;
  temporalLabel: string | null;
}) {
  const { mode, formatPrice: formatCurrencyPrice } = useCurrency();
  const hasDiscount = discountPct > 0;
  const discountedUsd = hasDiscount
    ? applyDiscount(retailPrice, discountPct)
    : retailPrice;

  const originalFormatted = formatCurrencyPrice(retailPrice);
  const discountedFormatted = formatCurrencyPrice(discountedUsd);

  const discountBadge = (
    <span
      className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-[family-name:var(--font-inter)] font-bold tracking-wide border ${
        useTemporal
          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
      }`}
      title={
        useTemporal
          ? temporalLabel || "Oferta temporal"
          : "Descuento por predicción"
      }
    >
      -{discountPct}%
    </span>
  );

  if (mode === "usd") {
    if (hasDiscount) {
      return (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs text-white/30 line-through font-[family-name:var(--font-inter)]">
              {originalFormatted.primary}
            </span>
            {discountBadge}
          </div>
          <p className="text-sm sm:text-base font-bold font-[family-name:var(--font-inter)] bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent">
            {discountedFormatted.primary}
          </p>
        </div>
      );
    }
    return (
      <p className="text-sm sm:text-base font-bold font-[family-name:var(--font-inter)] bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent">
        {originalFormatted.primary}
      </p>
    );
  }

  if (hasDiscount) {
    return (
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] sm:text-xs text-white/30 line-through font-[family-name:var(--font-inter)]">
            {originalFormatted.primary}
          </span>
          {discountBadge}
        </div>
        <p className="text-sm sm:text-base font-bold font-[family-name:var(--font-inter)] bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent">
          {discountedFormatted.primary}
        </p>
        <p className={`text-[9px] sm:text-[10px] font-[family-name:var(--font-inter)] leading-tight font-semibold ${
          useTemporal ? "text-amber-300" : "text-emerald-400"
        }`}>
          {discountedFormatted.secondary}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col leading-tight">
      <p className="text-sm sm:text-base font-bold font-[family-name:var(--font-inter)] bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent leading-tight">
        {originalFormatted.primary}
      </p>
      <p className="text-[9px] sm:text-[10px] text-white/60 font-[family-name:var(--font-inter)] leading-tight">
        {originalFormatted.secondary}
      </p>
    </div>
  );
}

const PerfumeCard = memo(function PerfumeCard({
  perfume,
  index,
  onSelect,
  retailPrice,
  dbAvailable,
  temporalDiscountPct,
  temporalDiscountLabel,
  onAddToCart,
  highestAvailableDiscountPct,
}: {
  perfume: Perfume;
  index: number;
  onSelect: (perfume: Perfume) => void;
  retailPrice: number | null;
  dbAvailable: boolean;
  temporalDiscountPct: number;
  temporalDiscountLabel: string | null;
  onAddToCart: (perfume: Perfume, price: number) => void;
  highestAvailableDiscountPct: number;
}) {
  const [imgTriedJpg, setImgTriedJpg] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const effectiveAvailable = dbAvailable === true ? true : (dbAvailable === false ? false : perfume.available !== false);

  const temporalPct = temporalDiscountPct > 0 ? temporalDiscountPct : 0;
  const predictionPct = highestAvailableDiscountPct > 0 ? highestAvailableDiscountPct : 0;
  const useTemporal = temporalPct > predictionPct;
  const effectiveDiscountPct = useTemporal ? temporalPct : predictionPct;

  const hasCustomImage = !!perfume.customImageUrl;
  const imgSrc = hasCustomImage
    ? perfume.customImageUrl!
    : imgTriedJpg
    ? `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${perfume.fragranticaId}.jpg`
    : getImageUrl(perfume.fragranticaId);

  const handleImgError = useCallback(() => {
    if (hasCustomImage) {
      setImgError(true);
    } else if (!imgTriedJpg) {
      setImgTriedJpg(true);
      setImgLoaded(false);
    } else {
      setImgError(true);
    }
  }, [imgTriedJpg, hasCustomImage]);

  return (
    <div
      className="perfume-card group relative card-fade-in rounded-xl"
      style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
    >
      <div className={`card-shimmer-border relative overflow-hidden rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#111111] transition-all duration-500 group-hover:border-[rgba(212,175,55,0.35)] gold-glow-hover h-full flex flex-col ${!effectiveAvailable ? 'opacity-75' : ''}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0d0d0d] to-[#080808]">
              <div className="skeleton-pulse flex flex-col items-center gap-2">
                <Sparkles className="w-8 h-8 text-[#d4af37]/20" />
                <div className="w-12 h-1 rounded-full bg-[#d4af37]/10" />
              </div>
            </div>
          )}
          {imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0d0d0d] to-[#080808]">
              <Gem className="w-10 h-10 text-[#d4af37]/20 mb-2" />
              <span className="text-[#d4af37]/30 text-[10px] text-center px-4 font-[family-name:var(--font-inter)] leading-tight">
                {perfume.name}
              </span>
            </div>
          ) : (
            <img
              src={imgSrc}
              alt={`${perfume.name} - ${perfume.brand}`}
              className={`w-full h-full object-contain p-2 transition-all duration-700 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImgLoaded(true)}
              onError={handleImgError}
              loading="lazy"
              decoding="async"
              style={{ color: 'transparent' }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
            <CurrencyToggle variant="compact" />
          </div>

          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <span
              className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] px-2 py-0.5 sm:py-1 rounded-full border font-[family-name:var(--font-inter)] ${genderStyles[perfume.gender]}`}
            >
              <span>{genderIcons[perfume.gender]}</span>
              {perfume.gender}
            </span>
          </div>

          <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 sm:py-1 rounded-full border border-white/10 bg-black/60 text-white/50 font-[family-name:var(--font-inter)]">
              {perfume.size}
            </span>
          </div>

          {!effectiveAvailable && (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <span className="text-[8px] sm:text-[9px] px-2 py-0.5 sm:py-1 rounded-full border border-rose-500/30 bg-rose-500/15 text-rose-400 font-[family-name:var(--font-inter)] tracking-wide uppercase">
                No disponible
              </span>
            </div>
          )}

          {effectiveAvailable && useTemporal && temporalPct > 0 && (
            <div className="absolute top-2 left-2 z-10 pointer-events-none">
              <span
                className="text-[8px] sm:text-[9px] px-2 py-0.5 sm:py-1 rounded-full border border-amber-500/40 bg-amber-500/20 text-amber-300 font-[family-name:var(--font-inter)] font-bold tracking-wide uppercase shadow-lg shadow-amber-500/10"
                title={temporalDiscountLabel || "Oferta temporal"}
              >
                {temporalDiscountLabel || "Oferta"} -{temporalPct}%
              </span>
            </div>
          )}

          <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 flex flex-col gap-1.5 font-[family-name:var(--font-inter)]"
               style={{ marginLeft: effectiveAvailable && useTemporal && temporalPct > 0 ? '88px' : '0' }}>
            {retailPrice !== null && effectiveAvailable && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(perfume, retailPrice); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#d4af37] text-black text-[10px] font-bold font-[family-name:var(--font-inter)] shadow-lg shadow-[#d4af37]/20 hover:bg-[#e0c04a] transition-all active:scale-95"
                aria-label={`Agregar ${perfume.name} al carrito`}
              >
                <ShoppingCart className="w-3 h-3" />
                <span className="hidden sm:inline">Agregar</span>
              </button>
            )}
            <a
              href={`https://wa.me/584244055386?text=${encodeURIComponent(`Hola Jolie Fragrances! Me gustaría consultar la disponibilidad de ${perfume.name} - ${perfume.brand}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] text-white text-[10px] font-bold font-[family-name:var(--font-inter)] shadow-lg shadow-[#25D366]/20 hover:bg-[#2ee071] transition-all active:scale-95"
              aria-label={`Consultar disponibilidad de ${perfume.name}`}
            >
              <MessageCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Consultar</span>
            </a>
          </div>

          <div className="absolute bottom-8 left-0 right-0 text-center z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-[9px] text-[#d4af37]/80 font-[family-name:var(--font-inter)] tracking-wider">
              Ver detalles →
            </p>
          </div>

          <button
            onClick={() => onSelect(perfume)}
            className="absolute inset-0 z-10 cursor-pointer"
            aria-label={`Ver detalles de ${perfume.name}`}
          />
        </div>

        <button
          onClick={() => onSelect(perfume)}
          className="block w-full text-left cursor-pointer"
        >
          <div className="p-3 sm:p-4 space-y-1">
            <p className="text-[10px] sm:text-xs text-[#d4af37]/80 font-semibold tracking-[0.12em] uppercase font-[family-name:var(--font-inter)]">
              {perfume.brand}
            </p>
            <h3 className="text-sm sm:text-[15px] font-semibold text-white/90 leading-snug font-[family-name:var(--font-playfair)] line-clamp-2 min-h-[2.5rem]">
              {perfume.name}
            </h3>
            <div className="flex items-center justify-between gap-2 mt-1">
              {!effectiveAvailable ? (
                <p className="text-[10px] sm:text-xs font-medium font-[family-name:var(--font-inter)] text-rose-400/80 tracking-wider uppercase">
                  No disponible
                </p>
              ) : retailPrice !== null ? (
                <PerfumePriceBlock
                  retailPrice={retailPrice}
                  discountPct={effectiveDiscountPct}
                  useTemporal={useTemporal}
                  temporalLabel={temporalDiscountLabel}
                />
              ) : (
                <p className="text-[10px] sm:text-xs font-medium font-[family-name:var(--font-inter)] text-white/25 tracking-wider uppercase">
                  Consultar
                </p>
              )}
              <div className="flex items-center gap-1.5">
                {retailPrice !== null && effectiveAvailable && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddToCart(perfume, retailPrice); }}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/15 text-[#d4af37]/70 hover:text-[#d4af37] hover:bg-[#d4af37]/20 hover:border-[#d4af37]/30 transition-all active:scale-90"
                    aria-label={`Agregar ${perfume.name} al carrito`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                )}
                <a
                  href={`https://wa.me/584244055386?text=${encodeURIComponent(`Hola Jolie Fragrances! Me gustaría consultar la disponibilidad de ${perfume.name} - ${perfume.brand}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#25D366]/10 border border-[#25D366]/15 text-[#25D366]/70 hover:text-[#25D366] hover:bg-[#25D366]/20 hover:border-[#25D366]/30 transition-all active:scale-90"
                  aria-label={`Consultar disponibilidad de ${perfume.name}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
});
