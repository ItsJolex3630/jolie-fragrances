/**
 * PUT    /api/admin/catalog/perfumes/:perfumeId   → update a perfume (all fields)
 * DELETE /api/admin/catalog/perfumes/:perfumeId   → soft-delete (isActive=0)
 *
 * Admin-only (requireAdmin).
 *
 * PUT body (all fields optional — only supplied fields are updated):
 *   {
 *     "name"?: string,
 *     "brand"?: string,
 *     "gender"?: "Dama" | "Caballero" | "Unisex" | null,
 *     "size"?: string | null,
 *     "fragranticaUrl"?: string,        // URL — server extracts the ID
 *     "fragranticaId"?: number | null,  // or pass the ID directly
 *     "price"?: number | null,
 *     "available"?: boolean,
 *     "concentration"?: string | null,
 *     "notes"?: string | null,
 *     "temporalDiscountPct"?: number,
 *     "temporalDiscountLabel"?: string | null,
 *     "isActive"?: boolean,
 *     "brandSlug"?: string | null,      // optional override
 *     "perfumeSlug"?: string | null     // optional override
 *   }
 *
 * When `fragranticaUrl` is provided, the server extracts the numeric ID
 * from it (overriding `fragranticaId` if both are set). When `name` or
 * `brand` change, the corresponding slug is regenerated unless an
 * explicit `brandSlug`/`perfumeSlug` is supplied.
 *
 * DELETE: soft-deletes the perfume (sets isActive=0). The row stays in
 * the DB (so the admin can re-enable it) but disappears from the
 * storefront catalog. Pass `?hard=true` to permanently remove the row
 * instead — use with caution.
 */
import { NextRequest, NextResponse } from "next/server";
import { rawDb } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ perfumeId: string }> };

// ─── Helpers (mirror the ones in route.ts) ───────────────────────────────────

