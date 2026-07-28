"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
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
 * Optimized Perfume Image component using Next.js Image:
 * 1. Uses fragrantica JPG thumbnail as primary (universally available). Next.js optimizes it to WebP/AVIF automatically if supported.
 * 2. Custom Image URL support (if set in database/catalog).
 * 3. Skeleton loader while image is downloading.
 * 4. Elegant luxury bottle icon SVG fallback when missing or failed.
 */
export function PerfumeImage({
  fragranticaId,
  customImageUrl,
  alt = "Perfume Jolie Fragrances",
  className = "w-full h-full object-contain p-2",
  containerClassName = "relative w-full h-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
}: PerfumeImageProps) {
  const [imgState, setImgState] = useState<"loading" | "loaded" | "error">("loading");

  const hasCustomImage = Boolean(customImageUrl && customImageUrl.trim().length > 0);
  const hasFragranticaId = Boolean(fragranticaId && fragranticaId > 0);

  const src = useMemo(() => {
    if (hasCustomImage) return customImageUrl!;
    if (hasFragranticaId) {
      // JPG is mostly guaranteed to exist, Next.js Image component will optimize it further.
      return `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${fragranticaId}.jpg`;
    }
    return null;
  }, [hasCustomImage, customImageUrl, hasFragranticaId, fragranticaId]);

  return (
    <div className={containerClassName}>
      {/* Loading Skeleton */}
      {imgState === "loading" && src && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0d0d0d] to-[#080808] z-0">
          <div className="animate-pulse flex flex-col items-center gap-1.5 opacity-60">
            <Sparkles className="w-6 h-6 text-[#d4af37]/30" />
            <div className="w-8 h-1 rounded-full bg-[#d4af37]/20" />
          </div>
        </div>
      )}

      {/* Fallback Icon Container when failed or missing ID */}
      {(!src || imgState === "error") ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#111111] to-[#0a0a0a] p-3 text-center">
          <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mb-1 shadow-inner">
            <Gem className="w-5 h-5 text-[#d4af37]/60" />
          </div>
          <span className="text-[#d4af37]/40 text-[10px] font-medium tracking-wider uppercase font-[family-name:var(--font-inter)] line-clamp-2">
            {alt}
          </span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`${className} transition-opacity duration-500 ${
            imgState === "loaded" ? "opacity-100 relative z-10" : "opacity-0"
          }`}
          onLoad={() => setImgState("loaded")}
          onError={() => setImgState("error")}
        />
      )}
    </div>
  );
}
