/**
 * POST /api/admin/crm/inventory/sync
 * Sincroniza el inventario del CRM con el catálogo de perfumes de la web.
 *
 * Para cada perfume que tenga un precio retail (RETAIL_PRICES):
 *   - Si ya existe un InventoryItem con el mismo name+brand, actualiza el
 *     price + size + marca el status "available" (si estaba "sold" lo deja
 *     así para no revertir ventas históricas).
 *   - Si no existe, crea uno nuevo con status "available".
 *
 * Los perfumes sin precio en RETAIL_PRICES se ignoran (significa que están
 * fuera de catálogo / sin precio definido).
 *
 * Migrated from Prisma to rawDb (@libsql/client) — works on Vercel.
 */
import { NextResponse } from "next/server";
import { rawDb, getRawDbClient } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";
import { perfumes, PERFUME_NOTES, type Note } from "@/lib/perfumes";
import { RETAIL_PRICES } from "@/lib/priceMapping";

function notesToProfile(notes: Note[] | undefined): string | null {
  if (!notes || notes.length === 0) return null;
  return notes.join(" / ");
}

export async function POST() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const existing = await rawDb.inventoryItem.findMany();

    // Index by "name|brand|size" for fast upsert lookup (case-insensitive on name).
    const byKey = new Map<string, typeof existing[number]>();
    for (const item of existing) {
      const key = `${item.name.toLowerCase()}|${(item.brand || "").toLowerCase()}|${(item.size || "").toLowerCase()}`;
      byKey.set(key, item);
    }

    const nowIso = new Date().toISOString();
    let created = 0;
    let updated = 0;
    let skipped = 0;

    const client = getRawDbClient();
    if (!client) {
      return NextResponse.json(
        { error: "Base de datos no disponible" },
        { status: 503 }
      );
    }

    // Build all INSERT/UPDATE statements in a single batch — atomic & fast.
    const stmts: Array<{ sql: string; args: any[] }> = [];

    for (const p of perfumes) {
      const price = RETAIL_PRICES[p.id];
      if (price == null) {
        skipped++;
        continue;
      }

      const key = `${p.name.toLowerCase()}|${(p.brand || "").toLowerCase()}|${(p.size || "").toLowerCase()}`;
      const match = byKey.get(key);
      const olfativeProfile = notesToProfile(PERFUME_NOTES[p.id]);

      if (match) {
        // Update existing item — only update price + size + olfativeProfile.
        // Don't touch status: if it's "sold", keep it sold (don't revive).
        // If it's "available" or "reserved", keep that too.
        stmts.push({
          sql: `UPDATE InventoryItem
                SET price = ?,
                    size = COALESCE(?, size),
                    brand = COALESCE(?, brand),
                    olfativeProfile = COALESCE(?, olfativeProfile),
                    updatedAt = ?
                WHERE id = ?`,
          args: [
            price,
            p.size || null,
            p.brand || null,
            olfativeProfile,
            nowIso,
            match.id,
          ],
        });
        updated++;
      } else {
        // Insert new item.
        // Use a deterministic-ish id so re-running sync doesn't duplicate.
        // (We rely on the byKey index above to dedupe within a single run.)
        const newId = `cat-${p.id}`;
        // Avoid clobbering if the deterministic id already exists in DB
        // but wasn't in our byKey map (e.g. different size string).
        stmts.push({
          sql: `INSERT OR IGNORE INTO InventoryItem
                (id, name, brand, olfativeProfile, size, cost, price, status,
                 customerInterest, notes, acquiredAt, soldAt, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, NULL, ?, 'available', NULL, ?, ?, NULL, ?, ?)`,
          args: [
            newId,
            p.name,
            p.brand || null,
            olfativeProfile,
            p.size || null,
            price,
            `Sincronizado desde catálogo web (id=${p.id}, ${p.gender})`,
            nowIso,
            nowIso,
            nowIso,
          ],
        });
        created++;
      }
    }

    if (stmts.length > 0) {
      await client.batch(stmts);
    }

    return NextResponse.json({
      ok: true,
      summary: {
        catalogTotal: perfumes.length,
        withPrice: perfumes.length - skipped,
        withoutPrice: skipped,
        created,
        updated,
      },
    });
  } catch (err) {
    console.error("[crm inventory sync] error:", err);
    return NextResponse.json(
      { error: "Error al sincronizar inventario con catálogo" },
      { status: 500 }
    );
  }
}
