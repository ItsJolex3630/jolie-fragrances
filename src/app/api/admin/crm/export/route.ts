/**
 * GET /api/admin/crm/export?format=xlsx
 * Exporta toda la data del CRM a Excel con múltiples hojas:
 * - Resumen (KPIs)
 * - Clientes
 * - Ventas
 * - Decants
 * - Inventario
 * - DMs y Consultas
 *
 * Estilizado con la paleta de Jolie Fragrances:
 * - Header: fondo negro (#0A0A0A), texto dorado (#D4AF37), bold
 * - Filas alternadas: blanco / gris muy claro
 * - Bordes sutiles dorados
 * - Columnas con ancho automático optimizado
 * - Título de marca en la primera fila de cada hoja
 */
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx-js-style";
import { rawDb } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";

// ─── Paleta de Jolie Fragrances ──────────────────────────────────────────────
const COLORS = {
  black: "0A0A0A",
  gold: "D4AF37",
  goldLight: "F0D060",
  goldDark: "B8962E",
  white: "FFFFFF",
  grayLight: "F5F5F5",
  grayMedium: "E0E0E0",
  emerald: "10B981",
  rose: "EF4444",
  amber: "F59E0B",
};

// ─── Estilos reutilizables ────────────────────────────────────────────────────

/** Estilo para el título de marca (fila 1 de cada hoja) */
const titleStyle: XLSX.CellObject["s"] = {
  font: { name: "Calibri", sz: 16, bold: true, color: { rgb: COLORS.gold } },
  fill: { fgColor: { rgb: COLORS.black } },
  alignment: { horizontal: "center", vertical: "center" },
};

/** Estilo para el subtítulo (fila 2) */
const subtitleStyle: XLSX.CellObject["s"] = {
  font: { name: "Calibri", sz: 10, italic: true, color: { rgb: "999999" } },
  fill: { fgColor: { rgb: COLORS.black } },
  alignment: { horizontal: "center", vertical: "center" },
};

