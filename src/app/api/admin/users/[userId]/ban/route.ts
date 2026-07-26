import { NextRequest, NextResponse } from "next/server";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";
import { requireAdmin, ADMIN_EMAIL } from "@/lib/adminAuth";

/**
 * POST /api/admin/users/[userId]/ban
 * ─────────────────────────────────────────────────────────────────────────────
 * Toggle a user's `banned` flag. Only `ADMIN_EMAIL` may call this.
 *
 * Request body:
 *   { banned: boolean, reason?: string }
 *
 * Behavior:
 *   - `banned: true`  → sets banned=1, bannedReason=reason (or null)
 *   - `banned: false` → sets banned=0, bannedReason=null (clears the reason)
 *
 * Safety:
 *   - The admin CANNOT ban themselves (would lock themselves out).
 *   - If the user doesn't exist, returns 404.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // 1. Admin-only access
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: "Forbidden", reason: check.reason },
      { status: 403 }
    );
  }

  // 2. Parse path param (Next.js 16 requires awaiting `params`)
  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "Falta userId" }, { status: 400 });
  }

  // 3. Parse request body
  let body: { banned?: unknown; reason?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const banned = body.banned === true;
  // Sanitize reason: must be a string ≤500 chars, or null/undefined.
  let reason: string | null = null;
  if (typeof body.reason === "string" && body.reason.trim().length > 0) {
    reason = body.reason.trim().slice(0, 500);
  }

  // 4. DB availability check
  if (!isRawDbAvailable()) {
    return NextResponse.json(
      { error: "Base de datos no disponible" },
      { status: 503 }
    );
  }

  try {
    // 5. Look up the user
    const user = await rawDb.user.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // 6. Prevent the admin from banning themselves (would lock out the panel)
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: "No puedes suspender tu propia cuenta de administrador" },
        { status: 400 }
      );
    }

    // 7. Apply the ban / unban
    const updated = await rawDb.user.update(userId, {
      banned,
      // When unbanning, clear the reason. When banning, set the reason.
      bannedReason: banned ? reason : null,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "No se pudo actualizar el usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: updated.id,
        email: updated.email,
        banned: updated.banned,
        bannedReason: updated.bannedReason,
      },
    });
  } catch (err) {
    console.error("[/api/admin/users/[userId]/ban] Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
