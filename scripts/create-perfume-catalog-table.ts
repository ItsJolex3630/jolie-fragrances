/**
 * scripts/create-perfume-catalog-table.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * One-off migration: creates the PerfumeCatalog table (idempotent — uses
 * CREATE TABLE IF NOT EXISTS) and seeds it from perfumes.ts + priceMapping.ts.
 *
 * The table mirrors the in-code catalog so the admin can override prices,
 * availability, and temporal discounts at runtime without redeploying.
 *
 * Run:  bun scripts/create-perfume-catalog-table.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { createClient } from "@libsql/client";
import { perfumes } from "../src/lib/perfumes";
import { RETAIL_PRICES } from "../src/lib/priceMapping";

const DB_URL = process.env.DATABASE_URL || "file:db/custom.db";

async function main() {
  const url = DB_URL.trim();
  const isTurso = url.startsWith("libsql://");
  const authToken = isTurso ? (process.env.TURSO_AUTH_TOKEN || "").trim() : "";
  if (isTurso && !authToken) {
    console.error("[perfumeCatalog] TURSO_AUTH_TOKEN not set — cannot connect to Turso");
    process.exit(1);
  }

  const client = isTurso
    ? createClient({ url, authToken })
    : createClient({ url });

  console.log(
    `[perfumeCatalog] Connecting to ${url.substring(0, 60)}${url.length > 60 ? "..." : ""}`
  );

  // 1) Create the table (idempotent)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS PerfumeCatalog (
      id TEXT PRIMARY KEY NOT NULL,
      perfumeId INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      price REAL,
      available INTEGER NOT NULL DEFAULT 1,
      temporalDiscountPct INTEGER NOT NULL DEFAULT 0,
      temporalDiscountLabel TEXT,
      notes TEXT,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("[perfumeCatalog] ✓ table ensured");

  // 2) Seed (INSERT OR IGNORE so existing rows are preserved)
  const now = new Date().toISOString();
  let inserted = 0;
  for (const p of perfumes) {
    const price = RETAIL_PRICES[p.id] ?? null;
    const available = (p.available ?? true) ? 1 : 0;
    const res = await client.execute({
      sql: `INSERT OR IGNORE INTO PerfumeCatalog
        (id, perfumeId, name, brand, price, available,
         temporalDiscountPct, temporalDiscountLabel, notes, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, 0, NULL, NULL, ?)`,
      args: [`perf_${p.id}`, p.id, p.name, p.brand, price, available, now],
    });
    if ((res as { rowsAffected?: number }).rowsAffected && (res as { rowsAffected: number }).rowsAffected > 0) {
      inserted++;
    }
  }
  console.log(`[perfumeCatalog] ✓ inserted ${inserted} new rows (skipped existing)`);

  // 3) Verify
  const rs = await client.execute("SELECT COUNT(*) AS cnt FROM PerfumeCatalog");
  const cnt = (rs.rows[0] as { cnt?: number | bigint }).cnt;
  console.log(`[perfumeCatalog] ✓ total rows now: ${cnt}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("[perfumeCatalog] ✗ error:", err);
  process.exit(1);
});
