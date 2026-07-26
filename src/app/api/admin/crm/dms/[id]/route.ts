/**
 * PUT    /api/admin/crm/dms/:id   → actualiza estado / datos
 * DELETE /api/admin/crm/dms/:id   → elimina
 *
 * Migrated from Prisma to rawDb (@libsql/client) — works on Vercel.
 */
import { NextRequest, NextResponse } from "next/server";
import { rawDb } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const existing = await rawDb.dm.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "DM no encontrado" },
        { status: 404 }
      );
    }

    const newStatus = body.status ?? existing.status;
    const closedAt =
      (newStatus === "closed_sold" ||
        newStatus === "closed_no_sale" ||
        newStatus === "no_reply") &&
      !["closed_sold", "closed_no_sale", "no_reply"].includes(existing.status)
        ? new Date()
        : existing.closedAt;

    const updated = await rawDb.dm.update(id, {
      customerId:
        body.customerId !== undefined
          ? body.customerId || null
          : existing.customerId,
      platform: body.platform ?? existing.platform,
      username:
        body.username !== undefined
          ? body.username?.trim() || null
          : existing.username,
      fragranceInterest:
        body.fragranceInterest !== undefined
          ? body.fragranceInterest?.trim() || null
          : existing.fragranceInterest,
      inquiryType: body.inquiryType ?? existing.inquiryType,
      status: newStatus,
      nextStep:
        body.nextStep !== undefined
          ? body.nextStep?.trim() || null
          : existing.nextStep,
      followUpDate:
        body.followUpDate !== undefined
          ? body.followUpDate
            ? new Date(body.followUpDate)
            : null
          : existing.followUpDate,
      closedAt,
      result:
        body.result !== undefined
          ? body.result?.trim() || null
          : existing.result,
      notes:
        body.notes !== undefined ? body.notes?.trim() || null : existing.notes,
    });

    return NextResponse.json({ dm: updated });
  } catch (err) {
    console.error("[crm dm PUT] error:", err);
    return NextResponse.json(
      { error: "Error al actualizar DM" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await rawDb.dm.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[crm dm DELETE] error:", err);
    return NextResponse.json(
      { error: "Error al eliminar DM" },
      { status: 500 }
    );
  }
}
