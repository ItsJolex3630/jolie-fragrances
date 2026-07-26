"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  MessageCircle,
  Droplets,
  Filter,
  Gem,
  Sparkles,
  Check,
  ShoppingCart,
} from "lucide-react";
import {
  DECANTS,
  DECANT_BRANDS,
  DECANT_GENDERS,
  type Decant,
  type DecantBrand,
  type DecantGender,
} from "@/lib/decantsData";

interface DecantsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Gender badge styles (matching main catalog)
const genderStyles: Record<DecantGender, string> = {
  Dama: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Caballero: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Unisex: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const genderIcons: Record<DecantGender, string> = {
  Dama: "♀",
  Caballero: "♂",
  Unisex: "⚥",
};

function getImageUrl(fragranticaId: number): string {
  return `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${fragranticaId}.avif`;
}

function formatPrice(price: number): string {
  return `$${price}`;
}

// WhatsApp URL builder
function buildWhatsAppUrl(items: { name: string; brand: string; price: number }[]): string {
  if (items.length === 1) {
    const item = items[0];
    const msg = `Hola Jolie Fragrances! Me gustaría consultar por el decant de 10ml de ${item.name} - ${item.brand} (${formatPrice(item.price)})`;
    return `https://wa.me/584244055386?text=${encodeURIComponent(msg)}`;
  }
  const lines = items.map((item, i) => `${i + 1}. ${item.name} - ${item.brand} (${formatPrice(item.price)})`);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const msg = `Hola Jolie Fragrances! Me gustaría consultar por los siguientes decants de 10ml:\n\n${lines.join("\n")}\n\nTotal: ${formatPrice(total)}`;
  return `https://wa.me/584244055386?text=${encodeURIComponent(msg)}`;
}

const DECANTS_PER_PAGE = 24;

export default function DecantsModal({ isOpen, onClose }: DecantsModalProps) {
  const [selectedBrand, setSelectedBrand] = useState<DecantBrand | "Todas">("Todas");
  const [selectedGender, setSelectedGender] = useState<DecantGender | "Todos">("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDecants, setSelectedDecants] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedBrand("Todas");
      setSelectedGender("Todos");
      setSearchQuery("");
      setSelectedDecants(new Set());
      setCurrentPage(1);
      setShowFilters(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter decants
  const filteredDecants = useMemo(() => {
    return DECANTS.filter((d) => {
      const matchesBrand = selectedBrand === "Todas" || d.brand === selectedBrand;
      const matchesGender = selectedGender === "Todos" || d.gender === selectedGender;
      const matchesSearch =
        searchQuery.trim() === "" ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBrand && matchesGender && matchesSearch;
    });
  }, [selectedBrand, selectedGender, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDecants.length / DECANTS_PER_PAGE));
  const safePage = currentPage > totalPages ? 1 : currentPage;
  const paginatedDecants = useMemo(() => {
    const start = (safePage - 1) * DECANTS_PER_PAGE;
    return filteredDecants.slice(start, start + DECANTS_PER_PAGE);
  }, [filteredDecants, safePage]);

  // Visible page numbers
  const visiblePages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: number[] = [1];
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    if (start > 2) pages.push(-1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push(-1);
    pages.push(totalPages);
    return pages;
  }, [totalPages, safePage]);

  // Counts
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { Todas: DECANTS.length };
    DECANTS.forEach((d) => { counts[d.brand] = (counts[d.brand] || 0) + 1; });
    return counts;
  }, []);

  const genderCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: DECANTS.length };
    DECANTS.forEach((d) => { counts[d.gender] = (counts[d.gender] || 0) + 1; });
    return counts;
  }, []);

  // Selection management
  const toggleDecant = useCallback((key: string) => {
    setSelectedDecants((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const selectedItems = useMemo(() => {
    return DECANTS.filter((d) => selectedDecants.has(`${d.brand}-${d.name}`));
  }, [selectedDecants]);

  const clearSelection = useCallback(() => setSelectedDecants(new Set()), []);

  // Filter handlers
  const handleBrandChange = useCallback((brand: DecantBrand | "Todas") => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  }, []);
  const handleGenderChange = useCallback((gender: DecantGender | "Todos") => {
    setSelectedGender(gender);
    setCurrentPage(1);
  }, []);
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90" onClick={onClose} />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-[95vw] max-w-5xl h-[90vh] max-h-[800px] bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
          >
            {/* ─── Header ─── */}
            <div className="flex-shrink-0 border-b border-[rgba(212,175,55,0.1)] px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/20">
                    <Droplets className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-playfair)] text-white">
                      Decants 10ml
                    </h2>
                    <p className="text-xs text-white/40 font-[family-name:var(--font-inter)]">
                      {DECANTS.length} fragancias disponibles · Desde $10
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]/40" />
                <input
                  type="text"
                  placeholder="Buscar decant..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-[rgba(212,175,55,0.12)] rounded-xl text-white placeholder:text-[#555] focus:border-[#d4af37]/30 focus:ring-1 focus:ring-[#d4af37]/15 transition-all outline-none font-[family-name:var(--font-inter)] text-sm"
                />
              </div>

              {/* Filter pills row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all font-[family-name:var(--font-inter)] whitespace-nowrap ${
                    showFilters
                      ? "bg-[#d4af37]/15 border-[#d4af37]/30 text-[#d4af37]"
                      : "bg-white/5 border-white/10 text-white/50 hover:text-white/70"
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  Filtros
                </button>

                {/* Brand pills */}
                {(["Todas", ...DECANT_BRANDS] as const).map((brand) => (
                  <button
                    key={brand}
                    onClick={() => handleBrandChange(brand)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all font-[family-name:var(--font-inter)] whitespace-nowrap ${
                      selectedBrand === brand
                        ? "bg-[#d4af37] border-[#d4af37] text-black font-semibold"
                        : "bg-white/5 border-white/10 text-white/50 hover:text-white/70"
                    }`}
                  >
                    {brand}
                    <span className="ml-1 text-[10px] opacity-60">{brandCounts[brand] || 0}</span>
                  </button>
                ))}
              </div>

              {/* Expandable gender filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 pt-3">
                      <span className="text-[10px] text-white/30 font-[family-name:var(--font-inter)] uppercase tracking-wider">Género:</span>
                      {(["Todos", ...DECANT_GENDERS] as const).map((gender) => (
                        <button
                          key={gender}
                          onClick={() => handleGenderChange(gender)}
                          className={`px-3 py-1.5 rounded-lg text-xs border transition-all font-[family-name:var(--font-inter)] whitespace-nowrap ${
                            selectedGender === gender
                              ? "bg-[#d4af37] border-[#d4af37] text-black font-semibold"
                              : "bg-white/5 border-white/10 text-white/50 hover:text-white/70"
                          }`}
                        >
                          {genderIcons[gender as DecantGender] || ""} {gender}
                          <span className="ml-1 text-[10px] opacity-60">{genderCounts[gender] || 0}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── Grid ─── */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              {filteredDecants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/30">
                  <Sparkles className="w-10 h-10 mb-3 text-[#d4af37]/20" />
                  <p className="text-sm font-[family-name:var(--font-inter)]">No se encontraron decants</p>
                  <p className="text-xs mt-1 font-[family-name:var(--font-inter)]">Intenta con otros filtros</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {paginatedDecants.map((decant, index) => {
                    const key = `${decant.brand}-${decant.name}`;
                    const isSelected = selectedDecants.has(key);
                    return (
                      <DecantCard
                        key={key}
                        decant={decant}
                        isSelected={isSelected}
                        onToggle={() => toggleDecant(key)}
                        index={index}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─── Pagination ─── */}
            {totalPages > 1 && (
              <div className="flex-shrink-0 border-t border-[rgba(212,175,55,0.08)] px-4 py-2 flex items-center justify-center gap-1">
                {visiblePages.map((page, i) =>
                  page === -1 ? (
                    <span key={`ellipsis-${i}`} className="text-white/20 text-xs px-1">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[28px] h-7 rounded-lg text-xs font-[family-name:var(--font-inter)] transition-all ${
                        safePage === page
                          ? "bg-[#d4af37] text-black font-bold"
                          : "text-white/40 hover:text-white/70 hover:bg-white/5"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}

            {/* ─── Bottom Action Bar ─── */}
            {selectedDecants.size > 0 && (
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex-shrink-0 border-t border-[rgba(212,175,55,0.15)] bg-[#0d0d0d] px-4 sm:px-6 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/20">
                      <ShoppingCart className="w-4 h-4 text-[#d4af37]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-white/60 font-[family-name:var(--font-inter)] truncate">
                        {selectedDecants.size} decant{selectedDecants.size > 1 ? "s" : ""} seleccionado{selectedDecants.size > 1 ? "s" : ""}
                      </p>
                      <p className="text-sm font-bold font-[family-name:var(--font-inter)] bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent">
                        Total: {formatPrice(selectedItems.reduce((s, d) => s + d.price, 0))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearSelection}
                      className="px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 bg-white/5 border border-white/10 transition-all font-[family-name:var(--font-inter)]"
                    >
                      Limpiar
                    </button>
                    <a
                      href={buildWhatsAppUrl(selectedItems)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-xs font-bold font-[family-name:var(--font-inter)] shadow-lg shadow-[#25D366]/20 hover:bg-[#2ee071] transition-all active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Consultar {selectedDecants.size > 1 ? `${selectedDecants.size} decants` : "decant"}
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Decant Card Component ───
function DecantCard({
  decant,
  isSelected,
  onToggle,
  index,
}: {
  decant: Decant;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [triedJpg, setTriedJpg] = useState(false);

  const hasImage = decant.fragranticaId !== null;

  // Try .avif first, fallback to .jpg
  const avifSrc = hasImage ? getImageUrl(decant.fragranticaId!) : null;
  const jpgSrc = hasImage
    ? `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${decant.fragranticaId}.jpg`
    : null;
  const imgSrc = triedJpg ? jpgSrc : avifSrc;

  const handleImgError = useCallback(() => {
    if (!triedJpg && avifSrc) {
      setTriedJpg(true);
      setImgError(false);
    } else {
      setImgError(true);
    }
  }, [triedJpg, avifSrc]);

  return (
    <div
      className={`relative card-fade-in rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer group ${
        isSelected
          ? "border-[#d4af37]/50 bg-[#d4af37]/5 ring-1 ring-[#d4af37]/30"
          : "border-[rgba(212,175,55,0.08)] bg-[#111111] hover:border-[rgba(212,175,55,0.25)]"
      }`}
      style={{ animationDelay: `${Math.min(index * 0.02, 0.4)}s` }}
      onClick={onToggle}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 z-20 flex items-center justify-center w-6 h-6 rounded-full bg-[#d4af37] shadow-lg shadow-[#d4af37]/30">
          <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
        </div>
      )}

      {/* Image area — perfume (left, large) + decant (right, smaller), side by side, touching */}
      <div className="relative flex items-end overflow-hidden bg-transparent" style={{ height: "280px" }}>
        {/* Perfume bottle — left side, large */}
        <div className="flex items-end justify-center h-full" style={{ flex: "2.5" }}>
          {hasImage && !imgError ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="skeleton-pulse">
                    <Sparkles className="w-10 h-10 text-[#d4af37]/15" />
                  </div>
                </div>
              )}
              <img
                src={imgSrc!}
                alt={`${decant.name} - ${decant.brand}`}
                className={`h-[90%] w-auto max-w-full object-contain object-bottom transition-all duration-500 group-hover:scale-105 ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImgLoaded(true)}
                onError={handleImgError}
                loading="lazy"
                decoding="async"
                style={{ color: "transparent" }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 h-full">
              <Gem className="w-12 h-12 text-[#d4af37]/15" />
              <span className="text-[10px] text-[#d4af37]/25 text-center px-2 font-[family-name:var(--font-inter)] leading-tight">
                {decant.name}
              </span>
            </div>
          )}
        </div>

        {/* Decant bottle — overlaid on right side, touching/overlapping the perfume */}
        <div className="absolute bottom-0 right-0 z-10 flex items-end justify-end" style={{ width: "28%", height: "65%" }}>
          <img
            src="/decant-bottle-nobg.png"
            alt="Decant 10ml"
            className="h-full w-auto object-contain object-bottom"
            loading="lazy"
          />
        </div>

        {/* Gender badge */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <span
            className={`inline-flex items-center gap-0.5 text-[9px] px-2 py-0.5 rounded-full border font-[family-name:var(--font-inter)] ${genderStyles[decant.gender]}`}
          >
            <span>{genderIcons[decant.gender]}</span>
            {decant.gender}
          </span>
        </div>
      </div>

      {/* Info section */}
      <div className="p-2.5 sm:p-3">
        <p className="text-[9px] sm:text-[10px] text-[#d4af37]/70 font-semibold tracking-[0.1em] uppercase font-[family-name:var(--font-inter)] truncate">
          {decant.brand}
        </p>
        <h3 className="text-[11px] sm:text-xs font-semibold text-white/90 leading-snug font-[family-name:var(--font-playfair)] line-clamp-2 min-h-[2rem] mt-0.5">
          {decant.name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-xs sm:text-sm font-bold font-[family-name:var(--font-inter)] bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent">
            {formatPrice(decant.price)}
          </p>
          {/* Individual WhatsApp button */}
          <a
            href={buildWhatsAppUrl([{ name: decant.name, brand: decant.brand, price: decant.price }])}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#25D366]/10 border border-[#25D366]/15 text-[#25D366]/60 hover:text-[#25D366] hover:bg-[#25D366]/20 hover:border-[#25D366]/30 transition-all active:scale-90"
            title={`Consultar decant de ${decant.name}`}
          >
            <MessageCircle className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
