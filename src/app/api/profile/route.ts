/**
 * /api/profile
 * ─────────────────────────────────────────────────────────────────────────────
 * Customer profile capture (phone + Instagram).
 *
 * GET  → returns { authenticated, hasPhone, name, email, phone, instagram }
 * PUT  → updates the User record (phone, instagram) and syncs the CRM
 *        Customer table (creates a Customer if none exists for this userId,
 *        otherwise updates the existing one's phone/instagram/name).
 *
 * Auth: requires a valid NextAuth session (getServerSession). Non-authenticated
 * callers get a 401. The CRM sync is best-effort: if it fails, the User update
 * still succeeds (the User table is the source of truth for the storefront
 * phone-capture flow).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

/** Strip whitespace + collapse multiple spaces. */
function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length === 0 ? null : s;
}

/** Normalize phone to "+58 XXXXXXXXXX" format. */
function normalizePhone(v: string | null): string | null {
  if (!v) return null;
  const digits = v.replace(/\D+/g, "");
  if (digits.length === 0) return null;
  let rest;
  if (digits.startsWith("58")) rest = digits.slice(2);
  else if (digits.startsWith("0")) rest = digits.slice(1);
  else rest = digits;
  return "+58 " + rest;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const email = session.user.email.trim().toLowerCase();

    if (!isRawDbAvailable()) {
      return NextResponse.json({
        authenticated: true,
        email,
        name: session.user.name ?? null,
        phone: null,
        instagram: null,
        hasPhone: false,
        dbAvailable: false,
      });
    }

    const user = await rawDb.user.findUniqueByEmail(email);
    if (!user) {
      return NextResponse.json({
        authenticated: true,
        email,
        name: session.user.name ?? null,
        phone: null,
        instagram: null,
        hasPhone: false,
        dbAvailable: true,
        registered: false,
      });
    }

    return NextResponse.json({
      authenticated: true,
      email: user.email,
      name: user.name,
      phone: user.phone,
      instagram: user.instagram,
      hasPhone: !!user.phone && user.phone.trim().length > 0,
      dbAvailable: true,
      registered: true,
    });
  } catch (err) {
    console.error("[/api/profile GET] error:", err);
    return NextResponse.json(
      { error: "Error al cargar el perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const email = session.user.email.trim().toLowerCase();

    if (!isRawDbAvailable()) {
      return NextResponse.json(
        { error: "Base de datos no disponible" },
        { status: 503 }
      );
    }

    const user = await rawDb.user.findUniqueByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const phone = normalizePhone(clean(body.phone));
    const instagram = clean(body.instagram);

    // ─── Update the User record ───
    const updateData: { phone?: string | null; instagram?: string | null } = {};
    if (body.phone !== undefined) updateData.phone = phone;
    if (body.instagram !== undefined) updateData.instagram = instagram;

    const updated =
      Object.keys(updateData).length > 0
        ? await rawDb.user.update(user.id, updateData)
        : user;

    // ─── Sync to CRM Customer ───
    // Best-effort: if the sync fails, the User update still stands (the
    // storefront phone-capture flow reads from User, not Customer).
    try {
      let existingCustomer = await rawDb.customer.findByUserId(user.id);
      
      // If not found by userId, try to match an old manually-created CRM record by email
      if (!existingCustomer && user.email) {
        existingCustomer = await rawDb.customer.findByEmail(user.email);
      }

      if (existingCustomer) {
        await rawDb.customer.update(existingCustomer.id, {
          userId: user.id, // Ensure it's linked
          phone: phone ?? undefined,
          instagram: instagram ?? undefined,
          name: updated?.name ?? user.name ?? undefined,
        });
      } else {
        await rawDb.customer.create({
          userId: user.id,
          name: user.name ?? email.split("@")[0],
          email: user.email,
          phone: phone ?? null,
          instagram: instagram ?? null,
          channel: "web",
        });
      }
    } catch (syncErr) {
      console.warn(
        "[/api/profile PUT] CRM sync failed (non-fatal):",
        syncErr
      );
    }

    return NextResponse.json({
      ok: true,
      phone: updated?.phone ?? phone,
      instagram: updated?.instagram ?? instagram,
      hasPhone: !!(updated?.phone && updated.phone.trim().length > 0),
    });
  } catch (err) {
    console.error("[/api/profile PUT] error:", err);
    return NextResponse.json(
      { error: "Error al guardar el perfil" },
      { status: 500 }
    );
  }
}
