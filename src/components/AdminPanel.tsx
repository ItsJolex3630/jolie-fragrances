"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  FlaskConical,
  Mail,
  Calendar,
  Crown,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  Database,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Pencil,
  Search,
  X as XIcon,
  Save,
  DollarSign,
  Code2,
  Copy,
  Check,
  Download,
} from "lucide-react";
import {
  perfumes as staticPerfumes,
  getImageUrl,
  BRANDS,
  GENDERS,
  NOTES,
  NOTES_INFO,
  BRAND_SLUGS,
  type Brand,
  type Gender,
  type Note,
} from "@/lib/perfumes";
import { toast } from "@/hooks/use-toast";

// ─── Gender badge styles ───
const genderStyles: Record<string, string> = {
  Dama: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Caballero: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Unisex: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

// ─── Types ───
interface DbPerfume {
  id: number;
  name: string;
  brand: string;
  gender: string;
  size: string;
  price: number;
  fragranticaId: number;
  brandSlug: string;
  perfumeSlug: string;
  fragranticaSearchUrl?: string;
  notes: string[];
}

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Slug helper ───
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type TabValue = "perfumes" | "add" | "edit" | "users" | "export";

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  // ─── Tab state ───
  const [activeTab, setActiveTab] = useState<TabValue>("perfumes");

  // ─── DB Perfumes state ───
  const [dbPerfumes, setDbPerfumes] = useState<DbPerfume[]>([]);
  const [loadingPerfumes, setLoadingPerfumes] = useState(false);
  const [dbPerfumeCount, setDbPerfumeCount] = useState<number | null>(null);

  // ─── Users state ───
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // ─── Seed/Reset state ───
  const [seeding, setSeeding] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ─── Individual delete state ───
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ─── Add perfume form state ───
  const [addForm, setAddForm] = useState({
    name: "",
    brand: "" as Brand | "",
    gender: "" as Gender | "",
    size: "100ml",
    price: "",
    fragranticaId: "",
    fragranticaUrl: "",
    notes: [] as Note[],
  });
  const [adding, setAdding] = useState(false);

  // ─── Edit state ───
  const [editSearch, setEditSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    brand: "" as string,
    gender: "" as string,
    size: "100ml",
    price: "",
    fragranticaId: "",
    fragranticaUrl: "",
    notes: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  // ─── Export state ───
  const [exportCode, setExportCode] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportCount, setExportCount] = useState(0);
  const [exportNewBrands, setExportNewBrands] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // ─── Fetch DB perfumes ───
  const fetchDbPerfumes = useCallback(async () => {
    setLoadingPerfumes(true);
    try {
      const res = await fetch("/api/perfumes");
      if (res.ok) {
        const data = await res.json();
        setDbPerfumes(data.perfumes || []);
        setDbPerfumeCount(data.count || 0);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingPerfumes(false);
    }
  }, []);

  // ─── Fetch users ───
  const fetchUsers = useCallback(async () => {
    if (!isOpen) return;
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingUsers(false);
    }
  }, [isOpen]);

  // ─── Fetch on tab change ───
  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === "perfumes" || activeTab === "edit") {
      fetchDbPerfumes();
    }
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [isOpen, activeTab, fetchDbPerfumes, fetchUsers]);

  // ─── Also fetch count on open ───
  useEffect(() => {
    if (isOpen) {
      fetchDbPerfumes();
    }
  }, [isOpen, fetchDbPerfumes]);

  // ─── Toggle user expand ───
  const toggleUserExpand = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  // ─── Stats ───
  const totalCatalog = staticPerfumes.length;

  const brandCounts = useMemo(() => {
    return BRANDS.reduce(
      (acc, brand) => {
        acc[brand] = dbPerfumes.filter((p) => p.brand === brand).length;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [dbPerfumes]);

  // ─── Edit filtered perfumes ───
  const filteredEditPerfumes = useMemo(() => {
    if (!editSearch.trim()) return dbPerfumes;
    const query = editSearch.toLowerCase().trim();
    return dbPerfumes.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    );
  }, [dbPerfumes, editSearch]);

  // ─── Auto-generate slugs for add form ───
  const addBrandSlug = useMemo(() => {
    if (!addForm.brand) return "";
    return BRAND_SLUGS[addForm.brand as Brand] || slugify(addForm.brand);
  }, [addForm.brand]);

  const addPerfumeSlug = useMemo(() => {
    if (!addForm.name) return "";
    return slugify(addForm.name);
  }, [addForm.name]);

  // ─── Seed database ───
  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "✅ Base de datos inicializada",
          description: `${data.perfumes} perfumes cargados. Admin ${data.adminCreated ? "creado" : "ya existía"}.`,
        });
        fetchDbPerfumes();
      } else {
        toast({
          title: "Error al inicializar",
          description: data.error || data.message || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive",
      });
    } finally {
      setSeeding(false);
    }
  };

  // ─── Reset database (delete all perfumes) ───
  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/perfumes", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "🗑️ Perfumes eliminados",
          description: `${data.deleted} perfumes eliminados de la base de datos`,
        });
        fetchDbPerfumes();
        setShowResetConfirm(false);
      } else {
        toast({
          title: "Error al eliminar",
          description: data.error || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  // ─── Delete individual perfume ───
  const handleDeletePerfume = async (id: number, name: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/perfumes?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "🗑️ Perfume eliminado",
          description: `"${name}" fue eliminado de la base de datos`,
        });
        fetchDbPerfumes();
      } else {
        toast({
          title: "Error al eliminar",
          description: data.error || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Add new perfume ───
  const handleAddPerfume = async () => {
    if (!addForm.name || !addForm.brand || !addForm.gender || !addForm.fragranticaId) {
      toast({
        title: "Campos incompletos",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      const brandSlug = BRAND_SLUGS[addForm.brand as Brand] || slugify(addForm.brand);
      const perfumeSlug = slugify(addForm.name);

      const res = await fetch("/api/perfumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          brand: addForm.brand,
          gender: addForm.gender,
          size: addForm.size,
          price: addForm.price ? Number(addForm.price) : 0,
          fragranticaId: Number(addForm.fragranticaId),
          brandSlug,
          perfumeSlug,
          fragranticaSearchUrl: addForm.fragranticaUrl.trim() || `https://www.fragrantica.es/search/?query=${encodeURIComponent(addForm.name)}`,
          notes: addForm.notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "✅ Perfume añadido",
          description: `${addForm.name} de ${addForm.brand} fue añadido correctamente`,
        });
        setAddForm({
          name: "",
          brand: "" as Brand | "",
          gender: "" as Gender | "",
          size: "100ml",
          price: "",
          fragranticaId: "",
          fragranticaUrl: "",
          notes: [],
        });
        fetchDbPerfumes();
        setActiveTab("perfumes");
      } else {
        toast({
          title: "Error al añadir",
          description: data.error || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  // ─── Start editing a perfume ───
  const startEditing = (perfume: DbPerfume) => {
    setEditingId(perfume.id);
    setEditForm({
      name: perfume.name,
      brand: perfume.brand,
      gender: perfume.gender,
      size: perfume.size,
      price: perfume.price ? String(perfume.price) : "",
      fragranticaId: String(perfume.fragranticaId),
      fragranticaUrl: perfume.fragranticaSearchUrl || "",
      notes: perfume.notes || [],
    });
  };

  // ─── Cancel editing ───
  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      brand: "",
      gender: "",
      size: "100ml",
      price: "",
      fragranticaId: "",
      fragranticaUrl: "",
      notes: [],
    });
  };

  // ─── Save edited perfume ───
  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { id: editingId };
      if (editForm.name) body.name = editForm.name;
      if (editForm.brand) body.brand = editForm.brand;
      if (editForm.gender) body.gender = editForm.gender;
      if (editForm.size) body.size = editForm.size;
      if (editForm.price) body.price = Number(editForm.price);
      if (editForm.fragranticaId) body.fragranticaId = Number(editForm.fragranticaId);
      if (editForm.fragranticaUrl) body.fragranticaSearchUrl = editForm.fragranticaUrl.trim();
      body.notes = editForm.notes;

      const res = await fetch("/api/perfumes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "✅ Perfume actualizado",
          description: `"${editForm.name}" fue actualizado correctamente`,
        });
        cancelEditing();
        fetchDbPerfumes();
      } else {
        toast({
          title: "Error al actualizar",
          description: data.error || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── Export code ───
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await fetch("/api/admin/export-code");
      if (res.ok) {
        const data = await res.json();
        setExportCode(data.code || "");
        setExportCount(data.count || 0);
        setExportNewBrands(data.newBrands || []);
      } else {
        toast({
          title: "Error al exportar",
          description: "No se pudo generar el código",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(exportCode);
      setCopied(true);
      toast({
        title: "✅ Código copiado",
        description: "El código fue copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([exportCode], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nuevos-perfumes.ts";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "✅ Archivo descargado",
      description: "El archivo nuevos-perfumes.ts fue descargado",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-[#111111] border-[rgba(212,175,55,0.2)] text-white sm:max-w-2xl p-0 max-h-[90vh] overflow-hidden flex flex-col"
        showCloseButton
      >
        {/* Header */}
        <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#111111] px-6 pt-6 pb-4">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
          <DialogHeader>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-[#d4af37]" />
            </div>
            <DialogTitle className="text-center font-[family-name:var(--font-playfair)] text-xl">
              Panel de Administración
            </DialogTitle>
            <DialogDescription className="text-center text-white/40 font-[family-name:var(--font-inter)] text-xs">
              Gestiona perfumes y usuarios
            </DialogDescription>
          </DialogHeader>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 rounded-lg bg-[#0a0a0a] border border-[rgba(212,175,55,0.08)]">
              <p className="text-lg font-bold text-[#d4af37] font-[family-name:var(--font-playfair)]">
                {totalCatalog}
              </p>
              <p className="text-[9px] text-white/30 font-[family-name:var(--font-inter)]">
                Catálogo
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-[#0a0a0a] border border-[rgba(212,175,55,0.08)]">
              <p className="text-lg font-bold text-[#d4af37] font-[family-name:var(--font-playfair)]">
                {dbPerfumeCount ?? "—"}
              </p>
              <p className="text-[9px] text-white/30 font-[family-name:var(--font-inter)]">
                En BD
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-[#0a0a0a] border border-[rgba(212,175,55,0.08)]">
              <p className="text-lg font-bold text-[#d4af37] font-[family-name:var(--font-playfair)]">
                {users.length || "—"}
              </p>
              <p className="text-[9px] text-white/30 font-[family-name:var(--font-inter)]">
                Usuarios
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="w-full"
          >
            <TabsList className="w-full bg-[#0a0a0a] border border-[rgba(212,175,55,0.1)] rounded-lg h-10 p-[3px]">
              <TabsTrigger
                value="perfumes"
                className="flex-1 rounded-md text-xs font-[family-name:var(--font-inter)] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#b8941e] data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-sm text-white/50 gap-1.5"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                Perfumes
              </TabsTrigger>
              <TabsTrigger
                value="add"
                className="flex-1 rounded-md text-xs font-[family-name:var(--font-inter)] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#b8941e] data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-sm text-white/50 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                className="flex-1 rounded-md text-xs font-[family-name:var(--font-inter)] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#b8941e] data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-sm text-white/50 gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex-1 rounded-md text-xs font-[family-name:var(--font-inter)] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#b8941e] data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-sm text-white/50 gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className="flex-1 rounded-md text-xs font-[family-name:var(--font-inter)] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#b8941e] data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-sm text-white/50 gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                Exportar
              </TabsTrigger>
            </TabsList>

            {/* ═══════════════════════════════════════════════════════════════
                TAB 1: PERFUMES — View all
            ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="perfumes" className="mt-4">
              {/* Database actions */}
              <div className="mb-4 p-3 rounded-xl bg-[#0a0a0a] border border-[rgba(212,175,55,0.08)] space-y-3">
                <div className="flex items-center gap-2 text-xs text-white/40 font-[family-name:var(--font-inter)]">
                  <Database className="w-3.5 h-3.5 text-[#d4af37]/50" />
                  Base de datos: {dbPerfumeCount ?? "..."} perfumes
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSeed}
                    disabled={seeding}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8941e] text-[#0a0a0a] font-semibold text-xs font-[family-name:var(--font-inter)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {seeding ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    {dbPerfumeCount && dbPerfumeCount > 0 ? "BD ya inicializada" : "Inicializar BD"}
                  </motion.button>

                  {dbPerfumeCount !== null && dbPerfumeCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowResetConfirm(true)}
                      disabled={resetting}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-[family-name:var(--font-inter)] disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Reset BD
                    </motion.button>
                  )}
                </div>

                {/* Reset confirmation */}
                <AnimatePresence>
                  {showResetConfirm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-red-300 font-[family-name:var(--font-inter)] mb-2">
                            ¿Eliminar TODOS los perfumes de la BD? Esto no afecta el catálogo estático.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleReset}
                              disabled={resetting}
                              className="px-3 py-1.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-[family-name:var(--font-inter)] hover:bg-red-500/30 disabled:opacity-50"
                            >
                              {resetting ? "Eliminando..." : "Sí, eliminar todo"}
                            </button>
                            <button
                              onClick={() => setShowResetConfirm(false)}
                              className="px-3 py-1.5 rounded-md bg-white/5 text-white/40 text-[10px] font-[family-name:var(--font-inter)] hover:bg-white/10"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Brand breakdown */}
              <div className="mb-4">
                <h3 className="text-[10px] text-[#555] tracking-[0.2em] uppercase mb-2 font-[family-name:var(--font-inter)]">
                  Distribución por marca
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {BRANDS.map((brand) => (
                    <div
                      key={brand}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[rgba(212,175,55,0.06)]"
                    >
                      <span className="text-xs text-white/60 font-[family-name:var(--font-inter)] truncate">
                        {brand}
                      </span>
                      <span className="text-xs text-[#d4af37] font-bold font-[family-name:var(--font-inter)]">
                        {brandCounts[brand] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perfumes list from DB */}
              <h3 className="text-[10px] text-[#555] tracking-[0.2em] uppercase mb-2 font-[family-name:var(--font-inter)]">
                Perfumes en BD ({dbPerfumes.length})
              </h3>
              {loadingPerfumes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-[#d4af37] animate-spin" />
                </div>
              ) : dbPerfumes.length === 0 ? (
                <div className="text-center py-8">
                  <FlaskConical className="w-8 h-8 text-[#d4af37]/20 mx-auto mb-2" />
                  <p className="text-white/40 font-[family-name:var(--font-inter)] text-xs">
                    No hay perfumes en la base de datos
                  </p>
                  <p className="text-white/20 font-[family-name:var(--font-inter)] text-[10px] mt-1">
                    Inicializa la BD para cargar los perfumes
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[40vh]">
                  <div className="space-y-1.5 pr-2">
                    {dbPerfumes.map((perfume, index) => (
                      <motion.div
                        key={perfume.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.01, 0.3) }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-[#0a0a0a] border border-[rgba(212,175,55,0.04)] hover:border-[rgba(212,175,55,0.12)] transition-all"
                      >
                        {/* Thumbnail */}
                        <div className="w-9 h-9 rounded-md overflow-hidden bg-[#080808] flex-shrink-0 border border-[rgba(212,175,55,0.06)] flex items-center justify-center">
                          <img
                            src={getImageUrl(perfume.fragranticaId)}
                            alt=""
                            className="w-full h-full object-contain p-0.5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/80 font-[family-name:var(--font-inter)] truncate">
                            {perfume.name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[10px] text-[#d4af37]/50 font-[family-name:var(--font-inter)]">
                              {perfume.brand}
                            </p>
                            {perfume.price > 0 && (
                              <p className="text-[10px] text-white/30 font-[family-name:var(--font-inter)]">
                                • ${perfume.price}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Gender badge */}
                        <span
                          className={`text-[8px] px-1.5 py-0.5 rounded-full border ${genderStyles[perfume.gender] || "bg-white/10 text-white/50 border-white/20"}`}
                        >
                          {perfume.gender}
                        </span>
                        {/* Edit button */}
                        <button
                          onClick={() => {
                            startEditing(perfume);
                            setActiveTab("edit");
                          }}
                          className="p-1.5 rounded-md text-white/20 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeletePerfume(perfume.id, perfume.name)}
                          disabled={deletingId === perfume.id}
                          className="p-1.5 rounded-md text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deletingId === perfume.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
                TAB 2: AÑADIR — Add new perfume
            ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="add" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-[#d4af37]/70 font-[family-name:var(--font-inter)]">
                  <Plus className="w-4 h-4" />
                  Añadir nuevo perfume a la base de datos
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1.5 font-[family-name:var(--font-inter)]">
                    Nombre del perfume *
                  </label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Ej: Oud Wood"
                    className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white placeholder:text-[#444] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1.5 font-[family-name:var(--font-inter)]">
                    Marca *
                  </label>
                  <select
                    value={addForm.brand}
                    onChange={(e) => setAddForm((f) => ({ ...f, brand: e.target.value as Brand }))}
                    className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm appearance-none"
                  >
                    <option value="" className="bg-[#111]">Seleccionar marca...</option>
                    {BRANDS.map((brand) => (
                      <option key={brand} value={brand} className="bg-[#111]">
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender, Size, Price row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1.5 font-[family-name:var(--font-inter)]">
                      Género *
                    </label>
                    <select
                      value={addForm.gender}
                      onChange={(e) => setAddForm((f) => ({ ...f, gender: e.target.value as Gender }))}
                      className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm appearance-none"
                    >
                      <option value="" className="bg-[#111]">Seleccionar...</option>
                      {GENDERS.map((gender) => (
                        <option key={gender} value={gender} className="bg-[#111]">
                          {gender}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1.5 font-[family-name:var(--font-inter)]">
                      Tamaño
                    </label>
                    <select
                      value={addForm.size}
                      onChange={(e) => setAddForm((f) => ({ ...f, size: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm appearance-none"
                    >
                      {["50ml", "75ml", "100ml", "105ml", "125ml", "150ml", "200ml", "250ml"].map((s) => (
                        <option key={s} value={s} className="bg-[#111]">{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1.5 font-[family-name:var(--font-inter)]">
                      Precio
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]/50 text-sm font-[family-name:var(--font-inter)]">$</span>
                      <input
                        type="number"
                        value={addForm.price}
                        onChange={(e) => setAddForm((f) => ({ ...f, price: e.target.value }))}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-2.5 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white placeholder:text-[#444] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Fragrantica ID */}
                <div>
                  <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1.5 font-[family-name:var(--font-inter)]">
                    Fragrantica ID *
                  </label>
                  <input
                    type="number"
                    value={addForm.fragranticaId}
                    onChange={(e) => setAddForm((f) => ({ ...f, fragranticaId: e.target.value }))}
                    placeholder="Ej: 40187"
                    className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white placeholder:text-[#444] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm"
                  />
                  <p className="text-[9px] text-[#555] mt-1 font-[family-name:var(--font-inter)]">
                    Número ID de la URL de Fragrantica
                  </p>
                </div>

                {/* Fragrantica URL */}
                <div>
                  <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1.5 font-[family-name:var(--font-inter)]">
                    Link de Fragrantica
                  </label>
                  <input
                    type="url"
                    value={addForm.fragranticaUrl}
                    onChange={(e) => setAddForm((f) => ({ ...f, fragranticaUrl: e.target.value }))}
                    placeholder="Ej: https://www.fragrantica.com/perfume/Lattafa-Perfumes/Liam-Blue-Shine-85096.html"
                    className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white placeholder:text-[#444] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm"
                  />
                  <p className="text-[9px] text-[#555] mt-1 font-[family-name:var(--font-inter)]">
                    Pegá el link directo de la página del perfume en Fragrantica. Si no se proporciona, se generará un link de búsqueda automáticamente.
                  </p>
                </div>

                {/* Auto-generated slugs info */}
                {addForm.name && addForm.brand && (
                  <div className="flex gap-3 text-[9px] text-white/25 font-[family-name:var(--font-inter)]">
                    <span>brandSlug: <span className="text-[#d4af37]/40">{addBrandSlug}</span></span>
                    <span>perfumeSlug: <span className="text-[#d4af37]/40">{addPerfumeSlug}</span></span>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1.5 font-[family-name:var(--font-inter)]">
                    Notas olfativas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {NOTES.map((note) => {
                      const info = NOTES_INFO[note];
                      const isSelected = addForm.notes.includes(note);
                      return (
                        <button
                          key={note}
                          onClick={() => {
                            setAddForm((f) => ({
                              ...f,
                              notes: isSelected
                                ? f.notes.filter((n) => n !== note)
                                : [...f.notes, note],
                            }));
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-[family-name:var(--font-inter)] transition-all ${
                            isSelected
                              ? `${info.bgColor} ${info.color} ${info.borderColor}`
                              : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/50"
                          }`}
                        >
                          <span>{info.emoji}</span>
                          {note}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview card */}
                {addForm.name && addForm.brand && addForm.fragranticaId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-[#0a0a0a] border border-[rgba(212,175,55,0.1)]"
                  >
                    <p className="text-[9px] text-[#555] tracking-[0.15em] uppercase mb-2 font-[family-name:var(--font-inter)]">
                      Vista previa
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#080808] border border-[rgba(212,175,55,0.08)] flex items-center justify-center">
                        <img
                          src={getImageUrl(Number(addForm.fragranticaId))}
                          alt=""
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-white/90 font-[family-name:var(--font-inter)] font-medium">
                          {addForm.name}
                        </p>
                        <p className="text-xs text-[#d4af37]/70 font-[family-name:var(--font-inter)]">
                          {addForm.brand} • {addForm.gender || "—"} • {addForm.size}
                        </p>
                        {addForm.price && (
                          <p className="text-xs text-white/40 font-[family-name:var(--font-inter)]">
                            ${addForm.price}
                          </p>
                        )}
                        {addForm.notes.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {addForm.notes.map((note) => {
                              const info = NOTES_INFO[note as Note];
                              return info ? (
                                <span key={note} className="text-[9px]">
                                  {info.emoji}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddPerfume}
                  disabled={adding || !addForm.name || !addForm.brand || !addForm.gender || !addForm.fragranticaId}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8941e] text-[#0a0a0a] font-semibold text-sm font-[family-name:var(--font-inter)] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#d4af37]/10"
                >
                  {adding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {adding ? "Añadiendo..." : "Añadir Perfume"}
                </motion.button>
              </div>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
                TAB 3: EDITAR — Edit existing perfume with SEARCH
            ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="edit" className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#d4af37]/70 font-[family-name:var(--font-inter)]">
                  <Pencil className="w-4 h-4" />
                  Buscar y editar perfume
                </div>

                {/* SEARCH BAR */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={editSearch}
                    onChange={(e) => setEditSearch(e.target.value)}
                    placeholder="Buscar por nombre o marca..."
                    className="w-full pl-10 pr-3 py-2.5 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white placeholder:text-[#444] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm"
                  />
                  {editSearch && (
                    <button
                      onClick={() => setEditSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search results count */}
                <p className="text-[9px] text-white/25 font-[family-name:var(--font-inter)]">
                  {editSearch
                    ? `${filteredEditPerfumes.length} resultado${filteredEditPerfumes.length !== 1 ? "s" : ""} para "${editSearch}"`
                    : `${dbPerfumes.length} perfumes en total`}
                </p>

                {/* Loading */}
                {loadingPerfumes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-[#d4af37] animate-spin" />
                  </div>
                ) : filteredEditPerfumes.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 text-[#d4af37]/20 mx-auto mb-2" />
                    <p className="text-white/40 font-[family-name:var(--font-inter)] text-xs">
                      {editSearch ? "No se encontraron perfumes" : "No hay perfumes en la base de datos"}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[40vh]">
                    <div className="space-y-2 pr-2">
                      {filteredEditPerfumes.map((perfume) => (
                        <motion.div
                          key={perfume.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-[rgba(212,175,55,0.06)] bg-[#0a0a0a] overflow-hidden"
                        >
                          {/* Collapsed row */}
                          {editingId !== perfume.id ? (
                            <div className="flex items-center gap-2 p-2.5 hover:bg-[#0d0d0d] transition-colors">
                              {/* Thumbnail */}
                              <div className="w-9 h-9 rounded-md overflow-hidden bg-[#080808] flex-shrink-0 border border-[rgba(212,175,55,0.06)] flex items-center justify-center">
                                <img
                                  src={getImageUrl(perfume.fragranticaId)}
                                  alt=""
                                  className="w-full h-full object-contain p-0.5"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </div>
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-white/80 font-[family-name:var(--font-inter)] truncate">
                                  {perfume.name}
                                </p>
                                <p className="text-[10px] text-[#d4af37]/50 font-[family-name:var(--font-inter)]">
                                  {perfume.brand}
                                  {perfume.price > 0 && ` • $${perfume.price}`}
                                </p>
                              </div>
                              {/* Gender badge */}
                              <span
                                className={`text-[8px] px-1.5 py-0.5 rounded-full border ${genderStyles[perfume.gender] || "bg-white/10 text-white/50 border-white/20"}`}
                              >
                                {perfume.gender}
                              </span>
                              {/* Edit button */}
                              <button
                                onClick={() => startEditing(perfume)}
                                className="p-1.5 rounded-md text-white/20 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            /* Expanded edit form */
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="p-3 space-y-3 border-t border-[rgba(212,175,55,0.1)]"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-[#d4af37] font-[family-name:var(--font-inter)] font-medium">
                                  Editando: {perfume.name}
                                </p>
                                <button
                                  onClick={cancelEditing}
                                  className="p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                                  title="Cancelar"
                                >
                                  <XIcon className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Name */}
                              <div>
                                <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1 font-[family-name:var(--font-inter)]">
                                  Nombre
                                </label>
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm"
                                />
                              </div>

                              {/* Brand & Gender row */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1 font-[family-name:var(--font-inter)]">
                                    Marca
                                  </label>
                                  <select
                                    value={editForm.brand}
                                    onChange={(e) => setEditForm((f) => ({ ...f, brand: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm appearance-none"
                                  >
                                    {BRANDS.map((brand) => (
                                      <option key={brand} value={brand} className="bg-[#111]">
                                        {brand}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1 font-[family-name:var(--font-inter)]">
                                    Género
                                  </label>
                                  <select
                                    value={editForm.gender}
                                    onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm appearance-none"
                                  >
                                    {GENDERS.map((gender) => (
                                      <option key={gender} value={gender} className="bg-[#111]">
                                        {gender}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Size & Price row */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1 font-[family-name:var(--font-inter)]">
                                    Tamaño
                                  </label>
                                  <select
                                    value={editForm.size}
                                    onChange={(e) => setEditForm((f) => ({ ...f, size: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm appearance-none"
                                  >
                                    {["50ml", "75ml", "100ml", "105ml", "125ml", "150ml", "200ml", "250ml"].map((s) => (
                                      <option key={s} value={s} className="bg-[#111]">{s}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1 font-[family-name:var(--font-inter)]">
                                    Precio
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]/50 text-sm font-[family-name:var(--font-inter)]">$</span>
                                    <input
                                      type="number"
                                      value={editForm.price}
                                      onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                                      className="w-full pl-7 pr-3 py-2 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Fragrantica ID */}
                              <div>
                                <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1 font-[family-name:var(--font-inter)]">
                                  Fragrantica ID
                                </label>
                                <input
                                  type="number"
                                  value={editForm.fragranticaId}
                                  onChange={(e) => setEditForm((f) => ({ ...f, fragranticaId: e.target.value }))}
                                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm"
                                />
                              </div>

                              {/* Fragrantica URL */}
                              <div>
                                <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1 font-[family-name:var(--font-inter)]">
                                  Link de Fragrantica
                                </label>
                                <input
                                  type="url"
                                  value={editForm.fragranticaUrl}
                                  onChange={(e) => setEditForm((f) => ({ ...f, fragranticaUrl: e.target.value }))}
                                  placeholder="Ej: https://www.fragrantica.com/perfume/Lattafa-Perfumes/Liam-Blue-Shine-85096.html"
                                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[rgba(212,175,55,0.15)] rounded-lg text-white placeholder:text-[#444] focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none font-[family-name:var(--font-inter)] text-sm"
                                />
                              </div>

                              {/* Notes */}
                              <div>
                                <label className="block text-[10px] text-[#555] tracking-[0.15em] uppercase mb-1 font-[family-name:var(--font-inter)]">
                                  Notas olfativas
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {NOTES.map((note) => {
                                    const info = NOTES_INFO[note];
                                    const isSelected = editForm.notes.includes(note);
                                    return (
                                      <button
                                        key={note}
                                        onClick={() => {
                                          setEditForm((f) => ({
                                            ...f,
                                            notes: isSelected
                                              ? f.notes.filter((n) => n !== note)
                                              : [...f.notes, note],
                                          }));
                                        }}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-[family-name:var(--font-inter)] transition-all ${
                                          isSelected
                                            ? `${info.bgColor} ${info.color} ${info.borderColor}`
                                            : "border-white/10 text-white/30 hover:border-white/20 hover:text-white/50"
                                        }`}
                                      >
                                        <span>{info.emoji}</span>
                                        {note}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Save / Cancel buttons */}
                              <div className="flex gap-2 pt-1">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleSaveEdit}
                                  disabled={saving}
                                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8941e] text-[#0a0a0a] font-semibold text-xs font-[family-name:var(--font-inter)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {saving ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Save className="w-3.5 h-3.5" />
                                  )}
                                  {saving ? "Guardando..." : "Guardar Cambios"}
                                </motion.button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-4 py-2.5 rounded-lg border border-[rgba(212,175,55,0.15)] text-white/50 text-xs font-[family-name:var(--font-inter)] hover:bg-white/5 hover:text-white/70 transition-all"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>

            {/* ═══════════════════════════════════════════════════════════════
                TAB 4: USUARIOS — Users management
            ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="users" className="mt-4">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 text-[#d4af37]/20 mx-auto mb-3" />
                  <p className="text-white/40 font-[family-name:var(--font-inter)] text-sm">
                    No hay usuarios registrados
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[50vh]">
                  <div className="space-y-2 pr-2">
                    {users.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border border-[rgba(212,175,55,0.08)] bg-[#0a0a0a] overflow-hidden"
                      >
                        {/* User row */}
                        <div
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#0d0d0d] transition-colors"
                          onClick={() => toggleUserExpand(user.id)}
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 flex items-center justify-center flex-shrink-0 border border-[rgba(212,175,55,0.15)]">
                            {user.role === "admin" ? (
                              <Crown className="w-4 h-4 text-[#d4af37]" />
                            ) : (
                              <span className="text-xs text-[#d4af37]/70 font-bold font-[family-name:var(--font-inter)]">
                                {(user.name || user.email)[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-white/90 font-[family-name:var(--font-inter)] truncate">
                                {user.name || "Sin nombre"}
                              </p>
                              {user.role === "admin" && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/20 font-[family-name:var(--font-inter)] flex-shrink-0">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-white/30 font-[family-name:var(--font-inter)] truncate">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {expandedUsers.has(user.id) ? (
                              <EyeOff className="w-3.5 h-3.5 text-white/20" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-white/20" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {expandedUsers.has(user.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 pt-1 border-t border-[rgba(212,175,55,0.05)] space-y-2">
                                <div className="flex items-center gap-2 text-xs text-white/40 font-[family-name:var(--font-inter)]">
                                  <Mail className="w-3 h-3 text-[#d4af37]/40" />
                                  {user.email}
                                </div>
                                {user.name && (
                                  <div className="flex items-center gap-2 text-xs text-white/40 font-[family-name:var(--font-inter)]">
                                    <Users className="w-3 h-3 text-[#d4af37]/40" />
                                    {user.name}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-xs text-white/40 font-[family-name:var(--font-inter)]">
                                  <Calendar className="w-3 h-3 text-[#d4af37]/40" />
                                  Registrado:{" "}
                                  {new Date(user.createdAt).toLocaleDateString("es-VE", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/40 font-[family-name:var(--font-inter)]">
                                  <Shield className="w-3 h-3 text-[#d4af37]/40" />
                                  Rol: {user.role}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
            {/* ═══════════════════════════════════════════════════════════════
                TAB 5: EXPORTAR — Export DB perfumes to code
            ═══════════════════════════════════════════════════════════════ */}
            <TabsContent value="export" className="mt-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 text-xs text-[#d4af37]/70 font-[family-name:var(--font-inter)]">
                  <Code2 className="w-4 h-4" />
                  Exportar perfumes al código fuente
                </div>

                {/* Explanation */}
                <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[rgba(212,175,55,0.08)] space-y-2">
                  <p className="text-[11px] text-white/50 font-[family-name:var(--font-inter)] leading-relaxed">
                    Esta herramienta genera código TypeScript con los perfumes añadidos vía admin que <span className="text-[#d4af37]/70">no existen en el código estático</span>. Al cambiar de host, solo el código se mantiene — la base de datos se pierde.
                  </p>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-[#d4af37]/5 border border-[#d4af37]/10">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#d4af37]/50 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[#d4af37]/50 font-[family-name:var(--font-inter)] leading-relaxed">
                      <strong>Pasos:</strong> 1) Genera el código → 2) Cópielo o descárguelo → 3) Pegue el código en <code className="text-[#d4af37]/70 bg-[#d4af37]/10 px-1 rounded">src/lib/perfumes.ts</code> → 4) Al desplegar en nuevo host, los perfumes estarán en el código
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[rgba(212,175,55,0.08)] text-center">
                    <p className="text-xl font-bold text-[#d4af37] font-[family-name:var(--font-playfair)]">
                      {staticPerfumes.length}
                    </p>
                    <p className="text-[9px] text-white/30 font-[family-name:var(--font-inter)]">
                      En código estático
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0a0a0a] border border-[rgba(212,175,55,0.08)] text-center">
                    <p className="text-xl font-bold text-[#d4af37] font-[family-name:var(--font-playfair)]">
                      {dbPerfumeCount ?? "—"}
                    </p>
                    <p className="text-[9px] text-white/30 font-[family-name:var(--font-inter)]">
                      En base de datos
                    </p>
                  </div>
                </div>

                {/* Generate button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  disabled={exportLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8941e] text-[#0a0a0a] font-semibold text-sm font-[family-name:var(--font-inter)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Code2 className="w-4 h-4" />
                  )}
                  {exportLoading ? "Generando código..." : "Generar Código TypeScript"}
                </motion.button>

                {/* Results */}
                {exportCode && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* Result stats */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-300 font-[family-name:var(--font-inter)]">
                          {exportCount} perfume{exportCount !== 1 ? "s" : ""} nuevo{exportCount !== 1 ? "s" : ""} generado{exportCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {exportNewBrands.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-white/30 font-[family-name:var(--font-inter)]">Nuevas marcas:</span>
                          {exportNewBrands.map((b) => (
                            <span key={b} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] font-[family-name:var(--font-inter)]">
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopyCode}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(212,175,55,0.25)] text-[#d4af37] hover:bg-[#d4af37]/10 transition-all text-xs font-[family-name:var(--font-inter)]"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied ? "¡Copiado!" : "Copiar Código"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDownloadCode}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(212,175,55,0.25)] text-[#d4af37] hover:bg-[#d4af37]/10 transition-all text-xs font-[family-name:var(--font-inter)]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Descargar .ts
                      </motion.button>
                    </div>

                    {/* Code preview */}
                    <div className="rounded-xl bg-[#0a0a0a] border border-[rgba(212,175,55,0.08)] overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-[#0d0d0d] border-b border-[rgba(212,175,55,0.06)]">
                        <span className="text-[9px] text-white/30 font-[family-name:var(--font-inter)]">
                          nuevos-perfumes.ts
                        </span>
                        <span className="text-[9px] text-white/20 font-[family-name:var(--font-inter)]">
                          {exportCode.split("\n").length} líneas
                        </span>
                      </div>
                      <ScrollArea className="max-h-[35vh]">
                        <pre className="p-3 text-[10px] text-white/60 font-mono leading-relaxed whitespace-pre overflow-x-auto">
                          {exportCode}
                        </pre>
                      </ScrollArea>
                    </div>
                  </motion.div>
                )}

                {/* Empty state */}
                {exportCode === "" && !exportLoading && dbPerfumeCount !== null && dbPerfumeCount <= staticPerfumes.length && (
                  <div className="text-center py-6">
                    <Database className="w-8 h-8 text-[#d4af37]/20 mx-auto mb-2" />
                    <p className="text-white/40 font-[family-name:var(--font-inter)] text-xs">
                      No hay perfumes nuevos para exportar
                    </p>
                    <p className="text-white/20 font-[family-name:var(--font-inter)] text-[10px] mt-1">
                      Todos los perfumes de la BD ya están en el código estático
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
