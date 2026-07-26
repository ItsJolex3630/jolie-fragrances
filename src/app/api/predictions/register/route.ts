import { NextRequest, NextResponse } from "next/server";
import { getDb, isDbAvailable } from "@/lib/db";
import { hashIP, generateOTP, hashFingerprint } from "@/lib/predictionSecurity";
import { getResend } from "@/lib/resend";
import { validateGmail } from "@/lib/emailValidator";

// SECURITY: the OTP proves the caller owns the mailbox it's sent to. It must
// NEVER be reflected back in an HTTP response outside of local development —
// doing so lets anyone "verify" an email address they don't own. Demo/dev
// conveniences (devOtp, "modo demo") are gated behind this flag so they can
// never fire in a deployed environment, even if RESEND_API_KEY is missing.
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  if (!isDbAvailable()) {
    const { email } = await request.json();
    const validation = validateGmail(email);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }
    if (IS_PRODUCTION) {
      // Fail closed: without a DB we can't persist/verify a real OTP, so we
      // must not pretend the flow succeeded.
      console.error("[register] BD no disponible en producción — no se puede emitir OTP.");
      return NextResponse.json(
        { error: "Servicio no disponible temporalmente. Intenta de nuevo en unos minutos." },
        { status: 503 }
      );
    }
    const demoOtp = "123456";
    console.log(`[DEMO] OTP for ${email}: ${demoOtp}`);
    return NextResponse.json({
      message: "Código de verificación enviado (modo demo)",
      devOtp: demoOtp,
      demo: true,
    });
  }

  try {
    const { email, deviceFingerprint } = await request.json();

    // ─── STRICT Gmail Validation ───
    const validation = validateGmail(email);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Get IP and hash it
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    const ipHash = hashIP(ip);

    // Hash device fingerprint if provided
    const fpHash = deviceFingerprint ? hashFingerprint(deviceFingerprint) : null;

    // Check if email already registered
    const existingUser = await getDb().user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      // If user exists but not verified, allow re-sending OTP
      if (!existingUser.emailVerified) {
        // Rate limit: max 3 OTP requests per email per hour
        const recentOtps = await getDb().otpCode.findMany({
          where: {
            email: normalizedEmail,
            createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
          },
        });
        if (recentOtps.length >= 3) {
          return NextResponse.json(
            { error: "Demasiados intentos. Espera una hora antes de solicitar otro código." },
            { status: 429 }
          );
        }

        await getDb().otpCode.updateMany({
          where: { email: normalizedEmail, used: false },
          data: { used: true },
        });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await getDb().otpCode.create({ data: { email: normalizedEmail, code: otp, expiresAt } });

        const resend = getResend();
        if (resend) {
          await sendOtpEmail(resend, normalizedEmail, otp);
        } else if (IS_PRODUCTION) {
          // SECURITY: never put the OTP in the HTTP response. Log it
          // server-side only (visible in Vercel logs to the operator, not to
          // the caller) so misconfiguration is at least diagnosable.
          console.error(
            `[register] RESEND_API_KEY no configurada — no se pudo reenviar OTP a ${normalizedEmail}.`
          );
          return NextResponse.json(
            { error: "No se pudo enviar el correo de verificación. Intenta más tarde." },
            { status: 503 }
          );
        } else {
          console.log(`[DEV] OTP for ${normalizedEmail}: ${otp}`);
        }

        return NextResponse.json({
          message: "Código reenviado a tu correo",
          devOtp: resend || IS_PRODUCTION ? undefined : otp,
        });
      }
      return NextResponse.json(
        { error: "Este correo ya está registrado y verificado. Inicia sesión con Google." },
        { status: 409 }
      );
    }

    // ─── Anti-multicuenta: Check IP ───
    const existingIP = await getDb().user.findFirst({
      where: { ipHash, NOT: { ipHash: "pending" } },
    });
    if (existingIP && ip !== "unknown") {
      return NextResponse.json(
        { error: "Ya tienes una cuenta registrada desde este dispositivo. No se permite múltiples cuentas." },
        { status: 403 }
      );
    }

    // ─── Anti-multicuenta: Check device fingerprint ───
    if (fpHash) {
      const existingFP = await getDb().user.findFirst({
        where: { deviceFingerprint: fpHash },
      });
      if (existingFP) {
        return NextResponse.json(
          { error: "Se detectó que ya tienes una cuenta en este dispositivo. Una cuenta por dispositivo." },
          { status: 403 }
        );
      }
    }

    // Rate limit: max 3 OTP requests per email per hour
    const recentOtps = await getDb().otpCode.findMany({
      where: {
        email: normalizedEmail,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (recentOtps.length >= 3) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera una hora antes de solicitar otro código." },
        { status: 429 }
      );
    }

    // Invalidate old OTPs
    await getDb().otpCode.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await getDb().otpCode.create({ data: { email: normalizedEmail, code: otp, expiresAt } });

    const resend = getResend();
    if (resend) {
      await sendOtpEmail(resend, normalizedEmail, otp);
    } else if (IS_PRODUCTION) {
      // SECURITY: never put the OTP in the HTTP response — see note above.
      console.error(
        `[register] RESEND_API_KEY no configurada — no se pudo enviar OTP a ${normalizedEmail}.`
      );
      return NextResponse.json(
        { error: "No se pudo enviar el correo de verificación. Intenta más tarde." },
        { status: 503 }
      );
    } else {
      console.log(`[DEV] OTP for ${normalizedEmail}: ${otp}`);
    }

    return NextResponse.json({
      message: "Código de verificación enviado a tu correo",
      devOtp: resend || IS_PRODUCTION ? undefined : otp,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

async function sendOtpEmail(resend: unknown, email: string, otp: string) {
  const { Resend } = await import("resend");
  const resendClient = resend as InstanceType<typeof Resend>;
  await resendClient.emails.send({
    from: "Jolie Fragrances <onboarding@resend.dev>",
    to: email,
    subject: "Tu código de verificación - Jolie Fragrances ⚽",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;border-radius:16px;border:1px solid rgba(212,175,55,0.2);">
        <div style="padding:32px 24px;text-align:center;">
          <h1 style="color:#d4af37;font-size:24px;margin:0 0 8px;">⚽ Jolie Fragrances</h1>
          <p style="color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">Sistema de Predicciones</p>
        </div>
        <div style="padding:0 24px 32px;text-align:center;">
          <p style="color:rgba(255,255,255,0.7);font-size:14px;margin-bottom:24px;">Tu código de verificación es:</p>
          <div style="background:rgba(212,175,55,0.1);border:2px dashed rgba(212,175,55,0.4);border-radius:12px;padding:16px;margin-bottom:24px;">
            <span style="font-size:36px;font-weight:bold;color:#d4af37;letter-spacing:8px;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:rgba(255,255,255,0.4);font-size:12px;">Copia este código exactamente como aparece. Expira en 10 minutos.</p>
          <p style="color:rgba(255,255,255,0.3);font-size:11px;margin-top:12px;">Si no solicitaste este código, ignora este correo.</p>
          <p style="color:rgba(255,255,255,0.2);font-size:10px;margin-top:8px;">⚠️ Revisa tu carpeta de spam si no ves el correo.</p>
        </div>
      </div>
    `,
  });
}
