/**
 * /admin/crm
 * Panel CRM de Lujo para Jolie Fragrances.
 * Siguiendo el sistema de diseño Stitch (Negro Onyx #0A0A0A + Dorado Metálico #D4AF37).
 *
 * Acceso: únicamente ADMIN_EMAIL (joelmedina2009@gmail.com).
 * APIs en /api/admin/crm/* validan la sesión con `requireAdmin`.
 */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users, ShoppingBag, FlaskConical, Package, MessageSquare,
  Download, BarChart3, Plus, Trash2, Pencil, X, Check, ChevronLeft,
  Loader2, AlertTriangle, TrendingUp, DollarSign, Target, Crown,
  Phone, Mail, Instagram, Search, Filter, Star, Ban, RefreshCw,
  Sparkles, ArrowUpRight, ArrowDownRight, Gem, ExternalLink, Calendar,
  CreditCard, Truck, CheckCircle2, AlertCircle, Clock, Eye, Send,
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

const USD = (n: number) => `$${(n || 0).toFixed(2)}`;

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
  pending: { label: "Pendiente llenar", color: "text-amber-200 bg-amber-500/10 border-amber-500/30", dot: "bg-amber-400" },
  filled: { label: "Lleno - Disponible", color: "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30", dot: "bg-[#d4af37]" },
  available: { label: "Disponible", color: "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30", dot: "bg-[#d4af37]" },
  reserved: { label: "Reservado", color: "text-sky-200 bg-sky-500/10 border-sky-500/30", dot: "bg-sky-400" },
  sold: { label: "Vendido", color: "text-purple-200 bg-purple-500/10 border-purple-500/30", dot: "bg-purple-400" },
};

const DM_STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  new: { label: "Nueva Consulta", color: "text-yellow-200 bg-yellow-500/10 border-yellow-500/30", dot: "bg-yellow-400" },
  in_conversation: { label: "En conversación", color: "text-sky-200 bg-sky-500/10 border-sky-500/30", dot: "bg-sky-400" },
  pending: { label: "Pendiente respuesta", color: "text-orange-200 bg-orange-500/10 border-orange-500/30", dot: "bg-orange-400" },
  closed_sold: { label: "Cerrada - Vendido", color: "text-emerald-200 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  closed_no_sale: { label: "Cerrada - Sin venta", color: "text-rose-200 bg-rose-500/10 border-rose-500/30", dot: "bg-rose-400" },
  no_reply: { label: "Sin respuesta", color: "text-gray-400 bg-gray-500/10 border-gray-500/30", dot: "bg-gray-500" },
};

