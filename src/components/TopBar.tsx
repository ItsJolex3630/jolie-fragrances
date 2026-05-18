"use client";

import { useState, useEffect, useRef } from "react";
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
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    function handleScroll() {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const isDesktop = window.innerWidth >= 1024;

          if (isDesktop) {
            // Always visible on desktop
            setIsVisible(true);
          } else {
            // Smart scroll behavior on mobile
            if (currentScrollY < 10) {
              // At top of page, always show
              setIsVisible(true);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
              // Scrolling DOWN past 80px: hide
              setIsVisible(false);
            } else {
              // Scrolling UP: show
              setIsVisible(true);
            }
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Also handle resize to update visibility state
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      className={`top-bar fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[rgba(212,175,55,0.1)] ${
        isVisible ? "top-bar-visible" : "top-bar-hidden"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 flex items-center justify-between h-[52px] lg:h-[56px]">
        {/* Left side: Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm lg:text-base font-semibold shimmer-text font-[family-name:var(--font-playfair)] tracking-[0.15em]">
            JOLIE
          </span>
          <div className="w-1 h-1 rounded-full bg-[#d4af37]/40" />
          <span className="hidden sm:inline text-[9px] text-white/25 tracking-[0.15em] uppercase font-[family-name:var(--font-inter)]">
            Fragrances
          </span>
        </div>

        {/* Right side: Action buttons */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Buscar */}
          <button
            onClick={onSearch}
            className="flex items-center justify-center gap-1.5 w-9 h-9 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 rounded-full bg-[#111111] border border-[rgba(212,175,55,0.12)] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 text-white/60 hover:text-[#d4af37] transition-all duration-200 font-[family-name:var(--font-inter)]"
            title="Buscar perfume"
          >
            <Search className="w-4 h-4 text-[#d4af37]/60 flex-shrink-0" />
            <span className="hidden lg:inline text-[11px]">Buscar</span>
          </button>

          {/* Comparar */}
          <button
            onClick={onCompare}
            className="flex items-center justify-center gap-1.5 w-9 h-9 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 rounded-full bg-[#111111] border border-[rgba(212,175,55,0.12)] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 text-white/60 hover:text-[#d4af37] transition-all duration-200 font-[family-name:var(--font-inter)]"
            title="Comparar perfumes"
          >
            <ArrowLeftRight className="w-4 h-4 text-[#d4af37]/60 flex-shrink-0" />
            <span className="hidden lg:inline text-[11px]">Comparar</span>
          </button>

          {/* Similares */}
          <button
            onClick={onSimilar}
            className="flex items-center justify-center gap-1.5 w-9 h-9 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 rounded-full bg-[#111111] border border-[rgba(212,175,55,0.12)] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 text-white/60 hover:text-[#d4af37] transition-all duration-200 font-[family-name:var(--font-inter)]"
            title="Perfumes similares"
          >
            <Sparkles className="w-4 h-4 text-[#d4af37]/60 flex-shrink-0" />
            <span className="hidden lg:inline text-[11px]">Similares</span>
          </button>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/jolie.fragrances.vnzl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-9 h-9 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 rounded-full bg-[#111111] border border-[rgba(212,175,55,0.12)] hover:border-pink-400/30 hover:bg-pink-400/5 text-white/60 hover:text-pink-400 transition-all duration-200 font-[family-name:var(--font-inter)]"
            title="Instagram"
          >
            <Instagram className="w-4 h-4 text-[#d4af37]/60 group-hover:text-pink-400 flex-shrink-0" />
            <span className="hidden lg:inline text-[11px]">Instagram</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/584244055386"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-9 h-9 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 rounded-full bg-[#111111] border border-[rgba(212,175,55,0.12)] hover:border-[#25D366]/30 hover:bg-[#25D366]/5 text-white/60 hover:text-[#25D366] transition-all duration-200 font-[family-name:var(--font-inter)]"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-[#d4af37]/60 group-hover:text-[#25D366] flex-shrink-0" />
            <span className="hidden lg:inline text-[11px]">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
