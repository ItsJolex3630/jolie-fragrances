"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Gift, Heart, Star, ArrowRight, Sparkles, Crown } from "lucide-react";
import { getFathersDayInfo, type FathersDayInfo } from "@/lib/fathersDay";
import type { Perfume } from "@/lib/perfumes";

interface FathersDaySectionProps {
  allPerfumes: Perfume[];
  onPerfumeSelect: (perfume: Perfume) => void;
}

// ─── Father's Day Recommendations Section ───
// Shows during June (Father's Day month) with recommended "Caballero" perfumes.
// More prominent on the exact day, elegant during the rest of the month.

export default function FathersDaySection({ allPerfumes, onPerfumeSelect }: FathersDaySectionProps) {
  const [info, setInfo] = useState<FathersDayInfo | null>(null);

  useEffect(() => {
    setInfo(getFathersDayInfo());
  }, []);

  const isExactDay = info?.status === "exact_day";
  const isFathersMonth = info?.status === "fathers_month";

  // Get top "Caballero" and "Unisex" perfumes for Father's Day recommendations
  const recommendedPerfumes = useMemo(() => {
    if (!allPerfumes.length) return [];

    const caballeroPerfumes = allPerfumes.filter(
      (p) => p.gender === "Caballero" && p.available !== false
    );
    const unisexPerfumes = allPerfumes.filter(
      (p) => p.gender === "Unisex" && p.available !== false
    );

    // Prioritize Caballero perfumes, then add some Unisex ones
    const combined = [...caballeroPerfumes.slice(0, 8), ...unisexPerfumes.slice(0, 4)];

    return combined.slice(0, 8);
  }, [allPerfumes]);

  if (!info?.status || recommendedPerfumes.length === 0) return null;

  return (
    <section className={`relative z-10 overflow-hidden ${
      isExactDay
        ? "border-y border-[#d4af37]/20 bg-gradient-to-b from-[#0f0d08] via-[#0a0a0a] to-[#0a0a0a]"
        : "border-t border-[rgba(212,175,55,0.08)]"
    }`}>
      {/* Background decorations for exact day */}
      {isExactDay && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d4af37]/[0.02] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d4af37]/[0.02] rounded-full blur-[100px]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          {isExactDay ? (
            // ─── EXACT DAY: Big festive header ───
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: "spring", stiffness: 150, damping: 15 }}
                className="inline-flex items-center gap-2 mb-4 px-5 py-2 rounded-full bg-gradient-to-r from-[#d4af37]/20 to-[#b8941e]/10 border border-[#d4af37]/30"
              >
                <Gift className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs tracking-[0.2em] uppercase text-[#d4af37] font-[family-name:var(--font-inter)] font-semibold">
                  Día del Padre
                </span>
                <Gift className="w-4 h-4 text-[#d4af37]" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white mb-3">
                Regala Esencia, Regala{" "}
                <span className="shimmer-text">Elegancia</span>
              </h2>

              <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto font-[family-name:var(--font-inter)] leading-relaxed">
                Celebra a papá con una fragancia premium que hable por sí sola.
                Estos son los perfumes perfectos para honrar a ese hombre especial en tu vida.
              </p>
            </>
          ) : (
            // ─── FATHER'S MONTH: Elegant subtle header ───
            <>
              <div className="inline-flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-[#d4af37]/60" />
                <span className="text-[10px] text-[#d4af37]/60 tracking-[0.2em] uppercase font-[family-name:var(--font-inter)]">
                  Se acerca el Día del Padre
                </span>
                <Gift className="w-4 h-4 text-[#d4af37]/60" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-playfair)] text-white mb-2">
                Fragancias para Papá
              </h2>

              <p className="text-white/40 text-sm max-w-md mx-auto font-[family-name:var(--font-inter)]">
                Sorprende a papá con una fragancia que refleje su personalidad. El {info.fathersDayLabel} es su día.
              </p>
            </>
          )}
        </motion.div>

        {/* Perfume recommendations grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6">
          {recommendedPerfumes.slice(0, isExactDay ? 8 : 4).map((perfume, i) => (
            <motion.div
              key={perfume.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              onClick={() => onPerfumeSelect(perfume)}
              className="group relative cursor-pointer perfume-card"
            >
              <div className={`relative overflow-hidden rounded-xl border bg-[#111111] transition-all duration-500 hover:shadow-lg ${
                isExactDay
                  ? "border-[#d4af37]/20 hover:border-[#d4af37]/40 hover:shadow-[#d4af37]/10"
                  : "border-[rgba(212,175,55,0.12)] hover:border-[rgba(212,175,55,0.35)]"
              }`}>
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
                  <img
                    src={`https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${perfume.fragranticaId}.avif`}
                    alt={`${perfume.name} - ${perfume.brand}`}
                    className="w-full h-full object-contain p-2 transition-all duration-700 group-hover:scale-105 opacity-0"
                    loading="lazy"
                    decoding="async"
                    style={{ color: 'transparent' }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '1';
                    }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      // Try .jpg fallback
                      if (!img.src.endsWith('.jpg')) {
                        img.src = `https://fimgs.net/mdimg/perfume/${perfume.fragranticaId}.jpg`;
                      } else {
                        img.style.display = 'none';
                      }
                    }}
                  />

                  {/* Gift badge overlay */}
                  {isExactDay && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#d4af37] text-[#0a0a0a] text-[8px] sm:text-[9px] font-semibold font-[family-name:var(--font-inter)] tracking-wide uppercase shadow-md shadow-[#d4af37]/20">
                        <Gift className="w-2.5 h-2.5" />
                        Para Papá
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4 space-y-1">
                  <p className="text-[10px] sm:text-xs text-[#d4af37]/80 font-semibold tracking-[0.12em] uppercase font-[family-name:var(--font-inter)]">
                    {perfume.brand}
                  </p>
                  <h3 className="text-sm sm:text-[15px] font-semibold text-white/90 leading-snug font-[family-name:var(--font-playfair)] line-clamp-2 min-h-[2.5rem]">
                    {perfume.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA - WhatsApp consultation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="https://wa.me/584244055386"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold font-[family-name:var(--font-inter)] transition-all duration-300 ${
              isExactDay
                ? "bg-gradient-to-r from-[#d4af37] to-[#b8941e] text-[#0a0a0a] shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/30"
                : "border border-[#d4af37]/25 text-[#d4af37] hover:bg-[#d4af37]/10"
            }`}
          >
            <Heart className="w-4 h-4" />
            {isExactDay ? "Asesoría para regalar a Papá" : "Consultar recomendaciones"}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
