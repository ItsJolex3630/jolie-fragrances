import { NextRequest, NextResponse } from "next/server";
import { getDb, isDbAvailable } from "@/lib/db";
import { hashIP, hashFingerprint } from "@/lib/predictionSecurity";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  if (!isDbAvailable()) {
    if (IS_PRODUCTION) {
      // SECURITY: without a DB there is no real OTP to check against, so we
      // must fail closed instead of accepting any code as "verified".
      console.error("[verify-otp] BD no disponible en producción — no se puede verificar el OTP.");
      return NextResponse.json(
        { error: "Servicio no disponible temporalmente. Intenta de nuevo en unos minutos." },
        { status: 503 }
      );
    }
    const { email, name } = await request.json();
    return NextResponse.json({
      message: "Cuenta verificada (modo demo)",
      user: { id: "demo-user-" + Date.now(), email, name: name || email.split("@")[0] },
      demo: true,
    });
  }

  try {
    const { email, otp, name, deviceFingerprint } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email y código OTP son requeridos" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find valid OTP
    const otpRecord = await getDb()!.otpCode.findFirst({
      where: { email: normalizedEmail, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Código inválido, expirado o ya utilizado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // Check attempt count (max 5)
    if (otpRecord.attempts >= 5) {
      await getDb()!.otpCode.update({ where: { id: otpRecord.id }, data: { used: true } });
      return NextResponse.json(
        { error: "Demasiados intentos fallidos. Solicita un nuevo código." },
        { status: 429 }
      );
    }

    // SECURITY: OTP must match EXACTLY (case-sensitive, exact match)
    if (otpRecord.code !== otp.toString().trim()) {
      await getDb()!.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      const remaining = 5 - (otpRecord.attempts + 1);
      return NextResponse.json(
        { error: `Código incorrecto. Te quedan ${remaining} intento(s).` },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await getDb()!.otpCode.update({ where: { id: otpRecord.id }, data: { used: true } });

    // Get IP and fingerprint
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const ipHash = hashIP(ip);
    const fpHash = deviceFingerprint ? hashFingerprint(deviceFingerprint) : null;

    // Double-check anti-multicuenta before creating user
    const existingByIP = await getDb()!.user.findFirst({
      where: { ipHash, NOT: { ipHash: "pending" } },
    });
    if (existingByIP && ip !== "unknown") {
      return NextResponse.json(
        { error: "Ya existe una cuenta verificada desde este dispositivo." },
        { status: 403 }
      );
    }
    if (fpHash) {
      const existingByFP = await getDb()!.user.findFirst({
        where: { deviceFingerprint: fpHash },
      });
      if (existingByFP) {
        return NextResponse.json(
          { error: "Se detectó una cuenta existente en este dispositivo. Una cuenta por dispositivo." },
          { status: 403 }
        );
      }
    }

    // Create verified user with emailVerified as DateTime
    const user = await getDb()!.user.create({
      data: {
        email: normalizedEmail,
        name: name || normalizedEmail.split("@")[0],
        emailVerified: new Date(), // OTP verification = email verified
        authProvider: "otp",
        ipHash,
        deviceFingerprint: fpHash,
      },
    });

    return NextResponse.json({
      message: "Cuenta verificada exitosamente",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 });
    }
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