/** Estilo para los headers de columna (fila 3) */
const headerStyle: XLSX.CellObject["s"] = {
  font: { name: "Calibri", sz: 11, bold: true, color: { rgb: COLORS.gold } },
  fill: { fgColor: { rgb: COLORS.black } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: {
    top: { style: "thin", color: { rgb: COLORS.goldDark } },
    bottom: { style: "medium", color: { rgb: COLORS.gold } },
    left: { style: "thin", color: { rgb: COLORS.goldDark } },
    right: { style: "thin", color: { rgb: COLORS.goldDark } },
  },
};

/** Estilo para celdas de datos (filas pares) */
const dataStyleEven: XLSX.CellObject["s"] = {
  font: { name: "Calibri", sz: 10, color: { rgb: "333333" } },
  fill: { fgColor: { rgb: COLORS.white } },
  alignment: { vertical: "center", wrapText: false },
  border: {
    top: { style: "hair", color: { rgb: COLORS.grayMedium } },
    bottom: { style: "hair", color: { rgb: COLORS.grayMedium } },
    left: { style: "hair", color: { rgb: COLORS.grayMedium } },
    right: { style: "hair", color: { rgb: COLORS.grayMedium } },
  },
};

/** Estilo para celdas de datos (filas impares — alternadas) */
const dataStyleOdd: XLSX.CellObject["s"] = {
  ...dataStyleEven,
  fill: { fgColor: { rgb: COLORS.grayLight } },
};

/** Estilo para celdas con valores monetarios */
const moneyStyle = (even: boolean): XLSX.CellObject["s"] => ({
  ...(even ? dataStyleEven : dataStyleOdd),
  font: { name: "Calibri", sz: 10, bold: true, color: { rgb: COLORS.goldDark } },
  alignment: { horizontal: "right", vertical: "center" },
  numFmt: '"$"#,##0.00',
});

/** Estilo para el header del Resumen (Métrica) */
const metricLabelStyle: XLSX.CellObject["s"] = {
  ...headerStyle,
  alignment: { horizontal: "left", vertical: "center" },
};

/** Estilo para el valor del Resumen */
const metricValueStyle = (even: boolean): XLSX.CellObject["s"] => ({
  ...(even ? dataStyleEven : dataStyleOdd),
  font: { name: "Calibri", sz: 11, bold: true, color: { rgb: COLORS.goldDark } },
  alignment: { horizontal: "right", vertical: "center" },
});

// ─── Helper: aplicar estilos a una hoja ──────────────────────────────────────

interface SheetConfig {
  ws: XLSX.WorkSheet;
  headers: string[];
  dataRows: Record<string, unknown>[];
  moneyColumns?: string[]; // nombres de columnas que contienen valores monetarios
  title: string;
  subtitle?: string;
}

function styleSheet(config: SheetConfig): void {
  const { ws, headers, dataRows, moneyColumns = [], title, subtitle } = config;
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  const titleRow = 0;
  const subtitleRow = subtitle ? 1 : -1;
  const headerRow = subtitle ? 2 : 1;
  const dataStartRow = subtitle ? 3 : 2;

  const numCols = headers.length;

  // Merge cells for title
  ws["!merges"] = ws["!merges"] || [];
  ws["!merges"].push({
    s: { r: titleRow, c: 0 },
    e: { r: titleRow, c: numCols - 1 },
  });
  const titleCell = ws[XLSX.utils.encode_cell({ r: titleRow, c: 0 })];
  if (titleCell) {
    titleCell.s = titleStyle;
  }

  // Subtitle
  if (subtitle && subtitleRow >= 0) {
    ws["!merges"].push({
      s: { r: subtitleRow, c: 0 },
      e: { r: subtitleRow, c: numCols - 1 },
    });
    const subCell = ws[XLSX.utils.encode_cell({ r: subtitleRow, c: 0 })];
    if (subCell) subCell.s = subtitleStyle;
  }

  // Header row
  for (let c = 0; c < numCols; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: headerRow, c });
    const cell = ws[cellAddr];
    if (cell) cell.s = headerStyle;
  }

  // Data rows
  for (let r = dataStartRow; r <= range.e.r; r++) {
    const isEven = (r - dataStartRow) % 2 === 0;
    for (let c = 0; c < numCols; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[cellAddr];
      if (!cell) continue;

      const colName = headers[c];
      const isMoney = moneyColumns.includes(colName);

      if (isMoney) {
        cell.s = moneyStyle(isEven);
      } else {
        cell.s = isEven ? dataStyleEven : dataStyleOdd;
      }
    }
  }

  // Column widths — optimized
  const colWidths: { wch: number }[] = [];
  for (let c = 0; c < numCols; c++) {
    let maxLen = headers[c].length + 2;
    for (let r = dataStartRow; r <= range.e.r; r++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (cell && cell.v != null) {
        const len = String(cell.v).length;
        if (len > maxLen) maxLen = Math.min(len + 2, 45);
      }
    }
    colWidths.push({ wch: Math.max(maxLen, 10) });
  }
  ws["!cols"] = colWidths;

  // Row heights
  ws["!rows"] = ws["!rows"] || [];
  ws["!rows"][titleRow] = { hpt: 30 };
  if (subtitle && subtitleRow >= 0) ws["!rows"][subtitleRow] = { hpt: 18 };
  ws["!rows"][headerRow] = { hpt: 24 };
}

// ─── Helper: fechas ──────────────────────────────────────────────────────────

