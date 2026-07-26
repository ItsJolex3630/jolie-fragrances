/**
 * PUT    /api/admin/crm/decants/:id   → actualiza estado / datos
 * DELETE /api/admin/crm/decants/:id   → elimina
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
    const existing = await rawDb.decant.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Decant no encontrado" },
        { status: 404 }
      );
    }

    // Si cambia a "filled" y no tenía filledAt, setearlo
    const newStatus = body.status ?? existing.status;
    const filledAt =
      newStatus !== "pending" && existing.status === "pending"
        ? new Date()
        : existing.filledAt;

    // Si cambia a "sold" y no tenía soldAt, setearlo
    const soldAt =
      newStatus === "sold" && existing.status !== "sold"
        ? new Date()
        : newStatus === "sold"
          ? existing.soldAt
          : null;

    const updated = await rawDb.decant.update(id, {
      sourcePerfume: body.sourcePerfume?.trim() ?? existing.sourcePerfume,
      sourceBrand:
        body.sourceBrand !== undefined
          ? body.sourceBrand?.trim() || null
          : existing.sourceBrand,
      olfativeProfile:
        body.olfativeProfile !== undefined
          ? body.olfativeProfile?.trim() || null
          : existing.olfativeProfile,
      sizeMl: body.sizeMl ?? existing.sizeMl,
      cost: body.cost !== undefined ? body.cost : existing.cost,
      price: body.price ?? existing.price,
      status: newStatus,
      filledAt,
      soldAt,
      customerId:
        body.customerId !== undefined
          ? body.customerId || null
          : existing.customerId,
      notes:
        body.notes !== undefined ? body.notes?.trim() || null : existing.notes,
    });

    return NextResponse.json({ decant: updated });
  } catch (err) {
    console.error("[crm decant PUT] error:", err);
    return NextResponse.json(
      { error: "Error al actualizar decant" },
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
    const decant = await rawDb.decant.findById(id);
    if (!decant) {
      return NextResponse.json(
        { error: "Decant no encontrado" },
        { status: 404 }
      );
    }
    if (decant.status === "sold") {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un decant vendido. Elimina primero la venta.",
        },
        { status: 400 }
      );
    }

    await rawDb.decant.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[crm decant DELETE] error:", err);
    return NextResponse.json(
      { error: "Error al eliminar decant" },
      { status: 500 }
    );
  }
}
