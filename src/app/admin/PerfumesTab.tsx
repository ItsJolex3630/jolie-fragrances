"use client";

/**
 * src/app/admin/PerfumesTab.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Redesigned Luxury Admin Catalog & Perfumes Management System for Jolie Fragrances.
 *
 * Implements the Stitch Design System (Onyx #0A0A0A + Metallic Gold #D4AF37):
 * - Live Perfume Catalog metrics (Total, Active, Out of Stock, Discounted, New).
 * - Full Search & Multi-filter bar (Brand, Gender, Availability, Discount status).
 * - Layout View Switcher (Grid Cards vs Compact Table).
 * - Bulk Discount Manager (apply percentage discounts across brands/genders).
 * - Inline Discount & Stock controls.
 * - Add/Edit Perfume Modal with automatic Fragrantica link parser & live preview.
 * - Optimized image rendering via PerfumeImage component.
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
  Percent,
  Sparkles,
  LayoutGrid,
  List,
  Filter,
  Gem,
  ArrowUpRight,
} from "lucide-react";
import { PerfumeImage } from "@/components/ui/PerfumeImage";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PerfumeItem {
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

function extractFragranticaId(url: string): number | null {
  if (!url) return null;
  const cleaned = url.trim().split(/[?#]/)[0].replace(/\.html?$/i, "");
  const m = cleaned.match(/-(\d{2,12})$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

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

// ─── Main Component ─────────────────────────────────────────────────────────

export function PerfumesTab() {
  const [items, setItems] = useState<PerfumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("Todas");
  const [genderFilter, setGenderFilter] = useState<string>("Todos");
  const [stockFilter, setStockFilter] = useState<string>("Todos");
  const [discountFilter, setDiscountFilter] = useState<string>("Todos");
  const [showInactive, setShowInactive] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [showForm, setShowForm] = useState(false);
  const [showBulkDiscount, setShowBulkDiscount] = useState(false);
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
      setError("Error de red al cargar el catálogo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Derived: Brand list
  const brandList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.brand));
    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  // Derived: Filtered perfume list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (!showInactive && !i.isActive) return false;
      if (brandFilter !== "Todas" && i.brand !== brandFilter) return false;
      if (genderFilter !== "Todos" && i.gender !== genderFilter) return false;
      if (stockFilter === "disponible" && !i.available) return false;
      if (stockFilter === "agotado" && i.available) return false;
      if (discountFilter === "descuento" && i.temporalDiscountPct <= 0) return false;
      if (discountFilter === "sin_descuento" && i.temporalDiscountPct > 0) return false;

      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        String(i.perfumeId) === q ||
        (i.temporalDiscountLabel && i.temporalDiscountLabel.toLowerCase().includes(q))
      );
    });
  }, [items, search, brandFilter, genderFilter, stockFilter, discountFilter, showInactive]);

  // Catalog statistics
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.isActive).length;
    const inactive = total - active;
    const outOfStock = items.filter((i) => !i.available).length;
    const discounted = items.filter((i) => i.temporalDiscountPct > 0).length;
    const newPerfumes = items.filter((i) => i.perfumeId >= 10000).length;
    return { total, active, inactive, outOfStock, discounted, newPerfumes };
  }, [items]);

  // Handlers
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
      if (idx === -1) return [item, ...prev];
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
        alert(data.error || "Error al eliminar perfume");
        return;
      }
      if (hard) {
        setItems((prev) => prev.filter((p) => p.perfumeId !== deleting.perfumeId));
      } else {
        setItems((prev) =>
          prev.map((p) =>
            p.perfumeId === deleting.perfumeId ? { ...p, isActive: false } : p
          )
        );
      }
      setDeleting(null);
    } catch (err) {
      console.error("[admin perfumes] delete error:", err);
      alert("Error de red al eliminar el perfume");
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

  const handleBulkDiscountApply = async (
    targetBrand: string,
    targetGender: string,
    pct: number,
    label: string
  ) => {
    const matches = items.filter((p) => {
      if (targetBrand !== "Todas" && p.brand !== targetBrand) return false;
      if (targetGender !== "Todos" && p.gender !== targetGender) return false;
      return true;
    });

    if (matches.length === 0) {
      alert("No hay perfumes que coincidan con la selección para aplicar el descuento.");
      return;
    }

    setLoading(true);
    let successCount = 0;
    try {
      for (const p of matches) {
        const res = await fetch(`/api/admin/catalog/perfumes/${p.perfumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            temporalDiscountPct: pct,
            temporalDiscountLabel: label.trim() || null,
          }),
        });
        if (res.ok) successCount++;
      }
      await load();
      alert(`¡Éxito! Se actualizó el descuento en ${successCount} perfumes.`);
      setShowBulkDiscount(false);
    } catch (err) {
      console.error("[admin perfumes] bulk discount error:", err);
      alert("Ocurrió un error al aplicar los descuentos masivos.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-3" />
        <span className="text-sm text-[#d4af37]/70 font-medium font-[family-name:var(--font-inter)] tracking-wide">
          Cargando catálogo de perfumes Jolie...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Catalog Header & Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Fragancias" value={stats.total} icon={<Package className="w-4 h-4 text-[#d4af37]" />} />
        <MetricCard label="Activas en Web" value={stats.active} icon={<Check className="w-4 h-4 text-emerald-400" />} />
        <MetricCard label="En Oferta / Descuento" value={stats.discounted} highlight icon={<Percent className="w-4 h-4 text-amber-400" />} />
        <MetricCard label="Agotadas" value={stats.outOfStock} icon={<CircleDot className="w-4 h-4 text-rose-400" />} />
        <MetricCard label="Nuevas Agregadas" value={stats.newPerfumes} icon={<Plus className="w-4 h-4 text-sky-400" />} />
        <MetricCard label="Ocultas" value={stats.inactive} icon={<EyeOff className="w-4 h-4 text-white/40" />} />
      </div>

      {/* Main Action Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111111]/90 border border-[rgba(212,175,55,0.2)] backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#b8962e] text-black text-xs font-bold font-[family-name:var(--font-inter)] shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Agregar Fragancia
          </button>
          <button
            onClick={() => setShowBulkDiscount(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold font-[family-name:var(--font-inter)] hover:bg-[#d4af37]/20 transition-all active:scale-95"
          >
            <Percent className="w-4 h-4" />
            Gestor de Ofertas Masivas
          </button>
          <button
            onClick={load}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08] transition-all"
            title="Recargar catálogo"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0a0a0a] border border-white/10 self-end lg:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "grid"
                ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-sm"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Tarjetas
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "table"
                ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-sm"
                : "text-white/40 hover:text-white/80"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Tabla
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={load} className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-200 hover:text-white text-xs font-semibold">
            Reintentar
          </button>
        </div>
      )}

      {/* Filter Options Bar */}
      <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por perfume, marca, notas, etiqueta de oferta o ID..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-white/30 text-xs font-[family-name:var(--font-inter)] focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Gender filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <span className="text-[11px] text-white/40 font-medium px-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#d4af37]/60" /> Genero:
            </span>
            {["Todos", ...GENDERS].map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border whitespace-nowrap ${
                  genderFilter === g
                    ? "bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40"
                    : "bg-white/[0.02] text-white/40 border-white/5 hover:text-white/70"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Second row of quick filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs text-white/60">
          <div className="flex flex-wrap items-center gap-3">
            {/* Stock selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-white/40">Stock:</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="bg-[#050505] border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#d4af37]/40"
              >
                <option value="Todos">Todos</option>
                <option value="disponible">En Stock</option>
                <option value="agotado">Agotados</option>
              </select>
            </div>

            {/* Discount selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-white/40">Ofertas:</span>
              <select
                value={discountFilter}
                onChange={(e) => setDiscountFilter(e.target.value)}
                className="bg-[#050505] border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#d4af37]/40"
              >
                <option value="Todos">Todas</option>
                <option value="descuento">Con Descuento (% OFF)</option>
                <option value="sin_descuento">Sin Descuento</option>
              </select>
            </div>

            {/* Inactive toggle */}
            <label className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#050505] border border-white/10 text-xs text-white/70 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#d4af37]"
              />
              Mostrar ocultos
            </label>
          </div>

          <div className="text-[11px] text-[#d4af37]/70 font-semibold font-[family-name:var(--font-inter)]">
            Mostrando {filtered.length} de {items.length} perfumes
          </div>
        </div>

        {/* Brand selection pills */}
        <div className="flex gap-1.5 overflow-x-auto pt-1 pb-1 admin-scroll">
          {brandList.map((b) => (
            <button
              key={b}
              onClick={() => setBrandFilter(b)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all border whitespace-nowrap ${
                brandFilter === b
                  ? "bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40 shadow-sm"
                  : "bg-white/[0.02] text-white/40 border-white/5 hover:text-white/80"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
          <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mx-auto mb-4">
            <Gem className="w-8 h-8 text-[#d4af37]/50" />
          </div>
          <h3 className="text-base font-semibold text-white font-[family-name:var(--font-playfair)] mb-1">
            No se encontraron fragancias
          </h3>
          <p className="text-xs text-white/40 max-w-md mx-auto mb-6">
            Intenta cambiar los filtros de búsqueda o marca, o crea un nuevo perfume para incluirlo en tu catálogo.
          </p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black text-xs font-bold shadow-lg shadow-[#d4af37]/20 hover:brightness-110 transition-all"
          >
            <Plus className="w-4 h-4" />
            Agregar Perfume
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <PerfumeCardItem
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
      ) : (
        /* Compact Table View */
        <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-[family-name:var(--font-inter)]">
              <thead className="bg-[#141414] text-white/50 border-b border-white/10 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fragancia</th>
                  <th className="py-3 px-4">Género / Tamaño</th>
                  <th className="py-3 px-4">Precio / Oferta</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((item) => (
                  <PerfumeTableRowItem
                    key={item.perfumeId}
                    item={item}
                    busy={togglingId === item.perfumeId}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDeleteClick(item)}
                    onToggleActive={() => handleToggleActive(item)}
                    onToggleAvailable={() => handleToggleAvailable(item)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
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

      {/* Delete Confirm Modal */}
      {deleting && (
        <DeleteConfirmDialog
          item={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Bulk Discount Modal */}
      {showBulkDiscount && (
        <BulkDiscountModal
          brands={brandList.filter((b) => b !== "Todas")}
          genders={Array.from(GENDERS)}
          onClose={() => setShowBulkDiscount(false)}
          onApply={handleBulkDiscountApply}
        />
      )}
    </div>
  );
}

// ─── Metric Card Helper ──────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative p-4 rounded-3xl border transition-all duration-300 overflow-hidden group ${
        highlight
          ? "bg-gradient-to-br from-[#d4af37]/20 to-[#0a0a0a] border-[#d4af37]/50 shadow-2xl shadow-[#d4af37]/20"
          : "bg-[#0d0d0d] border-white/10 hover:border-[#d4af37]/30 hover:shadow-lg hover:shadow-[#d4af37]/5"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      <div className="relative z-10 flex items-center justify-between mb-3">
        <span className="text-[11px] text-white/50 font-medium font-[family-name:var(--font-inter)] tracking-wider uppercase truncate">
          {label}
        </span>
        <div className={`p-2 rounded-xl border ${highlight ? 'bg-[#d4af37]/20 border-[#d4af37]/50' : 'bg-white/5 border-white/10'}`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10 text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-playfair)] tracking-tight">
        {value}
      </div>
    </div>
  );
}

// ─── Perfume Card View ───────────────────────────────────────────────────────

interface PerfumeCardItemProps {
  item: PerfumeItem;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onToggleAvailable: () => void;
}

function PerfumeCardItem({
  item,
  busy,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleAvailable,
}: PerfumeCardItemProps) {
  const pageUrl = getFragranticaPageUrl(item);

  const discountedPrice = useMemo(() => {
    if (item.price === null || item.price === undefined) return null;
    if (item.temporalDiscountPct > 0) {
      return (item.price * (1 - item.temporalDiscountPct / 100)).toFixed(2);
    }
    return item.price.toFixed(2);
  }, [item.price, item.temporalDiscountPct]);

  return (
    <div
      className={`group relative rounded-3xl border flex flex-col overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 ${
        !item.isActive
          ? "bg-[#080808]/60 border-white/5 opacity-50 grayscale hover:grayscale-0"
          : !item.available
          ? "bg-[#110a0a] border-rose-500/20 shadow-lg shadow-rose-900/10"
          : "bg-[#0f0f0f] border-[#d4af37]/20 hover:border-[#d4af37]/50 hover:shadow-2xl hover:shadow-[#d4af37]/20 hover:bg-[#141414]"
      }`}
    >
      {/* Image Header with Badges */}
      <div className="relative aspect-[4/3] bg-[#080808] border-b border-white/5 overflow-hidden">
        <PerfumeImage
          fragranticaId={item.fragranticaId}
          alt={item.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {item.temporalDiscountPct > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-lg flex items-center gap-1">
            <Percent className="w-3 h-3" />
            {item.temporalDiscountPct}% OFF
          </div>
        )}

        {/* Offer Label */}
        {item.temporalDiscountLabel && (
          <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-semibold px-2 py-0.5 rounded text-center truncate">
            {item.temporalDiscountLabel}
          </div>
        )}

        {/* New Tag */}
        {item.perfumeId >= 10000 && (
          <div className="absolute top-2.5 right-2.5 bg-[#d4af37] text-black font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
            NUEVO
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 font-[family-name:var(--font-inter)]">
        <div>
          <div className="text-[10px] font-semibold text-[#d4af37]/80 uppercase tracking-widest mb-1 truncate">
            {item.brand}
          </div>
          <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-playfair)] line-clamp-1 group-hover:text-[#d4af37] transition-colors">
            {item.name}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-white/40 flex-wrap">
            <span>{item.gender || "Unisex"}</span>
            {item.size && <span>• {item.size}</span>}
            {item.concentration && <span>• {item.concentration}</span>}
          </div>
        </div>

        {/* Price Section */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/30 uppercase tracking-wider block">Precio</span>
            {item.price !== null ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-[#d4af37]">
                  ${discountedPrice}
                </span>
                {item.temporalDiscountPct > 0 && (
                  <span className="text-[11px] text-white/30 line-through">
                    ${item.price}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-white/30 italic">Sin precio</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleAvailable}
              disabled={busy}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                item.available
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {item.available ? "En Stock" : "Agotado"}
            </button>
          </div>
        </div>

        {/* Quick Footer Action Bar */}
        <div className="pt-2 flex items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleActive}
              disabled={busy}
              className={`p-1.5 rounded-lg border transition-all ${
                item.isActive
                  ? "bg-white/5 border-white/10 text-white/70 hover:text-white"
                  : "bg-white/5 border-white/10 text-white/30"
              }`}
              title={item.isActive ? "Ocultar de catálogo" : "Hacer visible en catálogo"}
            >
              {item.isActive ? <Eye className="w-3.5 h-3.5 text-[#d4af37]" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            {pageUrl && (
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white transition-all"
                title="Ver en Fragrantica"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              disabled={busy}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-[#d4af37] hover:border-[#d4af37]/40 text-[11px] font-medium flex items-center gap-1 transition-all"
            >
              <Pencil className="w-3 h-3" />
              Editar
            </button>
            <button
              onClick={onDelete}
              disabled={busy}
              className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 transition-all"
              title="Eliminar"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Perfume Table View Item ─────────────────────────────────────────────────

function PerfumeTableRowItem({
  item,
  busy,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleAvailable,
}: PerfumeCardItemProps) {
  const pageUrl = getFragranticaPageUrl(item);

  return (
    <tr className={`hover:bg-white/[0.02] transition-colors ${!item.isActive ? "opacity-40" : ""}`}>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-11 rounded-lg overflow-hidden bg-[#080808] border border-white/10 flex-shrink-0">
            <PerfumeImage fragranticaId={item.fragranticaId} alt={item.name} />
          </div>
          <div>
            <div className="font-semibold text-white font-[family-name:var(--font-playfair)]">{item.name}</div>
            <div className="text-[10px] text-[#d4af37]/80 uppercase tracking-widest font-semibold">{item.brand}</div>
          </div>
        </div>
      </td>

      <td className="py-3 px-4 text-white/70">
        <div>{item.gender || "Unisex"}</div>
        <div className="text-[10px] text-white/40">{item.size || "100ml"} {item.concentration ? `• ${item.concentration}` : ""}</div>
      </td>

      <td className="py-3 px-4">
        {item.price !== null ? (
          <div>
            {item.temporalDiscountPct > 0 ? (
              <div>
                <span className="font-bold text-[#d4af37]">
                  ${(item.price * (1 - item.temporalDiscountPct / 100)).toFixed(2)}
                </span>
                <span className="text-[10px] text-white/30 line-through ml-1.5">${item.price}</span>
                <span className="ml-1.5 text-[9px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-1.5 py-0.5 rounded">
                  -{item.temporalDiscountPct}%
                </span>
              </div>
            ) : (
              <span className="font-semibold text-white">${item.price}</span>
            )}
          </div>
        ) : (
          <span className="text-white/30 italic">Sin precio</span>
        )}
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleAvailable}
            disabled={busy}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
              item.available
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {item.available ? "En Stock" : "Agotado"}
          </button>

          <button
            onClick={onToggleActive}
            disabled={busy}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
              item.isActive
                ? "bg-white/5 border-white/10 text-white/80"
                : "bg-white/5 border-white/10 text-white/30"
            }`}
          >
            {item.isActive ? "Visible" : "Oculto"}
          </button>
        </div>
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {pageUrl && (
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={onEdit}
            disabled={busy}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-[#d4af37]"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Add / Edit Perfume Form Modal ──────────────────────────────────────────

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
  const [concentration, setConcentration] = useState<string>(initial?.concentration || "EDP");
  const [notes, setNotes] = useState<string>(initial?.notes || "");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fragranticaId = useMemo(() => extractFragranticaId(fragranticaUrl), [fragranticaUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("El nombre del perfume es obligatorio.");
      return;
    }
    if (!brand.trim()) {
      setFormError("La marca del perfume es obligatoria.");
      return;
    }
    if (!fragranticaUrl.trim() || !fragranticaId) {
      setFormError("Ingresa un enlace válido de Fragrantica que contenga el ID numérico (ej: -34696.html).");
      return;
    }

    const body: Record<string, unknown> = {
      name: name.trim(),
      brand: brand.trim(),
      gender,
      size: size.trim(),
      fragranticaUrl: fragranticaUrl.trim(),
      available,
      concentration: concentration.trim() || null,
      notes: notes.trim() || null,
      isActive,
    };

    if (price.trim() === "") {
      body.price = null;
    } else {
      const p = Number(price);
      if (!Number.isFinite(p) || p < 0) {
        setFormError("El precio debe ser un número positivo.");
        return;
      }
      body.price = p;
    }

    const discPct = Number(temporalDiscountPct || 0);
    body.temporalDiscountPct = Number.isFinite(discPct) && discPct >= 0 ? discPct : 0;
    body.temporalDiscountLabel = temporalDiscountLabel.trim() || null;

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
        setFormError(data.error || "Ocurrió un error al guardar el perfume.");
        return;
      }
      onSaved(data.item as PerfumeItem);
    } catch (err) {
      console.error("[admin perfumes] form submit error:", err);
      setFormError("Error de red al conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#111111] border border-[rgba(212,175,55,0.3)] shadow-2xl shadow-black overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161616]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white font-[family-name:var(--font-playfair)]">
              {isEdit ? `Editar Fragancia #${initial.perfumeId}` : "Agregar Nueva Fragancia"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Fields Column */}
            <div className="md:col-span-2 space-y-4 text-xs font-[family-name:var(--font-inter)]">
              {/* Name */}
              <div>
                <label className="block text-white/70 font-medium mb-1">Nombre del Perfume *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej: Club de Nuit Intense Man"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50"
                  required
                />
              </div>

              {/* Brand & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-medium mb-1">Marca *</label>
                  <input
                    type="text"
                    list="brand-suggestions"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="ej: Armaf, Lattafa"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50"
                    required
                  />
                  <datalist id="brand-suggestions">
                    {existingBrands.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-white/70 font-medium mb-1">Género</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]/50"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fragrantica URL */}
              <div>
                <label className="block text-white/70 font-medium mb-1">Enlace de Fragrantica *</label>
                <input
                  type="url"
                  value={fragranticaUrl}
                  onChange={(e) => setFragranticaUrl(e.target.value)}
                  placeholder="https://www.fragrantica.es/perfume/Armaf/Club-de-Nuit-Intense-Man-34696.html"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50"
                  required
                />
                <p className="text-[10px] text-white/30 mt-1">
                  Se extraerá automáticamente el ID de la imagen del perfume para renderizado en alta definición.
                </p>
              </div>

              {/* Price, Size, Concentration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-white/70 font-medium mb-1">Precio ($USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 font-medium mb-1">Tamaño</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="100ml"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 font-medium mb-1">Concentración</label>
                  <select
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]/50"
                  >
                    {CONCENTRATIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Discounts & Offers */}
              <div className="p-3.5 rounded-xl bg-[#080808] border border-[#d4af37]/20 space-y-3">
                <div className="text-xs font-semibold text-[#d4af37] flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" /> Descuento Temporal / Promoción
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 text-[11px] mb-1">% de Descuento (OFF)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={temporalDiscountPct}
                      onChange={(e) => setTemporalDiscountPct(e.target.value)}
                      placeholder="ej: 15"
                      className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[11px] mb-1">Etiqueta de Promoción</label>
                    <input
                      type="text"
                      value={temporalDiscountLabel}
                      onChange={(e) => setTemporalDiscountLabel(e.target.value)}
                      placeholder="ej: OFERTA DE HOY"
                      className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Switches */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="w-4 h-4 accent-[#d4af37]"
                  />
                  <span>Disponible en Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#d4af37]"
                  />
                  <span>Visible en la tienda web</span>
                </label>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#080808] border border-white/10 text-center">
              <span className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-3">
                Previsualización en Vivo
              </span>

              <div className="w-36 h-48 rounded-xl overflow-hidden bg-[#050505] border border-[#d4af37]/30 shadow-xl mb-3 relative">
                <PerfumeImage fragranticaId={fragranticaId} alt={name || "Perfume Preview"} />
              </div>

              {fragranticaId ? (
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> ID Fragrantica: #{fragranticaId}
                </div>
              ) : (
                <div className="text-[11px] text-white/30 italic">
                  Pega un enlace para cargar la imagen
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#b8962e] text-black text-xs font-extrabold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin text-black" />}
              {isEdit ? "Guardar Cambios" : "Crear Fragancia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────

function DeleteConfirmDialog({
  item,
  onCancel,
  onConfirm,
}: {
  item: PerfumeItem;
  onCancel: () => void;
  onConfirm: (hard: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#111111] border border-rose-500/30 shadow-2xl space-y-4 text-xs font-[family-name:var(--font-inter)]">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <h3 className="text-base font-bold text-white font-[family-name:var(--font-playfair)]">
            ¿Eliminar fragancia?
          </h3>
        </div>

        <p className="text-white/70">
          Estás a punto de eliminar <strong className="text-white">{item.name}</strong> ({item.brand}). Puedes ocultarlo del catálogo (desactivación suave) o eliminarlo de forma permanente.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(false)}
            className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-semibold"
          >
            Ocultar (Soft Delete)
          </button>
          <button
            onClick={() => onConfirm(true)}
            className="px-4 py-2 rounded-xl bg-rose-500 border border-rose-600 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20"
          >
            Eliminar Definitivo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Discount Manager Modal ──────────────────────────────────────────────

function BulkDiscountModal({
  brands,
  genders,
  onClose,
  onApply,
}: {
  brands: string[];
  genders: string[];
  onClose: () => void;
  onApply: (brand: string, gender: string, pct: number, label: string) => void;
}) {
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [selectedGender, setSelectedGender] = useState("Todos");
  const [pct, setPct] = useState("15");
  const [label, setLabel] = useState("OFERTA ESPECIAL");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-[#111111] border border-[rgba(212,175,55,0.4)] shadow-2xl space-y-5 text-xs font-[family-name:var(--font-inter)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-[#d4af37]">
            <Percent className="w-5 h-5" />
            <h3 className="text-base font-bold text-white font-[family-name:var(--font-playfair)]">
              Gestor de Descuentos Masivos
            </h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-white/70">
          Aplica un porcentaje de descuento temporal y etiqueta a múltiples perfumes simultáneamente.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 mb-1">Filtrar Marca</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="Todas">Todas las marcas</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/70 mb-1">Filtrar Género</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="Todos">Todos los géneros</option>
                {genders.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 mb-1">% Descuento (OFF)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                placeholder="15"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1">Etiqueta de Oferta</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                placeholder="ej: CYBER WEEK"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => onApply(selectedBrand, selectedGender, 0, "")}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold"
          >
            Quitar Descuento Masivo
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={() => onApply(selectedBrand, selectedGender, Number(pct), label)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black font-bold shadow-lg hover:brightness-110"
            >
              Aplicar Descuentos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
