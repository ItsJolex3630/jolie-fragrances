/**
 * /admin/crm
 * Panel CRM de Jolie Fragrances.
 * Sigue la paleta de marca: negro #0A0A0A + dorado #D4AF37.
 *
 * Acceso: únicamente ADMIN_EMAIL (joelmedina2009@gmail.com). Cualquier otro
 * usuario (o no autenticado) es redirigido a "/" vía el useEffect de abajo.
 * Las APIs en /api/admin/crm/* validan la sesión con `requireAdmin` y
 * devuelven 403 si no es admin — esta página es solo la UI.
 *
 * Construido con Tailwind puro (sin shadcn/ui) para no duplicar la
 * instalación de la librería completa.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, ShoppingBag, FlaskConical, Package, MessageSquare,
  Download, BarChart3, Plus, Trash2, Pencil, X, Check, ChevronLeft,
  Loader2, AlertTriangle, TrendingUp, DollarSign, Target, Crown,
  Phone, Mail, Instagram, Search, Filter, Star, Ban, RefreshCw,
  Inbox, Sparkles, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

import { ADMIN_EMAIL } from "@/lib/adminAuth";


// ─── Tipos ──────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  channel: string;
  preferences: string | null;
  notes: string | null;
  tags: string | null;
  isVip: boolean;
  isBlocked: boolean;
  blockReason: string | null;
  createdAt: string;
  stats: {
    totalSpent: number;
    totalPaid: number;
    pending: number;
    salesCount: number;
    dmsCount: number;
  };
}

interface Sale {
  id: string;
  customerId: string;
  itemType: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paid: number;
  pending: number;
  paymentStatus: string;
  paymentMethod: string | null;
  deliveryMethod: string | null;
  saleDate: string;
  notes: string | null;
  customer?: { name: string; email: string | null; phone: string | null };
}

interface Decant {
  id: string;
  sourcePerfume: string;
  sourceBrand: string | null;
  olfativeProfile: string | null;
  sizeMl: number;
  cost: number | null;
  price: number;
  status: string;
  filledAt: string | null;
  soldAt: string | null;
  customerId: string | null;
  notes: string | null;
  customer?: { name: string } | null;
}

interface InventoryItem {
  id: string;
  name: string;
  brand: string | null;
  olfativeProfile: string | null;
  size: string | null;
  cost: number | null;
  price: number;
  status: string;
  customerInterest: string | null;
  notes: string | null;
  acquiredAt: string;
  soldAt: string | null;
}

interface Dm {
  id: string;
  customerId: string | null;
  platform: string;
  username: string | null;
  fragranceInterest: string | null;
  inquiryType: string;
  status: string;
  nextStep: string | null;
  followUpDate: string | null;
  closedAt: string | null;
  result: string | null;
  notes: string | null;
  receivedAt: string;
  customer?: { name: string } | null;
}

interface Stats {
  totals: {
    customers: number;
    sales: number;
    decants: number;
    inventory: number;
    dms: number;
  };
  revenue: {
    total: number;
    collected: number;
    pending: number;
    last30Days: number;
    decantRevenue: number;
    inventoryValueAvailable: number;
    inventoryCostTotal: number;
  };
  conversion: {
    dmsToSale: number;
    dmsClosedSold: number;
    totalDms: number;
  };
  decantsByStatus: Record<string, number>;
  inventoryByStatus: Record<string, number>;
  dmsByStatus: Record<string, number>;
}

type Tab = "dashboard" | "customers" | "sales" | "decants" | "inventory" | "dms" | "export";

// ─── Helpers ────────────────────────────────────────────────────────────────

const USD = (n: number) => `$${n.toFixed(2)}`;

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-VE", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return iso;
  }
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-VE", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const DECANT_STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: "Pendiente llenar", color: "text-gray-300 bg-gray-500/10 border-gray-500/30", dot: "bg-gray-400" },
  filled: { label: "Lleno - Disponible", color: "text-amber-200 bg-amber-500/10 border-amber-500/30", dot: "bg-amber-400" },
  available: { label: "Disponible", color: "text-amber-200 bg-amber-500/10 border-amber-500/30", dot: "bg-amber-400" },
  reserved: { label: "Reservado", color: "text-sky-200 bg-sky-500/10 border-sky-500/30", dot: "bg-sky-400" },
  sold: { label: "Vendido", color: "text-emerald-200 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
};

const DM_STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  new: { label: "Nueva", color: "text-yellow-200 bg-yellow-500/10 border-yellow-500/30", dot: "bg-yellow-400" },
  in_conversation: { label: "En conversación", color: "text-sky-200 bg-sky-500/10 border-sky-500/30", dot: "bg-sky-400" },
  pending: { label: "Pendiente", color: "text-orange-200 bg-orange-500/10 border-orange-500/30", dot: "bg-orange-400" },
  closed_sold: { label: "Cerrada - Vendido", color: "text-emerald-200 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  closed_no_sale: { label: "Cerrada - No vendió", color: "text-rose-200 bg-rose-500/10 border-rose-500/30", dot: "bg-rose-400" },
  no_reply: { label: "No respondió", color: "text-gray-300 bg-gray-500/10 border-gray-500/30", dot: "bg-gray-400" },
};

const GENERAL_STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  available: { label: "Disponible", color: "text-amber-200 bg-amber-500/10 border-amber-500/30", dot: "bg-amber-400" },
  reserved: { label: "Reservado", color: "text-sky-200 bg-sky-500/10 border-sky-500/30", dot: "bg-sky-400" },
  sold: { label: "Vendido", color: "text-emerald-200 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  paid: { label: "Pagado", color: "text-emerald-200 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  partial: { label: "Pago parcial", color: "text-yellow-200 bg-yellow-500/10 border-yellow-500/30", dot: "bg-yellow-400" },
  pending: { label: "Pendiente", color: "text-orange-200 bg-orange-500/10 border-orange-500/30", dot: "bg-orange-400" },
  whatsapp: { label: "WhatsApp", color: "text-green-200 bg-green-500/10 border-green-500/30", dot: "bg-green-400" },
  instagram: { label: "Instagram", color: "text-pink-200 bg-pink-500/10 border-pink-500/30", dot: "bg-pink-400" },
  referral: { label: "Referido", color: "text-purple-200 bg-purple-500/10 border-purple-500/30", dot: "bg-purple-400" },
  other: { label: "Otro", color: "text-white/60 bg-white/5 border-white/10", dot: "bg-white/40" },
};

function StatusBadge({ status }: { status: string }) {
  const info =
    DECANT_STATUS_LABELS[status] ||
    DM_STATUS_LABELS[status] ||
    GENERAL_STATUS_LABELS[status] ||
    { label: status, color: "text-white bg-white/5 border-white/20", dot: "bg-white/60" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium ${info.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
}

// Precio con degradado dorado.
function Gold({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent font-semibold">
      {children}
    </span>
  );
}

// Título de sección con fuente Playfair y divisor sutil.
function SectionTitle({
  icon, title, subtitle, action,
}: { icon?: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5 pb-3 border-b border-[#d4af37]/10">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-[family-name:var(--font-playfair)] tracking-wide text-white truncate">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// Estado vacío más visual.
function EmptyState({
  icon, title, hint,
}: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/10 to-transparent border border-[#d4af37]/20 mb-4">
        <div className="text-[#d4af37]/70">{icon}</div>
      </div>
      <p className="text-sm font-medium text-white/70 mb-1 font-[family-name:var(--font-inter)]">{title}</p>
      {hint && <p className="text-xs text-white/40 max-w-md mx-auto">{hint}</p>}
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────

export default function CrmAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ─── Access control ──────────────────────────────────────────────────────
  // Redirect non-admins (and unauthenticated users) back to "/".
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }
    const email = session?.user?.email?.trim().toLowerCase() || "";
    if (email !== ADMIN_EMAIL.toLowerCase()) {
      router.replace("/");
    }
  }, [status, session, router]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/crm/stats", { cache: "no-store" });
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error("[crm] stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    if ((session?.user?.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return;
    loadStats();
  }, [loadStats, status, session]);

  // Recargar stats cuando se cambia de tab
  useEffect(() => {
    if (tab === "dashboard") loadStats();
  }, [tab, loadStats]);

  // Don't render anything until the session is resolved (avoids flashing the
  // CRM UI to non-admins before the redirect kicks in).
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
      </div>
    );
  }
  if (status !== "authenticated") return null;
  if ((session?.user?.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-[family-name:var(--font-inter)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#d4af37]/15 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8962e] flex items-center justify-center text-black font-bold flex-shrink-0 shadow-lg shadow-[#d4af37]/20">
              J
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-[family-name:var(--font-playfair)] tracking-wide text-[#d4af37] truncate">
                CRM · Jolie Fragrances
              </h1>
              <p className="text-[10px] text-white/40 truncate">
                Gestión de clientes, ventas, decants e inventario
              </p>
            </div>
          </div>
          <a
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-[#d4af37]/20 text-[#d4af37]/70 hover:text-[#d4af37] hover:border-[#d4af37]/40 text-xs transition-all flex-shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6 overflow-x-auto shadow-lg shadow-black/20">
          <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<BarChart3 className="w-4 h-4" />} label="Dashboard" />
          <TabButton active={tab === "customers"} onClick={() => setTab("customers")} icon={<Users className="w-4 h-4" />} label="Clientes" />
          <TabButton active={tab === "sales"} onClick={() => setTab("sales")} icon={<ShoppingBag className="w-4 h-4" />} label="Ventas" />
          <TabButton active={tab === "decants"} onClick={() => setTab("decants")} icon={<FlaskConical className="w-4 h-4" />} label="Decants" />
          <TabButton active={tab === "inventory"} onClick={() => setTab("inventory")} icon={<Package className="w-4 h-4" />} label="Inventario" />
          <TabButton active={tab === "dms"} onClick={() => setTab("dms")} icon={<MessageSquare className="w-4 h-4" />} label="DMs" />
          <TabButton active={tab === "export"} onClick={() => setTab("export")} icon={<Download className="w-4 h-4" />} label="Exportar" />
        </div>

        {/* Contenido */}
        {tab === "dashboard" && <DashboardTab stats={stats} loading={statsLoading} onRetry={loadStats} />}
        {tab === "customers" && <CustomersTab />}
        {tab === "sales" && <SalesTab />}
        {tab === "decants" && <DecantsTab />}
        {tab === "inventory" && <InventoryTab />}
        {tab === "dms" && <DmsTab />}
        {tab === "export" && <ExportTab />}
      </main>
    </div>
  );
}

