/**
 * GET /api/admin/crm/stats
 * KPIs del dashboard: totales, ingresos, conversión DM→venta, etc.
 *
 * Migrated from Prisma to rawDb (@libsql/client) — works on Vercel.
 */
import { NextResponse } from "next/server";
import { rawDb } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [customers, sales, decants, inventory, dms] = await Promise.all([
      rawDb.customer.findMany(),
      rawDb.sale.findMany({ orderBy: { saleDate: "desc" } }),
      rawDb.decant.findMany(),
      rawDb.inventoryItem.findMany(),
      rawDb.dm.findMany(),
    ]);

    const totalCustomers = customers.length;
    const totalSales = sales.length;
    const totalDecants = decants.length;
    const totalInventory = inventory.length;
    const totalDms = dms.length;

    const totalRevenue = sales.reduce(
      (sum, s) => sum + (s.totalPrice || 0),
      0
    );
    const totalCollected = sales.reduce((sum, s) => sum + (s.paid || 0), 0);
    const totalPending = sales.reduce((sum, s) => sum + (s.pending || 0), 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sales30d = sales.filter(
      (s) => new Date(s.saleDate) >= thirtyDaysAgo
    );
    const revenue30d = sales30d.reduce(
      (sum, s) => sum + (s.totalPrice || 0),
      0
    );

    const dmsClosedSold = dms.filter(
      (d) => d.status === "closed_sold"
    ).length;
    const conversionRate =
      totalDms > 0 ? (dmsClosedSold / totalDms) * 100 : 0;

    const decantsByStatus = {
      pending: decants.filter((d) => d.status === "pending").length,
      filled: decants.filter((d) => d.status === "filled").length,
      available: decants.filter((d) => d.status === "available").length,
      reserved: decants.filter((d) => d.status === "reserved").length,
      sold: decants.filter((d) => d.status === "sold").length,
    };
    const decantRevenue = decants
      .filter((d) => d.status === "sold")
      .reduce((sum, d) => sum + (d.price || 0), 0);

    const inventoryByStatus = {
      available: inventory.filter((i) => i.status === "available").length,
      reserved: inventory.filter((i) => i.status === "reserved").length,
      sold: inventory.filter((i) => i.status === "sold").length,
    };
    const inventoryValueAvailable = inventory
      .filter((i) => i.status === "available")
      .reduce((sum, i) => sum + (i.price || 0), 0);
    const inventoryCostTotal = inventory.reduce(
      (sum, i) => sum + (i.cost || 0),
      0
    );

    const dmsByStatus = {
      new: dms.filter((d) => d.status === "new").length,
      in_conversation: dms.filter((d) => d.status === "in_conversation")
        .length,
      pending: dms.filter((d) => d.status === "pending").length,
      closed_sold: dms.filter((d) => d.status === "closed_sold").length,
      closed_no_sale: dms.filter((d) => d.status === "closed_no_sale").length,
      no_reply: dms.filter((d) => d.status === "no_reply").length,
    };

    return NextResponse.json({
      totals: {
        customers: totalCustomers,
        sales: totalSales,
        decants: totalDecants,
        inventory: totalInventory,
        dms: totalDms,
      },
      revenue: {
        total: totalRevenue,
        collected: totalCollected,
        pending: totalPending,
        last30Days: revenue30d,
        decantRevenue,
        inventoryValueAvailable,
        inventoryCostTotal,
      },
      conversion: {
        dmsToSale: Number(conversionRate.toFixed(1)),
        dmsClosedSold,
        totalDms,
      },
      decantsByStatus,
      inventoryByStatus,
      dmsByStatus,
    });
  } catch (err) {
    console.error("[crm stats] error:", err);
    return NextResponse.json(
      { error: "Error al cargar estadísticas" },
      { status: 500 }
    );
  }
}
