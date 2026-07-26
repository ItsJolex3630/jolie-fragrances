"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, QrCode as QrCodeIcon, Clock, CheckCircle2 } from "lucide-react";
import QRCode from "qrcode";
import { useDiscounts, type DiscountCode } from "@/hooks/useDiscounts";

/**
 * DiscountReminder
 *
 * Shows a small badge in the TopBar when the logged-in user has active
 * discount codes (5% or 10% won on /predicciones). Clicking the badge opens
 * a modal listing all active discounts with their QR codes so the user can
 * show them in-store.
 *
 * If the user is NOT logged in, no badge is shown (the TopBar's Google login
 * button handles that case separately).
 */
export default function DiscountReminder() {
  const { authenticated, discounts, activeCount, bestDiscountPct, loading } =
    useDiscounts();
  const [open, setOpen] = useState(false);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  // Generate QR codes for each discount when the modal opens
  useEffect(() => {
    if (!open || discounts.length === 0) return;

    let cancelled = false;
    async function generateAll() {
      const map: Record<string, string> = {};
      for (const dc of discounts) {
        try {
          const url = await QRCode.toDataURL(dc.code, {
            width: 200,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
          });
          if (!cancelled) map[dc.id] = url;
        } catch (e) {
          console.error("[DiscountReminder] QR gen failed:", e);
        }
      }
      if (!cancelled) setQrCodes(map);
    }
    generateAll();
    return () => {
      cancelled = true;
    };
  }, [open, discounts]);

  // Don't show anything while loading or if no active discounts
  if (loading || !authenticated || activeCount === 0) return null;

  return (
    <>
      {/* Badge button */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center justify-center gap-1 px-2 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-[#d4af37]/20 border border-[#d4af37]/40 hover:border-[#d4af37]/70 hover:from-emerald-500/30 hover:to-[#d4af37]/30 transition-all duration-200 group"
        title={`Tienes ${activeCount} descuento(s) activo(s) — ${bestDiscountPct}% máx`}
      >
        <Gift className="w-3.5 h-3.5 text-[#d4af37] group-hover:scale-110 transition-transform" />
        <span className="hidden lg:inline text-[11px] font-bold font-[family-name:var(--font-inter)] text-[#d4af37]">
          {bestDiscountPct}% OFF
        </span>
        {/* Pulsing dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-md max-h-[90vh] my-auto overflow-y-auto bg-[#0a0a0a] border border-[#d4af37]/30 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#d4af37]/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37]/30 to-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/30">
                    <Gift className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-[family-name:var(--font-playfair)]">
                      Tus Descuentos
                    </h3>
                    <p className="text-[11px] text-white/50">
                      {activeCount} activo{activeCount !== 1 ? "s" : ""} · Ganados en Predicciones
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="p-3 rounded-xl bg-[#d4af37]/8 border border-[#d4af37]/20 text-[12px] text-white/70 leading-relaxed">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" />
                    <span>
                      Muestra el QR en tienda al momento de pagar para aplicar tu descuento. ¡Úsalos en tu próxima compra de perfumes!
                    </span>
                  </p>
                </div>

                {discounts.map((dc) => (
                  <DiscountCard
                    key={dc.id}
                    dc={dc}
                    qrCode={qrCodes[dc.id]}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DiscountCard({ dc, qrCode }: { dc: DiscountCode; qrCode?: string }) {
  const expiresAt = new Date(dc.expiresAt);
  const daysLeft = Math.ceil(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = daysLeft <= 7;

  return (
    <div className="p-4 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent font-[family-name:var(--font-playfair)]">
            {dc.discountPct}%
          </span>
          <span className="text-[11px] text-white/60 uppercase tracking-wider font-medium">
            Descuento
          </span>
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full ${
            isExpiringSoon
              ? "bg-red-500/15 text-red-300 border border-red-500/25"
              : "bg-white/5 text-white/50 border border-white/10"
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>
            {daysLeft > 0
              ? `Expira en ${daysLeft}d`
              : daysLeft === 0
              ? "Expira hoy"
              : "Expirado"}
          </span>
        </div>
      </div>

      {qrCode ? (
        <div className="flex justify-center mb-2">
          <div className="p-2 bg-white rounded-lg">
            <img
              src={qrCode}
              alt="QR del descuento"
              className="w-36 h-36"
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center mb-2">
          <div className="w-36 h-36 rounded-lg bg-white/5 flex items-center justify-center">
            <QrCodeIcon className="w-8 h-8 text-white/30 animate-pulse" />
          </div>
        </div>
      )}

      <p className="text-[10px] text-white/40 text-center">
        Muestra este QR en tienda para validar
      </p>
      <p className="text-[9px] text-white/25 text-center mt-1 font-mono break-all">
        {dc.code.substring(0, 40)}...
      </p>
    </div>
  );
}
