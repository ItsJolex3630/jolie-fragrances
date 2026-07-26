/**
 * GET    /api/admin/crm/customers        → lista todos los clientes (con stats)
 * POST   /api/admin/crm/customers        → crea un nuevo cliente
 *
 * Migrated from Prisma to rawDb (@libsql/client) — works on Vercel.
 */
import { NextRequest, NextResponse } from "next/server";
import { rawDb, getRawDbClient } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const customers = await rawDb.customer.findMany();

    // Fetch sales totals + dms count per customer via single grouped queries.
    const client = getRawDbClient();
    const salesByCustomer = new Map<
      string,
      { totalSpent: number; totalPaid: number; salesCount: number }
    >();
    const dmsByCustomer = new Map<string, number>();

    if (client) {
      const salesRs = await client.execute(
        `SELECT customerId,
                COALESCE(SUM(totalPrice), 0) AS totalSpent,
                COALESCE(SUM(paid), 0)      AS totalPaid,
                COUNT(*)                     AS salesCount
         FROM Sale
         GROUP BY customerId`
      );
      for (const row of salesRs.rows as Array<Record<string, unknown>>) {
        const cid = String(row.customerId);
        salesByCustomer.set(cid, {
          totalSpent: Number(row.totalSpent ?? 0),
          totalPaid: Number(row.totalPaid ?? 0),
          salesCount: Number(row.salesCount ?? 0),
        });
      }

      const dmsRs = await client.execute(
        `SELECT customerId, COUNT(*) AS cnt
         FROM Dm
         WHERE customerId IS NOT NULL
         GROUP BY customerId`
      );
      for (const row of dmsRs.rows as Array<Record<string, unknown>>) {
        const cid = String(row.customerId);
        dmsByCustomer.set(cid, Number(row.cnt ?? 0));
      }
    }

    const enriched = customers.map((c) => {
      const s = salesByCustomer.get(c.id) ?? {
        totalSpent: 0,
        totalPaid: 0,
        salesCount: 0,
      };
      const dmsCount = dmsByCustomer.get(c.id) ?? 0;
      return {
        ...c,
        stats: {
          totalSpent: s.totalSpent,
          totalPaid: s.totalPaid,
          pending: s.totalSpent - s.totalPaid,
          salesCount: s.salesCount,
          dmsCount,
        },
      };
    });

    return NextResponse.json({ customers: enriched });
  } catch (err) {
    console.error("[crm customers GET] error:", err);
    return NextResponse.json(
      { error: "Error al cargar clientes" },
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

    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim().length < 2
    ) {
      return NextResponse.json(
        { error: "El nombre es obligatorio (mínimo 2 caracteres)" },
        { status: 400 }
      );
    }

    if (body.email) {
      const existing = await rawDb.customer.findByEmail(
        String(body.email).trim().toLowerCase()
      );
      if (existing) {
        return NextResponse.json(
          { error: "Ya existe un cliente con ese email" },
          { status: 400 }
        );
      }
    }

    const customer = await rawDb.customer.create({
      name: body.name.trim(),
      email: body.email?.trim().toLowerCase() || null,
      phone: body.phone?.trim() || null,
      instagram: body.instagram?.trim() || null,
      channel: body.channel || "whatsapp",
      preferences: body.preferences?.trim() || null,
      notes: body.notes?.trim() || null,
      tags: body.tags?.trim() || null,
      isVip: Boolean(body.isVip),
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (err) {
    console.error("[crm customers POST] error:", err);
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    );
  }
}
