"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  BarChart3,
  Search,
  ShieldBan,
  ShieldCheck,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Ticket,
  TrendingUp,
  ShoppingCart,
  Trophy,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  Briefcase,
  ArrowUpRight,
  RefreshCw,
  Coins,
  Save,
  Package,
  Tag,
  CircleDot,
  Pencil,
  X,
  FlaskConical,
  Clock,
} from "lucide-react";
import { PerfumesTab } from "./PerfumesTab";
import { toast } from "@/hooks/use-toast";
import { ADMIN_EMAIL } from "@/lib/adminAuth";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  authProvider: string;
  banned: boolean;
  bannedReason: string | null;
  createdAt: string;
  discountCount: number;
  predictionCount: number;
}

interface AdminDiscount {
  id: string;
  code: string;
  discountPct: number;
  verified: boolean;
  verifiedAt: string | null;
  expiresAt: string;
  createdAt: string;
  status: "active" | "used" | "expired";
}

interface AdminStats {
  totalUsers: number;
  totalDiscounts: number;
  activeDiscounts: number;
  totalPredictions: number;
  totalCartItems: number;
  dbAvailable: boolean;
}

interface AdminPrediction {
  id: string;
  userEmail: string;
  userName: string | null;
  userId: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string | null;
  awayFlag: string | null;
  competition: string;
  matchDate: string;
  matchStatus: string;
  matchHomeScore: number | null;
  matchAwayScore: number | null;
  matchWinner: string | null;
  homeGoals: number;
  awayGoals: number;
  extraTimeHome: number | null;
  extraTimeAway: number | null;
  penaltiesHome: number | null;
  penaltiesAway: number | null;
  correct: boolean | null;
  exactScore: boolean | null;
  createdAt: string;
}

type Tab = "users" | "stats" | "perfumes";

// ─── Catalog types ──────────────────────────────────────────────────────────
// Mirrors PerfumeCatalogRow from src/lib/dbClient.ts. Defined here so the
// admin page doesn't need to import server-only types.

interface CatalogItem {
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
}

interface CatalogStats {
  total: number;
  priced: number;
  unpriced: number;
  unavailable: number;
  temporalDiscounts: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-VE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function shortId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [dbAvailable, setDbAvailable] = useState(true);
  const [search, setSearch] = useState("");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [predictions, setPredictions] = useState<AdminPrediction[]>([]);
  const [predictionsLoading, setPredictionsLoading] = useState(true);
  const [predictionsError, setPredictionsError] = useState("");
  const [predSearch, setPredSearch] = useState("");