function extractFragranticaId(url: string): number | null {
  if (!url) return null;
  const cleaned = url.trim().split(/[?#]/)[0].replace(/\.html?$/i, "");
  const m = cleaned.match(/-(\d{2,12})$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function slugify(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── PUT: update perfume ─────────────────────────────────────────────────────

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
        { error: "Perfume no encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const update: {
      name?: string;
      brand?: string;
      gender?: string | null;
      size?: string | null;
      fragranticaId?: number | null;
      concentration?: string | null;
      brandSlug?: string | null;
      perfumeSlug?: string | null;
      price?: number | null;
      available?: boolean;
      temporalDiscountPct?: number;
      temporalDiscountLabel?: string | null;
      notes?: string | null;
      isActive?: boolean;
    } = {};

    // ── name ──
    if (typeof body.name === "string") {
      const n = body.name.trim();
      if (!n) {
        return NextResponse.json(
          { error: "El nombre no puede estar vacío" },
          { status: 400 }
        );
      }
      update.name = n;
    }

    // ── brand ──
    if (typeof body.brand === "string") {
      const b = body.brand.trim();
      if (!b) {
        return NextResponse.json(
          { error: "La marca no puede estar vacía" },
          { status: 400 }
        );
      }
      update.brand = b;
    }

    // ── gender ──
    if (body.gender !== undefined) {
      const validGenders = ["Dama", "Caballero", "Unisex"];
      if (body.gender === null) {
        update.gender = null;
      } else if (
        typeof body.gender === "string" &&
        validGenders.includes(body.gender)
      ) {
        update.gender = body.gender;
      } else {
        return NextResponse.json(
          { error: "Género inválido (debe ser Dama, Caballero o Unisex)" },
          { status: 400 }
        );
      }
    }

    // ── size ──
    if (body.size !== undefined) {
      update.size =
        typeof body.size === "string" && body.size.trim()
          ? body.size.trim()
          : null;
    }

    // ── fragranticaId / fragranticaUrl ──
    // URL takes precedence over the raw ID.
    if (typeof body.fragranticaUrl === "string" && body.fragranticaUrl.trim()) {
      const id = extractFragranticaId(body.fragranticaUrl);
      if (!id) {
        return NextResponse.json(
          { error: "No se pudo extraer el ID de Fragrantica de la URL" },
          { status: 400 }
        );
      }
      update.fragranticaId = id;
    } else if (body.fragranticaId !== undefined) {
      if (body.fragranticaId === null) {
        update.fragranticaId = null;
      } else {
        const id = Number(body.fragranticaId);
        if (!Number.isFinite(id) || id <= 0) {
          return NextResponse.json(
            { error: "fragranticaId inválido" },
            { status: 400 }
          );
        }
        update.fragranticaId = id;
      }
    }

    // ── concentration ──
    if (body.concentration !== undefined) {
      update.concentration =
        typeof body.concentration === "string" && body.concentration.trim()
          ? body.concentration.trim()
          : null;
    }

    // ── price ──
    if (body.price === null) {
      update.price = null;
    } else if (body.price !== undefined && body.price !== "") {
      const n = typeof body.price === "string" ? Number(body.price) : body.price;
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json(
          { error: "Precio inválido — debe ser un número positivo o null" },
          { status: 400 }
        );
      }
      update.price = Math.round(n * 100) / 100;
    }

    // ── available ──
    if (body.available !== undefined) {
      update.available = !!body.available;
    }

    // ── temporalDiscountPct ──
    if (body.temporalDiscountPct !== undefined) {
      const pct = Math.round(Number(body.temporalDiscountPct));
      if (!Number.isFinite(pct) || pct < 0 || pct > 99) {
        return NextResponse.json(
          { error: "Descuento temporal inválido (0–99)" },
          { status: 400 }
        );
      }
      update.temporalDiscountPct = pct;
      if (pct === 0) update.temporalDiscountLabel = null;
    }

    // ── temporalDiscountLabel ──
    if (body.temporalDiscountLabel !== undefined) {
      const label =
        typeof body.temporalDiscountLabel === "string"
          ? body.temporalDiscountLabel.trim()
          : "";
      update.temporalDiscountLabel = label || null;
    }

    // ── notes ──
    if (body.notes !== undefined) {
      const notes =
        typeof body.notes === "string" ? body.notes.trim() : "";
      update.notes = notes || null;
    }

    // ── isActive ──
    if (body.isActive !== undefined) {
      update.isActive = !!body.isActive;
    }

    // ── Slugs ──
    // Auto-regenerate from name/brand unless the caller passed an explicit slug.
    if (update.name !== undefined && body.perfumeSlug === undefined) {
      update.perfumeSlug = slugify(update.name);
    }
    if (update.brand !== undefined && body.brandSlug === undefined) {
      update.brandSlug = slugify(update.brand);
    }
    if (typeof body.brandSlug === "string") {
      update.brandSlug = body.brandSlug.trim() || null;
    }
    if (typeof body.perfumeSlug === "string") {
      update.perfumeSlug = body.perfumeSlug.trim() || null;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    const updated = await rawDb.perfumeCatalog.update(perfumeId, update);
    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("[admin perfumes PUT] error:", err);
    return NextResponse.json(
      { error: "Error al actualizar el perfume" },
      { status: 500 }
    );
  }
}

// ─── DELETE: soft-delete (or hard-delete with ?hard=true) ────────────────────

export async function DELETE(req: NextRequest, { params }: Params) {
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
        { error: "Perfume no encontrado" },
        { status: 404 }
      );
    }

    const url = new URL(req.url);
    const hard = url.searchParams.get("hard") === "true";

    if (hard) {
      const ok = await rawDb.perfumeCatalog.hardDelete(perfumeId);
      if (!ok) {
        return NextResponse.json(
          { error: "No se pudo eliminar el perfume" },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true, hard: true, perfumeId });
    }

    // Default: soft-delete
    const updated = await rawDb.perfumeCatalog.delete(perfumeId);
    return NextResponse.json({ ok: true, item: updated });
  } catch (err) {
    console.error("[admin perfumes DELETE] error:", err);
    return NextResponse.json(
      { error: "Error al eliminar el perfume" },
      { status: 500 }
    );
  }
}
