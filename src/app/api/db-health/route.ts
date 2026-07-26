import { NextResponse } from "next/server";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * Database health check endpoint.
 * Tests the raw @libsql/client connection (the one used by `rawDb` in
 * src/lib/dbClient.ts) by running `COUNT(*)` queries against User and Match.
 *
 * History: This endpoint previously tested Prisma via `getDb()`/`db.user.count()`,
 * but Prisma kept failing on Vercel with `URL_INVALID: The URL 'undefined'`.
 * The raw @libsql/client connection works perfectly, so we now use `rawDb`
 * (which wraps @libsql/client directly) for the primary health check, and
 * also keep an explicit `createClient` test as a second independent signal.
 *
 * SECURITY: admin-only (requireAdmin) — this used to be public and leaked the
 * full DATABASE_URL (including credentials) to anyone who requested it.
 */
export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results: Record<string, unknown> = {};

  // Step 1: Check environment variables — presence only, never the values.
  // (Previously this leaked the full DATABASE_URL and token lengths, which
  // is enough for an attacker to fingerprint/guess connection details.)
  results.env = {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? "set" : "NOT SET",
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "set" : "NOT SET",
    DATABASE_URL: process.env.DATABASE_URL ? "set" : "NOT SET",
  };

  // Step 2: Check rawDb availability (replaces the old getDb()/isDbAvailable() check)
  try {
    results.isRawDbAvailable = isRawDbAvailable();
    results.isDbAvailable = isRawDbAvailable(); // legacy field name kept for log scrapers

    if (!isRawDbAvailable()) {
      results.error = "rawDb unavailable — env vars missing or libsql init failed";
      // Fall through to the explicit createClient test below so we still report
      // what the raw libsql connection sees.
    }

    // Step 3: Try a simple User count via rawDb
    try {
      const userCount = await rawDb.user.count();
      results.userCount = userCount;
      results.success = true;
    } catch (queryError) {
      results.queryError = (queryError as Error).message;
      results.queryStack = (queryError as Error).stack?.split("\n").slice(0, 5);
    }

    // Step 4: Try a Match count via rawDb
    try {
      const matchCount = await rawDb.match.count();
      results.matchCount = matchCount;
    } catch (queryError) {
      results.matchQueryError = (queryError as Error).message;
    }
  } catch (importError) {
    results.importError = (importError as Error).message;
    results.importStack = (importError as Error).stack?.split("\n").slice(0, 5);
  }

  // Step 5: Independent raw libsql connection test (kept from the original).
  // This creates a fresh @libsql/client Client (separate from the rawDb
  // singleton) and runs a single SELECT to verify connectivity end-to-end.
  try {
    const { createClient } = await import("@libsql/client");
    const url = process.env.TURSO_DATABASE_URL || "";
    const authToken = process.env.TURSO_AUTH_TOKEN || "";

    if (url && authToken) {
      const client = createClient({ url, authToken });
      const rs = await client.execute("SELECT COUNT(*) as cnt FROM User");
      results.rawLibsqlUserCount = rs.rows[0]?.cnt;
      results.rawLibsqlSuccess = true;
    } else {
      results.rawLibsqlError = "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN";
    }
  } catch (libsqlError) {
    results.rawLibsqlError = (libsqlError as Error).message;
    results.rawLibsqlStack = (libsqlError as Error).stack?.split("\n").slice(0, 5);
  }

  return NextResponse.json(results);
}
