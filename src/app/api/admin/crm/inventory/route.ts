/**
 * GET  /api/admin/crm/inventory   → lista todo el inventario
 * POST /api/admin/crm/inventory   → crea item de inventario
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
    const items = await rawDb.inventoryItem.findMany();
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[crm inventory GET] error:", err);
    return NextResponse.json(
      { error: "Error al cargar inventario" },
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

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Nombre es obligatorio" },
        { status: 400 }
      );
    }
    if (typeof body.price !== "number" || body.price < 0) {
      return NextResponse.json(
        { error: "Precio inválido" },
        { status: 400 }
      );
    }

    const item = await rawDb.inventoryItem.create({
      name: body.name.trim(),
      brand: body.brand?.trim() || null,
      olfativeProfile: body.olfativeProfile?.trim() || null,
      size: body.size?.trim() || null,
      cost: body.cost ?? null,
      price: body.price,
      status: body.status || "available",
      customerInterest: body.customerInterest?.trim() || null,
      notes: body.notes?.trim() || null,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("[crm inventory POST] error:", err);
    return NextResponse.json(
      { error: "Error al crear item" },
      { status: 500 }
    );
  }
}
