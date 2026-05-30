"use client";

import { useMemo } from "react";
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
} from "lucide-react";
import { useCart, type CartItem, type ComboSuggestion } from "@/context/CartContext";
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

// ─── Cart Item Row ───
function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity } = useCart();

  if (item.type === "perfume") {
    const { perfume, price, quantity } = item;
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
          <p className="text-sm font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent font-[family-name:var(--font-inter)]">
            ${price * quantity}
          </p>
        </div>
      </motion.div>
    );
  }

  // Combo item
  const { combo, price, quantity } = item;
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
          <p className="text-sm font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent font-[family-name:var(--font-inter)]">
            ${price * quantity}
          </p>
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
          <span className="text-sm font-bold text-emerald-400 font-[family-name:var(--font-inter)]">
            ${combo.comboPrice}
          </span>
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
        onClick={closeCart}
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
  const { items, isOpen, closeCart, itemCount, subtotal, totalSavings, suggestions, whatsappUrl, clearCart } = useCart();

  const perfumeItems = useMemo(
    () => items.filter((i): i is CartItem & { type: "perfume" } => i.type === "perfume"),
    [items]
  );
  const comboItems = useMemo(
    () => items.filter((i): i is CartItem & { type: "combo" } => i.type === "combo"),
    [items]
  );

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
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
                    <span className="text-sm text-white/70 font-[family-name:var(--font-inter)]">
                      ${subtotal}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-400/70 font-[family-name:var(--font-inter)] font-medium">
                        💚 Ahorro por combos
                      </span>
                      <span className="text-sm text-emerald-400 font-bold font-[family-name:var(--font-inter)]">
                        -${totalSavings}
                      </span>
                    </div>
                  )}
                  <div className="h-px bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.15)] to-transparent" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80 font-[family-name:var(--font-inter)] font-semibold">
                      Total
                    </span>
                    <span className="text-xl font-bold bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37] bg-clip-text text-transparent font-[family-name:var(--font-inter)]">
                      ${subtotal}
                    </span>
                  </div>
                </div>

                {/* Checkout buttons */}
                <div className="px-5 pb-5 space-y-2.5">
                  {/* WhatsApp checkout */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm font-[family-name:var(--font-inter)] hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/15 active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                    Finalizar Compra por WhatsApp
                  </a>

                  {/* Quote button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#111111]/50 text-[#d4af37]/80 hover:text-[#d4af37] hover:border-[#d4af37]/35 transition-all text-xs font-[family-name:var(--font-inter)] active:scale-[0.98]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Cotizar por WhatsApp
                    <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
