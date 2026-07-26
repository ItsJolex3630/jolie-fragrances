/**
 * Initialize Turso database tables
 * Run: npx tsx scripts/init-turso.ts
 */
import { createClient } from "@libsql/client";

const TURSO_URL = "libsql://joliefragrances-itsjolex3630.aws-us-east-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODI3ODQ4NjQsImlkIjoiMDE5ZjE2NDAtNmUwMS03YmFkLTk5MGQtNTZjMTQ3N2NkN2JlIiwia2lkIjoiSnpXYUktQnpETW96eGxwdkQ3NkpTZ3dmZGVKRlBUS1BSbWt0cVFycHRVOCIsInJpZCI6IjQ1ODlhMGY4LWNjM2QtNDAyYS1hZjhjLTQwNzZkMWFmMTI2NCJ9.UNjUMbz3_wnj0qjH-FOwtUi48X3Di55DmzwYxkQxRo7hNBxL41d6-1YrbnSY_X3TmtRqexgkXT47mpWCp5fgCA";

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

const tables = [
  // NextAuth required
  `CREATE TABLE IF NOT EXISTS Account (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS Account_provider_providerAccountId_key ON Account(provider, providerAccountId)`,

  `CREATE TABLE IF NOT EXISTS Session (
    id TEXT PRIMARY KEY NOT NULL,
    sessionToken TEXT NOT NULL UNIQUE,
    userId TEXT NOT NULL,
    expires DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS VerificationToken (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires DATETIME NOT NULL,
    PRIMARY KEY (identifier, token)
  )`,

  // Application models
  `CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified DATETIME,
    name TEXT,
    image TEXT,
    ipHash TEXT,
    deviceFingerprint TEXT,
    authProvider TEXT NOT NULL DEFAULT 'otp',
    banned BOOLEAN NOT NULL DEFAULT 0,
    bannedReason TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // Add banned/bannedReason columns if missing (e.g. on databases created
  // before the /admin panel was added). ALTER TABLE ... ADD COLUMN is a
  // no-op-friendly idempotent check: we wrap each in a try/catch because
  // SQLite throws "duplicate column name" if the column already exists.
  `ALTER TABLE User ADD COLUMN banned BOOLEAN NOT NULL DEFAULT 0`,
  `ALTER TABLE User ADD COLUMN bannedReason TEXT`,

  `CREATE TABLE IF NOT EXISTS Match (
    id TEXT PRIMARY KEY NOT NULL,
    externalId TEXT UNIQUE,
    homeTeam TEXT NOT NULL,
    awayTeam TEXT NOT NULL,
    homeFlag TEXT,
    awayFlag TEXT,
    homeLogo TEXT,
    awayLogo TEXT,
    competition TEXT NOT NULL,
    competitionLogo TEXT,
    matchDate DATETIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming',
    homeScore INTEGER,
    awayScore INTEGER,
    winner TEXT,
    shortStatus TEXT,
    round TEXT,
    lastSyncedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // Prediction table with CORRECT schema matching Prisma
  `CREATE TABLE IF NOT EXISTS Prediction (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT NOT NULL,
    matchId TEXT NOT NULL,
    homeGoals INTEGER NOT NULL,
    awayGoals INTEGER NOT NULL,
    extraTimeHome INTEGER,
    extraTimeAway INTEGER,
    penaltiesHome INTEGER,
    penaltiesAway INTEGER,
    correct BOOLEAN,
    exactScore BOOLEAN,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id),
    FOREIGN KEY (matchId) REFERENCES Match(id),
    UNIQUE(userId, matchId)
  )`,

  `CREATE TABLE IF NOT EXISTS DiscountCode (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT NOT NULL,
    predictionId TEXT,
    code TEXT NOT NULL UNIQUE,
    discountPct INTEGER NOT NULL DEFAULT 10,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verifiedAt DATETIME,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id)
  )`,

  `CREATE TABLE IF NOT EXISTS OtpCode (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    attempts INTEGER NOT NULL DEFAULT 0,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

async function main() {
  console.log("🔧 Initializing Turso database...");

  for (const sql of tables) {
    try {
      await client.execute(sql);
      const tableName = sql.match(/CREATE\s+(?:UNIQUE\s+)?(?:INDEX\s+)?(?:IF\s+NOT\s+EXISTS\s+)?(?:INDEX\s+)?(\w+)/i)?.[1] || "unknown";
      console.log(`  ✅ ${tableName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Error: ${msg}`);
    }
  }

  console.log("\n✅ Turso database initialized!");
  
  // Verify tables
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log("\n📋 Tables in Turso:");
  for (const row of result.rows) {
    console.log(`  - ${row.name}`);
  }
}

main().catch(console.error);