  // ─── Catalog tab state ───
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogStats, setCatalogStats] = useState<CatalogStats | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogBrand, setCatalogBrand] = useState<string>("Todas");
  const [catalogSyncing, setCatalogSyncing] = useState(false);

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

  // ─── Fetch users (tab 1) ─────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.status === 403) {
        router.replace("/");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setUsersError(data.error || "Error al cargar usuarios");
        return;
      }
      setUsers(data.users || []);
      setDbAvailable(data.dbAvailable !== false);
    } catch (err) {
      console.error("[admin] loadUsers error:", err);
      setUsersError("Error de red al cargar usuarios");
    } finally {
      setUsersLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if ((session?.user?.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return;
    loadUsers();
  }, [status, session, loadUsers]);

  // ─── Fetch stats (tab 2) ─────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (res.status === 403) return;
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error("[admin] loadStats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    if ((session?.user?.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return;
    if (tab === "stats") loadStats();
  }, [tab, status, session, loadStats]);

  // ─── Fetch predictions (tab 3) ──────────────────────────────────────────
  const loadPredictions = useCallback(async () => {
    setPredictionsLoading(true);
    setPredictionsError("");
    try {
      const res = await fetch("/api/admin/predictions", { cache: "no-store" });
      if (res.status === 403) {
        router.replace("/");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setPredictionsError(data.error || "Error al cargar predicciones");
        return;
      }
      setPredictions(data.predictions || []);
    } catch (err) {
      console.error("[admin] loadPredictions error:", err);
      setPredictionsError("Error de red al cargar predicciones");
    } finally {
      setPredictionsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if ((session?.user?.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return;
    if (tab === "predictions") loadPredictions();
  }, [tab, status, session, loadPredictions]);

  // ─── Fetch catalog (tab 4) ──────────────────────────────────────────────
  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError("");
    try {
      const res = await fetch("/api/admin/catalog", { cache: "no-store" });
      if (res.status === 403) {
        router.replace("/");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setCatalogError(data.error || "Error al cargar el catálogo");
        return;
      }
      setCatalog(data.items || []);
      setCatalogStats(data.stats || null);
    } catch (err) {
      console.error("[admin] loadCatalog error:", err);
      setCatalogError("Error de red al cargar el catálogo");
    } finally {
      setCatalogLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if ((session?.user?.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return;
    if (tab === "catalog") loadCatalog();
  }, [tab, status, session, loadCatalog]);

  // ─── Sync catalog from perfumes.ts ──────────────────────────────────────
  const handleCatalogSync = useCallback(async () => {
    setCatalogSyncing(true);
    try {
      const res = await fetch("/api/admin/catalog", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setCatalogError(data.error || "Error al sincronizar");
        return;
      }
      // Reload after sync
      await loadCatalog();
      // Show the sync result somewhere visible
      setCatalogError("");
      // Use a temporary success indicator (the stats will reflect the new counts)
      if (data.message) {
        console.log("[admin] catalog sync:", data.message);
      }
    } catch (err) {
      console.error("[admin] catalog sync error:", err);
      setCatalogError("Error de red al sincronizar");
    } finally {
      setCatalogSyncing(false);
    }
  }, [loadCatalog]);

  // ─── Update a single catalog item locally (after PUT succeeds) ─────────
  const updateCatalogItem = useCallback((perfumeId: number, patch: Partial<CatalogItem>) => {
    setCatalog((prev) =>
      prev.map((c) => (c.perfumeId === perfumeId ? { ...c, ...patch } : c))
    );
    // Recompute stats locally so the header reflects changes immediately
    setCatalogStats((prev) => {
      if (!prev) return prev;
      // Find the updated item to compute the diff
      const next = catalog.map((c) =>
        c.perfumeId === perfumeId ? { ...c, ...patch } : c
      );
      return {
        ...prev,
        priced: next.filter((c) => c.price !== null).length,
        unpriced: next.filter((c) => c.price === null).length,
        unavailable: next.filter((c) => !c.available).length,
        temporalDiscounts: next.filter((c) => c.temporalDiscountPct > 0).length,
      };
    });
  }, [catalog]);

  // ─── Bulk update catalog items ──────────────────────────────────────────
  const bulkUpdateCatalog = useCallback(
    async (
      updates: Array<{ perfumeId: number } & Partial<{
        price: number | null;
        available: boolean;
        temporalDiscountPct: number;
        temporalDiscountLabel: string | null;
        notes: string | null;
      }>>
    ) => {
      // The /api/admin/catalog/[perfumeId] route handles one perfume at a
      // time. We issue all PUTs in parallel and wait for them.
      const results = await Promise.allSettled(
        updates.map((u) =>
          fetch(`/api/admin/catalog/${u.perfumeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              price: u.price,
              available: u.available,
              temporalDiscountPct: u.temporalDiscountPct,
              temporalDiscountLabel: u.temporalDiscountLabel,
              notes: u.notes,
            }),
          })
        )
      );
      // After any bulk update, reload the full list to keep stats in sync
      const ok = results.every((r) => r.status === "fulfilled" && r.value.ok);
      await loadCatalog();
      return ok;
    },
    [loadCatalog]
  );

  // ─── Filtered predictions (search box) ─────────────────────────────────────
  const filteredPredictions = useMemo(() => {
    const q = predSearch.trim().toLowerCase();
    if (!q) return predictions;
    return predictions.filter(
      (p) =>
        p.userEmail.toLowerCase().includes(q) ||
        (p.userName || "").toLowerCase().includes(q) ||
        p.homeTeam.toLowerCase().includes(q) ||
        p.awayTeam.toLowerCase().includes(q) ||
        p.competition.toLowerCase().includes(q)
    );
  }, [predictions, predSearch]);

  // ─── Filtered users (search box) ──────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  // ─── Loading / access-denied states ──────────────────────────────────────
  if (status === "loading") {
    return <AdminSplash message="Verificando sesión…" />;
  }

  const email = session?.user?.email?.trim().toLowerCase() || "";
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    // The useEffect above will redirect; show a brief splash meanwhile.
    return <AdminSplash message="Acceso restringido. Redirigiendo…" />;
  }

  // ─── Handlers that mutate the user list ──────────────────────────────────
  const handleBanToggle = (userId: string, banned: boolean, reason?: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              banned,
              bannedReason: banned ? reason || null : null,
            }
          : u
      )
    );
  };

  const handleDiscountAdded = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, discountCount: u.discountCount + 1 } : u
      )
    );
  };

  const handleDiscountRemoved = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, discountCount: Math.max(0, u.discountCount - 1) } : u
      )
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#d4af37]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8962e] flex items-center justify-center text-black font-bold flex-shrink-0">
              J
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-[family-name:var(--font-playfair)] tracking-wide shimmer-text truncate">
                Admin · Jolie Fragrances
              </h1>
              <p className="text-[10px] text-white/40 truncate font-[family-name:var(--font-inter)]">
                Panel de administración
              </p>
            </div>
          </div>
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-[#d4af37]/20 text-[#d4af37]/70 hover:text-[#d4af37] hover:border-[#d4af37]/40 text-xs font-[family-name:var(--font-inter)] transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Volver al catálogo</span>
            <span className="sm:hidden">Volver</span>
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* DB warning */}
        {!dbAvailable && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              La base de datos no está disponible. Los datos mostrados pueden estar incompletos.
            </span>
          </div>
        )}

        {/* CRM banner — link to /admin/crm */}
        <a
          href="/admin/crm"
          className="group block mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#d4af37]/10 via-[#d4af37]/5 to-transparent border border-[#d4af37]/25 hover:border-[#d4af37]/50 transition-all"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-[family-name:var(--font-playfair)] text-[#d4af37] tracking-wide">
                  CRM · Clientes, ventas, decants e inventario
                </h2>
                <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">
                  Gestiona clientes, registra ventas, controla el inventario y los DMs/consultas.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[#d4af37]/70 group-hover:text-[#d4af37] text-xs font-[family-name:var(--font-inter)] flex-shrink-0">
              <span className="hidden sm:inline">Abrir CRM</span>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </a>

        {/* Exchange rate management (dual currency) */}
        <ExchangeRateSection />

        {/* Tab navigation */}
        <div className="inline-flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6 flex-wrap">
          <TabButton
            active={tab === "users"}
            onClick={() => setTab("users")}
            icon={<Users className="w-4 h-4" />}
            label="Usuarios"
          />
          <TabButton
            active={tab === "stats"}
            onClick={() => setTab("stats")}
            icon={<BarChart3 className="w-4 h-4" />}
            label="Estadísticas"
          />
          <TabButton
            active={tab === "perfumes"}
            onClick={() => setTab("perfumes")}
            icon={<Package className="w-4 h-4" />}
            label="Catálogo"
          />
        </div>

        {/* Tab content */}
        {tab === "users" ? (
          <UsersTab
            users={filteredUsers}
            allUsersCount={users.length}
            loading={usersLoading}
            error={usersError}
            search={search}
            onSearch={setSearch}
            onBanToggle={handleBanToggle}
            onDiscountAdded={handleDiscountAdded}
            onDiscountRemoved={handleDiscountRemoved}
            onRetry={loadUsers}
          />
        ) : tab === "stats" ? (
          <StatsTab stats={stats} loading={statsLoading} onRetry={loadStats} />
        ) : tab === "perfumes" ? (
          <PerfumesTab />
        ) : null}
      </main>
    </div>
  );
}

// ─── Splash (loading/access-denied) ─────────────────────────────────────────

function AdminSplash({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mx-auto mb-3" />
        <p className="text-sm text-white/60 font-[family-name:var(--font-inter)]">
          {message}
        </p>
      </div>
    </div>
  );
}

// ─── Exchange Rate Section (admin) ──────────────────────────────────────────
//
// Fully automatic dual-currency exchange rates (USDT + BCV). Manual editing
// has been REMOVED — rates refresh automatically via:
//   1. Vercel Cron (every hour) → GET /api/exchange-rates/auto-update
//   2. Background revalidation on GET /api/exchange-rates when data is stale
//   3. The "Sincronizar ahora" button below (admin on-demand trigger)
//
// The auto-update endpoint queries 4 independent sources in parallel and
// takes the MEDIAN of valid samples for each currency (robust against any
// single source failing or returning an outlier).

interface ExchangeRatesData {
  usdtRate: number;
  bcvRate: number;
  updatedAt: string;
  updatedBy: string | null;
  fallback: boolean;
  stale?: boolean;
}

interface SourceSample {
  source: string;
  value: number;
}

interface AutoUpdateResponse {
  success?: boolean;
  usdtRate?: number;
  bcvRate?: number;
  updatedAt?: string;
  method?: "median" | "single" | "preserved";
  usdtSamples?: SourceSample[];
  bcvSamples?: SourceSample[];
  error?: string;
  detail?: string;
}

function ExchangeRateSection() {
  const [data, setData] = useState<ExchangeRatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{
    method?: string;
    usdtSamples?: SourceSample[];
    bcvSamples?: SourceSample[];
  } | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/exchange-rates", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = (await res.json()) as Partial<ExchangeRatesData>;
      setData({
        usdtRate: typeof d.usdtRate === "number" ? d.usdtRate : 832.73,
        bcvRate: typeof d.bcvRate === "number" ? d.bcvRate : 701,
        updatedAt: d.updatedAt ?? "",
        updatedBy: d.updatedBy ?? null,
        fallback: !!d.fallback,
        stale: !!d.stale,
      });
    } catch (err) {
      console.error("[admin] exchange-rates GET error:", err);
      setError("No se pudieron cargar las tasas de la base de datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh every 5 min so the admin always sees fresh state.
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  // ─── Sync now (admin on-demand trigger) ───────────────────────────────────
  // Calls POST /api/exchange-rates/auto-update which queries 4 sources in
  // parallel and writes the median to the DB with updatedBy="auto".
  const handleSync = useCallback(async () => {
    setError("");
    setSuccess(false);
    setSyncing(true);
    try {
      const res = await fetch("/api/exchange-rates/auto-update", {
        method: "POST",
      });
      if (res.status === 403) {
        setError("Sesión expirada o sin permisos. Recarga e inicia sesión de nuevo.");
        return;
      }
      const j = (await res.json().catch(() => ({}))) as AutoUpdateResponse;
      if (!res.ok || !j.success) {
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setLastSync({
        method: j.method,
        usdtSamples: j.usdtSamples,
        bcvSamples: j.bcvSamples,
      });
      setData({
        usdtRate: typeof j.usdtRate === "number" ? j.usdtRate : data?.usdtRate ?? 0,
        bcvRate: typeof j.bcvRate === "number" ? j.bcvRate : data?.bcvRate ?? 0,
        updatedAt: j.updatedAt ?? new Date().toISOString(),
        updatedBy: "auto",
        fallback: false,
        stale: false,
      });
      setSuccess(true);
      toast({
        title: "Tasas sincronizadas ✨",
        description:
          j.method === "median"
            ? `Mediana de ${j.usdtSamples?.length ?? 0} fuentes USDT · ${j.bcvSamples?.length ?? 0} fuentes BCV`
            : j.method === "single"
            ? "Una fuente respondió — valor tomado directo"
            : "Fuentes preservadas (sin cambios)",
      });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("[admin] exchange-rates sync error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudieron obtener las tasas de las APIs externas.";
      setError(msg);
      toast({
        title: "No se pudo sincronizar",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  }, [data]);

  const formattedUpdatedAt = (() => {
    if (!data?.updatedAt) return "—";
    try {
      const d = new Date(data.updatedAt);
      if (isNaN(d.getTime()) || d.getTime() === 0) return "—";
      return d.toLocaleString("es-VE", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return data.updatedAt;
    }
  })();

  // Live preview: what a $38 perfume would look like with current rates.
  const previewUsd = 38;
  const previewUsdVal = data?.usdtRate ?? 0;
  const previewBcvVal = data?.bcvRate ?? 0;
  const previewBcvEq =
    previewBcvVal > 0
      ? Math.round((previewUsd * previewUsdVal) / previewBcvVal)
      : 0;
  const previewBs = previewUsd * previewUsdVal;
  const previewBsStr = (() => {
    try {
      return new Intl.NumberFormat("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(previewBs);
    } catch {
      return previewBs.toFixed(2);
    }
  })();

  const formatRate = (n: number) =>
    new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <section className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#111111] to-[#0d0d0d] border border-[#d4af37]/20">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0">
            <Coins className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-[family-name:var(--font-playfair)] text-[#d4af37] tracking-wide">
              Tasas de cambio · Automáticas
            </h2>
            <p className="text-[11px] sm:text-xs text-white/50 mt-0.5 leading-relaxed">
              Conversión USD → Bolívares. Se actualizan solas cada hora desde 4
              fuentes independientes (mediana). Sin edición manual.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all disabled:opacity-50 font-[family-name:var(--font-inter)] flex-shrink-0"
          title="Recargar tasas"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Recargar</span>
        </button>
      </div>

      {/* Read-only rate display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-[#0a0a0a]/60 border border-[#d4af37]/15">
          <div className="text-[10px] text-white/40 tracking-[0.15em] uppercase font-[family-name:var(--font-inter)] font-semibold">
            Tasa USDT · mercado
          </div>
          <div className="mt-1 text-2xl font-bold text-white font-[family-name:var(--font-inter)]">
            {data ? formatRate(data.usdtRate) : "—"}
            <span className="text-xs text-white/40 ml-1.5 font-normal">Bs./USDT</span>
          </div>
          <div className="text-[10px] text-white/30 mt-1 font-[family-name:var(--font-inter)]">
            Se usa para calcular el monto a pagar en Bs.
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0a0a0a]/60 border border-[#d4af37]/15">
          <div className="text-[10px] text-white/40 tracking-[0.15em] uppercase font-[family-name:var(--font-inter)] font-semibold">
            Tasa BCV · referencia
          </div>
          <div className="mt-1 text-2xl font-bold text-white font-[family-name:var(--font-inter)]">
            {data ? formatRate(data.bcvRate) : "—"}
            <span className="text-xs text-white/40 ml-1.5 font-normal">Bs./USD</span>
          </div>
          <div className="text-[10px] text-white/30 mt-1 font-[family-name:var(--font-inter)]">
            Equivalente oficial del Banco Central.
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="mb-4 p-3 rounded-lg bg-[#0a0a0a]/60 border border-white/[0.05]">
        <p className="text-[10px] text-white/30 tracking-[0.15em] uppercase font-[family-name:var(--font-inter)] font-semibold mb-1.5">
          Vista previa · perfume de ${previewUsd}
        </p>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="text-base font-bold bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent font-[family-name:var(--font-inter)]">
            ${previewBcvEq}
          </span>
          <span className="text-[11px] text-white/55 font-[family-name:var(--font-inter)]">
            Bs. {previewBsStr}
          </span>
          <span className="text-[10px] text-white/30 font-[family-name:var(--font-inter)]">
            (equivalente BCV + monto a pagar)
          </span>
        </div>
      </div>

      {/* Sources from last sync (transparency) */}
      {lastSync && (lastSync.usdtSamples?.length || lastSync.bcvSamples?.length) ? (
        <div className="mb-4 p-3 rounded-lg bg-[#0a0a0a]/40 border border-white/[0.05]">
          <p className="text-[10px] text-white/30 tracking-[0.15em] uppercase font-[family-name:var(--font-inter)] font-semibold mb-2">
            Fuentes consultadas · {lastSync.method === "median" ? "mediana" : lastSync.method === "single" ? "fuente única" : "preservado"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-[family-name:var(--font-inter)]">
            <div>
              <div className="text-white/40 mb-1">USDT (mercado)</div>
              {lastSync.usdtSamples?.length ? (
                <ul className="space-y-0.5">
                  {lastSync.usdtSamples.map((s, i) => (
                    <li key={i} className="flex justify-between text-white/60">
                      <span className="truncate">{s.source}</span>
                      <span className="text-white/80 ml-2">{formatRate(s.value)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-white/30">— ninguna respondió —</span>
              )}
            </div>
            <div>
              <div className="text-white/40 mb-1">BCV (oficial)</div>
              {lastSync.bcvSamples?.length ? (
                <ul className="space-y-0.5">
                  {lastSync.bcvSamples.map((s, i) => (
                    <li key={i} className="flex justify-between text-white/60">
                      <span className="truncate">{s.source}</span>
                      <span className="text-white/80 ml-2">{formatRate(s.value)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-white/30">— ninguna respondió —</span>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Status + Sync button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-[11px] text-white/40 font-[family-name:var(--font-inter)] flex items-center gap-2 flex-wrap">
          {data?.fallback && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px]">
              <AlertTriangle className="w-3 h-3" />
              Valores por defecto
            </span>
          )}
          {data?.stale && !data?.fallback && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px]">
              <Clock className="w-3 h-3" />
              Actualizando en segundo plano…
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px]">
            🤖 Automática
          </span>
          <span>
            Última actualización:{" "}
            <span className="text-white/60">{formattedUpdatedAt}</span>
          </span>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || loading}
          title="Consultar las 4 fuentes ahora y recalcular la mediana"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black text-xs font-bold font-[family-name:var(--font-inter)] hover:from-[#e0c04a] hover:to-[#c8a634] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#d4af37]/15"
        >
          {syncing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Sincronizando…
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Sincronizar ahora
            </>
          )}
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-[family-name:var(--font-inter)]">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-[family-name:var(--font-inter)]">
          <Check className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Tasas sincronizadas desde las fuentes en vivo. El catálogo refleja
            los nuevos precios automáticamente.
          </span>
        </div>
      )}
    </section>
  );
}

// ─── Tab Button ─────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-[family-name:var(--font-inter)] transition-all ${
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

// ─── Users Tab ──────────────────────────────────────────────────────────────

interface UsersTabProps {
  users: AdminUser[];
  allUsersCount: number;
  loading: boolean;
  error: string;
  search: string;
  onSearch: (q: string) => void;
  onBanToggle: (userId: string, banned: boolean, reason?: string) => void;
  onDiscountAdded: (userId: string) => void;
  onDiscountRemoved: (userId: string) => void;
  onRetry: () => void;
}

function UsersTab({
  users,
  allUsersCount,
  loading,
  error,
  search,
  onSearch,
  onBanToggle,
  onDiscountAdded,
  onDiscountRemoved,
  onRetry,
}: UsersTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
        <span className="ml-3 text-sm text-white/50 font-[family-name:var(--font-inter)]">
          Cargando usuarios…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-300 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-xs hover:bg-[#d4af37]/25 transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search + count */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por email o nombre…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 text-sm font-[family-name:var(--font-inter)] focus:outline-none focus:border-[#d4af37]/40 focus:bg-white/[0.05] transition-all"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/60 font-[family-name:var(--font-inter)] flex-shrink-0">
          <Users className="w-3.5 h-3.5 text-[#d4af37]/60" />
          {search ? `${users.length} de ${allUsersCount}` : `${allUsersCount} usuarios`}
        </div>
      </div>

      {/* Empty state */}
      {users.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40 font-[family-name:var(--font-inter)]">
            {search ? "Sin resultados para tu búsqueda." : "No hay usuarios registrados."}
          </p>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-260px)] overflow-y-auto pr-1 -mr-1 admin-scroll">
          <div className="space-y-2">
            {users.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onBanToggle={onBanToggle}
                onDiscountAdded={onDiscountAdded}
                onDiscountRemoved={onDiscountRemoved}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── User Card ──────────────────────────────────────────────────────────────

interface UserCardProps {
  user: AdminUser;
  onBanToggle: (userId: string, banned: boolean, reason?: string) => void;
  onDiscountAdded: (userId: string) => void;
  onDiscountRemoved: (userId: string) => void;
}

function UserCard({ user, onBanToggle, onDiscountAdded, onDiscountRemoved }: UserCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showBanForm, setShowBanForm] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleBan = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: true, reason: banReason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Error al suspender");
        return;
      }
      onBanToggle(user.id, true, banReason.trim() || undefined);
      setShowBanForm(false);
      setBanReason("");
    } catch (err) {
      console.error("[admin] ban error:", err);
      setActionError("Error de red");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Error al reactivar");
        return;
      }
      onBanToggle(user.id, false);
    } catch (err) {
      console.error("[admin] unban error:", err);
      setActionError("Error de red");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        user.banned
          ? "bg-red-500/[0.04] border-red-500/25"
          : "bg-white/[0.02] border-white/[0.06] hover:border-[#d4af37]/20"
      }`}
    >
      {/* Top row: user info */}
      <div className="p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Avatar + identity */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || user.email}
              className="w-9 h-9 rounded-full border border-[#d4af37]/25 flex-shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37]/40 to-[#b8962e]/40 flex items-center justify-center text-sm font-bold text-[#d4af37] flex-shrink-0">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-white truncate font-[family-name:var(--font-inter)]">
                {user.name || user.email.split("@")[0]}
              </p>
              {user.banned && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-[9px] text-red-300 font-[family-name:var(--font-inter)] uppercase tracking-wide">
                  <ShieldBan className="w-2.5 h-2.5" />
                  Suspendido
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 truncate font-[family-name:var(--font-inter)]">
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] text-white/35 font-[family-name:var(--font-inter)]">
                {user.authProvider === "google" ? "Google" : "OTP"}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-[10px] text-white/35 font-[family-name:var(--font-inter)]">
                {formatDate(user.createdAt)}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-[10px] text-[#d4af37]/60 font-[family-name:var(--font-inter)]">
                {user.predictionCount} pred.
              </span>
              <span className="text-white/20">·</span>
              <span className="text-[10px] text-[#d4af37]/60 font-[family-name:var(--font-inter)]">
                {user.discountCount} desc.
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Ban / Unban */}
          {user.banned ? (
            <button
              onClick={handleUnban}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs hover:bg-emerald-500/20 disabled:opacity-50 transition-all font-[family-name:var(--font-inter)]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Reactivar
            </button>
          ) : (
            <button
              onClick={() => setShowBanForm((s) => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs hover:bg-red-500/20 transition-all font-[family-name:var(--font-inter)]"
            >
              <ShieldBan className="w-3.5 h-3.5" />
              Suspender
            </button>
          )}

          {/* Add discount */}
          <button
            onClick={() => setShowDiscountForm((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37] text-xs hover:bg-[#d4af37]/20 transition-all font-[family-name:var(--font-inter)]"
          >
            <Plus className="w-3.5 h-3.5" />
            Descuento
          </button>

          {/* View discounts (expandable) */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs hover:bg-white/[0.08] hover:text-white transition-all font-[family-name:var(--font-inter)]"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <Ticket className="w-3.5 h-3.5" />
            {user.discountCount}
          </button>
        </div>
      </div>

      {/* Ban reason (if banned) */}
      {user.banned && user.bannedReason && (
        <div className="px-3 sm:px-4 pb-3 -mt-1">
          <div className="text-[11px] text-red-300/80 italic font-[family-name:var(--font-inter)] pl-12">
            Motivo: {user.bannedReason}
          </div>
        </div>
      )}

      {/* Inline ban form */}
      {showBanForm && !user.banned && (
        <div className="px-3 sm:px-4 pb-3 -mt-1">
          <div className="pl-0 sm:pl-12">
            <div className="p-3 rounded-lg bg-red-500/[0.05] border border-red-500/20">
              <label className="block text-[10px] text-red-300/70 mb-1.5 uppercase tracking-wide font-[family-name:var(--font-inter)]">
                Motivo de suspensión (opcional)
              </label>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Ej: comportamiento abusivo, multicuenta, etc."
                maxLength={500}
                className="w-full px-3 py-2 rounded-md bg-[#0a0a0a] border border-white/10 text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-red-500/40 font-[family-name:var(--font-inter)]"
              />
              {actionError && (
                <p className="text-[10px] text-red-400 mt-1.5">{actionError}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleBan}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-md bg-red-500/20 border border-red-500/40 text-red-200 text-xs hover:bg-red-500/30 disabled:opacity-50 transition-all font-[family-name:var(--font-inter)]"
                >
                  {actionLoading ? "Suspendiendo…" : "Confirmar suspensión"}
                </button>
                <button
                  onClick={() => {
                    setShowBanForm(false);
                    setBanReason("");
                    setActionError("");
                  }}
                  className="px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/10 text-white/60 text-xs hover:text-white/80 transition-all font-[family-name:var(--font-inter)]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline discount add form */}
      {showDiscountForm && (
        <DiscountAddForm
          userId={user.id}
          userEmail={user.email}
          onClose={() => setShowDiscountForm(false)}
          onAdded={() => {
            onDiscountAdded(user.id);
            setShowDiscountForm(false);
            setExpanded(true);
          }}
        />
      )}

      {/* Expanded discounts list */}
      {expanded && (
        <DiscountsList
          userId={user.id}
          onRemoved={(discountId) => onDiscountRemoved(user.id)}
        />
      )}
    </div>
  );
}

// ─── Discount Add Form ──────────────────────────────────────────────────────

interface DiscountAddFormProps {
  userId: string;
  userEmail: string;
  onClose: () => void;
  onAdded: () => void;
}

function DiscountAddForm({ userId, userEmail, onClose, onAdded }: DiscountAddFormProps) {
  const [pct, setPct] = useState<5 | 10>(10);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body: { discountPct: number; expiresAt?: string } = { discountPct: pct };
      if (expiresAt) {
        // Convert the date input (YYYY-MM-DD) to an ISO string at end of day.
        const d = new Date(expiresAt + "T23:59:59");
        if (!isNaN(d.getTime())) body.expiresAt = d.toISOString();
      }
      const res = await fetch(`/api/admin/users/${userId}/discounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear descuento");
        return;
      }
      onAdded();
    } catch (err) {
      console.error("[admin] addDiscount error:", err);
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-3 sm:px-4 pb-3 -mt-1">
      <div className="pl-0 sm:pl-12">
        <form
          onSubmit={handleSubmit}
          className="p-3 rounded-lg bg-[#d4af37]/[0.04] border border-[#d4af37]/15"
        >
          <p className="text-[10px] text-[#d4af37]/70 mb-2 uppercase tracking-wide font-[family-name:var(--font-inter)]">
            Nuevo descuento para {userEmail}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1">
              <label className="block text-[10px] text-white/40 mb-1 font-[family-name:var(--font-inter)]">
                Porcentaje
              </label>
              <div className="flex gap-1.5">
                {[5, 10].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPct(p as 5 | 10)}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium font-[family-name:var(--font-inter)] transition-all border ${
                      pct === p
                        ? "bg-[#d4af37]/20 border-[#d4af37]/40 text-[#d4af37]"
                        : "bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-white/40 mb-1 font-[family-name:var(--font-inter)]">
                Expira (opcional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-1.5 rounded-md bg-[#0a0a0a] border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4af37]/40 font-[family-name:var(--font-inter)] [color-scheme:dark]"
              />
            </div>
          </div>
          <p className="text-[10px] text-white/30 mt-1.5 font-[family-name:var(--font-inter)]">
            Si no eliges fecha, expira en 90 días.
          </p>
          {error && <p className="text-[10px] text-red-400 mt-1.5">{error}</p>}
          <div className="flex gap-2 mt-2.5">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 rounded-md bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs hover:bg-[#d4af37]/30 disabled:opacity-50 transition-all font-[family-name:var(--font-inter)] flex items-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
              {loading ? "Creando…" : "Crear descuento"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/10 text-white/60 text-xs hover:text-white/80 transition-all font-[family-name:var(--font-inter)]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Discounts List (expandable) ────────────────────────────────────────────

interface DiscountsListProps {
  userId: string;
  onRemoved: (discountId: string) => void;
}

function DiscountsList({ userId, onRemoved }: DiscountsListProps) {
  const [discounts, setDiscounts] = useState<AdminDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/discounts`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al cargar descuentos");
        return;
      }
      setDiscounts(data.discounts || []);
    } catch (err) {
      console.error("[admin] loadDiscounts error:", err);
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    load();
  }, [load]);

  const handleRemove = async (discountId: string) => {
    if (!confirm("¿Eliminar este descuento? Esta acción no se puede deshacer.")) return;
    setRemovingId(discountId);
    try {
      const res = await fetch(
        `/api/admin/users/${userId}/discounts?discountId=${encodeURIComponent(discountId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al eliminar");
        return;
      }
      setDiscounts((prev) => prev.filter((d) => d.id !== discountId));
      onRemoved(discountId);
    } catch (err) {
      console.error("[admin] removeDiscount error:", err);
      alert("Error de red");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCopy = async (discount: AdminDiscount) => {
    try {
      await navigator.clipboard.writeText(discount.code);
      setCopiedId(discount.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Clipboard may be unavailable — ignore.
    }
  };

  return (
    <div className="px-3 sm:px-4 pb-3 -mt-1">
      <div className="pl-0 sm:pl-12">
        <div className="rounded-lg bg-black/30 border border-white/[0.06] overflow-hidden">
          <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
            <p className="text-[10px] text-white/50 uppercase tracking-wide font-[family-name:var(--font-inter)]">
              Códigos de descuento
            </p>
            <button
              onClick={load}
              className="text-[10px] text-[#d4af37]/60 hover:text-[#d4af37] font-[family-name:var(--font-inter)]"
            >
              ↻ Recargar
            </button>
          </div>

          {loading ? (
            <div className="px-3 py-4 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4af37]/60" />
              <span className="text-xs text-white/40 font-[family-name:var(--font-inter)]">
                Cargando…
              </span>
            </div>
          ) : error ? (
            <div className="px-3 py-3 text-xs text-red-300 font-[family-name:var(--font-inter)]">
              {error}
            </div>
          ) : discounts.length === 0 ? (
            <div className="px-3 py-4 text-xs text-white/40 font-[family-name:var(--font-inter)]">
              Este usuario no tiene descuentos.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {discounts.map((d) => (
                <div
                  key={d.id}
                  className="px-3 py-2.5 flex items-center gap-2 flex-wrap hover:bg-white/[0.02]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center justify-center min-w-[36px] px-1.5 py-0.5 rounded bg-[#d4af37]/15 border border-[#d4af37]/25 text-[10px] font-bold text-[#d4af37] font-[family-name:var(--font-inter)]">
                        {d.discountPct}%
                      </span>
                      <code className="text-[11px] text-white/70 font-mono truncate">
                        {d.code.length > 50 ? `${d.code.slice(0, 47)}…` : d.code}
                      </code>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-white/35 font-[family-name:var(--font-inter)]">
                        Creado: {formatDate(d.createdAt)}
                      </span>
                      <span className="text-white/20">·</span>
                      <span className="text-[10px] text-white/35 font-[family-name:var(--font-inter)]">
                        Expira: {formatDate(d.expiresAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(d)}
                    title="Copiar código"
                    className="p-1.5 rounded-md bg-white/[0.04] border border-white/10 text-white/40 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all"
                  >
                    {copiedId === d.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRemove(d.id)}
                    disabled={removingId === d.id}
                    title="Eliminar descuento"
                    className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-300/70 hover:text-red-300 hover:bg-red-500/20 disabled:opacity-50 transition-all"
                  >
                    {removingId === d.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "used" | "expired" }) {
  const config = {
    active: { label: "Activo", cls: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" },
    used: { label: "Usado", cls: "bg-blue-500/15 border-blue-500/30 text-blue-300" },
    expired: { label: "Expirado", cls: "bg-white/[0.06] border-white/15 text-white/40" },
  } as const;
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wide border font-[family-name:var(--font-inter)] ${c.cls}`}
    >
      {c.label}
    </span>
  );
}

// ─── Stats Tab ──────────────────────────────────────────────────────────────

interface StatsTabProps {
  stats: AdminStats | null;
  loading: boolean;
  onRetry: () => void;
}

function StatsTab({ stats, loading, onRetry }: StatsTabProps) {
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
        <span className="ml-3 text-sm text-white/50 font-[family-name:var(--font-inter)]">
          Cargando estadísticas…
        </span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-12 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-300 mb-4">No se pudieron cargar las estadísticas.</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-xs hover:bg-[#d4af37]/25 transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Usuarios",
      value: stats.totalUsers,
      icon: <Users className="w-5 h-5" />,
      hint: "Cuentas registradas",
    },
    {
      label: "Descuentos Activos",
      value: stats.activeDiscounts,
      icon: <Ticket className="w-5 h-5" />,
      hint: `de ${stats.totalDiscounts} en total`,
    },
    {
      label: "Total Predicciones",
      value: stats.totalPredictions,
      icon: <Trophy className="w-5 h-5" />,
      hint: "Pronósticos enviados",
    },
    {
      label: "Items en Carritos",
      value: stats.totalCartItems,
      icon: <ShoppingCart className="w-5 h-5" />,
      hint: "Productos guardados",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#d4af37]/20 transition-all p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
                {c.icon}
              </div>
              <TrendingUp className="w-4 h-4 text-white/15" />
            </div>
            <p className="text-3xl font-bold text-white font-[family-name:var(--font-playfair)]">
              {c.value.toLocaleString("es-VE")}
            </p>
            <p className="text-xs text-white/60 mt-1 font-[family-name:var(--font-inter)]">
              {c.label}
            </p>
            <p className="text-[10px] text-white/35 mt-0.5 font-[family-name:var(--font-inter)]">
              {c.hint}
            </p>
          </div>
        ))}
      </div>

      {!stats.dbAvailable && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>La base de datos no está disponible — las estadísticas pueden estar incompletas.</span>
        </div>
      )}

      <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <p className="text-xs text-white/40 font-[family-name:var(--font-inter)]">
          Las estadísticas se actualizan al entrar a esta pestaña. Para refrescar, haz clic en
          otra pestaña y vuelve aquí.
        </p>
      </div>
    </div>
  );
}

// ─── Predictions Tab ─────────────────────────────────────────────────────────

function PredictionsTab({
  predictions,
  allCount,
  loading,
  error,
  search,
  onSearch,
  onRetry,
}: {
  predictions: AdminPrediction[];
  allCount: number;
  loading: boolean;
  error: string;
  search: string;
  onSearch: (v: string) => void;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-8 h-8 text-rose-400/60 mx-auto mb-3" />
        <p className="text-sm text-white/50 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] text-xs hover:bg-[#d4af37]/15 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (allCount === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="w-10 h-10 text-[#d4af37]/20 mx-auto mb-3" />
        <p className="text-sm text-white/40">No hay predicciones registradas todavía.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search + count */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por email, equipo o competición..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 placeholder:text-white/25 font-[family-name:var(--font-inter)] focus:outline-none focus:border-[#d4af37]/30 transition-colors"
          />
        </div>
        <span className="text-xs text-white/40 font-[family-name:var(--font-inter)]">
          {predictions.length} de {allCount} predicciones
        </span>
      </div>

      {/* Predictions list */}
      <div className="max-h-[70vh] overflow-y-auto scrollbar-thin space-y-2 pr-1">
        {predictions.length === 0 ? (
          <p className="text-center text-sm text-white/30 py-8">
            No se encontraron predicciones con ese filtro.
          </p>
        ) : (
          predictions.map((p) => (
            <PredictionRow key={p.id} p={p} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Prediction Row ──────────────────────────────────────────────────────────

function PredictionRow({ p }: { p: AdminPrediction }) {
  const [expanded, setExpanded] = useState(false);

  // Determine result status
  const isEvaluated = p.correct !== null || p.exactScore !== null;
  const isCorrect = p.correct === true;
  const isExact = p.exactScore === true;
  const matchFinished = p.matchStatus === "finished";

  // Status badge
  let statusBadge: React.ReactNode;
  if (isExact) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-semibold">
        🎯 Exacto (+10%)
      </span>
    );
  } else if (isCorrect) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/25 font-semibold">
        ✓ Ganador (+5%)
      </span>
    );
  } else if (isEvaluated) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400/70 border border-rose-500/20 font-semibold">
        ✗ Falló
      </span>
    );
  } else if (matchFinished) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
        Evaluando...
      </span>
    );
  } else {
    statusBadge = (
      <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
        ⏳ Por jugar
      </span>
    );
  }

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
      {/* Main row (clickable) */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        {/* Match info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-white/90 font-[family-name:var(--font-inter)] truncate">
              {p.homeTeam} vs {p.awayTeam}
            </span>
            {statusBadge}
          </div>
          <p className="text-[10px] text-white/40 mt-0.5 font-[family-name:var(--font-inter)] truncate">
            {p.competition} • {formatDate(p.matchDate)}
          </p>
        </div>

        {/* Prediction score */}
        <div className="flex-shrink-0 text-center">
          <p className="text-[9px] text-white/30 uppercase tracking-wider font-[family-name:var(--font-inter)]">
            Predijo
          </p>
          <p className="text-sm font-bold text-[#d4af37] font-[family-name:var(--font-inter)]">
            {p.homeGoals} - {p.awayGoals}
          </p>
        </div>

        {/* Actual score (if finished) */}
        {matchFinished && p.matchHomeScore !== null && (
          <div className="flex-shrink-0 text-center">
            <p className="text-[9px] text-white/30 uppercase tracking-wider font-[family-name:var(--font-inter)]">
              Resultado
            </p>
            <p className="text-sm font-bold text-white/70 font-[family-name:var(--font-inter)]">
              {p.matchHomeScore} - {p.matchAwayScore}
            </p>
          </div>
        )}

        {/* Expand icon */}
        <ChevronRight
          className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/[0.04] space-y-2">
          {/* User */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/30 font-[family-name:var(--font-inter)]">Usuario:</span>
            <span className="text-white/70 font-[family-name:var(--font-inter)]">{p.userEmail}</span>
            {p.userName && (
              <span className="text-white/40 font-[family-name:var(--font-inter)]">({p.userName})</span>
            )}
          </div>

          {/* Prediction details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-white/30 font-[family-name:var(--font-inter)]">Marcador:</span>
              <span className="text-white/70 ml-1 font-[family-name:var(--font-inter)]">
                {p.homeGoals} - {p.awayGoals}
              </span>
            </div>
            {p.extraTimeHome !== null && (
              <div>
                <span className="text-white/30 font-[family-name:var(--font-inter)]">Prórroga:</span>
                <span className="text-white/70 ml-1 font-[family-name:var(--font-inter)]">
                  {p.extraTimeHome} - {p.extraTimeAway}
                </span>
              </div>
            )}
            {p.penaltiesHome !== null && (
              <div>
                <span className="text-white/30 font-[family-name:var(--font-inter)]">Penales:</span>
                <span className="text-white/70 ml-1 font-[family-name:var(--font-inter)]">
                  {p.penaltiesHome} - {p.penaltiesAway}
                </span>
              </div>
            )}
            <div>
              <span className="text-white/30 font-[family-name:var(--font-inter)]">Creada:</span>
              <span className="text-white/70 ml-1 font-[family-name:var(--font-inter)]">
                {formatDate(p.createdAt)}
              </span>
            </div>
          </div>

          {/* Result details */}
          {matchFinished && (
            <div className="pt-2 border-t border-white/[0.04]">
              <p className="text-[10px] text-white/30 font-[family-name:var(--font-inter)] mb-1">
                Resultado del partido:
              </p>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-white/60 font-[family-name:var(--font-inter)]">
                  {p.matchHomeScore} - {p.matchAwayScore}
                </span>
                {p.matchWinner && (
                  <span className="text-white/40 font-[family-name:var(--font-inter)]">
                    ({p.matchWinner === "home" ? p.homeTeam : p.matchWinner === "away" ? p.awayTeam : "Empate"})
                  </span>
                )}
                {isExact && (
                  <span className="text-emerald-400 text-[10px] font-semibold">
                    → ¡ACERTÓ TODO! 10% de descuento
                  </span>
                )}
                {isCorrect && !isExact && (
                  <span className="text-[#d4af37] text-[10px] font-semibold">
                    → Acertó ganador. 5% de descuento
                  </span>
                )}
                {isEvaluated && !isCorrect && !isExact && (
                  <span className="text-rose-400/60 text-[10px] font-semibold">
                    → No acertó
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Catalog Tab (admin) ────────────────────────────────────────────────────
//
// Full inline-editing catalog management. Lists every perfume in the
// PerfumeCatalog table (synced from perfumes.ts via POST /api/admin/catalog).
//
// Per-row editing:
//   - Price input (number, empty = null = "No Disponible")
//   - Available toggle (green/red dot)
//   - Temporal discount selector (None / 5% / 10% + optional label)
//   - Notes input (collapsible)
//   - Save button (PUT /api/admin/catalog/:perfumeId)
//   - Unsaved-changes indicator
//
// Bulk actions (visible when any row is selected):
//   - "Seleccionar todo" checkbox
//   - Bulk price update
//   - Bulk availability toggle

interface CatalogTabProps {
  items: CatalogItem[];
  stats: CatalogStats | null;
  loading: boolean;
  error: string;
  search: string;
  onSearch: (q: string) => void;
  brand: string;
  onBrand: (b: string) => void;
  syncing: boolean;
  onSync: () => void;
  onRetry: () => void;
  onUpdateItem: (perfumeId: number, patch: Partial<CatalogItem>) => void;
  onBulkUpdate: (
    updates: Array<{
      perfumeId: number;
      price?: number | null;
      available?: boolean;
      temporalDiscountPct?: number;
      temporalDiscountLabel?: string | null;
      notes?: string | null;
    }>
  ) => Promise<boolean>;
}

function CatalogTab({
  items,
  stats,
  loading,
  error,
  search,
  onSearch,
  brand,
  onBrand,
  syncing,
  onSync,
  onRetry,
  onUpdateItem,
  onBulkUpdate,
}: CatalogTabProps) {
  // Brand list derived from items
  const brandList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.brand));
    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  // Filtered list (search + brand)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (brand !== "Todas" && i.brand !== brand) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        String(i.perfumeId) === q
      );
    });
  }, [items, search, brand]);

  // Selected perfumeIds (for bulk actions)
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const allSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.perfumeId));
  const someSelected = selected.size > 0;

  // Bulk action panel state
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkAvailable, setBulkAvailable] = useState<boolean | null>(null);
  const [bulkTemporalPct, setBulkTemporalPct] = useState<number | "">("");
  const [bulkApplying, setBulkApplying] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Clear selection when filters change
  useEffect(() => {
    setSelected(new Set());
    setBulkResult(null);
  }, [search, brand]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.perfumeId)));
    }
  };

  const handleBulkApply = async () => {
    if (selected.size === 0) return;
    setBulkApplying(true);
    setBulkResult(null);
    try {
      const updates: Array<{
        perfumeId: number;
        price?: number | null;
        available?: boolean;
        temporalDiscountPct?: number;
        temporalDiscountLabel?: string | null;
      }> = [];
      for (const id of selected) {
        const u: {
          perfumeId: number;
          price?: number | null;
          available?: boolean;
          temporalDiscountPct?: number;
          temporalDiscountLabel?: string | null;
        } = { perfumeId: id };
        if (bulkPrice.trim() !== "") {
          const n = Number(bulkPrice);
          if (Number.isFinite(n) && n >= 0) u.price = n;
        }
        if (bulkAvailable !== null) u.available = bulkAvailable;
        if (bulkTemporalPct !== "") u.temporalDiscountPct = bulkTemporalPct as number;
        if (Object.keys(u).length > 1) updates.push(u);
      }
      if (updates.length === 0) {
        setBulkResult({ ok: false, msg: "No hay cambios para aplicar." });
        return;
      }
      const ok = await onBulkUpdate(updates);
      if (ok) {
        setBulkResult({ ok: true, msg: `${updates.length} perfume(s) actualizados.` });
        setSelected(new Set());
        setBulkPrice("");
        setBulkAvailable(null);
        setBulkTemporalPct("");
      } else {
        setBulkResult({ ok: false, msg: "Algunas actualizaciones fallaron. Revisa la consola." });
      }
    } catch (err) {
      console.error("[admin catalog bulk] error:", err);
      setBulkResult({ ok: false, msg: "Error al aplicar cambios." });
    } finally {
      setBulkApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#d4af37]" />
        <span className="ml-3 text-sm text-white/50 font-[family-name:var(--font-inter)]">
          Cargando catálogo…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-red-300 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-xs hover:bg-[#d4af37]/25 transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Stats + Sync row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap text-xs font-[family-name:var(--font-inter)]">
          {stats && (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                <Check className="w-3 h-3" />
                {stats.priced} con precio
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300">
                <AlertTriangle className="w-3 h-3" />
                {stats.unpriced} sin precio
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300">
                <X className="w-3 h-3" />
                {stats.unavailable} no disponibles
              </span>
              {stats.temporalDiscounts > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-300">
                  <Tag className="w-3 h-3" />
                  {stats.temporalDiscounts} con oferta temporal
                </span>
              )}
              <span className="text-white/40">· {stats.total} total</span>
            </>
          )}
        </div>
        <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-xs hover:bg-[#d4af37]/25 transition-all disabled:opacity-50 font-[family-name:var(--font-inter)] flex-shrink-0"
          title="Sincroniza el catálogo de perfumes.ts + priceMapping.ts con la base de datos (inserta los nuevos, no sobrescribe los existentes)"
        >
          {syncing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Sincronizando…
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              Sincronizar con catálogo
            </>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por nombre, marca o ID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/30 text-sm font-[family-name:var(--font-inter)] focus:outline-none focus:border-[#d4af37]/40 focus:bg-white/[0.05] transition-all"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/60 font-[family-name:var(--font-inter)] flex-shrink-0">
          <Package className="w-3.5 h-3.5 text-[#d4af37]/60" />
          {search || brand !== "Todas"
            ? `${filtered.length} de ${items.length}`
            : `${items.length} perfumes`}
        </div>
      </div>

      {/* Brand filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 admin-scroll">
        {brandList.map((b) => (
          <button
            key={b}
            onClick={() => onBrand(b)}
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

      {/* Bulk actions bar (visible when something is selected) */}
      {someSelected && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-[#d4af37]/8 to-transparent border border-[#d4af37]/25">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-[#d4af37] font-[family-name:var(--font-inter)] font-semibold">
              <Check className="w-4 h-4" />
              {selected.size} perfume(s) seleccionado(s)
            </div>
            <button
              onClick={() => setSelected(new Set())}
              className="text-[11px] text-white/50 hover:text-white/80 font-[family-name:var(--font-inter)]"
            >
              Limpiar selección
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {/* Bulk price */}
            <label className="block">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-[family-name:var(--font-inter)]">
                Precio (USD)
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="Ej: 54"
                className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-all"
              />
            </label>
            {/* Bulk available */}
            <label className="block">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-[family-name:var(--font-inter)]">
                Disponibilidad
              </span>
              <select
                value={bulkAvailable === null ? "" : bulkAvailable ? "yes" : "no"}
                onChange={(e) => {
                  const v = e.target.value;
                  setBulkAvailable(v === "yes" ? true : v === "no" ? false : null);
                }}
                className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 outline-none transition-all"
              >
                <option value="">— Sin cambio —</option>
                <option value="yes">Disponible</option>
                <option value="no">No disponible</option>
              </select>
            </label>
            {/* Bulk temporal discount */}
            <label className="block">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-[family-name:var(--font-inter)]">
                Descuento temporal
              </span>
              <select
                value={bulkTemporalPct === "" ? "" : String(bulkTemporalPct)}
                onChange={(e) => {
                  const v = e.target.value;
                  setBulkTemporalPct(v === "" ? "" : Number(v));
                }}
                className="mt-1 w-full px-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-lg text-white text-sm font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 outline-none transition-all"
              >
                <option value="">— Sin cambio —</option>
                <option value="0">Sin descuento</option>
                <option value="5">5%</option>
                <option value="10">10%</option>
              </select>
            </label>
            {/* Apply button */}
            <div className="flex items-end">
              <button
                onClick={handleBulkApply}
                disabled={bulkApplying}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black text-xs font-bold font-[family-name:var(--font-inter)] hover:from-[#e0c04a] hover:to-[#c8a634] transition-all active:scale-95 disabled:opacity-50"
              >
                {bulkApplying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Aplicando…
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Aplicar a {selected.size}
                  </>
                )}
              </button>
            </div>
          </div>
          {bulkResult && (
            <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 font-[family-name:var(--font-inter)] ${
              bulkResult.ok
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
            }`}>
              {bulkResult.ok ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{bulkResult.msg}</span>
            </div>
          )}
        </div>
      )}

      {/* Select-all row */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-3 mb-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="w-4 h-4 accent-[#d4af37] cursor-pointer"
            aria-label="Seleccionar todo"
          />
          <span className="text-xs text-white/60 font-[family-name:var(--font-inter)]">
            {allSelected ? "Todos seleccionados" : "Seleccionar todo"} ({filtered.length})
          </span>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Package className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40 font-[family-name:var(--font-inter)]">
            {search || brand !== "Todas"
              ? "Sin resultados para tu búsqueda."
              : "El catálogo está vacío. Pulsa «Sincronizar con catálogo» para importar."}
          </p>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-380px)] overflow-y-auto pr-1 -mr-1 admin-scroll">
          <div className="space-y-2">
            {filtered.map((item) => (
              <CatalogItemCard
                key={item.perfumeId}
                item={item}
                selected={selected.has(item.perfumeId)}
                onToggleSelect={() => toggleSelect(item.perfumeId)}
                onUpdate={onUpdateItem}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Catalog Item Card (one row, inline editing) ────────────────────────────

interface CatalogItemCardProps {
  item: CatalogItem;
  selected: boolean;
  onToggleSelect: () => void;
  onUpdate: (perfumeId: number, patch: Partial<CatalogItem>) => void;
}

function CatalogItemCard({ item, selected, onToggleSelect, onUpdate }: CatalogItemCardProps) {
  // Local edit state — initialized from the item, reset when item changes
  const [priceInput, setPriceInput] = useState<string>(
    item.price === null ? "" : String(item.price)
  );
  const [available, setAvailable] = useState<boolean>(item.available);
  const [temporalPct, setTemporalPct] = useState<number>(item.temporalDiscountPct);
  const [temporalLabel, setTemporalLabel] = useState<string>(item.temporalDiscountLabel || "");
  const [notes, setNotes] = useState<string>(item.notes || "");
  const [showNotes, setShowNotes] = useState<boolean>(!!item.notes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Reset local state if the item changes externally (e.g. after bulk update + reload)
  useEffect(() => {
    setPriceInput(item.price === null ? "" : String(item.price));
    setAvailable(item.available);
    setTemporalPct(item.temporalDiscountPct);
    setTemporalLabel(item.temporalDiscountLabel || "");
    setNotes(item.notes || "");
    setShowNotes(!!item.notes);
    setError("");
    setSuccess(false);
  }, [item.perfumeId, item.price, item.available, item.temporalDiscountPct, item.temporalDiscountLabel, item.notes]);

  // Compute "dirty" status: any local field differs from the saved item
  const dirty = useMemo(() => {
    const priceChanged =
      (priceInput.trim() === "" ? null : Number(priceInput)) !== item.price;
    const availableChanged = available !== item.available;
    const temporalPctChanged = temporalPct !== item.temporalDiscountPct;
    const temporalLabelChanged =
      (temporalLabel.trim() || null) !== (item.temporalDiscountLabel || null);
    const notesChanged = (notes.trim() || null) !== (item.notes || null);
    return priceChanged || availableChanged || temporalPctChanged || temporalLabelChanged || notesChanged;
  }, [priceInput, available, temporalPct, temporalLabel, notes, item]);

  const handleSave = async () => {
    setError("");
    setSuccess(false);
    const patch: {
      price?: number | null;
      available?: boolean;
      temporalDiscountPct?: number;
      temporalDiscountLabel?: string | null;
      notes?: string | null;
    } = {};

    // Price
    const trimmedPrice = priceInput.trim();
    if (trimmedPrice === "") {
      if (item.price !== null) patch.price = null;
    } else {
      const n = Number(trimmedPrice);
      if (!Number.isFinite(n) || n < 0) {
        setError("Precio inválido.");
        return;
      }
      if (n !== item.price) patch.price = Math.round(n * 100) / 100;
    }

    if (available !== item.available) patch.available = available;
    if (temporalPct !== item.temporalDiscountPct) patch.temporalDiscountPct = temporalPct;
    const newLabel = temporalLabel.trim() || null;
    if (newLabel !== (item.temporalDiscountLabel || null)) {
      patch.temporalDiscountLabel = newLabel;
    }
    const newNotes = notes.trim() || null;
    if (newNotes !== (item.notes || null)) {
      patch.notes = newNotes;
    }

    if (Object.keys(patch).length === 0) {
      setError("No hay cambios para guardar.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/catalog/${item.perfumeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar");
        return;
      }
      // Update local state from the response so dirty flag clears
      const updated = data.item as CatalogItem;
      onUpdate(item.perfumeId, {
        price: updated.price,
        available: updated.available,
        temporalDiscountPct: updated.temporalDiscountPct,
        temporalDiscountLabel: updated.temporalDiscountLabel,
        notes: updated.notes,
        updatedAt: updated.updatedAt,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("[admin catalog item save] error:", err);
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`rounded-xl border transition-all ${
      selected
        ? "bg-[#d4af37]/5 border-[#d4af37]/30"
        : dirty
          ? "bg-amber-500/[0.03] border-amber-500/20"
          : "bg-white/[0.02] border-white/[0.06]"
    }`}>
      <div className="p-3 sm:p-4 flex flex-col gap-3">
        {/* Header row: checkbox + name + brand + ID */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="mt-1 w-4 h-4 accent-[#d4af37] cursor-pointer flex-shrink-0"
            aria-label={`Seleccionar ${item.name}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-white/90 font-[family-name:var(--font-playfair)] truncate">
                {item.name}
              </h3>
              {dirty && (
                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-[family-name:var(--font-inter)] font-semibold">
                  <Pencil className="w-2.5 h-2.5" />
                  Sin guardar
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[10px] text-white/40 font-[family-name:var(--font-inter)]">
              <span className="text-[#d4af37]/80 font-semibold tracking-[0.1em] uppercase">
                {item.brand}
              </span>
              <span className="text-white/20">·</span>
              <span>ID: {item.perfumeId}</span>
              {item.temporalDiscountPct > 0 && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="inline-flex items-center gap-1 text-orange-300">
                    <Tag className="w-2.5 h-2.5" />
                    Oferta {item.temporalDiscountPct}%
                  </span>
                </>
              )}
            </div>
          </div>
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-black text-xs font-bold font-[family-name:var(--font-inter)] hover:from-[#e0c04a] hover:to-[#c8a634] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            title={dirty ? "Guardar cambios" : "Sin cambios"}
          >
            {saving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : success ? (
              <Check className="w-3 h-3" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">
              {saving ? "Guardando" : success ? "Guardado" : "Guardar"}
            </span>
          </button>
        </div>

        {/* Edit row: price + available + temporal discount */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Price */}
          <label className="block">
            <span className="text-[9px] text-white/40 uppercase tracking-wider font-[family-name:var(--font-inter)]">
              Precio USD
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder="Vacío = No disponible"
              className="mt-0.5 w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-md text-white text-xs font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-all"
            />
          </label>

          {/* Available */}
          <label className="block">
            <span className="text-[9px] text-white/40 uppercase tracking-wider font-[family-name:var(--font-inter)]">
              Disponibilidad
            </span>
            <button
              type="button"
              onClick={() => setAvailable((a) => !a)}
              className={`mt-0.5 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium font-[family-name:var(--font-inter)] border transition-all ${
                available
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
              }`}
            >
              <CircleDot className="w-3 h-3" />
              {available ? "Disponible" : "No disponible"}
            </button>
          </label>

          {/* Temporal discount % */}
          <label className="block">
            <span className="text-[9px] text-white/40 uppercase tracking-wider font-[family-name:var(--font-inter)]">
              Oferta temporal
            </span>
            <select
              value={temporalPct}
              onChange={(e) => setTemporalPct(Number(e.target.value))}
              className="mt-0.5 w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-md text-white text-xs font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 outline-none transition-all"
            >
              <option value={0}>Ninguna</option>
              <option value={5}>5%</option>
              <option value={10}>10%</option>
            </select>
          </label>

          {/* Temporal discount label */}
          <label className="block">
            <span className="text-[9px] text-white/40 uppercase tracking-wider font-[family-name:var(--font-inter)]">
              Etiqueta oferta
            </span>
            <input
              type="text"
              value={temporalLabel}
              onChange={(e) => setTemporalLabel(e.target.value)}
              disabled={temporalPct === 0}
              placeholder="Ej: Oferta del día"
              className="mt-0.5 w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-md text-white text-xs font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 outline-none transition-all disabled:opacity-40"
            />
          </label>
        </div>

        {/* Notes (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setShowNotes((s) => !s)}
            className="text-[10px] text-white/40 hover:text-white/70 font-[family-name:var(--font-inter)] flex items-center gap-1"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showNotes ? "rotate-180" : ""}`} />
            Notas {item.notes ? "(1)" : ""}
          </button>
          {showNotes && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas internas sobre este perfume (no se muestran al cliente)…"
              rows={2}
              className="mt-1.5 w-full px-2.5 py-1.5 bg-[#0a0a0a] border border-[#d4af37]/15 rounded-md text-white text-xs font-[family-name:var(--font-inter)] focus:border-[#d4af37]/50 outline-none transition-all resize-y min-h-[44px]"
            />
          )}
        </div>

        {/* Error / success message */}
        {error && (
          <div className="text-[11px] text-rose-300 font-[family-name:var(--font-inter)] flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
