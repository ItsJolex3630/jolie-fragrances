/**
 * PUT    /api/admin/crm/inventory/:id   → actualiza
 * DELETE /api/admin/crm/inventory/:id   → elimina (si no está vendido)
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
    const existing = await rawDb.inventoryItem.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      );
    }

    const newStatus = body.status ?? existing.status;
    const soldAt =
      newStatus === "sold" && existing.status !== "sold"
        ? new Date()
        : newStatus === "sold"
          ? existing.soldAt
          : null;

    const updated = await rawDb.inventoryItem.update(id, {
      name: body.name?.trim() ?? existing.name,
      brand:
        body.brand !== undefined
          ? body.brand?.trim() || null
          : existing.brand,
      olfativeProfile:
        body.olfativeProfile !== undefined
          ? body.olfativeProfile?.trim() || null
          : existing.olfativeProfile,
      size: body.size !== undefined ? body.size?.trim() || null : existing.size,
      cost: body.cost !== undefined ? body.cost : existing.cost,
      price: body.price ?? existing.price,
      status: newStatus,
      soldAt,
      customerInterest:
        body.customerInterest !== undefined
          ? body.customerInterest?.trim() || null
          : existing.customerInterest,
      notes:
        body.notes !== undefined ? body.notes?.trim() || null : existing.notes,
    });

    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("[crm inventory PUT] error:", err);
    return NextResponse.json(
      { error: "Error al actualizar item" },
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
    const item = await rawDb.inventoryItem.findById(id);
    if (!item) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      );
    }
    if (item.status === "sold") {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un item vendido. Elimina primero la venta.",
        },
        { status: 400 }
      );
    }

    await rawDb.inventoryItem.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[crm inventory DELETE] error:", err);
    return NextResponse.json(
      { error: "Error al eliminar item" },
      { status: 500 }
    );
  }
}