const GENERAL_STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  available: { label: "Disponible", color: "text-emerald-200 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  reserved: { label: "Reservado", color: "text-sky-200 bg-sky-500/10 border-sky-500/30", dot: "bg-sky-400" },
  sold: { label: "Vendido", color: "text-purple-200 bg-purple-500/10 border-purple-500/30", dot: "bg-purple-400" },
  paid: { label: "Pagado Completo", color: "text-emerald-200 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  partial: { label: "Pago Parcial", color: "text-amber-200 bg-amber-500/10 border-amber-500/30", dot: "bg-amber-400" },
  pending: { label: "Pendiente Pago", color: "text-rose-200 bg-rose-500/10 border-rose-500/30", dot: "bg-rose-400" },
  whatsapp: { label: "WhatsApp", color: "text-green-200 bg-green-500/10 border-green-500/30", dot: "bg-green-400" },
  instagram: { label: "Instagram", color: "text-pink-200 bg-pink-500/10 border-pink-500/30", dot: "bg-pink-400" },
  referral: { label: "Referido", color: "text-purple-200 bg-purple-500/10 border-purple-500/30", dot: "bg-purple-400" },
  other: { label: "Otro Canal", color: "text-white/60 bg-white/5 border-white/10", dot: "bg-white/40" },
};

function StatusBadge({ status }: { status: string }) {
  const info =
    DECANT_STATUS_LABELS[status] ||
    DM_STATUS_LABELS[status] ||
    GENERAL_STATUS_LABELS[status] ||
    { label: status, color: "text-white bg-white/5 border-white/20", dot: "bg-white/60" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${info.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
}

function Gold({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#b8962e] bg-clip-text text-transparent font-bold">
      {children}
    </span>
  );
}

function SectionTitle({
  icon, title, subtitle, action,
}: { icon?: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6 pb-4 border-b border-[rgba(212,175,55,0.15)]">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-transparent border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] flex-shrink-0 shadow-lg shadow-black/40">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-playfair)] tracking-wide text-white truncate">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-white/50 mt-0.5 font-[family-name:var(--font-inter)]">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

function EmptyState({
  icon, title, hint, action,
}: { icon: React.ReactNode; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-20 px-6 rounded-2xl bg-[#0d0d0d] border border-white/10 my-4 shadow-2xl">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37]/15 to-transparent border border-[#d4af37]/30 mb-4 shadow-inner">
        <div className="text-[#d4af37]">{icon}</div>
      </div>
      <h3 className="text-base font-semibold text-white mb-1 font-[family-name:var(--font-playfair)]">{title}</h3>
      {hint && <p className="text-xs text-white/40 max-w-md mx-auto mb-5 font-[family-name:var(--font-inter)]">{hint}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CrmAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

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

  useEffect(() => {
    if (tab === "dashboard") loadStats();
  }, [tab, loadStats]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-3" />
        <span className="text-xs text-[#d4af37]/70 font-semibold tracking-wider uppercase font-[family-name:var(--font-inter)]">
          Cargando Panel CRM Jolie...
        </span>
      </div>
    );
  }
  if (status !== "authenticated") return null;
  if ((session?.user?.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-[family-name:var(--font-inter)] selection:bg-[#d4af37]/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#d4af37]/20 shadow-2xl shadow-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f0d060] to-[#b8962e] flex items-center justify-center text-black font-extrabold text-lg flex-shrink-0 shadow-lg shadow-[#d4af37]/20">
              J
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-[family-name:var(--font-playfair)] tracking-wide text-white truncate">
                  Jolie Fragrances <span className="text-[#d4af37]">CRM</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] font-semibold uppercase">
                  Executive Admin
                </span>
              </div>
              <p className="text-[10px] text-white/50 truncate">
                Gestión comercial, clientes, ventas, decants e inventario
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="/admin"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-[#d4af37] hover:border-[#d4af37]/40 text-xs font-semibold transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Admin Catálogo</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-[#111111] border border-white/10 mb-6 overflow-x-auto shadow-xl">
          <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<BarChart3 className="w-4 h-4" />} label="Dashboard" />
          <TabButton active={tab === "customers"} onClick={() => setTab("customers")} icon={<Users className="w-4 h-4" />} label="Clientes" count={stats?.totals.customers} />
          <TabButton active={tab === "sales"} onClick={() => setTab("sales")} icon={<ShoppingBag className="w-4 h-4" />} label="Ventas" count={stats?.totals.sales} />
          <TabButton active={tab === "decants"} onClick={() => setTab("decants")} icon={<FlaskConical className="w-4 h-4" />} label="Decants" count={stats?.totals.decants} />
          <TabButton active={tab === "inventory"} onClick={() => setTab("inventory")} icon={<Package className="w-4 h-4" />} label="Inventario" count={stats?.totals.inventory} />
          <TabButton active={tab === "dms"} onClick={() => setTab("dms")} icon={<MessageSquare className="w-4 h-4" />} label="DMs & Leads" count={stats?.totals.dms} />
          <TabButton active={tab === "export"} onClick={() => setTab("export")} icon={<Download className="w-4 h-4" />} label="Exportar Data" />
        </div>

        {/* Tab Content */}
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
  active, onClick, icon, label, count,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
        active
          ? "bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/40 shadow-lg shadow-[#d4af37]/10"
          : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${active ? "bg-[#d4af37] text-black" : "bg-white/10 text-white/60"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function Loading({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-3" />
      <span className="text-xs text-white/50 font-medium tracking-wide">{message}</span>
    </div>
  );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="py-16 text-center rounded-2xl bg-rose-500/5 border border-rose-500/20 p-6">
      <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
      <p className="text-xs text-rose-300 mb-4 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold hover:bg-rose-500/30 transition-all"
        >
          Reintentar Carga
        </button>
      )}
    </div>
  );
}

// ─── Dashboard Tab ──────────────────────────────────────────────────────────

function DashboardTab({
  stats, loading, onRetry,
}: { stats: Stats | null; loading: boolean; onRetry: () => void }) {
  if (loading) return <Loading message="Cargando métricas y KPIs del CRM..." />;
  if (!stats) return <ErrorBox message="No se pudieron cargar las estadísticas comerciales" onRetry={onRetry} />;

  const kpis = [
    {
      label: "Ingresos Totales",
      value: USD(stats.revenue.total),
      sub: `Cobrado: ${USD(stats.revenue.collected)}`,
      icon: <DollarSign className="w-5 h-5" />,
      accent: "text-[#d4af37]",
      iconBg: "bg-[#d4af37]/10 border-[#d4af37]/30",
      trend: stats.revenue.collected > 0
        ? { dir: "up" as const, label: `${Math.round((stats.revenue.collected / Math.max(stats.revenue.total, 1)) * 100)}% recuperado` }
        : undefined,
    },
    {
      label: "Ventas Últimos 30 Días",
      value: USD(stats.revenue.last30Days),
      sub: `${stats.totals.sales} transacciones registradas`,
      icon: <TrendingUp className="w-5 h-5" />,
      accent: "text-emerald-300",
      iconBg: "bg-emerald-500/10 border-emerald-500/30",
      trend: stats.revenue.last30Days > 0
        ? { dir: "up" as const, label: "Actividad positiva" }
        : { dir: "down" as const, label: "Sin ventas en 30 días" },
    },
    {
      label: "Cobros Pendientes",
      value: USD(stats.revenue.pending),
      sub: "Cuentas por cobrar",
      icon: <Clock className="w-5 h-5" />,
      accent: "text-amber-300",
      iconBg: "bg-amber-500/10 border-amber-500/30",
      trend: stats.revenue.pending > 0
        ? { dir: "down" as const, label: "Requiere cobrar" }
        : { dir: "up" as const, label: "Al día" },
    },
    {
      label: "Conversión DMs → Venta",
      value: `${stats.conversion.dmsToSale}%`,
      sub: `${stats.conversion.dmsClosedSold} ventas de ${stats.conversion.totalDms} DMs`,
      icon: <Target className="w-5 h-5" />,
      accent: "text-sky-300",
      iconBg: "bg-sky-500/10 border-sky-500/30",
      trend: stats.conversion.dmsToSale >= 25
        ? { dir: "up" as const, label: "Excelente conversión" }
        : { dir: "down" as const, label: "Oportunidad de cierre" },
    },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<BarChart3 className="w-5 h-5" />}
        title="Dashboard de Control Comercial"
        subtitle="Métricas globales, desempeño de ventas, decants e inventario en tiempo real"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="relative p-6 rounded-3xl bg-[#111111] border border-[rgba(212,175,55,0.15)] hover:border-[#d4af37]/40 hover:bg-[#141414] shadow-xl hover:shadow-[0_10px_30px_rgba(212,175,55,0.08)] transition-all duration-300 ease-out group overflow-hidden hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <div className="relative z-10 flex items-start justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">{kpi.label}</span>
              <div className={`p-2.5 rounded-xl border ${kpi.iconBg} ${kpi.accent} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                {kpi.icon}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-playfair)] text-white mb-1">
              <Gold>{kpi.value}</Gold>
            </div>
            <div className="text-[11px] text-white/50 mb-2">{kpi.sub}</div>
            {kpi.trend && (
              <div className="flex items-center gap-1.5 text-[10px] pt-2 border-t border-white/5 font-semibold">
                {kpi.trend.dir === "up" ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span className={kpi.trend.dir === "up" ? "text-emerald-300" : "text-rose-300"}>
                  {kpi.trend.label}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sub-summaries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Decants Status */}
        <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold font-[family-name:var(--font-playfair)] text-[#d4af37] mb-4 flex items-center gap-2">
              <FlaskConical className="w-5 h-5" />
              Estado de Decants
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.decantsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <StatusBadge status={status} />
                  <span className="text-sm font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-white/50">Recaudación por Decants:</span>
            <Gold>{USD(stats.revenue.decantRevenue)}</Gold>
          </div>
        </div>

        {/* Inventory Status */}
        <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold font-[family-name:var(--font-playfair)] text-[#d4af37] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventario Físico
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.inventoryByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <StatusBadge status={status} />
                  <span className="text-sm font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-white/50">Valor Total Disponible:</span>
            <Gold>{USD(stats.revenue.inventoryValueAvailable)}</Gold>
          </div>
        </div>

        {/* DMs Status Pipeline */}
        <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold font-[family-name:var(--font-playfair)] text-[#d4af37] mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Consultas & Leaning DMs
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(stats.dmsByStatus).map(([status, count]) => (
                <div key={status} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center flex flex-col items-center">
                  <StatusBadge status={status} />
                  <span className="text-xl font-bold font-[family-name:var(--font-playfair)] text-white mt-1.5">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-white/10 text-center text-xs text-white/40">
            Total Consultas Registradas: <strong className="text-white">{stats.conversion.totalDms}</strong>
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
  const [channelFilter, setChannelFilter] = useState("Todos");
  const [vipFilter, setVipFilter] = useState("Todos");

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/crm/customers", { cache: "no-store" });
      if (!res.ok) throw new Error("Error al cargar lista de clientes");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (channelFilter !== "Todos" && c.channel !== channelFilter) return false;
      if (vipFilter === "VIP" && !c.isVip) return false;
      if (vipFilter === "Bloqueados" && !c.isBlocked) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.instagram && c.instagram.toLowerCase().includes(q)) ||
        (c.tags && c.tags.toLowerCase().includes(q))
      );
    });
  }, [customers, search, channelFilter, vipFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Deseas eliminar este cliente permanentemente?")) return;
    try {
      const res = await fetch(`/api/admin/crm/customers?id=${id}`, { method: "DELETE" });
      if (!res.ok) alert("Error al eliminar");
      else load();
    } catch {
      alert("Error de red");
    }
  };

  if (loading && customers.length === 0) return <Loading message="Cargando base de datos de clientes..." />;

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<Users className="w-5 h-5" />}
        title="Directorio de Clientes VIP"
        subtitle="Gestión de contactos, historial de compras y nivel de fidelidad"
        action={
          <button
            onClick={() => { setEditingCustomer(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black text-xs font-bold shadow-lg hover:brightness-110 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Registrar Cliente
          </button>
        }
      />

      {error && <ErrorBox message={error} onRetry={load} />}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono, correo, Instagram o etiquetas..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-[#050505] border border-white/10 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="Todos">Todos los Canales</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="referral">Referido</option>
              <option value="other">Otro</option>
            </select>

            <select
              value={vipFilter}
              onChange={(e) => setVipFilter(e.target.value)}
              className="bg-[#050505] border border-white/10 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="VIP">Solo Clientes VIP</option>
              <option value="Bloqueados">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Customers */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No hay clientes registrados"
          hint="No se encontraron clientes con los criterios seleccionados."
          action={
            <button
              onClick={() => { setEditingCustomer(null); setShowForm(true); }}
              className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs"
            >
              Registrar Cliente
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`relative p-6 rounded-3xl border flex flex-col justify-between space-y-4 transition-all duration-300 ease-out hover:-translate-y-1 group overflow-hidden ${
                c.isBlocked
                  ? "bg-rose-500/5 border-rose-500/20 grayscale hover:grayscale-0"
                  : c.isVip
                  ? "bg-gradient-to-br from-[#d4af37]/10 to-[#111111] border-[#d4af37]/40 shadow-lg shadow-[#d4af37]/10"
                  : "bg-[#111111] border-white/10 hover:border-[#d4af37]/30 hover:bg-[#141414]"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] opacity-50" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white font-[family-name:var(--font-playfair)]">
                        {c.name}
                      </h3>
                      {c.isVip && (
                        <span className="px-2 py-0.5 rounded-full bg-[#d4af37] text-black text-[9px] font-extrabold flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" /> VIP
                        </span>
                      )}
                      {c.isBlocked && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center gap-1">
                          <Ban className="w-2.5 h-2.5" /> Bloqueado
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/40 block mt-0.5">
                      Registrado: {fmtDate(c.createdAt)}
                    </span>
                  </div>

                  <StatusBadge status={c.channel} />
                </div>

                {/* Contact items */}
                <div className="space-y-1.5 text-xs text-white/70">
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                      <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="hover:underline text-emerald-300">
                        {c.phone}
                      </a>
                    </div>
                  )}
                  {c.instagram && (
                    <div className="flex items-center gap-2">
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      <a href={`https://instagram.com/${c.instagram.replace("@", "")}`} target="_blank" rel="noopener" className="hover:underline text-pink-300">
                        @{c.instagram.replace("@", "")}
                      </a>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-sky-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {c.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.tags.split(",").map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/60">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Stats Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-white/40 block">Total Comprado</span>
                  <Gold>{USD(c.stats?.totalSpent || 0)}</Gold>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setEditingCustomer(c); setShowForm(true); }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-[#d4af37]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Modal Form */}
      {showForm && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

// ─── Customer Form Modal ─────────────────────────────────────────────────────

function CustomerFormModal({
  customer, onClose, onSaved,
}: { customer: Customer | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!customer;
  const [name, setName] = useState(customer?.name || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [instagram, setInstagram] = useState(customer?.instagram || "");
  const [channel, setChannel] = useState(customer?.channel || "whatsapp");
  const [preferences, setPreferences] = useState(customer?.preferences || "");
  const [notes, setNotes] = useState(customer?.notes || "");
  const [tags, setTags] = useState(customer?.tags || "");
  const [isVip, setIsVip] = useState(customer?.isVip || false);
  const [isBlocked, setIsBlocked] = useState(customer?.isBlocked || false);
  const [blockReason, setBlockReason] = useState(customer?.blockReason || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("El nombre es obligatorio");
    setSaving(true);
    try {
      const body = {
        name: name.trim(), email: email.trim() || null, phone: phone.trim() || null,
        instagram: instagram.trim() || null, channel, preferences: preferences.trim() || null,
        notes: notes.trim() || null, tags: tags.trim() || null, isVip, isBlocked,
        blockReason: blockReason.trim() || null,
      };
      const url = isEdit ? `/api/admin/crm/customers?id=${customer!.id}` : "/api/admin/crm/customers";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (res.ok) onSaved();
      else alert("Error al guardar cliente");
    } catch {
      alert("Error de red");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl p-6 rounded-2xl bg-[#111111] border border-[rgba(212,175,55,0.3)] shadow-2xl space-y-5 text-xs font-[family-name:var(--font-inter)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white font-[family-name:var(--font-playfair)]">
            {isEdit ? "Editar Cliente VIP" : "Registrar Nuevo Cliente"}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 mb-1">Nombre Completo *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 mb-1">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+58 412..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Instagram (@usuario)</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@usuario"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Canal de Origen</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="referral">Referido</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/70 mb-1">Etiquetas (separadas por coma)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Dulce, Gourmand, Comprador Recurrente"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-white/70 mb-1">Notas / Preferencias de Fragancias</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-white">
              <input
                type="checkbox"
                checked={isVip}
                onChange={(e) => setIsVip(e.target.checked)}
                className="w-4 h-4 accent-[#d4af37]"
              />
              <span>Marcar como Cliente VIP</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-rose-300">
              <input
                type="checkbox"
                checked={isBlocked}
                onChange={(e) => setIsBlocked(e.target.checked)}
                className="w-4 h-4 accent-rose-500"
              />
              <span>Bloquear Cliente</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70">Cancelar</button>
            <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl bg-[#d4af37] text-black font-bold">
              {saving ? "Guardando..." : "Guardar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sales Tab ──────────────────────────────────────────────────────────────

function SalesTab() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/crm/sales", { cache: "no-store" });
      if (!res.ok) throw new Error("Error al cargar transacciones");
      const data = await res.json();
      setSales(data.sales || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && sales.length === 0) return <Loading message="Cargando libro de ventas..." />;

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<ShoppingBag className="w-5 h-5" />}
        title="Registro de Ventas & Facturación"
        subtitle="Monitoreo de ingresos, pagos parciales y métodos de entrega"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black text-xs font-bold shadow-lg hover:brightness-110 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Registrar Nueva Venta
          </button>
        }
      />

      {error && <ErrorBox message={error} onRetry={load} />}

      {sales.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No hay ventas registradas"
          hint="Registra tu primera venta para hacer seguimiento de cobranza e ingresos."
        />
      ) : (
        <div className="rounded-2xl bg-[#111111] border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-[family-name:var(--font-inter)]">
              <thead className="bg-[#181818] text-white/50 border-b border-white/10 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Ítem / Producto</th>
                  <th className="py-3 px-4">Monto Total</th>
                  <th className="py-3 px-4">Cobrado vs Pendiente</th>
                  <th className="py-3 px-4">Estado Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-white/60 whitespace-nowrap">{fmtDate(s.saleDate)}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {s.customer?.name || "Cliente General"}
                    </td>
                    <td className="py-3 px-4 text-white/90">
                      <div>{s.itemName}</div>
                      <div className="text-[10px] text-white/40">{s.quantity}x @ ${s.unitPrice}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#d4af37]">{USD(s.totalPrice)}</td>
                    <td className="py-3 px-4">
                      <div className="text-emerald-300">Cobrado: {USD(s.paid)}</div>
                      {s.pending > 0 && <div className="text-amber-300 font-semibold">Pendiente: {USD(s.pending)}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.paymentStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <SaleFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}

// ─── Sale Form Modal ─────────────────────────────────────────────────────────

function SaleFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [paid, setPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("zelle");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/crm/customers").then(r => r.json()).then(d => setCustomers(d.customers || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !unitPrice) return alert("Completa los campos obligatorios");
    setSaving(true);
    try {
      const q = Number(quantity) || 1;
      const u = Number(unitPrice) || 0;
      const total = q * u;
      const p = Number(paid || total);

      const body = {
        customerId: customerId || null, itemType: "perfume", itemName: itemName.trim(),
        quantity: q, unitPrice: u, totalPrice: total, paid: p, paymentMethod,
        paymentStatus: p >= total ? "paid" : p > 0 ? "partial" : "pending",
      };
      const res = await fetch("/api/admin/crm/sales", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (res.ok) onSaved();
      else alert("Error al registrar venta");
    } catch {
      alert("Error de red");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-[#111111] border border-[rgba(212,175,55,0.3)] shadow-2xl space-y-4 text-xs font-[family-name:var(--font-inter)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white font-[family-name:var(--font-playfair)]">Registrar Nueva Venta</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 mb-1">Cliente Asociado</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
            >
              <option value="">Cliente General / Sin registrar</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone || c.instagram || "Sin contacto"})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/70 mb-1">Nombre del Producto / Perfume *</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Club de Nuit Intense 105ml"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-white/70 mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1">Precio Unitario ($)</label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="45.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>

            <div>
              <label className="block text-white/70 mb-1">Monto Cobrado ($)</label>
              <input
                type="number"
                step="0.01"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                placeholder="45.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70">Cancelar</button>
            <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl bg-[#d4af37] text-black font-bold">
              {saving ? "Guardando..." : "Registrar Venta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Decants Tab ────────────────────────────────────────────────────────────

function DecantsTab() {
  const [decants, setDecants] = useState<Decant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/crm/decants", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setDecants(data.decants || []);
      }
    } catch {
      console.error("Error al cargar decants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && decants.length === 0) return <Loading message="Cargando gestión de decants..." />;

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<FlaskConical className="w-5 h-5" />}
        title="Inventario de Decants & Muestras"
        subtitle="Control de fraccionamiento de perfumes, mililitros y disponibilidad"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black text-xs font-bold shadow-lg hover:brightness-110 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Registrar Decant
          </button>
        }
      />

      {decants.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-8 h-8" />}
          title="No hay decants en inventario"
          hint="Crea decants para vender muestras fraccionadas de tus mejores fragancias."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decants.map((d) => (
            <div key={d.id} className="p-5 rounded-2xl bg-[#111111] border border-white/10 space-y-3 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-[family-name:var(--font-playfair)]">{d.sourcePerfume}</h3>
                  <span className="text-[10px] text-[#d4af37] uppercase tracking-wider block font-semibold">{d.sourceBrand || "Jolie"}</span>
                </div>
                <StatusBadge status={d.status} />
              </div>

              <div className="flex items-center justify-between text-xs text-white/70 pt-2 border-t border-white/5">
                <span>Tamaño: <strong className="text-white">{d.sizeMl}ml</strong></span>
                <Gold>{USD(d.price)}</Gold>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <DecantFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}
    </div>
  );
}

function DecantFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [sourcePerfume, setSourcePerfume] = useState("");
  const [sourceBrand, setSourceBrand] = useState("");
  const [sizeMl, setSizeMl] = useState("5");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourcePerfume.trim() || !price) return alert("Completa los datos del decant");
    setSaving(true);
    try {
      const body = {
        sourcePerfume: sourcePerfume.trim(), sourceBrand: sourceBrand.trim() || null,
        sizeMl: Number(sizeMl) || 5, price: Number(price) || 0, status: "filled",
      };
      const res = await fetch("/api/admin/crm/decants", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (res.ok) onSaved();
    } catch {
      alert("Error de red");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#111111] border border-[rgba(212,175,55,0.3)] shadow-2xl space-y-4 text-xs font-[family-name:var(--font-inter)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white font-[family-name:var(--font-playfair)]">Registrar Decant</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 mb-1">Nombre Perfume Origen *</label>
            <input
              type="text"
              value={sourcePerfume}
              onChange={(e) => setSourcePerfume(e.target.value)}
              placeholder="Baccarat Rouge 540"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/70 mb-1">Tamaño (ml)</label>
              <input
                type="number"
                value={sizeMl}
                onChange={(e) => setSizeMl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Precio Venta ($)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="12.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70">Cancelar</button>
            <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl bg-[#d4af37] text-black font-bold">
              Guardar Decant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Inventory Tab ──────────────────────────────────────────────────────────

function InventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/crm/inventory", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.inventory || []);
      }
    } catch {
      console.error("Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && items.length === 0) return <Loading message="Cargando items de inventario..." />;

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<Package className="w-5 h-5" />}
        title="Stock & Inventario Físico"
        subtitle="Seguimiento de botellas adquiridas, costos y rentabilidad esperada"
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No hay inventario registrado"
          hint="Registra tus frascos y productos en stock."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((i) => (
            <div key={i.id} className="p-5 rounded-2xl bg-[#111111] border border-white/10 space-y-3 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-[family-name:var(--font-playfair)]">{i.name}</h3>
                  <span className="text-[10px] text-[#d4af37] uppercase tracking-wider block font-semibold">{i.brand || "Jolie"}</span>
                </div>
                <StatusBadge status={i.status} />
              </div>

              <div className="flex items-center justify-between text-xs text-white/70 pt-2 border-t border-white/5">
                <span>Costo: ${i.cost || 0}</span>
                <Gold>{USD(i.price)}</Gold>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DMs Tab ────────────────────────────────────────────────────────────────

function DmsTab() {
  const [dms, setDms] = useState<Dm[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/crm/dms", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setDms(data.dms || []);
      }
    } catch {
      console.error("Error al cargar DMs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && dms.length === 0) return <Loading message="Cargando embudo de DMs y leads..." />;

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<MessageSquare className="w-5 h-5" />}
        title="Embudo de Ventas DM & Mensajería"
        subtitle="Seguimiento de conversaciones en Instagram, WhatsApp y conversiones de leads"
      />

      {dms.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8" />}
          title="No hay consultas registradas"
          hint="Haz seguimiento de clientes potenciales que escriben por redes sociales."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dms.map((d) => (
            <div key={d.id} className="p-5 rounded-2xl bg-[#111111] border border-white/10 space-y-3 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-[family-name:var(--font-playfair)]">
                    @{d.username || "Anonimo"}
                  </h3>
                  <span className="text-[10px] text-white/40 block">{d.platform} • {fmtDate(d.receivedAt)}</span>
                </div>
                <StatusBadge status={d.status} />
              </div>

              {d.fragranceInterest && (
                <div className="text-xs text-[#d4af37] font-medium">
                  Interés: {d.fragranceInterest}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Export Tab ─────────────────────────────────────────────────────────────

function ExportTab() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async (format: "json" | "csv") => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/admin/crm/export?format=${format}`);
      if (!res.ok) throw new Error("Error al exportar");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jolie_crm_export_${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
    } catch {
      alert("Error al descargar exportación");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<Download className="w-5 h-5" />}
        title="Exportación de Datos CRM"
        subtitle="Descarga reportes estructurados de clientes, ventas, decants e inventario"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-[family-name:var(--font-playfair)]">Exportar reporte completo (JSON)</h3>
          <p className="text-xs text-white/50">
            Descarga una copia completa de seguridad con clientes, ventas, decants e inventario en formato JSON.
          </p>
          <button
            onClick={() => handleExport("json")}
            disabled={downloading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50"
          >
            {downloading ? "Generando JSON..." : "Descargar JSON Completo"}
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-[family-name:var(--font-playfair)]">Exportar tabla de ventas (CSV)</h3>
          <p className="text-xs text-white/50">
            Descarga un reporte plano en formato CSV listo para importar en Excel o Google Sheets.
          </p>
          <button
            onClick={() => handleExport("csv")}
            disabled={downloading}
            className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-lg hover:brightness-110 disabled:opacity-50"
          >
            {downloading ? "Generando CSV..." : "Descargar CSV para Excel"}
          </button>
        </div>
      </div>
    </div>
  );
}
