/**
 * scripts/create-crm-tables.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * One-off script: creates the 7 CRM tables (Customer, InventoryItem, Decant,
 * Sale, Dm, DecantDrop, DecantDropItem) directly in Turso using raw SQL via
 * @libsql/client. Mirrors the schema in prisma/schema.prisma 1:1 (same column
 * names, same types — Prisma stores DateTime as TEXT, Boolean as INTEGER,
 * Float as REAL, Int as INTEGER, String as TEXT on SQLite).
 *
 * Usage:
 *   node scripts/create-crm-tables.cjs
 *
 * Idempotent: uses CREATE TABLE IF NOT EXISTS so re-running is safe.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const { createClient } = require("@libsql/client");

const TURSO_URL =
  "libsql://joliefragrances-itsjolex3630.aws-us-east-1.turso.io";
const TURSO_AUTH_TOKEN =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI3ODQ4NjQsImlkIjoiMDE5ZjE2NDAtNmUwMS03YmFkLTk5MGQtNTZjMTQ3N2NkN2JlIiwia2lkIjoiSnpXYUktQnpETW96eGxwdkQ3NkpTZ3dmZGVKRlBUS1BSbWt0cVFycHRVOCIsInJpZCI6IjQ1ODlhMGY4LWNjM2QtNDAyYS1hZjhjLTQwNzZkMWFmMTI2NCJ9.UNjUMbz3_wnj0qjH-FOwtUi48X3Di55DmzwYxkQxRo7hNBxL41d6-1YrbnSY_X3TmtRqexgkXT47mpWCp5fgCA";

const client = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });

const statements = [
  // ─── Customer ──────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "Customer" (
    id              TEXT PRIMARY KEY NOT NULL,
    userId          TEXT,
    name            TEXT NOT NULL,
    email           TEXT,
    phone           TEXT,
    instagram       TEXT,
    channel         TEXT NOT NULL DEFAULT 'whatsapp',
    preferences     TEXT,
    notes           TEXT,
    tags            TEXT,
    isVip           INTEGER NOT NULL DEFAULT 0,
    isBlocked       INTEGER NOT NULL DEFAULT 0,
    blockReason     TEXT,
    createdAt       TEXT NOT NULL,
    updatedAt       TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE SET NULL
  )`,

  // ─── InventoryItem ─────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "InventoryItem" (
    id               TEXT PRIMARY KEY NOT NULL,
    name             TEXT NOT NULL,
    brand            TEXT,
    olfativeProfile  TEXT,
    size             TEXT,
    cost             REAL,
    price            REAL NOT NULL,
    status           TEXT NOT NULL DEFAULT 'available',
    customerInterest TEXT,
    notes            TEXT,
    acquiredAt       TEXT NOT NULL,
    soldAt           TEXT,
    createdAt        TEXT NOT NULL,
    updatedAt        TEXT NOT NULL
  )`,

  // ─── Decant ────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "Decant" (
    id              TEXT PRIMARY KEY NOT NULL,
    sourcePerfume   TEXT NOT NULL,
    sourceBrand     TEXT,
    olfativeProfile TEXT,
    sizeMl          INTEGER NOT NULL DEFAULT 10,
    cost            REAL,
    price           REAL NOT NULL DEFAULT 12,
    status          TEXT NOT NULL DEFAULT 'pending',
    filledAt        TEXT,
    soldAt          TEXT,
    customerId      TEXT,
    notes           TEXT,
    createdAt       TEXT NOT NULL,
    updatedAt       TEXT NOT NULL,
    FOREIGN KEY (customerId) REFERENCES "Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL
  )`,

  // ─── Sale ──────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "Sale" (
    id              TEXT PRIMARY KEY NOT NULL,
    customerId      TEXT NOT NULL,
    inventoryItemId TEXT,
    decantId        TEXT,
    itemType        TEXT NOT NULL,
    itemName        TEXT NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    unitPrice       REAL NOT NULL,
    totalPrice      REAL NOT NULL,
    paid            REAL NOT NULL,
    pending         REAL NOT NULL DEFAULT 0,
    paymentMethod   TEXT,
    paymentStatus   TEXT NOT NULL DEFAULT 'paid',
    deliveryMethod  TEXT,
    deliveryCost    REAL,
    saleDate        TEXT NOT NULL,
    notes           TEXT,
    createdAt       TEXT NOT NULL,
    updatedAt       TEXT NOT NULL,
    FOREIGN KEY (customerId)      REFERENCES "Customer"(id)       ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (inventoryItemId)  REFERENCES "InventoryItem"(id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (decantId)         REFERENCES "Decant"(id)        ON UPDATE CASCADE ON DELETE SET NULL
  )`,

  // ─── Dm ────────────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "Dm" (
    id                TEXT PRIMARY KEY NOT NULL,
    customerId        TEXT,
    platform          TEXT NOT NULL,
    username          TEXT,
    fragranceInterest TEXT,
    inquiryType       TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'new',
    nextStep          TEXT,
    followUpDate      TEXT,
    closedAt          TEXT,
    result            TEXT,
    notes             TEXT,
    receivedAt        TEXT NOT NULL,
    createdAt         TEXT NOT NULL,
    updatedAt         TEXT NOT NULL,
    FOREIGN KEY (customerId) REFERENCES "Customer"(id) ON UPDATE CASCADE ON DELETE SET NULL
  )`,

  // ─── DecantDrop ────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "DecantDrop" (
    id             TEXT PRIMARY KEY NOT NULL,
    name           TEXT NOT NULL,
    description    TEXT,
    comboPrice     REAL NOT NULL,
    regularPrice   REAL NOT NULL,
    targetAudience TEXT,
    status         TEXT NOT NULL DEFAULT 'draft',
    launchedAt     TEXT,
    createdAt      TEXT NOT NULL,
    updatedAt      TEXT NOT NULL
  )`,

  // ─── DecantDropItem ────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "DecantDropItem" (
    id        TEXT PRIMARY KEY NOT NULL,
    dropId    TEXT NOT NULL,
    decantId  TEXT NOT NULL,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (dropId)   REFERENCES "DecantDrop"(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (decantId) REFERENCES "Decant"(id)     ON UPDATE CASCADE ON DELETE RESTRICT
  )`,
];

async function run() {
  console.log("[create-crm-tables] Connecting to Turso…");
  for (const sql of statements) {
    try {
      await client.execute(sql);
      const match = sql.match(/CREATE TABLE IF NOT EXISTS "([^"]+)"/);
      const tableName = match ? match[1] : "(unknown)";
      console.log(`  ✓ Created/verified table: ${tableName}`);
    } catch (err) {
      console.error(`  ✗ Failed on statement: ${sql.slice(0, 80)}…`);
      console.error(err);
      process.exitCode = 1;
      return;
    }
  }
  console.log("[create-crm-tables] All CRM tables ready.");
  try {
    const rs = await client.execute(
      `SELECT name FROM sqlite_master WHERE type='table' AND name IN
       ('Customer','InventoryItem','Decant','Sale','Dm','DecantDrop','DecantDropItem')
       ORDER BY name`
    );
    console.log(
      "[create-crm-tables] CRM tables now in DB:",
      rs.rows.map((r) => r.name).join(", ")
    );
  } catch (err) {
    console.error("[create-crm-tables] Verification query failed:", err);
  }
}

run().catch((err) => {
  console.error("[create-crm-tables] FATAL:", err);
  process.exitCode = 1;
});
