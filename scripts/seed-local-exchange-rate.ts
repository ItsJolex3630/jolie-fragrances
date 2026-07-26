/**
 * scripts/seed-local-exchange-rate.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * One-off script: creates the `ExchangeRate` table in the LOCAL SQLite file
 * used during development (DATABASE_URL=file:.../custom.db) and seeds it with
 * the default row (usdtRate=832.73, bcvRate=701).
 *
 * For Turso (production), run `bun scripts/create-exchange-rate-table.ts`
 * instead — it connects directly to Turso using the hardcoded credentials.
 *
 * Usage:
 *   bun scripts/seed-local-exchange-rate.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { createClient } from "@libsql/client";

const url = "file:/home/z/my-project/db/custom.db";
const client = createClient({ url });

async function run() {
  console.log("[seed-local-exchange-rate] Connecting to local SQLite:", url);

  // List current tables
  const tablesRs = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log(
    "[seed-local-exchange-rate] Current tables:",
    tablesRs.rows.map((r) => r.name).join(", ")
  );

  // Create ExchangeRate table
  await client.execute(
    `CREATE TABLE IF NOT EXISTS "ExchangeRate" (
      id         TEXT PRIMARY KEY NOT NULL,
      usdtRate   REAL NOT NULL,
      bcvRate    REAL NOT NULL,
      updatedBy  TEXT,
      createdAt  TEXT NOT NULL,
      updatedAt  TEXT NOT NULL
    )`
  );
  console.log("  ✓ Created/verified table: ExchangeRate");

  // Seed default row if missing
  const existing = await client.execute({
    sql: 'SELECT id FROM "ExchangeRate" WHERE id = ?',
    args: ["default"],
  });
  if (existing.rows.length === 0) {
    const now = new Date().toISOString();
    await client.execute({
      sql: 'INSERT INTO "ExchangeRate" (id, usdtRate, bcvRate, updatedBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      args: ["default", 832.73, 701, null, now, now],
    });
    console.log("  ✓ Seeded default row: usdtRate=832.73, bcvRate=701");
  } else {
    console.log("  • Default row already exists — skipping seed");
  }

  // Verify
  const verify = await client.execute('SELECT * FROM "ExchangeRate"');
  console.log(
    "[seed-local-exchange-rate] Final rows:",
    JSON.stringify(verify.rows, null, 2)
  );
}

run().catch((err) => {
  console.error("[seed-local-exchange-rate] FATAL:", err);
  process.exitCode = 1;
});
