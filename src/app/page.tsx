"use client";

import { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

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
  ExternalLink,
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
} from "lucide-react";
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
} from "@/lib/perfumes";

// ─── Dynamic imports for heavy modal components (only loaded when needed) ───
const PerfumeDetail = dynamic(() => import("@/components/PerfumeDetail"), { ssr: false });
const CompareModal = dynamic(() => import("@/components/CompareModal"), { ssr: false });

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

// ─── Animation variants (removed cardVariants — cards now use CSS fade-in) ───

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

// ─── Perfume Card Component ───
const PerfumeCard = memo(function PerfumeCard({
  perfume,
  index,
  onSelect,
}: {
  perfume: Perfume;
  index: number;
  onSelect: (perfume: Perfume) => void;
}) {
  const [imgTriedJpg, setImgTriedJpg] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Primary .avif URL, fallback to .jpg
  const imgSrc = imgTriedJpg
    ? `https://fimgs.net/mdimg/perfume/${perfume.fragranticaId}.jpg`
    : getImageUrl(perfume.fragranticaId);

  const handleImgError = useCallback(() => {
    if (!imgTriedJpg) {
      setImgTriedJpg(true);
      setImgLoaded(false);
    } else {
      setImgError(true);
    }
  }, [imgTriedJpg]);

  return (
    <div
      className="perfume-card group relative card-fade-in"
      style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
    >
      <div className="card-shimmer-border relative overflow-hidden rounded-xl border border-[rgba(212,175,55,0.12)] bg-[#111111] transition-all duration-500 group-hover:border-[rgba(212,175,55,0.35)] gold-glow-hover">
        {/* Image container - dark background for the bottle */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
          {/* Loading skeleton */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0d0d0d] to-[#080808]">
              <div className="skeleton-pulse flex flex-col items-center gap-2">
                <Sparkles className="w-8 h-8 text-[#d4af37]/20" />
                <div className="w-12 h-1 rounded-full bg-[#d4af37]/10" />
              </div>
            </div>
          )}
          {/* Fallback when image fails */}
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
            />
          )}

          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Fragrantica link indicator */}
          <div className="absolute top-2 right-2 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-[#d4af37] text-[#0a0a0a] rounded-full p-1.5 shadow-lg shadow-[#d4af37]/20">
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          {/* Gender badge */}
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <span
              className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] px-2 py-0.5 sm:py-1 rounded-full border font-[family-name:var(--font-inter)] ${genderStyles[perfume.gender]}`}
            >
              <span>{genderIcons[perfume.gender]}</span>
              {perfume.gender}
            </span>
          </div>

          {/* Size badge */}
          <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
            <span className="text-[9px] sm:text-[10px] px-2 py-0.5 sm:py-1 rounded-full border border-white/10 bg-black/60 text-white/50 font-[family-name:var(--font-inter)]">
              {perfume.size}
            </span>
          </div>

          {/* Hover text overlay */}
          <div className="absolute bottom-8 left-0 right-0 text-center z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-[9px] text-[#d4af37]/80 font-[family-name:var(--font-inter)] tracking-wider">
              Ver detalles →
            </p>
          </div>

          {/* Clickable overlay - opens detail view */}
          <button
            onClick={() => onSelect(perfume)}
            className="absolute inset-0 z-10 cursor-pointer"
            aria-label={`Ver detalles de ${perfume.name}`}
          />
        </div>

        {/* Info section - also clickable */}
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
          </div>
        </button>
      </div>
    </div>
  );
});

// ─── Brand Card Component ───
function BrandCard({
  brand,
  count,
  isSelected,
  onClick,
}: {
  brand: Brand | "Todas" | "Todos" | Gender;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`filter-pill px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm border transition-all duration-300 font-[family-name:var(--font-inter)] whitespace-nowrap hover:scale-[1.03] active:scale-[0.97] ${
        isSelected
          ? "active border-[#d4af37] shadow-lg shadow-[#d4af37]/10"
          : "border-[rgba(212,175,55,0.15)] text-white/60 hover:border-[#d4af37]/40 hover:text-white/90 bg-[#111111]/50"
      }`}
    >
      <span className="font-medium">{brand}</span>
      <span className={`ml-1.5 text-[10px] ${isSelected ? "text-[#0a0a0a]/60" : "text-white/30"}`}>
        {count}
      </span>
    </button>
  );
}

// ─── Main Page Component ───
export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState<Brand | "Todas">("Todas");
  const [selectedGender, setSelectedGender] = useState<Gender | "Todos">("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  // ─── Perfume list (fetched from API) ───
  const [allPerfumes, setAllPerfumes] = useState<Perfume[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | "Todas">("Todas");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Pagination config ───
  const PERFUMES_PER_PAGE = 20;

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.95]);

  // ─── Fetch perfumes on mount ───
  useEffect(() => {
    async function init() {
      try {
        const perfRes = await fetch("/api/perfumes");
        if (perfRes.ok) {
          const perfData = await perfRes.json();
          if (perfData.perfumes && perfData.perfumes.length > 0) {
            setAllPerfumes(perfData.perfumes);
            const brandSet = new Set<string>();
            perfData.perfumes.forEach((p: Perfume) => brandSet.add(p.brand));
            setAllBrands([...brandSet] as Brand[]);
          }
        }
      } catch {
        // Fallback: empty list
      }
      setIsLoading(false);
    }
    init();
  }, []);

  // Close autocomplete on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to top button (throttled for performance)
  useEffect(() => {
    let ticking = false;
    function handleScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 600);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter perfumes
  const filteredPerfumes = useMemo(() => {
    return allPerfumes.filter((p) => {
      const matchesBrand =
        selectedBrand === "Todas" || p.brand === selectedBrand;
      const matchesGender =
        selectedGender === "Todos" || p.gender === selectedGender;
      const matchesNote =
        selectedNote === "Todas" ||
        (p.notes && p.notes.includes(selectedNote));
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBrand && matchesGender && matchesNote && matchesSearch;
    });
  }, [allPerfumes, selectedBrand, selectedGender, selectedNote, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPerfumes.length / PERFUMES_PER_PAGE));
  // Clamp page if it exceeds total (e.g. after filter change)
  const safePage = currentPage > totalPages ? 1 : currentPage;
  const paginatedPerfumes = useMemo(() => {
    const start = (safePage - 1) * PERFUMES_PER_PAGE;
    return filteredPerfumes.slice(start, start + PERFUMES_PER_PAGE);
  }, [filteredPerfumes, safePage, PERFUMES_PER_PAGE]);

  // Change page with scroll to catalog
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    // Smooth scroll to catalog section
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Filter handlers that also reset page
  const handleBrandChange = useCallback((brand: Brand | "Todas") => {
    setSelectedBrand(brand);
    setCurrentPage(1);
  }, []);
  const handleGenderChange = useCallback((gender: Gender | "Todos") => {
    setSelectedGender(gender);
    setCurrentPage(1);
  }, []);
  const handleNoteChange = useCallback((note: Note | "Todas") => {
    setSelectedNote(note);
    setCurrentPage(1);
  }, []);
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  // Generate visible page numbers (show max 5 pages around current)
  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: number[] = [1];
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    if (start > 2) pages.push(-1); // ellipsis
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push(-1); // ellipsis
    pages.push(totalPages);
    return pages;
  }, [totalPages, safePage]);

  // Autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    const query = searchQuery.toLowerCase();
    const matches = allPerfumes.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    );
    return matches.slice(0, 8);
  }, [allPerfumes, searchQuery]);

  const handleSuggestionClick = useCallback((name: string) => {
    setSearchQuery(name);
    setCurrentPage(1);
    setShowAutocomplete(false);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToCatalog = useCallback(() => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
    setShowAutocomplete(false);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedBrand("Todas");
    setSelectedGender("Todos");
    setSelectedNote("Todas");
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { Todas: allPerfumes.length };
    allBrands.forEach((brand) => {
      counts[brand] = allPerfumes.filter((p) => p.brand === brand).length;
    });
    return counts;
  }, [allPerfumes, allBrands]);

  const genderCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: allPerfumes.length };
    GENDERS.forEach((gender) => {
      counts[gender] = allPerfumes.filter((p) => p.gender === gender).length;
    });
    return counts;
  }, [allPerfumes]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedBrand !== "Todas") count++;
    if (selectedGender !== "Todos") count++;
    if (selectedNote !== "Todas") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedBrand, selectedGender, selectedNote, searchQuery]);

  return (
    <div
      ref={topRef}
      className="min-h-screen flex flex-col bg-[#0a0a0a] relative"
    >
      {/* ─── HERO SECTION ─── */}
      <motion.header
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative overflow-hidden"
      >
        {/* Background aurora blobs */}
        <div className="hero-aurora">
          <div className="hero-aurora-blob hero-aurora-blob-1" />
          <div className="hero-aurora-blob hero-aurora-blob-2" />
          <div className="hero-aurora-blob hero-aurora-blob-3" />
        </div>

        {/* Background gradient */}
        <div className="absolute inset-0 hero-gradient" />

        {/* Floating gold particles — reduced for mobile performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[10, 30, 50, 70, 85, 20, 45, 65, 40, 75].map((left, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#d4af37]/30 rounded-full floating-particle"
              style={{
                left: `${left}%`,
                animationDuration: `${8 + (i * 1.7) % 12}s`,
                animationDelay: `${(i * 0.9) % 8}s`,
              }}
            />
          ))}
        </div>

        {/* Shimmer line decorations */}
        <div className="absolute top-0 left-0 right-0 h-px shimmer-line" />
        <div className="absolute bottom-0 left-0 right-0 h-px shimmer-line" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 text-center">
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
              <span className="text-[#d4af37] text-xs sm:text-sm tracking-[0.3em] uppercase font-[family-name:var(--font-inter)]">
                Consultora de Perfumes Premium
              </span>
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
            </div>
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-4 font-[family-name:var(--font-playfair)]"
          >
            <span className="shimmer-text">Jolie</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-[0.15em] text-white/90 mb-6 font-[family-name:var(--font-cormorant)]"
          >
            FRAGRANCES
          </motion.h2>

          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-6"
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-white/60 text-sm sm:text-base max-w-xl mx-auto font-[family-name:var(--font-inter)] leading-relaxed mb-8"
          >
            Descubre fragancias árabes exclusivas que reflejan tu esencia.
            Asesoría personalizada para encontrar tu perfume ideal.
          </motion.p>

          {/* Feature pills */}
          <div
            className="flex flex-wrap items-center justify-center gap-3 mb-8"
          >
            {[
              { icon: Crown, text: "Originales" },
              { icon: Star, text: "Premium" },
              { icon: Heart, text: "Asesoría" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + i * 0.15, type: "spring", stiffness: 200, damping: 20 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(212,175,55,0.15)] bg-[rgba(212,175,55,0.05)]"
              >
                <item.icon className="w-3.5 h-3.5 text-[#d4af37]/70" />
                <span className="text-xs text-white/50 font-[family-name:var(--font-inter)]">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA + Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToCatalog}
              className="cta-shimmer px-6 py-3 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8941e] text-[#0a0a0a] font-semibold text-sm font-[family-name:var(--font-inter)] shadow-lg shadow-[#d4af37]/20"
            >
              Explorar Catálogo
            </motion.button>
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.35 }}
              href="https://www.instagram.com/jolie.fragrances.vnzl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[rgba(212,175,55,0.25)] text-[#d4af37] hover:bg-[#d4af37]/10 transition-all duration-300 text-sm font-[family-name:var(--font-inter)]"
            >
              <Instagram className="w-4 h-4" />
              @jolie.fragrances.vnzl
            </motion.a>
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              href="https://wa.me/584244055386"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] hover:bg-[#25D366]/20 transition-all duration-300 text-sm font-[family-name:var(--font-inter)]"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </motion.a>
          </motion.div>
        </div>
      </motion.header>

      {/* ─── BRAND SHOWCASE ─── */}
      <section className="relative z-10 border-y border-[rgba(212,175,55,0.08)] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          >
            <span className="text-[10px] text-[#555] tracking-[0.2em] uppercase font-[family-name:var(--font-inter)]">
              Marcas disponibles
            </span>
            {allBrands.map((brand, i) => (
              <motion.button
                key={brand}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onClick={() => {
                  handleBrandChange(brand);
                  scrollToCatalog();
                }}
                className="text-sm sm:text-base font-[family-name:var(--font-playfair)] text-white/40 hover:text-[#d4af37] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                {brand}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <main ref={catalogRef} className="flex-1 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-playfair)] text-white mb-2">
            Nuestro Catálogo
          </h2>
          <p className="text-sm text-white/40 font-[family-name:var(--font-inter)]">
            Explora nuestra colección de fragancias árabes premium
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 relative max-w-2xl mx-auto"
          ref={searchRef}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d4af37]/50" />
            <input
              type="text"
              placeholder="Buscar perfume o marca..."
              value={searchQuery}
              onChange={(e) => {
                handleSearchChange(e.target.value);
                setShowAutocomplete(true);
              }}
              onFocus={() => setShowAutocomplete(true)}
              className="w-full pl-12 pr-24 py-3.5 bg-[#111111] border border-[rgba(212,175,55,0.15)] rounded-xl text-white placeholder:text-[#555] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all duration-300 outline-none font-[family-name:var(--font-inter)] text-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-[#666] hover:text-white transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowCompare(true)}
                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/20 transition-all font-[family-name:var(--font-inter)]"
                title="Comparar perfumes"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span className="hidden sm:inline">Comparar</span>
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-[#d4af37]/15 text-[#d4af37] hover:bg-[#d4af37]/25 transition-all font-[family-name:var(--font-inter)]"
                >
                  Limpiar ({activeFilterCount})
                </button>
              )}
            </div>
          </div>

          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {showAutocomplete && autocompleteSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-[rgba(212,175,55,0.15)] rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/50"
              >
                {autocompleteSuggestions.map((perfume) => (
                  <button
                    key={perfume.id}
                    onClick={() => handleSuggestionClick(perfume.name)}
                    className="autocomplete-item w-full px-4 py-3 flex items-center gap-3 text-left transition-colors duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0d0d0d] flex-shrink-0 border border-[rgba(212,175,55,0.1)]">
                      <img
                        src={getImageUrl(perfume.fragranticaId)}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate font-[family-name:var(--font-inter)]">
                        {perfume.name}
                      </p>
                      <p className="text-xs text-[#d4af37]/60 font-[family-name:var(--font-inter)]">
                        {perfume.brand} • {perfume.gender}
                      </p>
                    </div>
                    <ChevronDown className="w-3 h-3 text-white/20 rotate-[-90deg]" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[rgba(212,175,55,0.15)] bg-[#111111] text-[#d4af37] transition-all duration-300 font-[family-name:var(--font-inter)] text-sm"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            {activeFilterCount > 0 && (
              <span className="bg-[#d4af37] text-[#0a0a0a] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`mb-8 space-y-5 ${
            showFilters ? "block" : "hidden lg:block"
          }`}
        >
          {/* Brand filters */}
          <div>
            <h3 className="text-[10px] text-[#555] tracking-[0.2em] uppercase mb-3 font-[family-name:var(--font-inter)]">
              Marca
            </h3>
            <div className="flex flex-wrap gap-2">
              <BrandCard
                brand="Todas"
                count={brandCounts.Todas}
                isSelected={selectedBrand === "Todas"}
                onClick={() => handleBrandChange("Todas")}
              />
              {allBrands.map((brand) => (
                <BrandCard
                  key={brand}
                  brand={brand}
                  count={brandCounts[brand]}
                  isSelected={selectedBrand === brand}
                  onClick={() => handleBrandChange(brand)}
                />
              ))}
            </div>
          </div>

          {/* Gender filters */}
          <div>
            <h3 className="text-[10px] text-[#555] tracking-[0.2em] uppercase mb-3 font-[family-name:var(--font-inter)]">
              Género
            </h3>
            <div className="flex flex-wrap gap-2">
              <BrandCard
                brand="Todos"
                count={genderCounts.Todos}
                isSelected={selectedGender === "Todos"}
                onClick={() => handleGenderChange("Todos")}
              />
              {GENDERS.map((gender) => (
                <BrandCard
                  key={gender}
                  brand={gender}
                  count={genderCounts[gender]}
                  isSelected={selectedGender === gender}
                  onClick={() => handleGenderChange(gender)}
                />
              ))}
            </div>
          </div>

          {/* Note filters */}
          <div>
            <h3 className="text-[10px] text-[#555] tracking-[0.2em] uppercase mb-3 font-[family-name:var(--font-inter)]">
              Nota olfativa
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleNoteChange("Todas")}
                className={`filter-pill px-3.5 py-2 rounded-xl text-xs border transition-all duration-300 font-[family-name:var(--font-inter)] whitespace-nowrap hover:scale-[1.03] active:scale-[0.97] ${
                  selectedNote === "Todas"
                    ? "active border-[#d4af37] shadow-lg shadow-[#d4af37]/10"
                    : "border-[rgba(212,175,55,0.15)] text-white/60 hover:border-[#d4af37]/40 hover:text-white/90 bg-[#111111]/50"
                }`}
              >
                Todas
              </button>
              {NOTES.map((note) => {
                const info = NOTES_INFO[note];
                const isSelected = selectedNote === note;
                return (
                  <button
                    key={note}
                    onClick={() => handleNoteChange(isSelected ? "Todas" : note)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs border transition-all duration-300 font-[family-name:var(--font-inter)] whitespace-nowrap hover:scale-[1.03] active:scale-[0.97] ${
                      isSelected
                        ? `${info.bgColor} ${info.color} ${info.borderColor} shadow-sm`
                        : "border-[rgba(212,175,55,0.15)] text-white/60 hover:border-[#d4af37]/40 hover:text-white/90 bg-[#111111]/50"
                    }`}
                  >
                    <span className="text-sm">{info.emoji}</span>
                    {note}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[#666] font-[family-name:var(--font-inter)]">
            {isLoading ? (
              <span className="text-white/30">Cargando perfumes...</span>
            ) : (
              <>
                <span className="text-[#d4af37] font-semibold">
                  {filteredPerfumes.length}
                </span>{" "}
                {filteredPerfumes.length === 1 ? "perfume encontrado" : "perfumes encontrados"}
                {totalPages > 1 && (
                  <span className="text-white/20 ml-1">
                    · Página {safePage} de {totalPages}
                  </span>
                )}
              </>
            )}
          </p>
          {(selectedBrand !== "Todas" ||
            selectedGender !== "Todos" ||
            searchQuery) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#d4af37]/60 hover:text-[#d4af37] transition-colors font-[family-name:var(--font-inter)]"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Loading skeleton grid */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        )}

        {/* Perfume grid */}
        <AnimatePresence mode="wait">
          {!isLoading && (
            <motion.div
              key={`${selectedBrand}-${selectedGender}-${selectedNote}-${safePage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
            >
              {paginatedPerfumes.map((perfume, index) => (
                <PerfumeCard
                  key={perfume.id}
                  perfume={perfume}
                  index={index}
                  onSelect={() => setSelectedPerfume(perfume)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination controls */}
        {!isLoading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            {/* Page info */}
            <p className="text-xs text-white/30 font-[family-name:var(--font-inter)]">
              Mostrando {(safePage - 1) * PERFUMES_PER_PAGE + 1}–{Math.min(safePage * PERFUMES_PER_PAGE, filteredPerfumes.length)} de {filteredPerfumes.length} perfumes
            </p>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1.5">
              {/* Previous button */}
              <button
                onClick={() => goToPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[rgba(212,175,55,0.15)] bg-[#111111] text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/30 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-[rgba(212,175,55,0.15)] disabled:hover:text-white/50 transition-all duration-200 font-[family-name:var(--font-inter)] text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {visiblePages.map((page, i) =>
                  page === -1 ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="w-8 h-9 flex items-center justify-center text-white/20 text-xs font-[family-name:var(--font-inter)]"
                    >
                      •••
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 font-[family-name:var(--font-inter)] ${
                        safePage === page
                          ? "bg-gradient-to-r from-[#d4af37] to-[#b8941e] text-[#0a0a0a] shadow-md shadow-[#d4af37]/20"
                          : "border border-[rgba(212,175,55,0.12)] bg-[#111111] text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/30"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              {/* Next button */}
              <button
                onClick={() => goToPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[rgba(212,175,55,0.15)] bg-[#111111] text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/30 disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-[rgba(212,175,55,0.15)] disabled:hover:text-white/50 transition-all duration-200 font-[family-name:var(--font-inter)] text-xs"
              >
                Siguiente
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick jump - First & Last */}
            {totalPages > 3 && (
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => goToPage(1)}
                  disabled={safePage === 1}
                  className="text-[10px] text-white/25 hover:text-[#d4af37]/60 disabled:opacity-25 disabled:cursor-not-allowed transition-colors font-[family-name:var(--font-inter)]"
                >
                  Primera
                </button>
                <span className="text-white/10">|</span>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="text-[10px] text-white/25 hover:text-[#d4af37]/60 disabled:opacity-25 disabled:cursor-not-allowed transition-colors font-[family-name:var(--font-inter)]"
                >
                  Última
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && filteredPerfumes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-16 h-16 text-[#d4af37]/20 mx-auto mb-6" />
            </motion.div>
            <p className="text-white/40 text-xl font-[family-name:var(--font-playfair)] mb-2">
              No se encontraron perfumes
            </p>
            <p className="text-[#555] text-sm mb-6 font-[family-name:var(--font-inter)]">
              Intenta ajustar los filtros o buscar otro término
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#d4af37]/25 text-[#d4af37] hover:bg-[#d4af37]/10 transition-all duration-300 text-sm font-[family-name:var(--font-inter)]"
            >
              Ver todos los perfumes
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* ─── CTA SECTION ─── */}
      <section className="relative z-10 border-t border-[rgba(212,175,55,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Crown className="w-10 h-10 text-[#d4af37]/40 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-playfair)] text-white mb-3">
              ¿No encuentras tu fragancia ideal?
            </h2>
            <p className="text-white/40 text-sm sm:text-base max-w-lg mx-auto font-[family-name:var(--font-inter)] mb-8 leading-relaxed">
              Contáctanos por WhatsApp y recibe asesoría personalizada.
              Te ayudamos a encontrar el perfume perfecto para ti o para regalar.
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://wa.me/584244055386"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#25D366] text-white font-semibold text-sm font-[family-name:var(--font-inter)] shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/30 transition-shadow duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              Consultar por WhatsApp
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ─── OTRAS MARCAS (PRÓXIMAMENTE) ─── */}
      <section className="relative z-10 border-t border-[rgba(212,175,55,0.08)] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#d4af37]/60" />
              <span className="text-[10px] text-[#d4af37]/60 tracking-[0.25em] uppercase font-[family-name:var(--font-inter)]">
                Próximamente
              </span>
              <Clock className="w-4 h-4 text-[#d4af37]/60" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-playfair)] text-white mb-2">
              Otras Marcas
            </h2>
            <p className="text-white/35 text-sm max-w-md mx-auto font-[family-name:var(--font-inter)] leading-relaxed">
              Estamos expandiendo nuestro catálogo. Estas marcas llegarán pronto a Jolie Fragrances.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {[
              {
                name: "Valentino",
                subtitle: "Alta Costura Italiana",
                accent: "from-red-500/10 to-red-900/5",
                border: "border-red-500/15",
                hoverBorder: "hover:border-red-500/35",
                icon: "◆",
              },
              {
                name: "Jean Paul Gaultier",
                subtitle: "Rebeldía Francesa",
                accent: "from-blue-500/10 to-indigo-900/5",
                border: "border-blue-500/15",
                hoverBorder: "hover:border-blue-500/35",
                icon: "⛵",
              },
              {
                name: "Dior",
                subtitle: "Luxe Français",
                accent: "from-gray-300/10 to-gray-600/5",
                border: "border-gray-400/15",
                hoverBorder: "hover:border-gray-400/35",
                icon: "✦",
              },
              {
                name: "Prada",
                subtitle: "Elegancia Milanesa",
                accent: "from-emerald-500/10 to-emerald-900/5",
                border: "border-emerald-500/15",
                hoverBorder: "hover:border-emerald-500/35",
                icon: "▲",
              },
              {
                name: "Carolina Herrera",
                subtitle: "Glamour Venezolano",
                accent: "from-amber-500/10 to-amber-900/5",
                border: "border-amber-500/15",
                hoverBorder: "hover:border-amber-500/35",
                icon: "◈",
              },
            ].map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`group relative rounded-xl border ${brand.border} ${brand.hoverBorder} bg-gradient-to-b ${brand.accent} backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-lg hover:shadow-black/30 overflow-hidden`}
              >
                {/* Subtle shimmer on top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-5 sm:p-6 text-center flex flex-col items-center gap-3">
                  {/* Decorative icon */}
                  <div className="text-2xl sm:text-3xl text-white/15 group-hover:text-white/25 transition-colors duration-500">
                    {brand.icon}
                  </div>

                  {/* Brand name */}
                  <h3 className="text-sm sm:text-base font-semibold font-[family-name:var(--font-playfair)] text-white/80 group-hover:text-white transition-colors duration-300 leading-tight">
                    {brand.name}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-[10px] sm:text-xs text-white/25 font-[family-name:var(--font-inter)] tracking-wider">
                    {brand.subtitle}
                  </p>

                  {/* Coming soon badge */}
                  <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#d4af37]/15 bg-[#d4af37]/5">
                    <Clock className="w-3 h-3 text-[#d4af37]/50" />
                    <span className="text-[9px] sm:text-[10px] text-[#d4af37]/60 font-[family-name:var(--font-inter)] tracking-wider uppercase">
                      Próximamente
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom decorative line */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-[#d4af37]/15" />
            <Sparkles className="w-4 h-4 text-[#d4af37]/20" />
            <div className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-[#d4af37]/15" />
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <ScrollRevealDiv>
      <footer className="relative z-10 border-t border-[rgba(212,175,55,0.1)] bg-[#060606] mt-auto">
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Brand */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold font-[family-name:var(--font-playfair)] shimmer-text inline-block">
                Jolie Fragrances
              </h3>
              <p className="text-[#666] text-sm mt-2 font-[family-name:var(--font-inter)]">
                Tu consultora de perfumes premium en Venezuela
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://www.instagram.com/jolie.fragrances.vnzl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(212,175,55,0.15)] text-white/60 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all duration-300 text-sm font-[family-name:var(--font-inter)]"
              >
                <Instagram className="w-4 h-4" />
                <span className="hidden sm:inline">Instagram</span>
              </a>
              <a
                href="https://wa.me/584244055386"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/8 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/15 transition-all duration-300 text-sm font-[family-name:var(--font-inter)]"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>

            {/* Contact info */}
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2 text-[#666] text-sm font-[family-name:var(--font-inter)]">
                <Phone className="w-4 h-4" />
                <span>+58 424-4055386</span>
              </div>
              <p className="text-[#444] text-xs mt-2 font-[family-name:var(--font-inter)]">
                Asesoría personalizada • Envíos a todo el país
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-[rgba(212,175,55,0.06)] text-center">
            <p className="text-[#444] text-xs font-[family-name:var(--font-inter)]">
              © {new Date().getFullYear()} Jolie Fragrances. Todos los derechos
              reservados. Las imágenes pertenecen a Fragrantica.
            </p>
          </div>
        </div>
      </footer>
      </ScrollRevealDiv>

      {/* ─── FLOATING WHATSAPP BUTTON ─── */}
      <a
        href="https://wa.me/584244055386"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white rounded-full p-4 shadow-lg whatsapp-pulse hover:scale-110 transition-transform duration-300"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* ─── SCROLL TO TOP BUTTON ─── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-[#d4af37] to-[#b8941e] text-[#0a0a0a] rounded-full p-3 shadow-lg shadow-[#d4af37]/30 hover:shadow-[#d4af37]/40 transition-shadow duration-300"
            aria-label="Volver arriba"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── PERFUME DETAIL OVERLAY ─── */}
      <AnimatePresence>
        {selectedPerfume && (
          <PerfumeDetail
            key={selectedPerfume.id}
            perfume={selectedPerfume}
            isFavorited={false}
            isLoggedIn={false}
            onClose={() => setSelectedPerfume(null)}
            onToggleFavorite={() => {}}
          />
        )}
      </AnimatePresence>

      {/* ─── COMPARE MODAL ─── */}
      <CompareModal
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        perfumes={allPerfumes}
        initialPerfume1={null}
      />
    </div>
  );
}
