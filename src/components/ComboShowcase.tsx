"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Tag } from "lucide-react";
import { combos, type Combo } from "@/lib/combosData";
import ComboCard from "@/components/ComboCard";

// ─── Category filter tabs config ───
type ComboCategory = "Todos" | Combo["category"];

const FILTER_TABS: { key: ComboCategory; label: string; icon: string }[] = [
  { key: "Todos", label: "Todos", icon: "✨" },
  { key: "Pareja", label: "Pareja", icon: "💖" },
  { key: "Todo Terreno", label: "Todo Terreno", icon: "🏔️" },
  { key: "Árabe", label: "Árabe", icon: "✨" },
  { key: "Gourmand", label: "Gourmand", icon: "🍫" },
];

// ─── Animation variants ───
const cardContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.96,
    transition: { duration: 0.3 },
  },
};

export default function ComboShowcase() {
  const [activeCategory, setActiveCategory] = useState<ComboCategory>("Todos");

  // Filter combos by selected category
  const filteredCombos = useMemo(() => {
    if (activeCategory === "Todos") return combos;
    return combos.filter((combo) => combo.category === activeCategory);
  }, [activeCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: combos.length };
    combos.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <section className="relative z-10 border-t border-[rgba(212,175,55,0.08)] bg-[#0a0a0a]">
      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* ─── Section Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          className="text-center mb-10"
        >
          {/* Small label */}
          <div className="inline-flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-[#d4af37]/70" />
            <span className="text-[10px] sm:text-xs text-[#d4af37]/70 tracking-[0.25em] uppercase font-[family-name:var(--font-inter)] font-semibold">
              Combos Exclusivos
            </span>
            <Tag className="w-4 h-4 text-[#d4af37]/70" />
          </div>

          {/* Main title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-playfair)] text-white/95 mb-3 leading-tight">
            Experiencias en Combo:{" "}
            <span className="bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] bg-clip-text text-transparent">
              Lleva más, ahorra más
            </span>
          </h2>

          {/* Gold divider */}
          <div className="w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent mx-auto mb-4" />

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-white/40 font-[family-name:var(--font-inter)] max-w-xl mx-auto leading-relaxed">
            Perfumes seleccionados para cada momento de tu vida.{" "}
            <span className="text-emerald-400/80 font-semibold">10% de descuento automático</span>
          </p>
        </motion.div>

        {/* ─── Category Filter Tabs ─── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10"
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeCategory === tab.key;
            const count = categoryCounts[tab.key] || 0;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`filter-pill flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm border transition-all duration-300 font-[family-name:var(--font-inter)] whitespace-nowrap hover:scale-[1.03] active:scale-[0.97] ${
                  isActive
                    ? "active border-[#d4af37] shadow-lg shadow-[#d4af37]/10"
                    : "border-[rgba(212,175,55,0.15)] text-white/60 hover:border-[#d4af37]/40 hover:text-white/90 bg-[#111111]/50"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                <span
                  className={`text-[10px] ${
                    isActive ? "text-[#0a0a0a]/60" : "text-white/30"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* ─── Combo Cards Grid ─── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={cardContainerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7"
          >
            {filteredCombos.map((combo) => (
              <motion.div
                key={combo.id}
                variants={cardItemVariants}
                layout
              >
                <ComboCard combo={combo} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ─── Empty state ─── */}
        {filteredCombos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Sparkles className="w-12 h-12 text-[#d4af37]/20 mx-auto mb-4" />
            <p className="text-white/30 font-[family-name:var(--font-inter)] text-sm">
              No hay combos disponibles en esta categoría aún.
            </p>
          </motion.div>
        )}

        {/* ─── Bottom decorative divider ─── */}
        <div className="mt-12 w-full h-px bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.12)] to-transparent" />
      </div>
    </section>
  );
}
