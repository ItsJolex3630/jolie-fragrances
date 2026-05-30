"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { combos, type Combo } from "@/lib/combosData";
import type { Perfume } from "@/lib/perfumes";

// ─── Cart item types ───
export interface CartPerfumeItem {
  type: "perfume";
  perfume: Perfume;
  price: number;
  quantity: number;
}

export interface CartComboItem {
  type: "combo";
  combo: Combo;
  price: number;
  quantity: number;
}

export type CartItem = CartPerfumeItem | CartComboItem;

// ─── Combo suggestion ───
export interface ComboSuggestion {
  combo: Combo;
  matchingPerfumeNames: string[];
  savingsIfBoughtCombo: number;
  totalSeparate: number;
  comboPrice: number;
}

// ─── Cart context shape ───
interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addPerfume: (perfume: Perfume, price: number) => void;
  addCombo: (combo: Combo) => void;
  removeItem: (itemType: "perfume" | "combo", id: number | string) => void;
  updateQuantity: (itemType: "perfume" | "combo", id: number | string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  totalSavings: number;
  suggestions: ComboSuggestion[];
  whatsappUrl: string;
}

const CartContext = createContext<CartContextType | null>(null);

// ─── Persistence helpers ───
const CART_STORAGE_KEY = "jolie-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

// ─── Find combo suggestions based on cart perfume names ───
function computeSuggestions(items: CartItem[]): ComboSuggestion[] {
  const perfumeItems = items.filter((i): i is CartPerfumeItem => i.type === "perfume");
  if (perfumeItems.length === 0) return [];

  const cartPerfumeNames = new Set(
    perfumeItems.map((i) => i.perfume.name.toLowerCase().trim())
  );

  // Already in cart combos — skip suggesting them again
  const cartComboIds = new Set(
    items.filter((i): i is CartComboItem => i.type === "combo").map((i) => i.combo.id)
  );

  const suggestions: ComboSuggestion[] = [];

  for (const combo of combos) {
    if (cartComboIds.has(combo.id)) continue;

    const matching = combo.perfumes.filter((p) =>
      cartPerfumeNames.has(p.name.toLowerCase().trim())
    );

    // Only suggest if at least 1 perfume matches and buying the combo saves money
    if (matching.length >= 1) {
      suggestions.push({
        combo,
        matchingPerfumeNames: matching.map((p) => p.name),
        savingsIfBoughtCombo: combo.savings,
        totalSeparate: combo.originalTotalPrice,
        comboPrice: combo.comboPrice,
      });
    }
  }

  // Sort: combos with more matches first, then by savings desc
  suggestions.sort((a, b) => {
    if (b.matchingPerfumeNames.length !== a.matchingPerfumeNames.length) {
      return b.matchingPerfumeNames.length - a.matchingPerfumeNames.length;
    }
    return b.savingsIfBoughtCombo - a.savingsIfBoughtCombo;
  });

  // Limit to top 3 suggestions
  return suggestions.slice(0, 3);
}

// ─── Build WhatsApp checkout URL ───
function buildWhatsAppUrl(items: CartItem[], subtotal: number, totalSavings: number): string {
  const phone = "584244055386";
  const lines: string[] = [];

  lines.push("🛒 *Pedido Jolie Fragrances*");
  lines.push("");

  const perfumeItems = items.filter((i): i is CartPerfumeItem => i.type === "perfume");
  const comboItems = items.filter((i): i is CartComboItem => i.type === "combo");

  if (perfumeItems.length > 0) {
    lines.push("━━━━━ 🧴 Perfumes ━━━━━━━");
    perfumeItems.forEach((item, idx) => {
      const qty = item.quantity > 1 ? ` (x${item.quantity})` : "";
      lines.push(`${idx + 1}. *${item.perfume.name}* — ${item.perfume.brand}${qty}`);
      lines.push(`   ${item.perfume.size} | $${item.price * item.quantity}`);
    });
    lines.push("");
  }

  if (comboItems.length > 0) {
    lines.push("━━━━━ 🎁 Combos ━━━━━━━━");
    comboItems.forEach((item, idx) => {
      const qty = item.quantity > 1 ? ` (x${item.quantity})` : "";
      lines.push(`${idx + 1}. *${item.combo.name}*${qty}`);
      item.combo.perfumes.forEach((p) => {
        lines.push(`   • ${p.name} (${p.volume})`);
      });
      lines.push(`   ~~$${item.combo.originalTotalPrice}~~ → *$${item.price * item.quantity}*`);
      lines.push(`   💚 Ahorras: $${item.combo.savings * item.quantity}`);
    });
    lines.push("");
  }

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push(`💰 *Total: $${subtotal}*`);
  if (totalSavings > 0) {
    lines.push(`💚 *Ahorro total: $${totalSavings}*`);
  }
  lines.push("");
  lines.push("¡Gracias por tu compra! ✨");

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${phone}?text=${text}`;
}

// ─── Provider ───
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addPerfume = useCallback((perfume: Perfume, price: number) => {
    setItems((prev) => {
      const existing = prev.find(
        (i): i is CartPerfumeItem => i.type === "perfume" && i.perfume.id === perfume.id
      );
      if (existing) {
        return prev.map((i) =>
          i.type === "perfume" && i.perfume.id === perfume.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { type: "perfume", perfume, price, quantity: 1 }];
    });
  }, []);

  const addCombo = useCallback((combo: Combo) => {
    setItems((prev) => {
      const existing = prev.find(
        (i): i is CartComboItem => i.type === "combo" && i.combo.id === combo.id
      );
      if (existing) {
        return prev.map((i) =>
          i.type === "combo" && i.combo.id === combo.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { type: "combo", combo, price: combo.comboPrice, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemType: "perfume" | "combo", id: number | string) => {
    setItems((prev) =>
      prev.filter((i) => {
        if (i.type === "perfume" && itemType === "perfume") return i.perfume.id !== id;
        if (i.type === "combo" && itemType === "combo") return i.combo.id !== id;
        return true;
      })
    );
  }, []);

  const updateQuantity = useCallback(
    (itemType: "perfume" | "combo", id: number | string, delta: number) => {
      setItems((prev) =>
        prev
          .map((i) => {
            if (i.type === "perfume" && itemType === "perfume" && i.perfume.id === id) {
              return { ...i, quantity: i.quantity + delta };
            }
            if (i.type === "combo" && itemType === "combo" && i.combo.id === id) {
              return { ...i, quantity: i.quantity + delta };
            }
            return i;
          })
          .filter((i) => i.quantity > 0)
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [items]
  );

  const totalSavings = useMemo(
    () =>
      items
        .filter((i): i is CartComboItem => i.type === "combo")
        .reduce((acc, i) => acc + i.combo.savings * i.quantity, 0),
    [items]
  );

  const suggestions = useMemo(() => computeSuggestions(items), [items]);

  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(items, subtotal, totalSavings),
    [items, subtotal, totalSavings]
  );

  const value = useMemo<CartContextType>(
    () => ({
      items,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addPerfume,
      addCombo,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      totalSavings,
      suggestions,
      whatsappUrl,
    }),
    [
      items, isOpen, openCart, closeCart, toggleCart, addPerfume, addCombo,
      removeItem, updateQuantity, clearCart, itemCount, subtotal, totalSavings,
      suggestions, whatsappUrl,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ───
export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
