/**
 * GET  /api/admin/crm/dms   → lista todos los DMs/consultas
 * POST /api/admin/crm/dms   → registra nueva consulta
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
    const dms = await rawDb.dm.findMany();

    // Enrich with customer { id, name, phone, instagram }
    const customerIds = [
      ...new Set(
        dms
          .map((d) => d.customerId)
          .filter((id): id is string => Boolean(id))
      ),
    ];
    const customerMap = new Map<
      string,
      { id: string; name: string; phone: string | null; instagram: string | null }
    >();
    if (customerIds.length > 0) {
      for (const cid of customerIds) {
        const c = await rawDb.customer.findById(cid);
        if (c) {
          customerMap.set(cid, {
            id: c.id,
            name: c.name,
            phone: c.phone,
            instagram: c.instagram,
          });
        }
      }
    }
    const enriched = dms.map((d) => ({
      ...d,
      customer: d.customerId ? customerMap.get(d.customerId) ?? null : null,
    }));

    return NextResponse.json({ dms: enriched });
  } catch (err) {
    console.error("[crm dms GET] error:", err);
    return NextResponse.json(
      { error: "Error al cargar DMs" },
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

    if (!body.platform) {
      return NextResponse.json(
        { error: "Plataforma es obligatoria" },
        { status: 400 }
      );
    }
    if (!body.inquiryType) {
      return NextResponse.json(
        { error: "Tipo de consulta es obligatorio" },
        { status: 400 }
      );
    }

    const dm = await rawDb.dm.create({
      customerId: body.customerId || null,
      platform: body.platform,
      username: body.username?.trim() || null,
      fragranceInterest: body.fragranceInterest?.trim() || null,
      inquiryType: body.inquiryType,
      status: body.status || "new",
      nextStep: body.nextStep?.trim() || null,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      notes: body.notes?.trim() || null,
      receivedAt: body.receivedAt ? new Date(body.receivedAt) : new Date(),
    });

    return NextResponse.json({ dm }, { status: 201 });
  } catch (err) {
    console.error("[crm dms POST] error:", err);
    return NextResponse.json(
      { error: "Error al crear DM" },
      { status: 500 }
    );
  }
}
