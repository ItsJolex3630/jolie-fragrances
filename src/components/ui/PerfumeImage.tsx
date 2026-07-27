"use client";

import { useState, useCallback, useMemo } from "react";
import { Gem, Sparkles } from "lucide-react";

interface PerfumeImageProps {
  fragranticaId?: number | null;
  customImageUrl?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Optimized Perfume Image component:
 * 1. Primary format: AVIF thumbnail (`https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${id}.avif`)
 * 2. Secondary format: JPG thumbnail (`https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${id}.jpg`)
 * 3. Custom Image URL support (if set in database/catalog)
 * 4. Skeleton loader while image is downloading
 * 5. Elegant luxury bottle icon SVG fallback when missing or failed
 */
export function PerfumeImage({
  fragranticaId,
  customImageUrl,
  alt = "Perfume Jolie Fragrances",
  className = "w-full h-full object-contain p-2",
  containerClassName = "relative w-full h-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden",
  priority = false,
}: PerfumeImageProps) {
  const [imgState, setImgState] = useState<"loading" | "loaded" | "fallback_jpg" | "error">("loading");

  const hasCustomImage = Boolean(customImageUrl && customImageUrl.trim().length > 0);
  const hasFragranticaId = Boolean(fragranticaId && fragranticaId > 0);

  const primarySrc = useMemo(() => {
    if (hasCustomImage) return customImageUrl!;
    if (hasFragranticaId) {
      return `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${fragranticaId}.avif`;
    }
    return null;
  }, [hasCustomImage, customImageUrl, hasFragranticaId, fragranticaId]);

  const fallbackJpgSrc = useMemo(() => {
    if (hasFragranticaId) {
      return `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${fragranticaId}.jpg`;
    }
    return null;
  }, [hasFragranticaId, fragranticaId]);

  const currentSrc = useMemo(() => {
    if (imgState === "fallback_jpg" && fallbackJpgSrc) {
      return fallbackJpgSrc;
    }
    return primarySrc;
  }, [imgState, primarySrc, fallbackJpgSrc]);

  const handleLoad = useCallback(() => {
    setImgState("loaded");
  }, []);

  const handleError = useCallback(() => {
    if (hasCustomImage) {
      setImgState("error");
    } else if (imgState === "loading" && fallbackJpgSrc) {
      // Try JPG thumbnail fallback
      setImgState("fallback_jpg");
    } else {
      setImgState("error");
    }
  }, [hasCustomImage, imgState, fallbackJpgSrc]);

  return (
    <div className={containerClassName}>
      {/* Loading Skeleton */}
      {(imgState === "loading" || imgState === "fallback_jpg") && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0d0d0d] to-[#080808] z-0">
          <div className="animate-pulse flex flex-col items-center gap-1.5 opacity-60">
            <Sparkles className="w-6 h-[#d4af37]/30 text-[#d4af37]/30" />
            <div className="w-8 h-1 rounded-full bg-[#d4af37]/20" />
          </div>
        </div>
      )}

      {/* Fallback Icon Container when failed or missing ID */}
      {(!currentSrc || imgState === "error") ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#111111] to-[#0a0a0a] p-3 text-center">
          <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mb-1 shadow-inner">
            <Gem className="w-5 h-5 text-[#d4af37]/60" />
          </div>
          <span className="text-[#d4af37]/40 text-[10px] font-medium tracking-wider uppercase font-[family-name:var(--font-inter)] line-clamp-2">
            {alt}
          </span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${
            imgState === "loaded" || imgState === "fallback_jpg" ? "opacity-100 relative z-10" : "opacity-0"
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={{ color: "transparent" }}
        />
      )}
    </div>
  );
}
