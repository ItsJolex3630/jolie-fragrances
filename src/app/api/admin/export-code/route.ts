import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, COOKIE_NAME, verifyAdminFromDB } from "@/lib/auth";
import { addSecurityHeaders } from "@/lib/security-headers";
import {
  perfumes as staticPerfumes,
  PERFUME_NOTES,
  BRANDS,
  BRAND_SLUGS,
  type Brand,
  type Note,
} from "@/lib/perfumes";

// ─── Helper: verify admin from DB ───
async function verifyAdminFromDBHelper(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const isAdmin = await verifyAdminFromDB(payload.userId);
  if (!isAdmin) return null;
  return payload;
}

// ─── GET /api/admin/export-code — Generate TypeScript code for DB-only perfumes ───
export async function GET(req: NextRequest) {
  const admin = await verifyAdminFromDBHelper(req);
  if (!admin) {
    return addSecurityHeaders(NextResponse.json(
      { error: "No autorizado — se requieren permisos de administrador" },
      { status: 403 }
    ));
  }

  try {
    const dbPerfumes = await db.perfume.findMany({ orderBy: { id: "asc" } });

    // Build a set of static perfume IDs for fast lookup
    const staticIds = new Set(staticPerfumes.map((p) => p.id));

    // Find DB perfumes not in the static list
    const newPerfumes = dbPerfumes.filter((p) => !staticIds.has(p.id));

    if (newPerfumes.length === 0) {
      return addSecurityHeaders(NextResponse.json({
        code: "// No hay perfumes nuevos en la base de datos para exportar\n",
        count: 0,
        newBrands: [],
      }));
    }

    // Identify new brands not in the static Brand type / BRANDS array / BRAND_SLUGS
    const staticBrandSet = new Set<string>(BRANDS);
    const newBrands: string[] = [];
    for (const p of newPerfumes) {
      if (!staticBrandSet.has(p.brand) && !newBrands.includes(p.brand)) {
        newBrands.push(p.brand);
      }
    }

    const sections: string[] = [];

    if (newBrands.length > 0) {
      const brandTypeAdditions = newBrands.map((b) => `  | "${b}"`).join("\n");
      sections.push(
        `// NUEVOS BRANDS — Agregar al tipo Brand:\n${brandTypeAdditions}\n`
      );
      const brandsAdditions = newBrands.map((b) => `  "${b}",`).join("\n");
      sections.push(`// NUEVOS BRANDS — Agregar al array BRANDS:\n${brandsAdditions}\n`);
      const brandSlugsAdditions = newBrands
        .map((b) => {
          const sample = newPerfumes.find((p) => p.brand === b);
          const slug = sample?.brandSlug ?? b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          return `  "${b}": "${slug}",`;
        })
        .join("\n");
      sections.push(`// NUEVOS BRANDS — Agregar a BRAND_SLUGS:\n${brandSlugsAdditions}\n`);
    }

    const validNotes = new Set<string>([
      "Cítrico", "Dulce", "Amaderado", "Especiado", "Floral",
      "Acuático", "Ámbar", "Ahumado", "Frutal",
    ]);

    const perfumeLines: string[] = [];
    for (const p of newPerfumes) {
      const lines: string[] = [];
      lines.push("  {");
      lines.push(`    id: ${p.id},`);
      lines.push(`    name: "${p.name}",`);
      lines.push(`    brand: "${p.brand}",`);
      lines.push(`    gender: "${p.gender}",`);
      lines.push(`    size: "${p.size}",`);
      if (p.price && p.price > 0) lines.push(`    price: ${p.price},`);
      lines.push(`    fragranticaId: ${p.fragranticaId},`);
      lines.push(`    brandSlug: "${p.brandSlug}",`);
      lines.push(`    perfumeSlug: "${p.perfumeSlug}",`);
      if (p.fragranticaSearchUrl) lines.push(`    fragranticaSearchUrl: "${p.fragranticaSearchUrl}",`);
      lines.push("  },");
      perfumeLines.push(lines.join("\n"));
    }
    sections.push(`// NUEVOS PERFUMES — Agregar al array perfumes:\n${perfumeLines.join("\n")}`);

    const notesEntries: string[] = [];
    for (const p of newPerfumes) {
      if (p.notes) {
        const parsedNotes = p.notes.split(",").map((n) => n.trim()).filter((n) => n.length > 0);
        const validParsedNotes = parsedNotes.filter((n) => validNotes.has(n));
        if (validParsedNotes.length > 0) {
          const notesStr = validParsedNotes.map((n) => `"${n}"`).join(", ");
          notesEntries.push(`  ${p.id}: [${notesStr}], // ${p.name}`);
        }
      }
    }
    if (notesEntries.length > 0) {
      sections.push(`\n// NUEVAS NOTAS — Agregar a PERFUME_NOTES:\n${notesEntries.join("\n")}`);
    }

    const code = sections.join("\n\n");
    return addSecurityHeaders(NextResponse.json({ code, count: newPerfumes.length, newBrands }));
  } catch (error) {
    console.error("Error exporting code:", error);
    return addSecurityHeaders(NextResponse.json(
      { error: "Error al exportar el código TypeScript" },
      { status: 500 }
    ));
  }
}
