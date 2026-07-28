import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let _db: PrismaClient | null = null;
let _isDbAvailable = false;
let _lastDbCheck = 0;
const DB_RETRY_INTERVAL = 30_000; // Retry DB connection every 30 seconds if it failed

/**
 * Get the Prisma client — initializes lazily on first call.
 * Unlike the previous version, this allows retries if the DB was temporarily unavailable.
 * Priority:
 * 1. TURSO_DATABASE_URL (production Turso)
 * 2. DATABASE_URL starting with "libsql://" (direct Turso URL)
 * 3. DATABASE_URL as local SQLite file (development)
 */
export function getDb(): PrismaClient | null {
  // If DB is available, return it immediately
  if (_db && _isDbAvailable) return _db;

  // If DB check was done recently and failed, don't retry yet (but allow retry after interval)
  const now = Date.now();
  if (!_isDbAvailable && _db !== null && now - _lastDbCheck < DB_RETRY_INTERVAL) {
    return null;
  }

  // If DB was previously set but marked unavailable, allow retry
  if (!_isDbAvailable && _lastDbCheck > 0 && now - _lastDbCheck < DB_RETRY_INTERVAL) {
    return null;
  }

  _lastDbCheck = now;

  try {
    // Check for Turso first (production)
    const tursoUrl = (process.env.TURSO_DATABASE_URL || "").trim();
    const dbUrl = (process.env.DATABASE_URL || "").trim();
    const isTurso = tursoUrl.startsWith("libsql://") || dbUrl.startsWith("libsql://");

    if (isTurso) {
      // Production: Turso/libSQL
      const url = tursoUrl || dbUrl;
      const authToken = (process.env.TURSO_AUTH_TOKEN || "").trim();
      if (!authToken) {
        console.warn("[DB] TURSO_AUTH_TOKEN not set — cannot connect to Turso");
        _db = null;
        _isDbAvailable = false;
        return null;
      }

      // IMPORTANT: When using PrismaLibSql adapter, Prisma still reads DATABASE_URL
      // from the schema for internal validation. We need to set it to the Turso URL
      // so Prisma doesn't try to use "file:./db/custom.db" which fails.
      if (!dbUrl.startsWith("libsql://")) {
        process.env.DATABASE_URL = url;
      }

      console.log("[DB] Connecting to Turso:", url.substring(0, 40) + "...");
      const libsql = createClient({ url, authToken });
      const adapter = new PrismaLibSQL(libsql as any);
      _db = new PrismaClient({ adapter } as never);
      console.log("[DB] Connected to Turso successfully");
    } else {
      // Development: Local SQLite
      _db =
        globalForPrisma.prisma ||
        new PrismaClient({
          log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
        });
      if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _db;
      console.log("[DB] Connected to local SQLite:", dbUrl);
    }

    _isDbAvailable = true;
  } catch (err) {
    console.warn("[DB] Prisma client initialization failed — will retry in 30s", err);
    _db = null;
    _isDbAvailable = false;
  }

  return _db;
}

/**
 * Check if the database is available.
 * Allows retries after DB_RETRY_INTERVAL.
 */
export function isDbAvailable(): boolean {
  if (_isDbAvailable && _db) return true;
  // Try to reconnect if enough time has passed
  getDb();
  return _isDbAvailable;
}

// Reset DB state (useful for testing or after env var changes)
export function resetDbConnection(): void {
  _db = null;
  _isDbAvailable = false;
  _lastDbCheck = 0;
}

// For backward compatibility — will be null until getDb() is called
export const db = null as unknown as import("@prisma/client").PrismaClient;
