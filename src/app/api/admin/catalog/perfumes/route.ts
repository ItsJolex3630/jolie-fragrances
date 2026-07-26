/**
 * GET  /api/admin/catalog/perfumes        → list all perfumes (with extended fields)
 * POST /api/admin/catalog/perfumes        → create a new perfume (admin-added)
 *
 * Both routes are admin-only (requireAdmin).
 *
 * The GET endpoint returns ALL PerfumeCatalog rows (active + soft-deleted)
 * so the admin can manage both. The storefront /api/prices route uses
 * `findActive()` to filter out soft-deleted rows.
 *
 * The POST endpoint accepts a JSON body like:
 *   {
 *     "name": "New Perfume Name",
 *     "brand": "Brand Name",
 *     "gender": "Unisex" | "Dama" | "Caballero",
 *     "size": "100ml",
 *     "fragranticaUrl": "https://www.fragrantica.com/perfume/Brand/Perfume-Name-12345.html",
 *     "price": 45,            // optional, null = "Consultar"
 *     "available": true,      // optional, default true
 *     "concentration": "EDP", // optional
 *     "notes": "Optional internal notes"
 *   }
 *
 * It extracts `fragranticaId` from the URL (the number before `.html`),
 * generates `brandSlug` and `perfumeSlug` from name/brand (slugify), and
 * picks a new `perfumeId` starting at 10000 (so admin-added perfumes
 * don't collide with the static catalog's ids 1-273).
 */
import { NextRequest, NextResponse } from "next/server";
import { rawDb } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extract the numeric Fragrantica ID from a perfume URL.
 *
 * Accepts URLs in any of these formats:
 *   https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Intense-Man-34696.html
 *   https://www.fragrantica.es/perfume/Armaf/Club-de-Nuit-Intense-Man-34696.html
 *   https://www.fragrantica.com/perfume/Armaf/Club-de-Nuit-Intense-Man-34696
 *
 * Returns the ID as a number, or null if no ID is found.
 */
function extractFragranticaId(url: string): number | null {
  if (!url) return null;
  // Strip .html extension and any trailing query/hash, then match the
  // trailing -<digits> at the end of the path.
  const cleaned = url.trim().split(/[?#]/)[0].replace(/\.html?$/i, "");
  const m = cleaned.match(/-(\d{2,12})$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Convert a brand or perfume name into a Fragrantica-style URL slug.
 *
 * Examples:
 *   "Club de Nuit Intense Man" → "Club-de-Nuit-Intense-Man"
 *   "Lattafa Perfumes"         → "Lattafa-Perfumes"
 *   "Afnan"                    → "Afnan"
 *
 * Fragrantica uses dashes as separators and preserves case (so we match
 * the slug format the existing static catalog already uses).
 */
function slugify(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, "-")            // spaces → dashes
    .replace(/[^\w\-]/g, "")         // strip non-word chars (keep A-Z a-z 0-9 _ -)
    .replace(/-+/g, "-")             // collapse multiple dashes
    .replace(/^-|-$/g, "");          // trim leading/trailing dashes
}

/**
 * Pick a new perfumeId for an admin-added perfume.
 *
 * Strategy:
 *   1. Find the current MAX(perfumeId) in the table.
 *   2. If max < 10000, return 10000 (the start of the admin-added range).
 *   3. Otherwise return max + 1.
 *
 * This guarantees admin-added perfumes never collide with the static
 * catalog's ids (1-273 as of writing) and stay grouped together in the
 * 10000+ range.
 */
async function nextPerfumeId(): Promise<number> {
  // We can't easily do SELECT MAX(perfumeId) via the typed client, so we
  // pull all rows and reduce. The catalog is ~260 rows so this is cheap.
  const rows = await rawDb.perfumeCatalog.findAll();
  let max = 0;
  for (const r of rows) {
    if (r.perfumeId > max) max = r.perfumeId;
  }
  return max < 10000 ? 10000 : max + 1;
}

// ─── GET: list all perfumes ──────────────────────────────────────────────────

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const items = await rawDb.perfumeCatalog.findAll();
    return NextResponse.json({
      items,
      count: items.length,
    });
  } catch (err) {
    console.error("[admin perfumes GET] error:", err);
    return NextResponse.json(
      { error: "Error al cargar los perfumes" },
      { status: 500 }
    );
  }
}

// ─── POST: create a new perfume ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    // ── Validate required fields ──
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const brand = typeof body.brand === "string" ? body.brand.trim() : "";
    if (!name) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }
    if (!brand) {
      return NextResponse.json(
        { error: "La marca es obligatoria" },
        { status: 400 }
      );
    }

    // ── Validate gender ──
    const validGenders = ["Dama", "Caballero", "Unisex"];
    const gender =
      typeof body.gender === "string" && validGenders.includes(body.gender)
        ? body.gender
        : null;
    if (!gender) {
      return NextResponse.json(
        { error: "Género inválido (debe ser Dama, Caballero o Unisex)" },
        { status: 400 }
      );
    }

    // ── Validate size ──
    const size = typeof body.size === "string" ? body.size.trim() : "";
    if (!size) {
      return NextResponse.json(
        { error: "El tamaño es obligatorio (ej: 100ml)" },
        { status: 400 }
      );
    }

    // ── Extract fragranticaId from URL ──
    const fragranticaUrl =
      typeof body.fragranticaUrl === "string" ? body.fragranticaUrl.trim() : "";
    if (!fragranticaUrl) {
      return NextResponse.json(
        { error: "La URL de Fragrantica es obligatoria" },
        { status: 400 }
      );
    }
    const fragranticaId = extractFragranticaId(fragranticaUrl);
    if (!fragranticaId) {
      return NextResponse.json(
        { error: "No se pudo extraer el ID de Fragrantica de la URL. Verifica que la URL termine en -<número>.html" },
        { status: 400 }
      );
    }

    // ── Validate price (optional) ──
    let price: number | null = null;
    if (body.price !== undefined && body.price !== null && body.price !== "") {
      const n = typeof body.price === "string" ? Number(body.price) : body.price;
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json(
          { error: "Precio inválido — debe ser un número positivo o null" },
          { status: 400 }
        );
      }
      price = Math.round(n * 100) / 100;
    }

    // ── Validate available (default true) ──
    const available = body.available === false ? false : true;

    // ── Validate concentration (optional) ──
    const concentration =
      typeof body.concentration === "string" && body.concentration.trim()
        ? body.concentration.trim()
        : null;

    // ── Validate notes (optional) ──
    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : null;

    // ── Generate slugs ──
    const brandSlug = slugify(brand);
    const perfumeSlug = slugify(name);

    // ── Pick a new perfumeId ──
    const perfumeId = await nextPerfumeId();

    // ── Insert ──
    const created = await rawDb.perfumeCatalog.create({
      perfumeId,
      name,
      brand,
      price,
      available,
      temporalDiscountPct: 0,
      temporalDiscountLabel: null,
      notes,
      gender,
      size,
      fragranticaId,
      concentration,
      brandSlug,
      perfumeSlug,
      isActive: true,
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    console.error("[admin perfumes POST] error:", err);
    const msg = err instanceof Error ? err.message : "Error al crear el perfume";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
