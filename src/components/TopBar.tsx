"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ArrowLeftRight,
  Sparkles,
  Instagram,
  MessageCircle,
} from "lucide-react";

interface TopBarProps {
  onSearch: () => void;
  onCompare: () => void;
  onSimilar: () => void;
}

export default function TopBar({ onSearch, onCompare, onSimilar }: TopBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Smart scroll: hide on scroll DOWN (mobile), show on scroll UP or at top
  useEffect(() => {
    function handleScroll() {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const atTop = currentScrollY < 10;
        setIsAtTop(atTop);

        // Determine scroll direction
        if (atTop) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY.current + 5) {
          // Scrolling DOWN
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY.current - 5) {
          // Scrolling UP
          setIsVisible(true);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = useCallback(() => {
    onSearch();
  }, [onSearch]);

  const handleCompare = useCallback(() => {
    onCompare();
  }, [onCompare]);

  const handleSimilar = useCallback(() => {
    onSimilar();
  }, [onSimilar]);

  return (
    <nav
      className={`top-bar fixed top-0 left-0 right-0 z-40 ${
        isVisible ? "top-bar-visible" : "top-bar-hidden"
      } ${isAtTop ? "bg-transparent" : "bg-[#0a0a0a]/85 backdrop-blur-xl border-b border-[rgba(212,175,55,0.08)]"}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-[52px] lg:h-[56px] flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-lg font-bold font-[family-name:var(--font-playfair)] shimmer-text tracking-wider">
            JOLIE
          </span>
          <div className="w-px h-4 bg-[rgba(212,175,55,0.2)] hidden sm:block" />
          <span className="text-[9px] text-white/25 tracking-[0.15em] uppercase font-[family-name:var(--font-inter)] hidden sm:block">
            Fragrances
          </span>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Search */}
          <button
            onClick={handleSearch}
            className="flex items-center justify-center lg:gap-1.5 w-9 h-9 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 rounded-full bg-[#111111]/60 border border-[rgba(212,175,55,0.1)] text-[#d4af37]/60 hover:text-[#d4af37] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all duration-200"
            title="Buscar perfume"
          >
            <Search className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">Buscar</span>
          </button>

          {/* Compare */}
          <button
            onClick={handleCompare}
            className="flex items-center justify-center lg:gap-1.5 w-9 h-9 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 rounded-full bg-[#111111]/60 border border-[rgba(212,175,55,0.1)] text-[#d4af37]/60 hover:text-[#d4af37] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all duration-200"
            title="Comparar perfumes"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">Comparar</span>
          </button>

          {/* Similar */}
          <button
            onClick={handleSimilar}
            className="flex items-center justify-center lg:gap-1.5 w-9 h-9 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 rounded-full bg-[#111111]/60 border border-[rgba(212,175,55,0.1)] text-[#d4af37]/60 hover:text-[#d4af37] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all duration-200"
            title="Perfumes similares"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">Similares</span>
          </button>

          {/* Separator */}
          <div className="w-px h-5 bg-[rgba(212,175,55,0.1)] mx-0.5 hidden sm:block" />

          {/* Instagram */}
          <a
            href="https://www.instagram.com/jolie.fragrances.vnzl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center lg:gap-1.5 w-9 h-9 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 rounded-full bg-[#111111]/60 border border-[rgba(212,175,55,0.1)] text-[#d4af37]/60 hover:text-pink-400 hover:border-pink-400/30 hover:bg-pink-400/5 transition-all duration-200"
            title="Instagram"
          >
            <Instagram className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">Instagram</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/584244055386"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center lg:gap-1.5 w-9 h-9 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 rounded-full bg-[#111111]/60 border border-[rgba(212,175,55,0.1)] text-[#d4af37]/60 hover:text-[#25D366] hover:border-[#25D366]/30 hover:bg-[#25D366]/5 transition-all duration-200"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">WhatsApp</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
