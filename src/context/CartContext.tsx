"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { combos, type Combo } from "@/lib/combosData";
import { perfumes as ALL_PERFUMES, type Perfume } from "@/lib/perfumes";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { applyDiscount } from "@/lib/priceMapping";

// ─── Discount code shape (subset from /api/discounts/me) ───
export interface AvailableDiscount {
  id: string;
  discountPct: number; // 5 or 10
  code: string;
}

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
  whatsappCheckoutUrl: string;
  whatsappQuoteUrl: string;
  // ─── Discount cascade ───
  availableDiscounts: AvailableDiscount[];
  discountAssignments: Record<string, string | null>; // cartItemKey -> discountId | null
  highestAvailableDiscountPct: number; // max pct among unassigned discounts (0 if none)
  discountSavings: number; // total $ saved by applied discounts
  discountedSubtotal: number; // subtotal - discountSavings
  getItemDiscountPct: (itemType: "perfume" | "combo", id: number | string) => number;
  getItemDiscountedPrice: (itemType: "perfume" | "combo", id: number | string) => number; // returns rounded discounted price * quantity
  assignDiscount: (itemType: "perfume" | "combo", id: number | string, discountId: string | null) => void;
  // ─── Customer profile (phone + name) for WhatsApp message enrichment ───
  userProfile: UserProfile | null;
  refreshUserProfile: () => Promise<void>;
}

// ─── Customer profile shape (subset of /api/profile GET response) ───
export interface UserProfile {
  hasPhone: boolean;
  phone: string | null;
  name: string | null;
  email: string | null;
  instagram: string | null;
}

const CartContext = createContext<CartContextType | null>(null);

// ─── Persistence helpers ───
const CART_STORAGE_KEY = "jolie-cart";
// Discount-assignment persistence (separate key so it can be cleared
// independently from the cart items).
const DISCOUNTS_STORAGE_KEY = "jolie-cart-discounts";
// Flag in localStorage indicating the user has synced their cart to the
// server at least once. Used to distinguish:
//  - First-ever sync (local has items, server empty → push local to server)
//  - Subsequent syncs (server is source of truth → replace local with server)
// This flag is set per-browser, so a NEW browser that has never synced will
// push its local cart up on first login, while a browser that HAS synced
// will defer to the server (so deletions on other devices propagate).
const CART_SYNCED_KEY = "jolie-cart-synced";

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

function loadDiscountAssignments(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DISCOUNTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      // Coerce to Record<string, string | null>; drop any non-string values.
      const out: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof v === "string") out[k] = v;
        else if (v === null) out[k] = null;
      }
      return out;
    }
    return {};
  } catch {
    return {};
  }
}

function saveDiscountAssignments(assignments: Record<string, string | null>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISCOUNTS_STORAGE_KEY, JSON.stringify(assignments));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

// ─── Cart item key helper ───
function cartItemKey(itemType: "perfume" | "combo", id: number | string): string {
  return `${itemType}:${id}`;
}

