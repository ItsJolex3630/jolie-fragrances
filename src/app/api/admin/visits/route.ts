import { NextResponse } from "next/server";
import { getRawDbClient } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  // SECURITY: this only checked for *any* logged-in session before, so any
  // registered user (not just the admin) could read every visitor's IP hash,
  // country and user-agent. Now consistent with every other /api/admin/* route.
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = getRawDbClient();
  if (!client) {
    return NextResponse.json({ error: "No DB connection" }, { status: 500 });
  }

  try {
    const result = await client.execute("SELECT * FROM SiteVisit ORDER BY visitedAt DESC LIMIT 500");
    return NextResponse.json({ visits: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
