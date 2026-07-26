"use client";

import { ShieldBan, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

/**
 * BannedNotice
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-screen "cuenta suspendida" notice shown when the current session user
 * has been banned by an admin. Replaces the normal page content.
 *
 * The notice:
 *   - Explains that the account is suspended
 *   - Shows the optional ban reason (if the admin provided one)
 *   - Offers a "Cerrar sesión" button (calls NextAuth signOut) so the user
 *     can clear their stale session cookie
 *   - Stays minimal and on-brand (dark + gold)
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function BannedNotice({ reason }: { reason: string | null }) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <ShieldBan className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-[family-name:var(--font-playfair)] text-[#d4af37] mb-2">
          Cuenta Suspendida
        </h1>
        <p className="text-sm text-white/60 font-[family-name:var(--font-inter)] mb-4">
          Tu cuenta ha sido suspendida por un administrador. Ya no puedes iniciar
          sesión ni acceder a las predicciones ni a los descuentos.
        </p>
        {reason && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/[0.05] border border-red-500/20 text-left">
            <p className="text-[10px] text-red-300/60 uppercase tracking-wide mb-1 font-[family-name:var(--font-inter)]">
              Motivo
            </p>
            <p className="text-xs text-red-200 font-[family-name:var(--font-inter)]">
              {reason}
            </p>
          </div>
        )}
        <p className="text-xs text-white/40 font-[family-name:var(--font-inter)] mb-5">
          Si crees que esto es un error, contáctanos por WhatsApp o Instagram.
        </p>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-[#d4af37]/25 text-[#d4af37] hover:bg-[#d4af37]/10 hover:border-[#d4af37]/40 text-sm font-[family-name:var(--font-inter)] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