// ─── Find combo suggestions based on cart perfume fragranticaIds ───
function computeSuggestions(items: CartItem[]): ComboSuggestion[] {
  const perfumeItems = items.filter((i): i is CartPerfumeItem => i.type === "perfume");
  if (perfumeItems.length === 0) return [];

  // Use fragranticaId for matching (more reliable than name comparison)
  const cartFragranticaIds = new Set(
    perfumeItems.map((i) => i.perfume.fragranticaId)
  );

  // Also keep a name-based fallback for any edge cases
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
      cartFragranticaIds.has(p.fragranticaId) ||
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

// ─── Build shared order lines (with discount cascade) ───
interface OrderLinesContext {
  items: CartItem[];
  discountAssignments: Record<string, string | null>;
  availableDiscounts: AvailableDiscount[];
  email?: string | null; // user's email for the WhatsApp message footer
  phone?: string | null; // user's phone (WhatsApp) for the message footer
  name?: string | null; // user's display name for the message footer
  currencyMode?: "usd" | "bs"; // currency mode for WhatsApp message
  usdtRate?: number; // Bs per USDT (for Bs. mode)
  bcvRate?: number;  // Bs per USD (for Bs. mode)
}

interface OrderLinesResult {
  lines: string[];
  subtotal: number; // sum of full prices (no discount applied)
  discountSavings: number; // sum of $ saved via discounts
  comboSavings: number; // sum of $ saved via combos
  discountedSubtotal: number; // subtotal - discountSavings
}

/** Find the discount assigned to a cart item, or null if none. */
function findAssignedDiscount(
  item: CartItem,
  ctx: OrderLinesContext
): AvailableDiscount | null {
  const key =
    item.type === "perfume"
      ? cartItemKey("perfume", item.perfume.id)
      : cartItemKey("combo", item.combo.id);
  const discountId = ctx.discountAssignments[key];
  if (!discountId) return null;
  return ctx.availableDiscounts.find((d) => d.id === discountId) ?? null;
}

/** Format a USD price for the WhatsApp message based on currency mode. */
function fmtMsgPrice(usdPrice: number, ctx: OrderLinesContext): string {
  if (ctx.currencyMode === "bs" && ctx.usdtRate && ctx.bcvRate) {
    const bsAmount = usdPrice * ctx.usdtRate;
    const bcvEq = Math.round((usdPrice * ctx.usdtRate) / ctx.bcvRate);
    // Format Bs with Venezuelan number format (dot thousands, comma decimals)
    const bsFormatted = new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(bsAmount);
    return `$${bcvEq} / Bs. ${bsFormatted}`;
  }
  return `$${usdPrice}`;
}

function buildOrderLines(ctx: OrderLinesContext): OrderLinesResult {
  const lines: string[] = [];
  const perfumeItems = ctx.items.filter((i): i is CartPerfumeItem => i.type === "perfume");
  const comboItems = ctx.items.filter((i): i is CartComboItem => i.type === "combo");

  let subtotal = 0;
  let discountSavings = 0;
  let comboSavings = 0;

  if (perfumeItems.length > 0) {
    lines.push("━━━━━ 🧴 Perfumes ━━━━━━━");
    perfumeItems.forEach((item, idx) => {
      const qty = item.quantity > 1 ? ` (x${item.quantity})` : "";
      lines.push(`${idx + 1}. *${item.perfume.name}* — ${item.perfume.brand}${qty}`);

      const lineSubtotal = item.price * item.quantity;
      subtotal += lineSubtotal;

      const discount = findAssignedDiscount(item, ctx);
      if (discount && discount.discountPct > 0) {
        const discountedUnit = applyDiscount(item.price, discount.discountPct);
        const discountedTotal = discountedUnit + item.price * (item.quantity - 1);
        const saved = lineSubtotal - discountedTotal;
        discountSavings += saved;
        if (item.quantity > 1) {
          lines.push(
            `   ${item.perfume.size} | 1x ${fmtMsgPrice(discountedUnit, ctx)} (-${discount.discountPct}%) + ${item.quantity - 1}x ${fmtMsgPrice(item.price, ctx)} = *${fmtMsgPrice(discountedTotal, ctx)}*`
          );
        } else {
          lines.push(
            `   ${item.perfume.size} | ~~${fmtMsgPrice(lineSubtotal, ctx)}~~ → *${fmtMsgPrice(discountedTotal, ctx)}* (-${discount.discountPct}%)`
          );
        }
      } else {
        lines.push(`   ${item.perfume.size} | ${fmtMsgPrice(lineSubtotal, ctx)}`);
      }
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

      const lineSubtotal = item.price * item.quantity;
      subtotal += lineSubtotal;
      comboSavings += item.combo.savings * item.quantity;

      const discount = findAssignedDiscount(item, ctx);
      if (discount && discount.discountPct > 0) {
        const discountedUnit = applyDiscount(item.price, discount.discountPct);
        const discountedTotal = discountedUnit + item.price * (item.quantity - 1);
        const saved = lineSubtotal - discountedTotal;
        discountSavings += saved;
        if (item.quantity > 1) {
          lines.push(
            `   ~~${fmtMsgPrice(item.combo.originalTotalPrice * item.quantity, ctx)}~~ → 1x ${fmtMsgPrice(discountedUnit, ctx)} (-${discount.discountPct}%) + ${item.quantity - 1}x ${fmtMsgPrice(item.price, ctx)} = *${fmtMsgPrice(discountedTotal, ctx)}*`
          );
        } else {
          lines.push(
            `   ~~${fmtMsgPrice(item.combo.originalTotalPrice * item.quantity, ctx)}~~ → *${fmtMsgPrice(discountedTotal, ctx)}* (-${discount.discountPct}%)`
          );
        }
      } else {
        lines.push(
          `   ~~${fmtMsgPrice(item.combo.originalTotalPrice * item.quantity, ctx)}~~ → *${fmtMsgPrice(lineSubtotal, ctx)}*`
        );
        lines.push(`   💚 Ahorras: ${fmtMsgPrice(item.combo.savings * item.quantity, ctx)}`);
      }
    });
    lines.push("");
  }

  const discountedSubtotal = subtotal - discountSavings;

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push(`💰 *Total: ${fmtMsgPrice(discountedSubtotal, ctx)}*`);
  if (comboSavings > 0) {
    lines.push(`💚 *Ahorro por combos: ${fmtMsgPrice(comboSavings, ctx)}*`);
  }

  return { lines, subtotal, discountSavings, comboSavings, discountedSubtotal };
}

// ─── Build WhatsApp checkout URL (purchase intent) ───
function buildWhatsAppCheckoutUrl(ctx: OrderLinesContext): string {
  const phone = "584244055386";
  const lines: string[] = [];

  lines.push("¡Hola Jolie Fragrances! 👋");
  lines.push("Me gustaría hacer el siguiente pedido:");
  lines.push("");

  const { lines: orderLines } = buildOrderLines(ctx);
  lines.push(...orderLines);

  // Customer profile block: email + phone + name so Joel can contact them.
  // Always shown in this order (email → phone → name) when any field is set.
  const profileLines: string[] = [];
  if (ctx.email) profileLines.push(`📧 Cuenta: ${ctx.email}`);
  if (ctx.phone) profileLines.push(`📱 Teléfono: ${ctx.phone}`);
  if (ctx.name) profileLines.push(`👤 Nombre: ${ctx.name}`);
  if (profileLines.length > 0) {
    lines.push("");
    lines.push(...profileLines);
  }

  lines.push("");
  lines.push("¡Gracias! ✨");

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${phone}?text=${text}`;
}

// ─── Build WhatsApp quote URL (inquiry / availability check) ───
function buildWhatsAppQuoteUrl(ctx: OrderLinesContext): string {
  const phone = "584244055386";
  const lines: string[] = [];

  lines.push("¡Hola Jolie Fragrances! 👋");
  lines.push("Estoy interesad@ en los siguientes perfumes y me gustaría saber la disponibilidad y confirmar los precios antes de comprar:");
  lines.push("");

  const { lines: orderLines } = buildOrderLines(ctx);
  lines.push(...orderLines);

  // Customer profile block.
  const profileLines: string[] = [];
  if (ctx.email) profileLines.push(`📧 Cuenta: ${ctx.email}`);
  if (ctx.phone) profileLines.push(`📱 Teléfono: ${ctx.phone}`);
  if (ctx.name) profileLines.push(`👤 Nombre: ${ctx.name}`);
  if (profileLines.length > 0) {
    lines.push("");
    lines.push(...profileLines);
  }

  lines.push("");
  lines.push("Quedo atent@ a su respuesta, ¡gracias! 🙏");

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${phone}?text=${text}`;
}

// ─── Server cart sync helpers (cross-device) ─────────────────────────────────
// When the user is logged in with Google, the cart is synced to the server
// so it appears on all their devices. The server stores only reference keys
// (perfumeId / comboId) + price + quantity; we re-hydrate the full Perfume /
// Combo objects from the local catalog data on load.

interface ServerCartItem {
  id: string;
  itemType: "perfume" | "combo";
  itemId: string;
  price: number;
  quantity: number;
  discountCodeId?: string | null;
  updatedAt: string;
}

/**
 * Re-hydrate server cart items (reference keys) into full CartItem objects
 * using the local perfume & combo catalogs. Items whose referenced perfume
 * or combo no longer exists in the catalog are skipped (defensive).
 */
function hydrateServerCart(serverItems: ServerCartItem[]): CartItem[] {
  const result: CartItem[] = [];
  for (const si of serverItems) {
    if (si.itemType === "perfume") {
      const perfumeId = Number(si.itemId);
      const perfume = ALL_PERFUMES.find((p) => p.id === perfumeId);
      if (perfume) {
        result.push({
          type: "perfume",
          perfume,
          price: si.price,
          quantity: si.quantity,
        });
      }
    } else if (si.itemType === "combo") {
      const combo = combos.find((c) => c.id === si.itemId);
      if (combo) {
        result.push({
          type: "combo",
          combo,
          price: si.price,
          quantity: si.quantity,
        });
      }
    }
  }
  return result;
}

/**
 * Extract discount assignments from server cart items.
 * Returns a Record<cartItemKey, discountCodeId> for items that have a
 * discountCodeId set. Used to rebuild discountAssignments after a server sync.
 */
function extractDiscountAssignments(serverItems: ServerCartItem[]): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  for (const si of serverItems) {
    const key = cartItemKey(si.itemType, si.itemId);
    if (si.discountCodeId) {
      result[key] = si.discountCodeId;
    }
  }
  return result;
}

