"use client";

/**
 * ProfileModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Friendly, NON-BLOCKING modal that appears after Google login if the user
 * doesn't yet have a phone number on file. Asks for phone (required) +
 * Instagram (optional) with brand-aligned trust elements so the user feels
 * safe sharing their contact info.
 *
 * Behavior
 *  - On mount: fetches /api/profile.
 *  - If `hasPhone === true` (or user not authenticated) → render nothing.
 *  - If `hasPhone === false` and the localStorage flag
 *    `jolie-profile-skipped` is NOT set → show the modal.
 *  - Save: PUT /api/profile with phone (+ optional instagram), show a toast,
 *    close the modal.
 *  - Skip: close the modal + set `jolie-profile-skipped=1` so it doesn't
 *    reappear until the next login. The flag is cleared on logout by the
 *    GoogleLoginButton (signOut handler).
 *
 * Design
 *  - Dark background (#0a0a0a) with gold accents (#d4af37 / #f0d060).
 *  - Playfair Display for the title, Inter for body text.
 *  - Trust badges (lock, phone, no-spam) below the subtitle.
 *  - Phone input highlighted (gold ring), with +58 hint.
 *  - Instagram input (optional, @ hint).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Phone, Zap, Check, Loader2, Instagram } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SKIP_KEY = "jolie-profile-skipped";

interface ProfileResponse {
  authenticated?: boolean;
  hasPhone?: boolean;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
}

export default function ProfileModal() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");

  // ─── Fetch the user's profile on mount / when auth state changes ───
  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      setOpen(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data: ProfileResponse = await res.json();
        if (cancelled) return;

        setName(data.name ?? "");
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
        setInstagram(data.instagram ?? "");

        if (data.hasPhone) {
          setOpen(false);
        } else {
          // Respect the "skip" flag until next login.
          const skipped =
            typeof window !== "undefined" &&
            window.localStorage.getItem(SKIP_KEY) === "1";
          setOpen(!skipped);
        }
      } catch {
        // Non-fatal — just don't show the modal.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status]);

  // ─── Save handler ───
  const handleSave = async () => {
    const digits = phone.replace(/\D+/g, "");
    if (digits.length < 7) {
      toast({
        title: "Teléfono inválido",
        description: "Ingresa un número de teléfono válido.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: digits,
          instagram: instagram.trim() ? instagram.trim() : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar");
      }
      // Clear the skip flag (they did save).
      try {
        window.localStorage.removeItem(SKIP_KEY);
      } catch {
        /* ignore */
      }
      setOpen(false);
      toast({
        title: "¡Perfil guardado! ✨",
        description: "Gracias — Joel te contactará por WhatsApp para tu pedido.",
      });
    } catch (e) {
      toast({
        title: "No se pudo guardar",
        description: e instanceof Error ? e.message : "Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── Skip handler ───
  const handleSkip = () => {
    try {
      window.localStorage.setItem(SKIP_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  // Don't render anything while loading or unauthenticated.
  if (loading || status !== "authenticated") {
    return null;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-modal-title"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative w-full max-w-md rounded-2xl border border-[#d4af37]/25 bg-gradient-to-b from-[#111111] to-[#0a0a0a] shadow-2xl shadow-black/60 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ─── Top accent bar ─── */}
            <div className="h-1 bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37]" />

            {/* ─── Close button ─── */}
            <button
              onClick={handleSkip}
              aria-label="Cerrar"
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ─── Body ─── */}
            <div className="p-6 sm:p-7">
              {/* Title */}
              <h2
                id="profile-modal-title"
                className="text-2xl sm:text-[1.7rem] font-bold font-[family-name:var(--font-playfair)] text-white leading-tight"
              >
                ¡Bienvenido a{" "}
                <span className="bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] bg-clip-text text-transparent">
                  Jolie Fragrances
                </span>
                ! 👋
              </h2>

              <p className="mt-2 text-sm text-white/55 font-[family-name:var(--font-inter)] leading-relaxed">
                Para coordinar tu pedido por WhatsApp necesitamos tu número.
                Es rápido y solo te escribiremos cuando sea importante.
              </p>

              {/* ─── Trust badges ─── */}
              <div className="mt-4 space-y-2">
                <TrustBadge
                  icon={<Lock className="w-3.5 h-3.5" />}
                  text="Tus datos están seguros con nosotros"
                />
                <TrustBadge
                  icon={<Phone className="w-3.5 h-3.5" />}
                  text="Solo te contactaremos sobre tu pedido o descuentos ganados"
                />
                <TrustBadge
                  icon={<Zap className="w-3.5 h-3.5" />}
                  text="Sin spam — solo mensajes importantes"
                />
              </div>

              {/* ─── Form ─── */}
              <div className="mt-5 space-y-3">
                {/* Email (read-only) */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-white/40 font-[family-name:var(--font-inter)] font-semibold mb-1.5">
                    Cuenta Google
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    tabIndex={-1}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/8 text-white/55 text-sm font-[family-name:var(--font-inter)] cursor-not-allowed"
                  />
                </div>

                {/* Phone (highlighted) */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-[#d4af37]/80 font-[family-name:var(--font-inter)] font-semibold mb-1.5">
                    Teléfono (WhatsApp) · requerido
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#d4af37]/60 font-[family-name:var(--font-inter)] pointer-events-none">
                      +58
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="424 555 1234"
                      className="w-full pl-12 pr-3.5 py-3 rounded-xl bg-[#0a0a0a] border-2 border-[#d4af37]/40 focus:border-[#d4af37] text-white text-base font-[family-name:var(--font-inter)] font-medium outline-none transition-colors shadow-lg shadow-[#d4af37]/5"
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-white/35 font-[family-name:var(--font-inter)] leading-relaxed">
                    Ej: 424 555 1234 · Joel te escribirá a este número.
                  </p>
                </div>

                {/* Instagram (optional) */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.18em] text-white/40 font-[family-name:var(--font-inter)] font-semibold mb-1.5">
                    Instagram · opcional
                  </label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@tu_usuario"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0a0a0a] border border-white/10 focus:border-[#d4af37]/40 text-white text-sm font-[family-name:var(--font-inter)] outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* ─── Actions ─── */}
              <div className="mt-6 space-y-2.5">
                <button
                  onClick={handleSave}
                  disabled={saving || phone.replace(/\D+/g, "").length < 7}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f0d060] text-black font-bold text-sm font-[family-name:var(--font-inter)] hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Guardar
                    </>
                  )}
                </button>

                <button
                  onClick={handleSkip}
                  disabled={saving}
                  className="w-full py-2 text-[11px] text-white/35 hover:text-white/55 font-[family-name:var(--font-inter)] transition-colors"
                >
                  Saltar por ahora
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Trust badge (icon + text) ───────────────────────────────────────────────
function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 flex items-center justify-center rounded-md bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37]">
        {icon}
      </div>
      <span className="text-[11px] text-white/60 font-[family-name:var(--font-inter)] leading-tight">
        {text}
      </span>
    </div>
  );
}
