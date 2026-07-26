/**
 * GET  /api/admin/crm/decants   → lista todos
 * POST /api/admin/crm/decants   → crea decant (individuales)
 *   Body opcional: { count: N } para crear N decants idénticos de golpe
 *
 * Migrated from Prisma to rawDb (@libsql/client) — works on Vercel.
 */
import { NextRequest, NextResponse } from "next/server";
import { rawDb } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const decants = await rawDb.decant.findMany();

    // Enrich with customer { id, name } for those that have customerId
    const customerIds = [
      ...new Set(
        decants
          .map((d) => d.customerId)
          .filter((id): id is string => Boolean(id))
      ),
    ];
    const customerMap = new Map<string, { id: string; name: string }>();
    if (customerIds.length > 0) {
      for (const cid of customerIds) {
        const c = await rawDb.customer.findById(cid);
        if (c) customerMap.set(cid, { id: c.id, name: c.name });
      }
    }
    const enriched = decants.map((d) => ({
      ...d,
      customer: d.customerId ? customerMap.get(d.customerId) ?? null : null,
    }));

    return NextResponse.json({ decants: enriched });
  } catch (err) {
    console.error("[crm decants GET] error:", err);
    return NextResponse.json(
      { error: "Error al cargar decants" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (!body.sourcePerfume || typeof body.sourcePerfume !== "string") {
      return NextResponse.json(
        { error: "sourcePerfume es obligatorio" },
        { status: 400 }
      );
    }

    const count = Math.max(1, Math.min(50, parseInt(body.count) || 1));
    const status = body.status || "pending";

    const items = Array.from({ length: count }).map(() => ({
      sourcePerfume: body.sourcePerfume.trim(),
      sourceBrand: body.sourceBrand?.trim() || null,
      olfativeProfile: body.olfativeProfile?.trim() || null,
      sizeMl: body.sizeMl || 10,
      cost: body.cost ?? null,
      price: body.price || 12,
      status,
      filledAt: status !== "pending" ? new Date() : null,
      notes: body.notes?.trim() || null,
    }));

    const created = await rawDb.decant.createMany(items);
    return NextResponse.json({ created }, { status: 201 });
  } catch (err) {
    console.error("[crm decants POST] error:", err);
    return NextResponse.json(
      { error: "Error al crear decants" },
      { status: 500 }
    );
  }
}