/**
 * Serialize the current cart to the server format (reference keys only).
 */
function serializeCartForServer(
  items: CartItem[]
): Array<{
  itemType: "perfume" | "combo";
  itemId: string;
  price: number;
  quantity: number;
}> {
  return items.map((item) => ({
    itemType: item.type,
    itemId: String(item.type === "perfume" ? item.perfume.id : item.combo.id),
    price: item.price,
    quantity: item.quantity,
  }));
}

// ─── Provider ───
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const { mode: currencyMode, usdtRate, bcvRate } = useCurrency();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // Track whether we've already done the initial server cart fetch for this
  // session, so we don't overwrite the cart with server state after the user
  // has already started interacting with it.
  const serverSyncDoneRef = useRef(false);
  // Track if a server sync is currently in flight (to avoid races)
  const syncInFlightRef = useRef(false);

  // ─── Discount cascade state ───
  // availableDiscounts: from /api/discounts/me (active 5%/10% codes)
  // discountAssignments: cartItemKey -> discountId (which code is applied to which item)
  const [availableDiscounts, setAvailableDiscounts] = useState<AvailableDiscount[]>([]);
  const [discountAssignments, setDiscountAssignments] = useState<Record<string, string | null>>({});

  // ─── Customer profile (phone + name) for WhatsApp enrichment ───
  // Fetched on auth, refreshed after the inline phone-capture saves.
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Hydrate from localStorage on mount (fast path — same device)
  useEffect(() => {
    setItems(loadCart());
    setDiscountAssignments(loadDiscountAssignments());
    setHydrated(true);
  }, []);

  // ─── Reset sync state when user logs out (so next login re-syncs) ───
  // Also clear discount assignments + available discounts (they're user-scoped).
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      serverSyncDoneRef.current = false;
      syncInFlightRef.current = false;
      setAvailableDiscounts([]);
      setDiscountAssignments({});
      setUserProfile(null);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(DISCOUNTS_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    }
  }, [sessionStatus]);

  // ─── refreshUserProfile: re-fetches /api/profile ───
  // Called on auth change AND after the inline phone-capture saves (so the
  // WhatsApp message reflects the freshly-saved phone).
  const refreshUserProfile = useCallback(async () => {
    if (sessionStatus !== "authenticated") {
      setUserProfile(null);
      return;
    }
    try {
      const res = await fetch("/api/profile", { cache: "no-store" });
      if (!res.ok) {
        setUserProfile(null);
        return;
      }
      const data = await res.json();
      if (!data.authenticated) {
        setUserProfile(null);
        return;
      }
      setUserProfile({
        hasPhone: !!data.hasPhone,
        phone: data.phone ?? null,
        name: data.name ?? null,
        email: data.email ?? null,
        instagram: data.instagram ?? null,
      });
    } catch {
      // Non-fatal — keep the previous profile (or null).
    }
  }, [sessionStatus]);

  // ─── Fetch / refresh the customer profile when auth state changes ───
  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile, sessionStatus, session?.user?.email]);

  // ─── Fetch available discounts when authenticated ───
  // Re-fetches on every session change (login/logout/email change).
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user?.email) {
      setAvailableDiscounts([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discounts/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data.authenticated && Array.isArray(data.discounts)) {
          const mapped: AvailableDiscount[] = data.discounts
            .map((d: { id?: string; code?: string; discountPct?: number }) => ({
              id: String(d.id ?? ""),
              code: String(d.code ?? ""),
              discountPct: Number(d.discountPct ?? 0),
            }))
            .filter((d: AvailableDiscount) => d.id && d.code);
          setAvailableDiscounts(mapped);
        } else {
          setAvailableDiscounts([]);
        }
      } catch (err) {
        console.warn("[Cart] discount fetch failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionStatus, session?.user?.email]);

  // ─── Persist discount assignments to localStorage ───
  useEffect(() => {
    if (hydrated) {
      saveDiscountAssignments(discountAssignments);
    }
  }, [discountAssignments, hydrated]);

  // ─── Cleanup stale discount assignments when available discounts change ───
  // Removes assignments that reference discount IDs no longer in the user's
  // active set (e.g., a code was verified/expired server-side).
  useEffect(() => {
    if (!hydrated) return;
    if (availableDiscounts.length === 0) return; // don't clear during transient empty states
    const validIds = new Set(availableDiscounts.map((d) => d.id));
    setDiscountAssignments((prev) => {
      let changed = false;
      const next: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (v === null || v === undefined) {
          changed = true; // drop null entries (shouldn't normally exist)
          continue;
        }
        if (validIds.has(v)) {
          next[k] = v;
        } else {
          changed = true; // discount no longer available → drop
        }
      }
      return changed ? next : prev;
    });
  }, [availableDiscounts, hydrated]);

  // ─── Cross-device sync: when Google session resolves, fetch server cart ───
  // SERVER IS SOURCE OF TRUTH (after first sync).
  //
  // On the FIRST ever sync for this browser (CART_SYNCED_KEY not set):
  //   - If local has items but server is empty → push local to server
  //     (preserves items added before first login)
  //   - Otherwise → replace local with server
  //
  // On ALL subsequent syncs (CART_SYNCED_KEY is set):
  //   - Replace local with server (so deletions on other devices propagate)
  //   - If the user then makes changes locally, those are pushed to the server
  //     via the debounced push effect below.
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user?.email) return;
    if (serverSyncDoneRef.current) return;
    if (!hydrated) return; // wait for localStorage to load first

    let cancelled = false;
    syncInFlightRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        if (data.authenticated && Array.isArray(data.items)) {
          const serverItems = hydrateServerCart(data.items as ServerCartItem[]);
          const localItems = loadCart();
          const hasSyncedBefore =
            typeof window !== "undefined" &&
            localStorage.getItem(CART_SYNCED_KEY) === "true";

          // Determine the final cart:
          let finalCart: CartItem[];

          if (
            !hasSyncedBefore &&
            serverItems.length === 0 &&
            localItems.length > 0
          ) {
            // FIRST-EVER SYNC: local has items, server is empty → push local
            // to server (don't lose items the user added before logging in)
            console.log("[Cart] First sync — pushing local cart to server");
            finalCart = localItems;
          } else {
            // SERVER IS SOURCE OF TRUTH → replace local with server.
            // This ensures deletions (empty cart, removed items) on other
            // devices propagate to this device.
            console.log(
              `[Cart] Sync — server wins (server: ${serverItems.length} items, local: ${localItems.length} items)`
            );
            finalCart = serverItems;
          }

          setItems(finalCart);
          saveCart(finalCart);

          // ─── Sync discount assignments from server ───
          // On subsequent syncs (not first-ever), the server is the source of
          // truth for discount assignments too — extract them from the cart
          // items' discountCodeId fields. This ensures that when a user assigns
          // a discount on device A, device B picks it up.
          if (hasSyncedBefore && finalCart === serverItems) {
            const serverAssignments = extractDiscountAssignments(data.items as ServerCartItem[]);
            setDiscountAssignments(serverAssignments);
            saveDiscountAssignments(serverAssignments);
          } else {
            // First sync or local-wins: just clean up stale assignments
            setDiscountAssignments((prev) => {
              const validKeys = new Set(
                finalCart.map((i) =>
                  i.type === "perfume"
                    ? cartItemKey("perfume", i.perfume.id)
                    : cartItemKey("combo", i.combo.id)
                )
              );
              let changed = false;
              const next: Record<string, string | null> = {};
              for (const [k, v] of Object.entries(prev)) {
                if (validKeys.has(k)) {
                  next[k] = v;
                } else {
                  changed = true;
                }
              }
              return changed ? next : prev;
            });
          }

          // Mark as synced so future syncs defer to the server
          if (typeof window !== "undefined") {
            localStorage.setItem(CART_SYNCED_KEY, "true");
          }

          // Push the final cart back to the server (no-op if they match)
          // After the PUT, re-apply discount assignments via PATCH so they survive
          const finalAssignments = (hasSyncedBefore && finalCart === serverItems)
            ? extractDiscountAssignments(data.items as ServerCartItem[])
            : discountAssignments;
          setTimeout(() => {
            if (cancelled) return;
            fetch("/api/cart", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: serializeCartForServer(finalCart) }),
            })
              .then(() => {
                // Re-apply discount assignments via PATCH after PUT
                for (const [key, discountId] of Object.entries(finalAssignments)) {
                  if (!discountId) continue;
                  const [itemType, itemId] = key.split(":");
                  fetch("/api/cart", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ itemType, itemId, discountCodeId: discountId }),
                  }).catch(() => {});
                }
              })
              .catch((err) => console.warn("[Cart] sync-back failed:", err));
          }, 500);
        }
      } catch (err) {
        console.warn("[Cart] server fetch failed:", err);
      } finally {
        if (!cancelled) {
          serverSyncDoneRef.current = true;
          syncInFlightRef.current = false;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionStatus, session?.user?.email, hydrated]);

  // Persist to localStorage on change (always, even when not logged in)
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  // ─── Push cart changes to server (debounced) when logged in ───
  // The PUT syncs items + price + quantity. After the PUT completes, we also
  // re-apply all discount assignments via PATCH requests — this ensures the
  // discountCodeId values survive even if the PUT's replaceAll overwrites them.
  const serverPushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (sessionStatus !== "authenticated" || !session?.user?.email) return;
    if (!serverSyncDoneRef.current) return; // don't push until initial fetch is done
    if (syncInFlightRef.current) return;

    // Debounce: wait 800ms after the last change before pushing
    if (serverPushTimerRef.current) clearTimeout(serverPushTimerRef.current);
    serverPushTimerRef.current = setTimeout(() => {
      // 1. PUT the cart (items + price + quantity)
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: serializeCartForServer(items) }),
      })
        .then(() => {
          // 2. After PUT completes, re-apply ALL discount assignments via PATCH.
          // This guarantees discountCodeId survives even if replaceAll wiped it.
          for (const [key, discountId] of Object.entries(discountAssignments)) {
            if (!discountId) continue;
            const [itemType, itemId] = key.split(":");
            fetch("/api/cart", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ itemType, itemId, discountCodeId: discountId }),
            }).catch((err) => console.warn("[Cart] re-apply PATCH failed:", err));
          }
        })
        .catch((err) => console.warn("[Cart] server push failed:", err));
    }, 800);

    return () => {
      if (serverPushTimerRef.current) clearTimeout(serverPushTimerRef.current);
    };
  }, [items, discountAssignments, sessionStatus, session?.user?.email, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addPerfume = useCallback((perfume: Perfume, price: number) => {
    let wasNew = false;
    let newQuantity = 1;
    setItems((prev) => {
      const existing = prev.find(
        (i): i is CartPerfumeItem => i.type === "perfume" && i.perfume.id === perfume.id
      );
      if (existing) {
        newQuantity = existing.quantity + 1;
        return prev.map((i) =>
          i.type === "perfume" && i.perfume.id === perfume.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      wasNew = true;
      return [...prev, { type: "perfume", perfume, price, quantity: 1 }];
    });

    // ─── Auto-assign highest available discount to the new perfume ───
    // (Only fires when this is a NEW cart item — existing items already have
    //  their assignment, and bumping the quantity shouldn't change anything.)
    if (wasNew) {
      setDiscountAssignments((prev) => {
        const key = cartItemKey("perfume", perfume.id);
        if (prev[key]) return prev; // already assigned (defensive)
        const assignedIds = new Set(
          Object.values(prev).filter((v): v is string => Boolean(v))
        );
        const available = availableDiscounts
          .filter((d) => !assignedIds.has(d.id))
          .sort((a, b) => b.discountPct - a.discountPct);
        if (available.length === 0) return prev;
        return { ...prev, [key]: available[0].id };
      });
    }

    // Show toast notification
    setTimeout(() => {
      if (wasNew) {
        toast({
          title: `🛒 ${perfume.name}`,
          description: `Agregado al carrito — $${price}`,
        });
      } else {
        toast({
          title: `🛒 ${perfume.name}`,
          description: `Cantidad actualizada (${newQuantity}) — $${price * newQuantity}`,
        });
      }
    }, 50);
  }, [availableDiscounts]);

  const addCombo = useCallback((combo: Combo) => {
    let wasNew = false;
    let newQuantity = 1;
    setItems((prev) => {
      const existing = prev.find(
        (i): i is CartComboItem => i.type === "combo" && i.combo.id === combo.id
      );
      if (existing) {
        newQuantity = existing.quantity + 1;
        return prev.map((i) =>
          i.type === "combo" && i.combo.id === combo.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      wasNew = true;
      return [...prev, { type: "combo", combo, price: combo.comboPrice, quantity: 1 }];
    });

    // NOTE: Combos do NOT get discount codes assigned. Combos already have
    // their own built-in discount (combo price < buying perfumes separately).
    // Discount codes (5%/10%) only apply to individual perfumes.

    // Show toast notification
    setTimeout(() => {
      if (wasNew) {
        toast({
          title: `🎁 ${combo.name}`,
          description: `Combo agregado al carrito — $${combo.comboPrice} (ahorras $${combo.savings})`,
        });
      } else {
        toast({
          title: `🎁 ${combo.name}`,
          description: `Cantidad actualizada (${newQuantity}) — $${combo.comboPrice * newQuantity}`,
        });
      }
    }, 50);
  }, [availableDiscounts]);

  const removeItem = useCallback((itemType: "perfume" | "combo", id: number | string) => {
    setItems((prev) =>
      prev.filter((i) => {
        if (i.type === "perfume" && itemType === "perfume") return i.perfume.id !== id;
        if (i.type === "combo" && itemType === "combo") return i.combo.id !== id;
        return true;
      })
    );
    // ─── Free the discount assigned to this item ───
    setDiscountAssignments((prev) => {
      const key = cartItemKey(itemType, id);
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
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
    // ─── Clear all discount assignments ───
    setDiscountAssignments({});
  }, []);

  // ─── Discount cascade methods ───
  const assignDiscount = useCallback(
    (itemType: "perfume" | "combo", id: number | string, discountId: string | null) => {
      const key = cartItemKey(itemType, id);
      setDiscountAssignments((prev) => {
        if (discountId === null) {
          if (!(key in prev)) return prev;
          const next = { ...prev };
          delete next[key];
          return next;
        }
        // If this discountId is already assigned to ANOTHER item, remove it
        // from that item first (a discount can only be applied to one item).
        const otherKey = Object.entries(prev).find(
          ([k, v]) => v === discountId && k !== key
        )?.[0];
        const next = { ...prev };
        if (otherKey) {
          delete next[otherKey];
        }
        next[key] = discountId;
        return next;
      });

      // ─── Push the assignment to the server (cross-device sync) ───
      // When the user is logged in, update the DB so other devices see the
      // assignment. This is a fire-and-forget PATCH; errors are logged but
      // don't break the UX (the local state is already correct).
      if (sessionStatus === "authenticated" && session?.user?.email) {
        fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemType,
            itemId: String(id),
            discountCodeId: discountId,
          }),
        }).catch((err) => console.warn("[Cart] discount PATCH failed:", err));
      }
    },
    [sessionStatus, session?.user?.email]
  );

  const getItemDiscountPct = useCallback(
    (itemType: "perfume" | "combo", id: number | string) => {
      // Combos NEVER get discount codes — they have their own built-in discount
      if (itemType === "combo") return 0;
      const key = cartItemKey(itemType, id);
      const discountId = discountAssignments[key];
      if (!discountId) return 0;
      const discount = availableDiscounts.find((d) => d.id === discountId);
      return discount?.discountPct ?? 0;
    },
    [discountAssignments, availableDiscounts]
  );

  const getItemDiscountedPrice = useCallback(
    (itemType: "perfume" | "combo", id: number | string) => {
      const item = items.find((i) => {
        if (itemType === "perfume") return i.type === "perfume" && i.perfume.id === id;
        return i.type === "combo" && i.combo.id === id;
      });
      if (!item) return 0;
      const pct = getItemDiscountPct(itemType, id);
      if (pct <= 0) return item.price * item.quantity;
      // Discount applies to ONLY 1 unit. The remaining (quantity - 1) units
      // are at full price. Example: $38 with 10% off, qty 2:
      //   1st unit: applyDiscount(38, 10) = $34
      //   2nd unit: $38 (full price)
      //   Total: $34 + $38 = $72
      const discountedUnit = applyDiscount(item.price, pct);
      return discountedUnit + item.price * (item.quantity - 1);
    },
    [items, getItemDiscountPct]
  );

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

  // ─── Discount cascade: derived values ───
  const highestAvailableDiscountPct = useMemo(() => {
    const assignedIds = new Set(
      Object.values(discountAssignments).filter((v): v is string => Boolean(v))
    );
    const available = availableDiscounts.filter((d) => !assignedIds.has(d.id));
    if (available.length === 0) return 0;
    return Math.max(...available.map((d) => d.discountPct));
  }, [availableDiscounts, discountAssignments]);

  const discountSavings = useMemo(() => {
    return items.reduce((acc, item) => {
      const key =
        item.type === "perfume"
          ? cartItemKey("perfume", item.perfume.id)
          : cartItemKey("combo", item.combo.id);
      const discountId = discountAssignments[key];
      if (!discountId) return acc;
      const discount = availableDiscounts.find((d) => d.id === discountId);
      if (!discount || discount.discountPct <= 0) return acc;
      // Discount only applies to 1 unit. Savings = (original - discounted) for 1 unit only.
      const savedPerUnit = item.price - applyDiscount(item.price, discount.discountPct);
      return acc + savedPerUnit;
    }, 0);
  }, [items, discountAssignments, availableDiscounts]);

  const discountedSubtotal = useMemo(
    () => Math.max(0, subtotal - discountSavings),
    [subtotal, discountSavings]
  );

  const whatsappCheckoutUrl = useMemo(
    () =>
      buildWhatsAppCheckoutUrl({
        items,
        discountAssignments,
        availableDiscounts,
        email: session?.user?.email,
        phone: userProfile?.phone ?? null,
        name: userProfile?.name ?? null,
        currencyMode,
        usdtRate,
        bcvRate,
      }),
    [items, discountAssignments, availableDiscounts, session?.user?.email, userProfile, currencyMode, usdtRate, bcvRate]
  );

  const whatsappQuoteUrl = useMemo(
    () =>
      buildWhatsAppQuoteUrl({
        items,
        discountAssignments,
        availableDiscounts,
        email: session?.user?.email,
        phone: userProfile?.phone ?? null,
        name: userProfile?.name ?? null,
        currencyMode,
        usdtRate,
        bcvRate,
      }),
    [items, discountAssignments, availableDiscounts, session?.user?.email, userProfile, currencyMode, usdtRate, bcvRate]
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
      whatsappCheckoutUrl,
      whatsappQuoteUrl,
      // Discount cascade
      availableDiscounts,
      discountAssignments,
      highestAvailableDiscountPct,
      discountSavings,
      discountedSubtotal,
      getItemDiscountPct,
      getItemDiscountedPrice,
      assignDiscount,
      // Customer profile
      userProfile,
      refreshUserProfile,
    }),
    [
      items, isOpen, openCart, closeCart, toggleCart, addPerfume, addCombo,
      removeItem, updateQuantity, clearCart, itemCount, subtotal, totalSavings,
      suggestions, whatsappCheckoutUrl, whatsappQuoteUrl,
      availableDiscounts, discountAssignments, highestAvailableDiscountPct,
      discountSavings, discountedSubtotal, getItemDiscountPct,
      getItemDiscountedPrice, assignDiscount, userProfile, refreshUserProfile,
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
