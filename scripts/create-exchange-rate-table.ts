/**
 * scripts/create-exchange-rate-table.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * One-off script: creates the `ExchangeRate` table directly in Turso using raw
 * SQL via @libsql/client. Used by the dual-currency system (Task ID: 27) to
 * persist the admin-configured USDT and BCV rates.
 *
 * Schema (mirrors src/lib/dbClient.ts → rawDb.exchangeRate):
 *   id         TEXT PRIMARY KEY    — always 'default' (singleton row)
 *   usdtRate   REAL NOT NULL       — Bs. per USDT (market rate)
 *   bcvRate    REAL NOT NULL       — Bs. per USD  (BCV reference rate)
 *   updatedBy  TEXT                — admin email who last updated
 *   createdAt  TEXT NOT NULL       — ISO 8601 timestamp
 *   updatedAt  TEXT NOT NULL       — ISO 8601 timestamp
 *
 * Usage:
 *   bun scripts/create-exchange-rate-table.ts
 *
 * Idempotent: uses CREATE TABLE IF NOT EXISTS so re-running is safe.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { createClient } from "@libsql/client";

const TURSO_URL =
  "libsql://joliefragrances-itsjolex3630.aws-us-east-1.turso.io";
const TURSO_AUTH_TOKEN =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI3ODQ4NjQsImlkIjoiMDE5ZjE2NDAtNmUwMS03YmFkLTk5MGQtNTZjMTQ3N2NkN2JlIiwia2lkIjoiSnpXYUktQnpETW96eGxwdkQ3NkpTZ3dmZGVKRlBUS1BSbWt0cVFycHRVOCIsInJpZCI6IjQ1ODlhMGY4LWNjM2QtNDAyYS1hZjhjLTQwNzZkMWFmMTI2NCJ9.UNjUMbz3_wnj0qjH-FOwtUi48X3Di55DmzwYxkQxRo7hNBxL41d6-1YrbnSY_X3TmtRqexgkXT47mpWCp5fgCA";

const client = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });

const statements: string[] = [
  `CREATE TABLE IF NOT EXISTS "ExchangeRate" (
    id         TEXT PRIMARY KEY NOT NULL,
    usdtRate   REAL NOT NULL,
    bcvRate    REAL NOT NULL,
    updatedBy  TEXT,
    createdAt  TEXT NOT NULL,
    updatedAt  TEXT NOT NULL
  )`,
];

async function run() {
  console.log("[create-exchange-rate-table] Connecting to Turso…");
  for (const sql of statements) {
    try {
      await client.execute(sql);
      console.log('  ✓ Created/verified table: ExchangeRate');
    } catch (err) {
      console.error(`  ✗ Failed on statement: ${sql.slice(0, 80)}…`);
      console.error(err);
      process.exitCode = 1;
      return;
    }
  }

  // Seed the default row if it doesn't exist yet, so the GET endpoint returns
  // real values instead of the in-code fallbacks.
  try {
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
  } catch (err) {
    console.error("[create-exchange-rate-table] Seed failed:", err);
    process.exitCode = 1;
    return;
  }

  // Verify
  try {
    const rs = await client.execute('SELECT * FROM "ExchangeRate" WHERE id = ?');
    if (rs.rows.length > 0) {
      const row = rs.rows[0] as Record<string, unknown>;
      console.log(
        `[create-exchange-rate-table] Current row: usdtRate=${row.usdtRate}, bcvRate=${row.bcvRate}, updatedAt=${row.updatedAt}`
      );
    }
  } catch (err) {
    console.error("[create-exchange-rate-table] Verification query failed:", err);
  }

  console.log("[create-exchange-rate-table] Done.");
}

run().catch((err) => {
  console.error("[create-exchange-rate-table] FATAL:", err);
  process.exitCode = 1;
});
