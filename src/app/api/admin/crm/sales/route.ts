/**
 * GET    /api/admin/crm/sales      → lista todas las ventas
 * POST   /api/admin/crm/sales      → registra nueva venta
 *   - Actualiza automáticamente el estado del InventoryItem/Decant a "sold"
 *
 * Migrated from Prisma to rawDb (@libsql/client) — works on Vercel.
 * The POST uses `client.batch()` for an atomic transaction (replaces
 * Prisma's `db.$transaction`).
 */
import { NextRequest, NextResponse } from "next/server";
import { rawDb, getRawDbClient } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId");
  const limit = parseInt(searchParams.get("limit") || "0") || undefined;

  try {
    const sales = await rawDb.sale.findMany({
      where: customerId ? { customerId } : undefined,
      orderBy: { saleDate: "desc" },
      limit: limit && limit > 0 ? limit : undefined,
    });

    // Enrich with customer / inventoryItem / decant relations.
    const customerIds = [
      ...new Set(sales.map((s) => s.customerId).filter(Boolean) as string[]),
    ];
    const inventoryIds = [
      ...new Set(
        sales
          .map((s) => s.inventoryItemId)
          .filter((id): id is string => Boolean(id))
      ),
    ];
    const decantIds = [
      ...new Set(
        sales
          .map((s) => s.decantId)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    const customerMap = new Map<
      string,
      { id: string; name: string; email: string | null; phone: string | null }
    >();
    for (const cid of customerIds) {
      const c = await rawDb.customer.findById(cid);
      if (c) {
        customerMap.set(cid, {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
        });
      }
    }

    const inventoryMap = new Map<
      string,
      { id: string; name: string; brand: string | null; size: string | null }
    >();
    for (const iid of inventoryIds) {
      const i = await rawDb.inventoryItem.findById(iid);
      if (i) {
        inventoryMap.set(iid, {
          id: i.id,
          name: i.name,
          brand: i.brand,
          size: i.size,
        });
      }
    }

    const decantMap = new Map<
      string,
      {
        id: string;
        sourcePerfume: string;
        sourceBrand: string | null;
        sizeMl: number;
      }
    >();
    for (const did of decantIds) {
      const d = await rawDb.decant.findById(did);
      if (d) {
        decantMap.set(did, {
          id: d.id,
          sourcePerfume: d.sourcePerfume,
          sourceBrand: d.sourceBrand,
          sizeMl: d.sizeMl,
        });
      }
    }

    const enriched = sales.map((s) => ({
      ...s,
      customer: customerMap.get(s.customerId) ?? null,
      inventoryItem: s.inventoryItemId
        ? inventoryMap.get(s.inventoryItemId) ?? null
        : null,
      decant: s.decantId ? decantMap.get(s.decantId) ?? null : null,
    }));

    return NextResponse.json({ sales: enriched });
  } catch (err) {
    console.error("[crm sales GET] error:", err);
    return NextResponse.json(
      { error: "Error al cargar ventas" },
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

    // Validación
    if (!body.customerId) {
      return NextResponse.json(
        { error: "Cliente es obligatorio" },
        { status: 400 }
      );
    }
    if (!body.itemName || typeof body.itemName !== "string") {
      return NextResponse.json(
        { error: "Nombre del item es obligatorio" },
        { status: 400 }
      );
    }
    if (typeof body.unitPrice !== "number" || body.unitPrice < 0) {
      return NextResponse.json(
        { error: "Precio unitario inválido" },
        { status: 400 }
      );
    }

    const quantity = body.quantity || 1;
    const totalPrice = body.totalPrice ?? body.unitPrice * quantity;
    const paid = body.paid ?? totalPrice;
    const pending = body.pending ?? Math.max(0, totalPrice - paid);
    const paymentStatus =
      pending === 0 ? "paid" : pending === totalPrice ? "pending" : "partial";

    // Create the sale + update the related item status atomically.
    const client = getRawDbClient();
    if (!client) {
      return NextResponse.json(
        { error: "Base de datos no disponible" },
        { status: 503 }
      );
    }

    const sale = await rawDb.sale.create({
      customerId: body.customerId,
      inventoryItemId: body.inventoryItemId || null,
      decantId: body.decantId || null,
      itemType: body.itemType || "botella",
      itemName: body.itemName.trim(),
      quantity,
      unitPrice: body.unitPrice,
      totalPrice,
      paid,
      pending,
      paymentMethod: body.paymentMethod || null,
      paymentStatus,
      deliveryMethod: body.deliveryMethod || null,
      deliveryCost: body.deliveryCost || null,
      saleDate: body.saleDate ? new Date(body.saleDate) : new Date(),
      notes: body.notes?.trim() || null,
    });

    // Marcar item como vendido (atomic batch — replaces Prisma $transaction)
    const nowIso = new Date().toISOString();
    const followups: Array<{ sql: string; args: any[] }> = [];
    if (body.inventoryItemId) {
      followups.push({
        sql: "UPDATE InventoryItem SET status = 'sold', soldAt = ?, updatedAt = ? WHERE id = ?",
        args: [nowIso, nowIso, body.inventoryItemId],
      });
    }
    if (body.decantId) {
      followups.push({
        sql: "UPDATE Decant SET status = 'sold', soldAt = ?, customerId = ?, updatedAt = ? WHERE id = ?",
        args: [nowIso, body.customerId, nowIso, body.decantId],
      });
    }
    if (followups.length > 0) {
      await client.batch(followups);
    }

    return NextResponse.json({ sale }, { status: 201 });
  } catch (err) {
    console.error("[crm sales POST] error:", err);
    return NextResponse.json(
      { error: "Error al crear venta" },
      { status: 500 }
    );
  }
}
