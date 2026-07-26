/**
 * GET  /api/admin/catalog           → list all perfume catalog entries
 * POST /api/admin/catalog           → sync catalog from perfumes.ts + RETAIL_PRICES
 *
 * Both routes are admin-only (requireAdmin).
 *
 * Migrated to rawDb (@libsql/client).
 */
import { NextResponse } from "next/server";
import { rawDb } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const items = await rawDb.perfumeCatalog.findAll();
    const total = items.length;
    const priced = items.filter((p) => p.price !== null).length;
    const unavailable = items.filter((p) => !p.available).length;
    return NextResponse.json({
      items,
      stats: {
        total,
        priced,
        unpriced: total - priced,
        unavailable,
        temporalDiscounts: items.filter((p) => p.temporalDiscountPct > 0).length,
      },
    });
  } catch (err) {
    console.error("[admin catalog GET] error:", err);
    return NextResponse.json(
      { error: "Error al cargar el catálogo" },
      { status: 500 }
    );
  }
}

export async function POST() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await rawDb.perfumeCatalog.syncFromCatalog();
    return NextResponse.json({
      ok: true,
      ...result,
      message: `Sincronización completa: ${result.inserted} nuevos, ${result.updated} actualizados de ${result.total} perfumes.`,
    });
  } catch (err) {
    console.error("[admin catalog POST sync] error:", err);
    return NextResponse.json(
      { error: "Error al sincronizar el catálogo" },
      { status: 500 }
    );
  }
}
