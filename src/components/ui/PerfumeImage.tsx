"use client";

import { useState, useCallback } from "react";
import { Sparkles, Gem } from "lucide-react";
import { getImageUrl, getImageFallbackUrl } from "@/lib/perfumes";

interface PerfumeImageProps {
  fragranticaId: number | null | undefined;
  alt: string;
  className?: string;
}

export function PerfumeImage({ fragranticaId, alt, className = "w-full h-full object-contain p-2" }: PerfumeImageProps) {
  const [useFallbackJpg, setUseFallbackJpg] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageError = useCallback(() => {
    if (!useFallbackJpg) {
      setUseFallbackJpg(true);
      setIsLoaded(false);
    } else {
      setHasError(true);
    }
  }, [useFallbackJpg]);

  if (!fragranticaId || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0d0d0d] to-[#080808] p-3 text-center">
        <Gem className="w-8 h-8 text-[#d4af37]/30 mb-1" />
        <span className="text-[#d4af37]/40 text-[10px] line-clamp-2 font-[family-name:var(--font-inter)]">
          {alt}
        </span>
      </div>
    );
  }

  const src = useFallbackJpg
    ? getImageFallbackUrl(fragranticaId)
    : getImageUrl(fragranticaId);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#080808]">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0d0d0d] to-[#080808]">
          <div className="skeleton-pulse flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#d4af37]/20" />
            <div className="w-10 h-1 rounded-full bg-[#d4af37]/10" />
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
