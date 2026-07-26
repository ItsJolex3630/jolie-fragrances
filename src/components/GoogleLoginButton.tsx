"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { LogOut, ChevronDown, User } from "lucide-react";

/**
 * GoogleLoginButton
 *
 * Shows a "Iniciar sesión" button when the user is NOT logged in, or the
 * user's avatar + a dropdown menu (with logout) when they ARE logged in.
 *
 * The NextAuth session is shared across all routes (/ and /predicciones)
 * because AuthProvider wraps the whole app in layout.tsx. So if the user
 * logs in on /predicciones, they're already logged in here on the catalog
 * (and vice versa).
 */
export default function GoogleLoginButton() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleSignIn = async () => {
    setLoading(true);
    // Sign in with Google. The signIn callback in auth.ts auto-registers
    // the user in the DB (server-side), so they appear in the admin panel
    // and can sync cart/predictions/discounts across devices.
    await signIn("google", { callbackUrl: "/" });
    setLoading(false);
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    // Clear the profile-skip flag so the ProfileModal reappears next login.
    try {
      window.localStorage.removeItem("jolie-profile-skipped");
    } catch {
      /* ignore */
    }
    await signOut({ callbackUrl: "/" });
  };

  // Simplified auth check: only treat as authenticated when we have a confirmed
  // session with a user object. While status is "loading" OR "unauthenticated",
  // show the login button (clickable). This avoids the NextAuth v4 + React 19
  // issue where useSession can stay "loading" indefinitely in some environments.
  const isAuthenticated = status === "authenticated" && !!session?.user;

  // Not authenticated (or still loading) — show login button
  if (!isAuthenticated) {
    return (
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white hover:bg-white/90 border border-white/20 text-black hover:text-black transition-all duration-200 disabled:opacity-60"
        title="Iniciar sesión con Google"
      >
        {/* Google "G" logo (inline SVG so we don't need an asset) */}
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="hidden lg:inline text-[11px] font-medium font-[family-name:var(--font-inter)]">
          {loading ? "Conectando..." : "Iniciar sesión"}
        </span>
      </button>
    );
  }

  // Authenticated — show avatar + dropdown
  const user = session.user;
  const initial = (user.name || user.email || "?").charAt(0).toUpperCase();
  const shortEmail =
    user.email && user.email.length > 18
      ? user.email.substring(0, 15) + "..."
      : user.email;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center gap-1.5 px-1.5 py-1 rounded-full bg-white/[0.06] border border-[#d4af37]/25 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/8 transition-all duration-200"
        title="Mi cuenta"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "avatar"}
            className="w-6 h-6 rounded-full border border-[#d4af37]/30"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8962e] flex items-center justify-center text-[11px] font-bold text-black">
            {initial}
          </div>
        )}
        <ChevronDown
          className={`w-3 h-3 text-white/50 transition-transform ${
            menuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#0a0a0a] border border-[#d4af37]/25 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "avatar"}
                  className="w-9 h-9 rounded-full border border-[#d4af37]/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8962e] flex items-center justify-center text-sm font-bold text-black">
                  {initial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">
                  {user.name || "Usuario"}
                </p>
                <p className="text-[10px] text-white/50 truncate">{shortEmail}</p>
              </div>
            </div>
          </div>
          <div className="p-1.5">
            <a
              href="/predicciones"
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Mis Predicciones
            </a>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
