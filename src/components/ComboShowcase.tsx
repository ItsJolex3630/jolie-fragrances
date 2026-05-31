"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Tag, Star, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { combos, type Combo } from "@/lib/combosData";
import ComboCard from "@/components/ComboCard";
import { useCart } from "@/context/CartContext";

// ─── Category filter tabs config ───
type ComboCategory = "Todos" | Combo["category"];

const FILTER_TABS: { key: ComboCategory; label: string; icon: string }[] = [
  { key: "Todos", label: "Todos", icon: "✨" },
  { key: "Pareja", label: "💑 Pareja", icon: "💑" },
  { key: "Todo Terreno", label: "🧭 Todo Terreno", icon: "🧭" },
  { key: "Árabe", label: "☕ Cita en Dubai", icon: "☕" },
  { key: "Gourmand", label: "🍓 Dulce Tentación", icon: "🍓" },
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
  const [isMobileHidden, setIsMobileHidden] = useState(false);
  const [comboPage, setComboPage] = useState(1);
  const { addCombo, openCart } = useCart();

  const COMBOS_PER_PAGE = 12;

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

  // Pagination
  const comboTotalPages = Math.max(1, Math.ceil(filteredCombos.length / COMBOS_PER_PAGE));
  const safeComboPage = comboPage > comboTotalPages ? 1 : comboPage;
  const paginatedCombos = useMemo(() => {
    const start = (safeComboPage - 1) * COMBOS_PER_PAGE;
    return filteredCombos.slice(start, start + COMBOS_PER_PAGE);
  }, [filteredCombos, safeComboPage]);

  const goToComboPage = useCallback((page: number) => {
    setComboPage(page);
  }, []);

  // Generate visible page numbers
  const comboVisiblePages = useMemo(() => {
    if (comboTotalPages <= 7) {
      return Array.from({ length: comboTotalPages }, (_, i) => i + 1);
    }
    const pages: number[] = [1];
    const start = Math.max(2, safeComboPage - 1);
    const end = Math.min(comboTotalPages - 1, safeComboPage + 1);
    if (start > 2) pages.push(-1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < comboTotalPages - 1) pages.push(-1);
    pages.push(comboTotalPages);
    return pages;
  }, [comboTotalPages, safeComboPage]);

  // Reset page on category change
  const handleCategoryChange = useCallback((category: ComboCategory) => {
    setActiveCategory(category);
    setComboPage(1);
  }, []);

  return (
    <section className="relative z-10 border-t border-[rgba(212,175,55,0.08)] bg-[#0a0a0a] overflow-hidden">
      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />

      {/* ─── Background ambient glow ─── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] opacity-[0.03]"
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.6) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] opacity-[0.02]"
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.5) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ─── Floating sparkles ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[15, 35, 55, 75, 90, 25, 65, 45].map((left, i) => (
          <div
            key={i}
            className="absolute combo-sparkle"
            style={{
              left: `${left}%`,
              top: `${10 + (i * 12) % 70}%`,
              animationDelay: `${(i * 1.2) % 5}s`,
              animationDuration: `${3 + (i * 0.7) % 3}s`,
            }}
          >
            <Star className="w-1.5 h-1.5 text-[#d4af37]/15" />
          </div>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24">
        {/* ─── Section Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          className="text-center mb-12"
        >
          {/* Small label */}
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#d4af37]/40" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]/70" />
              <span className="text-[10px] sm:text-xs text-[#d4af37]/70 tracking-[0.25em] uppercase font-[family-name:var(--font-inter)] font-semibold">
                Combos Exclusivos
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]/70" />
            </div>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#d4af37]/40" />
          </div>

          {/* Main title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-playfair)] text-white/95 mb-4 leading-tight">
            Experiencias en Combo:{" "}
            <span className="bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] bg-clip-text text-transparent">
              Lleva más, ahorra más
            </span>
          </h2>

          {/* Gold divider with diamond */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent to-[#d4af37]/40" />
            <div className="w-2 h-2 rotate-45 bg-[#d4af37]/30 border border-[#d4af37]/40" />
            <div className="w-16 sm:w-24 h-px bg-gradient-to-l from-transparent to-[#d4af37]/40" />
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-white/40 font-[family-name:var(--font-inter)] max-w-lg mx-auto leading-relaxed">
            Perfumes seleccionados para cada momento de tu vida.{" "}
            <span className="text-emerald-400/80 font-semibold">10% de descuento automático</span>
          </p>

          {/* ─── Mobile toggle button (only visible on phones) ─── */}
          <div className="lg:hidden mt-6">
            <button
              onClick={() => setIsMobileHidden(!isMobileHidden)}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl border transition-all duration-300 font-[family-name:var(--font-inter)] text-sm active:scale-[0.97] ${
                isMobileHidden
                  ? "border-[#d4af37]/25 bg-[#d4af37]/[0.06] text-[#d4af37]/90 hover:bg-[#d4af37]/10"
                  : "border-[rgba(212,175,55,0.15)] bg-[#111111]/50 text-white/60 hover:border-[#d4af37]/30 hover:text-white/80"
              }`}
            >
              {isMobileHidden ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">Mostrar Combos</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="font-medium">Ocultar Combos</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              )}
              <span className="ml-1 text-[10px] bg-[#d4af37]/15 text-[#d4af37]/80 rounded-full px-2 py-0.5">
                {combos.length}
              </span>
            </button>
          </div>
        </motion.div>

        {/* ─── Collapsible content: always visible on desktop, toggleable on mobile ─── */}
        <AnimatePresence>
          {(!isMobileHidden) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              {/* ─── Category Filter Tabs ─── */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12"
              >
                {FILTER_TABS.map((tab) => {
                  const isActive = activeCategory === tab.key;
                  const count = categoryCounts[tab.key] || 0;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleCategoryChange(tab.key)}
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
                  key={`${activeCategory}-${safeComboPage}`}
                  variants={cardContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7"
                >
                  {paginatedCombos.map((combo) => (
                    <motion.div
                      key={combo.id}
                      variants={cardItemVariants}
                      layout
                    >
                      <ComboCard combo={combo} onAddToCart={(c) => { addCombo(c); openCart(); }} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* ─── Pagination Bar ─── */}
              {comboTotalPages > 1 && (
                <div className="mt-10 flex items-center justify-center">
                  <div className="relative rounded-2xl border border-[rgba(212,175,55,0.10)] bg-[#0d0d0d]/80 backdrop-blur-sm overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
                    <div className="px-4 sm:px-6 py-3 flex items-center justify-center gap-2 sm:gap-3">
                      <button
                        onClick={() => goToComboPage(Math.max(1, safeComboPage - 1))}
                        disabled={safeComboPage === 1}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#111111]/60 text-white/45 hover:text-[#d4af37] hover:border-[#d4af37]/30 hover:bg-[#111111] disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:text-white/45 disabled:hover:border-[rgba(212,175,55,0.12)] disabled:hover:bg-[#111111]/60 transition-all duration-300 font-[family-name:var(--font-inter)] text-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Anterior</span>
                      </button>
                      <div className="flex items-center gap-1">
                        {comboVisiblePages.map((page, i) =>
                          page === -1 ? (
                            <span
                              key={`combo-ellipsis-${i}`}
                              className="w-7 h-9 flex items-center justify-center text-white/15 text-[10px] font-[family-name:var(--font-inter)] tracking-wider"
                            >
                              ···
                            </span>
                          ) : (
                            <button
                              key={`combo-page-${page}`}
                              onClick={() => goToComboPage(page)}
                              className={`relative min-w-[2.25rem] h-9 flex items-center justify-center rounded-xl text-xs font-semibold transition-all duration-300 font-[family-name:var(--font-inter)] ${
                                safeComboPage === page
                                  ? "bg-gradient-to-br from-[#d4af37] via-[#c9a430] to-[#b8941e] text-[#0a0a0a] shadow-lg shadow-[#d4af37]/25 scale-105"
                                  : "border border-[rgba(212,175,55,0.08)] bg-[#111111]/40 text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/25 hover:bg-[#111111]/80"
                              }`}
                            >
                              {safeComboPage === page && (
                                <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                              )}
                              <span className="relative">{page}</span>
                            </button>
                          )
                        )}
                      </div>
                      <button
                        onClick={() => goToComboPage(Math.min(comboTotalPages, safeComboPage + 1))}
                        disabled={safeComboPage === comboTotalPages}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#111111]/60 text-white/45 hover:text-[#d4af37] hover:border-[#d4af37]/30 hover:bg-[#111111] disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:text-white/45 disabled:hover:border-[rgba(212,175,55,0.12)] disabled:hover:bg-[#111111]/60 transition-all duration-300 font-[family-name:var(--font-inter)] text-xs"
                      >
                        <span className="hidden sm:inline">Siguiente</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
                  </div>
                </div>
              )}

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

              {/* ─── Bottom decorative divider with diamond ─── */}
              <div className="mt-14 flex items-center justify-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.12)] to-[rgba(212,175,55,0.12)]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]/15" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[rgba(212,175,55,0.12)] to-[rgba(212,175,55,0.12)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Collapsed hint on mobile (shows count + mini text) ─── */}
        <AnimatePresence>
          {isMobileHidden && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden text-center py-6"
            >
              <div className="inline-flex items-center gap-2 text-[11px] text-white/20 font-[family-name:var(--font-inter)]">
                <div className="w-6 h-px bg-[#d4af37]/15" />
                <Sparkles className="w-3 h-3 text-[#d4af37]/25" />
                <span>{combos.length} combos disponibles arriba</span>
                <Sparkles className="w-3 h-3 text-[#d4af37]/25" />
                <div className="w-6 h-px bg-[#d4af37]/15" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
