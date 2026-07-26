/**
 * GET    /api/admin/crm/customers/:id  → detalle con ventas y DMs
 * PUT    /api/admin/crm/customers/:id  → actualiza
 * DELETE /api/admin/crm/customers/:id  → elimina
 *
 * Migrated from Prisma to rawDb (@libsql/client) — works on Vercel.
 */
import { NextRequest, NextResponse } from "next/server";
import { rawDb } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const customer = await rawDb.customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    const sales = await rawDb.sale.findMany({
      where: { customerId: id },
      orderBy: { saleDate: "desc" },
    });
    const dms = await rawDb.dm.findMany();

    // Filter DMs by customer
    const customerDms = dms.filter((d) => d.customerId === id);

    // Decants assigned to this customer
    const decants = (await rawDb.decant.findMany()).filter(
      (d) => d.customerId === id
    );

    // Linked User (if any)
    let user: { id: string; email: string; name: string | null } | null = null;
    if (customer.userId) {
      const u = await rawDb.user.findById(customer.userId);
      if (u) {
        user = { id: u.id, email: u.email, name: u.name };
      }
    }

    const totalSpent = sales.reduce((s, x) => s + x.totalPrice, 0);
    const totalPaid = sales.reduce((s, x) => s + x.paid, 0);

    return NextResponse.json({
      customer: {
        ...customer,
        user,
      },
      sales,
      dms: customerDms,
      decants,
      stats: {
        totalSpent,
        totalPaid,
        pending: totalSpent - totalPaid,
        salesCount: sales.length,
        dmsCount: customerDms.length,
      },
    });
  } catch (err) {
    console.error("[crm customer GET] error:", err);
    return NextResponse.json(
      { error: "Error al cargar cliente" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const existing = await rawDb.customer.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    const updated = await rawDb.customer.update(id, {
      name: body.name?.trim() ?? existing.name,
      email:
        body.email !== undefined
          ? body.email?.trim().toLowerCase() || null
          : existing.email,
      phone:
        body.phone !== undefined
          ? body.phone?.trim() || null
          : existing.phone,
      instagram:
        body.instagram !== undefined
          ? body.instagram?.trim() || null
          : existing.instagram,
      channel: body.channel ?? existing.channel,
      preferences:
        body.preferences !== undefined
          ? body.preferences?.trim() || null
          : existing.preferences,
      notes:
        body.notes !== undefined ? body.notes?.trim() || null : existing.notes,
      tags: body.tags !== undefined ? body.tags?.trim() || null : existing.tags,
      isVip:
        body.isVip !== undefined ? Boolean(body.isVip) : existing.isVip,
      isBlocked:
        body.isBlocked !== undefined
          ? Boolean(body.isBlocked)
          : existing.isBlocked,
      blockReason:
        body.blockReason !== undefined
          ? body.blockReason?.trim() || null
          : existing.blockReason,
    });

    return NextResponse.json({ customer: updated });
  } catch (err) {
    console.error("[crm customer PUT] error:", err);
    return NextResponse.json(
      { error: "Error al actualizar cliente" },
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
    const customer = await rawDb.customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      );
    }
    const salesCount = await rawDb.customer.countSalesByCustomerId(id);
    if (salesCount > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un cliente con ventas registradas. Marca como bloqueado en su lugar.",
        },
        { status: 400 }
      );
    }

    await rawDb.customer.delete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[crm customer DELETE] error:", err);
    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 }
    );
  }
}
