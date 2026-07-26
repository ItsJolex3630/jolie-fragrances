/**
 * PUT    /api/admin/crm/sales/:id   → actualiza venta (notas, pago, entrega)
 * DELETE /api/admin/crm/sales/:id   → elimina venta (revierte estado del item)
 *
 * Migrated from Prisma to rawDb (@libsql/client) — works on Vercel.
 * DELETE uses `client.batch()` for an atomic transaction (replaces
 * Prisma's `db.$transaction`).
 */
import { NextRequest, NextResponse } from "next/server";
import { rawDb, getRawDbClient } from "@/lib/dbClient";
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
    const existing = await rawDb.sale.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    const updated = await rawDb.sale.update(id, {
      notes:
        body.notes !== undefined ? body.notes?.trim() || null : existing.notes,
      paymentMethod:
        body.paymentMethod !== undefined
          ? body.paymentMethod || null
          : existing.paymentMethod,
      paymentStatus: body.paymentStatus ?? existing.paymentStatus,
      deliveryMethod:
        body.deliveryMethod !== undefined
          ? body.deliveryMethod || null
          : existing.deliveryMethod,
      deliveryCost:
        body.deliveryCost !== undefined
          ? body.deliveryCost || null
          : existing.deliveryCost,
      paid: body.paid !== undefined ? body.paid : existing.paid,
      pending: body.pending !== undefined ? body.pending : existing.pending,
    });

    return NextResponse.json({ sale: updated });
  } catch (err) {
    console.error("[crm sale PUT] error:", err);
    return NextResponse.json(
      { error: "Error al actualizar venta" },
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
    const sale = await rawDb.sale.findById(id);
    if (!sale) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    const client = getRawDbClient();
    if (!client) {
      return NextResponse.json(
        { error: "Base de datos no disponible" },
        { status: 503 }
      );
    }

    // Atomic batch: delete the sale AND revert the related item to "available".
    // Replaces Prisma's `db.$transaction`.
    const nowIso = new Date().toISOString();
    const stmts: Array<{ sql: string; args: any[] }> = [
      {
        sql: "DELETE FROM Sale WHERE id = ?",
        args: [id],
      },
    ];
    if (sale.inventoryItemId) {
      stmts.push({
        sql: "UPDATE InventoryItem SET status = 'available', soldAt = NULL, updatedAt = ? WHERE id = ?",
        args: [nowIso, sale.inventoryItemId],
      });
    }
    if (sale.decantId) {
      stmts.push({
        sql: "UPDATE Decant SET status = 'available', soldAt = NULL, customerId = NULL, updatedAt = ? WHERE id = ?",
        args: [nowIso, sale.decantId],
      });
    }
    await client.batch(stmts);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[crm sale DELETE] error:", err);
    return NextResponse.json(
      { error: "Error al eliminar venta" },
      { status: 500 }
    );
  }
}
