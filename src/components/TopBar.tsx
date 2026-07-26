"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ArrowLeftRight,
  Sparkles,
  Instagram,
  MessageCircle,
  Gift,
  ShoppingCart,
  Shield,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { getFathersDayInfo, type FathersDayInfo } from "@/lib/fathersDay";
import { useCart } from "@/context/CartContext";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import DiscountReminder from "@/components/DiscountReminder";
import { ADMIN_EMAIL } from "@/lib/adminAuth";

interface TopBarProps {
  onSearch: () => void;
  onCompare: () => void;
  onSimilar: () => void;
}

export default function TopBar({ onSearch, onCompare, onSimilar }: TopBarProps) {
  const { data: session } = useSession();
  const { itemCount, openCart } = useCart();
  const [isAtTop, setIsAtTop] = useState(true);
  const [fathersDayInfo, setFathersDayInfo] = useState<FathersDayInfo | null>(null);
  const ticking = useRef(false);

  // Admin link is only shown when the logged-in user is the hard-coded admin.
  // We compare case-insensitively against the same constant the API uses.
  const isAdmin =
    !!session?.user?.email &&
    session.user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Check Father's Day status
  useEffect(() => {
    setFathersDayInfo(getFathersDayInfo());
  }, []);

  const isFathersDay = fathersDayInfo?.status === "exact_day";
  const isFathersMonth = fathersDayInfo?.status === "fathers_month";

  // Track scroll position only for background blur effect
  useEffect(() => {
    function handleScroll() {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const atTop = currentScrollY < 10;
        setIsAtTop(atTop);
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
      className={`top-bar fixed top-0 left-0 right-0 z-40 top-bar-always-visible ${
        isAtTop ? "bg-transparent" : "bg-[#0a0a0a]/95 border-b border-[rgba(212,175,55,0.08)]"
      }`}
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
        <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-1.5">
          {/* Father's Day indicator (only during June, hidden on mobile) */}
          {isFathersDay && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/25 fathers-day-border-glow">
              <Gift className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden lg:inline text-[9px] text-[#d4af37]/80 font-[family-name:var(--font-inter)] tracking-wider uppercase">
                Día del Padre
              </span>
            </div>
          )}
          {isFathersMonth && !isFathersDay && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-[#d4af37]/8 border border-[#d4af37]/12">
              <Gift className="w-3 h-3 text-[#d4af37]/50" />
              <span className="hidden lg:inline text-[9px] text-[#d4af37]/50 font-[family-name:var(--font-inter)] tracking-wider uppercase">
                Día del Padre
              </span>
            </div>
          )}

          {/* Search */}
          <button
            onClick={handleSearch}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-auto lg:h-auto lg:gap-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#d4af37]/50 hover:text-[#d4af37] hover:border-[#d4af37]/25 hover:bg-[#d4af37]/5 transition-all duration-200"
            title="Buscar perfume"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">Buscar</span>
          </button>

          {/* Compare */}
          <button
            onClick={handleCompare}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-auto lg:h-auto lg:gap-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#d4af37]/50 hover:text-[#d4af37] hover:border-[#d4af37]/25 hover:bg-[#d4af37]/5 transition-all duration-200"
            title="Comparar perfumes"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">Comparar</span>
          </button>


          {/* Similar */}
          <button
            onClick={handleSimilar}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-auto lg:h-auto lg:gap-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#d4af37]/50 hover:text-[#d4af37] hover:border-[#d4af37]/25 hover:bg-[#d4af37]/5 transition-all duration-200"
            title="Perfumes similares"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">Similares</span>
          </button>

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-auto lg:h-auto lg:gap-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#d4af37]/50 hover:text-[#d4af37] hover:border-[#d4af37]/25 hover:bg-[#d4af37]/5 transition-all duration-200"
            title="Mi Carrito"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">Carrito</span>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 lg:static lg:ml-0 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-[8px] sm:text-[9px] text-black font-bold font-[family-name:var(--font-inter)] px-1">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          {/* Separator */}
          <div className="w-px h-4 bg-[rgba(212,175,55,0.1)] mx-0.5 hidden sm:block" />

          {/* Instagram (hidden on mobile for cleaner TopBar) */}
          <a
            href="https://www.instagram.com/jolie.fragrances.ve/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-auto lg:h-auto lg:gap-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#d4af37]/50 hover:text-pink-400 hover:border-pink-400/25 hover:bg-pink-400/5 transition-all duration-200"
            title="Instagram"
          >
            <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">Instagram</span>
          </a>

          {/* WhatsApp (hidden on mobile for cleaner TopBar) */}
          <a
            href="https://wa.me/584244055386"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-auto lg:h-auto lg:gap-1.5 lg:px-3 lg:py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#d4af37]/50 hover:text-[#25D366] hover:border-[#25D366]/25 hover:bg-[#25D366]/5 transition-all duration-200"
            title="WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">WhatsApp</span>
          </a>

          {/* Separator before account */}
          <div className="w-px h-4 bg-[rgba(212,175,55,0.1)] mx-0.5 hidden sm:block" />

          {/* Hidden /admin link — only visible to the hard-coded admin email */}
          {isAdmin && (
            <a
              href="/admin"
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-auto lg:h-auto lg:gap-1.5 lg:px-3 lg:py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] hover:border-[#d4af37]/50 hover:bg-[#d4af37]/25 transition-all duration-200"
              title="Panel de administración"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden lg:inline text-[11px] font-[family-name:var(--font-inter)]">
                Admin
              </span>
            </a>
          )}

          {/* Discount Reminder (only shows when logged in + has active discounts) */}
          <DiscountReminder />

          {/* Google Login / Account menu */}
          <GoogleLoginButton />
        </div>
      </div>
    </nav>
  );
}
