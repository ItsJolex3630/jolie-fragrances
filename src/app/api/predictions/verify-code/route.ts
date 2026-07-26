import { NextRequest, NextResponse } from "next/server";
import { getDb, isDbAvailable } from "@/lib/db";
import { verifyDiscountPayload } from "@/lib/predictionSecurity";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) return NextResponse.json({ error: "Código requerido" }, { status: 400 });

    // Cryptographic verification always works (no DB needed)
    const parsed = verifyDiscountPayload(code);
    if (!parsed || !parsed.isValid) {
      return NextResponse.json(
        { valid: false, error: "Código inválido o falsificado", detail: parsed ? "La firma criptográfica no coincide." : "Formato inválido." },
        { status: 400 }
      );
    }

    if (!isDbAvailable()) {
      return NextResponse.json({
        valid: true,
        alreadyUsed: false,
        message: "Código verificado (modo demo — sin BD)",
        user: { email: parsed.email, name: parsed.email.split("@")[0] },
        discountPct: parsed.discountPct,
        expiresAt: new Date(parsed.timestamp + 30 * 24 * 60 * 60 * 1000).toISOString(),
        demo: true,
      });
    }

    const discountCode = await getDb().discountCode.findUnique({ where: { code }, include: { user: true } });
    if (!discountCode) {
      return NextResponse.json({ valid: false, error: "Código no encontrado en la base de datos" }, { status: 404 });
    }

    if (discountCode.verified) {
      return NextResponse.json({
        valid: true, alreadyUsed: true,
        verifiedAt: discountCode.verifiedAt,
        message: "Este código YA FUE CANJEADO",
        user: { email: discountCode.user.email, name: discountCode.user.name },
        discountPct: discountCode.discountPct,
        expiresAt: discountCode.expiresAt,
      });
    }

    await getDb().discountCode.update({ where: { id: discountCode.id }, data: { verified: true, verifiedAt: new Date() } });

    return NextResponse.json({
      valid: true, alreadyUsed: false,
      message: "Código verificado y canjeado exitosamente",
      user: { email: discountCode.user.email, name: discountCode.user.name },
      discountPct: discountCode.discountPct,
      expiresAt: discountCode.expiresAt,
      predictionId: discountCode.predictionId,
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