// ─── Tab Button ─────────────────────────────────────────────────────────────

function TabButton({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30"
          : "text-white/50 hover:text-white/80 border border-transparent"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Loading / Error Splash ─────────────────────────────────────────────────

function Loading({ message = "Cargando…" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
      <span className="ml-3 text-sm text-white/50">{message}</span>
    </div>
  );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="py-12 text-center">
      <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p className="text-sm text-red-300 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-xs hover:bg-[#d4af37]/25 transition-all"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

// ─── Dashboard Tab ──────────────────────────────────────────────────────────

function DashboardTab({
  stats, loading, onRetry,
}: { stats: Stats | null; loading: boolean; onRetry: () => void }) {
  if (loading) return <Loading message="Cargando KPIs…" />;
  if (!stats) return <ErrorBox message="No se pudieron cargar las estadísticas" onRetry={onRetry} />;

  const kpis = [
    {
      label: "Ingreso total",
      value: USD(stats.revenue.total),
      sub: `Cobrado: ${USD(stats.revenue.collected)}`,
      icon: <DollarSign className="w-5 h-5" />,
      accent: "text-[#d4af37]",
      iconBg: "bg-[#d4af37]/10 border-[#d4af37]/30",
      trend: stats.revenue.collected > 0
        ? { dir: "up" as const, label: `${Math.round((stats.revenue.collected / Math.max(stats.revenue.total, 1)) * 100)}% cobrado` }
        : undefined,
    },
    {
      label: "Últimos 30 días",
      value: USD(stats.revenue.last30Days),
      sub: `${stats.totals.sales} ventas totales`,
      icon: <TrendingUp className="w-5 h-5" />,
      accent: "text-emerald-300",
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
      trend: stats.revenue.last30Days > 0
        ? { dir: "up" as const, label: "Actividad reciente" }
        : { dir: "down" as const, label: "Sin ventas recientes" },
    },
    {
      label: "Pendiente cobro",
      value: USD(stats.revenue.pending),
      sub: "Por cobrar",
      icon: <DollarSign className="w-5 h-5" />,
      accent: "text-yellow-300",
      iconBg: "bg-yellow-500/10 border-yellow-500/30",
      trend: stats.revenue.pending > 0
        ? { dir: "down" as const, label: "Requiere seguimiento" }
        : { dir: "up" as const, label: "Todo al día" },
    },
    {
      label: "Conversión DM→Venta",
      value: `${stats.conversion.dmsToSale}%`,
      sub: `${stats.conversion.dmsClosedSold}/${stats.conversion.totalDms} DMs`,
      icon: <Target className="w-5 h-5" />,
      accent: "text-sky-300",
      iconBg: "bg-sky-500/10 border-sky-500/30",
      trend: stats.conversion.dmsToSale >= 30
        ? { dir: "up" as const, label: "Buena conversión" }
        : stats.conversion.dmsToSale > 0
          ? { dir: "down" as const, label: "Mejorable" }
          : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<BarChart3 className="w-4 h-4" />}
        title="Dashboard"
        subtitle="Resumen general del CRM"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-white/[0.03] border border-[#d4af37]/15 hover:border-[#d4af37]/30 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] uppercase tracking-wider text-white/40">{kpi.label}</span>
              <span className={`w-9 h-9 rounded-lg border flex items-center justify-center ${kpi.iconBg} ${kpi.accent}`}>
                {kpi.icon}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-[family-name:var(--font-playfair)] text-white mb-1.5">
              <Gold>{kpi.value}</Gold>
            </div>
            <div className="text-[11px] text-white/40 mb-2">{kpi.sub}</div>
            {kpi.trend && (
              <div className="flex items-center gap-1 text-[10px]">
                {kpi.trend.dir === "up" ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-rose-400" />
                )}
                <span className={kpi.trend.dir === "up" ? "text-emerald-300" : "text-rose-300"}>
                  {kpi.trend.label}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumen por categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Decants por estado */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] shadow-lg shadow-black/20 hover:shadow-[#d4af37]/5 transition-shadow">
          <h3 className="text-sm font-[family-name:var(--font-playfair)] tracking-wide text-[#d4af37] mb-4 flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            Decants por estado
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.decantsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-sm text-white/80 font-medium">{count}</span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/40">Ingreso por decants vendidos</span>
              <Gold>{USD(stats.revenue.decantRevenue)}</Gold>
            </div>
          </div>
        </div>

        {/* Inventario por estado */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] shadow-lg shadow-black/20 hover:shadow-[#d4af37]/5 transition-shadow">
          <h3 className="text-sm font-[family-name:var(--font-playfair)] tracking-wide text-[#d4af37] mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Inventario por estado
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.inventoryByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-sm text-white/80 font-medium">{count}</span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/40">Valor inventario disponible</span>
              <Gold>{USD(stats.revenue.inventoryValueAvailable)}</Gold>
            </div>
          </div>
        </div>

        {/* DMs por estado */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] lg:col-span-2 shadow-lg shadow-black/20 hover:shadow-[#d4af37]/5 transition-shadow">
          <h3 className="text-sm font-[family-name:var(--font-playfair)] tracking-wide text-[#d4af37] mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            DMs / Consultas por estado
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(stats.dmsByStatus).map(([status, count]) => (
              <div key={status} className="flex flex-col items-center p-3 rounded-lg bg-white/[0.02]">
                <StatusBadge status={status} />
                <span className="text-2xl font-[family-name:var(--font-playfair)] text-white mt-2">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Customers Tab ──────────────────────────────────────────────────────────

function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/crm/customers", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("[customers] load error:", err);
      setError("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q) ||
      (c.instagram || "").toLowerCase().includes(q) ||
      (c.tags || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <SectionTitle
        icon={<Users className="w-4 h-4" />}
        title="Clientes"
        subtitle={`${customers.length} clientes registrados`}
        action={
          <button
            onClick={() => { setEditingCustomer(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-sm hover:bg-[#d4af37]/25 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo cliente
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, WhatsApp, Instagram, tags…"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/40 transition-colors"
          />
        </div>
      </div>

      {loading && <Loading message="Cargando clientes…" />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="space-y-2">
          <div className="text-xs text-white/40 mb-2">
            {filtered.length} de {customers.length} clientes
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] shadow-lg shadow-black/20">
              {customers.length === 0 ? (
                <EmptyState
                  icon={<Users className="w-7 h-7" />}
                  title="Aún no tienes clientes registrados"
                  hint="Crea tu primer cliente usando el botón «Nuevo cliente» en la esquina superior derecha."
                />
              ) : (
                <EmptyState
                  icon={<Search className="w-7 h-7" />}
                  title="No se encontraron clientes con ese filtro"
                  hint="Prueba con otro término de búsqueda."
                />
              )}
            </div>
          ) : (
            filtered.map((c, idx) => (
              <div
                key={c.id}
                className={`p-5 rounded-xl border border-white/[0.06] hover:border-[#d4af37]/20 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all ${
                  idx % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.035]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-medium text-white">{c.name}</h3>
                      {c.isVip && (
                        <span className="flex items-center gap-1 text-[10px] text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full border border-[#d4af37]/20">
                          <Crown className="w-3 h-3" /> VIP
                        </span>
                      )}
                      {c.isBlocked && (
                        <span className="flex items-center gap-1 text-[10px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <Ban className="w-3 h-3" /> Bloqueado
                        </span>
                      )}
                      <StatusBadge status={c.channel} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                      {c.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {c.phone}
                        </span>
                      )}
                      {c.instagram && (
                        <span className="flex items-center gap-1">
                          <Instagram className="w-3 h-3" /> {c.instagram}
                        </span>
                      )}
                    </div>
                    {c.preferences && (
                      <p className="text-xs text-white/40 mt-1 italic">Prefiere: {c.preferences}</p>
                    )}
                    {c.tags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.tags.split(",").map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/5">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-base"><Gold>{USD(c.stats.totalSpent)}</Gold></div>
                      <div className="text-[10px] text-white/40">{c.stats.salesCount} ventas</div>
                    </div>
                    <button
                      onClick={() => { setEditingCustomer(c); setShowForm(true); }}
                      className="p-2 rounded-lg hover:bg-[#d4af37]/10 text-white/40 hover:text-[#d4af37] transition-colors border border-transparent hover:border-[#d4af37]/20"
                      title="Editar cliente"
                      aria-label="Editar cliente"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => { setShowForm(false); setEditingCustomer(null); }}
          onSaved={() => { setShowForm(false); setEditingCustomer(null); load(); }}
        />
      )}
    </div>
  );
}

// ─── Customer Form Modal ────────────────────────────────────────────────────

function CustomerFormModal({
  customer, onClose, onSaved,
}: { customer: Customer | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    instagram: customer?.instagram || "",
    channel: customer?.channel || "whatsapp",
    preferences: customer?.preferences || "",
    notes: customer?.notes || "",
    tags: customer?.tags || "",
    isVip: customer?.isVip || false,
    isBlocked: customer?.isBlocked || false,
    blockReason: customer?.blockReason || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ─── Email autocomplete from registered users ─────────────────────────────
  // Fetch /api/admin/users once and offer matching emails as the user types.
  // Selecting one auto-fills the email + name fields.
  const [registeredUsers, setRegisteredUsers] = useState<Array<{ email: string; name: string | null }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const users: Array<{ email: string; name: string | null }> = (data.users || [])
          .filter((u: { email?: string }) => Boolean(u.email))
          .map((u: { email: string; name?: string | null }) => ({ email: u.email, name: u.name ?? null }));
        setRegisteredUsers(users);
      } catch (err) {
        console.error("[customer form] /api/admin/users error:", err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const emailSuggestions = (() => {
    const q = form.email.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return registeredUsers
      .filter((u) => u.email.toLowerCase().includes(q) && u.email.toLowerCase() !== q)
      .slice(0, 6);
  })();

  const channels = ["whatsapp", "instagram", "web", "referred", "other"];

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const url = customer
        ? `/api/admin/crm/customers/${customer.id}`
        : "/api/admin/crm/customers";
      const method = customer ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#d4af37]/15 p-4 flex items-center justify-between">
          <h2 className="text-base font-[family-name:var(--font-playfair)] tracking-wide text-[#d4af37]">
            {customer ? "Editar cliente" : "Nuevo cliente"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/5 text-white/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <Field label="Nombre *">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="crm-input"
              placeholder="Ej: Joel Medina"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Email">
              <div className="relative">
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                  className="crm-input"
                  placeholder="cliente@email.com"
                  type="email"
                  autoComplete="off"
                />
                {showSuggestions && emailSuggestions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-lg border border-[#d4af37]/25 bg-[#0a0a0a] shadow-2xl shadow-black/60">
                    {emailSuggestions.map((u) => (
                      <button
                        key={u.email}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setForm((f) => ({
                            ...f,
                            email: u.email,
                            name: u.name && f.name.trim().length === 0 ? u.name : f.name,
                          }));
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#d4af37]/10 flex items-center gap-2 border-b border-white/5 last:border-b-0"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#d4af37] flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-white truncate">{u.email}</div>
                          {u.name && (
                            <div className="text-[10px] text-white/40 truncate">{u.name}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {registeredUsers.length > 0 && (
                  <p className="text-[10px] text-white/30 mt-1">
                    {registeredUsers.length} usuarios registrados disponibles para autocompletar
                  </p>
                )}
              </div>
            </Field>
            <Field label="WhatsApp">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="crm-input"
                placeholder="+58 412..."
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Instagram">
              <input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="crm-input"
                placeholder="@usuario"
              />
            </Field>
            <Field label="Canal de origen">
              <select
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
                className="crm-input"
              >
                {channels.map((c) => (
                  <option key={c} value={c} className="bg-[#0a0a0a]">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Preferencias olfativas">
            <input
              value={form.preferences}
              onChange={(e) => setForm({ ...form, preferences: e.target.value })}
              className="crm-input"
              placeholder="Ej: dulces, frescas, amaderadas..."
            />
          </Field>

          <Field label="Tags (separados por coma)">
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="crm-input"
              placeholder="Ej: vip, profesor, madrina"
            />
          </Field>

          <Field label="Notas internas">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="crm-input min-h-[80px]"
              placeholder="Notas libres sobre el cliente…"
            />
          </Field>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isVip}
                onChange={(e) => setForm({ ...form, isVip: e.target.checked })}
                className="accent-[#d4af37]"
              />
              <span className="text-sm text-white/80 flex items-center gap-1">
                <Crown className="w-3 h-3 text-[#d4af37]" /> VIP
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isBlocked}
                onChange={(e) => setForm({ ...form, isBlocked: e.target.checked })}
                className="accent-red-500"
              />
              <span className="text-sm text-white/80 flex items-center gap-1">
                <Ban className="w-3 h-3 text-red-400" /> Bloqueado
              </span>
            </label>
          </div>

          {form.isBlocked && (
            <Field label="Razón de bloqueo">
              <input
                value={form.blockReason}
                onChange={(e) => setForm({ ...form, blockReason: e.target.value })}
                className="crm-input"
                placeholder="Ej: no pagó, devolución problemática..."
              />
            </Field>
          )}

          {error && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-[#d4af37]/15 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || form.name.trim().length < 2}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-black text-sm font-medium hover:bg-[#e8cc6e] hover:shadow-lg hover:shadow-[#d4af37]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {customer ? "Guardar cambios" : "Crear cliente"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ─── Sales Tab ──────────────────────────────────────────────────────────────

function SalesTab() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [decants, setDecants] = useState<Decant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [salesRes, custRes, invRes, decRes] = await Promise.all([
        fetch("/api/admin/crm/sales", { cache: "no-store" }),
        fetch("/api/admin/crm/customers", { cache: "no-store" }),
        fetch("/api/admin/crm/inventory", { cache: "no-store" }),
        fetch("/api/admin/crm/decants", { cache: "no-store" }),
      ]);
      const salesData = await salesRes.json();
      const custData = await custRes.json();
      const invData = await invRes.json();
      const decData = await decRes.json();
      if (!salesRes.ok) throw new Error(salesData.error);
      setSales(salesData.sales || []);
      setCustomers(custData.customers || []);
      setInventory((invData.items || []).filter((i: InventoryItem) => i.status === "available"));
      setDecants((decData.decants || []).filter((d: Decant) => d.status === "available"));
    } catch (err) {
      console.error("[sales] load error:", err);
      setError("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta venta? El item volverá a estar disponible.")) return;
    try {
      await fetch(`/api/admin/crm/sales/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      console.error("[sale delete]", err);
    }
  };

  const total = sales.reduce((s, x) => s + x.totalPrice, 0);
  const paid = sales.reduce((s, x) => s + x.paid, 0);
  const pending = sales.reduce((s, x) => s + x.pending, 0);

  // Safety: ensure sales are sorted by saleDate DESC (the API already does
  // ORDER BY saleDate DESC, but this guarantees correct order in the UI even
  // if the API ever changes — and when items are mutated locally).
  const sortedSales = [...sales].sort(
    (a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
  );

  return (
    <div>
      <SectionTitle
        icon={<ShoppingBag className="w-4 h-4" />}
        title="Ventas"
        subtitle={`${sales.length} ventas registradas`}
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-sm hover:bg-[#d4af37]/25 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar venta
          </button>
        }
      />

      {/* Stats resumen */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-[#d4af37]/15">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Total</div>
          <div className="text-lg font-[family-name:var(--font-playfair)]"><Gold>{USD(total)}</Gold></div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="text-[10px] uppercase tracking-wider text-emerald-300/60 mb-1">Pagado</div>
          <div className="text-lg font-[family-name:var(--font-playfair)] text-emerald-300">{USD(paid)}</div>
        </div>
        <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
          <div className="text-[10px] uppercase tracking-wider text-yellow-300/60 mb-1">Pendiente</div>
          <div className="text-lg font-[family-name:var(--font-playfair)] text-yellow-300">{USD(pending)}</div>
        </div>
      </div>

      {loading && <Loading message="Cargando ventas…" />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="space-y-2">
          {sortedSales.length === 0 ? (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] shadow-lg shadow-black/20">
              <EmptyState
                icon={<ShoppingBag className="w-7 h-7" />}
                title="Aún no hay ventas registradas"
                hint="Usa «Registrar venta» para crear tu primera venta. Podrás vincular inventario o decants disponibles."
              />
            </div>
          ) : (
            sortedSales.map((s, idx) => (
              <div
                key={s.id}
                className={`p-5 rounded-xl border border-white/[0.06] hover:border-[#d4af37]/20 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all ${
                  idx % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.035]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-medium text-white">{s.itemName}</h3>
                      <StatusBadge status={s.itemType} />
                      <StatusBadge status={s.paymentStatus} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                      <span>Cliente: {s.customer?.name || "—"}</span>
                      <span>Fecha: {fmtDate(s.saleDate)}</span>
                      <span>Cantidad: {s.quantity}</span>
                      {s.paymentMethod && <span>Pago: {s.paymentMethod}</span>}
                    </div>
                    {s.notes && <p className="text-xs text-white/40 mt-1 italic">{s.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-base"><Gold>{USD(s.totalPrice)}</Gold></div>
                      <div className="text-[10px] text-white/40">
                        Pagado: {USD(s.paid)}{s.pending > 0 && ` · Pend: ${USD(s.pending)}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 rounded-lg hover:bg-rose-500/10 text-white/40 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-500/20"
                      title="Eliminar venta"
                      aria-label="Eliminar venta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <SaleFormModal
          customers={customers}
          inventory={inventory}
          decants={decants}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function SaleFormModal({
  customers, inventory, decants, onClose, onSaved,
}: {
  customers: Customer[];
  inventory: InventoryItem[];
  decants: Decant[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    customerId: "",
    itemType: "botella" as "botella" | "decant" | "combo" | "asesoramiento",
    inventoryItemId: "",
    decantId: "",
    itemName: "",
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    paid: 0,
    paymentMethod: "efectivo",
    deliveryMethod: "pickup",
    deliveryCost: 0,
    notes: "",
    saleDate: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill cuando se selecciona un item
  useEffect(() => {
    if (form.itemType === "botella" && form.inventoryItemId) {
      const item = inventory.find((i) => i.id === form.inventoryItemId);
      if (item) {
        setForm((f) => ({
          ...f,
          itemName: `${item.name}${item.size ? ` ${item.size}` : ""}`,
          unitPrice: item.price,
          totalPrice: item.price * f.quantity,
          paid: item.price * f.quantity,
        }));
      }
    } else if (form.itemType === "decant" && form.decantId) {
      const dec = decants.find((d) => d.id === form.decantId);
      if (dec) {
        setForm((f) => ({
          ...f,
          itemName: `Decant ${dec.sizeMl}ml - ${dec.sourcePerfume}`,
          unitPrice: dec.price,
          totalPrice: dec.price * f.quantity,
          paid: dec.price * f.quantity,
        }));
      }
    }
  }, [form.inventoryItemId, form.decantId, form.itemType, inventory, decants]);

  // Recalcular total cuando cambia cantidad o unitPrice
  useEffect(() => {
    setForm((f) => ({
      ...f,
      totalPrice: f.unitPrice * f.quantity,
      paid: f.unitPrice * f.quantity,
    }));
  }, [form.unitPrice, form.quantity]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (!form.customerId) throw new Error("Selecciona un cliente");
      if (!form.itemName.trim()) throw new Error("Nombre del producto es obligatorio");

      const body: Record<string, unknown> = {
        customerId: form.customerId,
        itemType: form.itemType,
        itemName: form.itemName,
        quantity: form.quantity,
        unitPrice: form.unitPrice,
        totalPrice: form.totalPrice,
        paid: form.paid,
        pending: Math.max(0, form.totalPrice - form.paid),
        paymentMethod: form.paymentMethod,
        deliveryMethod: form.deliveryMethod,
        deliveryCost: form.deliveryCost > 0 ? form.deliveryCost : null,
        notes: form.notes,
        saleDate: new Date(form.saleDate).toISOString(),
      };
      if (form.itemType === "botella" && form.inventoryItemId) body.inventoryItemId = form.inventoryItemId;
      if (form.itemType === "decant" && form.decantId) body.decantId = form.decantId;

      const res = await fetch("/api/admin/crm/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#d4af37]/15 p-4 flex items-center justify-between">
          <h2 className="text-base font-[family-name:var(--font-playfair)] tracking-wide text-[#d4af37]">Registrar nueva venta</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/5 text-white/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <Field label="Cliente *">
            <select
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="crm-input"
            >
              <option value="" className="bg-[#0a0a0a]">— Selecciona cliente —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0a0a0a]">
                  {c.name}{c.isVip ? " ★" : ""}{c.isBlocked ? " [BLOQUEADO]" : ""}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo *">
              <select
                value={form.itemType}
                onChange={(e) => setForm({ ...form, itemType: e.target.value as typeof form.itemType, inventoryItemId: "", decantId: "" })}
                className="crm-input"
              >
                <option value="botella" className="bg-[#0a0a0a]">Botella (inventario)</option>
                <option value="decant" className="bg-[#0a0a0a]">Decant 10ml</option>
                <option value="combo" className="bg-[#0a0a0a]">Combo</option>
                <option value="asesoramiento" className="bg-[#0a0a0a]">Asesoramiento</option>
              </select>
            </Field>
            <Field label="Cantidad">
              <input
                type="number"
                min={1}
                value={form.quantity || ""}
                onChange={(e) => setForm({ ...form, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                className="crm-input"
              />
            </Field>
          </div>

          {form.itemType === "botella" && (
            <Field label="Producto de inventario (opcional)">
              <select
                value={form.inventoryItemId}
                onChange={(e) => setForm({ ...form, inventoryItemId: e.target.value })}
                className="crm-input"
              >
                <option value="" className="bg-[#0a0a0a]">— Selecciona item disponible —</option>
                {inventory.map((i) => (
                  <option key={i.id} value={i.id} className="bg-[#0a0a0a]">
                    {i.name}{i.size ? ` ${i.size}` : ""} · {USD(i.price)}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {form.itemType === "decant" && (
            <Field label="Decant disponible (opcional)">
              <select
                value={form.decantId}
                onChange={(e) => setForm({ ...form, decantId: e.target.value })}
                className="crm-input"
              >
                <option value="" className="bg-[#0a0a0a]">— Selecciona decant disponible —</option>
                {decants.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#0a0a0a]">
                    {d.sourcePerfume} · {d.sizeMl}ml · {USD(d.price)}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Nombre del producto *">
            <input
              value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
              className="crm-input"
              placeholder="Ej: Cool Water 100ml"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Precio unit. *">
              <input
                type="number"
                step="0.01"
                value={form.unitPrice || ""}
                onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })}
                className="crm-input"
              />
            </Field>
            <Field label="Total">
              <input
                type="number"
                step="0.01"
                value={form.totalPrice || ""}
                onChange={(e) => setForm({ ...form, totalPrice: parseFloat(e.target.value) || 0 })}
                className="crm-input"
              />
            </Field>
            <Field label="Pagado">
              <input
                type="number"
                step="0.01"
                value={form.paid || ""}
                onChange={(e) => setForm({ ...form, paid: parseFloat(e.target.value) || 0 })}
                className="crm-input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Método de pago">
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="crm-input"
              >
                <option value="efectivo" className="bg-[#0a0a0a]">Efectivo</option>
                <option value="pago_movil" className="bg-[#0a0a0a]">Pago móvil</option>
                <option value="zelle" className="bg-[#0a0a0a]">Zelle</option>
                <option value="binance" className="bg-[#0a0a0a]">Binance</option>
                <option value="otro" className="bg-[#0a0a0a]">Otro</option>
              </select>
            </Field>
            <Field label="Entrega">
              <select
                value={form.deliveryMethod}
                onChange={(e) => setForm({ ...form, deliveryMethod: e.target.value })}
                className="crm-input"
              >
                <option value="pickup" className="bg-[#0a0a0a]">Recogida</option>
                <option value="delivery" className="bg-[#0a0a0a]">Delivery propio</option>
                <option value="envio" className="bg-[#0a0a0a]">Envío (Zoom/MRW)</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Costo envío (USD)">
              <input
                type="number"
                step="0.01"
                value={form.deliveryCost || ""}
                onChange={(e) => setForm({ ...form, deliveryCost: parseFloat(e.target.value) || 0 })}
                className="crm-input"
              />
            </Field>
            <Field label="Fecha de venta">
              <input
                type="date"
                value={form.saleDate}
                onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
                className="crm-input"
              />
            </Field>
          </div>

          <Field label="Notas">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="crm-input min-h-[60px]"
              placeholder="Notas sobre la venta…"
            />
          </Field>

          {error && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-[#d4af37]/15 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-black text-sm font-medium hover:bg-[#e8cc6e] hover:shadow-lg hover:shadow-[#d4af37]/20 disabled:opacity-40 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Registrar venta
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Decants Tab ────────────────────────────────────────────────────────────

function DecantsTab() {
  const [decants, setDecants] = useState<Decant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDecant, setEditingDecant] = useState<Decant | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/crm/decants", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDecants(data.decants || []);
    } catch (err) {
      console.error("[decants] load error:", err);
      setError("Error al cargar decants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/crm/decants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      load();
    } catch (err) {
      console.error("[decant status]", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este decant?")) return;
    try {
      await fetch(`/api/admin/crm/decants/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      console.error("[decant delete]", err);
    }
  };

  const filtered = filterStatus === "all"
    ? decants
    : decants.filter((d) => d.status === filterStatus);

  const statusCounts: Record<string, number> = { all: decants.length };
  decants.forEach((d) => { statusCounts[d.status] = (statusCounts[d.status] || 0) + 1; });

  return (
    <div>
      <SectionTitle
        icon={<FlaskConical className="w-4 h-4" />}
        title="Decants"
        subtitle={`${decants.length} decants registrados`}
        action={
          <button
            onClick={() => { setEditingDecant(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-sm hover:bg-[#d4af37]/25 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo decant
          </button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-1">
          <FilterPill active={filterStatus === "all"} onClick={() => setFilterStatus("all")} label={`Todos (${statusCounts.all})`} />
          {["pending", "filled", "available", "reserved", "sold"].map((s) => (
            <FilterPill
              key={s}
              active={filterStatus === s}
              onClick={() => setFilterStatus(s)}
              label={`${DECANT_STATUS_LABELS[s]?.label || s} (${statusCounts[s] || 0})`}
            />
          ))}
        </div>
      </div>

      {loading && <Loading message="Cargando decants…" />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-xl bg-white/[0.02] border border-white/[0.06] shadow-lg shadow-black/20">
              {decants.length === 0 ? (
                <EmptyState
                  icon={<FlaskConical className="w-7 h-7" />}
                  title="Aún no tienes decants registrados"
                  hint="Crea tu primer lote de decants con «Nuevo decant» en la esquina superior derecha."
                />
              ) : (
                <EmptyState
                  icon={<Filter className="w-7 h-7" />}
                  title="No hay decants con este filtro"
                  hint="Cambia el filtro para ver otros estados."
                />
              )}
            </div>
          ) : (
            filtered.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#d4af37]/20 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{d.sourcePerfume}</h3>
                    {d.sourceBrand && <p className="text-[10px] text-white/40">{d.sourceBrand}</p>}
                    {d.olfativeProfile && <p className="text-[10px] text-white/40 italic">{d.olfativeProfile}</p>}
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="text-xs text-white/50 space-y-0.5 mb-3 flex-1">
                  <div>Tamaño: {d.sizeMl}ml · Precio: <Gold>{USD(d.price)}</Gold></div>
                  {d.filledAt && <div>Llenado: {fmtDate(d.filledAt)}</div>}
                  {d.soldAt && <div>Vendido: {fmtDate(d.soldAt)}</div>}
                  {d.customer?.name && <div>Cliente: {d.customer.name}</div>}
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={d.status}
                    onChange={(e) => handleStatusChange(d.id, e.target.value)}
                    className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white"
                  >
                    <option value="pending" className="bg-[#0a0a0a]">Pendiente llenar</option>
                    <option value="filled" className="bg-[#0a0a0a]">Lleno - Disponible</option>
                    <option value="available" className="bg-[#0a0a0a]">Disponible</option>
                    <option value="reserved" className="bg-[#0a0a0a]">Reservado</option>
                    <option value="sold" className="bg-[#0a0a0a]">Vendido</option>
                  </select>
                  <button
                    onClick={() => { setEditingDecant(d); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-[#d4af37]/10 text-white/40 hover:text-[#d4af37] border border-transparent hover:border-[#d4af37]/20 transition-colors"
                    title="Editar decant"
                    aria-label="Editar decant"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/40 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition-colors"
                    title="Eliminar decant"
                    aria-label="Eliminar decant"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <DecantFormModal
          decant={editingDecant}
          onClose={() => { setShowForm(false); setEditingDecant(null); }}
          onSaved={() => { setShowForm(false); setEditingDecant(null); load(); }}
        />
      )}
    </div>
  );
}

function DecantFormModal({
  decant, onClose, onSaved,
}: { decant: Decant | null; onClose: () => void; onSaved: () => void }) {
  const isEditing = !!decant;
  const [form, setForm] = useState({
    sourcePerfume: decant?.sourcePerfume || "",
    sourceBrand: decant?.sourceBrand || "",
    olfativeProfile: decant?.olfativeProfile || "",
    sizeMl: decant?.sizeMl ?? 10,
    price: decant?.price ?? 12,
    cost: decant?.cost ?? 0,
    status: decant?.status || "pending",
    count: 1,
    notes: decant?.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (!form.sourcePerfume.trim()) throw new Error("Nombre del perfume fuente es obligatorio");

      const payload = {
        sourcePerfume: form.sourcePerfume.trim(),
        sourceBrand: form.sourceBrand || null,
        olfativeProfile: form.olfativeProfile || null,
        sizeMl: form.sizeMl,
        price: form.price,
        cost: form.cost > 0 ? form.cost : null,
        status: form.status,
        notes: form.notes || null,
        // `count` only used for batch create.
        count: form.count,
      };

      const url = isEditing ? `/api/admin/crm/decants/${decant!.id}` : "/api/admin/crm/decants";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#d4af37]/15 p-4 flex items-center justify-between">
          <h2 className="text-base font-[family-name:var(--font-playfair)] tracking-wide text-[#d4af37]">
            {isEditing ? "Editar decant" : "Crear decants (lote)"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/5 text-white/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <Field label="Perfume fuente *">
            <input
              value={form.sourcePerfume}
              onChange={(e) => setForm({ ...form, sourcePerfume: e.target.value })}
              className="crm-input"
              placeholder="Ej: Qissa Pink"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca">
              <input
                value={form.sourceBrand}
                onChange={(e) => setForm({ ...form, sourceBrand: e.target.value })}
                className="crm-input"
                placeholder="Ej: Paris Corner"
              />
            </Field>
            <Field label="Perfil olfativo">
              <input
                value={form.olfativeProfile}
                onChange={(e) => setForm({ ...form, olfativeProfile: e.target.value })}
                className="crm-input"
                placeholder="Ej: Dulce / Floral"
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Tamaño (ml)">
              <input
                type="number"
                value={form.sizeMl || ""}
                onChange={(e) => setForm({ ...form, sizeMl: parseInt(e.target.value) || 10 })}
                className="crm-input"
              />
            </Field>
            <Field label="Precio venta (USD)">
              <input
                type="number"
                step="0.01"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="crm-input"
              />
            </Field>
            <Field label="Costo (USD)">
              <input
                type="number"
                step="0.01"
                value={form.cost || ""}
                onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
                className="crm-input"
              />
            </Field>
          </div>
          {isEditing ? (
            <Field label="Estado">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="crm-input"
              >
                <option value="pending" className="bg-[#0a0a0a]">Pendiente llenar</option>
                <option value="filled" className="bg-[#0a0a0a]">Lleno - Disponible</option>
                <option value="available" className="bg-[#0a0a0a]">Disponible</option>
                <option value="reserved" className="bg-[#0a0a0a]">Reservado</option>
                <option value="sold" className="bg-[#0a0a0a]">Vendido</option>
              </select>
            </Field>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cantidad a crear">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={form.count}
                  onChange={(e) => setForm({ ...form, count: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="crm-input"
                />
              </Field>
              <Field label="Estado inicial">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="crm-input"
                >
                  <option value="pending" className="bg-[#0a0a0a]">Pendiente llenar</option>
                  <option value="filled" className="bg-[#0a0a0a]">Lleno - Disponible</option>
                </select>
              </Field>
            </div>
          )}
          <Field label="Notas">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="crm-input min-h-[60px]"
            />
          </Field>

          {error && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-[#d4af37]/15 p-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-black text-sm font-medium hover:bg-[#e8cc6e] hover:shadow-lg hover:shadow-[#d4af37]/20 disabled:opacity-40 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isEditing ? "Guardar cambios" : `Crear ${form.count} decant${form.count > 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inventory Tab ──────────────────────────────────────────────────────────

function InventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    created: number;
    updated: number;
    skipped: number;
    total: number;
  } | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/crm/inventory", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(data.items || []);
    } catch (err) {
      console.error("[inventory] load error:", err);
      setError("Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/crm/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      load();
    } catch (err) {
      console.error("[inv status]", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este item del inventario?")) return;
    try {
      await fetch(`/api/admin/crm/inventory/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      console.error("[inv delete]", err);
    }
  };

  const handleSyncCatalog = async () => {
    if (
      !confirm(
        "¿Sincronizar el inventario del CRM con el catálogo web?\n\n" +
          "• Los perfumes con precio se agregarán/actualizarán.\n" +
          "• No se sobrescribirán los items vendidos.\n" +
          "• Los items existentes se actualizan precio + tamaño + perfil olfativo."
      )
    )
      return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/crm/inventory/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al sincronizar");
      setSyncResult({
        created: data.summary?.created ?? 0,
        updated: data.summary?.updated ?? 0,
        skipped: data.summary?.withoutPrice ?? 0,
        total: data.summary?.catalogTotal ?? 0,
      });
      load();
    } catch (err) {
      console.error("[inv sync]", err);
      setError(
        err instanceof Error ? err.message : "Error al sincronizar con catálogo"
      );
    } finally {
      setSyncing(false);
    }
  };

  const filtered = filterStatus === "all"
    ? items
    : items.filter((i) => i.status === filterStatus);

  const totalValue = items
    .filter((i) => i.status === "available")
    .reduce((s, i) => s + i.price, 0);

  return (
    <div>
      <SectionTitle
        icon={<Package className="w-4 h-4" />}
        title="Inventario"
        subtitle={`${items.length} items · Valor disponible: ${USD(totalValue)}`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncCatalog}
              disabled={syncing}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-[#d4af37]/20 text-white/80 text-xs hover:bg-white/[0.07] hover:border-[#d4af37]/40 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Crea/actualiza items desde el catálogo de perfumes de la web"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Sincronizando…" : "Sincronizar con catálogo"}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-sm hover:bg-[#d4af37]/25 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo item
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-1 mb-4">
        <FilterPill active={filterStatus === "all"} onClick={() => setFilterStatus("all")} label="Todos" />
        <FilterPill active={filterStatus === "available"} onClick={() => setFilterStatus("available")} label="Disponibles" />
        <FilterPill active={filterStatus === "reserved"} onClick={() => setFilterStatus("reserved")} label="Reservados" />
        <FilterPill active={filterStatus === "sold"} onClick={() => setFilterStatus("sold")} label="Vendidos" />
      </div>

      {syncResult && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2 shadow-lg shadow-black/20">
          <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Sincronización completa.</strong>{" "}
            Catálogo: {syncResult.total} perfumes.{" "}
            Creados: {syncResult.created}. Actualizados: {syncResult.updated}.{" "}
            Sin precio (ignorados): {syncResult.skipped}.
          </div>
          <button
            onClick={() => setSyncResult(null)}
            className="ml-auto text-emerald-200/60 hover:text-emerald-200"
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {loading && <Loading message="Cargando inventario…" />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] shadow-lg shadow-black/20">
              {items.length === 0 ? (
                <EmptyState
                  icon={<Package className="w-7 h-7" />}
                  title="Aún no tienes items en inventario"
                  hint="Crea items manualmente o sincroniza el catálogo con el botón superior derecho."
                />
              ) : (
                <EmptyState
                  icon={<Filter className="w-7 h-7" />}
                  title="No hay items con este filtro"
                  hint="Cambia el filtro para ver otros estados."
                />
              )}
            </div>
          ) : (
            filtered.map((i, idx) => (
              <div
                key={i.id}
                className={`p-5 rounded-xl border border-white/[0.06] hover:border-[#d4af37]/20 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all ${
                  idx % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.035]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-medium text-white">{i.name}</h3>
                      {i.size && <span className="text-[10px] text-white/40">{i.size}</span>}
                      <StatusBadge status={i.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                      {i.brand && <span>Marca: {i.brand}</span>}
                      {i.olfativeProfile && <span>Perfil: {i.olfativeProfile}</span>}
                      {i.cost != null && <span>Costo: {USD(i.cost)}</span>}
                    </div>
                    {i.customerInterest && (
                      <p className="text-xs text-white/40 mt-1 italic">Cliente potencial: {i.customerInterest}</p>
                    )}
                    {i.notes && <p className="text-xs text-white/40 mt-1 italic">{i.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-base"><Gold>{USD(i.price)}</Gold></div>
                      {i.cost != null && (
                        <div className="text-[10px] text-emerald-300">
                          Margen: {USD(i.price - i.cost)} ({(((i.price - i.cost) / i.price) * 100).toFixed(0)}%)
                        </div>
                      )}
                    </div>
                    <select
                      value={i.status}
                      onChange={(e) => handleStatusChange(i.id, e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white"
                    >
                      <option value="available" className="bg-[#0a0a0a]">Disponible</option>
                      <option value="reserved" className="bg-[#0a0a0a]">Reservado</option>
                      <option value="sold" className="bg-[#0a0a0a]">Vendido</option>
                    </select>
                    <button
                      onClick={() => setEditingItem(i)}
                      className="p-2 rounded-lg hover:bg-[#d4af37]/10 text-white/40 hover:text-[#d4af37] border border-transparent hover:border-[#d4af37]/20 transition-colors"
                      title="Editar item"
                      aria-label="Editar item"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(i.id)}
                      className="p-2 rounded-lg hover:bg-rose-500/10 text-white/40 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition-colors"
                      title="Eliminar item"
                      aria-label="Eliminar item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <InventoryFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
      {editingItem && (
        <InventoryFormModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => { setEditingItem(null); load(); }}
        />
      )}
    </div>
  );
}

function InventoryFormModal({ onClose, onSaved, item }: { onClose: () => void; onSaved: () => void; item?: InventoryItem | null }) {
  const isEditing = !!item;
  const [form, setForm] = useState({
    name: item?.name || "",
    brand: item?.brand || "",
    olfativeProfile: item?.olfativeProfile || "",
    size: item?.size || "",
    cost: item?.cost || 0,
    price: item?.price || 0,
    customerInterest: item?.customerInterest || "",
    notes: item?.notes || "",
    status: item?.status || "available",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (!form.name.trim()) throw new Error("Nombre es obligatorio");
      if (form.price <= 0) throw new Error("Precio debe ser mayor a 0");
      const payload = {
        ...form,
        brand: form.brand || null,
        olfativeProfile: form.olfativeProfile || null,
        size: form.size || null,
        cost: form.cost > 0 ? form.cost : null,
        customerInterest: form.customerInterest || null,
        notes: form.notes || null,
      };
      const url = isEditing ? `/api/admin/crm/inventory/${item!.id}` : "/api/admin/crm/inventory";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#d4af37]/15 p-4 flex items-center justify-between">
          <h2 className="text-base font-[family-name:var(--font-playfair)] tracking-wide text-[#d4af37]">
            {isEditing ? "Editar item de inventario" : "Nuevo item de inventario"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/5 text-white/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <Field label="Nombre *">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="crm-input"
              placeholder="Ej: Cool Water"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca">
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="crm-input"
                placeholder="Ej: Davidoff"
              />
            </Field>
            <Field label="Tamaño">
              <input
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="crm-input"
                placeholder="Ej: 100ml"
              />
            </Field>
          </div>
          <Field label="Perfil olfativo">
            <input
              value={form.olfativeProfile}
              onChange={(e) => setForm({ ...form, olfativeProfile: e.target.value })}
              className="crm-input"
              placeholder="Ej: Fresco / Acuático"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Costo (USD)">
              <input
                type="number"
                step="0.01"
                value={form.cost || ""}
                onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
                className="crm-input"
              />
            </Field>
            <Field label="Precio venta (USD) *">
              <input
                type="number"
                step="0.01"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="crm-input"
              />
            </Field>
          </div>
          {isEditing && (
            <Field label="Estado">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="crm-input"
              >
                <option value="available" className="bg-[#0a0a0a]">Disponible</option>
                <option value="reserved" className="bg-[#0a0a0a]">Reservado</option>
                <option value="sold" className="bg-[#0a0a0a]">Vendido</option>
              </select>
            </Field>
          )}
          <Field label="Cliente potencial">
            <input
              value={form.customerInterest}
              onChange={(e) => setForm({ ...form, customerInterest: e.target.value })}
              className="crm-input"
              placeholder="Ej: Padres (perfil fresco)"
            />
          </Field>
          <Field label="Notas">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="crm-input min-h-[60px]"
            />
          </Field>

          {error && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-[#d4af37]/15 p-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-black text-sm font-medium hover:bg-[#e8cc6e] hover:shadow-lg hover:shadow-[#d4af37]/20 disabled:opacity-40 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isEditing ? "Guardar cambios" : "Crear item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DMs Tab ────────────────────────────────────────────────────────────────

function DmsTab() {
  const [dms, setDms] = useState<Dm[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDm, setEditingDm] = useState<Dm | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dmsRes, custRes] = await Promise.all([
        fetch("/api/admin/crm/dms", { cache: "no-store" }),
        fetch("/api/admin/crm/customers", { cache: "no-store" }),
      ]);
      const dmsData = await dmsRes.json();
      const custData = await custRes.json();
      if (!dmsRes.ok) throw new Error(dmsData.error);
      setDms(dmsData.dms || []);
      setCustomers(custData.customers || []);
    } catch (err) {
      console.error("[dms] load error:", err);
      setError("Error al cargar DMs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/crm/dms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      load();
    } catch (err) {
      console.error("[dm status]", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este DM?")) return;
    try {
      await fetch(`/api/admin/crm/dms/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      console.error("[dm delete]", err);
    }
  };

  const filtered = filterStatus === "all"
    ? dms
    : dms.filter((d) => d.status === filterStatus);

  // Safety: ensure DMs are sorted by receivedAt DESC (the API already does
  // ORDER BY receivedAt DESC, but this guarantees correct order in the UI even
  // if the API ever changes — and when items are mutated locally). All DMs
  // stay in the same list regardless of when they arrived; the most recent
  // ones appear at the top.
  const sortedDms = [...filtered].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );

  return (
    <div>
      <SectionTitle
        icon={<MessageSquare className="w-4 h-4" />}
        title="DMs y Consultas"
        subtitle={`${dms.length} DMs / consultas registrados`}
        action={
          <button
            onClick={() => { setEditingDm(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-sm hover:bg-[#d4af37]/25 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar DM
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-1 mb-4">
        <FilterPill active={filterStatus === "all"} onClick={() => setFilterStatus("all")} label="Todos" />
        <FilterPill active={filterStatus === "new"} onClick={() => setFilterStatus("new")} label="Nuevas" />
        <FilterPill active={filterStatus === "in_conversation"} onClick={() => setFilterStatus("in_conversation")} label="En conversación" />
        <FilterPill active={filterStatus === "pending"} onClick={() => setFilterStatus("pending")} label="Pendientes" />
        <FilterPill active={filterStatus === "closed_sold"} onClick={() => setFilterStatus("closed_sold")} label="Cerradas - Venta" />
        <FilterPill active={filterStatus === "closed_no_sale"} onClick={() => setFilterStatus("closed_no_sale")} label="Cerradas - No venta" />
      </div>

      {loading && <Loading message="Cargando DMs…" />}
      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="space-y-2">
          {sortedDms.length === 0 ? (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] shadow-lg shadow-black/20">
              {dms.length === 0 ? (
                <EmptyState
                  icon={<MessageSquare className="w-7 h-7" />}
                  title="Aún no tienes DMs registrados"
                  hint="Registra cada consulta que llega por WhatsApp, Instagram o la web con «Registrar DM» en la esquina superior derecha."
                />
              ) : (
                <EmptyState
                  icon={<Filter className="w-7 h-7" />}
                  title="No hay DMs con este filtro"
                  hint="Cambia el filtro para ver otros estados."
                />
              )}
            </div>
          ) : (
            sortedDms.map((d, idx) => (
              <div
                key={d.id}
                className={`p-5 rounded-xl border border-white/[0.06] hover:border-[#d4af37]/20 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all ${
                  idx % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.035]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={d.platform} />
                      <StatusBadge status={d.status} />
                      <span className="text-[10px] text-white/40">{fmtDateTime(d.receivedAt)}</span>
                    </div>
                    <div className="text-sm text-white mb-1 font-medium">
                      {d.username || d.customer?.name || "Anónimo"}
                      {d.customer?.name && d.username && (
                        <span className="text-[10px] text-white/40 ml-1">→ {d.customer.name}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                      <span>Tipo: {d.inquiryType}</span>
                      {d.fragranceInterest && <span>Interés: {d.fragranceInterest}</span>}
                      {d.followUpDate && <span className="text-yellow-300">Seguimiento: {fmtDate(d.followUpDate)}</span>}
                    </div>
                    {d.nextStep && (
                      <p className="text-xs text-[#d4af37] mt-1">→ {d.nextStep}</p>
                    )}
                    {d.result && (
                      <p className="text-xs text-emerald-300 mt-1 italic">✓ {d.result}</p>
                    )}
                    {d.notes && <p className="text-xs text-white/40 mt-1 italic">{d.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <select
                      value={d.status}
                      onChange={(e) => handleStatusChange(d.id, e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white"
                    >
                      <option value="new" className="bg-[#0a0a0a]">Nueva</option>
                      <option value="in_conversation" className="bg-[#0a0a0a]">En conversación</option>
                      <option value="pending" className="bg-[#0a0a0a]">Pendiente</option>
                      <option value="closed_sold" className="bg-[#0a0a0a]">Cerrada - Venta</option>
                      <option value="closed_no_sale" className="bg-[#0a0a0a]">Cerrada - No venta</option>
                      <option value="no_reply" className="bg-[#0a0a0a]">No respondió</option>
                    </select>
                    <button
                      onClick={() => { setEditingDm(d); setShowForm(true); }}
                      className="p-2 rounded-lg hover:bg-[#d4af37]/10 text-white/40 hover:text-[#d4af37] border border-transparent hover:border-[#d4af37]/20 transition-colors"
                      title="Editar DM"
                      aria-label="Editar DM"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-2 rounded-lg hover:bg-rose-500/10 text-white/40 hover:text-rose-300 border border-transparent hover:border-rose-500/20 transition-colors"
                      title="Eliminar DM"
                      aria-label="Eliminar DM"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <DmFormModal
          customers={customers}
          dm={editingDm}
          onClose={() => { setShowForm(false); setEditingDm(null); }}
          onSaved={() => { setShowForm(false); setEditingDm(null); load(); }}
        />
      )}
    </div>
  );
}

function DmFormModal({
  customers, dm, onClose, onSaved,
}: { customers: Customer[]; dm: Dm | null; onClose: () => void; onSaved: () => void }) {
  const isEditing = !!dm;
  const [form, setForm] = useState({
    platform: dm?.platform || "whatsapp",
    customerId: dm?.customerId || "",
    username: dm?.username || "",
    fragranceInterest: dm?.fragranceInterest || "",
    inquiryType: dm?.inquiryType || "compra",
    status: dm?.status || "new",
    nextStep: dm?.nextStep || "",
    followUpDate: dm?.followUpDate ? dm.followUpDate.split("T")[0] : "",
    notes: dm?.notes || "",
    receivedAt: dm?.receivedAt
      ? dm.receivedAt.split("T")[0]
      : new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        platform: form.platform,
        customerId: form.customerId || null,
        username: form.username || null,
        fragranceInterest: form.fragranceInterest || null,
        inquiryType: form.inquiryType,
        status: form.status,
        nextStep: form.nextStep || null,
        followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : null,
        notes: form.notes || null,
        // For new DMs, send receivedAt so the API sets it.
        // For edits, the PUT route ignores receivedAt (preserves the original arrival date).
        ...(isEditing ? {} : { receivedAt: new Date(form.receivedAt).toISOString() }),
      };

      const url = isEditing ? `/api/admin/crm/dms/${dm!.id}` : "/api/admin/crm/dms";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-[#d4af37]/30 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#d4af37]/15 p-4 flex items-center justify-between">
          <h2 className="text-base font-[family-name:var(--font-playfair)] tracking-wide text-[#d4af37]">
            {isEditing ? "Editar DM / Consulta" : "Registrar DM / Consulta"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/5 text-white/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plataforma *">
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="crm-input"
              >
                <option value="whatsapp" className="bg-[#0a0a0a]">WhatsApp</option>
                <option value="instagram" className="bg-[#0a0a0a]">Instagram</option>
                <option value="web" className="bg-[#0a0a0a]">Web</option>
                <option value="other" className="bg-[#0a0a0a]">Otro</option>
              </select>
            </Field>
            <Field label="Tipo de consulta *">
              <select
                value={form.inquiryType}
                onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
                className="crm-input"
              >
                <option value="compra" className="bg-[#0a0a0a]">Compra directa</option>
                <option value="recomendacion" className="bg-[#0a0a0a]">Recomendación</option>
                <option value="precio" className="bg-[#0a0a0a]">Precio</option>
                <option value="stock" className="bg-[#0a0a0a]">Stock</option>
                <option value="asesoramiento" className="bg-[#0a0a0a]">Asesoramiento</option>
                <option value="otro" className="bg-[#0a0a0a]">Otro</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Usuario / @handle">
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="crm-input"
                placeholder="@usuario o nombre"
              />
            </Field>
            <Field label="Cliente vinculado">
              <select
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                className="crm-input"
              >
                <option value="" className="bg-[#0a0a0a]">— Sin vincular —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0a0a0a]">
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Perfume de interés">
            <input
              value={form.fragranceInterest}
              onChange={(e) => setForm({ ...form, fragranceInterest: e.target.value })}
              className="crm-input"
              placeholder="Ej: Rasasi Hawas"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estado">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="crm-input"
              >
                <option value="new" className="bg-[#0a0a0a]">Nueva</option>
                <option value="in_conversation" className="bg-[#0a0a0a]">En conversación</option>
                <option value="pending" className="bg-[#0a0a0a]">Pendiente</option>
                <option value="closed_sold" className="bg-[#0a0a0a]">Cerrada - Vendido</option>
                <option value="closed_no_sale" className="bg-[#0a0a0a]">Cerrada - No vendido</option>
                <option value="no_reply" className="bg-[#0a0a0a]">No respondió</option>
              </select>
            </Field>
            <Field label="Fecha seguimiento">
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                className="crm-input"
              />
            </Field>
          </div>
          {!isEditing && (
            <Field label="Fecha de recepción">
              <input
                type="date"
                value={form.receivedAt}
                onChange={(e) => setForm({ ...form, receivedAt: e.target.value })}
                className="crm-input"
              />
            </Field>
          )}
          <Field label="Próximo paso">
            <input
              value={form.nextStep}
              onChange={(e) => setForm({ ...form, nextStep: e.target.value })}
              className="crm-input"
              placeholder="Ej: Enviar fotos de decants en 3 días"
            />
          </Field>
          <Field label="Notas">
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="crm-input min-h-[60px]"
            />
          </Field>

          {error && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#0a0a0a] border-t border-[#d4af37]/15 p-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-black text-sm font-medium hover:bg-[#e8cc6e] hover:shadow-lg hover:shadow-[#d4af37]/20 disabled:opacity-40 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isEditing ? "Guardar cambios" : "Registrar DM"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Export Tab ─────────────────────────────────────────────────────────────

function ExportTab() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/crm/export?format=xlsx");
      if (!res.ok) throw new Error("Error al exportar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jolie-crm-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[export]", err);
      alert("Error al exportar");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="p-8 rounded-xl bg-gradient-to-br from-[#d4af37]/10 to-transparent border border-[#d4af37]/30 text-center shadow-2xl shadow-black/30">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-transparent border border-[#d4af37]/30 mb-4">
          <Download className="w-8 h-8 text-[#d4af37]" />
        </div>
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] tracking-wide text-white mb-2">Exportar CRM a Excel</h2>
        <p className="text-sm text-white/60 mb-6">
          Descarga un archivo Excel (.xlsx) con toda la data del CRM:
          clientes, ventas, decants, inventario y DMs.
          Incluye una hoja de resumen con KPIs.
        </p>

        <div className="text-left text-xs text-white/50 space-y-1 mb-6 max-w-md mx-auto">
          <div className="flex items-center gap-2"><Check className="w-3 h-3 text-[#d4af37]" /> Hoja "Resumen" con KPIs generales</div>
          <div className="flex items-center gap-2"><Check className="w-3 h-3 text-[#d4af37]" /> Hoja "Clientes" con historial de compras</div>
          <div className="flex items-center gap-2"><Check className="w-3 h-3 text-[#d4af37]" /> Hoja "Ventas" con todos los registros</div>
          <div className="flex items-center gap-2"><Check className="w-3 h-3 text-[#d4af37]" /> Hoja "Decants" con estado de cada uno</div>
          <div className="flex items-center gap-2"><Check className="w-3 h-3 text-[#d4af37]" /> Hoja "Inventario" con márgenes</div>
          <div className="flex items-center gap-2"><Check className="w-3 h-3 text-[#d4af37]" /> Hoja "DMs y Consultas" con seguimiento</div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#d4af37] text-black text-sm font-medium hover:bg-[#e8cc6e] hover:shadow-lg hover:shadow-[#d4af37]/20 disabled:opacity-40 transition-all"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Generando Excel…" : "Descargar Excel"}
        </button>

        <p className="text-[10px] text-white/30 mt-4">
          El archivo se genera en tiempo real con la data actual del CRM.
        </p>
      </div>
    </div>
  );
}

// ─── Filter Pill (compartido) ───────────────────────────────────────────────

function FilterPill({
  active, onClick, label,
}: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
        active
          ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40"
          : "bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white/80"
      }`}
    >
      {label}
    </button>
  );
}