function fmtDate(d: Date | string | null): string {
  if (!d) return "";
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toISOString().split("T")[0];
  } catch {
    return String(d);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "xlsx";

  if (format !== "xlsx") {
    return NextResponse.json(
      { error: "Formato no soportado. Usa ?format=xlsx" },
      { status: 400 }
    );
  }

  try {
    const [customers, sales, decants, inventory, dms] = await Promise.all([
      rawDb.customer.findMany(),
      rawDb.sale.findMany({ orderBy: { saleDate: "desc" } }),
      rawDb.decant.findMany(),
      rawDb.inventoryItem.findMany(),
      rawDb.dm.findMany(),
    ]);

    const customerIdToName = new Map<string, string>();
    for (const c of customers) customerIdToName.set(c.id, c.name);

    // Per-customer aggregates
    const salesByCustomer = new Map<
      string,
      { totalSpent: number; totalPaid: number; salesCount: number }
    >();
    for (const s of sales) {
      const cur = salesByCustomer.get(s.customerId) ?? {
        totalSpent: 0,
        totalPaid: 0,
        salesCount: 0,
      };
      cur.totalSpent += s.totalPrice;
      cur.totalPaid += s.paid;
      cur.salesCount += 1;
      salesByCustomer.set(s.customerId, cur);
    }

    // ─── Construir workbook ───
    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: "Jolie Fragrances - CRM Export",
      Author: "Jolie Fragrances",
      Subject: "Export completo de data CRM",
    };

    const today = new Date().toISOString().split("T")[0];

    // ═══ Hoja 1: Resumen ═══
    const totalRevenue = sales.reduce((s, x) => s + x.totalPrice, 0);
    const totalCollected = sales.reduce((s, x) => s + x.paid, 0);
    const totalPending = sales.reduce((s, x) => s + x.pending, 0);
    const decantRevenue = decants
      .filter((d) => d.status === "sold")
      .reduce((s, x) => s + x.price, 0);
    const dmsClosedSold = dms.filter((d) => d.status === "closed_sold").length;
    const conversionRate =
      dms.length > 0 ? (dmsClosedSold / dms.length) * 100 : 0;

    const summaryHeaders = ["Métrica", "Valor"];
    const summaryData = [
      { Métrica: "Total clientes", Valor: customers.length },
      { Métrica: "Total ventas registradas", Valor: sales.length },
      { Métrica: "Total decants", Valor: decants.length },
      { Métrica: "Decants vendidos", Valor: decants.filter((d) => d.status === "sold").length },
      { Métrica: "Items en inventario", Valor: inventory.length },
      { Métrica: "Items disponibles", Valor: inventory.filter((i) => i.status === "available").length },
      { Métrica: "Items vendidos", Valor: inventory.filter((i) => i.status === "sold").length },
      { Métrica: "Total DMs/Consultas", Valor: dms.length },
      { Métrica: "DMs cerrados con venta", Valor: dmsClosedSold },
      { Métrica: "Tasa conversión DM→Venta (%)", Valor: Number(conversionRate.toFixed(1)) },
      { Métrica: "Ingreso total (USD)", Valor: totalRevenue },
      { Métrica: "Cobrado total (USD)", Valor: totalCollected },
      { Métrica: "Pendiente cobro (USD)", Valor: totalPending },
      { Métrica: "Ingreso por decants (USD)", Valor: decantRevenue },
      { Métrica: "Valor inventario disponible (USD)", Valor: inventory.filter((i) => i.status === "available").reduce((s, x) => s + x.price, 0) },
      { Métrica: "Exportado el", Valor: today },
    ];

    const ws1 = XLSX.utils.json_to_sheet(summaryData, { header: summaryHeaders });
    // Add title row at top
    XLSX.utils.sheet_add_aoa(ws1, [["Jolie Fragrances — Resumen CRM"], [`Exportado: ${today}`]], { origin: "A1" });
    // Shift data down by 2 rows (title + subtitle)
    // Actually json_to_sheet already put headers at row 0, so we need to insert title above
    // Easier: rebuild with title manually
    const ws1Data: (string | number)[][] = [
      ["Jolie Fragrances — Resumen CRM"],
      [`Exportado: ${today}`],
      summaryHeaders,
      ...summaryData.map((r) => [r.Métrica, r.Valor]),
    ];
    const ws1Final = XLSX.utils.aoa_to_sheet(ws1Data);
    styleSheet({
      ws: ws1Final,
      headers: summaryHeaders,
      dataRows: summaryData,
      title: "Jolie Fragrances — Resumen CRM",
      subtitle: `Exportado: ${today}`,
    });
    // Override: metric label should be left-aligned
    for (let r = 3; r < ws1Data.length; r++) {
      const labelCell = ws1Final[XLSX.utils.encode_cell({ r, c: 0 })];
      if (labelCell) {
        labelCell.s = {
          ...(r % 2 === 0 ? dataStyleEven : dataStyleOdd),
          font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "333333" } },
        };
      }
      const valCell = ws1Final[XLSX.utils.encode_cell({ r, c: 1 })];
      if (valCell) {
        const isMoney = String(ws1Data[r][0] || "").includes("USD");
        valCell.s = isMoney ? moneyStyle(r % 2 === 0) : (r % 2 === 0 ? dataStyleEven : dataStyleOdd);
        if (isMoney) valCell.s = { ...valCell.s, numFmt: '"$"#,##0.00' };
      }
    }
    ws1Final["!cols"] = [{ wch: 30 }, { wch: 18 }];
    ws1Final["!rows"] = [{ hpt: 30 }, { hpt: 18 }, { hpt: 24 }];
    XLSX.utils.book_append_sheet(wb, ws1Final, "Resumen");

    // ═══ Hoja 2: Clientes ═══
    const customerHeaders = [
      "Nombre", "Email", "WhatsApp", "Instagram", "Canal",
      "Preferencias", "Tags", "VIP", "Bloqueado", "Razón bloqueo",
      "Notas", "Total gastado (USD)", "Total pagado (USD)",
      "Pendiente (USD)", "N° ventas", "Cliente desde",
    ];
    const customersData = customers.map((c) => {
      const s = salesByCustomer.get(c.id) ?? { totalSpent: 0, totalPaid: 0, salesCount: 0 };
      return {
        "Nombre": c.name,
        "Email": c.email || "",
        "WhatsApp": c.phone || "",
        "Instagram": c.instagram || "",
        "Canal": c.channel,
        "Preferencias": c.preferences || "",
        "Tags": c.tags || "",
        "VIP": c.isVip ? "Sí" : "No",
        "Bloqueado": c.isBlocked ? "Sí" : "No",
        "Razón bloqueo": c.blockReason || "",
        "Notas": c.notes || "",
        "Total gastado (USD)": s.totalSpent,
        "Total pagado (USD)": s.totalPaid,
        "Pendiente (USD)": s.totalSpent - s.totalPaid,
        "N° ventas": s.salesCount,
        "Cliente desde": fmtDate(c.createdAt),
      };
    });
    const ws2Data: (string | number)[][] = [
      ["Jolie Fragrances — Clientes"],
      [`Exportado: ${today}`],
      customerHeaders,
      ...customersData.map((r) => customerHeaders.map((h) => r[h as keyof typeof r] ?? "")),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
    styleSheet({
      ws: ws2,
      headers: customerHeaders,
      dataRows: customersData,
      moneyColumns: ["Total gastado (USD)", "Total pagado (USD)", "Pendiente (USD)"],
      title: "Jolie Fragrances — Clientes",
      subtitle: `Exportado: ${today}`,
    });
    XLSX.utils.book_append_sheet(wb, ws2, "Clientes");

    // ═══ Hoja 3: Ventas ═══
    const salesHeaders = [
      "Fecha", "Cliente", "Tipo", "Producto", "Cantidad",
      "Precio unit. (USD)", "Total (USD)", "Pagado (USD)",
      "Pendiente (USD)", "Estado pago", "Método pago",
      "Entrega", "Costo envío (USD)", "Notas",
    ];
    const salesData = sales.map((s) => ({
      "Fecha": fmtDate(s.saleDate),
      "Cliente": customerIdToName.get(s.customerId) || "",
      "Tipo": s.itemType,
      "Producto": s.itemName,
      "Cantidad": s.quantity,
      "Precio unit. (USD)": s.unitPrice,
      "Total (USD)": s.totalPrice,
      "Pagado (USD)": s.paid,
      "Pendiente (USD)": s.pending,
      "Estado pago": s.paymentStatus,
      "Método pago": s.paymentMethod || "",
      "Entrega": s.deliveryMethod || "",
      "Costo envío (USD)": s.deliveryCost || "",
      "Notas": s.notes || "",
    }));
    const ws3Data: (string | number)[][] = [
      ["Jolie Fragrances — Ventas"],
      [`Exportado: ${today}`],
      salesHeaders,
      ...salesData.map((r) => salesHeaders.map((h) => r[h as keyof typeof r] ?? "")),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
    styleSheet({
      ws: ws3,
      headers: salesHeaders,
      dataRows: salesData,
      moneyColumns: ["Precio unit. (USD)", "Total (USD)", "Pagado (USD)", "Pendiente (USD)", "Costo envío (USD)"],
      title: "Jolie Fragrances — Ventas",
      subtitle: `Exportado: ${today}`,
    });
    XLSX.utils.book_append_sheet(wb, ws3, "Ventas");

    // ═══ Hoja 4: Decants ═══
    const decantHeaders = [
      "Perfume fuente", "Marca", "Perfil olfativo", "Tamaño (ml)",
      "Costo (USD)", "Precio venta (USD)", "Estado",
      "Cliente asignado", "Llenado el", "Vendido el", "Notas", "Creado",
    ];
    const decantsData = decants.map((d) => ({
      "Perfume fuente": d.sourcePerfume,
      "Marca": d.sourceBrand || "",
      "Perfil olfativo": d.olfativeProfile || "",
      "Tamaño (ml)": d.sizeMl,
      "Costo (USD)": d.cost || "",
      "Precio venta (USD)": d.price,
      "Estado": d.status,
      "Cliente asignado": d.customerId ? customerIdToName.get(d.customerId) || "" : "",
      "Llenado el": fmtDate(d.filledAt),
      "Vendido el": fmtDate(d.soldAt),
      "Notas": d.notes || "",
      "Creado": fmtDate(d.createdAt),
    }));
    const ws4Data: (string | number)[][] = [
      ["Jolie Fragrances — Decants"],
      [`Exportado: ${today}`],
      decantHeaders,
      ...decantsData.map((r) => decantHeaders.map((h) => r[h as keyof typeof r] ?? "")),
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(ws4Data);
    styleSheet({
      ws: ws4,
      headers: decantHeaders,
      dataRows: decantsData,
      moneyColumns: ["Costo (USD)", "Precio venta (USD)"],
      title: "Jolie Fragrances — Decants",
      subtitle: `Exportado: ${today}`,
    });
    XLSX.utils.book_append_sheet(wb, ws4, "Decants");

    // ═══ Hoja 5: Inventario ═══
    const invHeaders = [
      "Nombre", "Marca", "Perfil olfativo", "Tamaño",
      "Costo (USD)", "Precio venta (USD)", "Estado",
      "Cliente potencial", "Notas", "Adquirido", "Vendido",
    ];
    const inventoryData = inventory.map((i) => ({
      "Nombre": i.name,
      "Marca": i.brand || "",
      "Perfil olfativo": i.olfativeProfile || "",
      "Tamaño": i.size || "",
      "Costo (USD)": i.cost || "",
      "Precio venta (USD)": i.price,
      "Estado": i.status,
      "Cliente potencial": i.customerInterest || "",
      "Notas": i.notes || "",
      "Adquirido": fmtDate(i.acquiredAt),
      "Vendido": fmtDate(i.soldAt),
    }));
    const ws5Data: (string | number)[][] = [
      ["Jolie Fragrances — Inventario"],
      [`Exportado: ${today}`],
      invHeaders,
      ...inventoryData.map((r) => invHeaders.map((h) => r[h as keyof typeof r] ?? "")),
    ];
    const ws5 = XLSX.utils.aoa_to_sheet(ws5Data);
    styleSheet({
      ws: ws5,
      headers: invHeaders,
      dataRows: inventoryData,
      moneyColumns: ["Costo (USD)", "Precio venta (USD)"],
      title: "Jolie Fragrances — Inventario",
      subtitle: `Exportado: ${today}`,
    });
    XLSX.utils.book_append_sheet(wb, ws5, "Inventario");

    // ═══ Hoja 6: DMs ═══
    const dmHeaders = [
      "Recibido", "Plataforma", "Usuario", "Cliente vinculado",
      "Perfume interés", "Tipo consulta", "Estado",
      "Próximo paso", "Fecha seguimiento", "Cerrado el",
      "Resultado", "Notas",
    ];
    const dmsData = dms.map((d) => ({
      "Recibido": fmtDate(d.receivedAt),
      "Plataforma": d.platform,
      "Usuario": d.username || "",
      "Cliente vinculado": d.customerId ? customerIdToName.get(d.customerId) || "" : "",
      "Perfume interés": d.fragranceInterest || "",
      "Tipo consulta": d.inquiryType,
      "Estado": d.status,
      "Próximo paso": d.nextStep || "",
      "Fecha seguimiento": fmtDate(d.followUpDate),
      "Cerrado el": fmtDate(d.closedAt),
      "Resultado": d.result || "",
      "Notas": d.notes || "",
    }));
    const ws6Data: (string | number)[][] = [
      ["Jolie Fragrances — DMs y Consultas"],
      [`Exportado: ${today}`],
      dmHeaders,
      ...dmsData.map((r) => dmHeaders.map((h) => r[h as keyof typeof r] ?? "")),
    ];
    const ws6 = XLSX.utils.aoa_to_sheet(ws6Data);
    styleSheet({
      ws: ws6,
      headers: dmHeaders,
      dataRows: dmsData,
      title: "Jolie Fragrances — DMs y Consultas",
      subtitle: `Exportado: ${today}`,
    });
    XLSX.utils.book_append_sheet(wb, ws6, "DMs y Consultas");

    // ─── Generar buffer ───
    const buf = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
      cellStyles: true,
    });

    const filename = `jolie-crm-${today}.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buf.byteLength),
      },
    });
  } catch (err) {
    console.error("[crm export] error:", err);
    return NextResponse.json(
      { error: "Error al exportar" },
      { status: 500 }
    );
  }
}
