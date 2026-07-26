"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Gift,
  Tag,
  ChevronRight,
  ShoppingCart,
  Phone,
  Lock,
  Loader2,
} from "lucide-react";
import { useCart, type CartItem, type ComboSuggestion } from "@/context/CartContext";
import { useCurrency, CurrencyToggle } from "@/hooks/useCurrency";
import { toast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/perfumes";

// ─── Animation variants ───
const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// ─── Dual-currency price display (cart items + footer) ───
// In USD mode: renders just the USD price (e.g. `$38`).
// In Bs.  mode: renders the BCV equivalent (primary) on top + the Bs. amount
//               (secondary) below, right-aligned.
//
// The cart logic ALWAYS works in USD. This component is display-only.
function CartDualPrice({
  usd,
  primaryClassName = "",
  secondaryClassName = "text-[10px] text-white/55 font-[family-name:var(--font-inter)] leading-tight",
}: {
  usd: number;
  primaryClassName?: string;
  secondaryClassName?: string;
}) {
  const { mode, formatPrice } = useCurrency();
  const f = formatPrice(usd);
  if (mode === "usd" || !f.secondary) {
    return <span className={primaryClassName}>{f.primary}</span>;
  }
  return (
    <span className="flex flex-col items-end leading-tight">
      <span className={primaryClassName}>{f.primary}</span>
      <span className={secondaryClassName}>{f.secondary}</span>
    </span>
  );
}

// ─── Discount Selector (inline dropdown for each cart item) ───
function DiscountSelector({
  itemType,
  id,
}: {
  itemType: "perfume" | "combo";
  id: number | string;
}) {
  const { availableDiscounts, discountAssignments, assignDiscount } = useCart();

  // Only render if the user actually has discount codes (logged in + has codes)
  if (availableDiscounts.length === 0) return null;

  const key = `${itemType}:${id}`;
  const assignedId = discountAssignments[key] ?? "";

  // Build the list of options: "Sin descuento" + each available/unassigned discount
  const assignedIds = new Set(
    Object.values(discountAssignments).filter((v): v is string => Boolean(v))
  );
  const selectable = availableDiscounts.filter(
    (d) => !assignedIds.has(d.id) || d.id === assignedId
  );

  // Group by discountPct to show "10%" / "5%" buttons (multiple codes with same pct)
  // For each pct, find if any code with that pct is assigned to this item
  const pctOptions = [...new Set(selectable.map((d) => d.discountPct))].sort((a, b) => b - a);

  return (
    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
      <span className="text-[9px] text-white/30 font-[family-name:var(--font-inter)] tracking-wider uppercase mr-0.5">
        Descuento:
      </span>
      {/* "Sin descuento" button */}
      <button
        onClick={() => assignDiscount(itemType, id, null)}
        className={`text-[9px] px-2 py-0.5 rounded-full border font-[family-name:var(--font-inter)] font-semibold transition-all duration-200 ${
          !assignedId
            ? "bg-white/10 border-white/20 text-white/70"
            : "bg-transparent border-white/8 text-white/30 hover:text-white/50 hover:border-white/15"
        }`}
      >
        —
      </button>
      {/* Discount pct buttons */}
      {pctOptions.map((pct) => {
        // Find the code with this pct that's either assigned to this item or unassigned
        const codeForPct = selectable.find((d) => d.discountPct === pct);
        if (!codeForPct) return null;
        const isAssigned = assignedId === codeForPct.id;
        return (
          <button
            key={pct}
            onClick={() => assignDiscount(itemType, id, codeForPct.id)}
            className={`text-[9px] px-2 py-0.5 rounded-full border font-[family-name:var(--font-inter)] font-bold transition-all duration-200 active:scale-95 ${
              isAssigned
                ? "bg-gradient-to-r from-[#d4af37] to-[#b8962e] border-[#d4af37] text-black shadow-sm shadow-[#d4af37]/20"
                : "bg-[#d4af37]/8 border-[#d4af37]/20 text-[#d4af37]/60 hover:text-[#d4af37] hover:border-[#d4af37]/40 hover:bg-[#d4af37]/12"
            }`}
          >
            {pct}%
          </button>
        );
      })}
    </div>
  );
}

// ─── Cart Item Row ───
function CartItemRow({ item }: { item: CartItem }) {
  const {
    removeItem,
    updateQuantity,
    getItemDiscountPct,
    getItemDiscountedPrice,
  } = useCart();

  if (item.type === "perfume") {
    const { perfume, price, quantity } = item;
    const discountPct = getItemDiscountPct("perfume", perfume.id);
    const hasDiscount = discountPct > 0;
    const originalTotal = price * quantity;
    const discountedTotal = getItemDiscountedPrice("perfume", perfume.id);
    return (
      <motion.div
        variants={itemVariants}
        layout
        className="flex gap-3 p-3 rounded-xl bg-[#111111]/60 border border-[rgba(212,175,55,0.08)] group"
      >
        {/* Image */}
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#0a0a0a] border border-[rgba(212,175,55,0.1)] flex-shrink-0">
          <img
            src={getImageUrl(perfume.fragranticaId)}
            alt={perfume.name}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#d4af37]/60 tracking-wider uppercase font-[family-name:var(--font-inter)] truncate">
            {perfume.brand}
          </p>
          <p className="text-sm text-white/90 font-[family-name:var(--font-playfair)] truncate leading-tight">
            {perfume.name}
          </p>
          <p className="text-xs text-white/30 font-[family-name:var(--font-inter)]">
            {perfume.size} • {perfume.gender}
          </p>
          <DiscountSelector itemType="perfume" id={perfume.id} />
        </div>

        {/* Price + Controls */}
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <button
            onClick={() => removeItem("perfume", perfume.id)}
            className="text-white/20 hover:text-rose-400 transition-colors p-0.5"
            aria-label="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateQuantity("perfume", perfume.id, -1)}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-[#1a1a1a] border border-[rgba(212,175,55,0.1)] text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs text-white/80 font-[family-name:var(--font-inter)] w-5 text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity("perfume", perfume.id, 1)}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-[#1a1a1a] border border-[rgba(212,175,55,0.1)] text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          {hasDiscount ? (
            <div className="flex flex-col items-end leading-tight">
              <span className="text-[10px] text-white/30 line-through font-[family-name:var(--font-inter)]">
                ${originalTotal}
              </span>
              <CartDualPrice
                usd={discountedTotal}
                primaryClassName="text-sm font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent font-[family-name:var(--font-inter)]"
              />
            </div>
          ) : (
            <CartDualPrice
              usd={originalTotal}
              primaryClassName="text-sm font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent font-[family-name:var(--font-inter)]"
            />
          )}
        </div>
      </motion.div>
    );
  }

  // Combo item
  const { combo, price, quantity } = item;
  const discountPct = getItemDiscountPct("combo", combo.id);
  const hasDiscount = discountPct > 0;
  const originalTotal = price * quantity;
  const discountedTotal = getItemDiscountedPrice("combo", combo.id);
  return (
    <motion.div
      variants={itemVariants}
      layout
      className="p-3 rounded-xl bg-gradient-to-br from-[#111111]/80 to-[#0d0d0d]/80 border border-[rgba(212,175,55,0.15)] group relative"
    >
      {/* Combo badge */}
      <div className="absolute -top-2 -left-1">
        <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black font-bold font-[family-name:var(--font-inter)] shadow-md">
          <Gift className="w-2.5 h-2.5" />
          COMBO
        </span>
      </div>

      <div className="flex gap-3 mt-1">
        {/* Mini perfume images */}
        <div className="w-14 flex-shrink-0 flex flex-col gap-0.5">
          {combo.perfumes.slice(0, 3).map((p, idx) => (
            <div key={idx} className="w-full h-10 rounded-md overflow-hidden bg-[#0a0a0a] border border-[rgba(212,175,55,0.08)]">
              <img
                src={`https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${p.fragranticaId}.avif`}
                alt={p.name}
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/90 font-[family-name:var(--font-playfair)] truncate leading-tight">
            {combo.name}
          </p>
          <p className="text-[10px] text-white/30 font-[family-name:var(--font-inter)] mt-0.5">
            {combo.perfumes.map((p) => p.name).join(" + ")}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-white/30 line-through font-[family-name:var(--font-inter)]">
              ${combo.originalTotalPrice}
            </span>
            <span className="text-[10px] text-emerald-400/80 font-semibold font-[family-name:var(--font-inter)]">
              Ahorras ${combo.savings}
            </span>
          </div>
          {/* Combos do NOT get discount selectors — they have their own built-in discount */}
        </div>

        {/* Price + Controls */}
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <button
            onClick={() => removeItem("combo", combo.id)}
            className="text-white/20 hover:text-rose-400 transition-colors p-0.5"
            aria-label="Eliminar combo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateQuantity("combo", combo.id, -1)}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-[#1a1a1a] border border-[rgba(212,175,55,0.1)] text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs text-white/80 font-[family-name:var(--font-inter)] w-5 text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity("combo", combo.id, 1)}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-[#1a1a1a] border border-[rgba(212,175,55,0.1)] text-white/50 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          {hasDiscount ? (
            <div className="flex flex-col items-end leading-tight">
              <span className="text-[10px] text-white/30 line-through font-[family-name:var(--font-inter)]">
                ${originalTotal}
              </span>
              <CartDualPrice
                usd={discountedTotal}
                primaryClassName="text-sm font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent font-[family-name:var(--font-inter)]"
              />
            </div>
          ) : (
            <CartDualPrice
              usd={originalTotal}
              primaryClassName="text-sm font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent font-[family-name:var(--font-inter)]"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Combo Suggestion Card ───
function SuggestionCard({ suggestion }: { suggestion: ComboSuggestion }) {
  const { addCombo } = useCart();
  const { combo, matchingPerfumeNames, savingsIfBoughtCombo } = suggestion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] relative overflow-hidden"
    >
      {/* Shimmer accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

      <div className="flex items-start gap-2 mb-2">
        <Tag className="w-3.5 h-3.5 text-emerald-400/70 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-emerald-400/70 font-semibold tracking-wider uppercase font-[family-name:var(--font-inter)]">
            Sugerencia de combo
          </p>
          <p className="text-sm text-white/90 font-[family-name:var(--font-playfair)] truncate">
            {combo.name}
          </p>
        </div>
      </div>

      <p className="text-[10px] text-white/40 font-[family-name:var(--font-inter)] mb-2">
        Incluye: {matchingPerfumeNames.join(", ")} y más
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 line-through font-[family-name:var(--font-inter)]">
            ${combo.originalTotalPrice}
          </span>
          <CartDualPrice
            usd={combo.comboPrice}
            primaryClassName="text-sm font-bold text-emerald-400 font-[family-name:var(--font-inter)]"
            secondaryClassName="text-[9px] text-emerald-400/60 font-[family-name:var(--font-inter)] leading-tight"
          />
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400/90 font-[family-name:var(--font-inter)] font-semibold">
            -${savingsIfBoughtCombo}
          </span>
        </div>
        <button
          onClick={() => addCombo(combo)}
          className="flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 transition-all font-[family-name:var(--font-inter)] font-semibold active:scale-95"
        >
          <Plus className="w-3 h-3" />
          Agregar
        </button>
      </div>
    </motion.div>
  );
}

// ─── Empty State ───
function EmptyCart() {
  const { closeCart } = useCart();

  const handleExploreCatalog = () => {
    closeCart();
    // Scroll to the catalog section after the drawer closes
    setTimeout(() => {
      const catalogHeading = Array.from(document.querySelectorAll("h2")).find(
        (h) => h.textContent?.includes("Nuestro Catálogo")
      );
      if (catalogHeading) {
        catalogHeading.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Fallback: scroll to the perfume grid
        window.scrollTo({ top: 600, behavior: "smooth" });
      }
    }, 300);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-[#111111] border border-[rgba(212,175,55,0.1)] flex items-center justify-center mb-5">
        <ShoppingCart className="w-8 h-8 text-[#d4af37]/25" />
      </div>
      <h3 className="text-lg font-[family-name:var(--font-playfair)] text-white/70 mb-2">
        Tu carrito está vacío
      </h3>
      <p className="text-xs text-white/30 font-[family-name:var(--font-inter)] max-w-[220px] leading-relaxed mb-6">
        Explora nuestro catálogo y añade los perfumes y combos que más te gusten
      </p>
      <button
        onClick={handleExploreCatalog}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] border border-[rgba(212,175,55,0.15)] text-[#d4af37]/80 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all text-sm font-[family-name:var(--font-inter)] active:scale-95"
      >
        Explorar Catálogo
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Cart Drawer ───
export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    itemCount,
    subtotal,
    totalSavings,
    suggestions,
    whatsappCheckoutUrl,
    whatsappQuoteUrl,
    clearCart,
    discountSavings,
    discountedSubtotal,
    availableDiscounts,
    userProfile,
    refreshUserProfile,
  } = useCart();
  const { status: sessionStatus } = useSession();

  // ─── Inline phone-capture state ───
  // phoneCaptureMode:
  //   "none"    → show the normal checkout buttons
  //   "checkout" → show the inline phone form; on submit proceed to checkout URL
  //   "quote"    → show the inline phone form; on submit proceed to quote URL
  const [phoneCaptureMode, setPhoneCaptureMode] = useState<
    "none" | "checkout" | "quote"
  >("none");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);

  const perfumeItems = useMemo(
    () => items.filter((i): i is CartItem & { type: "perfume" } => i.type === "perfume"),
    [items]
  );
  const comboItems = useMemo(
    () => items.filter((i): i is CartItem & { type: "combo" } => i.type === "combo"),
    [items]
  );

  // ─── Reset the inline capture form whenever the drawer closes ───
  // (so a stale "phone required" panel doesn't reappear on next open).
  useEffect(() => {
    if (!isOpen) {
      setPhoneCaptureMode("none");
      setPhoneInput("");
      setPhoneSaving(false);
    }
  }, [isOpen]);

  // ─── Decide whether to require a phone ───
  // - Logged in + no phone → require (block checkout, show inline form)
  // - Logged in + has phone → proceed directly
  // - Not logged in → proceed directly (anonymous)
  const isAuthenticated = sessionStatus === "authenticated";
  const needsPhone = isAuthenticated && userProfile !== null && !userProfile.hasPhone;

  // ─── Click handler for both checkout buttons ───
  const handleCheckoutClick = (mode: "checkout" | "quote") => {
    if (needsPhone) {
      setPhoneCaptureMode(mode);
      setPhoneInput("");
      return;
    }
    const url = mode === "checkout" ? whatsappCheckoutUrl : whatsappQuoteUrl;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ─── Submit the inline phone form: save to /api/profile, refresh the
  // CartContext's userProfile (which rebuilds the WhatsApp URL with the new
  // phone + name), then open WhatsApp. ───
  const handlePhoneSubmit = async () => {
    const digits = phoneInput.replace(/\D+/g, "");
    if (digits.length < 7) {
      toast({
        title: "Teléfono inválido",
        description: "Ingresa un número de teléfono válido.",
        variant: "destructive",
      });
      return;
    }
    setPhoneSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar");
      }
      // Refresh the profile so the WhatsApp URL useMemo recalculates
      await refreshUserProfile();
      // Wait a tick for React to re-render with the updated userProfile
      await new Promise((r) => setTimeout(r, 100));
      // Now the whatsappCheckoutUrl/whatsappQuoteUrl should have the phone
      const url =
        phoneCaptureMode === "checkout" ? whatsappCheckoutUrl : whatsappQuoteUrl;
      setPhoneCaptureMode("none");
      setPhoneInput("");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast({
        title: "No se pudo guardar",
        description: e instanceof Error ? e.message : "Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setPhoneSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeCart}
            className="fixed inset-0 bg-black/85 z-[60]"
          />

          {/* Drawer */}
          <motion.aside
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] z-[70] flex flex-col bg-[#0a0a0a] border-l border-[rgba(212,175,55,0.12)] shadow-2xl shadow-black/80"
          >
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(212,175,55,0.08)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-[family-name:var(--font-playfair)] text-white/95">
                    Mi Carrito
                  </h2>
                  <p className="text-[10px] text-white/30 font-[family-name:var(--font-inter)]">
                    {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <CurrencyToggle variant="compact" />
                )}
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[10px] px-2.5 py-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all font-[family-name:var(--font-inter)]"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#111111] border border-[rgba(212,175,55,0.1)] text-white/40 hover:text-white hover:border-[#d4af37]/30 transition-all"
                  aria-label="Cerrar carrito"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ─── Body (scrollable) ─── */}
            {items.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
                {/* Perfume items */}
                {perfumeItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 px-1">
                      <Sparkles className="w-3 h-3 text-[#d4af37]/40" />
                      <span className="text-[9px] text-white/25 tracking-[0.2em] uppercase font-[family-name:var(--font-inter)] font-semibold">
                        Perfumes
                      </span>
                    </div>
                    {perfumeItems.map((item) => (
                      <CartItemRow key={`perfume-${item.perfume.id}`} item={item} />
                    ))}
                  </div>
                )}

                {/* Combo items */}
                {comboItems.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-1.5 px-1">
                      <Gift className="w-3 h-3 text-[#d4af37]/40" />
                      <span className="text-[9px] text-white/25 tracking-[0.2em] uppercase font-[family-name:var(--font-inter)] font-semibold">
                        Combos
                      </span>
                    </div>
                    {comboItems.map((item) => (
                      <CartItemRow key={`combo-${item.combo.id}`} item={item} />
                    ))}
                  </div>
                )}

                {/* ─── Combo Suggestions ─── */}
                {suggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-1.5 px-1">
                      <Tag className="w-3 h-3 text-emerald-400/50" />
                      <span className="text-[9px] text-emerald-400/50 tracking-[0.2em] uppercase font-[family-name:var(--font-inter)] font-semibold">
                        Sugerencias
                      </span>
                    </div>
                    {suggestions.map((s) => (
                      <SuggestionCard key={s.combo.id} suggestion={s} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Footer (totals + checkout) ─── */}
            {items.length > 0 && (
              <div className="border-t border-[rgba(212,175,55,0.08)] bg-[#080808]">
                {/* Summary */}
                <div className="px-5 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40 font-[family-name:var(--font-inter)]">
                      Subtotal
                    </span>
                    <CartDualPrice
                      usd={subtotal}
                      primaryClassName="text-sm text-white/70 font-[family-name:var(--font-inter)]"
                    />
                  </div>
                  {discountSavings > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-400/80 font-[family-name:var(--font-inter)] font-medium flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Descuentos aplicados
                      </span>
                      <CartDualPrice
                        usd={-discountSavings}
                        primaryClassName="text-sm text-emerald-400 font-bold font-[family-name:var(--font-inter)]"
                        secondaryClassName="text-[10px] text-emerald-400/60 font-[family-name:var(--font-inter)] leading-tight"
                      />
                    </div>
                  )}
                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-400/70 font-[family-name:var(--font-inter)] font-medium">
                        💚 Ahorro por combos
                      </span>
                      <CartDualPrice
                        usd={-totalSavings}
                        primaryClassName="text-sm text-emerald-400 font-bold font-[family-name:var(--font-inter)]"
                        secondaryClassName="text-[10px] text-emerald-400/60 font-[family-name:var(--font-inter)] leading-tight"
                      />
                    </div>
                  )}
                  <div className="h-px bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.15)] to-transparent" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80 font-[family-name:var(--font-inter)] font-semibold">
                      Total
                    </span>
                    <CartDualPrice
                      usd={discountedSubtotal}
                      primaryClassName="text-xl font-bold bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] bg-clip-text text-transparent font-[family-name:var(--font-inter)]"
                      secondaryClassName="text-[11px] text-white/55 font-[family-name:var(--font-inter)] leading-tight"
                    />
                  </div>
                  {availableDiscounts.length > 0 && discountSavings === 0 && (
                    <p className="text-[10px] text-white/30 font-[family-name:var(--font-inter)] pt-1 leading-relaxed">
                      Tienes {availableDiscounts.length} descuento
                      {availableDiscounts.length > 1 ? "s" : ""} disponible
                      {availableDiscounts.length > 1 ? "s" : ""} — se asigna
                      {availableDiscounts.length > 1 ? "n" : ""} automática
                      {availableDiscounts.length > 1 ? "s" : ""}mente al agregar productos.
                    </p>
                  )}
                </div>

                {/* Checkout area: inline phone-capture form OR the two buttons */}
                <div className="px-5 pb-5 space-y-2.5">
                  <AnimatePresence mode="wait">
                    {phoneCaptureMode !== "none" ? (
                      // ─── Inline phone capture form ───
                      // Appears in place of the checkout buttons when a logged-in
                      // user without a phone tries to checkout. Replaces them
                      // temporarily until the user submits (→ WhatsApp) or cancels.
                      <motion.div
                        key="phone-capture"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-xl border-2 border-[#d4af37]/35 bg-[#0a0a0a] p-4 space-y-3 shadow-lg shadow-[#d4af37]/5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md bg-[#d4af37]/12 border border-[#d4af37]/25 text-[#d4af37]">
                              <Phone className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-white font-[family-name:var(--font-inter)] leading-tight">
                                Necesitamos tu número para confirmar tu pedido 📱
                              </p>
                              <p className="text-[10px] text-white/45 font-[family-name:var(--font-inter)] mt-0.5 leading-relaxed">
                                Joel te escribirá a este WhatsApp para coordinar la entrega.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPhoneCaptureMode("none")}
                            disabled={phoneSaving}
                            aria-label="Cancelar"
                            className="w-6 h-6 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Phone input */}
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#d4af37]/60 font-[family-name:var(--font-inter)] pointer-events-none">
                            +58
                          </span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            autoFocus
                            autoComplete="tel-national"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !phoneSaving) {
                                e.preventDefault();
                                handlePhoneSubmit();
                              }
                            }}
                            placeholder="424 555 1234"
                            className="w-full pl-12 pr-3.5 py-3 rounded-lg bg-[#111111] border border-[#d4af37]/30 focus:border-[#d4af37] text-white text-base font-[family-name:var(--font-inter)] font-medium outline-none transition-colors"
                          />
                        </div>

                        {/* Trust microcopy */}
                        <div className="flex items-center gap-1.5 text-[10px] text-white/35 font-[family-name:var(--font-inter)]">
                          <Lock className="w-3 h-3 text-[#d4af37]/60" />
                          <span>
                            Sin spam — solo te escribiremos sobre tu pedido.
                          </span>
                        </div>

                        {/* Continue button */}
                        <button
                          type="button"
                          onClick={handlePhoneSubmit}
                          disabled={phoneSaving || phoneInput.replace(/\D+/g, "").length < 7}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f0d060] text-black font-bold text-sm font-[family-name:var(--font-inter)] hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {phoneSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Guardando…
                            </>
                          ) : (
                            <>
                              Continuar
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </motion.div>
                    ) : (
                      // ─── Normal checkout buttons ───
                      <motion.div
                        key="checkout-buttons"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-2.5"
                      >
                        {/* WhatsApp checkout (purchase intent) */}
                        <button
                          type="button"
                          onClick={() => handleCheckoutClick("checkout")}
                          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm font-[family-name:var(--font-inter)] hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/15 active:scale-[0.98]"
                        >
                          <MessageCircle className="w-4.5 h-4.5" />
                          Finalizar Compra por WhatsApp
                        </button>

                        {/* Quote button (availability inquiry) */}
                        <button
                          type="button"
                          onClick={() => handleCheckoutClick("quote")}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#111111]/50 text-[#d4af37]/80 hover:text-[#d4af37] hover:border-[#d4af37]/35 transition-all text-xs font-[family-name:var(--font-inter)] active:scale-[0.98]"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Consultar Disponibilidad
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
