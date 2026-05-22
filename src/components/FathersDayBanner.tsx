"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Heart, Star, Sparkles } from "lucide-react";
import { getFathersDayInfo, type FathersDayInfo } from "@/lib/fathersDay";

// ─── Father's Day Banner for Hero Section ───
// Shows prominently on the exact day, subtly during June (Father's Day month)
// and nothing outside of June.

export default function FathersDayBanner() {
  const [info, setInfo] = useState<FathersDayInfo | null>(null);

  useEffect(() => {
    setInfo(getFathersDayInfo());
  }, []);

  if (!info || !info.status) return null;

  const isExactDay = info.status === "exact_day";
  const isFathersMonth = info.status === "fathers_month";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
        className="w-full"
      >
        {/* ─── EXACT DAY: Full prominent banner ─── */}
        {isExactDay && (
          <div className="relative overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-gradient-to-r from-[#1a1205] via-[#1f1a0a] to-[#1a1205] shadow-lg shadow-[#d4af37]/10">
            {/* Animated background shimmer */}
            <div className="absolute inset-0 fathers-day-shimmer" />

            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-20 h-20 opacity-20">
              <div className="absolute top-2 left-2 w-8 h-px bg-[#d4af37]" />
              <div className="absolute top-2 left-2 w-px h-8 bg-[#d4af37]" />
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
              <div className="absolute top-2 right-2 w-8 h-px bg-[#d4af37]" />
              <div className="absolute top-2 right-2 w-px h-8 bg-[#d4af37]" />
            </div>

            <div className="relative z-10 px-4 sm:px-8 py-5 sm:py-7 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
              {/* Gift icon with pulse animation */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8941e] flex items-center justify-center shadow-lg shadow-[#d4af37]/30">
                  <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-[#0a0a0a]" />
                </div>
              </motion.div>

              <div className="text-center sm:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center sm:justify-start gap-2 mb-1"
                >
                  <Star className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#d4af37]/80 font-[family-name:var(--font-inter)]">
                    Hoy es el Día del Padre
                  </span>
                  <Star className="w-3.5 h-3.5 text-[#d4af37]" />
                </motion.div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-[family-name:var(--font-playfair)] text-white mb-1">
                  ¡Feliz Día del Padre!
                </h3>

                <p className="text-sm sm:text-base text-white/60 font-[family-name:var(--font-inter)] max-w-md">
                  Sorprende a papá con una fragancia premium que refleje su esencia. El regalo perfecto para un día especial.
                </p>
              </div>

              {/* Decorative stars */}
              <div className="hidden sm:flex flex-col items-center gap-1 opacity-40">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                <Heart className="w-5 h-5 text-[#d4af37]/60" />
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
              </div>
            </div>

            {/* Bottom gold line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
          </div>
        )}

        {/* ─── FATHER'S MONTH: Subtle elegant banner ─── */}
        {isFathersMonth && !isExactDay && (
          <div className="relative overflow-hidden rounded-xl border border-[#d4af37]/15 bg-gradient-to-r from-[#0f0d08] via-[#111008] to-[#0f0d08]">
            {/* Very subtle shimmer */}
            <div className="absolute inset-0 fathers-day-shimmer-subtle" />

            <div className="relative z-10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center gap-3">
              <Gift className="w-4 h-4 text-[#d4af37]/60 flex-shrink-0" />

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-white/50 font-[family-name:var(--font-inter)]">
                  El Día del Padre se acerca
                </span>
                <span className="text-[10px] text-[#d4af37]/50 font-[family-name:var(--font-inter)]">
                  ({info.fathersDayLabel})
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#d4af37]/15 bg-[#d4af37]/5">
                <Heart className="w-3 h-3 text-[#d4af37]/50" />
                <span className="text-[10px] text-[#d4af37]/60 font-[family-name:var(--font-inter)]">
                  Regala una fragancia
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Hook for other components to use Father's Day info ───
export function useFathersDay() {
  const [info, setInfo] = useState<FathersDayInfo | null>(null);

  useEffect(() => {
    setInfo(getFathersDayInfo());
  }, []);

  return info;
}
