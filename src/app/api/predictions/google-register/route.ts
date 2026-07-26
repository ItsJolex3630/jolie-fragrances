import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";
import { hashIP, hashFingerprint } from "@/lib/predictionSecurity";

/**
 * Register a user via Google Sign-In
 * Called after Google verified the Gmail is REAL
 * No OTP needed — Google already proved the email is legitimate
 *
 * SECURITY (fixed): this route used to trust `email`/`name`/`image` exactly
 * as sent in the request body, with NO check that the caller actually has a
 * Google session for that email. That let anyone POST an arbitrary email and
 * get a DB row created/updated with `emailVerified: true` + `authProvider:
 * "google"` — i.e. "verify" any address without ever signing in with Google.
 * It now requires a real NextAuth session and only ever registers/updates
 * the session's OWN email; `name`/`image` from the body are still accepted
 * as display-only profile info but the identity itself comes from the session.
 *
 * NOTE: This route uses `rawDb` (@libsql/client wrapper) instead of Prisma
 * because Prisma kept failing on Vercel with `URL_INVALID: The URL 'undefined'`.
 * Response JSON shape is IDENTICAL to the previous Prisma-based version.
 *
 * Unique-constraint detection:
 *   Prisma throws `P2002`; libsql throws a generic Error whose `message`
 *   contains "UNIQUE constraint failed: ...". We check the message instead.
 */
export async function POST(request: NextRequest) {
  try {
    const { name, image, deviceFingerprint } = await request.json();

    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email?.trim().toLowerCase();

    if (!sessionEmail) {
      return NextResponse.json({ error: "No autenticado con Google" }, { status: 401 });
    }
    if (!sessionEmail.endsWith("@gmail.com")) {
      return NextResponse.json({ error: "Solo se permiten correos @gmail.com" }, { status: 400 });
    }

    const normalizedEmail = sessionEmail;

    // If DB is not available, use demo mode
    if (!isRawDbAvailable()) {
      console.log("[GoogleRegister] DB not available — using demo mode for:", normalizedEmail);
      const demoUserId = "demo_" + normalizedEmail.replace(/[^a-z0-9]/g, "_");
      return NextResponse.json({
        message: "Cuenta en modo demo (BD no disponible)",
        user: { id: demoUserId, email: normalizedEmail, name: name || normalizedEmail.split("@")[0] },
        demo: true,
      });
    }

    try {
      const existing = await rawDb.user.findUniqueByEmail(normalizedEmail);

      if (existing) {
        await rawDb.user.update(existing.id, {
          emailVerified: new Date(),
          authProvider: "google",
          name: name || existing.name,
          image: image || existing.image,
        });

        return NextResponse.json({
          message: "Cuenta actualizada con Google",
          user: { id: existing.id, email: existing.email, name: existing.name },
        });
      }

      const forwarded = request.headers.get("x-forwarded-for");
      const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
      const ipHash = hashIP(ip);
      const fpHash = deviceFingerprint ? hashFingerprint(deviceFingerprint) : null;

      // Anti-multicuenta
      const existingByIP = await rawDb.user.findFirstByIpHash(ipHash);
      if (existingByIP && ip !== "unknown") {
        return NextResponse.json(
          { error: "Ya tienes una cuenta registrada desde este dispositivo." },
          { status: 403 }
        );
      }

      if (fpHash) {
        const existingByFP = await rawDb.user.findFirstByDeviceFingerprint(fpHash);
        if (existingByFP) {
          return NextResponse.json(
            { error: "Se detectó una cuenta existente en este dispositivo." },
            { status: 403 }
          );
        }
      }

      const user = await rawDb.user.create({
        email: normalizedEmail,
        name: name || normalizedEmail.split("@")[0],
        image: image || null,
        emailVerified: new Date(),
        authProvider: "google",
        ipHash,
        deviceFingerprint: fpHash,
      });

      return NextResponse.json({
        message: "Cuenta creada con Google exitosamente",
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (dbError: unknown) {
      console.error("[GoogleRegister] DB query error:", dbError);

      // libsql unique-constraint violation (replaces Prisma's `error.code === "P2002"`)
      if (dbError instanceof Error && dbError.message.includes("UNIQUE constraint")) {
        return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 });
      }

      // Fall back to demo mode for any other DB error
      console.log("[GoogleRegister] Falling back to demo mode due to DB error");
      const demoUserId = "demo_" + normalizedEmail.replace(/[^a-z0-9]/g, "_");
      return NextResponse.json({
        message: "Cuenta en modo demo (error de BD)",
        user: { id: demoUserId, email: normalizedEmail, name: name || normalizedEmail.split("@")[0] },
        demo: true,
      });
    }
  } catch (error: unknown) {
    console.error("[GoogleRegister] Unexpected error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
