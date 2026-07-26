/**
 * PUT  /api/admin/catalog/:perfumeId   → update a single perfume's
 *                                        price / availability /
 *                                        temporal discount / notes
 *
 * Admin-only (requireAdmin). Body fields are all optional:
 *   { price?, available?, temporalDiscountPct?, temporalDiscountLabel?, notes? }
 *
 * - price: number | null (null = "No Disponible")
 * - available: boolean
 * - temporalDiscountPct: 0 | 5 | 10
 * - temporalDiscountLabel: string | null (e.g. "Oferta del día")
 * - notes: string | null
 *
 * Migrated to rawDb (@libsql/client).
 */
import { NextRequest, NextResponse } from "next/server";
import { rawDb } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ perfumeId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { perfumeId: rawId } = await params;
  const perfumeId = Number(rawId);
  if (!Number.isFinite(perfumeId) || perfumeId <= 0) {
    return NextResponse.json(
      { error: "perfumeId inválido" },
      { status: 400 }
    );
  }

  try {
    const existing = await rawDb.perfumeCatalog.findByPerfumeId(perfumeId);
    if (!existing) {
      return NextResponse.json(
        { error: "Perfume no encontrado en el catálogo" },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const update: {
      price?: number | null;
      available?: boolean;
      temporalDiscountPct?: number;
      temporalDiscountLabel?: string | null;
      notes?: string | null;
    } = {};

    // price: number | null
    if (body.price === null) {
      update.price = null;
    } else if (body.price !== undefined) {
      const n = typeof body.price === "string" ? Number(body.price) : body.price;
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json(
          { error: "Precio inválido — debe ser un número positivo o null" },
          { status: 400 }
        );
      }
      update.price = Math.round(n * 100) / 100; // round to cents
    }

    // available: boolean
    if (body.available !== undefined) {
      update.available = !!body.available;
    }

    // temporalDiscountPct: 0 / 5 / 10 (or any 0–99 integer)
    if (body.temporalDiscountPct !== undefined) {
      const pct = Math.round(Number(body.temporalDiscountPct));
      if (!Number.isFinite(pct) || pct < 0 || pct > 99) {
        return NextResponse.json(
          { error: "Descuento temporal inválido (0–99)" },
          { status: 400 }
        );
      }
      update.temporalDiscountPct = pct;
      // If the discount is being set to 0, also clear the label
      if (pct === 0) {
        update.temporalDiscountLabel = null;
      }
    }

    // temporalDiscountLabel: string | null
    if (body.temporalDiscountLabel !== undefined) {
      const label =
        typeof body.temporalDiscountLabel === "string"
          ? body.temporalDiscountLabel.trim()
          : "";
      update.temporalDiscountLabel = label || null;
    }

    // notes: string | null
    if (body.notes !== undefined) {
      const notes =
        typeof body.notes === "string" ? body.notes.trim() : "";
      update.notes = notes || null;
    }

    const updated = await rawDb.perfumeCatalog.update(perfumeId, update);
    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("[admin catalog PUT] error:", err);
    return NextResponse.json(
      { error: "Error al actualizar el perfume" },
      { status: 500 }
    );
  }
}
