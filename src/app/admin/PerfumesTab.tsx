"use client";

/**
 * src/app/admin/PerfumesTab.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin "Perfumes" tab — full perfume & brand management.
 *
 * Lets Joel add, edit, soft-delete, and toggle visibility of perfumes
 * without touching code. New perfumes are stored in the PerfumeCatalog
 * table (id >= 10000) and merged with the static `perfumes.ts` catalog
 * at runtime by /api/prices + the storefront catalog page.
 *
 * API surface:
 *   GET    /api/admin/catalog/perfumes            → list all perfumes
 *   POST   /api/admin/catalog/perfumes            → create a new perfume
 *   PUT    /api/admin/catalog/perfumes/:id        → update a perfume
 *   DELETE /api/admin/catalog/perfumes/:id        → soft-delete (isActive=0)
 *   DELETE /api/admin/catalog/perfumes/:id?hard=1 → hard-delete (permanent)
 *
 * The form modal extracts the fragranticaId from a pasted Fragrantica URL
 * and shows a live image preview so Joel can verify the right perfume was
 * picked before saving.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Loader2,
  AlertTriangle,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Package,
  Tag,
  CircleDot,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PerfumeItem {
  id: string;
  perfumeId: number;
  name: string;
  brand: string;
  price: number | null;
  available: boolean;
  temporalDiscountPct: number;
  temporalDiscountLabel: string | null;
  notes: string | null;
  updatedAt: string;
  gender: string | null;
  size: string | null;
  fragranticaId: number | null;
  concentration: string | null;
  brandSlug: string | null;
  perfumeSlug: string | null;
  isActive: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const GENDERS = ["Dama", "Caballero", "Unisex"] as const;
const CONCENTRATIONS = ["EDP", "EDT", "Parfum", "Elixir", "EdC", "EdF"];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extract the numeric Fragrantica ID from a perfume URL. */
function extractFragranticaId(url: string): number | null {
  if (!url) return null;
  const cleaned = url.trim().split(/[?#]/)[0].replace(/\.html?$/i, "");
  const m = cleaned.match(/-(\d{2,12})$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Build the Fragrantica image URL for a given ID. Uses the same
 * `perfume-thumbs/dark-375x500.{id}.avif` format the storefront catalog
 * uses (in src/lib/perfumes.ts → getImageUrl), so what the admin sees in
 * the preview is exactly what customers will see in the catalog.
 */
function getImageUrl(fragranticaId: number): string {
  return `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${fragranticaId}.avif`;
}

/** JPEG fallback (some older Fragrantica images don't have .avif). */
function getImageFallbackUrl(fragranticaId: number): string {
  return `https://fimgs.net/mdimg/perfume-thumbs/dark-375x500.${fragranticaId}.jpg`;
}

/** Build the public Fragrantica page URL for a perfume. */
function getFragranticaPageUrl(perfume: PerfumeItem): string | null {
  if (!perfume.fragranticaId) return null;
  const brandSlug = perfume.brandSlug || perfume.brand;
  const perfumeSlug = perfume.perfumeSlug || perfume.name;
  return `https://www.fragrantica.com/perfume/${brandSlug}/${perfumeSlug}-${perfume.fragranticaId}.html`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Main component ─────────────────────────────────────────────────────────

export function PerfumesTab() {
  const [items, setItems] = useState<PerfumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState<string>("Todas");
  const [showInactive, setShowInactive] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PerfumeItem | null>(null);
  const [deleting, setDeleting] = useState<PerfumeItem | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/catalog/perfumes", { cache: "no-store" });
      if (res.status === 403) {
        window.location.href = "/";
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al cargar los perfumes");
        return;
      }
      setItems(data.items || []);
    } catch (err) {
      console.error("[admin perfumes] load error:", err);
      setError("Error de red al cargar los perfumes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Derived: brand list from items (sorted, with "Todas" first)
  const brandList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.brand));
    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  // Derived: filtered list (search + brand + active filter)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (!showInactive && !i.isActive) return false;
      if (brand !== "Todas" && i.brand !== brand) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        String(i.perfumeId) === q
      );
    });
  }, [items, search, brand, showInactive]);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.isActive).length;
    const inactive = total - active;
    const newPerfumes = items.filter((i) => i.perfumeId >= 10000).length;
    const withPrice = items.filter((i) => i.price !== null).length;
    return { total, active, inactive, newPerfumes, withPrice };
  }, [items]);

  // ── Handlers ──

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (item: PerfumeItem) => {
    setEditing(item);
    setShowForm(true);
  };

  const handleSaved = (item: PerfumeItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.perfumeId === item.perfumeId);
      if (idx === -1) return [...prev, item];
      const next = [...prev];
      next[idx] = item;
      return next;
    });
    setShowForm(false);
    setEditing(null);
  };

  const handleDeleteClick = (item: PerfumeItem) => {
    setDeleting(item);
  };

  const handleDeleteConfirm = async (hard: boolean) => {
    if (!deleting) return;
    setTogglingId(deleting.perfumeId);
    try {
      const url = hard
        ? `/api/admin/catalog/perfumes/${deleting.perfumeId}?hard=true`
        : `/api/admin/catalog/perfumes/${deleting.perfumeId}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Error al eliminar");
        return;
      }
      if (hard) {
        setItems((prev) => prev.filter((p) => p.perfumeId !== deleting.perfumeId));
      } else {
        // Soft delete — update isActive locally
        setItems((prev) =>
          prev.map((p) =>
            p.perfumeId === deleting.perfumeId ? { ...p, isActive: false } : p
          )
        );
      }
      setDeleting(null);
    } catch (err) {
      console.error("[admin perfumes] delete error:", err);
      alert("Error de red al eliminar");
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleActive = async (item: PerfumeItem) => {
    setTogglingId(item.perfumeId);
    try {
      const res = await fetch(`/api/admin/catalog/perfumes/${item.perfumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Error al cambiar visibilidad");
        return;
      }
      const updated = data.item as PerfumeItem;
      setItems((prev) =>
        prev.map((p) =>
          p.perfumeId === item.perfumeId ? { ...p, isActive: updated.isActive } : p
        )
      );
    } catch (err) {
      console.error("[admin perfumes] toggle active error:", err);
      alert("Error de red");
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleAvailable = async (item: PerfumeItem) => {
    setTogglingId(item.perfumeId);
    try {
      const res = await fetch(`/api/admin/catalog/perfumes/${item.perfumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !item.available }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Error al cambiar disponibilidad");
        return;
      }
      const updated = data.item as PerfumeItem;
      setItems((prev) =>
        prev.map((p) =>
          p.perfumeId === item.perfumeId ? { ...p, available: updated.available } : p
        )
      );
    } catch (err) {
      console.error("[admin perfumes] toggle available error:", err);
      alert("Error de red");
    } finally {
      setTogglingId(null);
    }
  };

  // ─── Render ──

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
        <span className="ml-3 text-sm text-white/50 font-[family-name:var(--font-inter)]">
          Cargando perfumes…
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* Stats + Add button row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap text-xs font-[family-name:var(--font-inter)]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
            <Check className="w-3 h-3" />
            {stats.active} activos
          </span>
          {stats.inactive > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50">
              <EyeOff className="w-3 h-3" />
              {stats.inactive} ocultos
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37]">
            <Plus className="w-3 h-3" />
            {stats.newPerfumes} agregados
          </span>
          <span className="text-white/40">· {stats.total} total</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white/70 text-xs hover:text-white hover:bg-white/[0.06] transition-all font-[family-name:var(--font-inter)]"
            title="Recargar lista"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recargar</span>
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black text-xs font-bold font-[family-name:var(--font-inter)] hover:from-[#e0c04a] hover:to-[#c8a634] transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar perfume
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={load} className="ml-auto text-rose-200 hover:text-white underline">
            Reintentar
          </button>
        </div>
      )}

      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, marca o ID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 text-sm font-[family-name:var(--font-inter)] focus:outline-none focus:border-[#d4af37]/40 focus:bg-white/[0.05] transition-all"
          />
        </div>
        <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/60 font-[family-name:var(--font-inter)] cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-3.5 h-3.5 accent-[#d4af37] cursor-pointer"
          />
          Mostrar ocultos
        </label>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/60 font-[family-name:var(--font-inter)] flex-shrink-0">
          <Package className="w-3.5 h-3.5 text-[#d4af37]/60" />
          {search || brand !== "Todas" || !showInactive
            ? `${filtered.length} de ${items.length}`
            : `${items.length} perfumes`}
        </div>
      </div>

      {/* Brand filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 admin-scroll">
        {brandList.map((b) => (
          <button
            key={b}
            onClick={() => setBrand(b)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium font-[family-name:var(--font-inter)] border whitespace-nowrap transition-all ${
              brand === b
                ? "bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30"
                : "bg-white/[0.02] text-white/50 border-white/[0.06] hover:text-white/80 hover:border-white/15"
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40 font-[family-name:var(--font-inter)] mb-4">
            {search || brand !== "Todas"
              ? "Sin resultados para tu búsqueda."
              : "Aún no hay perfumes. Pulsa «Agregar perfume» para crear el primero."}
          </p>
          {!search && brand === "Todas" && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black text-xs font-bold font-[family-name:var(--font-inter)] hover:from-[#e0c04a] hover:to-[#c8a634] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar perfume
            </button>
          )}
        </div>
      ) : (
        <div className="max-h-[calc(100vh-420px)] overflow-y-auto pr-1 -mr-1 admin-scroll">
          <div className="space-y-2">
            {filtered.map((item) => (
              <PerfumeRow
                key={item.perfumeId}
                item={item}
                busy={togglingId === item.perfumeId}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDeleteClick(item)}
                onToggleActive={() => handleToggleActive(item)}
                onToggleAvailable={() => handleToggleAvailable(item)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Form modal (add/edit) */}
      {showForm && (
        <PerfumeFormModal
          initial={editing}
          existingBrands={brandList.filter((b) => b !== "Todas")}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirm dialog */}
      {deleting && (
        <DeleteConfirmDialog
          item={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

// ─── PerfumeRow ─────────────────────────────────────────────────────────────

interface PerfumeRowProps {
  item: PerfumeItem;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onToggleAvailable: () => void;
}

function PerfumeRow({
  item,
  busy,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleAvailable,
}: PerfumeRowProps) {
  const pageUrl = getFragranticaPageUrl(item);
  return (
    <div
      className={`rounded-xl border transition-all ${
        !item.isActive
          ? "bg-white/[0.01] border-white/[0.04] opacity-60"
          : !item.available
            ? "bg-rose-500/[0.02] border-rose-500/15"
            : "bg-white/[0.02] border-white/[0.06]"
      }`}
    >
      <div className="p-3 sm:p-4 flex items-start gap-3">
        {/* Image thumbnail (or placeholder) */}
        <div className="w-12 h-16 rounded-md overflow-hidden bg-[#0a0a0a] border border-white/[0.06] flex-shrink-0 flex items-center justify-center">
          {item.fragranticaId ? (
            <img
              src={getImageUrl(item.fragranticaId)}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                const fallback = getImageFallbackUrl(item.fragranticaId!);
                if (img.src !== fallback) img.src = fallback;
              }}
            />
          ) : (
            <Package className="w-5 h-5 text-white/20" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white/90 font-[family-name:var(--font-playfair)] truncate">
              {item.name}
            </h3>
            {item.perfumeId >= 10000 && (
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] font-[family-name:var(--font-inter)] font-semibold">
                <Plus className="w-2.5 h-2.5" />
                Nuevo
              </span>
            )}
            {!item.isActive && (
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50 font-[family-name:var(--font-inter)] font-semibold">
                <EyeOff className="w-2.5 h-2.5" />
                Oculto
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[10px] text-white/40 font-[family-name:var(--font-inter)]">
            <span className="text-[#d4af37]/80 font-semibold tracking-[0.1em] uppercase">
              {item.brand}
            </span>
            {item.gender && (
              <>
                <span className="text-white/20">·</span>
                <span>{item.gender}</span>
              </>
            )}
            {item.size && (
              <>
                <span className="text-white/20">·</span>
                <span>{item.size}</span>
              </>
            )}
            {item.concentration && (
              <>
                <span className="text-white/20">·</span>
                <span>{item.concentration}</span>
              </>
            )}
            <span className="text-white/20">·</span>
            <span>ID: {item.perfumeId}</span>
            {item.price !== null && (
              <>
                <span className="text-white/20">·</span>
                {item.temporalDiscountPct > 0 ? (
                  <span className="text-amber-400 font-semibold text-[10px]">
                    ${(item.price * (1 - item.temporalDiscountPct / 100)).toFixed(2)}
                    <span className="text-white/30 line-through ml-1">${item.price}</span>
                  </span>
                ) : (
                  <span className="text-emerald-300/80">${item.price}</span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Available toggle */}
            <button
              onClick={onToggleAvailable}
              disabled={busy}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium font-[family-name:var(--font-inter)] border transition-all disabled:opacity-50 ${
                item.available
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              <CircleDot className="w-2.5 h-2.5" />
              {item.available ? "Disponible" : "No disponible"}
            </button>
            {/* Active (visible) toggle */}
            <button
              onClick={onToggleActive}
              disabled={busy}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium font-[family-name:var(--font-inter)] border transition-all disabled:opacity-50 ${
                item.isActive
                  ? "bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]"
                  : "bg-white/[0.04] border-white/[0.08] text-white/40"
              }`}
            >
              {item.isActive ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
              {item.isActive ? "Visible" : "Oculto"}
            </button>
            {pageUrl && (
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium font-[family-name:var(--font-inter)] border bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/80 transition-all"
                title="Ver en Fragrantica"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                Fragrantica
              </a>
            )}
            <span className="text-[10px] text-white/30 font-[family-name:var(--font-inter)] ml-auto">
              {formatDate(item.updatedAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onEdit}
            disabled={busy}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 hover:text-[#d4af37] hover:border-[#d4af37]/30 hover:bg-[#d4af37]/10 transition-all disabled:opacity-50"
            title="Editar perfume"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 hover:text-rose-300 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all disabled:opacity-50"
            title="Eliminar perfume"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PerfumeFormModal (add / edit) ──────────────────────────────────────────

interface PerfumeFormModalProps {
  initial: PerfumeItem | null;
  existingBrands: string[];
  onClose: () => void;
  onSaved: (item: PerfumeItem) => void;
}

function PerfumeFormModal({
  initial,
  existingBrands,
  onClose,
  onSaved,
}: PerfumeFormModalProps) {
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name || "");
  const [brand, setBrand] = useState(initial?.brand || "");
  const [gender, setGender] = useState<string>(initial?.gender || "Unisex");
  const [size, setSize] = useState(initial?.size || "100ml");
  const [fragranticaUrl, setFragranticaUrl] = useState(() => {
    if (!initial?.fragranticaId) return "";
    const pageUrl = getFragranticaPageUrl(initial);
    return pageUrl || "";
  });
  const [price, setPrice] = useState<string>(
    initial?.price === null || initial?.price === undefined ? "" : String(initial.price)
  );
  const [available, setAvailable] = useState<boolean>(initial?.available ?? true);
  const [temporalDiscountPct, setTemporalDiscountPct] = useState<string>(
    initial?.temporalDiscountPct ? String(initial.temporalDiscountPct) : ""
  );
  const [temporalDiscountLabel, setTemporalDiscountLabel] = useState<string>(initial?.temporalDiscountLabel || "");
  const [concentration, setConcentration] = useState<string>(initial?.concentration || "");
  const [notes, setNotes] = useState<string>(initial?.notes || "");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Derived: fragrantica ID from URL (live)
  const fragranticaId = useMemo(() => extractFragranticaId(fragranticaUrl), [fragranticaUrl]);

  // Derived: preview image URL
  const previewImageUrl = fragranticaId ? getImageUrl(fragranticaId) : null;
  const [previewError, setPreviewError] = useState(false);
  useEffect(() => {
    setPreviewError(false);
  }, [previewImageUrl]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validate
    if (!name.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    if (!brand.trim()) {
      setFormError("La marca es obligatoria.");
      return;
    }
    if (!fragranticaUrl.trim() || !fragranticaId) {
      setFormError("Pega una URL válida de Fragrantica (debe terminar en -<número>.html).");
      return;
    }

    // Build body
    const body: Record<string, unknown> = {
      name: name.trim(),
      brand: brand.trim(),
      gender,
      size: size.trim(),
      fragranticaUrl: fragranticaUrl.trim(),
      available,
      concentration: concentration.trim() || null,
      notes: notes.trim() || null,
    };
    if (price.trim() === "") {
      body.price = null;
    } else {
      const n = Number(price.replace(",", "."));
      if (!Number.isFinite(n) || n < 0) {
        setFormError("Precio inválido — debe ser un número positivo o vacío.");
        return;
      }
      body.price = Math.round(n * 100) / 100;
    }

    if (temporalDiscountPct.trim() === "") {
      body.temporalDiscountPct = 0;
      body.temporalDiscountLabel = null;
    } else {
      const pct = Number(temporalDiscountPct);
      if (!Number.isInteger(pct) || pct < 0 || pct > 100) {
        setFormError("El porcentaje de descuento debe ser un número entero entre 0 y 100.");
        return;
      }
      body.temporalDiscountPct = pct;
      body.temporalDiscountLabel = temporalDiscountLabel.trim() || null;
    }
    if (isEdit) {
      body.isActive = isActive;
    }

    setSaving(true);
    try {
      const url = isEdit
        ? `/api/admin/catalog/perfumes/${initial!.perfumeId}`
        : "/api/admin/catalog/perfumes";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Error al guardar");
        return;
      }
      onSaved(data.item as PerfumeItem);
    } catch (err) {
      console.error("[admin perfumes form] save error:", err);
      setFormError("Error de red al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0d0d0d] border border-[#d4af37]/25 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto admin-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0d0d0d]/95 backdrop-blur border-b border-white/[0.06] px-5 py-3 flex items-center justify-between">
          <h2 className="text-base font-[family-name:var(--font-playfair)] text-[#d4af37] tracking-wide">
            {isEdit ? "Editar perfume" : "Agregar perfume"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image preview + URL */}
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-[120px] h-[160px] rounded-lg overflow-hidden bg-[#0a0a0a] border border-white/[0.08] flex items-center justify-center">
                {previewImageUrl && !previewError ? (
                  <img
                    src={previewImageUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div className="text-center px-2">
                    <Package className="w-6 h-6 text-white/20 mx-auto mb-1" />
                    <p className="text-[9px] text-white/30 font-[family-name:var(--font-inter)]">
                      {fragranticaUrl
                        ? previewError
                          ? "Imagen no disponible"
                          : "Pegando URL…"
                        : "Pega una URL"}
                    </p>
                  </div>
                )}
              </div>
              {fragranticaId && (
                <p className="text-[10px] text-emerald-300/80 font-[family-name:var(--font-inter)] text-center">
                  ID: {fragranticaId}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-[family-name:var(--font-inter)] font-semibold">
                  URL de Fragrantica *
                </span>
                <input
                  type="url"
                  value={fragranticaUrl}
                  onChange={(e) => setFragranticaUrl(e.target.value)}
                  placeholder="https://www.fragrantica.com/perfume/..."
                  className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-all"
                />
                <span className="text-[10px] text-white/40 font-[family-name:var(--font-inter)] mt-1 block">
                  Pega la URL completa. El ID se extrae automáticamente.
                </span>
              </label>

              {fragranticaUrl && !fragranticaId && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-[family-name:var(--font-inter)] flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  No se pudo extraer el ID. Verifica que la URL termine en
                  <code className="px-1 py-0.5 bg-amber-500/10 rounded">-&lt;número&gt;.html</code>
                </div>
              )}
            </div>
          </div>

          {/* Name + Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-[family-name:var(--font-inter)] font-semibold">
                Nombre *
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Club de Nuit Intense Man"
                className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-all"
              />
            </label>
            <label className="block">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-[family-name:var(--font-inter)] font-semibold">
                Marca *
              </span>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                list="perfume-brands"
                placeholder="Ej: Armaf"
                className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-all"
              />
              <datalist id="perfume-brands">
                {existingBrands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
              <span className="text-[10px] text-white/40 font-[family-name:var(--font-inter)] mt-1 block">
                Elige una marca existente o escribe una nueva.
              </span>
            </label>
          </div>

          {/* Gender + Size + Concentration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-[family-name:var(--font-inter)] font-semibold">
                Género *
              </span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 outline-none transition-all"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-[family-name:var(--font-inter)] font-semibold">
                Tamaño *
              </span>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Ej: 100ml"
                className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-all"
              />
            </label>
            <label className="block">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-[family-name:var(--font-inter)] font-semibold">
                Concentración
              </span>
              <select
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 outline-none transition-all"
              >
                <option value="">— Sin especificar —</option>
                {CONCENTRATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Price + Available */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-[family-name:var(--font-inter)] font-semibold">
                Precio USD
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Vacío = Consultar"
                className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-all"
              />
              <span className="text-[10px] text-white/40 font-[family-name:var(--font-inter)] mt-1 block">
                Déjalo vacío para mostrar «Consultar».
              </span>
            </label>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-[family-name:var(--font-inter)] font-semibold">
                Disponibilidad
              </span>
              <button
                type="button"
                onClick={() => setAvailable((a) => !a)}
                className={`px-3 py-2 rounded-lg text-sm font-medium font-[family-name:var(--font-inter)] border transition-all ${
                  available
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                <CircleDot className="w-3.5 h-3.5 inline mr-1.5" />
                {available ? "Disponible" : "No disponible"}
              </button>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => setIsActive((a) => !a)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium font-[family-name:var(--font-inter)] border transition-all ${
                    isActive
                      ? "bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]"
                      : "bg-white/[0.04] border-white/[0.08] text-white/40"
                  }`}
                >
                  {isActive ? <Eye className="w-3.5 h-3.5 inline mr-1.5" /> : <EyeOff className="w-3.5 h-3.5 inline mr-1.5" />}
                  {isActive ? "Visible en catálogo" : "Oculto del catálogo"}
                </button>
              )}
            </div>
          </div>

          {/* Discounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-[family-name:var(--font-inter)] font-semibold">
                Descuento temporal (%)
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={temporalDiscountPct}
                onChange={(e) => setTemporalDiscountPct(e.target.value)}
                placeholder="Ej: 15"
                className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-all"
              />
              <span className="text-[10px] text-white/40 font-[family-name:var(--font-inter)] mt-1 block">
                Vacío o 0 para no aplicar descuento.
              </span>
            </label>
            <label className="block">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-[family-name:var(--font-inter)] font-semibold">
                Etiqueta del descuento
              </span>
              <input
                type="text"
                value={temporalDiscountLabel}
                onChange={(e) => setTemporalDiscountLabel(e.target.value)}
                placeholder="Ej: Día de las Madres"
                className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-all"
              />
            </label>
          </div>

          {/* Notes */}
          <label className="block">
            <span className="text-[10px] text-white/50 uppercase tracking-wider font-[family-name:var(--font-inter)] font-semibold">
              Notas internas (opcional)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas internas sobre este perfume (no se muestran al cliente)…"
              rows={2}
              className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-all resize-y min-h-[60px]"
            />
          </label>

          {/* Error message */}
          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-[family-name:var(--font-inter)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm font-[family-name:var(--font-inter)] hover:bg-white/[0.08] transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black text-sm font-bold font-[family-name:var(--font-inter)] hover:from-[#e0c04a] hover:to-[#c8a634] transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {isEdit ? "Guardar cambios" : "Crear perfume"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DeleteConfirmDialog ────────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  item: PerfumeItem;
  onCancel: () => void;
  onConfirm: (hard: boolean) => void;
}

function DeleteConfirmDialog({ item, onCancel, onConfirm }: DeleteConfirmDialogProps) {
  // For admin-added perfumes (id >= 10000), offer hard-delete. For static
  // perfumes (id < 10000), only soft-delete makes sense — the row is the
  // admin's runtime override on top of the static catalog, so hiding it
  // is equivalent to "removing" it from the storefront.
  const canHardDelete = item.perfumeId >= 10000;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-[#0d0d0d] border border-rose-500/30 rounded-2xl w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-rose-300" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-[family-name:var(--font-playfair)] text-white tracking-wide">
              ¿Eliminar perfume?
            </h3>
            <p className="text-sm text-white/60 font-[family-name:var(--font-inter)] mt-1">
              Estás a punto de eliminar
              <span className="text-white font-semibold"> {item.name} </span>
              de
              <span className="text-[#d4af37] font-semibold"> {item.brand}</span>.
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <button
            onClick={() => onConfirm(false)}
            className="w-full px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm font-medium font-[family-name:var(--font-inter)] hover:bg-amber-500/20 transition-all text-left flex items-center gap-2"
          >
            <EyeOff className="w-4 h-4 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold">Ocultar del catálogo (recomendado)</div>
              <div className="text-[10px] text-amber-200/60">
                El perfume desaparece del catálogo pero se conserva en la base de datos.
                Podrás reactivarlo cuando quieras.
              </div>
            </div>
          </button>

          {canHardDelete && (
            <button
              onClick={() => onConfirm(true)}
              className="w-full px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm font-medium font-[family-name:var(--font-inter)] hover:bg-rose-500/20 transition-all text-left flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold">Eliminar permanentemente</div>
                <div className="text-[10px] text-rose-200/60">
                  Borra el perfume de la base de datos. Esta acción no se puede deshacer.
                </div>
              </div>
            </button>
          )}
        </div>

        <button
          onClick={onCancel}
          className="w-full px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm font-[family-name:var(--font-inter)] hover:bg-white/[0.08] transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
