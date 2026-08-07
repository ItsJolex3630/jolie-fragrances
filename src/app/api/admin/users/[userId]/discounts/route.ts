import { NextRequest, NextResponse } from "next/server";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";
import { requireAdmin } from "@/lib/adminAuth";
import { generateDiscountPayload } from "@/lib/predictionSecurity";

/**
 * /api/admin/users/[userId]/discounts
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin-only endpoints to manage a single user's discount codes.
 *
 *   GET    → list all discount codes for the user
 *   POST   → add a new discount (5% or 10%) with an HMAC-signed code
 *   DELETE → remove a specific discount by `?discountId=...`
 *
 * The discount code is generated using the same HMAC approach as
 * `predictionSecurity.ts::generateDiscountPayload`, so codes created here
 * are indistinguishable from codes won through predictions — Joel can scan
 * them with the same QR verifier.
 *
 * Code format: `EMAIL:PREDICTION_ID:TIMESTAMP:DISCOUNT_PCT:SIGNATURE`
 *   - For admin-created codes, PREDICTION_ID = "admin" (no match attached).
 *   - The signature is HMAC-SHA256(secret, rawPayload).substring(0, 16).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Default lifetime of an admin-issued discount code: 90 days. */
const DEFAULT_DISCOUNT_TTL_MS = 90 * 24 * 60 * 60 * 1000;

// ─── GET: list all discounts for the user ────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: "Forbidden", reason: check.reason },
      { status: 403 }
    );
  }

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "Falta userId" }, { status: 400 });
  }

  if (!isRawDbAvailable()) {
    return NextResponse.json({ discounts: [], dbAvailable: false });
  }

  try {
    const codes = await rawDb.discountCode.findByUserId(userId);
    const now = new Date();

    const discounts = codes.map((c) => {
      let status: "active" | "used" | "expired";
      if (c.verified) {
        status = "used";
      } else if (c.expiresAt <= now) {
        status = "expired";
      } else {
        status = "active";
      }
      return {
        id: c.id,
        code: c.code,
        discountPct: c.discountPct,
        verified: c.verified,
        verifiedAt: c.verifiedAt?.toISOString() ?? null,
        expiresAt: c.expiresAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
        status,
      };
    });

    return NextResponse.json({ discounts, total: discounts.length });
  } catch (err) {
    console.error("[/api/admin/users/[userId]/discounts GET] Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ─── POST: add a new discount to the user ────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: "Forbidden", reason: check.reason },
      { status: 403 }
    );
  }

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "Falta userId" }, { status: 400 });
  }

  // Parse body
  let body: { discountPct?: unknown; expiresAt?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Validate discountPct — must be 5 or 10 (the only percentages the
  // prediction system awards, so the catalog discount-applier supports them).
  const pctNum = Number(body.discountPct);
  if (pctNum !== 5 && pctNum !== 10) {
    return NextResponse.json(
      { error: "discountPct debe ser 5 o 10" },
      { status: 400 }
    );
  }

  // Validate optional expiresAt — must be an ISO string in the future.
  let expiresAt: Date;
  if (typeof body.expiresAt === "string" && body.expiresAt.trim().length > 0) {
    const parsed = new Date(body.expiresAt);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "expiresAt inválido (use ISO 8601)" },
        { status: 400 }
      );
    }
    if (parsed.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "expiresAt debe estar en el futuro" },
        { status: 400 }
      );
    }
    expiresAt = parsed;
  } else {
    expiresAt = new Date(Date.now() + DEFAULT_DISCOUNT_TTL_MS);
  }

  if (!isRawDbAvailable()) {
    return NextResponse.json(
      { error: "Base de datos no disponible" },
      { status: 503 }
    );
  }

  try {
    // 1. Fetch the user (need their email for the HMAC payload)
    const user = await rawDb.user.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // 2. Generate the HMAC-signed code. We use "admin" as the predictionId
    //    sentinel — the verifier splits on ":" and just needs 5 colon-separated
    //    parts; using "admin" makes these codes identifiable as admin-issued.
    const code = generateDiscountPayload(user.email, "admin", pctNum);

    // 3. Insert into the DiscountCode table.
    //    predictionId is left null (no match attached) since this is an
    //    admin-issued discount, not one won through a prediction.
    const created = await rawDb.discountCode.create({
      userId: user.id,
      predictionId: null,
      code,
      discountPct: pctNum,
      verified: false,
      verifiedAt: null,
      expiresAt,
    });

    return NextResponse.json({
      ok: true,
      discount: {
        id: created.id,
        code: created.code,
        discountPct: created.discountPct,
        expiresAt: created.expiresAt.toISOString(),
        createdAt: created.createdAt.toISOString(),
        status: "active" as const,
      },
    });
  } catch (err) {
    console.error("[/api/admin/users/[userId]/discounts POST] Error:", err);

    // Handle UNIQUE constraint violations on the `code` column (extremely
    // unlikely — the timestamp makes collisions essentially impossible, but
    // guard against it just in case).
    if (err instanceof Error && err.message.includes("UNIQUE constraint")) {
      return NextResponse.json(
        { error: "Código de descuento duplicado — intenta de nuevo" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ─── DELETE: remove a discount by ?discountId=... ────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const check = await requireAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: "Forbidden", reason: check.reason },
      { status: 403 }
    );
  }

  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "Falta userId" }, { status: 400 });
  }

  // Get discountId from query string
  const discountId = request.nextUrl.searchParams.get("discountId");
  if (!discountId) {
    return NextResponse.json(
      { error: "Falta discountId en la query" },
      { status: 400 }
    );
  }

  if (!isRawDbAvailable()) {
    return NextResponse.json(
      { error: "Base de datos no disponible" },
      { status: 503 }
    );
  }

  try {
    // 1. Verify the discount exists AND belongs to this user (so a malicious
    //    admin can't accidentally delete another user's discount by guessing
    //    the discountId — the userId path segment must match).
    const discount = await rawDb.discountCode.findById(discountId);
    if (!discount) {
      return NextResponse.json(
        { error: "Descuento no encontrado" },
        { status: 404 }
      );
    }
    if (discount.userId !== userId) {
      return NextResponse.json(
        { error: "El descuento no pertenece a este usuario" },
        { status: 403 }
      );
    }

    // 2. Delete it
    await rawDb.discountCode.deleteById(discountId);

    return NextResponse.json({ ok: true, deleted: discountId });
  } catch (err) {
    console.error("[/api/admin/users/[userId]/discounts DELETE] Error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
