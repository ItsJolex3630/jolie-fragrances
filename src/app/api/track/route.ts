import { NextResponse } from "next/server";
import { getRawDbClient } from "@/lib/dbClient";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { visitorId, path, userAgent } = body;
    
    if (!visitorId || !path) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const country = req.headers.get("x-vercel-ip-country") || "Desconocido";

    const client = getRawDbClient();
    if (!client) {
      return NextResponse.json({ error: "No DB connection" }, { status: 500 });
    }

    // Hashear la IP para privacidad
    const ipHash = ip !== "anonymous" 
      ? crypto.createHash("sha256").update(ip + "-jolie-visits-salt").digest("hex").substring(0, 16)
      : null;
    
    const id = "visit_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

    await client.execute({
      sql: `INSERT INTO SiteVisit (id, visitorId, path, ipHash, country, userAgent, visitedAt) 
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        id, 
        visitorId, 
        path, 
        ipHash, 
        country, 
        userAgent || null
      ]
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
